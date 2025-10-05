<?php
require __DIR__ . '/config.php';
$pdo = db();

$pdo->exec("CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle VARCHAR(128) DEFAULT NULL,
  driver VARCHAR(255) DEFAULT NULL,
  type VARCHAR(128) DEFAULT NULL,
  date DATE DEFAULT NULL,
  cost INT DEFAULT NULL,
  status VARCHAR(32) DEFAULT 'terjadwal',
  receipt LONGTEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

try { $pdo->exec("ALTER TABLE services ADD COLUMN receipt LONGTEXT DEFAULT NULL"); } catch (Throwable $e) { }

function request_payload() {
    static $payload = null;
    if ($payload !== null) {
        return $payload;
    }
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($contentType, 'multipart/form-data') !== false) {
        $payload = $_POST;
    } else {
        $payload = read_json();
    }
    return is_array($payload) ? $payload : [];
}


function store_service_receipt(array $file, ?string $existing = null) {
    if (!isset($file['error']) || $file['error'] === UPLOAD_ERR_NO_FILE) {
        return $existing;
    }
    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new RuntimeException('Upload kwitansi gagal.');
    }
    if (($file['size'] ?? 0) > 2 * 1024 * 1024) {
        throw new RuntimeException('Ukuran kwitansi maksimal 2MB.');
    }
    $allowed = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp',
        'application/pdf' => 'pdf'
    ];
    $tmpPath = $file['tmp_name'] ?? null;
    if (!$tmpPath || !is_uploaded_file($tmpPath)) {
        throw new RuntimeException('Berkas kwitansi tidak valid.');
    }
    $mime = null;
    if (function_exists('finfo_open')) {
        $f = @finfo_open(FILEINFO_MIME_TYPE);
        if ($f) {
            $mime = @finfo_file($f, $tmpPath);
            @finfo_close($f);
        }
    }
    if (!$mime && function_exists('mime_content_type')) {
        $mime = @mime_content_type($tmpPath);
    }
    if (!$mime || !isset($allowed[$mime])) {
        throw new RuntimeException('Format kwitansi tidak didukung.');
    }
    $ext = $allowed[$mime];
    $dir = dirname(__DIR__) . '/img/service-receipts';
    if (!is_dir($dir) && !@mkdir($dir, 0777, true) && !is_dir($dir)) {
        throw new RuntimeException('Folder penyimpanan kwitansi tidak tersedia.');
    }
    $filename = 'receipt_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    $target = $dir . '/' . $filename;
    if (!@move_uploaded_file($tmpPath, $target)) {
        throw new RuntimeException('Gagal menyimpan kwitansi.');
    }
    if ($existing) {
        $cleanExisting = ltrim(str_replace('\\', '/', $existing), '/');
        $existingPath = dirname(__DIR__) . '/' . $cleanExisting;
        $realDir = realpath($dir);
        $realExisting = (is_file($existingPath) ? realpath($existingPath) : false);
        if ($realDir && $realExisting && strpos($realExisting, $realDir) === 0) {
            @unlink($existingPath);
        }
    }
    return 'img/service-receipts/' . $filename;
}

$m = $_SERVER['REQUEST_METHOD'];
if ($m === 'POST') {
    $override = strtoupper($_POST['_method'] ?? $_GET['_method'] ?? ($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] ?? ''));
    if (!$override) {
        $tmp = request_payload();
        $override = strtoupper($tmp['_method'] ?? '');
    }
    if (in_array($override, ['PUT', 'PATCH', 'DELETE'])) {
        $m = $override;
    }
}

if ($m === 'GET') {
    $stmt = $pdo->query('SELECT * FROM services ORDER BY id DESC');
    json_response($stmt->fetchAll());
}

if ($m === 'POST') {
    $d = request_payload();
    $receiptPath = null;
    try {
        $receiptPath = store_service_receipt($_FILES['receipt'] ?? [], null);
    } catch (Throwable $e) {
        json_response(['error' => $e->getMessage()], 400);
    }
    if (!$receiptPath && !empty($d['receipt']) && is_string($d['receipt'])) {
        $receiptPath = $d['receipt'];
    }
    $stmt = $pdo->prepare('INSERT INTO services (vehicle, driver, type, date, cost, status, receipt) VALUES (?,?,?,?,?,?,?)');
    $stmt->execute([
        $d['vehicle'] ?? null,
        $d['driver'] ?? null,
        $d['type'] ?? null,
        $d['date'] ?? null,
        isset($d['cost']) ? (int)$d['cost'] : 0,
        $d['status'] ?? 'terjadwal',
        $receiptPath
    ]);
    $id = $pdo->lastInsertId();
    $row = $pdo->query('SELECT * FROM services WHERE id=' . (int)$id)->fetch();
    json_response($row, 201);
}

if (in_array($m, ['PUT', 'PATCH'])) {
    $d = request_payload();
    $id = (int)($_GET['id'] ?? $d['id'] ?? 0);
    if (!$id) {
        json_response(['error' => 'missing id'], 400);
    }

    $currentStmt = $pdo->prepare('SELECT * FROM services WHERE id=?');
    $currentStmt->execute([$id]);
    $current = $currentStmt->fetch();
    if (!$current) {
        json_response(['error' => 'not found'], 404);
    }

    $receiptPath = $current['receipt'] ?? null;
    try {
        $receiptPath = store_service_receipt($_FILES['receipt'] ?? [], $receiptPath);
    } catch (Throwable $e) {
        json_response(['error' => $e->getMessage()], 400);
    }
    if (array_key_exists('receipt', $d)) {
        if ($d['receipt']) {
            $receiptPath = $d['receipt'];
        } else {
            if (!empty($current['receipt'])) {
                $cleanExisting = ltrim(str_replace('\\', '/', $current['receipt']), '/');
                $existingFile = dirname(__DIR__) . '/' . $cleanExisting;
                $dir = dirname(__DIR__) . '/img/service-receipts';
                $realDir = realpath($dir);
                $realExisting = (is_file($existingFile) ? realpath($existingFile) : false);
                if ($realDir && $realExisting && strpos($realExisting, $realDir) === 0) {
                    @unlink($existingFile);
                }
            }
            $receiptPath = null;
        }
    }

    $stmt = $pdo->prepare('UPDATE services SET vehicle=?, driver=?, type=?, date=?, cost=?, status=?, receipt=? WHERE id=?');
    $stmt->execute([
        array_key_exists('vehicle', $d) ? $d['vehicle'] : ($current['vehicle'] ?? null),
        array_key_exists('driver', $d) ? $d['driver'] : ($current['driver'] ?? null),
        array_key_exists('type', $d) ? $d['type'] : ($current['type'] ?? null),
        array_key_exists('date', $d) ? $d['date'] : ($current['date'] ?? null),
        array_key_exists('cost', $d) ? (int)$d['cost'] : ($current['cost'] ?? 0),
        array_key_exists('status', $d) ? $d['status'] : ($current['status'] ?? 'terjadwal'),
        $receiptPath,
        $id
    ]);
    $row = $pdo->query('SELECT * FROM services WHERE id=' . (int)$id)->fetch();
    json_response($row);
}

if ($m === 'DELETE') {
    $d = request_payload();
    $id = (int)($_GET['id'] ?? $d['id'] ?? 0);
    if (!$id) {
        json_response(['error' => 'missing id'], 400);
    }
    $currentStmt = $pdo->prepare('SELECT receipt FROM services WHERE id=?');
    $currentStmt->execute([$id]);
    $current = $currentStmt->fetch();
    if ($current && !empty($current['receipt'])) {
        $cleanExisting = ltrim(str_replace('\\', '/', $current['receipt']), '/');
        $existingFile = dirname(__DIR__) . '/' . $cleanExisting;
        $dir = dirname(__DIR__) . '/img/service-receipts';
        $realDir = realpath($dir);
        $realExisting = (is_file($existingFile) ? realpath($existingFile) : false);
        if ($realDir && $realExisting && strpos($realExisting, $realDir) === 0) {
            @unlink($existingFile);
        }
    }
    $pdo->prepare('DELETE FROM services WHERE id=?')->execute([$id]);
    json_response(['ok' => true]);
}

json_response(['error' => 'method not allowed'], 405);
?>

