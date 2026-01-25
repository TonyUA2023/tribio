<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Review;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MigrateGuestDataToCustomersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Este seeder migra todos los datos existentes de bookings, orders y reviews
     * a la nueva tabla customers, creando registros únicos por teléfono.
     */
    public function run(): void
    {
        $this->command->info('🚀 Iniciando migración de datos a customers...');

        DB::transaction(function () {
            // 1. Migrar desde Bookings
            $this->command->info('📅 Migrando bookings...');
            $this->migrateFromBookings();

            // 2. Migrar desde Orders
            $this->command->info('🛒 Migrando orders...');
            $this->migrateFromOrders();

            // 3. Migrar desde Reviews
            $this->command->info('⭐ Migrando reviews...');
            $this->migrateFromReviews();

            // 4. Actualizar timestamps de actividad
            $this->command->info('⏰ Actualizando timestamps de actividad...');
            $this->updateLastActivityTimestamps();

            $this->command->info('✅ Migración completada exitosamente!');
        });

        // Mostrar estadísticas
        $this->showStats();
    }

    /**
     * Migrar datos desde bookings a customers.
     */
    protected function migrateFromBookings(): void
    {
        $bookings = Booking::whereNull('customer_id')
            ->whereNotNull('client_phone')
            ->orderBy('created_at', 'asc')
            ->get();

        $migratedCount = 0;

        foreach ($bookings as $booking) {
            // Normalizar teléfono
            $cleanPhone = $this->normalizePhone($booking->client_phone);

            if (empty($cleanPhone)) {
                $this->command->warn("⚠️ Booking #{$booking->id} sin teléfono válido, omitiendo...");
                continue;
            }

            // Buscar o crear customer
            $customer = Customer::firstOrCreate(
                [
                    'account_id' => $booking->account_id,
                    'phone' => $cleanPhone,
                ],
                [
                    'name' => $booking->client_name ?? 'Cliente',
                    'email' => $booking->client_email,
                    'ip_address' => $booking->ip_address,
                    'user_agent' => $booking->user_agent,
                    'preferences' => [
                        'notification_channel' => $booking->notification_channel ?? 'email'
                    ],
                ]
            );

            // Actualizar customer_id en booking
            $booking->update(['customer_id' => $customer->id]);
            $migratedCount++;
        }

        $this->command->info("   ✓ {$migratedCount} bookings migrados");
    }

    /**
     * Migrar datos desde orders a customers.
     */
    protected function migrateFromOrders(): void
    {
        $orders = Order::whereNull('customer_id')
            ->whereNotNull('customer_phone')
            ->orderBy('created_at', 'asc')
            ->get();

        $migratedCount = 0;

        foreach ($orders as $order) {
            // Normalizar teléfono
            $cleanPhone = $this->normalizePhone($order->customer_phone);

            if (empty($cleanPhone)) {
                $this->command->warn("⚠️ Order #{$order->id} sin teléfono válido, omitiendo...");
                continue;
            }

            // Buscar o crear customer
            $customer = Customer::firstOrCreate(
                [
                    'account_id' => $order->account_id,
                    'phone' => $cleanPhone,
                ],
                [
                    'name' => $order->customer_name ?? 'Cliente',
                    'email' => $order->customer_email,
                    'preferences' => [
                        'notification_channel' => $order->notification_channel ?? 'email'
                    ],
                    'addresses' => !empty($order->delivery_address) ? [
                        [
                            'label' => 'Dirección de entrega',
                            'address' => $order->delivery_address,
                            'is_default' => true,
                        ]
                    ] : [],
                ]
            );

            // Actualizar customer_id en order
            $order->update(['customer_id' => $customer->id]);
            $migratedCount++;
        }

        $this->command->info("   ✓ {$migratedCount} orders migrados");
    }

    /**
     * Migrar datos desde reviews a customers.
     */
    protected function migrateFromReviews(): void
    {
        $reviews = Review::whereNull('customer_id')
            ->whereNotNull('client_phone')
            ->orderBy('created_at', 'asc')
            ->get();

        $migratedCount = 0;

        foreach ($reviews as $review) {
            // Normalizar teléfono
            $cleanPhone = $this->normalizePhone($review->client_phone);

            if (empty($cleanPhone)) {
                $this->command->warn("⚠️ Review #{$review->id} sin teléfono válido, omitiendo...");
                continue;
            }

            // Buscar o crear customer
            $customer = Customer::firstOrCreate(
                [
                    'account_id' => $review->account_id,
                    'phone' => $cleanPhone,
                ],
                [
                    'name' => $review->client_name ?? 'Cliente',
                    'email' => $review->client_email ?? null,
                ]
            );

            // Actualizar customer_id en review
            $review->update(['customer_id' => $customer->id]);
            $migratedCount++;
        }

        $this->command->info("   ✓ {$migratedCount} reviews migrados");
    }

    /**
     * Actualizar timestamps de última actividad de cada customer.
     */
    protected function updateLastActivityTimestamps(): void
    {
        // Actualizar last_booking_at
        DB::statement('
            UPDATE customers c
            SET last_booking_at = (
                SELECT MAX(created_at)
                FROM bookings
                WHERE customer_id = c.id
            )
            WHERE EXISTS (
                SELECT 1
                FROM bookings
                WHERE customer_id = c.id
            )
        ');

        // Actualizar last_order_at
        DB::statement('
            UPDATE customers c
            SET last_order_at = (
                SELECT MAX(created_at)
                FROM orders
                WHERE customer_id = c.id
            )
            WHERE EXISTS (
                SELECT 1
                FROM orders
                WHERE customer_id = c.id
            )
        ');

        $this->command->info("   ✓ Timestamps actualizados");
    }

    /**
     * Normalizar número de teléfono (remover espacios, guiones, paréntesis).
     */
    protected function normalizePhone(string $phone): string
    {
        return preg_replace('/[\s\-\(\)\.\+]/', '', $phone);
    }

    /**
     * Mostrar estadísticas de la migración.
     */
    protected function showStats(): void
    {
        $this->command->info('');
        $this->command->info('📊 Estadísticas de migración:');
        $this->command->info('─────────────────────────────────────');

        $totalCustomers = Customer::count();
        $registeredCustomers = Customer::whereNotNull('user_id')->count();
        $guestCustomers = Customer::whereNull('user_id')->count();

        $bookingsLinked = Booking::whereNotNull('customer_id')->count();
        $ordersLinked = Order::whereNotNull('customer_id')->count();
        $reviewsLinked = Review::whereNotNull('customer_id')->count();

        $this->command->info("👥 Total customers creados: {$totalCustomers}");
        $this->command->info("   ├─ Registrados: {$registeredCustomers}");
        $this->command->info("   └─ Guests: {$guestCustomers}");
        $this->command->info('');
        $this->command->info("📅 Bookings vinculados: {$bookingsLinked}");
        $this->command->info("🛒 Orders vinculados: {$ordersLinked}");
        $this->command->info("⭐ Reviews vinculados: {$reviewsLinked}");
        $this->command->info('─────────────────────────────────────');
    }
}
