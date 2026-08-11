<?php
// FindBack PH - Admin API
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// GET - Admin stats
if ($method === 'GET' && $action === 'stats') {
    requireAdmin();
    try {
        $db = getDB();
        $stats = [];
        
        $stmt = $db->query("SELECT COUNT(*) as count FROM users WHERE status != 'DELETED'");
        $stats['totalUsers'] = (int)$stmt->fetch()['count'];
        
        $stmt = $db->query("SELECT COUNT(*) as count FROM items WHERE status != 'REMOVED'");
        $stats['totalItems'] = (int)$stmt->fetch()['count'];
        
        $stmt = $db->query("SELECT COUNT(*) as count FROM items WHERE type = 'LOST' AND status != 'REMOVED'");
        $stats['lostItems'] = (int)$stmt->fetch()['count'];
        
        $stmt = $db->query("SELECT COUNT(*) as count FROM items WHERE type = 'FOUND' AND status != 'REMOVED'");
        $stats['foundItems'] = (int)$stmt->fetch()['count'];
        
        $stmt = $db->query("SELECT COUNT(*) as count FROM reports WHERE status = 'PENDING'");
        $stats['pendingReports'] = (int)$stmt->fetch()['count'];
        
        $stmt = $db->query("SELECT COUNT(*) as count FROM users WHERE status = 'BANNED'");
        $stats['bannedUsers'] = (int)$stmt->fetch()['count'];
        
        sendSuccess($stats, 200);
    } catch (PDOException $e) {
        sendError('Failed to fetch stats', 500);
    }
}

// GET - Admin users list
if ($method === 'GET' && $action === 'users') {
    requireAdmin();
    try {
        $db = getDB();
        $q = trim($_GET['q'] ?? '');
        $limit = min(100, max(1, (int)($_GET['limit'] ?? 50)));

        $where = ["1=1"];
        $params = [];

        if ($q) {
                        $where[] = "(u.full_name LIKE ? OR u.username LIKE ? OR u.email LIKE ?)";
            $searchTerm = "%$q%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        $whereClause = implode(' AND ', $where);

        $sql = "
            SELECT
                                u.id, u.email, u.full_name, u.username, u.role, u.status, u.created_at,
                (SELECT COUNT(*) FROM items WHERE owner_id = u.id AND status != 'REMOVED') as item_count,
                (SELECT COUNT(*) FROM reports WHERE reporter_id = u.id) as reports_count
            FROM users u
            WHERE $whereClause
            ORDER BY u.created_at DESC
            LIMIT $limit
        ";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $users = $stmt->fetchAll();

        sendSuccess($users, 200);
    } catch (PDOException $e) {
        sendError('Failed to fetch users', 500);
    }
}
