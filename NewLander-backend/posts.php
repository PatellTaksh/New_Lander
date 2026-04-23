<?php
require_once 'config.php';
require_once 'jwt.php';

$database = new Database();
$db = $database->getConnection();

// ============================================================
// GET — Fetch posts (list or single)
// ============================================================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Single post by ID
        if (isset($_GET['id'])) {
            $post_id = intval($_GET['id']);
            $query = "SELECT p.*, u.full_name as author_name
                      FROM posts p
                      LEFT JOIN users u ON p.user_id = u.id
                      WHERE p.id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":id", $post_id);
            $stmt->execute();

            if ($stmt->rowCount() === 0) {
                sendError("Post not found", 404);
            }
            sendSuccess("Post retrieved successfully", $stmt->fetch(PDO::FETCH_ASSOC));
        }

        // Multiple posts with filters
        else {
            $type    = isset($_GET['type'])    ? $_GET['type']    : null;
            $country = isset($_GET['country']) ? $_GET['country'] : null;
            $user_filter = isset($_GET['user_id']) ? $_GET['user_id'] : null;

            $query  = "SELECT p.*, u.full_name as author_name
                       FROM posts p
                       LEFT JOIN users u ON p.user_id = u.id
                       WHERE 1=1";
            $params = [];

            if ($type && in_array($type, ['discussion', 'question'])) {
                $query .= " AND p.post_type = :type";
                $params[':type'] = $type;
            }
            if ($country && $country !== 'all') {
                $query .= " AND p.country = :country";
                $params[':country'] = $country;
            }
            // Filter to logged-in user's posts (dashboard "My Posts")
            if ($user_filter === 'me') {
                $decoded = JWT::verifyToken();
                $query  .= " AND p.user_id = :user_id";
                $params[':user_id'] = $decoded['user_id'];
            }

            $query .= " ORDER BY p.created_at DESC LIMIT 50";

            $stmt = $db->prepare($query);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->execute();
            sendSuccess("Posts retrieved successfully", $stmt->fetchAll(PDO::FETCH_ASSOC));
        }

    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

// ============================================================
// POST — Create a new post (protected)
// ============================================================
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $decoded = JWT::verifyToken();
    $data    = json_decode(file_get_contents("php://input"));

    if (empty($data->title) || empty($data->content)) {
        sendError("Title and content are required");
    }

    $post_type = (isset($data->post_type) && in_array($data->post_type, ['discussion', 'question']))
        ? $data->post_type : 'discussion';
    $country = isset($data->country) ? htmlspecialchars(strip_tags($data->country)) : null;

    try {
        $query = "INSERT INTO posts (user_id, title, content, post_type, country)
                  VALUES (:user_id, :title, :content, :post_type, :country)";
        $stmt  = $db->prepare($query);
        $stmt->bindParam(":user_id",   $decoded['user_id']);
        $stmt->bindParam(":title",     $data->title);
        $stmt->bindParam(":content",   $data->content);
        $stmt->bindParam(":post_type", $post_type);
        $stmt->bindParam(":country",   $country);

        if ($stmt->execute()) {
            $post_id = $db->lastInsertId();
            // Return full post with author name
            $fetchQ = "SELECT p.*, u.full_name as author_name FROM posts p
                       LEFT JOIN users u ON p.user_id = u.id WHERE p.id = :id";
            $fetchS = $db->prepare($fetchQ);
            $fetchS->bindParam(":id", $post_id);
            $fetchS->execute();
            sendSuccess("Post created successfully", $fetchS->fetch(PDO::FETCH_ASSOC));
        } else {
            sendError("Failed to create post");
        }

    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

// ============================================================
// PUT — Like / Unlike a post (protected)
// ============================================================
else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    JWT::verifyToken(); // just validate — no need for user_id here
    $data = json_decode(file_get_contents("php://input"));

    if (empty($data->post_id) || empty($data->action)) {
        sendError("post_id and action (like/unlike) are required");
    }
    if (!in_array($data->action, ['like', 'unlike'])) {
        sendError("Invalid action. Use 'like' or 'unlike'");
    }

    try {
        $sql = ($data->action === 'like')
            ? "UPDATE posts SET likes = likes + 1 WHERE id = :id"
            : "UPDATE posts SET likes = GREATEST(likes - 1, 0) WHERE id = :id";

        $stmt = $db->prepare($sql);
        $stmt->bindParam(":id", $data->post_id);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            sendError("Post not found", 404);
        }

        // Return updated count
        $fetchS = $db->prepare("SELECT likes FROM posts WHERE id = :id");
        $fetchS->bindParam(":id", $data->post_id);
        $fetchS->execute();
        $row = $fetchS->fetch(PDO::FETCH_ASSOC);

        sendSuccess("Post " . $data->action . "d", ["likes" => intval($row['likes'])]);

    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

// ============================================================
// DELETE — Delete own post (protected)
// ============================================================
else if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $decoded = JWT::verifyToken();
    $post_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

    if (!$post_id) {
        sendError("Post ID is required");
    }

    try {
        $query = "DELETE FROM posts WHERE id = :id AND user_id = :user_id";
        $stmt  = $db->prepare($query);
        $stmt->bindParam(":id",      $post_id);
        $stmt->bindParam(":user_id", $decoded['user_id']);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            sendSuccess("Post deleted successfully");
        } else {
            sendError("Post not found or not authorized", 404);
        }
    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

else {
    sendError("Method not allowed", 405);
}
?>
