<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Ampliamos el ENUM para incluir 'ready' temporalmente
        // Mantenemos los antiguos ('confirmed', 'in_delivery') para no perder datos antes de convertirlos
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending','confirmed','preparing','in_delivery','ready','delivered','cancelled') NOT NULL DEFAULT 'pending'");

        // 2. Migramos los datos existentes al nuevo estándar
        // 'confirmed' pasa a 'preparing' (ya se confirmó, se empieza a trabajar)
        DB::table('orders')
            ->where('status', 'confirmed')
            ->update(['status' => 'preparing']);

        // 'in_delivery' pasa a 'ready' (está listo para ser entregado o recogido)
        DB::table('orders')
            ->where('status', 'in_delivery')
            ->update(['status' => 'ready']);

        // 3. Redefinimos el ENUM solo con los estados estandarizados
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending','preparing','ready','delivered','cancelled') NOT NULL DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Para revertir, volvemos a añadir los estados antiguos
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending','confirmed','preparing','in_delivery','ready','delivered','cancelled') NOT NULL DEFAULT 'pending'");

        // Revertimos la data (aproximación, ya que 'ready' no existía antes)
        // Asumimos que lo que está 'ready' vuelve a 'in_delivery' si revertimos
        DB::table('orders')
            ->where('status', 'ready')
            ->update(['status' => 'in_delivery']);

        // Volvemos a la definición original
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending','confirmed','preparing','in_delivery','delivered','cancelled') NOT NULL DEFAULT 'pending'");
    }
};