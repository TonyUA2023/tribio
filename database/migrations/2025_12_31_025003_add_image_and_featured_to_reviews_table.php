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
        Schema::table('reviews', function (Blueprint $table) {
            // Imagen del trabajo/corte que hizo el cliente
            $table->string('image_path')->nullable()->after('comment');

            // Marcar reseña como destacada
            $table->boolean('is_featured')->default(false)->after('image_path');

            // Orden personalizado (menor = más arriba)
            $table->integer('display_order')->default(0)->after('is_featured');

            // Índices para mejorar queries
            $table->index(['profile_id', 'is_featured', 'display_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex(['profile_id', 'is_featured', 'display_order']);
            $table->dropColumn(['image_path', 'is_featured', 'display_order']);
        });
    }
};
