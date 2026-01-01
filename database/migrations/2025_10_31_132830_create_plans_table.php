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
        // Almacena los planes de suscripción que ofreces (Básico, Premium, Empresa, Custom)
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Ej. "Plan Personal", "Plan Empresa", "Servicio Custom"
            $table->decimal('price', 10, 2)->default(0.00);
            $table->enum('billing_cycle', ['monthly', 'annual', 'onetime']); // Ciclo de facturación
            $table->enum('type', ['saas', 'service']); // 'saas' para plantillas, 'service' para diseño a medida
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
