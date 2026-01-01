<?php
/**
 * Script de verificación SEO
 * Muestra la metadata que se genera para una mini-página
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Account;
use App\Models\Profile;
use App\Models\ProfileMedia;

echo "\n=== VERIFICACIÓN DE SEO METADATA ===\n\n";

// Buscar cuenta de Antony
$account = Account::where('slug', 'antony-barber')->first();

if (!$account) {
    echo "❌ No se encontró la cuenta 'antony-barber'\n";
    exit(1);
}

echo "✅ Cuenta encontrada: {$account->name}\n";
echo "   Slug: {$account->slug}\n\n";

// Buscar perfil
$profile = Profile::where('account_id', $account->id)->first();

if (!$profile) {
    echo "❌ No se encontró perfil para esta cuenta\n";
    exit(1);
}

echo "✅ Perfil encontrado: {$profile->name}\n";
echo "   Título: {$profile->title}\n\n";

// Buscar media
$cover = ProfileMedia::query()
    ->where('account_id', $account->id)
    ->where('type', 'cover_photo')
    ->first();

$logo = ProfileMedia::query()
    ->where('account_id', $account->id)
    ->where('type', 'profile_logo')
    ->first();

echo "=== MEDIA ===\n";
echo "Cover: " . ($cover ? $cover->url : 'No encontrado') . "\n";
echo "Logo: " . ($logo ? $logo->url : 'No encontrado') . "\n\n";

// Simular la generación de metadata
$data = $profile->data ?? [];

$name = $profile->name ?? $account->name;
$description = !empty($data['bio'])
    ? substr($data['bio'], 0, 160)
    : ($profile->title ?? 'Reserva tu cita en TRIBIO');
$image = $cover?->url ?? $logo?->url ?? null;
$url = url("/{$account->slug}");

echo "=== METADATA GENERADA ===\n";
echo "Title: {$name} | TRIBIO\n";
echo "Description: {$description}\n";
echo "Image: " . ($image ?? 'null') . "\n";
echo "URL: {$url}\n";
echo "Site Name: TRIBIO\n\n";

echo "=== DATOS DEL PERFIL (data JSON) ===\n";
print_r($data);

echo "\n✅ Verificación completada!\n";
echo "\n💡 IMPORTANTE: Si ves 'null' en Image, necesitas subir Cover Photo o Logo.\n";
echo "   Accede a: /settings/page para subir las imágenes.\n\n";
