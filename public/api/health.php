<?php
/**
 * Kogniti Minds - Production Health Check API
 * Serves GET /api/health directly under LiteSpeed / Apache PHP.
 * Never exposes secrets, passwords, or raw keys.
 */

error_reporting(0);
ini_set('display_errors', '0');

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
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

$resendSource = '';
$resendVal = resolveServerEnvKey('RESEND_API_KEY', $resendSource);
$hasResend = !empty($resendVal);

$razorpaySource = '';
$razorpayVal = resolveServerEnvKey('RAZORPAY_KEY_ID', $razorpaySource);
$hasRazorpay = !empty($razorpayVal);

// Gather safe diagnostics (keys only, NEVER values)
$matchingServerKeys = [];
foreach (array_merge(array_keys($_SERVER), array_keys($_ENV)) as $k) {
    if (stripos($k, 'RESEND') !== false || stripos($k, 'RAZORPAY') !== false) {
        $matchingServerKeys[] = $k;
    }
}
$matchingServerKeys = array_values(array_unique($matchingServerKeys));

$dataDir = dirname(__DIR__) . '/data/storage';
$storageWritable = is_dir($dataDir) ? is_writable($dataDir) : is_writable(dirname(__DIR__));

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

// Check if local Node.js port 3000 is listening
$fp3000 = @fsockopen('127.0.0.1', 3000, $errno3000, $errstr3000, 0.2);
$nodePort3000Running = is_resource($fp3000);
if ($nodePort3000Running) {
    fclose($fp3000);
}

// Check node version from system
$nodeVersion = 'disabled';
if (function_exists('exec')) {
    $outNode = [];
    @exec('node -v 2>&1', $outNode);
    $nodeVersion = !empty($outNode) ? implode(' ', $outNode) : 'none';
}

http_response_code(200);
echo json_encode([
    'status' => 'ok',
    'timestamp' => date('c'),
    'environment' => 'production',
    'services' => [
        'server' => 'running',
        'php_version' => PHP_VERSION,
        'node_daemon_port_3000' => $nodePort3000Running ? 'listening' : 'not_running',
        'node_system_version' => $nodeVersion,
        'email' => [
            'configured' => $hasResend,
            'source' => $resendSource ?: 'not_found',
            'provider' => 'Resend Server Dispatcher',
        ],
        'payment' => [
            'configured' => $hasRazorpay,
            'source' => $razorpaySource ?: 'not_found',
            'provider' => 'Razorpay',
        ],
        'storage' => [
            'status' => $storageWritable ? 'active' : 'read-only',
            'counts' => $counts,
        ],
        'diagnostics' => [
            'detected_env_keys' => $matchingServerKeys,
            'doc_root' => $docRoot,
            'script_dir' => __DIR__,
            'parent_dir' => dirname(__DIR__),
            'parent_files' => array_values(@scandir(dirname(__DIR__)) ?: []),
            'domain_files' => array_values(@scandir(dirname(dirname(__DIR__))) ?: []),
            'dist_files' => is_dir(dirname(__DIR__) . '/dist') ? array_values(@scandir(dirname(__DIR__) . '/dist') ?: []) : null,
            'assets_files' => is_dir(dirname(__DIR__) . '/assets') ? array_values(@scandir(dirname(__DIR__) . '/assets') ?: []) : null,
            'root_dotfiles' => array_values(array_filter(@scandir(dirname(__DIR__)) ?: [], fn($f) => str_starts_with($f, '.'))),
            'domain_dotfiles' => array_values(array_filter(@scandir(dirname(dirname(__DIR__))) ?: [], fn($f) => str_starts_with($f, '.'))),
            'home_dotfiles' => array_values(array_filter(@scandir(dirname(dirname(dirname(__DIR__)))) ?: [], fn($f) => str_starts_with($f, '.'))),
            'home_dir' => dirname(dirname(dirname(__DIR__))),
            'php_sapi' => php_sapi_name(),
            'variables_order' => ini_get('variables_order'),
            'all_server_keys' => array_keys($_SERVER),
            'getenv_keys' => array_keys(getenv()),
        ],
    ]
], JSON_PRETTY_PRINT);
