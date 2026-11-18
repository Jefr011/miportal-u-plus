<?php
declare(strict_types=1);
require_once __DIR__ . '/storage.php';
$user = miportal_current_user();
$events = miportal_update_collection('hours-events', fn(array &$items) => $items);
$enrollments = miportal_update_collection('hours-enrollments', function (array &$items) use ($user): array {
    if (!$user) return [];
    return array_values(array_filter($items, fn(array $item) => ($item['userId'] ?? '') === ($user['id'] ?? '')));
});
miportal_json_response(['ok' => true, 'events' => $events, 'enrollments' => $enrollments, 'user' => $user]);
