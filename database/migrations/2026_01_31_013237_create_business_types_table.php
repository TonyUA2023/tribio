<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Tabla de Tipos de Negocio - Define el flujo/sistema principal
        Schema::create('business_types', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique(); // 'store', 'appointments', 'restaurant'
            $table->string('name'); // 'Tienda Virtual', 'Reserva de Citas', 'Restaurante'
            $table->text('description')->nullable();
            $table->string('icon')->nullable(); // Icono Lucide
            $table->string('color')->nullable(); // Color primario del tipo

            // Módulos que se habilitan automáticamente para este tipo
            $table->json('default_modules')->nullable();

            // Configuración por defecto del tipo
            $table->json('default_config')->nullable();

            // Features principales que muestra en la selección
            $table->json('features')->nullable();

            $table->boolean('is_active')->default(true);
            $table->boolean('coming_soon')->default(false); // Para tipos próximamente
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Agregar business_type_id a accounts
        Schema::table('accounts', function (Blueprint $table) {
            $table->foreignId('business_type_id')
                ->nullable()
                ->after('business_category_id')
                ->constrained('business_types')
                ->onDelete('set null');
        });

        // Insertar los tipos de negocio iniciales
        DB::table('business_types')->insert([
            [
                'slug' => 'appointments',
                'name' => 'Reserva de Citas',
                'description' => 'Ideal para barberías, salones de belleza, consultorios, estudios de tatuaje y cualquier negocio que trabaje con agenda.',
                'icon' => 'calendar-check',
                'color' => 'cyan',
                'default_modules' => json_encode(['bookings', 'reviews', 'stories', 'gallery']),
                'default_config' => json_encode([
                    'bookings' => ['slot_duration' => 30, 'advance_days' => 30],
                ]),
                'features' => json_encode([
                    'Sistema de reservas online 24/7',
                    'Calendario de disponibilidad',
                    'Recordatorios automáticos',
                    'Gestión de servicios y precios',
                ]),
                'is_active' => true,
                'coming_soon' => false,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'store',
                'name' => 'Tienda Virtual',
                'description' => 'Para negocios que venden productos físicos o digitales. Catálogo, carrito de compras y gestión de pedidos.',
                'icon' => 'shopping-bag',
                'color' => 'emerald',
                'default_modules' => json_encode(['products', 'orders', 'cart', 'payments']),
                'default_config' => json_encode([
                    'currency' => 'PEN',
                    'shipping' => ['enabled' => true],
                ]),
                'features' => json_encode([
                    'Catálogo de productos ilimitado',
                    'Carrito de compras integrado',
                    'Gestión de pedidos y envíos',
                    'Múltiples métodos de pago',
                ]),
                'is_active' => true,
                'coming_soon' => false,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'restaurant',
                'name' => 'Restaurante / Cafetería',
                'description' => 'Para restaurantes, cafeterías, bares y negocios de comida. Menú digital, pedidos y reservas de mesa.',
                'icon' => 'utensils',
                'color' => 'amber',
                'default_modules' => json_encode(['menu', 'table-reservations', 'orders', 'delivery']),
                'default_config' => json_encode([
                    'menu' => ['show_prices' => true],
                    'delivery' => ['enabled' => false],
                ]),
                'features' => json_encode([
                    'Menú digital con fotos',
                    'Pedidos para llevar o delivery',
                    'Reserva de mesas',
                    'QR para escanear desde la mesa',
                ]),
                'is_active' => true,
                'coming_soon' => true, // Próximamente
                'sort_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            $table->dropForeign(['business_type_id']);
            $table->dropColumn('business_type_id');
        });

        Schema::dropIfExists('business_types');
    }
};
