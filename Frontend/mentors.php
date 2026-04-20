<?php
require_once 'config.php';

// Database connection
$database = new Database();
$db = $database->getConnection();

// GET - Get all mentors
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $query = "SELECT m.*, u.full_name as name, u.current_country, u.destination_country
                  FROM mentors m
                  JOIN users u ON m.user_id = u.id
                  WHERE m.availability != 'unavailable'
                  ORDER BY m.rating DESC, m.total_reviews DESC
                  LIMIT 50";
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $mentors = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format the data
        $formattedMentors = array_map(function($mentor) {
            return [
                'id' => $mentor['id'],
                'name' => $mentor['name'],
                'expertise' => $mentor['expertise'],
                'experience' => $mentor['experience_years'] . ' years helping students',
                'route' => $mentor['current_country'] . ' → ' . $mentor['destination_country'],
                'rating' => $mentor['rating'],
                'total_reviews' => $mentor['total_reviews'],
                'availability' => $mentor['availability']
            ];
        }, $mentors);
        
        sendSuccess("Mentors retrieved successfully", $formattedMentors);
        
    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

// POST - Register as mentor (Protected)
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_once 'jwt.php';
    $decoded = JWT::verifyToken();
    
    $data = json_decode(file_get_contents("php://input"));
    
    if (empty($data->expertise) || empty($data->experience_years) || empty($data->bio)) {
        sendError("Expertise, experience years, and bio are required");
    }
    
    try {
        // Check if already a mentor
        $checkQuery = "SELECT id FROM mentors WHERE user_id = :user_id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(":user_id", $decoded['user_id']);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() > 0) {
            sendError("You are already registered as a mentor", 400);
        }
        
        $query = "INSERT INTO mentors (user_id, expertise, experience_years, bio) 
                  VALUES (:user_id, :expertise, :experience_years, :bio)";
        
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(":user_id", $decoded['user_id']);
        $stmt->bindParam(":expertise", $data->expertise);
        $stmt->bindParam(":experience_years", $data->experience_years);
        $stmt->bindParam(":bio", $data->bio);
        
        if ($stmt->execute()) {
            sendSuccess("Successfully registered as mentor", [
                "id" => $db->lastInsertId()
            ]);
        } else {
            sendError("Failed to register as mentor");
        }
        
    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

else {
    sendError("Method not allowed", 405);
}
?>