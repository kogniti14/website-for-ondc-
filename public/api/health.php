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
    'server_ip' => $_SERVER['SERVER_ADDR'] ?? 'unknown',
    'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? '',
    'script_filename' => $_SERVER['SCRIPT_FILENAME'] ?? '',
    'git_commit' => 'fcc5866',
    'dist_exists' => file_exists(dirname(__DIR__, 2) . '/dist/index.html'),
    'index_exists' => file_exists(dirname(__DIR__, 2) . '/index.html'),
    'docroot_dist_exists' => file_exists(($_SERVER['DOCUMENT_ROOT'] ?? '') . '/dist/index.html'),
    'firebase' => [
        'projectId' => 'kognitiminds-ondc',
        'realtimeDatabase' => true,
        'authentication' => true,
        'storage' => true
    ]
];

echo json_encode($health, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
