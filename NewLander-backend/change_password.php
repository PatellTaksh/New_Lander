<?php
require_once "config.php";
require_once "jwt.php";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError("Method not allowed", 405);
}

$userData = JWT::verifyToken();
$data     = json_decode(file_get_contents("php://input"));

if (empty($data->current_password) || empty($data->new_password) || empty($data->confirm_password)) {
    sendError("current_password, new_password, and confirm_password are required");
}

if (strlen($data->new_password) < 6) {
    sendError("New password must be at least 6 characters");
}

if ($data->new_password !== $data->confirm_password) {
    sendError("New password and confirmation do not match");
}

$database = new Database();
$db = $database->getConnection();

try {
    // Fetch current hashed password
    $fetchQ = "SELECT password FROM users WHERE id = :id";
    $fetchS = $db->prepare($fetchQ);
    $fetchS->bindParam(":id", $userData['user_id']);
    $fetchS->execute();

    if ($fetchS->rowCount() === 0) {
        sendError("User not found", 404);
    }

    $user = $fetchS->fetch(PDO::FETCH_ASSOC);

    if (!password_verify($data->current_password, $user['password'])) {
        sendError("Current password is incorrect", 401);
    }

    $new_hash = password_hash($data->new_password, PASSWORD_BCRYPT);

    $updateQ = "UPDATE users SET password = :password WHERE id = :id";
    $updateS = $db->prepare($updateQ);
    $updateS->bindParam(":password", $new_hash);
    $updateS->bindParam(":id",       $userData['user_id']);

    if ($updateS->execute()) {
        sendSuccess("Password changed successfully");
    } else {
        sendError("Failed to update password");
    }

} catch (PDOException $e) {
    sendError("Database error: " . $e->getMessage(), 500);
}
?>
