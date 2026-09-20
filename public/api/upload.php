<?php
/**
 * Kogniti Minds - Production File Upload Dispatcher
 * Securely processes document and image uploads for Certificates, Gallery,
 * Products, and Site Media with collision-proof naming and cache-busting versioning.
 * Supports both multipart/form-data and JSON base64 payloads.
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Cache-Control: no-cache, no-store, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed. POST required.']);
    exit;
}

$maxSize = 15 * 1024 * 1024; // 15 MB
$allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/pjpeg',
    'image/png',
    'image/webp',
    'image/jpg',
];
$allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];

$folder = 'certificates';
$originalName = 'upload_' . time();
$fileBinary = null;
$mimeType = null;
$fileSize = 0;

if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
    // Mode A: Standard multipart/form-data upload
    $file = $_FILES['file'];
    $fileSize = $file['size'];

    if ($fileSize > $maxSize) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'File exceeds maximum permitted size of 15 MB.']);
        exit;
    }

    $originalName = basename($file['name']);
    $folder = preg_replace('/[^a-zA-Z0-9_-]/', '', $_POST['folder'] ?? ($_GET['folder'] ?? 'certificates'));
    $fileBinary = file_get_contents($file['tmp_name']);

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
} else {
    // Mode B: JSON payload with base64 data
    $rawInput = file_get_contents('php://input');
    $body = json_decode($rawInput, true);

    if ($body && (isset($body['base64']) || isset($body['fileData']))) {
        $dataStr = $body['base64'] ?? $body['fileData'];
        $folder = preg_replace('/[^a-zA-Z0-9_-]/', '', $body['folder'] ?? ($_GET['folder'] ?? 'certificates'));
        $originalName = basename($body['fileName'] ?? ('upload_' . time() . '.pdf'));

        // Handle data URL prefix (e.g. data:application/pdf;base64,...)
        if (preg_match('/^data:([^;]+);base64,(.*)$/s', $dataStr, $matches)) {
            $mimeType = $matches[1];
            $fileBinary = base64_decode($matches[2]);
        } else {
            $fileBinary = base64_decode($dataStr);
        }

        $fileSize = strlen($fileBinary);
        if ($fileSize > $maxSize) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'File exceeds maximum permitted size of 15 MB.']);
            exit;
        }

        if (!$mimeType) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_buffer($finfo, $fileBinary);
            finfo_close($finfo);
        }
    }
}

if (!$fileBinary) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No valid file or binary payload provided.']);
    exit;
}

$extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
if (!$extension) {
    if ($mimeType === 'application/pdf') $extension = 'pdf';
    elseif (strpos($mimeType, 'png') !== false) $extension = 'png';
    elseif (strpos($mimeType, 'webp') !== false) $extension = 'webp';
    else $extension = 'jpg';
}

if (!in_array(strtolower($mimeType), $allowedMimes) || !in_array($extension, $allowedExtensions)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid file format. Supported: PDF, JPG, JPEG, PNG, WEBP.',
        'detectedMime' => $mimeType,
        'detectedExt' => $extension,
    ]);
    exit;
}

if (empty($folder)) {
    $folder = 'certificates';
}

// Target directory under public/uploads/{folder}
$baseDir = dirname(__DIR__); // /public
$uploadDir = $baseDir . '/uploads/' . $folder;

if (!file_exists($uploadDir)) {
    @mkdir($uploadDir, 0755, true);
}

// Generate collision-safe filename with timestamp and random token
$timestamp = time();
$randomToken = bin2hex(random_bytes(4));
$cleanPrefix = preg_replace('/[^a-zA-Z0-9_-]/', '_', pathinfo($originalName, PATHINFO_FILENAME));
$cleanPrefix = substr($cleanPrefix, 0, 30);
$safeFileName = "{$folder}_{$cleanPrefix}_{$timestamp}_{$randomToken}.{$extension}";
$destination = $uploadDir . '/' . $safeFileName;

if (file_put_contents($destination, $fileBinary, LOCK_EX) === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to write uploaded file to persistent storage.']);
    exit;
}

// Public URL with cache-busting timestamp version query parameter
$publicUrl = "/uploads/{$folder}/{$safeFileName}?v={$timestamp}";

echo json_encode([
    'success' => true,
    'message' => 'File saved and registered successfully',
    'url' => $publicUrl,
    'fileUrl' => $publicUrl,
    'path' => "uploads/{$folder}/{$safeFileName}",
    'filePath' => "uploads/{$folder}/{$safeFileName}",
    'fileName' => $safeFileName,
    'fileType' => $mimeType,
    'size' => $fileSize,
    'version' => $timestamp,
]);
