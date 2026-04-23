<?php
require_once 'config.php';
require_once 'jwt.php';

$database = new Database();
$db = $database->getConnection();

// ============================================================
// GET — List upcoming events or single event by ID
// ============================================================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Single event
        if (isset($_GET['id'])) {
            $event_id = intval($_GET['id']);

            $query = "SELECT e.*, u.full_name as organizer_name, u.email as organizer_email
                      FROM events e
                      LEFT JOIN users u ON e.user_id = u.id
                      WHERE e.id = :id";

            $stmt = $db->prepare($query);
            $stmt->bindParam(":id", $event_id);
            $stmt->execute();

            if ($stmt->rowCount() === 0) {
                sendError("Event not found", 404);
            }

            $event = $stmt->fetch(PDO::FETCH_ASSOC);

            // Check if the requesting user is registered (via JWT or query param)
            $event['is_registered'] = false;
            $token = JWT::getBearerToken();
            if ($token) {
                $decoded = JWT::decode($token, JWT_SECRET_KEY);
                if ($decoded) {
                    $regQ = "SELECT id FROM event_registrations WHERE event_id = :eid AND user_id = :uid";
                    $regS = $db->prepare($regQ);
                    $regS->bindParam(":eid", $event_id);
                    $regS->bindParam(":uid", $decoded['user_id']);
                    $regS->execute();
                    $event['is_registered'] = $regS->rowCount() > 0;
                }
            } elseif (isset($_GET['user_id'])) {
                // Fallback: unauthenticated check (used by frontend before token approach)
                $uid = intval($_GET['user_id']);
                $regQ = "SELECT id FROM event_registrations WHERE event_id = :eid AND user_id = :uid";
                $regS = $db->prepare($regQ);
                $regS->bindParam(":eid", $event_id);
                $regS->bindParam(":uid", $uid);
                $regS->execute();
                $event['is_registered'] = $regS->rowCount() > 0;
            }

            sendSuccess("Event retrieved successfully", $event);
        }

        // All upcoming events with optional filters
        else {
            $country  = isset($_GET['country'])  ? $_GET['country']  : null;
            $category = isset($_GET['category']) ? $_GET['category'] : null;

            $query = "SELECT e.*, u.full_name as organizer_name
                      FROM events e
                      LEFT JOIN users u ON e.user_id = u.id
                      WHERE e.event_date >= CURDATE()";

            $params = [];

            if ($country && $country !== 'all') {
                $query .= " AND e.country = :country";
                $params[':country'] = $country;
            }
            if ($category && $category !== 'all') {
                $query .= " AND e.category = :category";
                $params[':category'] = $category;
            }

            $query .= " ORDER BY e.event_date ASC";

            $stmt = $db->prepare($query);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->execute();
            $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

            sendSuccess("Events retrieved successfully", $events);
        }

    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

// ============================================================
// POST — Create event (protected)
// ============================================================
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $decoded = JWT::verifyToken();
    $data    = json_decode(file_get_contents("php://input"));

    if (
        empty($data->title) || empty($data->description) || empty($data->event_date) ||
        empty($data->event_time) || empty($data->location) || empty($data->city) ||
        empty($data->country) || empty($data->category)
    ) {
        sendError("All required fields must be provided");
    }

    $valid_categories = ['networking', 'cultural', 'orientation', 'workshop'];
    if (!in_array($data->category, $valid_categories)) {
        sendError("Invalid category");
    }

    try {
        $query = "INSERT INTO events
                    (user_id, title, description, event_date, event_time,
                     location, city, country, category, max_attendees)
                  VALUES
                    (:user_id, :title, :description, :event_date, :event_time,
                     :location, :city, :country, :category, :max_attendees)";

        $stmt = $db->prepare($query);
        $max_attendees = isset($data->max_attendees) ? intval($data->max_attendees) : null;

        $stmt->bindParam(":user_id",       $decoded['user_id']);
        $stmt->bindParam(":title",         $data->title);
        $stmt->bindParam(":description",   $data->description);
        $stmt->bindParam(":event_date",    $data->event_date);
        $stmt->bindParam(":event_time",    $data->event_time);
        $stmt->bindParam(":location",      $data->location);
        $stmt->bindParam(":city",          $data->city);
        $stmt->bindParam(":country",       $data->country);
        $stmt->bindParam(":category",      $data->category);
        $stmt->bindParam(":max_attendees", $max_attendees);

        if ($stmt->execute()) {
            sendSuccess("Event created successfully", ["id" => $db->lastInsertId()]);
        } else {
            sendError("Failed to create event");
        }

    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

// ============================================================
// DELETE — Remove own event (protected)
// ============================================================
else if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $decoded  = JWT::verifyToken();
    $event_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

    if (!$event_id) {
        sendError("Event ID is required");
    }

    try {
        $query = "DELETE FROM events WHERE id = :id AND user_id = :user_id";
        $stmt  = $db->prepare($query);
        $stmt->bindParam(":id",      $event_id);
        $stmt->bindParam(":user_id", $decoded['user_id']);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            sendSuccess("Event deleted successfully");
        } else {
            sendError("Event not found or not authorized", 404);
        }
    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

else {
    sendError("Method not allowed", 405);
}
?>
