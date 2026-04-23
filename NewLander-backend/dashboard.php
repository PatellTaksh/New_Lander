<?php
require_once "config.php";
require_once "jwt.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

ini_set('display_errors', 0); // Disable display errors in production to avoid malformed JSON
error_reporting(E_ALL);

// Handle OPTIONS request (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow GET request
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError("Method not allowed", 405);
    exit;
}

try {
    // -------------------------------
    // 1. VERIFY JWT TOKEN
    // -------------------------------
    $userData = JWT::verifyToken();

    if (!$userData || !isset($userData['user_id'])) {
        sendError("Unauthorized: Invalid or missing token", 401);
        exit;
    }

    $user_id = $userData['user_id'];

    // -------------------------------
    // 2. DB CONNECTION
    // -------------------------------
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        sendError("Database connection failed", 500);
        exit;
    }

    // -------------------------------
    // 3. SAFE STATS HELPER
    // -------------------------------
    // Define outside of try/catch loops to avoid redeclaration fatal errors
    $getCount = function($db, $query, $uid) {
        try {
            $stmt = $db->prepare($query);
            $stmt->bindParam(":uid", $uid);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return isset($result['cnt']) ? intval($result['cnt']) : 0;
        } catch (Exception $e) {
            return 0; // Fallback instead of breaking dashboard
        }
    };

    // -------------------------------
    // 4. GET USER PROFILE
    // -------------------------------
    $profileQ = "SELECT id, full_name, email, current_country, destination_country,
                        bio, phone, university, created_at
                 FROM users 
                 WHERE id = :uid 
                 LIMIT 1";

    $profileS = $db->prepare($profileQ);
    $profileS->bindParam(":uid", $user_id);
    $profileS->execute();

    $profile = $profileS->fetch(PDO::FETCH_ASSOC);

    if (!$profile) {
        sendError("User not found", 404);
        exit;
    }

    // -------------------------------
    // 5. FETCH STATS
    // -------------------------------
    $stats = [
        "saved_accommodations" => $getCount($db, "SELECT COUNT(*) as cnt FROM favorites WHERE user_id = :uid AND item_type = 'accommodation'", $user_id),
        "registered_events"    => $getCount($db, "SELECT COUNT(*) as cnt FROM event_registrations WHERE user_id = :uid", $user_id),
        "community_posts"      => $getCount($db, "SELECT COUNT(*) as cnt FROM posts WHERE user_id = :uid", $user_id),
        "total_bookings"       => $getCount($db, "SELECT COUNT(*) as cnt FROM accommodation_bookings WHERE user_id = :uid", $user_id)
    ];

    // -------------------------------
    // 6. UPCOMING EVENTS
    // -------------------------------
    $upcoming_events = [];
    try {
        $upcomingQ = "SELECT e.id, e.title, e.event_date, e.event_time, e.city, e.country, e.category
                      FROM event_registrations r
                      JOIN events e ON r.event_id = e.id
                      WHERE r.user_id = :uid AND e.event_date >= CURDATE()
                      ORDER BY e.event_date ASC 
                      LIMIT 3";

        $stmt = $db->prepare($upcomingQ);
        $stmt->bindParam(":uid", $user_id);
        $stmt->execute();
        $upcoming_events = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        $upcoming_events = [];
    }

    // -------------------------------
    // 7. RECENT BOOKINGS
    // -------------------------------
    $recent_bookings = [];
    try {
        $recentBookQ = "SELECT ab.id, ab.status, ab.move_in_date, ab.total_amount,
                               ab.monthly_rent, ab.duration_months, ab.created_at,
                               a.title, a.city, a.country, a.type
                        FROM accommodation_bookings ab
                        JOIN accommodations a ON ab.accommodation_id = a.id
                        WHERE ab.user_id = :uid
                        ORDER BY ab.created_at DESC 
                        LIMIT 3";

        $stmt = $db->prepare($recentBookQ);
        $stmt->bindParam(":uid", $user_id);
        $stmt->execute();
        $recent_bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        $recent_bookings = [];
    }

    // -------------------------------
    // 8. RECENT POSTS
    // -------------------------------
    $recent_posts = [];
    try {
        $recentPostsQ = "SELECT id, title, post_type, likes, comments_count, country, created_at
                         FROM posts
                         WHERE user_id = :uid
                         ORDER BY created_at DESC 
                         LIMIT 3";

        $stmt = $db->prepare($recentPostsQ);
        $stmt->bindParam(":uid", $user_id);
        $stmt->execute();
        $recent_posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        $recent_posts = [];
    }

    // -------------------------------
    // 9. FINAL RESPONSE
    // -------------------------------
    sendSuccess("Dashboard data loaded successfully", [
        "profile" => $profile,
        "stats" => $stats,
        "upcoming_events" => $upcoming_events,
        "recent_bookings" => $recent_bookings,
        "recent_posts"    => $recent_posts
    ]);

} catch (Exception $e) {
    sendError("Server error: " . $e->getMessage(), 500);
}
?>