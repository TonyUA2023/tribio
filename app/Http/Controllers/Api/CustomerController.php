<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CustomerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function __construct(
        protected CustomerService $customerService
    ) {}

    /**
     * Obtener el perfil del cliente autenticado.
     *
     * GET /api/customer/me
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isCustomer()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Cargar customer y sus relaciones
        $user->load(['customer']);

        return response()->json([
            'success' => true,
            'user' => $user,
            'customer' => $user->customer,
        ]);
    }

    /**
     * Obtener estadísticas del cliente en un negocio específico.
     *
     * GET /api/customer/stats/{accountId}
     */
    public function stats(Request $request, int $accountId): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isCustomer()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Buscar customer para este account
        $customer = \App\Models\Customer::where('user_id', $user->id)
            ->where('account_id', $accountId)
            ->first();

        if (!$customer) {
            return response()->json([
                'success' => true,
                'stats' => [
                    'total_bookings' => 0,
                    'total_orders' => 0,
                    'total_reviews' => 0,
                    'total_spent' => 0,
                    'last_visit' => null,
                ],
            ]);
        }

        $stats = $this->customerService->getCustomerStats($customer);

        return response()->json([
            'success' => true,
            'stats' => $stats,
        ]);
    }

    /**
     * Actualizar preferencias del cliente.
     *
     * PUT /api/customer/preferences
     */
    public function updatePreferences(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isCustomer()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'preferences' => 'required|array',
            'preferences.notification_channel' => 'nullable|in:email,sms,whatsapp',
            'preferences.language' => 'nullable|string',
            'preferences.receive_promotions' => 'nullable|boolean',
        ]);

        // Buscar customer para este account
        $customer = \App\Models\Customer::where('user_id', $user->id)
            ->where('account_id', $validated['account_id'])
            ->first();

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found for this business',
            ], 404);
        }

        $updatedCustomer = $this->customerService->updatePreferences(
            $customer,
            $validated['preferences']
        );

        return response()->json([
            'success' => true,
            'message' => 'Preferences updated successfully',
            'customer' => $updatedCustomer,
        ]);
    }

    /**
     * Agregar una dirección al cliente.
     *
     * POST /api/customer/addresses
     */
    public function addAddress(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isCustomer()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'label' => 'required|string|max:100',
            'address' => 'required|string',
            'is_default' => 'nullable|boolean',
        ]);

        // Buscar customer para este account
        $customer = \App\Models\Customer::where('user_id', $user->id)
            ->where('account_id', $validated['account_id'])
            ->first();

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found for this business',
            ], 404);
        }

        $updatedCustomer = $this->customerService->addAddress(
            $customer,
            $validated['label'],
            $validated['address'],
            $validated['is_default'] ?? false
        );

        return response()->json([
            'success' => true,
            'message' => 'Address added successfully',
            'customer' => $updatedCustomer,
        ]);
    }

    /**
     * Obtener todas las direcciones del cliente.
     *
     * GET /api/customer/addresses/{accountId}
     */
    public function getAddresses(Request $request, int $accountId): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isCustomer()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $customer = \App\Models\Customer::where('user_id', $user->id)
            ->where('account_id', $accountId)
            ->first();

        if (!$customer) {
            return response()->json([
                'success' => true,
                'addresses' => [],
            ]);
        }

        return response()->json([
            'success' => true,
            'addresses' => $customer->addresses ?? [],
        ]);
    }

    /**
     * Obtener historial de negocios visitados.
     *
     * GET /api/customer/businesses
     */
    public function getBusinesses(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isCustomer()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Obtener todos los customers del usuario con sus accounts
        $customers = \App\Models\Customer::where('user_id', $user->id)
            ->with(['account.profile'])
            ->get();

        $businesses = $customers->map(function ($customer) {
            return [
                'account_id' => $customer->account_id,
                'account_slug' => $customer->account->slug,
                'business_name' => $customer->account->profile->business_name ?? 'Negocio',
                'logo' => $customer->account->profile->logo ?? null,
                'total_bookings' => $customer->bookings()->count(),
                'total_orders' => $customer->orders()->count(),
                'last_booking_at' => $customer->last_booking_at,
                'last_order_at' => $customer->last_order_at,
                'last_visit' => $customer->last_booking_at > $customer->last_order_at
                    ? $customer->last_booking_at
                    : $customer->last_order_at,
            ];
        });

        return response()->json([
            'success' => true,
            'businesses' => $businesses,
        ]);
    }
}
