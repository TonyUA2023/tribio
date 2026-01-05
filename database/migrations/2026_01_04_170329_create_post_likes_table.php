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
        Schema::create('post_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->onDelete('cascade');

            // Usuario anónimo identificado por IP o fingerprint
            $table->string('user_identifier'); // IP o fingerprint del navegador
            $table->string('user_name')->nullable(); // Nombre opcional

            $table->timestamps();

            // Índices
            $table->index('post_id');
            $table->unique(['post_id', 'user_identifier']); // Un like por usuario por post
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('post_likes');
    }
};
