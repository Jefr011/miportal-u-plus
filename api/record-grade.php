<?php
declare(strict_types=1);
require_once __DIR__ . '/storage.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    miportal_json_response(['ok' => false, 'message' => 'Método no permitido.'], 405);
}
$teacher = miportal_require_role('teacher');
$data = miportal_read_json_body();
$studentName = trim((string)($data['studentName'] ?? ''));
$studentEmail = strtolower(trim((string)($data['studentEmail'] ?? '')));
$period = trim((string)($data['period'] ?? ''));
$course = trim((string)($data['course'] ?? ''));
$assessment = trim((string)($data['assessment'] ?? ''));
$grade = filter_var($data['grade'] ?? null, FILTER_VALIDATE_FLOAT);
if (strlen($studentName) < 3 || strlen($studentName) > 120 || !filter_var($studentEmail, FILTER_VALIDATE_EMAIL) || !preg_match('/^2026-[1-4]$/', $period) || strlen($course) < 2 || strlen($course) > 150 || strlen($assessment) < 2 || strlen($assessment) > 100 || $grade === false || $grade < 0 || $grade > 5) {
    miportal_json_response(['ok' => false, 'message' => 'Verifica estudiante, correo, periodo, asignatura, evaluación y nota (0 a 5).'], 422);
}
$studentExists = miportal_update_collection('users', function (array &$users) use ($studentEmail): bool {
    foreach ($users as $registered) {
        if (strtolower((string)($registered['email'] ?? '')) === $studentEmail && ($registered['role'] ?? 'student') === 'student') {
            return true;
        }
    }
    return false;
});
if (!$studentExists) {
    miportal_json_response(['ok' => false, 'message' => 'No existe una cuenta de estudiante registrada con ese correo.'], 404);
}
try {
    $record = miportal_update_collection('grades', function (array &$items) use ($teacher, $studentName, $studentEmail, $period, $course, $assessment, $grade): array {
        $entry = [
            'id' => 'grade-' . bin2hex(random_bytes(8)),
            'studentName' => $studentName,
            'studentEmail' => $studentEmail,
            'period' => $period,
            'course' => $course,
            'assessment' => $assessment,
            'grade' => round((float)$grade, 1),
            'teacherId' => $teacher['id'],
            'teacherName' => $teacher['name'],
            'createdAt' => gmdate('c')
        ];
        $items[] = $entry;
        return $entry;
    });
    miportal_json_response(['ok' => true, 'grade' => $record], 201);
} catch (Throwable) {
    miportal_json_response(['ok' => false, 'message' => 'No fue posible almacenar la calificación.'], 500);
}
