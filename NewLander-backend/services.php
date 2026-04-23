<?php
require_once 'config.php';

// Handle CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db = new Database();
$pdo = $db->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->prepare("SELECT s.*, u.full_name as provider_name 
                               FROM services s 
                               JOIN users u ON s.provider_id = u.id 
                               WHERE s.is_available = 1 
                               ORDER BY s.created_at DESC");
        $stmt->execute();
        $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        sendResponse(true, "Services retrieved", $services);
    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
} else {
    sendError("Method not allowed", 405);
}
?>
