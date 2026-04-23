<?php
require_once 'config.php';
require_once 'jwt.php';

// All routes require authentication
$decoded = JWT::verifyToken();

$database = new Database();
$db = $database->getConnection();

// ============================================================
// POST — Register for an event
// ============================================================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->event_id)) {
        sendError("event_id is required");
    }

    $event_id = intval($data->event_id);
    $user_id  = $decoded['user_id'];

    try {
        // Verify event exists and is upcoming
        $checkQuery = "SELECT id, title, max_attendees, attendees_count, event_date FROM events WHERE id = :event_id";
        $checkStmt  = $db->prepare($checkQuery);
        $checkStmt->bindParam(":event_id", $event_id);
        $checkStmt->execute();

        if ($checkStmt->rowCount() === 0) {
            sendError("Event not found", 404);
        }

        $event = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if (strtotime($event['event_date']) < strtotime('today')) {
            sendError("Cannot register for past events", 400);
        }

        // Check duplicate registration
        $dupQuery = "SELECT id FROM event_registrations WHERE event_id = :eid AND user_id = :uid";
        $dupStmt  = $db->prepare($dupQuery);
        $dupStmt->bindParam(":eid", $event_id);
        $dupStmt->bindParam(":uid", $user_id);
        $dupStmt->execute();

        if ($dupStmt->rowCount() > 0) {
            sendError("You are already registered for this event", 400);
        }

        // Check capacity
        if ($event['max_attendees'] && $event['attendees_count'] >= $event['max_attendees']) {
            sendError("This event is full", 400);
        }

        // Begin transaction
        $db->beginTransaction();

        $insertQuery = "INSERT INTO event_registrations (event_id, user_id) VALUES (:eid, :uid)";
        $insertStmt  = $db->prepare($insertQuery);
        $insertStmt->bindParam(":eid", $event_id);
        $insertStmt->bindParam(":uid", $user_id);

        if (!$insertStmt->execute()) {
            $db->rollBack();
            sendError("Failed to register for event");
        }

        $updateQuery = "UPDATE events SET attendees_count = attendees_count + 1 WHERE id = :event_id";
        $updateStmt  = $db->prepare($updateQuery);
        $updateStmt->bindParam(":event_id", $event_id);

        if (!$updateStmt->execute()) {
            $db->rollBack();
            sendError("Failed to update attendees count");
        }

        $db->commit();

        sendSuccess("Successfully registered for the event!", [
            "registration_id" => $db->lastInsertId(),
            "event_title"     => $event['title']
        ]);

    } catch (PDOException $e) {
        if ($db->inTransaction()) $db->rollBack();
        if (strpos($e->getMessage(), 'Duplicate') !== false) {
            sendError("You are already registered for this event", 400);
        }
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

// ============================================================
// DELETE — Cancel registration
// ============================================================
else if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $event_id = isset($_GET['event_id']) ? intval($_GET['event_id']) : 0;
    $user_id  = $decoded['user_id'];

    if (!$event_id) {
        sendError("event_id is required");
    }

    try {
        // Confirm registration exists
        $checkQuery = "SELECT id FROM event_registrations WHERE event_id = :eid AND user_id = :uid";
        $checkStmt  = $db->prepare($checkQuery);
        $checkStmt->bindParam(":eid", $event_id);
        $checkStmt->bindParam(":uid", $user_id);
        $checkStmt->execute();

        if ($checkStmt->rowCount() === 0) {
            sendError("Registration not found", 404);
        }

        $db->beginTransaction();

        $deleteQuery = "DELETE FROM event_registrations WHERE event_id = :eid AND user_id = :uid";
        $deleteStmt  = $db->prepare($deleteQuery);
        $deleteStmt->bindParam(":eid", $event_id);
        $deleteStmt->bindParam(":uid", $user_id);

        if (!$deleteStmt->execute()) {
            $db->rollBack();
            sendError("Failed to cancel registration");
        }

        $updateQuery = "UPDATE events SET attendees_count = GREATEST(attendees_count - 1, 0) WHERE id = :event_id";
        $updateStmt  = $db->prepare($updateQuery);
        $updateStmt->bindParam(":event_id", $event_id);

        if (!$updateStmt->execute()) {
            $db->rollBack();
            sendError("Failed to update attendees count");
        }

        $db->commit();
        sendSuccess("Registration cancelled successfully");

    } catch (PDOException $e) {
        if ($db->inTransaction()) $db->rollBack();
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

// ============================================================
// GET — List user's registered events
// ============================================================
else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $query = "SELECT r.id as registration_id, r.registered_at,
                         e.id, e.title, e.event_date, e.event_time,
                         e.location, e.city, e.country, e.category, e.attendees_count
                  FROM event_registrations r
                  JOIN events e ON r.event_id = e.id
                  WHERE r.user_id = :user_id
                  ORDER BY e.event_date ASC";

        $stmt = $db->prepare($query);
        $stmt->bindParam(":user_id", $decoded['user_id']);
        $stmt->execute();
        $registrations = $stmt->fetchAll(PDO::FETCH_ASSOC);

        sendSuccess("Registrations retrieved successfully", $registrations);

    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

else {
    sendError("Method not allowed", 405);
}
?>
