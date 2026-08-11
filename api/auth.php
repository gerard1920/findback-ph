<?php
// FindBack PH - Authentication Helper Functions
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/config.php';

// Start secure session
function startSession() {
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            'lifetime' => SESSION_LIFETIME,
            'path' => '/',
            'domain' => '',
            'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
            'httponly' => true,
            'samesite' => 'Lax'
        ]);
        session_start();
    }
}

// Hash password
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

// Verify password
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// Generate session token
function generateSessionToken() {
    return bin2hex(random_bytes(32));
}

// Set user session
function setUserSession($userId, $email, $role) {
    startSession();
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_email'] = $email;
    $_SESSION['user_role'] = strtoupper($role);
    $_SESSION['created_at'] = time();
}

// Get current logged in user
function getCurrentUser() {
    startSession();
    if (!isset($_SESSION['user_id'])) {
        return null;
    }

    try {
        $db = getDB();
        $stmt = $db->prepare("
            SELECT id, email, full_name, username, role, status, created_at
            FROM users
            WHERE id = ? AND LOWER(status) IN ('active', 'suspended', 'banned')
            LIMIT 1
        ");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();

        if (!$user) {
            // User no longer exists or was deleted
            clearUserSession();
            return null;
        }

        return $user;
    } catch (PDOException $e) {
        return null;
    }
}

// Check if user is logged in
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Check if user is admin
function isAdmin() {
    $user = getCurrentUser();
    return $user && strtoupper($user['role']) === 'ADMIN';
}

function isModerator() {
    $user = getCurrentUser();
    return $user && in_array(strtoupper($user['role']), ['ADMIN', 'MODERATOR'], true);
}

// Require authentication (redirect to login if not authenticated)
function requireAuth() {
    if (!isLoggedIn()) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized', 'message' => 'Please login to continue']);
        exit;
    }
}

// Require admin role
function requireAdmin() {
    requireAuth();
    if (!isAdmin()) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden', 'message' => 'Admin access required']);
        exit;
    }
}

function requireModerator() {
    requireAuth();
    if (!isModerator()) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden', 'message' => 'Moderator access required']);
        exit;
    }
}

// Clear user session
function clearUserSession() {
    startSession();
    $_SESSION = [];
    if (isset($_COOKIE[session_name()])) {
        setcookie(session_name(), '', time() - 3600, '/');
    }
    session_destroy();
}

// Generate JWT token (for API authentication)
function generateJWT($userId, $email, $role) {
    $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = base64_encode(json_encode([
        'user_id' => $userId,
        'email' => $email,
        'role' => $role,
        'iat' => time(),
        'exp' => time() + SESSION_LIFETIME
    ]));

    $signature = hash_hmac('sha256', "$header.$payload", JWT_SECRET, true);
    $encodedSignature = base64_encode($signature);

    return "$header.$payload.$encodedSignature";
}

// Verify JWT token
function verifyJWT($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }

    list($header, $payload, $signature) = $parts;
    $expectedSignature = hash_hmac('sha256', "$header.$payload", JWT_SECRET, true);
    $expectedSignature = base64_encode($expectedSignature);

    if (!hash_equals($expectedSignature, $signature)) {
        return false;
    }

    $decodedPayload = json_decode(base64_decode($payload), true);
    if (!$decodedPayload || $decodedPayload['exp'] < time()) {
        return false;
    }

    return $decodedPayload;
}

// Send JSON response
function sendJSON($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Send error response
function sendError($message, $statusCode = 400) {
    sendJSON(['error' => $message], $statusCode);
}

// Send success response
function sendSuccess($data, $statusCode = 200) {
    sendJSON(['success' => true, 'data' => $data], $statusCode);
}

// Get request body as JSON
function getJSONBody() {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    return is_array($data) ? $data : [];
}

// Sanitize input
function sanitize($input) {
    if (is_array($input)) {
        return array_map('sanitize', $input);
    }
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

// Generate UUID
function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}
