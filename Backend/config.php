<?php
// ================================
// DATABASE CONFIGURATION
// ================================
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'new_lander');


// ================================
// JWT CONFIGURATION
// ================================
define('JWT_SECRET_KEY', 'your-secret-key-change-this-in-production-12345');
define('JWT_ALGORITHM', 'HS256');
define('JWT_EXPIRY', 86400); // 24 hours


// ================================
// CORS HEADERS (IMPORTANT)
// ================================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Handle OPTIONS request (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


// ================================
// DATABASE CONNECTION CLASS
// ================================
class Database {
    private $host = DB_HOST;
    private $db_name = DB_NAME;
    private $username = DB_USER;
    private $password = DB_PASS;
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host={$this->host};dbname={$this->db_name};charset=utf8",
                $this->username,
                $this->password
            );

            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        } catch(PDOException $exception) {

            sendError("Database connection failed: " . $exception->getMessage(), 500);

        }

        return $this->conn;
    }
}


// ================================
// RESPONSE FUNCTIONS
// ================================
function sendResponse($success, $message, $data = null, $statusCode = 200) {

    http_response_code($statusCode);

    $response = [
        "success" => $success,
        "message" => $message
    ];

    if ($data !== null) {
        $response["data"] = $data;
    }

    echo json_encode($response);
    exit();
}

function sendError($message, $statusCode = 400) {
    sendResponse(false, $message, null, $statusCode);
}

function sendSuccess($message, $data = null) {
    sendResponse(true, $message, $data, 200);
}