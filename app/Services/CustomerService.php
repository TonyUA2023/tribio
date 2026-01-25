<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CustomerService
{
    /**
     * Encuentra o crea un customer para un booking/order.
     *
     * Este método es el corazón del sistema de customers. Se encarga de:
     * - Buscar si ya existe un customer con ese teléfono en el negocio
     * - Actualizar sus datos si cambió algo (nombre, email)
     * - Crear un nuevo customer si no existe
     * - Vincular automáticamente con un user si está autenticado
     *
     * @param Account $account El negocio al que pertenece el customer
     * @param array $data Datos del customer ['name', 'phone', 'email', 'preferences']
     * @param User|null $user Usuario autenticado (null si es guest)
     * @return Customer
     */
    public function findOrCreateCustomer(Account $account, array $data, ?User $user = null): Customer
    {
        // Normalizar el teléfono (remover espacios, guiones, paréntesis)
        $cleanPhone = $this->normalizePhone($data['phone']);

        // Buscar por teléfono primero (identificador único por negocio)
        $customer = Customer::where('account_id', $account->id)
            ->where('phone', $cleanPhone)
            ->first();

        if ($customer) {
            // Customer ya existe - actualizar datos si hay cambios
            $updateData = [];

            if (isset($data['name']) && $data['name'] !== $customer->name) {
                $updateData['name'] = $data['name'];
            }

            if (isset($data['email']) && $data['email'] !== $customer->email) {
                $updateData['email'] = $data['email'];
            }

            // Si está autenticado y el customer no tiene user_id, vincularlo
            if ($user && !$customer->user_id) {
                $updateData['user_id'] = $user->id;
            }

            if (!empty($updateData)) {
                $customer->update($updateData);
            }

            return $customer;
        }

        // Customer no existe - crear nuevo
        return Customer::create([
            'account_id' => $account->id,
            'user_id' => $user?->id,
            'name' => $data['name'],
            'phone' => $cleanPhone,
            'email' => $data['email'] ?? null,
            'preferences' => $data['preferences'] ?? [
                'notification_channel' => $data['notification_channel'] ?? 'email'
            ],
            'addresses' => $data['addresses'] ?? [],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Vincula un user a un customer existente.
     *
     * Útil cuando un guest se registra y queremos asociar su historial.
     *
     * @param Customer $customer
     * @param User $user
     * @return Customer
     * @throws \Exception
     */
    public function attachUserToCustomer(Customer $customer, User $user): Customer
    {
        if ($customer->user_id) {
            throw new \Exception('Customer already has a user account');
        }

        $customer->update(['user_id' => $user->id]);

        return $customer;
    }

    /**
     * Encuentra todos los customers de un user en diferentes negocios.
     *
     * Un user puede ser customer de múltiples negocios.
     *
     * @param User $user
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getUserCustomers(User $user)
    {
        return Customer::where('user_id', $user->id)
            ->with('account')
            ->get();
    }

    /**
     * Busca customers por teléfono o email en un negocio.
     *
     * @param Account $account
     * @param string $phoneOrEmail
     * @return Customer|null
     */
    public function findCustomerByPhoneOrEmail(Account $account, string $phoneOrEmail): ?Customer
    {
        $cleanPhone = $this->normalizePhone($phoneOrEmail);

        return Customer::where('account_id', $account->id)
            ->where(function ($query) use ($cleanPhone, $phoneOrEmail) {
                $query->where('phone', $cleanPhone)
                    ->orWhere('email', $phoneOrEmail);
            })
            ->first();
    }

    /**
     * Migra todos los bookings/orders de un customer guest a uno autenticado.
     *
     * Cuando un guest se registra con el mismo teléfono, podemos unificar su historial.
     *
     * @param Customer $fromCustomer Customer guest (sin user_id)
     * @param Customer $toCustomer Customer autenticado (con user_id)
     * @return array Resumen de registros migrados
     */
    public function mergeCustomers(Customer $fromCustomer, Customer $toCustomer): array
    {
        if ($fromCustomer->id === $toCustomer->id) {
            throw new \Exception('Cannot merge customer with itself');
        }

        if ($fromCustomer->account_id !== $toCustomer->account_id) {
            throw new \Exception('Customers must belong to the same account');
        }

        DB::beginTransaction();

        try {
            $stats = [
                'bookings' => 0,
                'orders' => 0,
                'reviews' => 0,
            ];

            // Migrar bookings
            $stats['bookings'] = $fromCustomer->bookings()
                ->update(['customer_id' => $toCustomer->id]);

            // Migrar orders
            $stats['orders'] = $fromCustomer->orders()
                ->update(['customer_id' => $toCustomer->id]);

            // Migrar reviews
            $stats['reviews'] = $fromCustomer->reviews()
                ->update(['customer_id' => $toCustomer->id]);

            // Actualizar timestamps del customer destino
            $toCustomer->update([
                'last_booking_at' => max($fromCustomer->last_booking_at, $toCustomer->last_booking_at),
                'last_order_at' => max($fromCustomer->last_order_at, $toCustomer->last_order_at),
            ]);

            // Eliminar customer origen (ya no tiene registros)
            $fromCustomer->delete();

            DB::commit();

            return $stats;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Obtiene estadísticas de un customer.
     *
     * @param Customer $customer
     * @return array
     */
    public function getCustomerStats(Customer $customer): array
    {
        return [
            'total_bookings' => $customer->bookings()->count(),
            'pending_bookings' => $customer->bookings()->where('status', 'pending')->count(),
            'completed_bookings' => $customer->bookings()->where('status', 'completed')->count(),
            'total_orders' => $customer->orders()->count(),
            'total_spent' => $customer->orders()->sum('total'),
            'total_reviews' => $customer->reviews()->count(),
            'average_rating' => $customer->reviews()->avg('rating'),
            'last_activity' => max($customer->last_booking_at, $customer->last_order_at),
            'is_registered' => $customer->isRegistered(),
        ];
    }

    /**
     * Actualiza las preferencias de un customer.
     *
     * @param Customer $customer
     * @param array $preferences
     * @return Customer
     */
    public function updatePreferences(Customer $customer, array $preferences): Customer
    {
        $currentPreferences = $customer->preferences ?? [];
        $newPreferences = array_merge($currentPreferences, $preferences);

        $customer->update(['preferences' => $newPreferences]);

        return $customer;
    }

    /**
     * Agrega una dirección a un customer.
     *
     * @param Customer $customer
     * @param array $address ['label', 'address', 'is_default', 'coordinates']
     * @return Customer
     */
    public function addAddress(Customer $customer, array $address): Customer
    {
        $addresses = $customer->addresses ?? [];

        // Si esta es la primera dirección o es marcada como default, desmarcar las demás
        if (empty($addresses) || ($address['is_default'] ?? false)) {
            foreach ($addresses as &$addr) {
                $addr['is_default'] = false;
            }
        }

        // Si no hay direcciones, esta será la default
        if (empty($addresses)) {
            $address['is_default'] = true;
        }

        $addresses[] = $address;

        $customer->update(['addresses' => $addresses]);

        return $customer;
    }

    /**
     * Normaliza un número de teléfono removiendo caracteres especiales.
     *
     * @param string $phone
     * @return string
     */
    protected function normalizePhone(string $phone): string
    {
        // Remover espacios, guiones, paréntesis, puntos
        return preg_replace('/[\s\-\(\)\.\+]/', '', $phone);
    }
}
