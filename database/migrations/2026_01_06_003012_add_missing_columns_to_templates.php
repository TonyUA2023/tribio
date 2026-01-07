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
        Schema::table('templates', function (Blueprint $table) {
            // Agregar config (JSON)
            if (!Schema::hasColumn('templates', 'config')) {
                $table->json('config')->after('preview_image_url');
            }
            // Agregar category
            if (!Schema::hasColumn('templates', 'category')) {
                $table->string('category')->default('barber')->after('config');
            }
            // Agregar is_active
            if (!Schema::hasColumn('templates', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('category');
            }
            // Agregar is_premium
            if (!Schema::hasColumn('templates', 'is_premium')) {
                $table->boolean('is_premium')->default(false)->after('is_active');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('templates', function (Blueprint $table) {
            //
        });
    }
};
