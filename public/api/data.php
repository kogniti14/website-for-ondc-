<?php
/**
 * Kogniti Minds - Production PHP Data Persistence Dispatcher
 * Provides persistent data storage under data/storage/ for Apache/LiteSpeed hosting.
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

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
    'settings'
];

$collection = preg_replace('/[^a-zA-Z0-9_-]/', '', $_GET['collection'] ?? '');
if (empty($collection) || !in_array($collection, $allowedCollections)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid or missing collection parameter']);
    exit;
}

$dataDir = dirname(__DIR__, 2) . '/data/storage';
if (!file_exists($dataDir)) {
    @mkdir($dataDir, 0755, true);
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
    if ($id !== null) {
        if (is_array($data)) {
            foreach ($data as $item) {
                if (isset($item['id']) && $item['id'] === $id) {
                    echo json_encode($item);
                    exit;
                }
            }
        }
        http_response_code(404);
        echo json_encode(['error' => 'Item not found']);
        exit;
    }
    echo json_encode($data);
    exit;
}

$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true);

if ($method === 'POST') {
    $isBatch = isset($_GET['batch']) && $_GET['batch'] === 'true';
    $data = readStore($filePath);

    if ($isBatch && is_array($body)) {
        foreach ($body as $newItem) {
            $tid = $newItem['id'] ?? ('item_' . time() . '_' . mt_rand(100, 999));
            $found = false;
            foreach ($data as $idx => $existing) {
                if (isset($existing['id']) && $existing['id'] === $tid) {
                    $data[$idx] = array_merge($existing, $newItem, ['updatedAt' => date('c')]);
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $newItem['id'] = $tid;
                $newItem['createdAt'] = $newItem['createdAt'] ?? date('c');
                array_unshift($data, $newItem);
            }
        }
        writeStore($filePath, $data);
        echo json_encode(['success' => true, 'count' => count($body)]);
        exit;
    }

    if (empty($body) || !is_array($body)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON body']);
        exit;
    }

    $targetId = $body['id'] ?? ('item_' . time() . '_' . mt_rand(100, 999));
    $found = false;
    foreach ($data as $idx => $existing) {
        if (isset($existing['id']) && $existing['id'] === $targetId) {
            $data[$idx] = array_merge($existing, $body, ['updatedAt' => date('c')]);
            $found = true;
            break;
        }
    }
    if (!$found) {
        $body['id'] = $targetId;
        $body['createdAt'] = $body['createdAt'] ?? date('c');
        array_unshift($data, $body);
    }

    writeStore($filePath, $data);
    echo json_encode(['success' => true, 'item' => $body]);
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
        echo json_encode(['success' => true, 'id' => $id]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Item not found']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method Not Allowed']);
