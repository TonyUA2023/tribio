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
        Schema::table('accounts', function (Blueprint $table) {
            // ID de plantilla de tienda (separada de la plantilla personal)
            $table->foreignId('store_template_id')
                ->nullable()
                ->after('active_template_id')
                ->constrained('templates')
                ->nullOnDelete();

            // Configuración JSON personalizada para la plantilla de tienda
            $table->json('store_template_config')->nullable()->after('store_template_id');

            // Configuración JSON personalizada para la plantilla personal
            $table->json('personal_template_config')->nullable()->after('store_template_config');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            $table->dropForeign(['store_template_id']);
            $table->dropColumn(['store_template_id', 'store_template_config', 'personal_template_config']);
        });
    }
};
