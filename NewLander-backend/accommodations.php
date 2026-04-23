<?php
require_once 'config.php';
require_once 'jwt.php';

// Database connection
$database = new Database();
$db = $database->getConnection();

// ============================================================
// GET — List all accommodations or single by ID
// ============================================================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Single accommodation
        if (isset($_GET['id'])) {
            $accommodation_id = intval($_GET['id']);

            $query = "SELECT a.*, u.full_name as owner_name, u.email as owner_email, u.phone as owner_phone
                      FROM accommodations a
                      LEFT JOIN users u ON a.user_id = u.id
                      WHERE a.id = :id AND a.is_available = 1";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":id", $accommodation_id);
            $stmt->execute();

            if ($stmt->rowCount() === 0) {
                sendError("Accommodation not found", 404);
            }

            $accommodation = $stmt->fetch(PDO::FETCH_ASSOC);

            // Parse amenities JSON
            if (!empty($accommodation['amenities'])) {
                $accommodation['amenities'] = json_decode($accommodation['amenities']);
            }

            // Check if logged-in user has favorited this
            $accommodation['is_favorited'] = false;
            $token = JWT::getBearerToken();
            if ($token) {
                $decoded = JWT::decode($token, JWT_SECRET_KEY);
                if ($decoded) {
                    $favQuery = "SELECT id FROM favorites WHERE user_id = :uid AND item_type = 'accommodation' AND item_id = :iid";
                    $favStmt = $db->prepare($favQuery);
                    $favStmt->bindParam(":uid", $decoded['user_id']);
                    $favStmt->bindParam(":iid", $accommodation_id);
                    $favStmt->execute();
                    $accommodation['is_favorited'] = $favStmt->rowCount() > 0;
                }
            }

            sendSuccess("Accommodation retrieved successfully", $accommodation);
        }

        // All accommodations with filters
        else {
            $country   = isset($_GET['country'])   ? $_GET['country']            : null;
            $type      = isset($_GET['type'])      ? $_GET['type']               : null;
            $city      = isset($_GET['city'])      ? $_GET['city']               : null;
            $max_price = isset($_GET['max_price']) ? floatval($_GET['max_price']) : null;

            $query = "SELECT a.id, a.title, a.description, a.country, a.city, a.location,
                             a.type, a.price, a.bedrooms, a.bathrooms, a.image_url, a.is_available,
                             a.created_at, u.full_name as owner_name
                      FROM accommodations a
                      LEFT JOIN users u ON a.user_id = u.id
                      WHERE a.is_available = 1";

            $params = [];

            if ($country && $country !== 'all') {
                $query .= " AND a.country = :country";
                $params[':country'] = $country;
            }
            if ($type && $type !== 'all') {
                $query .= " AND a.type = :type";
                $params[':type'] = $type;
            }
            if ($city) {
                $query .= " AND a.city LIKE :city";
                $params[':city'] = '%' . $city . '%';
            }
            if ($max_price) {
                $query .= " AND a.price <= :max_price";
                $params[':max_price'] = $max_price;
            }

            $query .= " ORDER BY a.created_at DESC";

            $stmt = $db->prepare($query);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->execute();
            $accommodations = $stmt->fetchAll(PDO::FETCH_ASSOC);

            sendSuccess("Accommodations retrieved successfully", $accommodations);
        }

    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

// ============================================================
// POST — Create new accommodation (protected)
// ============================================================
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $decoded = JWT::verifyToken();

    $data = json_decode(file_get_contents("php://input"));

    if (
        empty($data->title) || empty($data->description) || empty($data->country) ||
        empty($data->city)  || empty($data->location)    || empty($data->type)    ||
        empty($data->price) || !isset($data->bedrooms)   || !isset($data->bathrooms)
    ) {
        sendError("All required fields must be provided");
    }

    // Validate type
    $valid_types = ['apartment', 'hostel', 'shared', 'pg'];
    if (!in_array($data->type, $valid_types)) {
        sendError("Invalid accommodation type");
    }

    try {
        $query = "INSERT INTO accommodations
                    (user_id, title, description, country, city, location, type,
                     price, bedrooms, bathrooms, amenities, image_url)
                  VALUES
                    (:user_id, :title, :description, :country, :city, :location, :type,
                     :price, :bedrooms, :bathrooms, :amenities, :image_url)";

        $stmt = $db->prepare($query);

        $amenities = isset($data->amenities) ? json_encode($data->amenities) : null;
        $image_url = isset($data->image_url) ? $data->image_url              : null;
        $price     = floatval($data->price);
        $bedrooms  = intval($data->bedrooms);
        $bathrooms = intval($data->bathrooms);

        $stmt->bindParam(":user_id",     $decoded['user_id']);
        $stmt->bindParam(":title",       $data->title);
        $stmt->bindParam(":description", $data->description);
        $stmt->bindParam(":country",     $data->country);
        $stmt->bindParam(":city",        $data->city);
        $stmt->bindParam(":location",    $data->location);
        $stmt->bindParam(":type",        $data->type);
        $stmt->bindParam(":price",       $price);
        $stmt->bindParam(":bedrooms",    $bedrooms);
        $stmt->bindParam(":bathrooms",   $bathrooms);
        $stmt->bindParam(":amenities",   $amenities);
        $stmt->bindParam(":image_url",   $image_url);

        if ($stmt->execute()) {
            sendSuccess("Accommodation listed successfully", ["id" => $db->lastInsertId()]);
        } else {
            sendError("Failed to create accommodation");
        }

    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

// ============================================================
// DELETE — Remove own accommodation (protected)
// ============================================================
else if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $decoded = JWT::verifyToken();
    $acc_id  = isset($_GET['id']) ? intval($_GET['id']) : 0;

    if (!$acc_id) {
        sendError("Accommodation ID is required");
    }

    try {
        $query = "DELETE FROM accommodations WHERE id = :id AND user_id = :user_id";
        $stmt  = $db->prepare($query);
        $stmt->bindParam(":id",      $acc_id);
        $stmt->bindParam(":user_id", $decoded['user_id']);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            sendSuccess("Accommodation removed successfully");
        } else {
            sendError("Accommodation not found or not authorized", 404);
        }
    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

else {
    sendError("Method not allowed", 405);
}
?>
