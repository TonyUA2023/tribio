<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\User;
use App\Services\CulqiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CulqiController extends Controller
{
    protected CulqiService $culqiService;

    public function __construct(CulqiService $culqiService)
    {
        $this->culqiService = $culqiService;
    }

    /**
     * Get Culqi public key for frontend
     */
    public function getPublicKey(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'public_key' => $this->culqiService->getPublicKey(),
        ]);
    }

    /**
     * Get available plans
     */
    public function getPlans(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'plans' => Subscription::PLANS,
        ]);
    }

    /**
     * Process payment and create account (Registration flow)
     */
    /**
     * Process payment and create account (Registration flow)
     */
    public function processRegistration(Request $request): JsonResponse
    {
        $request->validate([
            'token_id'      => 'required|string',
            'email'         => 'required|string|email',
            'slug'          => 'required|string|min:3|max:50',
            'password'      => 'required|string|min:6',
            // Datos de la Persona (Usuario)
            'first_name'    => 'required|string|max:50',
            'last_name'     => 'required|string|max:50',
            'phone'         => 'required|numeric', 
            'country_code'  => 'required|string|max:3',
            // Datos del Negocio (Cuenta)
            'business_name' => 'required|string|max:100',
            'plan_type'     => 'required|in:personal,pro',
            'billing_cycle' => 'required|in:monthly,yearly',
        ], [
            // Mensajes personalizados para que sepas qué falló
            'first_name.required' => 'El nombre del propietario es obligatorio.',
            'last_name.required'  => 'El apellido del propietario es obligatorio.',
            'phone.numeric'       => 'El celular debe contener solo números.',
        ]);

        // 1. Validaciones de disponibilidad
        if (Account::where('slug', $request->slug)->exists()) {
            return response()->json(['success' => false, 'message' => 'El enlace ya está en uso'], 422);
        }

        if (User::where('email', $request->email)->exists()) {
            return response()->json(['success' => false, 'message' => 'El correo ya está registrado'], 422);
        }

        // 2. Cálculo de precio y conversión a céntimos (Culqi v2 requiere enteros)
        $amountInSoles = Subscription::calculatePrice($request->plan_type, $request->billing_cycle);
        $amountInCents = (int) round($amountInSoles);

        // Si el monto es 0, redirigimos al flujo de cuenta gratuita
        if ($amountInCents === 0) {
            return $this->createFreeAccount($request);
        }

        // 3. Proceso de Pago con Culqi
        try {
            $antifraudDetails = [
                'first_name'   => $request->first_name,
                'last_name'    => $request->last_name,
                'phone_number' => $request->phone, // Enviado sin "+" ni espacios
                'country_code' => $request->country_code ?? 'PE',
            ];

            $chargeResult = $this->culqiService->createCharge(
                tokenId: $request->token_id,
                amount: $amountInCents,
                currencyCode: 'PEN',
                email: $request->email,
                description: "Suscripción Tribio - " . $request->business_name,
                metadata: [
                    'slug'          => $request->slug,
                    'plan_type'     => $request->plan_type,
                    'billing_cycle' => $request->billing_cycle,
                    'business_name' => $request->business_name
                ],
                antifraudDetails: $antifraudDetails
            );

            if (!$chargeResult['success']) {
                Log::warning('Culqi: Pago denegado en registro', [
                    'email' => $request->email,
                    'error' => $chargeResult['error'] ?? null
                ]);

                return response()->json([
                    'success'    => false,
                    'message'    => $chargeResult['message'] ?? 'La tarjeta fue rechazada por el banco.',
                    'error_type' => 'payment_failed'
                ], 402);
            }

            // 4. Registro en Base de Datos (Uso de Transacción)
            return DB::transaction(function () use ($request, $chargeResult, $amountInCents) {
                
                // A. Crear al Usuario (Dueño)
                $user = User::create([
                    'name'      => $request->first_name,
                    'last_name' => $request->last_name,
                    'phone'     => $request->phone,
                    'email'     => $request->email,
                    'password'  => Hash::make($request->password),
                    'role'      => 'client',
                ]);

                // B. Crear la Cuenta (Negocio) vinculada al usuario
                $account = Account::create([
                    'user_id' => $user->id,
                    'name'    => $request->business_name,
                    'slug'    => Str::slug($request->slug),
                ]);

                // C. Crear Suscripción y Pago
                $periodEnd = $request->billing_cycle === 'yearly' ? now()->addYear() : now()->addMonth();

                $subscription = Subscription::create([
                    'account_id'           => $account->id,
                    'plan_type'            => $request->plan_type,
                    'billing_cycle'        => $request->billing_cycle,
                    'amount'               => $amountInCents, // Guardamos céntimos o ajusta según tu modelo
                    'currency'             => 'PEN',
                    'status'               => 'active',
                    'current_period_start' => now(),
                    'current_period_end'   => $periodEnd,
                    'metadata'             => ['charge_id' => $chargeResult['data']['id']]
                ]);

                // Registrar el pago en la tabla payments
                Payment::createFromCulqiCharge(
                    chargeData: $chargeResult['data'],
                    accountId: $account->id,
                    subscriptionId: $subscription->id,
                    extraData: [
                        'email' => $request->email,
                        'customer_name' => $request->first_name . ' ' . $request->last_name
                    ]
                );

                Log::info('Registro exitoso: Usuario y Negocio creados', ['user_id' => $user->id, 'account_id' => $account->id]);

                return response()->json([
                    'success' => true,
                    'message' => 'Cuenta y negocio creados exitosamente',
                    'data' => [
                        'account_id'   => $account->id,
                        'slug'         => $account->slug,
                        'redirect_url' => "/{$account->slug}",
                    ],
                ], 201);
            });

        } catch (\Exception $e) {
            Log::error('Error crítico en registro:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success'    => false,
                'message'    => 'Error interno al procesar el registro.',
                'error_type' => 'system_error',
            ], 500);
        }
    }

    /**
     * Create free account (Personal plan)
     */
    protected function createFreeAccount(Request $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            // Create user (client = business owner)
            $user = User::create([
                'name' => $request->business_name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'client',
            ]);

            // Create account
            $account = Account::create([
                'user_id' => $user->id,
                'name' => $request->business_name,
                'slug' => Str::slug($request->slug),
            ]);

            // Create free subscription
            Subscription::create([
                'account_id' => $account->id,
                'plan_type' => 'personal',
                'billing_cycle' => 'monthly',
                'amount' => 0,
                'currency' => 'PEN',
                'status' => 'active',
                'current_period_start' => now(),
                'current_period_end' => null, // Free forever
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cuenta gratuita creada exitosamente',
                'data' => [
                    'account_id' => $account->id,
                    'slug' => $account->slug,
                    'redirect_url' => "/{$account->slug}",
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Free account creation failed', [
                'email' => $request->email,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al crear la cuenta',
            ], 500);
        }
    }

    /**
     * Create account with paid subscription
     */
    protected function createAccountWithSubscription(Request $request, array $chargeData, int $amount): Account
    {
        // Create user (client = business owner)
        $user = User::create([
            'name' => $request->business_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'client',
        ]);

        // Create account
        $account = Account::create([
            'user_id' => $user->id,
            'name' => $request->business_name,
            'slug' => Str::slug($request->slug),
        ]);

        // Calculate period end
        $periodEnd = $request->billing_cycle === 'yearly'
            ? now()->addYear()
            : now()->addMonth();

        // Create subscription
        $subscription = Subscription::create([
            'account_id' => $account->id,
            'plan_type' => $request->plan_type,
            'billing_cycle' => $request->billing_cycle,
            'amount' => $amount,
            'currency' => 'PEN',
            'status' => 'active',
            'current_period_start' => now(),
            'current_period_end' => $periodEnd,
            'metadata' => [
                'first_charge_id' => $chargeData['id'] ?? null,
            ],
        ]);

        // Record payment
        Payment::createFromCulqiCharge(
            chargeData: $chargeData,
            accountId: $account->id,
            subscriptionId: $subscription->id,
            extraData: [
                'email' => $request->email,
                'customer_name' => $request->business_name,
            ]
        );

        return $account;
    }

    /**
     * Add new business to existing user account
     */
    public function addBusiness(Request $request): JsonResponse
    {
        $request->validate([
            'token_id' => 'required|string',
            'slug' => 'required|string|min:3|max:50',
            'business_name' => 'required|string|max:100',
            'plan_type' => 'required|in:personal,pro',
            'billing_cycle' => 'required|in:monthly,yearly',
        ]);

        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Debes iniciar sesión para agregar un nuevo negocio',
            ], 401);
        }

        // Validar que el slug no esté en uso
        if (Account::where('slug', $request->slug)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'El enlace ya está en uso',
            ], 422);
        }

        // Calcular precio
        $amountInSoles = Subscription::calculatePrice($request->plan_type, $request->billing_cycle);
        $amountInCents = (int) round($amountInSoles);

        // Si el monto es 0 (plan gratuito), crear cuenta sin pago
        if ($amountInCents === 0) {
            return $this->createFreeBusinessForUser($request, $user);
        }

        // Proceso de Pago con Culqi
        try {
            $chargeResult = $this->culqiService->createCharge(
                tokenId: $request->token_id,
                amount: $amountInCents,
                currencyCode: 'PEN',
                email: $user->email,
                description: "Nuevo Negocio Tribio - " . $request->business_name,
                metadata: [
                    'user_id' => $user->id,
                    'slug' => $request->slug,
                    'plan_type' => $request->plan_type,
                    'billing_cycle' => $request->billing_cycle,
                    'business_name' => $request->business_name,
                    'is_additional_business' => true,
                ],
                antifraudDetails: [
                    'first_name' => $user->name,
                    'last_name' => $user->last_name ?? '',
                    'phone_number' => $user->phone ?? '',
                    'country_code' => 'PE',
                ]
            );

            if (!$chargeResult['success']) {
                Log::warning('Culqi: Pago denegado para nuevo negocio', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'error' => $chargeResult['error'] ?? null,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => $chargeResult['message'] ?? 'La tarjeta fue rechazada por el banco.',
                    'error_type' => 'payment_failed',
                ], 402);
            }

            // Crear negocio en base de datos
            return DB::transaction(function () use ($request, $user, $chargeResult, $amountInCents) {
                // Crear la cuenta (negocio)
                $account = Account::create([
                    'user_id' => $user->id,
                    'name' => $request->business_name,
                    'slug' => Str::slug($request->slug),
                ]);

                // Crear suscripción
                $periodEnd = $request->billing_cycle === 'yearly' ? now()->addYear() : now()->addMonth();

                $subscription = Subscription::create([
                    'account_id' => $account->id,
                    'plan_type' => $request->plan_type,
                    'billing_cycle' => $request->billing_cycle,
                    'amount' => $amountInCents,
                    'currency' => 'PEN',
                    'status' => 'active',
                    'current_period_start' => now(),
                    'current_period_end' => $periodEnd,
                    'metadata' => ['charge_id' => $chargeResult['data']['id']],
                ]);

                // Registrar pago
                Payment::createFromCulqiCharge(
                    chargeData: $chargeResult['data'],
                    accountId: $account->id,
                    subscriptionId: $subscription->id,
                    extraData: [
                        'email' => $user->email,
                        'customer_name' => $user->name . ' ' . ($user->last_name ?? ''),
                    ]
                );

                Log::info('Nuevo negocio creado para usuario existente', [
                    'user_id' => $user->id,
                    'account_id' => $account->id,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Negocio creado exitosamente',
                    'data' => [
                        'account_id' => $account->id,
                        'slug' => $account->slug,
                        'redirect_url' => "/{$account->slug}",
                    ],
                ], 201);
            });

        } catch (\Exception $e) {
            Log::error('Error al crear nuevo negocio:', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error interno al procesar el registro.',
                'error_type' => 'system_error',
            ], 500);
        }
    }

    /**
     * Create free business for existing user
     */
    protected function createFreeBusinessForUser(Request $request, User $user): JsonResponse
    {
        DB::beginTransaction();

        try {
            // Crear cuenta
            $account = Account::create([
                'user_id' => $user->id,
                'name' => $request->business_name,
                'slug' => Str::slug($request->slug),
            ]);

            // Crear suscripción gratuita
            Subscription::create([
                'account_id' => $account->id,
                'plan_type' => 'personal',
                'billing_cycle' => 'monthly',
                'amount' => 0,
                'currency' => 'PEN',
                'status' => 'active',
                'current_period_start' => now(),
                'current_period_end' => null,
            ]);

            DB::commit();

            Log::info('Nuevo negocio gratuito creado para usuario existente', [
                'user_id' => $user->id,
                'account_id' => $account->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Negocio gratuito creado exitosamente',
                'data' => [
                    'account_id' => $account->id,
                    'slug' => $account->slug,
                    'redirect_url' => "/{$account->slug}",
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error al crear negocio gratuito:', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al crear el negocio',
            ], 500);
        }
    }

    /**
     * Process a one-time payment (for existing accounts)
     */
    public function processPayment(Request $request): JsonResponse
    {
        $request->validate([
            'token_id' => 'required|string',
            'amount' => 'required|integer|min:100',
            'email' => 'required|email',
            'description' => 'nullable|string|max:200',
        ]);

        // Get authenticated account
        $user = $request->user();
        if (!$user || !$user->account) {
            return response()->json([
                'success' => false,
                'message' => 'Cuenta no encontrada',
            ], 404);
        }

        $account = $user->account;

        $chargeResult = $this->culqiService->createCharge(
            tokenId: $request->token_id,
            amount: $request->amount,
            currencyCode: 'PEN',
            email: $request->email,
            description: $request->description,
        );

        if (!$chargeResult['success']) {
            // Record failed payment
            Payment::createFailedPayment(
                errorData: $chargeResult['error'] ?? [],
                accountId: $account->id,
                amount: $request->amount,
                email: $request->email
            );

            return response()->json([
                'success' => false,
                'message' => $chargeResult['message'] ?? 'Error al procesar el pago',
            ], 402);
        }

        // Record successful payment
        $payment = Payment::createFromCulqiCharge(
            chargeData: $chargeResult['data'],
            accountId: $account->id,
            extraData: ['email' => $request->email]
        );

        return response()->json([
            'success' => true,
            'message' => 'Pago procesado exitosamente',
            'data' => [
                'payment_id' => $payment->id,
                'charge_id' => $chargeResult['data']['id'] ?? null,
                'amount' => $payment->formatted_amount,
            ],
        ]);
    }

    /**
     * Upgrade subscription plan
     */
    public function upgradePlan(Request $request): JsonResponse
    {
        $request->validate([
            'token_id' => 'required|string',
            'plan_type' => 'required|in:pro,corporativo',
            'billing_cycle' => 'required|in:monthly,yearly',
        ]);

        $user = $request->user();
        if (!$user || !$user->account) {
            return response()->json([
                'success' => false,
                'message' => 'Cuenta no encontrada',
            ], 404);
        }

        $account = $user->account;
        $amount = Subscription::calculatePrice($request->plan_type, $request->billing_cycle);

        if (!$amount) {
            return response()->json([
                'success' => false,
                'message' => 'Plan no valido',
            ], 422);
        }

        $chargeResult = $this->culqiService->createCharge(
            tokenId: $request->token_id,
            amount: $amount,
            currencyCode: 'PEN',
            email: $user->email,
            description: "Upgrade a Plan " . ucfirst($request->plan_type),
        );

        if (!$chargeResult['success']) {
            return response()->json([
                'success' => false,
                'message' => $chargeResult['message'] ?? 'Error al procesar el pago',
            ], 402);
        }

        DB::beginTransaction();

        try {
            // Cancel current subscription
            $currentSubscription = $account->subscription;
            if ($currentSubscription) {
                $currentSubscription->update([
                    'status' => 'cancelled',
                    'cancelled_at' => now(),
                ]);
            }

            // Calculate period end
            $periodEnd = $request->billing_cycle === 'yearly'
                ? now()->addYear()
                : now()->addMonth();

            // Create new subscription
            $subscription = Subscription::create([
                'account_id' => $account->id,
                'plan_type' => $request->plan_type,
                'billing_cycle' => $request->billing_cycle,
                'amount' => $amount,
                'currency' => 'PEN',
                'status' => 'active',
                'current_period_start' => now(),
                'current_period_end' => $periodEnd,
            ]);

            // Record payment
            Payment::createFromCulqiCharge(
                chargeData: $chargeResult['data'],
                accountId: $account->id,
                subscriptionId: $subscription->id,
                extraData: ['email' => $user->email]
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Plan actualizado exitosamente',
                'data' => [
                    'plan_type' => $subscription->plan_type,
                    'period_end' => $subscription->current_period_end->toDateString(),
                ],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Plan upgrade failed', [
                'account_id' => $account->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el plan',
            ], 500);
        }
    }

    /**
     * Get payment history
     */
    public function getPaymentHistory(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user || !$user->account) {
            return response()->json([
                'success' => false,
                'message' => 'Cuenta no encontrada',
            ], 404);
        }

        $payments = Payment::where('account_id', $user->account->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $payments->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'amount' => $payment->formatted_amount,
                    'status' => $payment->status,
                    'description' => $payment->description,
                    'card' => $payment->card_display,
                    'created_at' => $payment->created_at->toDateTimeString(),
                ];
            }),
            'meta' => [
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'total' => $payments->total(),
            ],
        ]);
    }

    /**
     * Get current subscription info
     */
    public function getSubscription(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user || !$user->account) {
            return response()->json([
                'success' => false,
                'message' => 'Cuenta no encontrada',
            ], 404);
        }

        $subscription = Subscription::where('account_id', $user->account->id)
            ->active()
            ->latest()
            ->first();

        if (!$subscription) {
            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'No hay suscripcion activa',
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $subscription->id,
                'plan_type' => $subscription->plan_type,
                'plan_name' => Subscription::PLANS[$subscription->plan_type]['name'] ?? $subscription->plan_type,
                'billing_cycle' => $subscription->billing_cycle,
                'amount' => $subscription->formatted_amount,
                'status' => $subscription->status,
                'current_period_end' => $subscription->current_period_end?->toDateString(),
                'features' => Subscription::PLANS[$subscription->plan_type]['features'] ?? [],
            ],
        ]);
    }

    /**
     * Handle Culqi webhooks
     */
    public function handleWebhook(Request $request): JsonResponse
    {
        $payload = $request->all();
        $event = $payload['type'] ?? null;

        Log::info('Culqi webhook received', [
            'event' => $event,
            'payload' => $payload,
        ]);

        switch ($event) {
            case 'charge.creation.succeeded':
                // Payment successful - already handled in processRegistration
                break;

            case 'charge.creation.failed':
                // Payment failed
                $this->handleFailedCharge($payload);
                break;

            case 'subscription.charge.succeeded':
                // Recurring payment successful
                $this->handleSubscriptionCharge($payload);
                break;

            case 'subscription.charge.failed':
                // Recurring payment failed
                $this->handleFailedSubscriptionCharge($payload);
                break;

            case 'refund.creation.succeeded':
                // Refund processed
                $this->handleRefund($payload);
                break;

            default:
                Log::info('Unhandled Culqi webhook event', ['event' => $event]);
        }

        return response()->json(['received' => true]);
    }

    /**
     * Handle failed charge webhook
     */
    protected function handleFailedCharge(array $payload): void
    {
        // Log for monitoring
        Log::warning('Culqi charge failed webhook', [
            'charge_id' => $payload['data']['id'] ?? null,
            'decline_code' => $payload['data']['outcome']['decline_code'] ?? null,
        ]);
    }

    /**
     * Handle successful subscription charge
     */
    protected function handleSubscriptionCharge(array $payload): void
    {
        $subscriptionId = $payload['data']['subscription_id'] ?? null;

        if (!$subscriptionId) {
            return;
        }

        $subscription = Subscription::where('culqi_subscription_id', $subscriptionId)->first();

        if ($subscription) {
            // Extend subscription period
            $periodEnd = $subscription->billing_cycle === 'yearly'
                ? now()->addYear()
                : now()->addMonth();

            $subscription->update([
                'status' => 'active',
                'current_period_start' => now(),
                'current_period_end' => $periodEnd,
            ]);

            // Record payment
            Payment::createFromCulqiCharge(
                chargeData: $payload['data'],
                accountId: $subscription->account_id,
                subscriptionId: $subscription->id
            );
        }
    }

    /**
     * Handle failed subscription charge
     */
    protected function handleFailedSubscriptionCharge(array $payload): void
    {
        $subscriptionId = $payload['data']['subscription_id'] ?? null;

        if (!$subscriptionId) {
            return;
        }

        $subscription = Subscription::where('culqi_subscription_id', $subscriptionId)->first();

        if ($subscription) {
            $subscription->update([
                'status' => 'past_due',
            ]);

            Log::warning('Subscription payment failed', [
                'subscription_id' => $subscription->id,
                'culqi_subscription_id' => $subscriptionId,
            ]);
        }
    }

    /**
     * Handle refund webhook
     */
    protected function handleRefund(array $payload): void
    {
        $chargeId = $payload['data']['charge_id'] ?? null;
        $refundAmount = $payload['data']['amount'] ?? 0;

        if (!$chargeId) {
            return;
        }

        $payment = Payment::where('culqi_charge_id', $chargeId)->first();

        if ($payment) {
            $newRefundedAmount = $payment->amount_refunded + $refundAmount;
            $status = $newRefundedAmount >= $payment->amount ? 'refunded' : 'partially_refunded';

            $payment->update([
                'status' => $status,
                'amount_refunded' => $newRefundedAmount,
                'refund_id' => $payload['data']['id'] ?? null,
                'refunded_at' => now(),
            ]);
        }
    }
}
