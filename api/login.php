<?php
// FindBack PH - User Login API
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

try {
    $db = getDB();
    $input = getJSONBody();

    $email = filter_var($input['email'] ?? '', FILTER_SANITIZE_EMAIL);
    $password = $input['password'] ?? '';

    if (empty($email) || empty($password)) {
        sendError('Email and password are required', 400);
    }

    $email = strtolower($email);

    // Find user in the actual MySQL users table
    $stmt = $db->prepare("
        SELECT id, email, password_hash, full_name, username, role, status
        FROM users
        WHERE email = ?
        LIMIT 1
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        sendError('Incorrect email or password', 401);
    }

    // Check if account is suspended/banned
    if (in_array(strtoupper($user['status']), ['SUSPENDED', 'BANNED'], true) || strtoupper($user['role']) === 'SUSPENDED') {
        // Get ban reason
        $stmt = $db->prepare("
            SELECT reason, action, created_at
            FROM bans
            WHERE user_id = ? AND action IN ('SUSPEND', 'BAN') AND lifted_at IS NULL
            ORDER BY created_at DESC
            LIMIT 1
        ");
        $stmt->execute([$user['id']]);
        $ban = $stmt->fetch();

        $reason = $ban ? $ban['reason'] : 'No reason provided';
        sendError("Your account has been suspended from Lost & Found.\n\nReason: $reason\n\nIf you believe this was a mistake, contact the administrator.", 403);
    }

    // Update last_login_at
    $stmt = $db->prepare("UPDATE users SET last_login_at = NOW() WHERE id = ?");
    $stmt->execute([$user['id']]);

    // Set session
    setUserSession($user['id'], $user['email'], $user['role']);

    // Return user data (exclude password_hash)
    unset($user['password_hash']);
    sendSuccess($user, 200);

} catch (PDOException $e) {
    // Log the actual error server-side, but don't expose it to the user
    error_log('Login error: ' . $e->getMessage());
    sendError('Login failed. Please try again later.', 500);
}
