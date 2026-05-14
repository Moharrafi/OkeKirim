<?php
require_once __DIR__ . '/config.php';

// Start session for login state
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Ensure users table exists and seed a default admin when empty (dev convenience)
function ensure_users_table() {
    $pdo = db();
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) DEFAULT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        reset_token VARCHAR(255) DEFAULT NULL,
        reset_expires DATETIME DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Backfill columns if table already existed without reset fields
    try { $pdo->exec("ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL"); } catch (Throwable $e) { /* ignore */ }
    try { $pdo->exec("ALTER TABLE users ADD COLUMN reset_expires DATETIME NULL"); } catch (Throwable $e) { /* ignore */ }

    // seed default admin if table empty
    $stmt = $pdo->query("SELECT COUNT(*) as c FROM users");
    $count = (int)($stmt->fetch()['c'] ?? 0);
    if ($count === 0) {
        $email = 'admin@okekirim.local';
        $name = 'Administrator';
        $pass = 'admin123';
        $hash = password_hash($pass, PASSWORD_BCRYPT);
        $ins = $pdo->prepare("INSERT INTO users (name, email, password_hash) VALUES (?,?,?)");
        $ins->execute([$name, $email, $hash]);
    }
}

function input($key, $default = null) {
    // Accept x-www-form-urlencoded, multipart, or JSON body
    if (isset($_POST[$key])) return trim((string)$_POST[$key]);
    $json = read_json();
    return isset($json[$key]) ? trim((string)$json[$key]) : $default;
}

try {
    ensure_users_table();
} catch (Throwable $e) {
    json_response(['success' => false, 'message' => 'DB init failed: ' . $e->getMessage()], 500);
}

$action = $_GET['action'] ?? ($_POST['action'] ?? '');

switch ($action) {
    case 'login': {
        $email = strtolower(input('email', ''));
        $password = input('password', '');
        if ($email === '' || $password === '') {
            json_response(['success' => false, 'message' => 'Email dan password wajib diisi'], 400);
        }
        try {
            $pdo = db();
            $stmt = $pdo->prepare('SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1');
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            if (!$user || !password_verify($password, $user['password_hash'])) {
                json_response(['success' => false, 'message' => 'Email atau password salah'], 401);
            }
            $_SESSION['user_id'] = (int)$user['id'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_name'] = $user['name'];
            json_response(['success' => true, 'user' => [
                'id' => (int)$user['id'],
                'email' => $user['email'],
                'name' => $user['name'],
            ]]);
        } catch (Throwable $e) {
            json_response(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
        break;
    }
    case 'me': {
        if (!empty($_SESSION['user_id'])) {
            json_response(['success' => true, 'user' => [
                'id' => (int)$_SESSION['user_id'],
                'email' => (string)($_SESSION['user_email'] ?? ''),
                'name' => (string)($_SESSION['user_name'] ?? ''),
            ]]);
        } else {
            json_response(['success' => false, 'message' => 'Belum login'], 401);
        }
        break;
    }
    case 'logout': {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params['path'], $params['domain'],
                $params['secure'], $params['httponly']
            );
        }
        session_destroy();
        json_response(['success' => true]);
        break;
    }
    case 'forgot': {
        $email = strtolower(input('email', ''));
        if ($email === '') { json_response(['success' => false, 'message' => 'Email wajib diisi'], 400); }
        try {
            $pdo = db();
            $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            // Respond success even if not found to avoid user enumeration
            $token = bin2hex(random_bytes(32));
            if (false && $user) {
                $expires = (new DateTime('+24 hours'))->format('Y-m-d H:i:s');
                $upd = $pdo->prepare('UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?');
                $upd->execute([$token, $expires, $user['id']]);
            }
            // Build absolute reset URL
            $url = 'reset.html?token=' . urlencode($token);

            // Send email with the link (only if user exists)
            if ($user) {
                $subject = 'Reset Password OkeKirim';
                $html = '<div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;color:#111">'
                      . '<h2>Reset Password</h2>'
                      . '<p>Anda menerima email ini karena ada permintaan untuk mereset password akun OkeKirim Anda.</p>'
                      . '<p>Silakan klik tombol di bawah ini untuk mengatur password baru:</p>'
                      . '<p style="margin:16px 0"><a href="'.$url.'" style="background:#4f46e5;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;display:inline-block">Atur Password</a></p>'
                      . '<p>Atau salin tautan berikut ke browser Anda:<br><a href="'.$url.'">'.$url.'</a></p>'
                      . '<p style="font-size:12px;color:#555">Tautan ini berlaku selama 24 jam.</p>'
                      . '<p>Jika Anda tidak meminta reset password, abaikan email ini.</p>'
                      . '<p>Terima kasih,<br>Tim OkeKirim</p>'
                      . '</div>';
                send_email($email, $subject, $html);
            }

            json_response(['success' => true, 'message' => 'Link reset telah dibuat.', 'data' => ['reset_url' => $url]]);
        } catch (Throwable $e) {
            json_response(['success' => false, 'message' => 'Gagal memproses permintaan: ' . $e->getMessage()], 500);
        }
        break;
    }
    case 'reset': {
        $token = input('token', '');
        $newPass = input('password', '');
        if ($token === '' || $newPass === '') {
            json_response(['success' => false, 'message' => 'Token dan password wajib diisi'], 400);
        }
        try {
            $pdo = db();
            $stmt = $pdo->prepare('SELECT id, reset_expires FROM users WHERE reset_token = ? LIMIT 1');
            $stmt->execute([$token]);
            $user = $stmt->fetch();
            if (!$user) {
                json_response(['success' => false, 'message' => 'Token tidak valid'], 400);
            }
            if ($user['reset_expires'] && strtotime($user['reset_expires']) < time()) {
                json_response(['success' => false, 'message' => 'Token sudah kadaluarsa'], 400);
            }
            $hash = password_hash($newPass, PASSWORD_BCRYPT);
            $upd = $pdo->prepare('UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?');
            $upd->execute([$hash, $user['id']]);
            json_response(['success' => true, 'message' => 'Password berhasil diubah']);
        } catch (Throwable $e) {
            json_response(['success' => false, 'message' => 'Gagal reset password: ' . $e->getMessage()], 500);
        }
        break;
    }
    case 'change_password': {
        if (empty($_SESSION['user_id'])) {
            json_response(['success' => false, 'message' => 'Tidak terautentikasi'], 401);
        }
        $old = input('oldPassword', '');
        $new = input('newPassword', '');
        if ($old === '' || $new === '') {
            json_response(['success' => false, 'message' => 'Password lama dan baru wajib diisi'], 400);
        }
        try {
            $pdo = db();
            $stmt = $pdo->prepare('SELECT id, password_hash FROM users WHERE id = ? LIMIT 1');
            $stmt->execute([$_SESSION['user_id']]);
            $user = $stmt->fetch();
            if (!$user || !password_verify($old, $user['password_hash'])) {
                json_response(['success' => false, 'message' => 'Password lama tidak sesuai'], 400);
            }
            if (strlen($new) < 6) {
                json_response(['success' => false, 'message' => 'Password baru minimal 6 karakter'], 400);
            }
            $hash = password_hash($new, PASSWORD_BCRYPT);
            $upd = $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
            $upd->execute([$hash, $user['id']]);
            json_response(['success' => true, 'message' => 'Password berhasil diperbarui']);
        } catch (Throwable $e) {
            json_response(['success' => false, 'message' => 'Gagal mengubah password: ' . $e->getMessage()], 500);
        }
        break;
    }
    // Optional: simple signup for development
    case 'signup': {
        $name = input('name', '');
        $email = strtolower(input('email', ''));
        $password = input('password', '');
        if ($email === '' || $password === '') {
            json_response(['success' => false, 'message' => 'Email dan password wajib diisi'], 400);
        }
        try {
            $pdo = db();
            $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                json_response(['success' => false, 'message' => 'Email sudah terdaftar'], 409);
            }
            $hash = password_hash($password, PASSWORD_BCRYPT);
            $ins = $pdo->prepare('INSERT INTO users (name, email, password_hash) VALUES (?,?,?)');
            $ins->execute([$name, $email, $hash]);
            json_response(['success' => true]);
        } catch (Throwable $e) {
            json_response(['success' => false, 'message' => 'Gagal mendaftar: ' . $e->getMessage()], 500);
        }
        break;
    }
    default:
        json_response(['success' => false, 'message' => 'Unknown action'], 404);
}
