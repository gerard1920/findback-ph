<?php
// FindBack PH - Get Current Session User API
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

$user = getCurrentUser();

if (!$user) {
    sendError('Not authenticated', 401);
}

// Remove sensitive data
unset($user['password_hash']);
sendSuccess($user, 200);