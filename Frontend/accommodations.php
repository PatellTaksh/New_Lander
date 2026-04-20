<?php
require_once 'config.php';
require_once 'jwt.php';

// Database connection
$database = new Database();
$db = $database->getConnection();

// GET - Get all accommodations or single accommodation
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Get single accommodation by ID
        if (isset($_GET['id'])) {
            $accommodation_id = intval($_GET['id']);
            
            $query = "SELECT a.*, u.full_name as owner_name, u.email as owner_email, u.phone as owner_phone
                      FROM accommodations a
                      LEFT JOIN users u ON a.user_id = u.id
                      WHERE a.id = :id AND a.is_available = 1";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(":id", $accommodation_id);
            $stmt->execute();
            
            if ($stmt->rowCount() === 0) {
                sendError("Accommodation not found", 404);
            }
            
            $accommodation = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Convert amenities from JSON string to array
            if ($accommodation['amenities']) {
                $accommodation['amenities'] = json_decode($accommodation['amenities']);
            }
            
            sendSuccess("Accommodation retrieved successfully", $accommodation);
        }
        
        // Get all accommodations with filters
        else {
            $country = isset($_GET['country']) ? $_GET['country'] : null;
            $type = isset($_GET['type']) ? $_GET['type'] : null;
            $max_price = isset($_GET['max_price']) ? floatval($_GET['max_price']) : null;
            
            $query = "SELECT a.*, u.full_name as owner_name
                      FROM accommodations a
                      LEFT JOIN users u ON a.user_id = u.id
                      WHERE a.is_available = 1";
            
            $params = [];
            
            if ($country && $country !== 'all') {
                $query .= " AND a.country = :country";
                $params[':country'] = $country;
            }
            
            if ($type && $type !== 'all') {
                $query .= " AND a.type = :type";
                $params[':type'] = $type;
            }
            
            if ($max_price) {
                $query .= " AND a.price <= :max_price";
                $params[':max_price'] = $max_price;
            }
            
            $query .= " ORDER BY a.created_at DESC";
            
            $stmt = $db->prepare($query);
            
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            
            $stmt->execute();
            $accommodations = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            sendSuccess("Accommodations retrieved successfully", $accommodations);
        }
        
    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

// POST - Create new accommodation (Protected)
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $decoded = JWT::verifyToken();
    
    $data = json_decode(file_get_contents("php://input"));
    
    // Validate required fields
    if (empty($data->title) || empty($data->description) || empty($data->country) || 
        empty($data->city) || empty($data->location) || empty($data->type) || 
        empty($data->price) || !isset($data->bedrooms) || !isset($data->bathrooms)) {
        sendError("All required fields must be provided");
    }
    
    try {
        $query = "INSERT INTO accommodations 
                  (user_id, title, description, country, city, location, type, price, 
                   bedrooms, bathrooms, amenities, image_url) 
                  VALUES 
                  (:user_id, :title, :description, :country, :city, :location, :type, 
                   :price, :bedrooms, :bathrooms, :amenities, :image_url)";
        
        $stmt = $db->prepare($query);
        
        $amenities = isset($data->amenities) ? json_encode($data->amenities) : null;
        $image_url = isset($data->image_url) ? $data->image_url : null;
        
        $stmt->bindParam(":user_id", $decoded['user_id']);
        $stmt->bindParam(":title", $data->title);
        $stmt->bindParam(":description", $data->description);
        $stmt->bindParam(":country", $data->country);
        $stmt->bindParam(":city", $data->city);
        $stmt->bindParam(":location", $data->location);
        $stmt->bindParam(":type", $data->type);
        $stmt->bindParam(":price", $data->price);
        $stmt->bindParam(":bedrooms", $data->bedrooms);
        $stmt->bindParam(":bathrooms", $data->bathrooms);
        $stmt->bindParam(":amenities", $amenities);
        $stmt->bindParam(":image_url", $image_url);
        
        if ($stmt->execute()) {
            sendSuccess("Accommodation created successfully", [
                "id" => $db->lastInsertId()
            ]);
        } else {
            sendError("Failed to create accommodation");
        }
        
    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

else {
    sendError("Method not allowed", 405);
}
?>