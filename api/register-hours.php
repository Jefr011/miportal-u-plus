<?php
declare(strict_types=1);
require_once __DIR__ . '/storage.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    miportal_json_response(['ok' => false, 'message' => 'Método no permitido.'], 405);
}
$user = miportal_require_role('teacher');
$data = miportal_read_json_body();
$title = trim((string)($data['title'] ?? ''));
$place = trim((string)($data['place'] ?? ''));
$date = trim((string)($data['date'] ?? ''));
$startTime = trim((string)($data['startTime'] ?? '09:00'));
$hours = filter_var($data['hours'] ?? null, FILTER_VALIDATE_INT);
$description = trim((string)($data['description'] ?? ''));
$category = trim((string)($data['category'] ?? 'Servicio universitario'));
$dateObject = DateTimeImmutable::createFromFormat('Y-m-d', $date);
if (strlen($title) < 4 || strlen($title) > 120 || strlen($place) < 2 || strlen($place) > 120 || !$dateObject || $dateObject->format('Y-m-d') !== $date || !preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $startTime) || $hours === false || $hours < 1 || $hours > 8 || strlen($description) > 600) {
    miportal_json_response(['ok' => false, 'message' => 'Verifica los datos: fecha, hora y duración deben ser válidas.'], 422);
}
try {
    $event = miportal_update_collection('hours-events', function (array &$items) use ($title, $place, $date, $startTime, $hours, $description, $category, $user): array {
        $entry = [
            'id' => 'hl-' . bin2hex(random_bytes(8)),
            'title' => $title,
            'place' => $place,
            'date' => $date,
            'startTime' => $startTime,
            'hours' => $hours,
            'description' => $description,
            'category' => $category,
            'createdBy' => $user['id'],
            'createdByName' => $user['name'],
            'createdAt' => gmdate('c'),
            'source' => 'teacher'
        ];
        $items[] = $entry;
        return $entry;
    });
    miportal_json_response(['ok' => true, 'message' => 'Actividad publicada correctamente.', 'event' => $event], 201);
} catch (Throwable) {
    miportal_json_response(['ok' => false, 'message' => 'No fue posible publicar la actividad.'], 500);
}
