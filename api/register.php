<?php
// FindBack PH - User Registration API
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

try {
    $db = getDB();
    $input = getJSONBody();

    // Validate input
    $email = filter_var($input['email'] ?? '', FILTER_SANITIZE_EMAIL);
    $password = $input['password'] ?? '';
    $fullName = trim($input['displayName'] ?? $input['full_name'] ?? '');

    if (empty($email) || empty($password) || empty($fullName)) {
        sendError('Email, password, and full name are required', 400);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendError('Invalid email format', 400);
    }

    if (strlen($password) < 8) {
        sendError('Password must be at least 8 characters', 400);
    }

    if (strlen($fullName) < 2 || strlen($fullName) > 60) {
        sendError('Full name must be between 2 and 60 characters', 400);
    }

    $email = strtolower($email);

    // Check if email already exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        sendError('An account already exists with this email', 409);
    }

    // Generate username from email
    $baseUsername = preg_replace('/[^a-z0-9]/', '', explode('@', $email)[0]);
    $baseUsername = substr($baseUsername, 0, 16);
    $username = $baseUsername . rand(1000, 9999);

    // Ensure username is unique
    $stmt = $db->prepare("SELECT id FROM users WHERE username = ?");
    while ($stmt->execute([$username]) && $stmt->fetch()) {
        $username = $baseUsername . rand(1000, 9999);
    }

    // Hash password using bcrypt
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    // Create user in the actual MySQL users table
    // id is auto-increment INT, so we don't include it
    $stmt = $db->prepare("
        INSERT INTO users
            (email, password_hash, full_name, username, role, status, email_verified, created_at, updated_at)
        VALUES
            (?, ?, ?, ?, 'user', 'active', 0, NOW(), NOW())
    ");
    $stmt->execute([$email, $passwordHash, $fullName, $username]);

    $userId = $db->lastInsertId();

    // Set session
    setUserSession($userId, $email, 'user');

    // Return user data (never send password_hash to frontend)
    sendSuccess([
        'id' => (int)$userId,
        'email' => $email,
        'fullName' => $fullName,
        'username' => $username,
        'role' => 'user'
    ], 201);

} catch (PDOException $e) {
    // Log the actual error server-side, but don't expose it to the user
    error_log('Registration error: ' . $e->getMessage());
    sendError('Registration failed. Please try again later.', 500);
}
