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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('profile_id')->constrained()->onDelete('cascade');
            $table->foreignId('account_id')->constrained()->onDelete('cascade');

            // Información del cliente que deja la reseña
            $table->string('client_name');
            $table->string('client_email')->nullable();

            // Contenido de la reseña
            $table->tinyInteger('rating')->unsigned(); // 1-5 estrellas
            $table->text('comment');

            // Estado de aprobación
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');

            // Metadata
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();

            $table->timestamps();

            // Índices para búsquedas rápidas
            $table->index(['profile_id', 'status']);
            $table->index(['account_id', 'rating']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
