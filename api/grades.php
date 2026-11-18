<?php
declare(strict_types=1);
require_once __DIR__ . '/storage.php';
$user = miportal_current_user();
if (!$user) {
    miportal_json_response(['ok' => false, 'message' => 'Inicia sesión para consultar calificaciones.'], 401);
}
try {
    $grades = miportal_update_collection('grades', function (array &$items) use ($user): array {
        if (($user['role'] ?? 'student') === 'teacher') {
            return array_values(array_filter($items, fn(array $item) => ($item['teacherId'] ?? '') === $user['id']));
        }
        return array_values(array_filter($items, fn(array $item) => strtolower((string)($item['studentEmail'] ?? '')) === strtolower((string)$user['email'])));
    });
    miportal_json_response(['ok' => true, 'grades' => $grades]);
} catch (Throwable) {
    miportal_json_response(['ok' => false, 'message' => 'No fue posible consultar las calificaciones.'], 500);
}
