<?php
// FindBack PH - Reports API
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

// POST - Create report
if ($method === 'POST') {
    requireAuth();

    try {
        $db = getDB();
        $user = getCurrentUser();
        $input = getJSONBody();

        $reason = $input['reason'] ?? '';
        $details = $input['details'] ?? '';
        $itemId = $input['itemId'] ?? null;
        $reportedUserId = $input['reportedUserId'] ?? null;

        // Validate required fields
        if (empty($reason) || empty($itemId)) {
            sendError('Reason and item ID are required', 400);
        }

        // Validate reason
        $validReasons = ['FAKE_LISTING', 'SCAM', 'HARASSMENT', 'STOLEN', 'INAPPROPRIATE', 'SPAM', 'SUSPICIOUS'];
        if (!in_array($reason, $validReasons)) {
            sendError('Invalid report reason', 400);
        }

        // Verify item exists
        $stmt = $db->prepare("SELECT id, owner_id FROM items WHERE id = ?");
        $stmt->execute([$itemId]);
        $item = $stmt->fetch();

        if (!$item) {
            sendError('Item not found', 404);
        }

        // Don't allow reporting your own item
        if ($item['owner_id'] === $user['id']) {
            sendError('You cannot report your own item', 400);
        }

        // Create report
        $reportId = generateUUID();
        $stmt = $db->prepare("
            INSERT INTO reports (id, item_id, reporter_id, reported_user_id, reason, details, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'PENDING', NOW())
        ");
        $stmt->execute([
            $reportId,
            $itemId,
            $user['id'],
            $item['owner_id'],
            $reason,
            $details
        ]);

        sendSuccess([
            'id' => $reportId,
            'message' => 'Report submitted successfully'
        ], 201);

    } catch (PDOException $e) {
        sendError('Failed to create report: ' . $e->getMessage(), 500);
    }
}

// GET - List reports (admin only)
if ($method === 'GET') {
    requireAdmin();

    try {
        $db = getDB();
        $status = $_GET['status'] ?? 'PENDING';

        $sql = "
            SELECT
                r.id, r.reason, r.details, r.status, r.created_at,
                i.title as item_title,
                u.full_name as reporter_name, u.username as reporter_username,
                ru.full_name as reported_user_name, ru.username as reported_user_username
            FROM reports r
            LEFT JOIN items i ON r.item_id = i.id
            LEFT JOIN users u ON r.reporter_id = u.id
            LEFT JOIN users ru ON r.reported_user_id = ru.id
            WHERE r.status = ?
            ORDER BY r.created_at DESC
        ";

        $stmt = $db->prepare($sql);
        $stmt->execute([$status]);
        $reports = $stmt->fetchAll();

        sendSuccess($reports, 200);

    } catch (PDOException $e) {
        sendError('Failed to fetch reports', 500);
    }
}

sendError('Method not allowed', 405);
