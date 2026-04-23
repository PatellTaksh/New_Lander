<?php
require_once 'config.php';
require_once 'jwt.php';

// Verify JWT token
$decoded = JWT::verifyToken();

// Database connection
$database = new Database();
$db = $database->getConnection();

// GET - Get user profile
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $query = "SELECT id, full_name, email, current_country, destination_country, 
                  profile_picture, bio, phone, university, created_at, is_verified
                  FROM users 
                  WHERE id = :user_id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":user_id", $decoded['user_id']);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            sendError("User not found", 404);
        }

        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        sendSuccess("Profile retrieved successfully", $user);

    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

// PUT - Update user profile
else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents("php://input"));

    try {
        $updateFields = [];
        $params = [':user_id' => $decoded['user_id']];

        // Build dynamic update query based on provided fields
        if (!empty($data->full_name)) {
            $updateFields[] = "full_name = :full_name";
            $params[':full_name'] = htmlspecialchars(strip_tags($data->full_name));
        }

        if (!empty($data->phone)) {
            $updateFields[] = "phone = :phone";
            $params[':phone'] = htmlspecialchars(strip_tags($data->phone));
        }

        if (!empty($data->bio)) {
            $updateFields[] = "bio = :bio";
            $params[':bio'] = htmlspecialchars(strip_tags($data->bio));
        }

        if (!empty($data->university)) {
            $updateFields[] = "university = :university";
            $params[':university'] = htmlspecialchars(strip_tags($data->university));
        }

        if (!empty($data->current_country)) {
            $updateFields[] = "current_country = :current_country";
            $params[':current_country'] = htmlspecialchars(strip_tags($data->current_country));
        }

        if (!empty($data->destination_country)) {
            $updateFields[] = "destination_country = :destination_country";
            $params[':destination_country'] = htmlspecialchars(strip_tags($data->destination_country));
        }

        if (empty($updateFields)) {
            sendError("No fields to update");
        }

        $query = "UPDATE users SET " . implode(", ", $updateFields) . " WHERE id = :user_id";
        $stmt = $db->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }

        if ($stmt->execute()) {
            sendSuccess("Profile updated successfully");
        } else {
            sendError("Failed to update profile");
        }

    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

// DELETE - Delete user account
else if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        $query = "DELETE FROM users WHERE id = :user_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":user_id", $decoded['user_id']);

        if ($stmt->execute()) {
            sendSuccess("Account deleted successfully");
        } else {
            sendError("Failed to delete account");
        }

    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

else {
    sendError("Method not allowed", 405);
}
?>