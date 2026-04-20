<?php
require_once "config.php";
require_once "jwt.php";

// ================================
// ALLOW ONLY POST
// ================================
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError("Method not allowed", 405);
}

// ================================
// GET JSON DATA
// ================================
$data = json_decode(file_get_contents("php://input"));

if (!$data) {
    sendError("Invalid JSON data");
}

// ================================
// VALIDATION
// ================================
if (empty($data->email) || empty($data->password)) {
    sendError("Email and password are required");
}

// Sanitize
$email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
$password = $data->password;

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendError("Invalid email format");
}

// ================================
// DATABASE
// ================================
$database = new Database();
$db = $database->getConnection();

try {

    // Fetch user
    $query = "SELECT id, full_name, email, password, current_country, destination_country 
              FROM users 
              WHERE email = :email";

    $stmt = $db->prepare($query);
    $stmt->bindParam(":email", $email);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        sendError("Invalid email or password", 401);
    }

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verify password
    if (!password_verify($password, $user['password'])) {
        sendError("Invalid email or password", 401);
    }

    // ================================
    // GENERATE TOKEN
    // ================================
    $payload = [
        "user_id" => $user["id"],
        "email" => $user["email"],
        "full_name" => $user["full_name"],
        "iat" => time(),
        "exp" => time() + JWT_EXPIRY
    ];

    $token = JWT::encode($payload, JWT_SECRET_KEY);

    // Remove password
    unset($user["password"]);

    // ================================
    // SUCCESS RESPONSE
    // ================================
    sendSuccess("Login successful", [
        "user" => $user,
        "token" => $token
    ]);

} catch (PDOException $e) {
    sendError("Database error: " . $e->getMessage(), 500);
}
?>