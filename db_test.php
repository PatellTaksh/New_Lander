<?php
$db = new PDO('mysql:host=localhost;dbname=global_nest', 'root', '');
$tables = ['accommodations', 'posts', 'events', 'services'];
foreach ($tables as $t) {
    echo $t . ': ' . $db->query("SELECT COUNT(*) FROM $t")->fetchColumn() . "\n";
}
