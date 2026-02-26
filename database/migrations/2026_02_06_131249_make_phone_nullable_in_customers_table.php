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
        Schema::table('customers', function (Blueprint $table) {
            // Drop the old unique constraint on account_id + phone
            $table->dropUnique(['account_id', 'phone']);

            // Make phone nullable (users may not have phone when first created)
            $table->string('phone')->nullable()->change();

            // Add unique constraint on account_id + user_id instead
            $table->unique(['account_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropUnique(['account_id', 'user_id']);
            $table->string('phone')->nullable(false)->change();
            $table->unique(['account_id', 'phone']);
        });
    }
};
