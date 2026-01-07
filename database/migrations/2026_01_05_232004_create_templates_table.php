<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('templates', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nombre de la plantilla (ej: "Barber Premium", "Classic Barber")
            $table->string('slug')->unique(); // Slug único (ej: "barber-premium")
            $table->text('description')->nullable(); // Descripción de la plantilla
            $table->string('preview_image')->nullable(); // URL de imagen de vista previa
            $table->string('category')->default('barber'); // Categoría: barber, salon, spa, etc.

            // Configuración en JSON
            $table->json('config'); // Configuración completa de la plantilla

            // Control
            $table->boolean('is_active')->default(true); // Si está disponible para usar
            $table->boolean('is_premium')->default(false); // Si requiere plan premium

            $table->timestamps();
        });

        // Tabla pivot: cuentas que usan templates
        Schema::create('account_template', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->onDelete('cascade');
            $table->foreignId('template_id')->constrained()->onDelete('cascade');
            $table->json('customizations')->nullable(); // Personalizaciones sobre la plantilla base
            $table->timestamps();

            $table->unique(['account_id']); // Una cuenta solo puede tener una plantilla activa
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('account_template');
        Schema::dropIfExists('templates');
    }
};
