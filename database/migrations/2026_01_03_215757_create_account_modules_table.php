<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('account_modules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->onDelete('cascade');
            $table->string('module_slug'); // 'bookings', 'orders', 'gallery', 'reviews', etc.
            $table->boolean('is_active')->default(true);

            // Configuración específica del módulo para esta cuenta
            // Ejemplo para bookings: {"slotDuration": 30, "workingHours": {...}}
            $table->json('config')->nullable();

            $table->timestamp('installed_at')->useCurrent();
            $table->timestamps();

            // Una cuenta no puede tener el mismo módulo duplicado
            $table->unique(['account_id', 'module_slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('account_modules');
    }
};
