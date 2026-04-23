<?php
require_once 'config.php';
require_once 'jwt.php';

$database = new Database();
$db = $database->getConnection();

// ============================================================
// GET — Get comments for a specific post
// ============================================================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;

    if (!$post_id) {
        sendError("post_id is required");
    }

    try {
        $query = "SELECT c.id, c.content, c.created_at, u.full_name as author_name
                  FROM comments c
                  LEFT JOIN users u ON c.user_id = u.id
                  WHERE c.post_id = :post_id
                  ORDER BY c.created_at ASC";

        $stmt = $db->prepare($query);
        $stmt->bindParam(":post_id", $post_id);
        $stmt->execute();

        sendSuccess("Comments retrieved successfully", $stmt->fetchAll(PDO::FETCH_ASSOC));

    } catch (PDOException $e) {
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

// ============================================================
// POST — Add a comment to a post (protected)
// ============================================================
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $decoded = JWT::verifyToken();
    $data    = json_decode(file_get_contents("php://input"));

    if (empty($data->post_id) || empty($data->content)) {
        sendError("post_id and content are required");
    }

    $post_id = intval($data->post_id);
    $content = htmlspecialchars(strip_tags(trim($data->content)));

    if (strlen($content) < 1) {
        sendError("Comment cannot be empty");
    }

    try {
        // Verify post exists
        $checkS = $db->prepare("SELECT id FROM posts WHERE id = :post_id");
        $checkS->bindParam(":post_id", $post_id);
        $checkS->execute();
        if ($checkS->rowCount() === 0) {
            sendError("Post not found", 404);
        }

        $db->beginTransaction();

        // Insert comment
        $insertQ = "INSERT INTO comments (post_id, user_id, content) VALUES (:post_id, :user_id, :content)";
        $insertS = $db->prepare($insertQ);
        $insertS->bindParam(":post_id",  $post_id);
        $insertS->bindParam(":user_id",  $decoded['user_id']);
        $insertS->bindParam(":content",  $content);
        $insertS->execute();

        $comment_id = $db->lastInsertId();

        // Increment comments_count on post
        $upQ = "UPDATE posts SET comments_count = comments_count + 1 WHERE id = :post_id";
        $upS = $db->prepare($upQ);
        $upS->bindParam(":post_id", $post_id);
        $upS->execute();

        $db->commit();

        // Return full comment with author info
        $fetchQ = "SELECT c.id, c.content, c.created_at, u.full_name as author_name
                   FROM comments c LEFT JOIN users u ON c.user_id = u.id
                   WHERE c.id = :id";
        $fetchS = $db->prepare($fetchQ);
        $fetchS->bindParam(":id", $comment_id);
        $fetchS->execute();

        sendSuccess("Comment added successfully", $fetchS->fetch(PDO::FETCH_ASSOC));

    } catch (PDOException $e) {
        if ($db->inTransaction()) $db->rollBack();
        sendError("Database error: " . $e->getMessage(), 500);
    }
}

else {
    sendError("Method not allowed", 405);
}
?>
