<?php
require_once 'config.php';
require_once 'jwt.php';

// Verify token for all requests
$decoded = JWT::verifyToken();

// Database connection
$database = new Database();
$db = $database->getConnection();

// POST - Register for event
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    // Validate required fields
    if (empty($data->event_id)) {
        sendError("Event ID is required");
    }
    
    try {
        // Check if event exists
        $checkQuery = "SELECT id, title, max_attendees, attendees_count, event_date 
                       FROM events WHERE id = :event_id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(":event_id", $data->event_id);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() === 0) {
            sendError("Event not found", 404);
        }
        
        $event = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        // Check if event is in the past
        if (strtotime($event['event_date']) < strtotime('today')) {
            sendError("Cannot register for past events", 400);
        }
        
        // Check if already registered
        $regCheckQuery = "SELECT id FROM event_registrations 
                          WHERE event_id = :event_id AND user_id = :user_id";
        $regCheckStmt = $db->prepare($regCheckQuery);
        $regCheckStmt->bindParam(":event_id", $data->event_id);
        $regCheckStmt->bindParam(":user_id", $decoded['user_id']);
        $regCheckStmt->execute();
        
        if ($regCheckStmt->rowCount() > 0) {
            sendError("You are already registered for this event", 400);
        }
        
        // Check if event is full
        if ($event['max_attendees'] && $event['attendees_count'] >= $event['max_attendees']) {
            sendError("This event is full", 400);
        }
        
        // Start transaction
        $db->beginTransaction();
        
        // Insert registration
        $query = "INSERT INTO event_registrations (event_id, user_id) 
                  VALUES (:event_id, :user_id)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":event_id", $data->event_id);
        $stmt->bindParam(":user_id", $decoded['user_id']);
        
        if (!$stmt->execute()) {
            $db->rollBack();
            sendError("Failed to register for event");
        }
        
        // Update attendees count
        $updateQuery = "UPDATE events SET attendees_count = attendees_count + 1 
                        WHERE id = :event_id";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(":event_id", $data->event_id);
        
        if (!$updateStmt->execute()) {
            $db->rollBack();
            sendError("Failed to update attendees count");
        }
        
        // Commit transaction
        $db->commit();
        
        sendSuccess("Successfully registered for event! Confirmation email will be sent shortly.", [
            "registration_id" => $db->lastInsertId(),
            "event_title" => $event['title']
        ]);
        
    } catch (PDOException $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

// DELETE - Cancel registration
else if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $event_id = isset($_GET['event_id']) ? intval($_GET['event_id']) : 0;
    
    if (!$event_id) {
        sendError("Event ID is required");
    }
    
    try {
        // Check if registered
        $checkQuery = "SELECT id FROM event_registrations 
                       WHERE event_id = :event_id AND user_id = :user_id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(":event_id", $event_id);
        $checkStmt->bindParam(":user_id", $decoded['user_id']);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() === 0) {
            sendError("Registration not found", 404);
        }
        
        // Start transaction
        $db->beginTransaction();
        
        // Delete registration
        $deleteQuery = "DELETE FROM event_registrations 
                        WHERE event_id = :event_id AND user_id = :user_id";
        $deleteStmt = $db->prepare($deleteQuery);
        $deleteStmt->bindParam(":event_id", $event_id);
        $deleteStmt->bindParam(":user_id", $decoded['user_id']);
        
        if (!$deleteStmt->execute()) {
            $db->rollBack();
            sendError("Failed to cancel registration");
        }
        
        // Update attendees count
        $updateQuery = "UPDATE events SET attendees_count = attendees_count - 1 
                        WHERE id = :event_id AND attendees_count > 0";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(":event_id", $event_id);
        
        if (!$updateStmt->execute()) {
            $db->rollBack();
            sendError("Failed to update attendees count");
        }
        
        // Commit transaction
        $db->commit();
        
        sendSuccess("Registration cancelled successfully");
        
    } catch (PDOException $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

// GET - Get user's event registrations
else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $query = "SELECT r.*, e.title, e.event_date, e.event_time, e.location, 
                  e.city, e.country, e.category
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