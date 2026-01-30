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
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->onDelete('cascade');

            // Plan info
            $table->string('plan_type'); // personal, pro, corporativo
            $table->string('billing_cycle'); // monthly, yearly
            $table->integer('amount'); // Monto en centimos (2900 = S/29.00)
            $table->string('currency', 3)->default('PEN');

            // Culqi IDs
            $table->string('culqi_customer_id')->nullable();
            $table->string('culqi_card_id')->nullable();
            $table->string('culqi_plan_id')->nullable();
            $table->string('culqi_subscription_id')->nullable();

            // Status
            $table->enum('status', ['active', 'cancelled', 'past_due', 'trialing', 'unpaid'])->default('active');

            // Dates
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('current_period_start')->nullable();
            $table->timestamp('current_period_end')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            // Metadata
            $table->json('metadata')->nullable();

            $table->timestamps();

            $table->index(['account_id', 'status']);
            $table->index('culqi_subscription_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
