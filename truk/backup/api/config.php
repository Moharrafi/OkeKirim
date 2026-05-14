<?php
// Basic DB config. Update credentials to match your XAMPP MySQL.
// Default tries env first, then sensible local defaults.

define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'okekirim');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');

// define('DB_HOST', getenv('DB_HOST') ?: 'sql206.infinityfree.com');
// define('DB_NAME', getenv('DB_NAME') ?: 'if0_36220999_okekirim');
// define('DB_USER', getenv('DB_USER') ?: 'if0_36220999');
// define('DB_PASS', getenv('DB_PASS') ?: 'Cirumput1');

function db() {
    static $pdo = null;
    if ($pdo) return $pdo;
    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ];
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    return $pdo;
}

function json_response($data, $code = 200) {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function read_json() {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
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
