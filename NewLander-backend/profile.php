<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, PUT, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once "config.php";
require_once "jwt.php";

// ============================================================
// GET — Fetch user profile
// ============================================================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userData = JWT::verifyToken();

    $database = new Database();
    $db = $database->getConnection();

    try {
        $query = "SELECT id, full_name, email, current_country, destination_country,
                         bio, phone, university, created_at
                  FROM users
                  WHERE id = :id";

        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $userData['user_id']);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            sendError("User not found", 404);
        }

        sendSuccess("Profile fetched successfully", $stmt->fetch(PDO::FETCH_ASSOC));

    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

// ============================================================
// PUT — Update user profile
// ============================================================
else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $userData = JWT::verifyToken();
    $data = json_decode(file_get_contents("php://input"));

    if (!$data) {
        sendError("Invalid JSON data");
    }

    $database = new Database();
    $db = $database->getConnection();

    try {
        $updates = [];
        $params  = [':id' => $userData['user_id']];

        if (!empty($data->full_name)) {
            $updates[] = "full_name = :full_name";
            $params[':full_name'] = htmlspecialchars(strip_tags(trim($data->full_name)));
        }
        if (!empty($data->current_country)) {
            $updates[] = "current_country = :current_country";
            $params[':current_country'] = htmlspecialchars(strip_tags($data->current_country));
        }
        if (!empty($data->destination_country)) {
            $updates[] = "destination_country = :destination_country";
            $params[':destination_country'] = htmlspecialchars(strip_tags($data->destination_country));
        }
        if (isset($data->bio)) {
            $updates[] = "bio = :bio";
            $params[':bio'] = htmlspecialchars(strip_tags(trim($data->bio)));
        }
        if (isset($data->phone)) {
            $updates[] = "phone = :phone";
            $params[':phone'] = htmlspecialchars(strip_tags(trim($data->phone)));
        }
        if (isset($data->university)) {
            $updates[] = "university = :university";
            $params[':university'] = htmlspecialchars(strip_tags(trim($data->university)));
        }

        if (empty($updates)) {
            sendError("No valid fields to update");
        }

        $query = "UPDATE users SET " . implode(", ", $updates) . " WHERE id = :id";
        $stmt  = $db->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }

        if ($stmt->execute()) {
            // Return fresh profile data
            $fetchQ = "SELECT id, full_name, email, current_country, destination_country,
                              bio, phone, university, created_at
                       FROM users WHERE id = :id";
            $fetchS = $db->prepare($fetchQ);
            $fetchS->bindParam(":id", $userData['user_id']);
            $fetchS->execute();
            $user = $fetchS->fetch(PDO::FETCH_ASSOC);

            sendSuccess("Profile updated successfully", $user);
        } else {
            sendError("Failed to update profile");
        }

    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

else {
    sendError("Method not allowed", 405);
}
?>