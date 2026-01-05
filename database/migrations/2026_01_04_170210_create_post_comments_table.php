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
        Schema::create('post_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->onDelete('cascade');

            // Usuario anónimo (visitante)
            $table->string('user_name'); // Nombre del visitante
            $table->string('user_email')->nullable(); // Email opcional
            $table->string('user_avatar')->nullable(); // Avatar opcional

            // Contenido
            $table->text('comment');

            // Estadísticas
            $table->unsignedInteger('likes_count')->default(0);

            // Moderación
            $table->boolean('is_approved')->default(true); // Por defecto aprobado
            $table->boolean('is_pinned')->default(false); // Destacar comentario

            // Parent comment para respuestas anidadas
            $table->foreignId('parent_id')->nullable()->constrained('post_comments')->onDelete('cascade');

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index('post_id');
            $table->index(['post_id', 'is_approved']);
            $table->index('parent_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('post_comments');
    }
};
