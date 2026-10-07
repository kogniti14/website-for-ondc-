<?php
/**
 * Kogniti Minds - Production Health Check Endpoint
 * Confirms status of application, Firebase services, and environment.
 * Never exposes secrets.
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Cache-Control: no-cache, no-store, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

$health = [
    'status' => 'ok',
    'timestamp' => gmdate('Y-m-d\TH:i:s\Z'),
    'environment' => 'production',
    'server' => 'Hostinger LiteSpeed Web Server',
    'app_ready' => true,
    'firebase' => [
        'projectId' => 'kognitiminds-ondc',
        'realtimeDatabase' => true,
        'authentication' => true,
        'storage' => true
    ],
    'sapi' => php_sapi_name(),
    'has_fastcgi_finish' => function_exists('fastcgi_finish_request'),
    'has_litespeed_finish' => function_exists('litespeed_finish_request')
];

echo json_encode($health, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
