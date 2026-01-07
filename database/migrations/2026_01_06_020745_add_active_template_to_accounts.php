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

            // Relación directa al template activo
            $table->foreignId('active_template_id')
                ->nullable()
                ->after('id') // puedes cambiar la posición si deseas
                ->constrained('templates')
                ->nullOnDelete();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('accounts', function (Blueprint $table) {

            // Eliminar la FK primero
            $table->dropForeign(['active_template_id']);

            // Eliminar la columna
            $table->dropColumn('active_template_id');

        });
    }
};
