<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            
            // 1. Campos de Información del Negocio (Faltantes en tu SQL)
            if (!Schema::hasColumn('accounts', 'description')) {
                $table->text('description')->nullable()->after('name');
            }
            if (!Schema::hasColumn('accounts', 'phone')) {
                $table->string('phone')->nullable()->after('description');
            }
            if (!Schema::hasColumn('accounts', 'address')) {
                $table->string('address')->nullable()->after('phone');
            }

            // 2. URLs de Imágenes (Para que el controlador las guarde aquí y no solo en profile_media)
            if (!Schema::hasColumn('accounts', 'logo_url')) {
                $table->string('logo_url')->nullable()->after('slug');
            }
            if (!Schema::hasColumn('accounts', 'cover_url')) {
                $table->string('cover_url')->nullable()->after('logo_url');
            }

            // 3. Redes Sociales (CRÍTICO para que funcione tu App)
            if (!Schema::hasColumn('accounts', 'whatsapp')) {
                $table->string('whatsapp')->nullable()->after('cover_url');
            }
            if (!Schema::hasColumn('accounts', 'instagram')) {
                $table->string('instagram')->nullable()->after('whatsapp');
            }
            if (!Schema::hasColumn('accounts', 'tiktok')) {
                $table->string('tiktok')->nullable()->after('instagram');
            }
            if (!Schema::hasColumn('accounts', 'facebook')) {
                $table->string('facebook')->nullable()->after('tiktok');
            }
        });
    }

    public function down(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            $table->dropColumn([
                'description', 'phone', 'address', 
                'logo_url', 'cover_url', 
                'whatsapp', 'instagram', 'tiktok', 'facebook'
            ]);
        });
    }
};