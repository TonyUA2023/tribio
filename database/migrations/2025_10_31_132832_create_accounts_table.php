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
        // La entidad principal de tu cliente (quien paga). Puede ser B2B o B2C.
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();

            // El 'user' (de la tabla 'users' de Laravel) que es dueño y administra esta cuenta
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // El plan al que está suscrito
            $table->foreignId('plan_id')->nullable()->constrained('plans')->onDelete('set null');

            $table->string('name'); // "Tractoleo S.A.C." o "Ana García"
            $table->enum('type', ['company', 'personal']); // El tipo de cliente
            $table->string('slug')->unique(); // Para la URL (ej. "tractoleo" o "anagarcia")

            // Control de pagos manual
            $table->enum('payment_status', ['active', 'due', 'suspended'])->default('active');
            $table->timestamp('next_billing_date')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
