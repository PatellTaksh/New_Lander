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
// GET JSON DATA SAFELY
// ================================
$data = json_decode(file_get_contents("php://input"));

if (!$data) {
    sendError("Invalid JSON data");
}

// ================================
// VALIDATION
// ================================
if (
    empty($data->full_name) ||
    empty($data->email) ||
    empty($data->password) ||
    empty($data->current_country) ||
    empty($data->destination_country)
) {
    sendError("All fields are required");
}

// Email validation
if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
    sendError("Invalid email format");
}

// Password validation
if (strlen($data->password) < 6) {
    sendError("Password must be at least 6 characters long");
}

// ================================
// SANITIZE DATA
// ================================
$full_name = htmlspecialchars(strip_tags($data->full_name));
$email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
$password = $data->password;
$current_country = htmlspecialchars(strip_tags($data->current_country));
$destination_country = htmlspecialchars(strip_tags($data->destination_country));

// ================================
// DATABASE
// ================================
$database = new Database();
$db = $database->getConnection();

try {

    // Check if email exists
    $query = "SELECT id FROM users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":email", $email);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        sendError("Email already exists. Please login instead.", 409);
    }

    // Hash password
    $password_hash = password_hash($password, PASSWORD_BCRYPT);

    // Insert user (REMOVED verification_token if column not present)
    $query = "INSERT INTO users 
        (full_name, email, password, current_country, destination_country) 
        VALUES 
        (:full_name, :email, :password, :current_country, :destination_country)";

    $stmt = $db->prepare($query);
    $stmt->bindParam(":full_name", $full_name);
    $stmt->bindParam(":email", $email);
    $stmt->bindParam(":password", $password_hash);
    $stmt->bindParam(":current_country", $current_country);
    $stmt->bindParam(":destination_country", $destination_country);

    if ($stmt->execute()) {

        $user_id = $db->lastInsertId();

        // Create JWT
        $payload = [
            "user_id" => $user_id,
            "email" => $email,
            "full_name" => $full_name,
            "iat" => time(),
            "exp" => time() + JWT_EXPIRY
        ];

        $token = JWT::encode($payload, JWT_SECRET_KEY);

        sendSuccess("Registration successful", [
            "user" => [
                "id" => $user_id,
                "full_name" => $full_name,
                "email" => $email,
                "current_country" => $current_country,
                "destination_country" => $destination_country
            ],
            "token" => $token
        ]);

    } else {
        sendError("Registration failed. Try again.");
    }

} catch (PDOException $e) {
    sendError("Database error: " . $e->getMessage(), 500);
}
?>