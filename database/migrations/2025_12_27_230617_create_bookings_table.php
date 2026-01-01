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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('profile_id')->constrained()->onDelete('cascade');
            $table->foreignId('account_id')->constrained()->onDelete('cascade');

            // Información del cliente
            $table->string('client_name');
            $table->string('client_phone'); // Campo obligatorio
            $table->string('client_email')->nullable();

            // Información de la reserva
            $table->date('booking_date');
            $table->time('booking_time');
            $table->string('service')->nullable();
            $table->text('notes')->nullable();

            // Estado de la reserva
            $table->enum('status', ['pending', 'confirmed', 'cancelled', 'completed'])->default('pending');

            // Metadata
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();

            $table->timestamps();

            // Índices para búsquedas rápidas
            $table->index(['profile_id', 'booking_date']);
            $table->index(['account_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
