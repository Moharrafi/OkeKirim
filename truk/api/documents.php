<?php
require __DIR__ . '/config.php';
$pdo = db();

function okekirim_driver_name_by_vehicle(PDO $pdo, ?string $vehicle): ?string {
    static $cache = [];
    if (!$vehicle) {
        return null;
    }
    if (array_key_exists($vehicle, $cache)) {
        return $cache[$vehicle];
    }
    $stmt = $pdo->prepare('SELECT name FROM drivers WHERE vehicle = ? LIMIT 1');
    $stmt->execute([$vehicle]);
    $name = $stmt->fetchColumn();
    $cache[$vehicle] = $name ?: null;
    return $cache[$vehicle];
}

function okekirim_insert_document_history(PDO $pdo, $previous, $current): void {
    if (!is_array($current) || empty($current)) {
        return;
    }
    $previous = is_array($previous) ? $previous : [];
    $type = strtolower((string)($current['type'] ?? ''));
    if (!in_array($type, ['pajak', 'kir'], true)) {
        return;
    }
    $prevExpiry = $previous['expiry'] ?? null;
    $newExpiry = $current['expiry'] ?? null;
    $prevCost = isset($previous['renewalCost']) ? (int)$previous['renewalCost'] : null;
    $newCost = isset($current['renewalCost']) ? (int)$current['renewalCost'] : null;

    if ($prevExpiry === $newExpiry && $prevCost === $newCost) {
        return;
    }

    $driver = okekirim_driver_name_by_vehicle($pdo, $current['vehicle'] ?? null);
    $stmt = $pdo->prepare('INSERT INTO document_renewals (document_id, vehicle, driver, type, previous_expiry, new_expiry, cost) VALUES (?,?,?,?,?,?,?)');
    $stmt->execute([
        $current['id'] ?? null,
        $current['vehicle'] ?? null,
        $driver,
        $current['type'] ?? null,
        $prevExpiry ?: null,
        $newExpiry ?: null,
        $newCost
    ]);
}

$m = $_SERVER['REQUEST_METHOD'];
$action = strtolower($_GET['action'] ?? '');

// Method override support
if ($m === 'POST') {
    $override = strtoupper($_GET['_method'] ?? ($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] ?? ''));
if (!$override) { $tmp = read_json(true); $override = strtoupper($tmp['_method'] ?? ''); }
    if (in_array($override, ['PUT','PATCH','DELETE'])) { $m = $override; }
}
if ($m === 'GET' && $action === 'history') {
    $stmt = $pdo->query('SELECT * FROM document_renewals ORDER BY created_at DESC');
    json_response($stmt->fetchAll());
}
if ($m === 'GET') {
    $stmt = $pdo->query('SELECT * FROM documents ORDER BY id DESC');
    json_response($stmt->fetchAll());
}
if ($m === 'POST') {
    $d = read_json();
    $createdAt = okekirim_normalize_datetime($d['createdAt'] ?? null) ?? okekirim_normalize_datetime('now');
    $stmt = $pdo->prepare('INSERT INTO documents (vehicle, type, expiry, renewalCost, created_at) VALUES (?,?,?,?,?)');
    $stmt->execute([$d['vehicle'] ?? null, $d['type'] ?? null, $d['expiry'] ?? null, $d['renewalCost'] ?? null, $createdAt]);
    $id = $pdo->lastInsertId();
    $row = $pdo->query('SELECT * FROM documents WHERE id='.(int)$id)->fetch();
    json_response($row, 201);
}
if (in_array($m, ['PUT','PATCH'])) {
    $d = read_json();
    $id = (int)($_GET['id'] ?? $d['id'] ?? 0);
    if (!$id) json_response(['error'=>'missing id'], 400);
    $previous = $pdo->query('SELECT * FROM documents WHERE id='.$id)->fetch(PDO::FETCH_ASSOC);
    $stmt = $pdo->prepare('UPDATE documents SET vehicle=?, type=?, expiry=?, renewalCost=? WHERE id=?');
    $stmt->execute([$d['vehicle'] ?? null, $d['type'] ?? null, $d['expiry'] ?? null, $d['renewalCost'] ?? null, $id]);
    $row = $pdo->query('SELECT * FROM documents WHERE id='.$id)->fetch(PDO::FETCH_ASSOC);
    try { okekirim_insert_document_history($pdo, $previous ?: null, $row ?: null); } catch (Throwable $e) { /* ignore history errors */ }
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
