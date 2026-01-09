<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Profile;
use App\Models\Order;
use App\Models\Product;
use App\Services\WhatsAppService;
use App\Services\BrevoSmsService;
use App\Services\WhatsAppMessages\OrderMessages;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\OrderConfirmation;
use App\Mail\NewOrderNotification;

class PublicCheckoutController extends Controller
{
    public function store(Request $request, $accountSlug)
    {
        // 1. Validar Cuenta
        $account = Account::where('slug', $accountSlug)->firstOrFail();

        // 2. Obtener el Perfil asociado (Donde está el email de notificación)
        $profile = Profile::where('account_id', $account->id)->first();

        // 3. Validar Datos
        $validated = $request->validate([
            'customer_name'  => 'required|string|max:191',
            'customer_phone' => 'required|string|max:50',
            'customer_email' => 'nullable|email|max:191',
            'notification_channel' => 'required|in:email,sms,whatsapp',
            'items'          => 'required|array|min:1',
            'items.*.id'     => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        // 4. Inyectar servicios
        $whatsappService = app(WhatsAppService::class);
        $smsService = app(BrevoSmsService::class);

        try {
            return DB::transaction(function () use ($validated, $account, $profile, $whatsappService, $smsService) {
                // Cálculo de Totales
                $total = 0;
                $orderItems = [];

                foreach ($validated['items'] as $itemData) {
                    $product = Product::where('account_id', $account->id)
                                      ->where('id', $itemData['id'])
                                      ->firstOrFail();

                    $subtotal = $product->price * $itemData['quantity'];
                    $total += $subtotal;

                    $orderItems[] = [
                        'product_id'    => $product->id,
                        'product_name'  => $product->name,
                        'product_price' => $product->price,
                        'quantity'      => $itemData['quantity'],
                        'subtotal'      => $subtotal,
                    ];
                }

                // Crear Orden
                $order = Order::create([
                    'account_id'      => $account->id,
                    'order_number'    => 'ORD-' . strtoupper(Str::random(8)),
                    'customer_name'   => $validated['customer_name'],
                    'customer_phone'  => $validated['customer_phone'],
                    'customer_email'  => $validated['customer_email'] ?? null,
                    'notification_channel' => $validated['notification_channel'],
                    'delivery_address'=> 'Pendiente',
                    'total'           => $total,
                    'subtotal'        => $total,
                    'delivery_fee'    => 0,
                    'status'          => 'pending',
                    'payment_status'  => 'pending',
                    'payment_method'  => 'web',
                ]);

                $order->items()->createMany($orderItems);

                // ====================================================
                // SISTEMA DE NOTIFICACIONES MULTICANAL
                // ====================================================

                Log::info("🚀 Pedido #{$order->order_number} creado. Iniciando notificaciones...");

                // A) Notificar al CLIENTE según su canal preferido
                try {
                    switch ($order->notification_channel) {
                        case 'email':
                            if ($order->customer_email) {
                                Mail::to($order->customer_email)->send(new OrderConfirmation($order));
                                Log::info("✅ Email Cliente enviado a: {$order->customer_email}");
                            }
                            break;

                        case 'sms':
                            if ($order->customer_phone) {
                                $msg = "Hola {$order->customer_name}, tu pedido #{$order->order_number} ha sido recibido. Total: S/ {$order->total}. ¡Te mantendremos informado!";
                                $smsService->sendSms($order->customer_phone, $msg);
                                Log::info("✅ SMS Cliente enviado a: {$order->customer_phone}");
                            }
                            break;

                        case 'whatsapp':
                            if ($order->customer_phone) {
                                $message = OrderMessages::orderCreated($order);
                                $whatsappService->sendTextMessage($order->customer_phone, $message);
                                Log::info("✅ WhatsApp Cliente enviado a: {$order->customer_phone}");
                            }
                            break;
                    }
                } catch (\Exception $e) {
                    Log::error("❌ Error notificando cliente: " . $e->getMessage());
                }

                // B) Negocio (Buscando en Profile)
                $businessEmail = null;

                if ($profile && !empty($profile->notification_email)) {
                    $businessEmail = $profile->notification_email;
                    Log::info("📧 Email de negocio encontrado en Profile: {$businessEmail}");
                } elseif (!empty($account->email)) {
                    $businessEmail = $account->email;
                    Log::info("📧 Email de negocio encontrado en Account: {$businessEmail}");
                }

                if ($businessEmail) {
                    try {
                        Mail::to($businessEmail)->send(new NewOrderNotification($order));
                        Log::info("✅ Email Negocio enviado correctamente.");
                    } catch (\Exception $e) {
                        Log::error("❌ Error mail negocio: " . $e->getMessage());
                    }
                } else {
                    Log::warning("⚠️ NO se encontró email para notificar al negocio (Account ID: {$account->id})");
                }

                return response()->json([
                    'success' => true,
                    'order_number' => $order->order_number
                ]);
            });

        } catch (\Exception $e) {
            Log::error("🔥 Error Checkout: " . $e->getMessage());
            return response()->json(['message' => 'Error al procesar: ' . $e->getMessage()], 500);
        }
    }
}