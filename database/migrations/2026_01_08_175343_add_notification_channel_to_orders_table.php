<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Opciones: 'email', 'sms', 'whatsapp'
            // Por defecto 'email' para no romper pedidos antiguos
            $table->enum('notification_channel', ['email', 'sms', 'whatsapp'])->default('email')->after('customer_email');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('notification_channel');
        });
    }
};
