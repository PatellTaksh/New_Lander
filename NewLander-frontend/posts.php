<?php
require_once 'config.php';

// Database connection
$database = new Database();
$db = $database->getConnection();

// GET - Get posts (discussions or questions)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $type = isset($_GET['type']) ? $_GET['type'] : null;
        
        $query = "SELECT p.*, u.full_name as author_name
                  FROM posts p
                  LEFT JOIN users u ON p.user_id = u.id";
        
        $params = [];
        
        if ($type && ($type === 'discussion' || $type === 'question')) {
            $query .= " WHERE p.post_type = :type";
            $params[':type'] = $type;
        }
        
        $query .= " ORDER BY p.created_at DESC LIMIT 50";
        
        $stmt = $db->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->execute();
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        sendSuccess("Posts retrieved successfully", $posts);
        
    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

// POST - Create new post (Protected)
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_once 'jwt.php';
    $decoded = JWT::verifyToken();
    
    $data = json_decode(file_get_contents("php://input"));
    
    if (empty($data->title) || empty($data->content)) {
        sendError("Title and content are required");
    }
    
    try {
        $query = "INSERT INTO posts (user_id, title, content, post_type, country) 
                  VALUES (:user_id, :title, :content, :post_type, :country)";
        
        $stmt = $db->prepare($query);
        
        $post_type = isset($data->post_type) ? $data->post_type : 'discussion';
        $country = isset($data->country) ? $data->country : null;
        
        $stmt->bindParam(":user_id", $decoded['user_id']);
        $stmt->bindParam(":title", $data->title);
        $stmt->bindParam(":content", $data->content);
        $stmt->bindParam(":post_type", $post_type);
        $stmt->bindParam(":country", $country);
        
        if ($stmt->execute()) {
            sendSuccess("Post created successfully", [
                "id" => $db->lastInsertId()
            ]);
        } else {
            sendError("Failed to create post");
        }
        
    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

else {
    sendError("Method not allowed", 405);
}
?>