<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/auth.php';

requireAuth();
$db = getDB();
$user = getCurrentUser();
$method = $_SERVER['REQUEST_METHOD'];

function conversationForUser(PDO $db, int $conversationId, int $userId): ?array {
    $stmt = $db->prepare('SELECT id,item_id,participant_a_id,participant_b_id,created_at FROM conversations WHERE id=? AND (participant_a_id=? OR participant_b_id=?) LIMIT 1');
    $stmt->execute([$conversationId, $userId, $userId]);
    return $stmt->fetch() ?: null;
}

try {
    if ($method === 'GET') {
        $conversationId = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
        if ($conversationId) {
            $conversation = conversationForUser($db, $conversationId, (int)$user['id']);
            if (!$conversation) sendError('Conversation not found.', 404);
            $stmt = $db->prepare('SELECT m.id,m.body,m.sender_id,m.read_at,m.created_at,u.full_name,u.username FROM messages m JOIN users u ON u.id=m.sender_id WHERE m.conversation_id=? ORDER BY m.created_at ASC');
            $stmt->execute([$conversationId]);
            $messages = $stmt->fetchAll();
            $db->prepare('UPDATE messages SET read_at=NOW() WHERE conversation_id=? AND sender_id<>? AND read_at IS NULL')->execute([$conversationId, $user['id']]);
            sendSuccess(['conversation' => $conversation, 'messages' => $messages]);
        }
        $stmt = $db->prepare('SELECT c.id,c.item_id,c.created_at,i.title,MAX(m.created_at) last_message_at,SUM(CASE WHEN m.sender_id<>? AND m.read_at IS NULL THEN 1 ELSE 0 END) unread_count FROM conversations c JOIN items i ON i.id=c.item_id LEFT JOIN messages m ON m.conversation_id=c.id WHERE c.participant_a_id=? OR c.participant_b_id=? GROUP BY c.id,i.title ORDER BY COALESCE(MAX(m.created_at),c.created_at) DESC');
        $stmt->execute([$user['id'], $user['id'], $user['id']]);
        sendSuccess(['conversations' => $stmt->fetchAll()]);
    }

    if ($method !== 'POST') sendError('Method not allowed.', 405);
    $input = getJSONBody();
    $conversationId = filter_var($input['conversationId'] ?? null, FILTER_VALIDATE_INT);
    $itemId = filter_var($input['itemId'] ?? null, FILTER_VALIDATE_INT);
    $body = trim((string)($input['body'] ?? ''));
    if (!$conversationId && !$itemId) sendError('A conversation or item is required.', 422);
    $startOnly = ($_GET['action'] ?? '') === 'start';
    if (!$startOnly && (mb_strlen($body) < 1 || mb_strlen($body) > 2000)) sendError('Message must be between 1 and 2000 characters.', 422);
    if (!$conversationId) {
        $itemStmt = $db->prepare('SELECT id,owner_id,status FROM items WHERE id=? AND status IN (\'ACTIVE\',\'MATCHED\',\'CLAIM_PENDING\')');
        $itemStmt->execute([$itemId]); $item = $itemStmt->fetch();
        if (!$item || (int)$item['owner_id'] === (int)$user['id']) sendError('Unable to start this conversation.', 422);
        $a = min((int)$user['id'], (int)$item['owner_id']); $b = max((int)$user['id'], (int)$item['owner_id']);
        $find = $db->prepare('SELECT id FROM conversations WHERE item_id=? AND participant_a_id=? AND participant_b_id=?'); $find->execute([$itemId,$a,$b]);
        $conversationId = (int)($find->fetch()['id'] ?? 0);
        if (!$conversationId) { $db->prepare('INSERT INTO conversations (item_id,participant_a_id,participant_b_id,created_at) VALUES (?,?,?,NOW())')->execute([$itemId,$a,$b]); $conversationId = (int)$db->lastInsertId(); }
    }
    if (!conversationForUser($db, $conversationId, (int)$user['id'])) sendError('Conversation not found.', 404);
    if (!$startOnly) $db->prepare('INSERT INTO messages (conversation_id,sender_id,body,created_at) VALUES (?,?,?,NOW())')->execute([$conversationId,$user['id'],$body]);
    sendSuccess(['conversationId'=>$conversationId,'message'=>$startOnly ? 'Conversation created.' : 'Message sent.'], 201);
} catch (PDOException $e) { error_log('Messages API error: '.$e->getMessage()); sendError('Unable to process messages right now.', 500); }
