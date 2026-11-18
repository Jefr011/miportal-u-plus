<?php
declare(strict_types=1);

function miportal_json_response(array $payload, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function miportal_read_json_body(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '', true);
    return is_array($data) ? $data : $_POST;
}

function miportal_update_collection(string $name, callable $callback): mixed {
    $directory = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'miportal-uplus-data';
    if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) {
        throw new RuntimeException('No se pudo crear el almacenamiento temporal.');
    }
    $path = $directory . DIRECTORY_SEPARATOR . basename($name) . '.json';
    $handle = fopen($path, 'c+');
    if ($handle === false) {
        throw new RuntimeException('No se pudo abrir el almacenamiento.');
    }
    try {
        if (!flock($handle, LOCK_EX)) {
            throw new RuntimeException('No se pudo bloquear el almacenamiento.');
        }
        rewind($handle);
        $contents = stream_get_contents($handle);
        $items = json_decode($contents ?: '[]', true);
        if (!is_array($items)) {
            $items = [];
        }
        $result = $callback($items);
        rewind($handle);
        ftruncate($handle, 0);
        fwrite($handle, json_encode($items, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        fflush($handle);
        flock($handle, LOCK_UN);
        return $result;
    } finally {
        fclose($handle);
    }
}

function miportal_start_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    ini_set('session.gc_maxlifetime', '2592000');
    session_set_cookie_params([
        'lifetime' => 2592000,
        'httponly' => true,
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'samesite' => 'Lax',
        'path' => '/'
    ]);
    session_start();
}

function miportal_current_user(): ?array {
    miportal_start_session();
    $user = $_SESSION['miportal_user'] ?? null;
    return is_array($user) ? $user : null;
}

function miportal_require_role(string $role): array {
    $user = miportal_current_user();
    if (!$user) {
        miportal_json_response(['ok' => false, 'message' => 'Inicia sesión para continuar.'], 401);
    }
    if (($user['role'] ?? 'student') !== $role) {
        miportal_json_response(['ok' => false, 'message' => 'No tienes permisos para realizar esta acción.'], 403);
    }
    return $user;
}
