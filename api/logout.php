<?php
// FindBack PH - User Logout API
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

clearUserSession();
sendSuccess(['message' => 'Logged out successfully'], 200);
