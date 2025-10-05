<?php
require __DIR__ . '/config.php';
$pdo = db();

$pdo->exec("CREATE TABLE IF NOT EXISTS schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  driver VARCHAR(255) DEFAULT NULL,
  vehicle VARCHAR(128) DEFAULT NULL,
  date DATE DEFAULT NULL,
  origin VARCHAR(255) DEFAULT NULL,
  destination VARCHAR(255) DEFAULT NULL,
  rit VARCHAR(32) DEFAULT NULL,
  orderType VARCHAR(32) DEFAULT 'online',
  fare INT DEFAULT 0,
  status VARCHAR(32) DEFAULT 'nunggak',
  companyShare INT DEFAULT 0,
  paidCompanyAmount INT DEFAULT 0,
  notes TEXT DEFAULT NULL,
  payment_notes TEXT DEFAULT NULL,
  lastPaidAt DATETIME DEFAULT NULL,
  paidOffAt DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

try {
    $pdo->exec("ALTER TABLE schedules ADD COLUMN payment_notes TEXT DEFAULT NULL");
} catch (Throwable $e) { /* ignore */ }
try {
    $pdo->exec("ALTER TABLE schedules ADD COLUMN lastPaidAt DATETIME DEFAULT NULL");
} catch (Throwable $e) { /* ignore */ }
try {
    $pdo->exec("ALTER TABLE schedules ADD COLUMN paidOffAt DATETIME DEFAULT NULL");
} catch (Throwable $e) { /* ignore */ }

function transform_schedule_row($row) {
    if (!is_array($row)) {
        return $row;
    }
    if (array_key_exists('payment_notes', $row)) {
        $row['paymentNotes'] = $row['payment_notes'];
        unset($row['payment_notes']);
    }
    if (array_key_exists('last_paid_at', $row)) {
        $row['lastPaidAt'] = $row['last_paid_at'];
        unset($row['last_paid_at']);
    }
    if (array_key_exists('paid_off_at', $row)) {
        $row['paidOffAt'] = $row['paid_off_at'];
        unset($row['paid_off_at']);
    }
    return $row;
}

$m = $_SERVER['REQUEST_METHOD'];
if ($m === 'POST') {
    $override = strtoupper($_GET['_method'] ?? ($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] ?? ''));
    if (!$override) {
        $tmp = read_json();
        $override = strtoupper($tmp['_method'] ?? '');
    }
    if (in_array($override, ['PUT', 'PATCH', 'DELETE'])) {
        $m = $override;
    }
}

if ($m === 'GET') {
    $stmt = $pdo->query('SELECT * FROM schedules ORDER BY id DESC');
    $rows = $stmt->fetchAll();
    json_response(array_map('transform_schedule_row', $rows));
}

if ($m === 'POST') {
    $d = read_json();
    $stmt = $pdo->prepare('INSERT INTO schedules (driver, vehicle, date, origin, destination, rit, orderType, fare, status, companyShare, paidCompanyAmount, notes, payment_notes, lastPaidAt, paidOffAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
    $stmt->execute([
        $d['driver'] ?? null,
        $d['vehicle'] ?? null,
        $d['date'] ?? null,
        $d['origin'] ?? null,
        $d['destination'] ?? null,
        $d['rit'] ?? null,
        $d['orderType'] ?? 'online',
        $d['fare'] ?? 0,
        $d['status'] ?? 'nunggak',
        $d['companyShare'] ?? 0,
        $d['paidCompanyAmount'] ?? 0,
        $d['notes'] ?? null,
        $d['paymentNotes'] ?? null,
        $d['lastPaidAt'] ?? null,
        $d['paidOffAt'] ?? null
    ]);
    $id = $pdo->lastInsertId();
    $row = $pdo->query('SELECT * FROM schedules WHERE id='.(int)$id)->fetch();
    json_response(transform_schedule_row($row), 201);
}

if (in_array($m, ['PUT', 'PATCH'])) {
    $d = read_json();
    $id = (int)($_GET['id'] ?? $d['id'] ?? 0);
    if (!$id) {
        json_response(['error' => 'missing id'], 400);
    }
    $stmt = $pdo->prepare('UPDATE schedules SET driver=?, vehicle=?, date=?, origin=?, destination=?, rit=?, orderType=?, fare=?, status=?, companyShare=?, paidCompanyAmount=?, notes=?, payment_notes=?, lastPaidAt=?, paidOffAt=? WHERE id=?');
    $stmt->execute([
        $d['driver'] ?? null,
        $d['vehicle'] ?? null,
        $d['date'] ?? null,
        $d['origin'] ?? null,
        $d['destination'] ?? null,
        $d['rit'] ?? null,
        $d['orderType'] ?? 'online',
        $d['fare'] ?? 0,
        $d['status'] ?? 'nunggak',
        $d['companyShare'] ?? 0,
        $d['paidCompanyAmount'] ?? 0,
        $d['notes'] ?? null,
        $d['paymentNotes'] ?? null,
        $d['lastPaidAt'] ?? null,
        $d['paidOffAt'] ?? null,
        $id
    ]);
    $row = $pdo->query('SELECT * FROM schedules WHERE id='.(int)$id)->fetch();
    json_response(transform_schedule_row($row));
}

if ($m === 'DELETE') {
    $d = read_json();
    $id = (int)($_GET['id'] ?? $d['id'] ?? 0);
    if (!$id) {
        json_response(['error' => 'missing id'], 400);
    }
    $pdo->prepare('DELETE FROM schedules WHERE id=?')->execute([$id]);
    json_response(['ok' => true]);
}

json_response(['error' => 'method not allowed'], 405);
?>
