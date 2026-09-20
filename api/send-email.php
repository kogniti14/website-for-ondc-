<?php
/**
 * Kogniti Minds - Production Server-Side Resend Email Dispatcher
 * Securely uses RESEND_API_KEY from Hostinger server environment or server-side .env file.
 * Never accepts secret keys from client headers or frontend requests.
 */

// Handle CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

// Helper to read env variables from server environment or server-side .env file
function getEnvValue($key) {
    $val = getenv($key);
    if (!empty($val)) return trim($val);
    if (isset($_ENV[$key]) && !empty($_ENV[$key])) return trim($_ENV[$key]);
    if (isset($_SERVER[$key]) && !empty($_SERVER[$key])) return trim($_SERVER[$key]);
    if (function_exists('apache_getenv')) {
        $a = apache_getenv($key);
        if (!empty($a)) return trim($a);
    }

    // Check .env files in server filesystem paths
    $docRoot = isset($_SERVER['DOCUMENT_ROOT']) ? rtrim($_SERVER['DOCUMENT_ROOT'], '/') : '';
    $possiblePaths = array_filter([
        $docRoot ? $docRoot . '/.env' : null,
        $docRoot ? dirname($docRoot) . '/.env' : null,
        $docRoot ? $docRoot . '/.env.production' : null,
        dirname(__DIR__, 2) . '/.env',
        dirname(__DIR__) . '/.env',
        __DIR__ . '/.env',
        dirname(__DIR__, 3) . '/.env',
        dirname(__DIR__, 2) . '/.env.local',
        dirname(__DIR__, 2) . '/.env.production',
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
                        $name = trim($name);
                        $value = trim($value, " \t\n\r\0\x0B\"'");
                        if ($name === $key) {
                            return $value;
                        }
                    }
                }
            }
        }
    }
    return '';
}

$apiKey = getEnvValue('RESEND_API_KEY');

// Safe Diagnostic Health Check (GET /api/send-email.php)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'status' => 'healthy',
        'resendConfigured' => !empty($apiKey),
        'timestamp' => date('c')
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

if (empty($apiKey)) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server configuration error: RESEND_API_KEY is not configured on the production server.'
    ]);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true) ?: [];

$to = $data['to'] ?? ($data['email'] ?? []);
if (is_string($to)) {
    $to = [$to];
}

if (empty($to)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Recipient email is required']);
    exit;
}

$subject = $data['subject'] ?? 'Kogniti Minds Verification Code';
$html = $data['html'] ?? '';
$text = $data['text'] ?? '';

$rawFrom = getEnvValue('EMAIL_FROM') ?: 'Kogniti Minds Security <security@kognitiminds.com>';
$from = (strpos($rawFrom, 'resend.dev') === false && strpos($rawFrom, 'example.com') === false)
    ? $rawFrom
    : 'Kogniti Minds Security <security@kognitiminds.com>';

$payload = [
    'from' => $from,
    'to' => $to,
    'subject' => $subject,
];
if (!empty($html)) {
    $payload['html'] = $html;
}
if (!empty($text)) {
    $payload['text'] = $text;
}
if (empty($html) && empty($text)) {
    $otpVal = isset($data['otp']) ? htmlspecialchars($data['otp']) : '';
    $payload['html'] = $otpVal
        ? '<p>Your verification code is: <strong>' . $otpVal . '</strong></p>'
        : '<p>' . htmlspecialchars($subject) . '</p>';
}

$ch = curl_init('https://api.resend.com/emails');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . trim($apiKey),
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($response === false || !empty($curlError)) {
    http_response_code(502);
    echo json_encode([
        'success' => false,
        'error' => 'cURL dispatch failed: ' . $curlError
    ]);
    exit;
}

if ($httpCode >= 200 && $httpCode < 300) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'OTP sent successfully'
    ]);
    exit;
}

http_response_code($httpCode ?: 500);
$resData = json_decode($response, true) ?: [];
$errMsg = $resData['message'] ?? ($resData['error'] ?? 'Email dispatch failed');
echo json_encode([
    'success' => false,
    'error' => $errMsg
]);
