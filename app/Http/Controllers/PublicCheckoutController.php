<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Customer;
use App\Models\Profile;
use App\Models\Order;
use App\Models\Product;
use App\Services\CulqiService;
use App\Services\WhatsAppService;
use App\Services\WhatsAppMessages\OrderMessages;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class PublicCheckoutController extends Controller
{
    public function store(Request $request, $accountSlug)
    {
        // 1. Validar Cuenta
        $account = Account::where('slug', $accountSlug)->firstOrFail();

        // 2. Validar usuario autenticado
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Debes iniciar sesión para completar la compra'], 401);
        }

        // 3. Validar datos del request
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.selected_options' => 'nullable|array',
            'delivery_type' => 'required|in:delivery,pickup',
            'delivery_address' => 'nullable|string|max:1000',
            'payment_method' => 'required|in:card,yape',
            'culqi_token' => 'required|string',
            'notes' => 'nullable|string|max:500',
            // Customer info
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'nullable|string|max:50',
        ]);

        // 4. Get or create customer record
        $customerRecord = Customer::firstOrCreate(
            ['user_id' => $user->id, 'account_id' => $account->id],
            [
                'name' => $validated['customer_name'],
                'email' => $validated['customer_email'],
                'phone' => $validated['customer_phone'] ?? null,
            ]
        );

        // 5. Get profile for business info
        $profile = Profile::where('account_id', $account->id)->first();
        $profileData = $profile?->data ?? [];

        try {
            return DB::transaction(function () use ($validated, $account, $customerRecord, $profile, $profileData, $user) {
                // A. Calculate totals
                $subtotal = 0;
                $orderItems = [];

                foreach ($validated['items'] as $itemData) {
                    $product = Product::where('account_id', $account->id)
                        ->where('id', $itemData['id'])
                        ->firstOrFail();

                    $itemSubtotal = $product->price * $itemData['quantity'];
                    $subtotal += $itemSubtotal;

                    $orderItems[] = [
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'product_price' => $product->price,
                        'quantity' => $itemData['quantity'],
                        'selected_options' => $itemData['selected_options'] ?? null,
                        'subtotal' => $itemSubtotal,
                    ];
                }

                $deliveryFee = 0; // Can be calculated based on business config
                $total = $subtotal + $deliveryFee;

                // B. Process Culqi payment (per-account credentials)
                $culqiService = CulqiService::forAccount($account);

                if (!$culqiService->isConfigured()) {
                    throw new \Exception('Este negocio no tiene configurada la pasarela de pagos.');
                }

                $paymentMethodLabel = $validated['payment_method'] === 'card' ? 'Tarjeta' : 'Yape';
                $description = "Pedido en " . $account->name . " - " . $paymentMethodLabel;

                $nameParts = explode(' ', trim($validated['customer_name']), 2);
                $firstName = $nameParts[0];
                $lastName = $nameParts[1] ?? $nameParts[0]; // Culqi requires non-empty last_name

                // Culqi ALWAYS requires phone_number (5-15 chars) in antifraudDetails
                $phone = $validated['customer_phone'] ?? '';
                if (strlen($phone) < 5 || strlen($phone) > 15) {
                    $phone = '000000000'; // Fallback for Culqi requirement
                }
                $antifraudDetails = [
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'phone_number' => $phone,
                    'country_code' => 'PE',
                ];

                $chargeResult = $culqiService->createCharge(
                    tokenId: $validated['culqi_token'],
                    amount: (int) round($total * 100), // Convert to cents
                    currencyCode: 'PEN',
                    email: $validated['customer_email'],
                    description: $description,
                    metadata: [
                        'account_id' => $account->id,
                        'account_slug' => $account->slug,
                        'customer_id' => $customerRecord->id,
                        'payment_method' => $validated['payment_method'],
                    ],
                    antifraudDetails: $antifraudDetails
                );

                if (!$chargeResult['success']) {
                    Log::warning('Culqi: Pago denegado en checkout tienda', [
                        'account_id' => $account->id,
                        'email' => $validated['customer_email'],
                        'error' => $chargeResult['error'] ?? null,
                    ]);

                    // Throw to rollback transaction
                    throw new \Exception($chargeResult['message'] ?? 'El pago fue rechazado por el banco.');
                }

                // C. Create Order
                $order = Order::create([
                    'account_id' => $account->id,
                    'customer_id' => $customerRecord->id,
                    'customer_name' => $validated['customer_name'],
                    'customer_phone' => $validated['customer_phone'] ?? $customerRecord->phone,
                    'customer_email' => $validated['customer_email'],
                    'delivery_address' => $validated['delivery_type'] === 'delivery'
                        ? ($validated['delivery_address'] ?? 'Sin dirección')
                        : 'Recojo en tienda',
                    'notes' => $validated['notes'] ?? null,
                    'subtotal' => $subtotal,
                    'delivery_fee' => $deliveryFee,
                    'total' => $total,
                    'status' => 'pending',
                    'payment_method' => $validated['payment_method'],
                    'payment_status' => 'paid',
                ]);

                $order->items()->createMany($orderItems);

                // Reload order with items for message generation
                $order->load(['items', 'account']);

                Log::info("Pedido #{$order->order_number} creado exitosamente", [
                    'order_id' => $order->id,
                    'account_id' => $account->id,
                    'total' => $total,
                    'culqi_charge_id' => $chargeResult['data']['id'] ?? null,
                ]);

                // D. Send WhatsApp notifications (non-blocking, errors won't rollback the order)
                try {
                    $this->sendWhatsAppNotifications($order, $account, $profile, $profileData);
                } catch (\Exception $e) {
                    Log::error("Error en notificaciones WhatsApp para pedido #{$order->order_number}: " . $e->getMessage());
                }

                return response()->json([
                    'success' => true,
                    'order_number' => $order->order_number,
                    'message' => 'Pedido procesado exitosamente',
                ]);
            });

        } catch (\Exception $e) {
            Log::error("Error en checkout tienda: " . $e->getMessage(), [
                'account_slug' => $accountSlug,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Save/update customer addresses (persists to DB).
     */
    public function saveAddresses(Request $request, $accountSlug)
    {
        $account = Account::where('slug', $accountSlug)->firstOrFail();
        $user = Auth::user();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Debes iniciar sesión'], 401);
        }

        $validated = $request->validate([
            'addresses' => 'required|array',
            'addresses.*.id' => 'required|string',
            'addresses.*.label' => 'required|string|max:100',
            'addresses.*.address' => 'required|string|max:500',
            'addresses.*.reference' => 'nullable|string|max:300',
            'addresses.*.department' => 'required|string|max:100',
            'addresses.*.province' => 'required|string|max:100',
            'addresses.*.district' => 'required|string|max:100',
            'addresses.*.postal_code' => 'nullable|string|max:20',
            'addresses.*.phone' => 'nullable|string|max:50',
            'addresses.*.is_default' => 'boolean',
        ]);

        $customerRecord = Customer::firstOrCreate(
            ['user_id' => $user->id, 'account_id' => $account->id],
            ['name' => $user->name, 'email' => $user->email]
        );

        $customerRecord->update(['addresses' => $validated['addresses']]);

        return response()->json(['success' => true]);
    }

    /**
     * Create a Culqi Order (required for Yape and other non-card payment methods).
     */
    public function createCulqiOrder(Request $request, $accountSlug)
    {
        $account = Account::where('slug', $accountSlug)->firstOrFail();
        $user = Auth::user();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Debes iniciar sesión'], 401);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'nullable|string|max:50',
        ]);

        $amountInCents = (int) round($validated['amount'] * 100);

        $culqiService = CulqiService::forAccount($account);

        if (!$culqiService->isConfigured()) {
            return response()->json([
                'success' => false,
                'message' => 'Este negocio no tiene configurada la pasarela de pagos.',
            ], 422);
        }

        $nameParts = explode(' ', $validated['customer_name'], 2);
        $firstName = $nameParts[0];
        $lastName = $nameParts[1] ?? '';

        $result = $culqiService->createOrder(
            amount: $amountInCents,
            currencyCode: 'PEN',
            description: "Pedido en " . $account->name,
            orderNumber: "ord-{$account->id}-" . time(),
            clientDetails: [
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $validated['customer_email'],
                'phone_number' => $validated['customer_phone'] ?? '',
            ],
            metadata: [
                'account_id' => $account->id,
                'account_slug' => $account->slug,
            ]
        );

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'] ?? 'Error al crear la orden de pago',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'order_id' => $result['order_id'],
        ]);
    }

    /**
     * Send WhatsApp notifications to both customer and business owner.
     */
    private function sendWhatsAppNotifications(Order $order, Account $account, ?Profile $profile, array $profileData): void
    {
        $whatsappService = app(WhatsAppService::class);

        if (!$whatsappService->isConfigured()) {
            Log::warning("WhatsApp API no configurada. Omitiendo notificaciones para pedido #{$order->order_number}");
            return;
        }

        $businessName = $profile?->business_name ?? $account->name ?? 'Nuestro negocio';

        // A) Notify the CUSTOMER
        $customerPhone = $order->customer_phone;
        if ($customerPhone) {
            try {
                // Build products text for template
                $productsItems = [];
                foreach ($order->items as $item) {
                    $productsItems[] = "{$item->quantity}x {$item->product_name} S/{$item->subtotal}";
                }
                $productsText = implode(", ", $productsItems);

                $sent = $whatsappService->sendTemplateMessage(
                    $customerPhone,
                    'order_confirmation',
                    [
                        $order->customer_name,
                        $businessName,
                        $order->order_number,
                        number_format($order->total, 2),
                    ],
                    'es_PE'
                );

                if ($sent) {
                    Log::info("WhatsApp enviado al cliente: {$customerPhone} para pedido #{$order->order_number}");
                } else {
                    // Fallback: send text message with OrderMessages format
                    $message = OrderMessages::orderCreated($order);
                    $whatsappService->sendTextMessage($customerPhone, $message);
                    Log::info("WhatsApp texto fallback enviado al cliente: {$customerPhone}");
                }
            } catch (\Exception $e) {
                Log::error("Error enviando WhatsApp al cliente: " . $e->getMessage());
            }
        }

        // B) Notify the BUSINESS OWNER
        $businessPhone = $profileData['whatsapp'] ?? $profileData['phone'] ?? $account->whatsapp ?? null;
        if ($businessPhone) {
            try {
                $productsItems = [];
                foreach ($order->items as $item) {
                    $productsItems[] = "{$item->quantity}x {$item->product_name} S/{$item->subtotal}";
                }
                $productsText = implode(", ", $productsItems) . " | TOTAL: S/" . number_format($order->total, 2);

                $sent = $whatsappService->sendTemplateMessage(
                    $businessPhone,
                    'new_order_business',
                    [
                        $businessName,
                        $order->order_number,
                        $order->customer_name,
                        $order->customer_phone ?? 'No registrado',
                        $productsText,
                        $order->delivery_address,
                    ],
                    'es_PE'
                );

                if ($sent) {
                    Log::info("WhatsApp enviado al negocio: {$businessPhone} para pedido #{$order->order_number}");
                } else {
                    // Fallback: text message
                    $message = OrderMessages::newOrderForBusiness($order);
                    $whatsappService->sendTextMessage($businessPhone, $message);
                    Log::info("WhatsApp texto fallback enviado al negocio: {$businessPhone}");
                }
            } catch (\Exception $e) {
                Log::error("Error enviando WhatsApp al negocio: " . $e->getMessage());
            }
        } else {
            Log::warning("No se encontró teléfono del negocio para notificar (Account ID: {$account->id})");
        }
    }
}
