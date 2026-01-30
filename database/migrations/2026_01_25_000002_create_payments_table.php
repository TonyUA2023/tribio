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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->onDelete('cascade');
            $table->foreignId('subscription_id')->nullable()->constrained()->onDelete('set null');

            // Payment details
            $table->integer('amount'); // Monto en centimos
            $table->string('currency', 3)->default('PEN');
            $table->string('description')->nullable();

            // Culqi info
            $table->string('culqi_charge_id')->nullable();
            $table->string('culqi_token_id')->nullable();

            // Card info (masked)
            $table->string('card_brand')->nullable(); // Visa, Mastercard, etc
            $table->string('card_last_four', 4)->nullable();

            // Status
            $table->enum('status', ['pending', 'succeeded', 'failed', 'refunded', 'partially_refunded'])->default('pending');
            $table->string('failure_code')->nullable();
            $table->string('failure_message')->nullable();

            // Refund info
            $table->integer('amount_refunded')->default(0);
            $table->string('refund_id')->nullable();
            $table->timestamp('refunded_at')->nullable();

            // Customer info
            $table->string('customer_email')->nullable();
            $table->string('customer_name')->nullable();

            // Metadata
            $table->json('culqi_response')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();

            $table->index(['account_id', 'status']);
            $table->index('culqi_charge_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
