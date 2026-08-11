<?php
// FindBack PH public configuration. Keep deployment secrets in config.local.php,
// which is ignored by Git and must never be committed or served publicly.
$localConfig = __DIR__ . '/config.local.php';
if (!is_file($localConfig)) {
    http_response_code(500);
    exit('Server configuration is incomplete.');
}
require_once $localConfig;

foreach (['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS', 'JWT_SECRET'] as $requiredSetting) {
    if (!defined($requiredSetting) || constant($requiredSetting) === '') {
        http_response_code(500);
        exit('Server configuration is incomplete.');
    }
}

// Application Configuration
define('APP_URL', 'https://findbackph.infinityfree.me');  // Your production URL
define('APP_NAME', 'FindBack PH');

// Security Configuration
define('SESSION_LIFETIME', 7 * 24 * 60 * 60);  // 7 days in seconds

// Upload Configuration
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024);  // 5MB
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'webp']);
define('ALLOWED_MIME_TYPES', ['image/jpeg', 'image/png', 'image/webp']);

// Email Configuration (for password reset)
// Option 1: Gmail SMTP
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_SECURE', false);
define('SMTP_USER', 'your-email@gmail.com');
define('SMTP_PASS', 'your-app-password');
define('SMTP_FROM', 'FindBack PH <your-email@gmail.com>');

// Timezone
date_default_timezone_set('Asia/Manila');

// Error Reporting (disable in production)
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);
