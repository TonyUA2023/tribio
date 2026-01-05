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
        Schema::create('stories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('profile_id')->constrained()->onDelete('cascade');
            $table->foreignId('account_id')->constrained()->onDelete('cascade');

            // Contenido
            $table->enum('media_type', ['image', 'video']);
            $table->string('media_path');
            $table->text('caption')->nullable();
            $table->string('background_color', 7)->default('#000000');

            // Metadata
            $table->unsignedInteger('views_count')->default(0);
            $table->boolean('is_active')->default(true);

            // Control de expiración
            $table->timestamp('expires_at');
            $table->timestamps();

            // Índices
            $table->index(['profile_id', 'is_active']);
            $table->index('expires_at');
            $table->index('account_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stories');
    }
};
