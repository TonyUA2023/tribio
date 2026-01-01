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
        // Esta es la "mini-página" o "perfil" individual.
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            
            // A qué cuenta pertenece este perfil
            $table->foreignId('account_id')->constrained('accounts')->onDelete('cascade');

            $table->string('name'); // "Juan Pérez" o "Portafolio de Bodas"
            $table->string('title')->nullable(); // "Gerente de Ventas" o "Fotógrafa"
            $table->string('slug'); // "juan-perez" o "portafolio"

            // --- LA LÓGICA HÍBRIDA (SaaS vs Agencia) ---
            $table->enum('render_type', ['template', 'custom']); // 'template' = SaaS, 'custom' = A medida

            // Opción 1: Si render_type es 'template'
            $table->foreignId('template_id')->nullable()->constrained('templates')->onDelete('set null');

            // Opción 2: Si render_type es 'custom'
            $table->string('custom_view_path')->nullable(); // Ej. "custom.tractoleo-gerente", "custom.tony-dev"

            // Columna JSON flexible para guardar todos los datos (enlaces, bio, fotos, etc.)
            // Esto evita tener 50 columnas y da flexibilidad.
            $table->json('data')->nullable(); 

            $table->timestamps();

            // Un perfil debe ser único por cuenta.
            // (Tractoleo no puede tener dos perfiles "juan-perez")
            // (Permite 'tractoleo/gerente1' y 'anagarcia/gerente1')
            $table->unique(['account_id', 'slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
