<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Account;
use App\Services\BrevoSmsService;
use App\Services\WhatsAppService;
use App\Services\WhatsAppMessages\OrderMessages;
use App\Mail\GenericEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OrderController extends Controller
{
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

        try {
            switch ($order->notification_channel) {
                case 'sms':
                    // SMS: Versión corta del mensaje
                    $messageContent = $this->getNotificationMessage($order, $newStatus);
                    if ($messageContent) {
                        $smsService->sendSms($order->customer_phone, $messageContent);
                    }
                    break;

                case 'whatsapp':
                    // WhatsApp: Mensaje completo y formateado usando Meta API
                    $message = match($newStatus) {
                        'preparing' => OrderMessages::orderPreparing($order),
                        'ready' => OrderMessages::orderReady($order),
                        'delivered' => OrderMessages::orderDelivered($order),
                        'cancelled' => OrderMessages::orderCancelled($order),
                        default => null
                    };

                    if ($message) {
                        $whatsappService->sendTextMessage($order->customer_phone, $message);
                    }
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
                        }
                    }
                    break;
            }
        } catch (\Exception $e) {
            Log::error("Error enviando notificación de pedido {$id}: " . $e->getMessage());
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

            $order = Order::create([
                'account_id' => $accountId,
                'customer_name' => $request->customer_name,
                'customer_phone' => $request->customer_phone,
                'delivery_address' => $request->delivery_address ?? 'Local',
                'status' => 'preparing', // Manual = Confirmado automáticamente
                'payment_method' => $request->payment_method ?? 'cash',
                'order_number' => 'ORD-' . strtoupper(substr(uniqid(), -6)),
                'total' => 0,
                'confirmed_at' => now(),
                'notification_channel' => $channel, // 👈 Guardamos
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