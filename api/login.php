<?php
declare(strict_types=1);
require_once __DIR__ . '/storage.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    miportal_json_response(['ok' => false, 'message' => 'Método no permitido.'], 405);
}
$data = miportal_read_json_body();
$email = strtolower(trim((string)($data['email'] ?? '')));
$password = (string)($data['password'] ?? '');
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
    miportal_json_response(['ok' => false, 'message' => 'Ingresa un correo y una contraseña válidos.'], 422);
}
try {
    $user = miportal_update_collection('users', function (array &$users) use ($email, $password): ?array {
        foreach ($users as $item) {
            if (($item['email'] ?? '') === $email && password_verify($password, (string)($item['passwordHash'] ?? ''))) {
                return ['id' => $item['id'], 'name' => $item['name'], 'email' => $item['email'], 'program' => $item['program'], 'document' => $item['document'] ?? '', 'phone' => $item['phone'] ?? '', 'birthDate' => $item['birthDate'] ?? '', 'city' => $item['city'] ?? '', 'interests' => $item['interests'] ?? '', 'activities' => $item['activities'] ?? '', 'role' => ($item['role'] ?? 'student')];
            }
        }
        return null;
    });
    if (!$user) {
        miportal_json_response(['ok' => false, 'message' => 'Correo o contraseña incorrectos. Si aún no tienes cuenta, créala primero.'], 401);
    }
    miportal_start_session();
    session_regenerate_id(true);
    $_SESSION['miportal_user'] = $user;
    miportal_json_response(['ok' => true, 'user' => $user]);
} catch (Throwable) {
    miportal_json_response(['ok' => false, 'message' => 'No fue posible validar la cuenta.'], 500);
}
