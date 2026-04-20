<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

require_once "config.php";
require_once "jwt.php";

// Handle OPTIONS (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only GET allowed
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError("Method not allowed", 405);
}

// 🔐 Verify JWT Token
$userData = JWT::verifyToken();

// Database connection
$database = new Database();
$db = $database->getConnection();

try {

    // Get user from DB
    $query = "SELECT id, full_name, email, current_country, destination_country
              FROM users
              WHERE id = :id";

    $stmt = $db->prepare($query);
    $stmt->bindParam(":id", $userData['user_id']);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        sendError("User not found", 404);
    }

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    sendSuccess("Profile fetched successfully", $user);

} catch (PDOException $e) {
    sendError("Database error: " . $e->getMessage(), 500);
}
?>