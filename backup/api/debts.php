<?php
require __DIR__ . '/config.php';
$pdo = db();

$pdo->exec("CREATE TABLE IF NOT EXISTS debts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  driver VARCHAR(255) DEFAULT NULL,
  vehicle VARCHAR(128) DEFAULT NULL,
  type VARCHAR(64) DEFAULT 'kasbon',
  amount INT DEFAULT 0,
  date DATE DEFAULT NULL,
  dueDate DATE DEFAULT NULL,
  status VARCHAR(32) DEFAULT 'belum_lunas',
  paidAmount INT DEFAULT 0,
  lastPaidAt DATETIME DEFAULT NULL,
  paidOffAt DATETIME DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$pdo->exec("CREATE TABLE IF NOT EXISTS debt_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  debt_id INT NOT NULL,
  driver VARCHAR(255) DEFAULT NULL,
  amount INT NOT NULL DEFAULT 0,
  paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_debt_payments_debt FOREIGN KEY (debt_id) REFERENCES debts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

function transform_debt_row($row) {
    if (!is_array($row)) {
        return $row;
    }
    if (array_key_exists('created_at', $row)) {
        $row['createdAt'] = $row['created_at'];
        unset($row['created_at']);
    }
    $row['amount'] = isset($row['amount']) ? (int)$row['amount'] : 0;
    $row['paidAmount'] = isset($row['paidAmount']) ? (int)$row['paidAmount'] : (isset($row['paid_amount']) ? (int)$row['paid_amount'] : 0);
    if (isset($row['paid_amount'])) {
        unset($row['paid_amount']);
    }
    if (array_key_exists('due_date', $row)) {
        $row['dueDate'] = $row['due_date'];
        unset($row['due_date']);
    }
    if (array_key_exists('last_paid_at', $row)) {
        $row['lastPaidAt'] = $row['last_paid_at'];
        unset($row['last_paid_at']);
    }
    if (array_key_exists('paid_off_at', $row)) {
        $row['paidOffAt'] = $row['paid_off_at'];
        unset($row['paid_off_at']);
    }
    if (array_key_exists('last_payment_note', $row)) {
        $row['lastPaymentNotes'] = $row['last_payment_note'];
        unset($row['last_payment_note']);
    }
    if (array_key_exists('last_payment_amount', $row)) {
        $row['lastPaymentAmount'] = (int)$row['last_payment_amount'];
        unset($row['last_payment_amount']);
    }
    return $row;
}

function fetch_debt_with_meta(PDO $pdo, int $id) {
    $stmt = $pdo->prepare('SELECT d.*, (
            SELECT notes FROM debt_payments WHERE debt_id = d.id ORDER BY paid_at DESC, id DESC LIMIT 1
        ) AS last_payment_note, (
            SELECT amount FROM debt_payments WHERE debt_id = d.id ORDER BY paid_at DESC, id DESC LIMIT 1
        ) AS last_payment_amount
        FROM debts d WHERE d.id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ? transform_debt_row($row) : null;
}

function list_debts_with_meta(PDO $pdo) {
    $stmt = $pdo->query('SELECT d.*, (
            SELECT notes FROM debt_payments WHERE debt_id = d.id ORDER BY paid_at DESC, id DESC LIMIT 1
        ) AS last_payment_note, (
            SELECT amount FROM debt_payments WHERE debt_id = d.id ORDER BY paid_at DESC, id DESC LIMIT 1
        ) AS last_payment_amount
        FROM debts d ORDER BY date DESC, id DESC');
    $rows = $stmt->fetchAll();
    return array_map('transform_debt_row', $rows);
}

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST') {
    $override = strtoupper($_GET['_method'] ?? ($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] ?? ''));
    if (!$override) {
        $tmp = read_json();
        $override = strtoupper($tmp['_method'] ?? '');
    }
    if (in_array($override, ['PUT', 'PATCH', 'DELETE'])) {
        $method = $override;
    }
}

if ($method === 'GET') {
    if (isset($_GET['id'])) {
        $stmt = $pdo->prepare('SELECT * FROM debts WHERE id=?');
        $stmt->execute([(int)$_GET['id']]);
        $row = $stmt->fetch();
        if (!$row) {
            json_response(['error' => 'not found'], 404);
        }
        json_response(transform_debt_row($row));
    }
    $stmt = $pdo->query('SELECT * FROM debts ORDER BY date DESC, id DESC');
    $rows = $stmt->fetchAll();
    json_response(array_map('transform_debt_row', $rows));
}

if ($method === 'POST') {
    $d = read_json();
    $amount = isset($d['amount']) ? (int)$d['amount'] : 0;
    $paidAmount = isset($d['paidAmount']) ? (int)$d['paidAmount'] : 0;
    $status = $d['status'] ?? ($paidAmount >= $amount && $amount > 0 ? 'lunas' : 'belum_lunas');
    $stmt = $pdo->prepare('INSERT INTO debts (driver, vehicle, type, amount, date, dueDate, status, paidAmount, lastPaidAt, paidOffAt, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
    $stmt->execute([
        $d['driver'] ?? null,
        $d['vehicle'] ?? null,
        $d['type'] ?? 'hutang',
        $amount,
        $d['date'] ?? null,
        $d['dueDate'] ?? null,
        $status,
        $paidAmount,
        $d['lastPaidAt'] ?? null,
        $d['paidOffAt'] ?? null,
        $d['notes'] ?? null
    ]);
    $id = $pdo->lastInsertId();
    $row = $pdo->query('SELECT * FROM debts WHERE id='.(int)$id)->fetch();
    json_response(transform_debt_row($row), 201);
}

if (in_array($method, ['PUT', 'PATCH'])) {
    $d = read_json();
    $id = (int)($_GET['id'] ?? $d['id'] ?? 0);
    if (!$id) {
        json_response(['error' => 'missing id'], 400);
    }
    $currentStmt = $pdo->prepare('SELECT * FROM debts WHERE id=?');
    $currentStmt->execute([$id]);
    $current = $currentStmt->fetch();
    if (!$current) {
        json_response(['error' => 'not found'], 404);
    }
    $amount = array_key_exists('amount', $d) ? (int)$d['amount'] : (int)$current['amount'];
    $paidAmount = array_key_exists('paidAmount', $d) ? (int)$d['paidAmount'] : (int)($current['paidAmount'] ?? $current['paid_amount'] ?? 0);
    $status = $d['status'] ?? ($paidAmount >= $amount && $amount > 0 ? 'lunas' : $current['status']);
    $lastPaidAt = $d['lastPaidAt'] ?? ($current['lastPaidAt'] ?? $current['last_paid_at'] ?? null);
    $paidOffAt = $d['paidOffAt'] ?? ($current['paidOffAt'] ?? $current['paid_off_at'] ?? null);
    if ($status === 'lunas' && !$paidOffAt && $paidAmount >= $amount && $amount > 0) {
        $paidOffAt = date('Y-m-d H:i:s');
    }
    if ($status !== 'lunas') {
        $paidOffAt = null;
    }
    $stmt = $pdo->prepare('UPDATE debts SET driver=?, vehicle=?, type=?, amount=?, date=?, dueDate=?, status=?, paidAmount=?, lastPaidAt=?, paidOffAt=?, notes=? WHERE id=?');
    $stmt->execute([
        $d['driver'] ?? $current['driver'],
        array_key_exists('vehicle', $d) ? $d['vehicle'] : $current['vehicle'],
        $d['type'] ?? $current['type'],
        $amount,
        $d['date'] ?? $current['date'],
        array_key_exists('dueDate', $d) ? $d['dueDate'] : ($current['dueDate'] ?? $current['due_date'] ?? null),
        $status,
        $paidAmount,
        $lastPaidAt,
        $paidOffAt,
        array_key_exists('notes', $d) ? $d['notes'] : $current['notes'],
        $id
    ]);

    $paymentNote = '';
    if (array_key_exists('paymentNote', $d)) {
        $paymentNote = trim((string)$d['paymentNote']);
    }
    $paymentAmount = array_key_exists('paymentAmount', $d) ? (int)$d['paymentAmount'] : null;
    $shouldLogPayment = ($paymentNote !== '') || ($paymentAmount !== null && $paymentAmount > 0);

    if ($shouldLogPayment) {
        $amountValue = $paymentAmount !== null ? max(0, $paymentAmount) : 0;
        $paidAtValue = $paymentAmount !== null && $paymentAmount > 0
            ? ($d['lastPaidAt'] ?? date('Y-m-d H:i:s'))
            : date('Y-m-d H:i:s');

        $payStmt = $pdo->prepare('INSERT INTO debt_payments (debt_id, driver, amount, paid_at, notes) VALUES (?,?,?,?,?)');
        $payStmt->execute([
            $id,
            $d['driver'] ?? $current['driver'] ?? null,
            $amountValue,
            $paidAtValue,
            $paymentNote !== '' ? $paymentNote : null
        ]);
    }

    $row = fetch_debt_with_meta($pdo, $id);
    if (!$row) {
        $row = transform_debt_row($pdo->query('SELECT * FROM debts WHERE id=' . (int)$id)->fetch());
    }
    json_response($row);
}

if ($method === 'DELETE') {
    $d = read_json();
    $id = (int)($_GET['id'] ?? $d['id'] ?? 0);
    if (!$id) {
        json_response(['error' => 'missing id'], 400);
    }
    $stmt = $pdo->prepare('DELETE FROM debts WHERE id=?');
    $stmt->execute([$id]);
    json_response(['ok' => true]);
}

json_response(['error' => 'method not allowed'], 405);
?>
