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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();

            // Relaciones
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('account_id')->constrained()->onDelete('cascade');

            // Datos principales
            $table->string('name');
            $table->string('phone'); // Identificador principal
            $table->string('email')->nullable();
            $table->string('avatar')->nullable();

            // Preferencias (JSON)
            $table->json('preferences')->nullable(); // { notification_channel, language, etc }

            // Direcciones guardadas (JSON array)
            $table->json('addresses')->nullable(); // [{ label, address, is_default, coordinates }]

            // Metadata
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('last_order_at')->nullable();
            $table->timestamp('last_booking_at')->nullable();

            $table->timestamps();

            // Constraints e índices
            $table->unique(['account_id', 'phone']); // Un cliente único por teléfono por negocio
            $table->index(['account_id', 'email']);
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
