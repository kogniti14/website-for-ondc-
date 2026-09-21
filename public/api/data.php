<?php
/**
 * Kogniti Minds - Production PHP Data Persistence Dispatcher
 * Provides persistent data storage under data/storage/ for Apache/LiteSpeed hosting.
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Cache-Control: no-cache, no-store, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

$allowedCollections = [
    'products',
    'categories',
    'b2c_users',
    'b2b_businesses',
    'b2c_orders',
    'b2b_orders',
    'b2b_quotations',
    'admin_users',
    'coupons',
    'settings',
    'certifications',
    'certification_categories',
    'stories',
    'gallery_categories',
    'site_media',
    'policies',
    'policy_records',
    'policy_versions'
];

$collection = preg_replace('/[^a-zA-Z0-9_-]/', '', $_GET['collection'] ?? '');
if (empty($collection) || !in_array($collection, $allowedCollections)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid or missing collection parameter: ' . htmlspecialchars($collection)]);
    exit;
}

$candidates = [
    dirname(__DIR__, 2) . '/data/storage',
    dirname(__DIR__) . '/data/storage',
    __DIR__ . '/../../data/storage',
    sys_get_temp_dir() . '/kogniti_storage'
];

$dataDir = null;
foreach ($candidates as $cand) {
    if (!file_exists($cand)) {
        @mkdir($cand, 0775, true);
    }
    if (file_exists($cand) && is_writable($cand)) {
        $dataDir = $cand;
        break;
    }
}
if (!$dataDir) {
    $dataDir = $candidates[0];
    @mkdir($dataDir, 0775, true);
}

$filePath = $dataDir . '/' . $collection . '.json';
$method = $_SERVER['REQUEST_METHOD'];

function readStore($filePath) {
    if (!file_exists($filePath)) {
        return [];
    }
    $content = file_get_contents($filePath);
    return json_decode($content, true) ?: [];
}

function writeStore($filePath, $data) {
    $temp = $filePath . '.tmp.' . time() . '_' . mt_rand(100, 999);
    file_put_contents($temp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    rename($temp, $filePath);
}

if ($method === 'GET') {
    $data = readStore($filePath);
    $id = $_GET['id'] ?? null;

    // Admin authorization check for sensitive inventory exposure (Req 75)
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $adminRoleHeader = strtolower($_SERVER['HTTP_X_ADMIN_ROLE'] ?? '');
    $isAdmin = (
        strpos($authHeader, 'admin') !== false ||
        strpos($authHeader, 'super_admin') !== false ||
        $adminRoleHeader === 'admin' ||
        $adminRoleHeader === 'super_admin'
    );

    $sanitizeProduct = function($item) use ($isAdmin) {
        if ($isAdmin) {
            return $item;
        }
        $copy = $item;
        $stock = isset($copy['stock']) ? (int)$copy['stock'] : 0;
        if (empty($copy['stockStatus'])) {
            $copy['stockStatus'] = ($stock > 50) ? 'in_stock' : (($stock > 0) ? 'limited_stock' : 'out_of_stock');
        }
        unset($copy['stock']);
        unset($copy['stockQuantity']);
        return $copy;
    };

    if ($id !== null && $id !== '') {
        if (is_array($data)) {
            foreach ($data as $item) {
                if (isset($item['id']) && $item['id'] === $id) {
                    $res = ($collection === 'products') ? $sanitizeProduct($item) : $item;
                    echo json_encode($res);
                    exit;
                }
            }
        }
        http_response_code(404);
        echo json_encode(['error' => 'Item not found']);
        exit;
    }

    if ($collection === 'products' && !$isAdmin && is_array($data)) {
        $data = array_map($sanitizeProduct, $data);
    }

    echo json_encode($data);
    exit;
}

$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true);

if ($method === 'POST' || $method === 'PUT') {
    $isBatch = isset($_GET['batch']) && $_GET['batch'] === 'true';
    $data = readStore($filePath);

    if ($isBatch && is_array($body)) {
        $savedItems = [];
        foreach ($body as $newItem) {
            $tid = $newItem['id'] ?? ('item_' . time() . '_' . mt_rand(100, 999));
            $found = false;
            foreach ($data as $idx => $existing) {
                if (isset($existing['id']) && $existing['id'] === $tid) {
                    $merged = array_merge($existing, $newItem, ['updatedAt' => date('c')]);
                    $data[$idx] = $merged;
                    $savedItems[] = $merged;
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $newItem['id'] = $tid;
                $newItem['createdAt'] = $newItem['createdAt'] ?? date('c');
                $newItem['updatedAt'] = date('c');
                array_unshift($data, $newItem);
                $savedItems[] = $newItem;
            }
        }
        writeStore($filePath, $data);
        echo json_encode(['success' => true, 'count' => count($body), 'items' => $savedItems]);
        exit;
    }

    if (empty($body) || !is_array($body)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON body']);
        exit;
    }

    $targetId = $body['id'] ?? ($_GET['id'] ?? ('item_' . time() . '_' . mt_rand(100, 999)));
    $savedRecord = null;
    $found = false;

    foreach ($data as $idx => $existing) {
        if (isset($existing['id']) && $existing['id'] === $targetId) {
            $savedRecord = array_merge($existing, $body, [
                'id' => $targetId,
                'updatedAt' => date('c')
            ]);
            $data[$idx] = $savedRecord;
            $found = true;
            break;
        }
    }

    if (!$found) {
        $savedRecord = $body;
        $savedRecord['id'] = $targetId;
        $savedRecord['createdAt'] = $savedRecord['createdAt'] ?? date('c');
        $savedRecord['updatedAt'] = date('c');
        array_unshift($data, $savedRecord);
    }

    writeStore($filePath, $data);
    echo json_encode(['success' => true, 'item' => $savedRecord]);
    exit;
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? ($body['id'] ?? null);
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID parameter required']);
        exit;
    }

    $data = readStore($filePath);
    $initialCount = count($data);
    $data = array_values(array_filter($data, function ($item) use ($id) {
        return !isset($item['id']) || $item['id'] !== $id;
    }));

    if (count($data) < $initialCount) {
        writeStore($filePath, $data);
        echo json_encode(['success' => true, 'id' => $id, 'deleted' => true]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Item not found']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method Not Allowed']);
