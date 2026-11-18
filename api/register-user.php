<?php
declare(strict_types=1);
require_once __DIR__ . '/storage.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    miportal_json_response(['ok' => false, 'message' => 'Método no permitido.'], 405);
}

$data = miportal_read_json_body();
$name = trim((string)($data['name'] ?? ''));
$email = strtolower(trim((string)($data['email'] ?? '')));
$program = trim((string)($data['program'] ?? 'Ingeniería de Sistemas'));
$password = (string)($data['password'] ?? '');
$role = (string)($data['role'] ?? 'student');
if (!in_array($role, ['student', 'teacher'], true)) { $role = 'student'; }

if (strlen($name) < 3 || strlen($name) > 270 || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8 || strlen($password) > 200) {
    miportal_json_response(['ok' => false, 'message' => 'Revisa el nombre, el correo y la contraseña. La contraseña debe tener al menos 8 caracteres.'], 422);
}

try {
    $user = miportal_update_collection('users', function (array &$users) use ($name, $email, $program, $password, $role): array {
        foreach ($users as $existing) {
            if (($existing['email'] ?? '') === $email) {
                throw new DomainException('Ya existe una cuenta registrada con ese correo.');
            }
        }
        $created = [
            'id' => bin2hex(random_bytes(12)),
            'name' => $name,
            'email' => $email,
            'program' => $program,
            'document' => '',
            'phone' => '',
            'birthDate' => '',
            'city' => '',
            'interests' => '',
            'activities' => '',
            'role' => $role,
            'passwordHash' => password_hash($password, PASSWORD_DEFAULT),
            'createdAt' => gmdate('c')
        ];
        $users[] = $created;
        return ['id' => $created['id'], 'name' => $created['name'], 'email' => $created['email'], 'program' => $created['program'], 'document' => $created['document'], 'phone' => $created['phone'], 'birthDate' => $created['birthDate'], 'city' => $created['city'], 'interests' => $created['interests'], 'activities' => $created['activities'], 'role' => $created['role']];
    });
    miportal_start_session();
    session_regenerate_id(true);
    $_SESSION['miportal_user'] = $user;
    miportal_json_response(['ok' => true, 'message' => 'Cuenta creada correctamente.', 'user' => $user], 201);
} catch (DomainException $error) {
    miportal_json_response(['ok' => false, 'message' => $error->getMessage()], 409);
} catch (Throwable) {
    miportal_json_response(['ok' => false, 'message' => 'No fue posible guardar la cuenta. Intenta nuevamente.'], 500);
}
