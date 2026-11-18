<?php
declare(strict_types=1);
require_once __DIR__ . '/storage.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') miportal_json_response(['ok' => false, 'message' => 'Método no permitido.'], 405);
miportal_start_session();
$user = miportal_current_user();
if (!$user) miportal_json_response(['ok' => false, 'message' => 'Inicia sesión para editar tu perfil.'], 401);
$data = miportal_read_json_body();
$fields = ['name' => 90, 'program' => 120, 'document' => 30, 'phone' => 30, 'birthDate' => 10, 'city' => 80, 'interests' => 160, 'activities' => 180];
$updated = [];
$name = trim((string)($data['name'] ?? ''));
$email = strtolower(trim((string)($data['email'] ?? '')));
if (strlen($name) < 3 || strlen($name) > $fields['name'] || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    miportal_json_response(['ok' => false, 'message' => 'El nombre debe tener entre 3 y 90 caracteres y el correo debe ser válido.'], 422);
}
$updated['name'] = $name;
$updated['email'] = $email;
foreach ($fields as $field => $max) {
    if ($field === 'name') continue;
    $value = trim((string)($data[$field] ?? ''));
    if (strlen($value) > $max) miportal_json_response(['ok' => false, 'message' => 'Uno de los campos supera la longitud permitida.'], 422);
    if ($field === 'birthDate' && $value !== '') {
        $date = DateTimeImmutable::createFromFormat('Y-m-d', $value);
        if (!$date || $date->format('Y-m-d') !== $value) miportal_json_response(['ok' => false, 'message' => 'La fecha de nacimiento no es válida.'], 422);
    }
    $updated[$field] = $value;
}
try {
    $safeUser = miportal_update_collection('users', function (array &$users) use ($user, $email, $updated): ?array {
        foreach ($users as $existing) {
            if (($existing['email'] ?? '') === $email && ($existing['id'] ?? '') !== $user['id']) throw new DomainException('Ese correo ya está asociado a otra cuenta.');
        }
        foreach ($users as &$item) {
            if (($item['id'] ?? '') === $user['id']) {
                foreach ($updated as $key => $value) $item[$key] = $value;
                $result = $item;
                unset($result['passwordHash']);
                return $result;
            }
        }
        return null;
    });
    if (!$safeUser) miportal_json_response(['ok' => false, 'message' => 'No se encontró la cuenta.'], 404);
    $_SESSION['miportal_user'] = $safeUser;
    miportal_json_response(['ok' => true, 'message' => 'Perfil actualizado.', 'user' => $safeUser]);
} catch (DomainException $error) {
    miportal_json_response(['ok' => false, 'message' => $error->getMessage()], 409);
} catch (Throwable) {
    miportal_json_response(['ok' => false, 'message' => 'No fue posible guardar el perfil.'], 500);
}
