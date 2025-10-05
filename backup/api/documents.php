<?php
require __DIR__ . '/config.php';
$pdo = db();

$pdo->exec("CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle VARCHAR(128) DEFAULT NULL,
  type VARCHAR(128) DEFAULT NULL,
  expiry DATE DEFAULT NULL,
  renewalCost INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$m = $_SERVER['REQUEST_METHOD'];
// Method override support
if ($m === 'POST') {
    $override = strtoupper($_GET['_method'] ?? ($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] ?? ''));
    if (!$override) { $tmp = read_json(); $override = strtoupper($tmp['_method'] ?? ''); }
    if (in_array($override, ['PUT','PATCH','DELETE'])) { $m = $override; }
}
if ($m === 'GET') {
    $stmt = $pdo->query('SELECT * FROM documents ORDER BY id DESC');
    json_response($stmt->fetchAll());
}
if ($m === 'POST') {
    $d = read_json();
    $stmt = $pdo->prepare('INSERT INTO documents (vehicle, type, expiry, renewalCost) VALUES (?,?,?,?)');
    $stmt->execute([$d['vehicle'] ?? null, $d['type'] ?? null, $d['expiry'] ?? null, $d['renewalCost'] ?? null]);
    $id = $pdo->lastInsertId();
    $row = $pdo->query('SELECT * FROM documents WHERE id='.(int)$id)->fetch();
    json_response($row, 201);
}
if (in_array($m, ['PUT','PATCH'])) {
    $d = read_json();
    $id = (int)($_GET['id'] ?? $d['id'] ?? 0);
    if (!$id) json_response(['error'=>'missing id'], 400);
    $stmt = $pdo->prepare('UPDATE documents SET vehicle=?, type=?, expiry=?, renewalCost=? WHERE id=?');
    $stmt->execute([$d['vehicle'] ?? null, $d['type'] ?? null, $d['expiry'] ?? null, $d['renewalCost'] ?? null, $id]);
    $row = $pdo->query('SELECT * FROM documents WHERE id='.$id)->fetch();
    json_response($row);
}
if ($m === 'DELETE') {
    $d = read_json();
    $id = (int)($_GET['id'] ?? $d['id'] ?? 0);
    if (!$id) json_response(['error'=>'missing id'], 400);
    $pdo->prepare('DELETE FROM documents WHERE id=?')->execute([$id]);
    json_response(['ok'=>true]);
}
json_response(['error'=>'method not allowed'], 405);
