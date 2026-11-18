<?php
declare(strict_types=1);
require_once __DIR__ . '/storage.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') miportal_json_response(['ok' => false, 'message' => 'Método no permitido.'], 405);
miportal_start_session();
$user = miportal_current_user();
if (!$user) miportal_json_response(['ok' => false, 'message' => 'Inicia sesión para cambiar tu contraseña.'], 401);
$data = miportal_read_json_body();
$currentPassword = (string)($data['currentPassword'] ?? '');
$newPassword = (string)($data['newPassword'] ?? '');
$confirmPassword = (string)($data['confirmPassword'] ?? '');
if ($currentPassword === '' || strlen($newPassword) < 8 || strlen($newPassword) > 200 || $newPassword !== $confirmPassword) {
    miportal_json_response(['ok' => false, 'message' => 'Verifica la contraseña actual y confirma una nueva contraseña de al menos 8 caracteres.'], 422);
}
try {
    $changed = miportal_update_collection('users', function (array &$users) use ($user, $currentPassword, $newPassword): bool {
        foreach ($users as &$item) {
            if (($item['id'] ?? '') !== $user['id']) continue;
            if (!password_verify($currentPassword, (string)($item['passwordHash'] ?? ''))) return false;
            $item['passwordHash'] = password_hash($newPassword, PASSWORD_DEFAULT);
            $item['passwordUpdatedAt'] = gmdate('c');
            return true;
        }
        return false;
    });
    if (!$changed) miportal_json_response(['ok' => false, 'message' => 'La contraseña actual es incorrecta.'], 400);
    miportal_json_response(['ok' => true, 'message' => 'Contraseña actualizada correctamente.']);
} catch (Throwable) {
    miportal_json_response(['ok' => false, 'message' => 'No fue posible actualizar la contraseña.'], 500);
}
