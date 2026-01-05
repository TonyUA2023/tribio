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
        Schema::create('story_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('story_id')->constrained()->onDelete('cascade');
            $table->string('viewer_ip', 45);
            $table->text('user_agent')->nullable();
            $table->timestamp('viewed_at')->useCurrent();

            // Índices
            $table->index('story_id');

            // Prevenir duplicados del mismo IP en la misma story
            $table->unique(['story_id', 'viewer_ip']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('story_views');
    }
};
