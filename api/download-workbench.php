<?php
/**
 * Kogniti Minds - Production ONDC Workbench Download Endpoint
 * Serves ONDC Workbench compliance kit ZIP archive and individual Beckn schema scenario payloads.
 * Kogniti Minds Private Limited (ONDC:RETeB2B v1.2.5)
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$requested = trim($_GET['file'] ?? '');

$rootDir = realpath(__DIR__ . '/../..') ?: __DIR__ . '/../..';

// 1. Handle Full ZIP Kit Download
if ($requested === 'zip' || $requested === 'ondc-workbench-kit.zip' || empty($requested) && isset($_GET['kit'])) {
    $candidateZipPaths = [
        $rootDir . '/public/ondc-workbench-kit.zip',
        $rootDir . '/dist/ondc-workbench-kit.zip',
        $rootDir . '/ondc-workbench-kit.zip',
        __DIR__ . '/../ondc-workbench-kit.zip',
    ];

    $zipPath = null;
    foreach ($candidateZipPaths as $p) {
        if (file_exists($p) && is_readable($p) && filesize($p) > 1000) {
            $zipPath = $p;
            break;
        }
    }

    if (!$zipPath) {
        http_response_code(404);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'error' => 'ONDC Workbench ZIP package not found on server']);
        exit;
    }

    header('Content-Type: application/zip');
    header('Content-Disposition: attachment; filename="ondc-workbench-kit.zip"');
    header('Content-Length: ' . filesize($zipPath));
    header('Cache-Control: public, max-age=86400');
    header('Pragma: public');
    readfile($zipPath);
    exit;
}

// 2. Handle Individual Scenario JSON / Markdown Files
if (!empty($requested)) {
    $filename = basename($requested);
    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

    if (!in_array($ext, ['json', 'md'], true)) {
        http_response_code(400);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'error' => 'Invalid file requested']);
        exit;
    }

    $candidateDirs = [
        $rootDir . '/public/ondc-workbench',
        $rootDir . '/dist/ondc-workbench',
        $rootDir . '/ondc-workbench',
        __DIR__ . '/../ondc-workbench',
    ];

    $targetFile = null;
    foreach ($candidateDirs as $dir) {
        $p = $dir . '/' . $filename;
        if (file_exists($p) && is_readable($p)) {
            $targetFile = $p;
            break;
        }
    }

    if (!$targetFile) {
        http_response_code(404);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'error' => "Scenario file '$filename' not found"]);
        exit;
    }

    $mime = ($ext === 'json') ? 'application/json; charset=utf-8' : 'text/markdown; charset=utf-8';
    header('Content-Type: ' . $mime);
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Content-Length: ' . filesize($targetFile));
    header('Cache-Control: public, max-age=86400');
    header('Pragma: public');
    readfile($targetFile);
    exit;
}

// 3. Fallback: Directory Listing / Index
$scenarioFiles = [
    '01_on_search.json',
    '02_on_select.json',
    '03_on_init.json',
    '04_on_confirm.json',
    '05_on_status.json',
    '06_on_update_partial_return.json',
    '07_on_update_full_return.json',
    '08_on_cancel.json',
    '09_on_track.json',
    '10_on_support.json',
    'workbench_manifest.json',
    'README.md',
];

$candidateDirs = [
    $rootDir . '/public/ondc-workbench',
    $rootDir . '/dist/ondc-workbench',
    $rootDir . '/ondc-workbench',
    __DIR__ . '/../ondc-workbench',
    __DIR__ . '/../../ondc-workbench',
];

$files = [];
foreach ($scenarioFiles as $item) {
    $size = 0;
    foreach ($candidateDirs as $dir) {
        $p = $dir . '/' . $item;
        if (file_exists($p) && is_readable($p)) {
            $size = filesize($p);
            break;
        }
    }
    $files[] = [
        'filename' => $item,
        'sizeBytes' => $size,
        'downloadUrl' => '/ondc/download/workbench-file/' . $item,
    ];
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'success' => true,
    'totalFiles' => count($files),
    'files' => $files,
    'kitDownloadUrl' => '/ondc/download/workbench-kit',
    'kitDirectUrl' => '/ondc-workbench-kit.zip',
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
