<?php
// Test simple pour vérifier que PHP fonctionne
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

echo json_encode([
    'status' => 'OK',
    'message' => 'Serveur PHP fonctionne!',
    'php_version' => phpversion(),
    'timestamp' => date('Y-m-d H:i:s')
]);
?>
