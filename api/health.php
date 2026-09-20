<?php
/**
 * Kogniti Minds - Production Health Check API
 * Serves GET /api/health directly under LiteSpeed / Apache PHP.
 * Never exposes secrets, passwords, or raw keys.
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

function checkEnvKey($key) {
    $val = getenv($key);
    if (!empty($val)) return true;
    if (isset($_ENV[$key]) && !empty($_ENV[$key])) return true;
    if (isset($_SERVER[$key]) && !empty($_SERVER[$key])) return true;
    if (function_exists('apache_getenv')) {
        $a = apache_getenv($key);
        if (!empty($a)) return true;
    }

    $docRoot = isset($_SERVER['DOCUMENT_ROOT']) ? rtrim($_SERVER['DOCUMENT_ROOT'], '/') : '';
    $possiblePaths = array_filter([
        $docRoot ? $docRoot . '/.env' : null,
        $docRoot ? dirname($docRoot) . '/.env' : null,
        dirname(__DIR__, 2) . '/.env',
        dirname(__DIR__) . '/.env',
        __DIR__ . '/.env',
        dirname(__DIR__, 2) . '/data/.env',
    ]);

    foreach ($possiblePaths as $envPath) {
        if (file_exists($envPath) && is_readable($envPath)) {
            $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            if ($lines !== false) {
                foreach ($lines as $line) {
                    $line = trim($line);
                    if (empty($line) || strpos($line, '#') === 0) continue;
                    if (strpos($line, '=') !== false) {
                        list($name, $value) = explode('=', $line, 2);
                        if (trim($name) === $key && !empty(trim($value, " \t\n\r\0\x0B\"'"))) {
                            return true;
                        }
                    }
                }
            }
        }
    }
    return false;
}

$hasResend = checkEnvKey('RESEND_API_KEY');
$hasRazorpay = checkEnvKey('RAZORPAY_KEY_ID');

$dataDir = dirname(__DIR__, 2) . '/data/storage';
$storageWritable = is_dir($dataDir) ? is_writable($dataDir) : is_writable(dirname(__DIR__, 2));

$collections = ['products', 'categories', 'b2c_users', 'b2b_businesses', 'b2c_orders'];
$counts = [];
foreach ($collections as $col) {
    $fp = $dataDir . '/' . $col . '.json';
    if (file_exists($fp)) {
        $arr = json_decode(file_get_contents($fp), true);
        $counts[$col] = is_array($arr) ? count($arr) : 0;
    } else {
        $counts[$col] = 0;
    }
}

http_response_code(200);
echo json_encode([
    'status' => 'ok',
    'timestamp' => date('c'),
    'environment' => 'production',
    'services' => [
        'server' => 'running',
        'php_version' => PHP_VERSION,
        'email' => [
            'configured' => $hasResend,
            'provider' => 'Resend Server Dispatcher'
        ],
        'payment' => [
            'configured' => $hasRazorpay,
            'provider' => 'Razorpay'
        ],
        'storage' => [
            'status' => $storageWritable ? 'active' : 'read-only',
            'counts' => $counts
        ]
    ]
], JSON_PRETTY_PRINT);
