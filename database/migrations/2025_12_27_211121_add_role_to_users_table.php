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
        Schema::table('users', function (Blueprint $table) {
            // Agregar columna role con enum
            // super_admin: JSTACK (dueño de la plataforma)
            // admin: Empresas que gestionan sus empleados
            // client: Emprendedores/individuales con un solo perfil
            $table->enum('role', ['super_admin', 'admin', 'client'])
                ->default('client')
                ->after('email');

            // Eliminar la columna is_admin ya que ahora usamos role
            $table->dropColumn('is_admin');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Restaurar columna is_admin
            $table->boolean('is_admin')->default(false);

            // Eliminar columna role
            $table->dropColumn('role');
        });
    }
};
