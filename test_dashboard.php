<?php
require 'd:/Taksh/6th sem/Prototype Modeling/Code/NewLander/NewLander-backend/jwt.php';
require 'd:/Taksh/6th sem/Prototype Modeling/Code/NewLander/NewLander-backend/config.php';

$db = new Database();
$pdo = $db->getConnection();
$stmt = $pdo->prepare('SELECT id FROM users LIMIT 1');
$stmt->execute();
$user = $stmt->fetch();

$token = JWT::encode(['user_id' => $user['id'], 'exp' => time()+3600], JWT_SECRET_KEY);

$opts = [
    'http' => [
        'method' => 'GET',
        'header' => 'Authorization: Bearer ' . $token,
        'ignore_errors' => true // to fetch body even on 4xx/5xx
    ]
];
$context = stream_context_create($opts);
$result = file_get_contents('http://localhost/NewLander1/NewLander-backend/dashboard.php', false, $context);
echo $result;
?>
