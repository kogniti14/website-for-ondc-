<?php
/**
 * Kogniti Minds - Production Transactional Email Dispatcher
 * Dispatches OTP and transactional emails via Resend API using server-side cURL.
 */

// Handle CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true) ?: [];

$to = $data['to'] ?? [];
if (is_string($to)) {
    $to = [$to];
}

if (empty($to)) {
    http_response_code(400);
    echo json_encode(['error' => 'Recipient email is required']);
    exit;
}

$subject = $data['subject'] ?? 'Kogniti Minds Verification Code';
// Helper to read env variables from server environment or local .env file
function getEnvValue($key) {
    $val = getenv($key);
    if (!empty($val)) return trim($val);
    if (isset($_ENV[$key]) && !empty($_ENV[$key])) return trim($_ENV[$key]);
    if (isset($_SERVER[$key]) && !empty($_SERVER[$key])) return trim($_SERVER[$key]);

    // Check .env file in parent directories
    $possiblePaths = [
        dirname(__DIR__, 2) . '/.env',
        dirname(__DIR__, 2) . '/.env.local',
        dirname(__DIR__) . '/.env'
    ];
    foreach ($possiblePaths as $envPath) {
        if (file_exists($envPath) && is_readable($envPath)) {
            $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
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
    return '';
}

$apiKey = getEnvValue('RESEND_API_KEY') ?: getEnvValue('VITE_RESEND_API_KEY');
if (empty($apiKey)) {
    http_response_code(500);
    echo json_encode(['error' => 'Server configuration error: RESEND_API_KEY not found in environment.']);
    exit;
}

$rawFrom = getEnvValue('EMAIL_FROM') ?: getEnvValue('VITE_EMAIL_FROM') ?: 'Kogniti Minds Security <security@kognitiminds.com>';
$from = (strpos($rawFrom, 'resend.dev') === false && strpos($rawFrom, 'example.com') === false)
    ? $rawFrom
    : 'Kogniti Minds Security <security@kognitiminds.com>';

$payload = [
    'from' => $from,
    'to' => $to,
    'subject' => $subject,
    'html' => $html
];

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
        'error' => 'cURL dispatch failed: ' . $curlError
    ]);
    exit;
}

http_response_code($httpCode ?: 200);
echo $response;
