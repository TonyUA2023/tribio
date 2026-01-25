<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Account;
use App\Services\BrevoSmsService;
use App\Services\WhatsAppService;
use App\Services\WhatsAppMessages\OrderMessages;
use App\Services\CustomerService;
use App\Mail\GenericEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OrderController extends Controller
{
    public function __construct(
        protected CustomerService $customerService
    ) {}

    /**
     * Listar pedidos de una cuenta.
     */
    public function index(Request $request, $accountId)
    {
        $account = Account::where('id', $accountId)
            ->where('user_id', auth()->id())
            ->first();

        if (!$account) {
            return response()->json(['success' => false, 'message' => 'Cuenta no encontrada o acceso denegado.'], 403);
        }

        $query = Order::where('account_id', $accountId)->with(['items']); 

        // Filtrar por estado
        if ($request->has('status') && $request->status !== 'all') {
            if ($request->status === 'history') {
                $query->whereIn('status', ['delivered', 'cancelled']);
            } else {
                $query->where('status', $request->status);
            }
        }

        // Búsqueda
        if ($request->has('search')) {
            $term = $request->search;
            $query->where(function($q) use ($term) {
                $q->where('customer_name', 'like', "%{$term}%")
                  ->orWhere('order_number', 'like', "%{$term}%");
            });
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Ver detalle completo de un pedido.
     */
    public function show($id)
    {
        $order = Order::with(['items', 'account'])->findOrFail($id);

        if ($order->account->user_id !== auth()->id()) {
            return response()->json(['success' => false, 'message' => 'No autorizado.'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * Actualizar el estado de un pedido (CON NOTIFICACIONES MULTICANAL).
     */
    public function updateStatus(Request $request, $id, BrevoSmsService $smsService, WhatsAppService $whatsappService)
    {
        $request->validate([
            'status' => 'required|in:pending,preparing,ready,delivered,cancelled'
        ]);

        $order = Order::with('account')->findOrFail($id);

        if ($order->account->user_id !== auth()->id()) {
            return response()->json(['success' => false, 'message' => 'No autorizado.'], 403);
        }

        $newStatus = $request->status;
        $order->status = $newStatus;
        
        if ($newStatus === 'delivered' && !$order->delivered_at) {
            $order->delivered_at = now();
        }
        
        if ($newStatus === 'preparing' && !$order->confirmed_at) {
             $order->confirmed_at = now();
        }

        $order->save();

        // --- 🚀 LÓGICA DE NOTIFICACIÓN INTELIGENTE ---

        // 1. Notificar al CLIENTE sobre el cambio de estado
        try {
            switch ($order->notification_channel) {
                case 'sms':
                    // SMS: Versión corta del mensaje
                    $messageContent = $this->getNotificationMessage($order, $newStatus);
                    if ($messageContent) {
                        $smsService->sendSms($order->customer_phone, $messageContent);
                        Log::info("✅ SMS Cliente enviado para estado: {$newStatus}");
                    }
                    break;

                case 'whatsapp':
                    // WhatsApp: Usar plantillas aprobadas por Meta
                    $businessName = $order->account->name ?? 'Nuestro negocio';

                    if ($newStatus === 'ready') {
                        // Plantilla order_ready: {{1}}=nombre, {{2}}=negocio, {{3}}=pedido, {{4}}=total
                        $whatsappService->sendTemplateMessage(
                            $order->customer_phone,
                            'order_ready',
                            [
                                $order->customer_name,
                                $businessName,
                                $order->order_number,
                                number_format($order->total, 2)
                            ],
                            'es_PE'
                        );
                        Log::info("✅ WhatsApp Cliente enviado (pedido listo)");
                    } elseif ($newStatus === 'preparing') {
                        // Plantilla order_confirmation para preparando
                        $whatsappService->sendTemplateMessage(
                            $order->customer_phone,
                            'order_confirmation',
                            [
                                $order->customer_name,
                                $businessName,
                                $order->order_number,
                                number_format($order->total, 2)
                            ],
                            'es_PE'
                        );
                        Log::info("✅ WhatsApp Cliente enviado (preparando)");
                    }
                    // Para delivered y cancelled, usar mensaje de texto (requieren crear plantillas adicionales)
                    break;

                case 'email':
                default:
                    // Email
                    if ($order->customer_email) {
                        $messageContent = $this->getNotificationMessage($order, $newStatus);
                        if ($messageContent) {
                            Mail::to($order->customer_email)->send(
                                new GenericEmail(
                                    "Actualización Pedido #{$order->order_number}",
                                    $messageContent
                                )
                            );
                            Log::info("✅ Email Cliente enviado para estado: {$newStatus}");
                        }
                    }
                    break;
            }
        } catch (\Exception $e) {
            Log::error("Error enviando notificación de pedido {$id}: " . $e->getMessage());
        }

        // 2. Notificar al EMPRENDEDOR/NEGOCIO (solo para estados importantes)
        // Solo notificamos al negocio cuando el pedido está listo o entregado
        if (in_array($newStatus, ['ready', 'delivered'])) {
            try {
                $account = $order->account;
                $profile = $account->profile;

                switch ($order->notification_channel) {
                    case 'whatsapp':
                        // Usar account->whatsapp para notificar al negocio
                        $businessPhone = $account->whatsapp ?? null;

                        if ($businessPhone && $whatsappService->isConfigured()) {
                            $businessName = $profile->business_name ?? $account->name ?? 'Emprendedor';

                            // Usar texto simple para notificaciones de cambio de estado
                            // (Las plantillas son para crear pedidos/reservas nuevas)
                            $statusMsg = $newStatus === 'ready'
                                ? "✅ El pedido {$order->order_number} está LISTO para entregar.\n👤 Cliente: {$order->customer_name}\n📱 Tel: {$order->customer_phone}"
                                : "✅ El pedido {$order->order_number} ha sido ENTREGADO.\n👤 Cliente: {$order->customer_name}";

                            $sent = $whatsappService->sendTextMessage($businessPhone, $statusMsg);

                            if ($sent) {
                                Log::info("✅ WhatsApp Negocio enviado (estado: {$newStatus})");
                            }
                        } else {
                            Log::warning("📱 Negocio sin WhatsApp configurado en Account (ID: {$account->id}) - Campo: " . ($account->whatsapp ?? 'NULL'));
                        }
                        break;

                    case 'email':
                    case 'sms':
                    default:
                        // Notificar por email al negocio
                        if ($profile && $profile->notification_email) {
                            $statusText = $newStatus === 'ready' ? 'listo para entregar' : 'entregado';
                            Mail::to($profile->notification_email)->send(
                                new GenericEmail(
                                    "Pedido {$order->order_number} {$statusText}",
                                    "El pedido {$order->order_number} de {$order->customer_name} ha sido marcado como {$statusText}."
                                )
                            );
                            Log::info("✅ Email Negocio enviado (estado: {$newStatus})");
                        }
                        break;
                }
            } catch (\Exception $e) {
                Log::error("Error notificando negocio sobre cambio de estado: " . $e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Estado actualizado a " . ucfirst($newStatus),
            'data' => $order
        ]);
    }

    /**
     * Helper para textos de notificación
     */
    private function getNotificationMessage(Order $order, $status)
    {
        $id = $order->order_number ?? $order->id;
        $business = $order->account->name;

        return match ($status) {
            'preparing' => "Hola {$order->customer_name}, tu pedido #{$id} en {$business} se está preparando/empaquetando 📦.",
            'ready'     => "¡{$order->customer_name}! Tu pedido #{$id} está LISTO ✅. " . ($order->delivery_fee > 0 ? "Pronto saldrá a reparto." : "Puedes pasar a recogerlo."),
            'delivered' => "Tu pedido #{$id} ha sido entregado. ¡Gracias por elegir {$business}! ⭐",
            'cancelled' => "Tu pedido #{$id} en {$business} ha sido cancelado.",
            default     => null
        };
    }

    /**
     * Crear un pedido manualmente desde el Admin (App Móvil)
     */
    public function store(Request $request, $accountId, BrevoSmsService $smsService, WhatsAppService $whatsappService)
    {
        $account = Account::where('id', $accountId)->where('user_id', auth()->id())->firstOrFail();

        $request->validate([
            'customer_name' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            // Opcional: El dueño puede elegir el canal al crear el pedido manual
            'notification_channel' => 'nullable|in:email,sms,whatsapp' 
        ]);

        DB::beginTransaction();
        try {
            $total = 0;

            // Si no se especifica canal, asumimos email por defecto
            $channel = $request->notification_channel ?? 'email';

            // 🆕 Buscar o crear customer
            $customer = $this->customerService->findOrCreateCustomer(
                $account,
                [
                    'name' => $request->customer_name,
                    'phone' => $request->customer_phone ?? '',
                    'email' => $request->customer_email ?? null,
                    'preferences' => [
                        'notification_channel' => $channel,
                    ],
                ],
                null // Guest order (creado por admin)
            );

            $order = Order::create([
                'account_id' => $accountId,
                'customer_id' => $customer->id, // 🆕 Vincular customer
                'customer_name' => $request->customer_name,
                'customer_phone' => $request->customer_phone,
                'customer_email' => $request->customer_email,
                'delivery_address' => $request->delivery_address ?? 'Local',
                'status' => 'preparing', // Manual = Confirmado automáticamente
                'payment_method' => $request->payment_method ?? 'cash',
                'order_number' => 'ORD-' . strtoupper(substr(uniqid(), -6)),
                'total' => 0,
                'confirmed_at' => now(),
                'notification_channel' => $channel,
            ]);

            foreach ($request->items as $item) {
                $product = \App\Models\Product::find($item['product_id']);
                if(!$product) continue; 

                $subtotal = $product->price * $item['quantity'];
                
                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_price' => $product->price,
                    'quantity' => $item['quantity'],
                    'subtotal' => $subtotal,
                ]);
                
                $total += $subtotal;
            }

            $order->update(['total' => $total]);

            // 🆕 Actualizar timestamp de última actividad
            $customer->touchLastOrder();

            // Notificación inicial de "Preparando"
            try {
                switch ($channel) {
                    case 'sms':
                        if ($order->customer_phone) {
                            $msg = "Hola {$order->customer_name}, hemos creado tu pedido #{$order->order_number} en {$account->name} y ya lo estamos preparando.";
                            $smsService->sendSms($order->customer_phone, $msg);
                        }
                        break;

                    case 'whatsapp':
                        if ($order->customer_phone) {
                            $message = OrderMessages::orderPreparing($order);
                            $whatsappService->sendTextMessage($order->customer_phone, $message);
                        }
                        break;

                    case 'email':
                        if ($order->customer_email) {
                            Mail::to($order->customer_email)->send(
                                new GenericEmail(
                                    "Pedido Creado #{$order->order_number}",
                                    "Tu pedido ha sido creado y está en preparación."
                                )
                            );
                        }
                        break;
                }
            } catch (\Exception $e) {
                Log::error("Error enviando notificación inicial de pedido: " . $e->getMessage());
            }

            DB::commit();

            return response()->json(['success' => true, 'data' => $order]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error($e);
            return response()->json(['success' => false, 'message' => 'Error al crear pedido: ' . $e->getMessage()], 500);
        }
    }
}