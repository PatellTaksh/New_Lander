<?php
require_once 'config.php';

// Database connection
$database = new Database();
$db = $database->getConnection();

// GET - Get all services
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $country = isset($_GET['country']) ? $_GET['country'] : null;
        $city = isset($_GET['city']) ? $_GET['city'] : null;
        
        $query = "SELECT s.*, u.full_name as provider_name
                  FROM services s
                  LEFT JOIN users u ON s.provider_id = u.id
                  WHERE s.is_available = 1";
        
        $params = [];
        
        if ($country && $country !== 'all') {
            $query .= " AND s.country = :country";
            $params[':country'] = $country;
        }
        
        if ($city) {
            $query .= " AND s.city = :city";
            $params[':city'] = $city;
        }
        
        $query .= " ORDER BY s.created_at DESC LIMIT 50";
        
        $stmt = $db->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->execute();
        $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format services with icon mapping
        $iconMap = [
            'Airport Pickup' => 'fa-plane',
            'SIM Card' => 'fa-sim-card',
            'Translation' => 'fa-language',
            'Local Guide' => 'fa-map-marked-alt',
            'Furniture' => 'fa-couch',
            'Tutoring' => 'fa-book-reader',
            'Moving' => 'fa-truck-moving',
            'Shopping' => 'fa-shopping-cart'
        ];
        
        $formattedServices = array_map(function($service) use ($iconMap) {
            $icon = 'fa-concierge-bell'; // default
            foreach ($iconMap as $keyword => $iconClass) {
                if (stripos($service['title'], $keyword) !== false) {
                    $icon = $iconClass;
                    break;
                }
            }
            
            $service['icon'] = $icon;
            return $service;
        }, $services);
        
        sendSuccess("Services retrieved successfully", $formattedServices);
        
    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

// POST - Create new service (Protected)
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_once 'jwt.php';
    $decoded = JWT::verifyToken();
    
    $data = json_decode(file_get_contents("php://input"));
    
    if (empty($data->title) || empty($data->description) || 
        empty($data->price) || empty($data->country) || empty($data->city)) {
        sendError("All required fields must be provided");
    }
    
    try {
        $query = "INSERT INTO services 
                  (provider_id, title, description, category, price, country, city) 
                  VALUES 
                  (:provider_id, :title, :description, :category, :price, :country, :city)";
        
        $stmt = $db->prepare($query);
        
        $category = isset($data->category) ? $data->category : 'General';
        
        $stmt->bindParam(":provider_id", $decoded['user_id']);
        $stmt->bindParam(":title", $data->title);
        $stmt->bindParam(":description", $data->description);
        $stmt->bindParam(":category", $category);
        $stmt->bindParam(":price", $data->price);
        $stmt->bindParam(":country", $data->country);
        $stmt->bindParam(":city", $data->city);
        
        if ($stmt->execute()) {
            sendSuccess("Service created successfully", [
                "id" => $db->lastInsertId()
            ]);
        } else {
            sendError("Failed to create service");
        }
        
    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

else {
    sendError("Method not allowed", 405);
}
?>