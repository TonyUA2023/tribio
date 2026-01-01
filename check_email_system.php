<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\Booking;
use App\Models\Profile;

echo "=== VERIFICACIÓN DEL SISTEMA DE EMAILS ===\n\n";

// 1. Verificar configuración de email
echo "1️⃣  CONFIGURACIÓN DE EMAIL\n";
echo "   MAIL_MAILER: " . config('mail.default') . "\n";
echo "   MAIL_HOST: " . config('mail.mailers.smtp.host') . "\n";
echo "   MAIL_FROM: " . config('mail.from.address') . "\n\n";

// 2. Verificar configuración de colas
echo "2️⃣  CONFIGURACIÓN DE COLAS\n";
echo "   QUEUE_CONNECTION: " . config('queue.default') . "\n\n";

// 3. Verificar email de notificaciones del perfil
echo "3️⃣  EMAIL DE NOTIFICACIONES\n";
$profile = Profile::first();
if ($profile) {
    echo "   Perfil: " . $profile->name . "\n";
    echo "   Notification Email: " . ($profile->notification_email ?: "❌ NO CONFIGURADO") . "\n\n";
} else {
    echo "   ❌ No hay perfiles en la base de datos\n\n";
}

// 4. Verificar trabajos en cola
echo "4️⃣  TRABAJOS EN COLA\n";
$pendingJobs = DB::table('jobs')->count();
echo "   Trabajos pendientes: " . $pendingJobs . "\n";

if ($pendingJobs > 0) {
    echo "   📋 Últimos trabajos:\n";
    $jobs = DB::table('jobs')->orderBy('created_at', 'desc')->limit(5)->get();
    foreach ($jobs as $job) {
        $payload = json_decode($job->payload, true);
        $displayName = $payload['displayName'] ?? 'Unknown';
        echo "      - " . $displayName . " (Intentos: " . $job->attempts . ")\n";
    }
}
echo "\n";

// 5. Verificar trabajos fallidos
echo "5️⃣  TRABAJOS FALLIDOS\n";
$failedJobs = DB::table('failed_jobs')->count();
echo "   Trabajos fallidos: " . $failedJobs . "\n";

if ($failedJobs > 0) {
    echo "   ❌ Últimos errores:\n";
    $failed = DB::table('failed_jobs')->orderBy('failed_at', 'desc')->limit(3)->get();
    foreach ($failed as $f) {
        $payload = json_decode($f->payload, true);
        $displayName = $payload['displayName'] ?? 'Unknown';
        echo "      - " . $displayName . "\n";
        echo "        Error: " . substr($f->exception, 0, 200) . "...\n";
    }
}
echo "\n";

// 6. Verificar última reserva
echo "6️⃣  ÚLTIMA RESERVA\n";
$lastBooking = Booking::latest()->first();
if ($lastBooking) {
    echo "   Cliente: " . $lastBooking->client_name . "\n";
    echo "   Fecha: " . $lastBooking->booking_date->format('Y-m-d H:i') . "\n";
    echo "   Creada: " . $lastBooking->created_at->diffForHumans() . "\n";
} else {
    echo "   ℹ️  No hay reservas en el sistema\n";
}
echo "\n";

// 7. Verificar permisos de storage
echo "7️⃣  PERMISOS DE STORAGE\n";
$storageWritable = is_writable(__DIR__ . '/storage/logs');
echo "   storage/logs writable: " . ($storageWritable ? "✅ SI" : "❌ NO") . "\n\n";

echo "=== FIN DE VERIFICACIÓN ===\n";
echo "\n📝 PRÓXIMOS PASOS:\n";
echo "   1. Si hay trabajos pendientes, el cron job NO se está ejecutando\n";
echo "   2. Si hay trabajos fallidos, revisa los errores arriba\n";
echo "   3. Si notification_email está vacío, configúralo en /settings/business\n";
echo "   4. Si todo está OK pero no recibes emails, revisa SPAM o logs de Brevo\n\n";
