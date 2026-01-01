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
        // Almacena las plantillas pre-diseñadas que los clientes del plan "SaaS" pueden elegir
        Schema::create('templates', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Ej. "Plantilla Corporativa", "Portafolio Visual"
            $table->string('blade_view_path'); // Ej. "templates.corporate", "templates.portfolio"
            $table->text('description')->nullable();
            $table->string('preview_image_url')->nullable(); // Imagen de vista previa
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('templates');
    }
};
