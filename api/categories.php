<?php
// FindBack PH - Categories API
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

try {
    $db = getDB();
    $stmt = $db->query("SELECT id, name, slug FROM categories ORDER BY name ASC");
    $categories = $stmt->fetchAll();

    sendSuccess($categories, 200);

} catch (PDOException $e) {
    sendError('Failed to fetch categories', 500);
}
