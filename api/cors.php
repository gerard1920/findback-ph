<?php
require_once __DIR__ . '/config.php';
// FindBack PH - CORS Headers
// Session cookies must never be exposed to arbitrary origins. Same-origin
// requests need no CORS header; allow only the configured application origin.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && defined('APP_URL') && rtrim($origin, '/') === rtrim(APP_URL, '/')) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Credentials: true');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');  // 24 hours

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Set JSON content type for API responses
header('Content-Type: application/json');
