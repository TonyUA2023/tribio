<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Account;

$accounts = Account::all(['id', 'name', 'slug']);

echo "\n=== CUENTAS DISPONIBLES ===\n\n";

foreach ($accounts as $account) {
    echo "ID: {$account->id}\n";
    echo "Nombre: {$account->name}\n";
    echo "Slug: {$account->slug}\n";
    echo "---\n";
}

echo "\nTotal: " . $accounts->count() . " cuentas\n\n";
