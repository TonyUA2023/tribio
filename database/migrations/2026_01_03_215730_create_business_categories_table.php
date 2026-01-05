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
        Schema::create('business_categories', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique(); // 'barber', 'restaurant', 'gym'
            $table->string('name'); // 'Barbería', 'Restaurante', 'Gimnasio'
            $table->string('icon')->nullable(); // 'scissors', 'utensils', 'dumbbell'
            $table->text('description')->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('business_categories')->onDelete('cascade');

            // Módulos habilitados por defecto para esta categoría
            // Ejemplo: ["bookings", "gallery", "reviews", "stories"]
            $table->json('default_modules')->nullable();

            // Configuración por defecto para los módulos
            // Ejemplo: {"bookings": {"slotDuration": 30}, "theme": {"primaryColor": "#fbbf24"}}
            $table->json('default_config')->nullable();

            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('business_categories');
    }
};
