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

function resolveServerEnvKey($key, &$source = null) {
    $keysToCheck = [
        $key,
        'REDIRECT_' . $key,
        'REDIRECT_REDIRECT_' . $key,
        'VITE_' . $key,
        'REDIRECT_VITE_' . $key,
        strtolower($key),
        strtoupper($key),
    ];

    // Check getenv()
    foreach ($keysToCheck as $k) {
        $val = getenv($k);
        if ($val !== false && trim($val) !== '') {
            $source = "getenv($k)";
            return trim($val);
        }
    }

    // Check $_ENV
    foreach ($keysToCheck as $k) {
        if (isset($_ENV[$k]) && trim((string)$_ENV[$k]) !== '') {
            $source = "\$_ENV[$k]";
            return trim((string)$_ENV[$k]);
        }
    }

    // Check $_SERVER
    foreach ($keysToCheck as $k) {
        if (isset($_SERVER[$k]) && trim((string)$_SERVER[$k]) !== '') {
            $source = "\$_SERVER[$k]";
            return trim((string)$_SERVER[$k]);
        }
    }

    // Check apache_getenv()
    if (function_exists('apache_getenv')) {
        foreach ($keysToCheck as $k) {
            $val = apache_getenv($k);
            if ($val !== false && !empty($val) && trim($val) !== '') {
                $source = "apache_getenv($k)";
                return trim($val);
            }
        }
    }

    // Substring search in $_SERVER and $_ENV
    foreach ([$_SERVER, $_ENV] as $idx => $arr) {
        $label = $idx === 0 ? '$_SERVER' : '$_ENV';
        foreach ($arr as $k => $v) {
            if (stripos($k, $key) !== false && is_string($v) && trim($v) !== '') {
                $source = "$label[$k]";
                return trim($v);
            }
        }
    }

    // Comprehensive Filesystem Check
    $docRoot = isset($_SERVER['DOCUMENT_ROOT']) ? rtrim($_SERVER['DOCUMENT_ROOT'], '/') : '';
    $scriptDir = __DIR__;
    $userHome = '';
    if (!empty($_SERVER['HOME'])) {
        $userHome = rtrim($_SERVER['HOME'], '/');
    } elseif (function_exists('get_current_user')) {
        $u = get_current_user();
        if (!empty($u)) {
            $userHome = '/home/' . $u;
        }
    }

    $baseDirs = array_unique(array_filter([
        $docRoot,
        $docRoot ? dirname($docRoot) : null,
        $docRoot ? dirname(dirname($docRoot)) : null,
        $scriptDir,
        dirname($scriptDir),
        dirname(dirname($scriptDir)),
        dirname(dirname(dirname($scriptDir))),
        $userHome,
        $userHome ? $userHome . '/public_html' : null,
        $userHome ? $userHome . '/domains/kognitiminds.com' : null,
        $userHome ? $userHome . '/domains/kognitiminds.com/public_html' : null,
    ]));

    $fileNames = ['.env', '.env.production', '.env.local', 'data/.env', 'data/storage/.env', 'public/.env'];
    $targetKeyPatterns = [
        $key,
        'VITE_' . $key,
        strtolower($key),
    ];

    foreach ($baseDirs as $dir) {
        if (!is_dir($dir)) continue;
        foreach ($fileNames as $fn) {
            $filePath = $dir . '/' . $fn;
            if (file_exists($filePath) && is_readable($filePath)) {
                $lines = @file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                if ($lines !== false) {
                    foreach ($lines as $line) {
                        $line = preg_replace('/^\xEF\xBB\xBF/', '', trim($line));
                        if (empty($line) || strpos($line, '#') === 0) continue;
                        if (strpos($line, '=') !== false) {
                            list($varName, $varValue) = explode('=', $line, 2);
                            $varName = trim($varName);
                            $varValue = trim($varValue, " \t\n\r\0\x0B\"'");
                            foreach ($targetKeyPatterns as $tp) {
                                if ($varName === $tp && !empty($varValue)) {
                                    $source = "file: $filePath ($varName)";
                                    return $varValue;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    return '';
}

$keySource = '';
$apiKey = resolveServerEnvKey('RESEND_API_KEY', $keySource);

// Safe Diagnostic Health Check (GET /api/send-email.php or GET /api/auth/send-otp)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    http_response_code(200);
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

$resendCheck = !empty($apiKey);
error_log("[OTP_DIAGNOSTIC] RESEND_RUNTIME_CHECK=" . ($resendCheck ? 'true' : 'false'));
error_log("[OTP_DIAGNOSTIC] NODE_ENV=" . (getenv('NODE_ENV') ?: ($_ENV['NODE_ENV'] ?? 'undefined')));
error_log("[OTP_DIAGNOSTIC] cwd=" . getcwd());
error_log("[OTP_DIAGNOSTIC] entry=send-email.php");

if (empty($apiKey)) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server configuration error: RESEND_API_KEY is not configured on the production server.',
        'runtime' => 'php_litespeed',
        'entry' => 'send-email.php',
        'cwd' => getcwd(),
        'resend_runtime_check' => false
    ]);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true) ?: [];

$to = $data['to'] ?? ($data['email'] ?? ($data['recipient'] ?? []));
if (is_string($to)) {
    $to = [$to];
}

if (empty($to) || !is_array($to) || empty($to[0])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Recipient email is required']);
    exit;
}

$subject = $data['subject'] ?? 'Kogniti Minds Verification Code';
$html = $data['html'] ?? '';
$text = $data['text'] ?? '';

$rawFrom = resolveServerEnvKey('EMAIL_FROM') ?: 'Kogniti Minds Security <security@kognitiminds.com>';
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
        ? '<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">' .
          '<h2 style="color:#0f172a;margin-top:0;">Kogniti Minds Security</h2>' .
          '<p style="color:#475569;font-size:15px;">Your one-time verification code is:</p>' .
          '<div style="background:#f8fafc;border:1px solid #cbd5e1;padding:16px;text-align:center;border-radius:8px;font-size:28px;font-weight:bold;letter-spacing:6px;color:#0f172a;margin:16px 0;">' . $otpVal . '</div>' .
          '<p style="color:#64748b;font-size:13px;">This code expires in 10 minutes. If you did not request this, please disregard this message.</p>' .
          '</div>'
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
