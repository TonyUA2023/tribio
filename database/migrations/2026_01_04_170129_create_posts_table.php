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
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->onDelete('cascade');

            // Contenido del post
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->enum('type', ['image', 'video', 'carousel'])->default('image');

            // Media
            $table->json('media')->nullable(); // Array de URLs de imágenes/videos
            $table->string('thumbnail_url')->nullable(); // Para videos
            $table->integer('duration')->nullable(); // Duración en segundos para videos

            // Estadísticas
            $table->unsignedInteger('likes_count')->default(0);
            $table->unsignedInteger('comments_count')->default(0);
            $table->unsignedInteger('shares_count')->default(0);
            $table->unsignedInteger('views_count')->default(0);

            // Configuración
            $table->boolean('comments_enabled')->default(true);
            $table->boolean('is_published')->default(true);
            $table->timestamp('published_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Índices
            $table->index('account_id');
            $table->index(['is_published', 'published_at']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
