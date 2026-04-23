<?php
require_once 'config.php';
require_once 'jwt.php';

// All booking routes require authentication
$decoded = JWT::verifyToken();

$database = new Database();
$db = $database->getConnection();

// ============================================================
// POST — Create an accommodation booking
// ============================================================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (
        empty($data->accommodation_id) || empty($data->move_in_date) ||
        empty($data->duration_months)  || empty($data->payment_method)
    ) {
        sendError("accommodation_id, move_in_date, duration_months, and payment_method are required");
    }

    $valid_payments = ['credit_card', 'debit_card', 'paypal', 'bank_transfer'];
    if (!in_array($data->payment_method, $valid_payments)) {
        sendError("Invalid payment method");
    }

    $duration = intval($data->duration_months);
    if ($duration < 1 || $duration > 24) {
        sendError("Duration must be between 1 and 24 months");
    }

    // Validate move-in date is in the future
    if (strtotime($data->move_in_date) < strtotime('today')) {
        sendError("Move-in date must be today or in the future");
    }

    try {
        // Verify accommodation exists and is available
        $checkQ = "SELECT id, title, price, is_available FROM accommodations WHERE id = :id";
        $checkS = $db->prepare($checkQ);
        $checkS->bindParam(":id", $data->accommodation_id);
        $checkS->execute();

        if ($checkS->rowCount() === 0) {
            sendError("Accommodation not found", 404);
        }

        $acc = $checkS->fetch(PDO::FETCH_ASSOC);
        if (!$acc['is_available']) {
            sendError("This accommodation is no longer available", 400);
        }

        $monthly_rent = floatval($acc['price']);
        $total_amount = $monthly_rent * $duration;
        $special_requests = isset($data->special_requests) ? htmlspecialchars(strip_tags($data->special_requests)) : null;

        $query = "INSERT INTO accommodation_bookings
                    (accommodation_id, user_id, move_in_date, duration_months,
                     monthly_rent, total_amount, payment_method, special_requests, status, payment_status)
                  VALUES
                    (:accommodation_id, :user_id, :move_in_date, :duration_months,
                     :monthly_rent, :total_amount, :payment_method, :special_requests, 'pending', 'pending')";

        $stmt = $db->prepare($query);
        $stmt->bindParam(":accommodation_id", $data->accommodation_id);
        $stmt->bindParam(":user_id",          $decoded['user_id']);
        $stmt->bindParam(":move_in_date",     $data->move_in_date);
        $stmt->bindParam(":duration_months",  $duration);
        $stmt->bindParam(":monthly_rent",     $monthly_rent);
        $stmt->bindParam(":total_amount",     $total_amount);
        $stmt->bindParam(":payment_method",   $data->payment_method);
        $stmt->bindParam(":special_requests", $special_requests);

        if ($stmt->execute()) {
            sendSuccess("Booking confirmed successfully!", [
                "booking_id"         => intval($db->lastInsertId()),
                "accommodation_title"=> $acc['title'],
                "monthly_rent"       => $monthly_rent,
                "duration_months"    => $duration,
                "total_amount"       => $total_amount,
                "move_in_date"       => $data->move_in_date,
                "payment_method"     => $data->payment_method,
                "status"             => "pending"
            ]);
        } else {
            sendError("Failed to create booking");
        }

    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

// ============================================================
// GET — Retrieve user's booking history
// ============================================================
else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $query = "SELECT ab.id, ab.move_in_date, ab.duration_months, ab.monthly_rent,
                         ab.total_amount, ab.payment_method, ab.payment_status,
                         ab.status, ab.special_requests, ab.created_at,
                         a.title, a.location, a.city, a.country, a.type, a.image_url
                  FROM accommodation_bookings ab
                  JOIN accommodations a ON ab.accommodation_id = a.id
                  WHERE ab.user_id = :user_id
                  ORDER BY ab.created_at DESC";

        $stmt = $db->prepare($query);
        $stmt->bindParam(":user_id", $decoded['user_id']);
        $stmt->execute();

        sendSuccess("Bookings retrieved successfully", $stmt->fetchAll(PDO::FETCH_ASSOC));

    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

// ============================================================
// DELETE — Cancel a pending booking
// ============================================================
else if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $booking_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

    if (!$booking_id) {
        sendError("Booking ID is required");
    }

    try {
        // Only allow cancelling own pending bookings
        $updateQ = "UPDATE accommodation_bookings
                    SET status = 'cancelled'
                    WHERE id = :id AND user_id = :user_id AND status = 'pending'";
        $updateS = $db->prepare($updateQ);
        $updateS->bindParam(":id",      $booking_id);
        $updateS->bindParam(":user_id", $decoded['user_id']);
        $updateS->execute();

        if ($updateS->rowCount() > 0) {
            sendSuccess("Booking cancelled successfully");
        } else {
            sendError("Booking not found, not authorized, or cannot be cancelled", 404);
        }
    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

else {
    sendError("Method not allowed", 405);
}
?>
