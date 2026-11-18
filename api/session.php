<?php
declare(strict_types=1);
require_once __DIR__ . '/storage.php';
$user = miportal_current_user();
miportal_json_response(['ok' => true, 'user' => $user]);
