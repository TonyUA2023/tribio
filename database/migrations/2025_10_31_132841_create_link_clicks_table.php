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
        // Tabla simple para analíticas de clics en enlaces
        Schema::create('link_clicks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('profile_id')->constrained('profiles')->onDelete('cascade');
            $table->string('link_url', 2048); // El enlace al que se hizo clic
            $table->string('link_title')->nullable(); // El título del botón
            $table->ipAddress('ip_address')->nullable();
            $table->timestamp('clicked_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('link_clicks');
    }
};
