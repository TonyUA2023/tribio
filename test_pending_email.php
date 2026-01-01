<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\PendingEmail;

// Crear un correo de prueba
$email = PendingEmail::create([
    'to_email' => 'test@ejemplo.com',
    'subject' => 'Correo de Prueba del Sistema Cron',
    'body' => '<h1>Prueba Exitosa</h1><p>Este correo fue creado para verificar que el sistema de cron jobs funciona correctamente.</p><p>Si ves este correo en los logs, el sistema está funcionando bien.</p>'
]);

echo "✓ Correo de prueba creado con ID: " . $email->id . "\n";
echo "  Destinatario: " . $email->to_email . "\n";
echo "  Asunto: " . $email->subject . "\n";
echo "\nAhora ejecuta: php artisan emails:send-pending\n";
echo "O espera a que el cron externo lo ejecute automáticamente.\n";
