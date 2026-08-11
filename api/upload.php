<?php
// FindBack PH - Image Upload API
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Method not allowed', 405);
}

requireAuth();

try {
    // Check if file was uploaded
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        sendError('No image file provided or upload error', 400);
    }

    $file = $_FILES['image'];

    // Validate file size
    if ($file['size'] > MAX_FILE_SIZE) {
        sendError('File size exceeds 5MB limit', 400);
    }

    // Validate file extension
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($extension, ALLOWED_EXTENSIONS)) {
        sendError('Invalid file type. Allowed: JPG, PNG, WEBP', 400);
    }

    // Validate MIME type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, ALLOWED_MIME_TYPES)) {
        sendError('Invalid file type. Allowed: JPG, PNG, WEBP', 400);
    }

    // Generate unique filename
    $filename = generateUUID() . '.' . $extension;
    $uploadPath = UPLOAD_DIR . $filename;

    // Ensure upload directory exists
    if (!file_exists(UPLOAD_DIR)) {
        mkdir(UPLOAD_DIR, 0755, true);
    }

    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        sendError('Failed to save uploaded file', 500);
    }

    // Return file URL
    $fileUrl = '/uploads/' . $filename;
    sendSuccess([
        'url' => $fileUrl,
        'filename' => $filename
    ], 201);

} catch (Exception $e) {
    sendError('Upload failed: ' . $e->getMessage(), 500);
}
