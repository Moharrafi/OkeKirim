<?php
require __DIR__ . '/config.php';
$pdo = db();

// Ensure table
$pdo->exec("CREATE TABLE IF NOT EXISTS drivers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(64) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  vehicle VARCHAR(128) DEFAULT NULL,
  vehicleType VARCHAR(64) DEFAULT NULL,
  vehicleYear VARCHAR(16) DEFAULT NULL,
  status VARCHAR(32) DEFAULT 'aktif',
  joinDate DATE DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$method = $_SERVER['REQUEST_METHOD'];
// Method override support for hosts that block PUT/DELETE
if ($method === 'POST') {
    $override = strtoupper($_GET['_method'] ?? ($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] ?? ''));
    if (!$override) {
        $tmp = read_json();
        $override = strtoupper($tmp['_method'] ?? '');
    }
    if (in_array($override, ['PUT','PATCH','DELETE'])) {
        $method = $override;
        // Re-expose decoded body as $d in update/delete blocks via read_json()
    }
}

if ($method === 'GET') {
    $stmt = $pdo->query('SELECT * FROM drivers ORDER BY id DESC');
    json_response($stmt->fetchAll());
}

if ($method === 'POST') {
    $d = read_json();
    $stmt = $pdo->prepare('INSERT INTO drivers (name, phone, email, address, vehicle, vehicleType, vehicleYear, status, joinDate) VALUES (?,?,?,?,?,?,?,?,?)');
    $stmt->execute([
        $d['name'] ?? '', $d['phone'] ?? null, $d['email'] ?? null, $d['address'] ?? null,
        $d['vehicle'] ?? null, $d['vehicleType'] ?? null, $d['vehicleYear'] ?? null,
        $d['status'] ?? 'aktif', $d['joinDate'] ?? null
    ]);
    $id = $pdo->lastInsertId();
    $row = $pdo->query('SELECT * FROM drivers WHERE id='.(int)$id)->fetch();
    json_response($row, 201);
}

if (in_array($method, ['PUT','PATCH'])) {
    $d = read_json();
    $id = (int)($_GET['id'] ?? $d['id'] ?? 0);
    if (!$id) json_response(['error'=>'missing id'], 400);
    $stmt = $pdo->prepare('UPDATE drivers SET name=?, phone=?, email=?, address=?, vehicle=?, vehicleType=?, vehicleYear=?, status=?, joinDate=? WHERE id=?');
    $stmt->execute([
        $d['name'] ?? '', $d['phone'] ?? null, $d['email'] ?? null, $d['address'] ?? null,
        $d['vehicle'] ?? null, $d['vehicleType'] ?? null, $d['vehicleYear'] ?? null,
        $d['status'] ?? 'aktif', $d['joinDate'] ?? null, $id
    ]);
    $row = $pdo->query('SELECT * FROM drivers WHERE id='.$id)->fetch();
    json_response($row);
}

if ($method === 'DELETE') {
    $d = read_json();
    $id = (int)($_GET['id'] ?? $d['id'] ?? 0);
    if (!$id) json_response(['error'=>'missing id'], 400);
    $pdo->prepare('DELETE FROM drivers WHERE id=?')->execute([$id]);
    json_response(['ok'=>true]);
}

json_response(['error'=>'method not allowed'], 405);
