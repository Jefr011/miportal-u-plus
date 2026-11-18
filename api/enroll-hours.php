<?php
declare(strict_types=1);
require_once __DIR__ . '/storage.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    miportal_json_response(['ok' => false, 'message' => 'Método no permitido.'], 405);
}
$user = miportal_require_role('student');
$data = miportal_read_json_body();
$eventId = trim((string)($data['eventId'] ?? ''));
$title = trim((string)($data['title'] ?? ''));
$date = trim((string)($data['date'] ?? ''));
$startTime = trim((string)($data['startTime'] ?? '09:00'));
$place = trim((string)($data['place'] ?? 'Campus UNAB'));
$hours = filter_var($data['hours'] ?? 1, FILTER_VALIDATE_INT);
$period = trim((string)($data['period'] ?? '2026-4'));
$dateObject = DateTimeImmutable::createFromFormat('Y-m-d', $date);
if ($eventId === '' || $title === '' || !$dateObject || $dateObject->format('Y-m-d') !== $date || !preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $startTime) || $hours === false || $hours < 1 || $hours > 8 || !preg_match('/^2026-[1-4]$/', $period)) {
    miportal_json_response(['ok' => false, 'message' => 'Datos de inscripción no válidos.'], 422);
}
try {
    $record = miportal_update_collection('hours-enrollments', function (array &$items) use ($eventId, $title, $date, $startTime, $place, $hours, $period, $user): array {
        foreach ($items as $item) {
            if (($item['eventId'] ?? '') === $eventId && ($item['userId'] ?? '') === $user['id']) {
                return $item;
            }
        }
        $entry = ['id' => bin2hex(random_bytes(10)), 'eventId' => $eventId, 'title' => $title, 'date' => $date, 'startTime' => $startTime, 'place' => $place, 'hours' => $hours, 'period' => $period, 'userId' => $user['id'], 'userName' => $user['name'], 'status' => 'Inscripción registrada', 'createdAt' => gmdate('c')];
        $items[] = $entry;
        return $entry;
    });
    miportal_json_response(['ok' => true, 'enrollment' => $record]);
} catch (Throwable) {
    miportal_json_response(['ok' => false, 'message' => 'No fue posible guardar la inscripción.'], 500);
}
