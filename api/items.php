<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/auth.php';

function itemPayload(array $item): array {
    $item['dateOccurred'] = date('c', strtotime($item['date_occurred']));
    $item['createdAt'] = date('c', strtotime($item['created_at']));
    $item['category'] = ['id' => (int)$item['category_id'], 'name' => $item['category_name'], 'slug' => $item['category_slug']];
    $item['owner'] = ['id' => (int)$item['owner_id'], 'displayName' => $item['owner_name'], 'username' => $item['owner_username']];
    unset($item['date_occurred'], $item['created_at'], $item['category_id'], $item['category_name'], $item['category_slug'], $item['owner_name'], $item['owner_username']);
    return $item;
}

function validateItemInput(array $input): array {
    $title = trim((string)($input['title'] ?? ''));
    $description = trim((string)($input['description'] ?? ''));
    $province = trim((string)($input['province'] ?? ''));
    $city = trim((string)($input['city'] ?? ''));
    $approximateLocation = trim((string)($input['approximateLocation'] ?? ''));
    $categoryId = filter_var($input['categoryId'] ?? null, FILTER_VALIDATE_INT);
    $date = trim((string)($input['dateOccurred'] ?? ''));
    if ($title === '' || mb_strlen($title) > 120 || mb_strlen($description) < 10 || mb_strlen($description) > 5000 || !$categoryId || $province === '' || $city === '' || $approximateLocation === '' || $date === '') {
        sendError('Please complete all required item fields correctly.', 422);
    }
    $dateValue = date_create($date);
    if (!$dateValue) sendError('Invalid item date.', 422);
    return [
        'title' => $title, 'description' => $description, 'categoryId' => $categoryId,
        'province' => mb_substr($province, 0, 80), 'city' => mb_substr($city, 0, 80),
        'approximateLocation' => mb_substr($approximateLocation, 0, 160),
        'dateOccurred' => $dateValue->format('Y-m-d H:i:s'),
        'brand' => mb_substr(trim((string)($input['brand'] ?? '')), 0, 60) ?: null,
        'color' => mb_substr(trim((string)($input['color'] ?? '')), 0, 40) ?: null,
        'barangay' => mb_substr(trim((string)($input['barangay'] ?? '')), 0, 80) ?: null,
        'distinguishingFeatures' => mb_substr(trim((string)($input['distinguishingFeatures'] ?? '')), 0, 2000) ?: null,
        'privateSerial' => mb_substr(trim((string)($input['privateSerial'] ?? '')), 0, 200) ?: null,
        'privateProof' => mb_substr(trim((string)($input['privateProof'] ?? '')), 0, 2000) ?: null,
        'reward' => mb_substr(trim((string)($input['reward'] ?? '')), 0, 100) ?: null,
    ];
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET') {
    try {
        $db = getDB();
        $id = filter_var($_GET['id'] ?? null, FILTER_VALIDATE_INT);
        if ($id) {
            $stmt = $db->prepare("SELECT i.*, c.name category_name, c.slug category_slug, u.full_name owner_name, u.username owner_username FROM items i JOIN categories c ON c.id=i.category_id JOIN users u ON u.id=i.owner_id WHERE i.id=? AND i.status != 'REMOVED'");
            $stmt->execute([$id]);
            $item = $stmt->fetch();
            if (!$item) sendError('Item not found.', 404);
            if ($item['status'] === 'EXPIRED') {
                $viewer = getCurrentUser();
                if (!$viewer || (int)$viewer['id'] !== (int)$item['owner_id']) sendError('Item not found.', 404);
            }
            $images = $db->prepare('SELECT id, url, alt FROM item_images WHERE item_id=? ORDER BY created_at ASC');
            $images->execute([$id]);
            $result = itemPayload($item);
            $result['images'] = $images->fetchAll();
            // Never return ownership verification data on the public endpoint.
            unset($result['private_serial'], $result['private_proof'], $result['distinguishing_features']);
            sendSuccess($result);
        }

        if (($_GET['count'] ?? '') === '1') {
            $total = (int)$db->query("SELECT COUNT(*) FROM items WHERE status IN ('ACTIVE','MATCHED','CLAIM_PENDING')")->fetchColumn();
            sendSuccess(['count' => $total]);
        }

        $type = strtoupper(trim((string)($_GET['type'] ?? '')));
        $q = trim((string)($_GET['q'] ?? ''));
        $city = trim((string)($_GET['city'] ?? ''));
        $category = trim((string)($_GET['category'] ?? ''));
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(50, max(1, (int)($_GET['limit'] ?? 24)));
        $where = ["i.status IN ('ACTIVE','MATCHED','CLAIM_PENDING')"];
        $params = [];
        if (in_array($type, ['LOST', 'FOUND'], true)) { $where[] = 'i.type=?'; $params[] = $type; }
        if ($q !== '') { $where[] = '(i.title LIKE ? OR i.description LIKE ? OR i.brand LIKE ?)'; $term = "%$q%"; array_push($params, $term, $term, $term); }
        if ($city !== '') { $where[] = 'i.city LIKE ?'; $params[] = "%$city%"; }
        if ($category !== '') { $where[] = '(c.slug=? OR c.name=?)'; array_push($params, $category, $category); }
        $sql = 'SELECT i.*, c.name category_name, c.slug category_slug, u.full_name owner_name, u.username owner_username FROM items i JOIN categories c ON c.id=i.category_id JOIN users u ON u.id=i.owner_id WHERE '.implode(' AND ', $where).' ORDER BY i.created_at DESC LIMIT '.$limit.' OFFSET '.(($page-1)*$limit);
        $stmt = $db->prepare($sql); $stmt->execute($params);
        $items = $stmt->fetchAll();
        $imageStmt = $db->prepare('SELECT id,url,alt FROM item_images WHERE item_id=? ORDER BY created_at ASC LIMIT 1');
        foreach ($items as &$item) { $imageStmt->execute([$item['id']]); $item = itemPayload($item); $item['images'] = $imageStmt->fetchAll(); }
        $categories = $db->query('SELECT id,name,slug FROM categories ORDER BY name ASC')->fetchAll();
        sendSuccess(['items' => $items, 'categories' => $categories, 'page' => $page, 'limit' => $limit]);
    } catch (PDOException $e) { error_log('Items read failed: '.$e->getMessage()); sendError('Unable to load items right now.', 500); }
}

if ($method !== 'POST') sendError('Method not allowed.', 405);
requireAuth();
$db = getDB(); $user = getCurrentUser(); $input = getJSONBody();

try {
    $itemId = filter_var($input['id'] ?? $_GET['id'] ?? null, FILTER_VALIDATE_INT);
    if (in_array($action, ['delete','private','recover'], true)) {
        if (!$itemId) sendError('Invalid item.', 422);
        $status = $action === 'delete' ? 'REMOVED' : ($action === 'private' ? 'EXPIRED' : 'RESOLVED');
        $stmt = $db->prepare('UPDATE items SET status=?, updated_at=NOW() WHERE id=? AND owner_id=?');
        $stmt->execute([$status, $itemId, $user['id']]);
        if (!$stmt->rowCount()) sendError('Item not found or not owned by you.', 404);
        sendSuccess(['id' => $itemId, 'status' => $status]);
    }

    $type = strtoupper(trim((string)($input['type'] ?? '')));
    if (!in_array($type, ['LOST','FOUND'], true)) sendError('Invalid item type.', 422);
    $data = validateItemInput($input);
    $category = $db->prepare('SELECT id FROM categories WHERE id=?'); $category->execute([$data['categoryId']]);
    if (!$category->fetch()) sendError('Invalid category.', 422);

    if ($action === 'update') {
        if (!$itemId) sendError('Invalid item.', 422);
        $sql = 'UPDATE items SET category_id=?, title=?, brand=?, color=?, description=?, distinguishing_features=?, private_serial=?, private_proof=?, reward=?, province=?, city=?, barangay=?, approximate_location=?, date_occurred=?, updated_at=NOW() WHERE id=? AND owner_id=?';
        $stmt = $db->prepare($sql); $stmt->execute([$data['categoryId'],$data['title'],$data['brand'],$data['color'],$data['description'],$data['distinguishingFeatures'],$data['privateSerial'],$data['privateProof'],$data['reward'],$data['province'],$data['city'],$data['barangay'],$data['approximateLocation'],$data['dateOccurred'],$itemId,$user['id']]);
        sendSuccess(['id' => $itemId, 'message' => 'Item updated successfully.']);
    }

    $db->beginTransaction();
    $stmt = $db->prepare('INSERT INTO items (owner_id,category_id,type,status,title,brand,color,description,distinguishing_features,private_serial,private_proof,reward,province,city,barangay,approximate_location,date_occurred,created_at,updated_at) VALUES (?,?,?,\'ACTIVE\',?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())');
    $stmt->execute([$user['id'],$data['categoryId'],$type,$data['title'],$data['brand'],$data['color'],$data['description'],$data['distinguishingFeatures'],$data['privateSerial'],$data['privateProof'],$data['reward'],$data['province'],$data['city'],$data['barangay'],$data['approximateLocation'],$data['dateOccurred']]);
    $newId = (int)$db->lastInsertId();
    $imageInsert = $db->prepare('INSERT INTO item_images (item_id,url,alt,created_at) VALUES (?,?,?,NOW())');
    foreach (array_slice((array)($input['images'] ?? []), 0, 5) as $image) if (is_array($image) && !empty($image['url']) && str_starts_with($image['url'], '/uploads/')) $imageInsert->execute([$newId, $image['url'], mb_substr((string)($image['alt'] ?? $data['title']), 0, 255)]);
    $db->commit();
    sendSuccess(['id' => $newId, 'message' => 'Item posted successfully.'], 201);
} catch (Throwable $e) { if ($db->inTransaction()) $db->rollBack(); error_log('Item write failed: '.$e->getMessage()); sendError('Unable to save this item. Please try again.', 500); }
