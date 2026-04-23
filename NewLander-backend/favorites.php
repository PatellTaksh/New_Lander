<?php
require_once 'config.php';
require_once 'jwt.php';

// All favorites routes require authentication
$decoded  = JWT::verifyToken();
$user_id  = $decoded['user_id'];

$database = new Database();
$db = $database->getConnection();

// ============================================================
// GET — Get user's favorites (optionally filtered by type)
// ============================================================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $item_type = isset($_GET['type']) ? $_GET['type'] : null;

    if ($item_type && !in_array($item_type, ['accommodation', 'event', 'post'])) {
        sendError("Invalid type. Use accommodation, event, or post");
    }

    try {
        $query = "SELECT f.id as favorite_id, f.item_type, f.item_id, f.created_at,
                  CASE
                      WHEN f.item_type = 'accommodation' THEN a.title
                      WHEN f.item_type = 'event'         THEN e.title
                      WHEN f.item_type = 'post'          THEN p.title
                  END as item_title,
                  CASE
                      WHEN f.item_type = 'accommodation' THEN a.city
                      WHEN f.item_type = 'event'         THEN e.city
                      ELSE NULL
                  END as item_city,
                  CASE
                      WHEN f.item_type = 'accommodation' THEN a.country
                      WHEN f.item_type = 'event'         THEN e.country
                      ELSE NULL
                  END as item_country,
                  CASE
                      WHEN f.item_type = 'accommodation' THEN a.price
                      ELSE NULL
                  END as item_price,
                  CASE
                      WHEN f.item_type = 'accommodation' THEN a.image_url
                      ELSE NULL
                  END as item_image,
                  CASE
                      WHEN f.item_type = 'accommodation' THEN a.type
                      WHEN f.item_type = 'event'         THEN e.category
                      ELSE NULL
                  END as item_subtype
                  FROM favorites f
                  LEFT JOIN accommodations a ON f.item_type = 'accommodation' AND f.item_id = a.id
                  LEFT JOIN events e         ON f.item_type = 'event'         AND f.item_id = e.id
                  LEFT JOIN posts p          ON f.item_type = 'post'          AND f.item_id = p.id
                  WHERE f.user_id = :user_id";

        $params = [':user_id' => $user_id];

        if ($item_type) {
            $query .= " AND f.item_type = :item_type";
            $params[':item_type'] = $item_type;
        }

        $query .= " ORDER BY f.created_at DESC";

        $stmt = $db->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();

        sendSuccess("Favorites retrieved successfully", $stmt->fetchAll(PDO::FETCH_ASSOC));

    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

// ============================================================
// POST — Add item to favorites
// ============================================================
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->item_type) || empty($data->item_id)) {
        sendError("item_type and item_id are required");
    }
    if (!in_array($data->item_type, ['accommodation', 'event', 'post'])) {
        sendError("Invalid item_type");
    }

    $item_id = intval($data->item_id);

    try {
        $query = "INSERT INTO favorites (user_id, item_type, item_id) VALUES (:user_id, :item_type, :item_id)";
        $stmt  = $db->prepare($query);
        $stmt->bindParam(":user_id",   $user_id);
        $stmt->bindParam(":item_type", $data->item_type);
        $stmt->bindParam(":item_id",   $item_id);
        $stmt->execute();

        sendSuccess("Added to favorites", ["favorite_id" => intval($db->lastInsertId())]);

    } catch (PDOException $e) {
        // Unique constraint violation = already favorited
        if (strpos($e->getMessage(), 'Duplicate') !== false || $e->getCode() == 23000) {
            sendError("Already in favorites", 409);
        }
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

// ============================================================
// DELETE — Remove item from favorites
// ============================================================
else if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $item_type = isset($_GET['item_type']) ? $_GET['item_type'] : null;
    $item_id   = isset($_GET['item_id'])   ? intval($_GET['item_id']) : 0;

    if (!$item_type || !$item_id) {
        sendError("item_type and item_id are required");
    }

    try {
        $query = "DELETE FROM favorites WHERE user_id = :user_id AND item_type = :item_type AND item_id = :item_id";
        $stmt  = $db->prepare($query);
        $stmt->bindParam(":user_id",   $user_id);
        $stmt->bindParam(":item_type", $item_type);
        $stmt->bindParam(":item_id",   $item_id);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            sendSuccess("Removed from favorites");
        } else {
            sendError("Favorite not found", 404);
        }
    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

else {
    sendError("Method not allowed", 405);
}
?>
