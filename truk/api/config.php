<?php
// Start output buffering to prevent "headers already sent" errors
ob_start();

// Basic DB config. Update credentials to match your environment.
// Automatically picks local vs hosting defaults but still honours DB_* environment variables when present.

// Ensure all date/time operations use Indonesia (WIB) timezone
date_default_timezone_set('Asia/Jakarta');

if (!function_exists('okekirim_normalize_datetime')) {
    function okekirim_normalize_datetime($value, string $format = 'Y-m-d H:i:s') {
        if ($value === null || $value === '') {
            return null;
        }
        $targetTz = new DateTimeZone('Asia/Jakarta');
        try {
            if ($value instanceof DateTimeInterface) {
                $dt = (new DateTimeImmutable('@' . $value->getTimestamp()))->setTimezone($targetTz);
            } elseif (is_numeric($value)) {
                $dt = (new DateTimeImmutable('@' . ((int)$value)))->setTimezone($targetTz);
            } else {
                $stringValue = trim((string)$value);
                if ($stringValue === '') {
                    return null;
                }
                $dt = new DateTimeImmutable($stringValue, $targetTz);
                if ($dt->getTimezone()->getName() !== $targetTz->getName()) {
                    $dt = $dt->setTimezone($targetTz);
                }
            }
            return $dt->format($format);
        } catch (Throwable $e) {
            if (is_string($value)) {
                $stringValue = trim($value);
                if ($stringValue === '') {
                    return null;
                }
                $stringValue = str_replace('T', ' ', $stringValue);
                $stringValue = preg_replace('/Z$/', '', $stringValue);
                try {
                    $dt = new DateTimeImmutable($stringValue, $targetTz);
                    return $dt->format($format);
                } catch (Throwable $ignored) {
                    return $stringValue;
                }
            }
            return null;
        }
    }
}

if (!function_exists('okekirim_env_value')) {
    function okekirim_env_value(string $key) {
        $candidates = [getenv($key)];
        if (isset($_SERVER[$key])) {
            $candidates[] = $_SERVER[$key];
        }
        if (isset($_ENV[$key])) {
            $candidates[] = $_ENV[$key];
        }
        foreach ($candidates as $candidate) {
            if ($candidate === false || $candidate === null) {
                continue;
            }
            if (is_string($candidate)) {
                $trimmed = trim($candidate);
                if ($trimmed === '') {
                    continue;
                }
                return $trimmed;
            }
            return $candidate;
        }
        return null;
    }
}

$hostHeader = isset($_SERVER['HTTP_HOST']) ? strtolower($_SERVER['HTTP_HOST']) : '';
if ($hostHeader !== '') {
    $hostHeader = preg_replace('/:\d+$/', '', $hostHeader);
}
$serverAddr = $_SERVER['SERVER_ADDR'] ?? '';
$remoteAddr = $_SERVER['REMOTE_ADDR'] ?? '';
$localPatterns = [
    '/^localhost$/',
    '/^127\.0\.0\.1$/',
    '/^::1$/',
    '/^192\.168\./',
    '/^10\./',
    '/^172\.(1[6-9]|2[0-9]|3[0-1])\./',
];

$runningLocally = PHP_SAPI === 'cli';
if (!$runningLocally) {
    foreach ([$hostHeader, strtolower($serverAddr), strtolower($remoteAddr)] as $candidate) {
        if (!$candidate) {
            continue;
        }
        foreach ($localPatterns as $pattern) {  
            if (preg_match($pattern, $candidate)) {
                $runningLocally = true;
                break 2;
            }
        }
    }
}

$localDefaults = [
    'DB_HOST' => getenv('DB_HOST') ?: 'localhost',
    'DB_PORT' => getenv('DB_PORT') ?: '26140',
    'DB_NAME' => getenv('DB_NAME') ?: 'okekirim',
    'DB_USER' => getenv('DB_USER') ?: 'root',
    'DB_PASS' => getenv('DB_PASS') ?: '',
];

$hostingDefaults = [
    'DB_HOST' => getenv('DB_HOST') ?: 'localhost',
    'DB_PORT' => getenv('DB_PORT') ?: '26140',
    'DB_NAME' => getenv('DB_NAME') ?: 'okekirim',
    'DB_USER' => getenv('DB_USER') ?: 'root',
    'DB_PASS' => getenv('DB_PASS') ?: '',
];

// Override DB_* env vars to customise connection without touching code.
$defaults = $runningLocally ? $localDefaults : $hostingDefaults;

foreach ($defaults as $key => $value) {
    if (defined($key)) {
        continue;
    }
    $env = okekirim_env_value($key);
    if ($env !== null) {
        define($key, $env);
    } else {
        define($key, $value);
    }
}

if (!defined('DB_PORT')) {
    define('DB_PORT', '26140');
}

function db() {
    static $pdo = null;
    if ($pdo) return $pdo;
    $port = defined('DB_PORT') ? DB_PORT : '26140';
    $dsn = 'mysql:host=' . DB_HOST . ';port=' . $port . ';dbname=' . DB_NAME . ';charset=utf8mb4';
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false,
    ];
    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        // Align MySQL session timezone with PHP default to keep stored timestamps consistent
        $pdo->exec("SET time_zone = '+07:00'");
    } catch (PDOException $e) {
        json_response(['error' => 'Database connection failed: ' . $e->getMessage()], 500);
    }
    return $pdo;
}

function json_response($data, $code = 200) {
    // Clean any previous output to prevent "headers already sent" errors
    if (ob_get_level()) {
        ob_end_clean();
    }
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function read_json(bool $preserveMethodKey = false) {
    static $decoded = null;
    if ($decoded === null) {
        $raw = file_get_contents('php://input');
        if (!$raw) {
            $decoded = [];
        } else {
            $data = json_decode($raw, true);
            $decoded = is_array($data) ? $data : [];
        }
    }
    if ($preserveMethodKey) {
        return $decoded;
    }
    if (!empty($decoded) && array_key_exists('_method', $decoded)) {
        $copy = $decoded;
        unset($copy['_method']);
        return $copy;
    }
    return $decoded;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    json_response(['ok' => true]);
}

// Build absolute base URL for links (e.g., reset password)
function base_url() {
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443);
    $scheme = $https ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? ('localhost');
    $scriptDir = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/')), '/');
    // We want the project root (go up from /api)
    if (substr($scriptDir, -4) === '/api') {
        $scriptDir = substr($scriptDir, 0, -4);
    }
    return $scheme . '://' . $host . ($scriptDir ?: '');
}

// Basic mail sender. Tries PHP mail() and logs to file if not configured.
function send_email($to, $subject, $html, $from = null) {
    // Email sending disabled by request. Only log for development.
    try {
        $dir = __DIR__ . '/_mail_log';
        if (!is_dir($dir)) @mkdir($dir, 0777, true);
        $fname = $dir . '/' . date('Ymd_His') . '_' . preg_replace('/[^a-z0-9_.-]+/i', '_', $to) . '.eml';
        $raw = "To: $to\r\nSubject: $subject\r\nContent-Type: text/html; charset=utf-8\r\n\r\n$html";
        @file_put_contents($fname, $raw);
    } catch (Throwable $e) { /* ignore */ }
    return true;
}
