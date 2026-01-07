<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    /**
     * Listar pedidos de una cuenta.
     * GET /api/accounts/{accountId}/orders?status=pending
     */
    public function index(Request $request, $accountId)
    {
        // 1. Validar que la cuenta pertenece al usuario
        $account = Account::where('id', $accountId)
            ->where('user_id', auth()->id())
            ->first();

        if (!$account) {
            return response()->json(['success' => false, 'message' => 'Cuenta no encontrada o acceso denegado.'], 403);
        }

        // 2. Query base
        $query = Order::where('account_id', $accountId)
            ->with(['items']); // Cargar items ligeros para la lista (opcional, si quieres mostrar "2 items" en la lista)

        // 3. Filtrar por estado si se solicita (ej: ?status=pending)
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // 4. Ordenar (más recientes primero)
        $orders = $query->orderBy('created_at', 'desc')
                        ->paginate(20); // Paginación para no saturar la App

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Ver detalle completo de un pedido.
     * GET /api/orders/{id}
     */
    public function show($id)
    {
        // Cargar pedido con items y la cuenta para validar permisos
        $order = Order::with(['items', 'account'])->findOrFail($id);

        // Validar permisos
        if ($order->account->user_id !== auth()->id()) {
            return response()->json(['success' => false, 'message' => 'No autorizado.'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * Actualizar el estado de un pedido.
     * PUT /api/orders/{id}/status
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,preparing,in_delivery,delivered,cancelled'
        ]);

        $order = Order::with('account')->findOrFail($id);

        // Validar permisos
        if ($order->account->user_id !== auth()->id()) {
            return response()->json(['success' => false, 'message' => 'No autorizado.'], 403);
        }

        $oldStatus = $order->status;
        $newStatus = $request->status;

        // Actualizar estado
        $order->status = $newStatus;
        
        // Registrar fechas importantes
        if ($newStatus === 'confirmed' && !$order->confirmed_at) {
            $order->confirmed_at = now();
        }
        if ($newStatus === 'delivered' && !$order->delivered_at) {
            $order->delivered_at = now();
        }

        $order->save();

        // --- Generar mensaje de WhatsApp sugerido ---
        // Esto ayuda al dueño a notificar al cliente rápidamente
        $whatsappMessage = $this->generateWhatsAppMessage($order, $newStatus);

        return response()->json([
            'success' => true,
            'message' => "Estado actualizado a " . ucfirst($newStatus),
            'data' => $order,
            'whatsapp_link' => $whatsappMessage // El frontend puede abrir esto directamente
        ]);
    }

    /**
     * Método privado para generar textos de WhatsApp
     */
    private function generateWhatsAppMessage(Order $order, $status)
    {
        if (!$order->customer_phone) return null;

        $phone = preg_replace('/[^0-9]/', '', $order->customer_phone); // Limpiar teléfono
        $businessName = $order->account->name;
        $orderId = $order->order_number ?? $order->id;
        
        $text = "";

        switch ($status) {
            case 'confirmed':
                $text = "Hola {$order->customer_name}, tu pedido #{$orderId} en *{$businessName}* ha sido confirmado. Lo estamos preparando. 👨‍🍳";
                break;
            case 'in_delivery':
                $text = "Hola {$order->customer_name}, ¡tu pedido #{$orderId} va en camino! 🛵";
                break;
            case 'delivered':
                $text = "Hola {$order->customer_name}, tu pedido #{$orderId} ha sido entregado. ¡Gracias por tu compra! ⭐";
                break;
            case 'cancelled':
                $text = "Hola {$order->customer_name}, lamentamos informarte que tu pedido #{$orderId} ha sido cancelado. Por favor contáctanos para más detalles.";
                break;
            default:
                return null;
        }

        return "https://wa.me/{$phone}?text=" . urlencode($text);
    }

    /**
     * (Opcional) Crear un pedido manualmente desde el Admin
     * Si necesitas que el dueño cree pedidos por teléfono
     */
    public function store(Request $request, $accountId)
    {
        // Validar permisos
        $account = Account::where('id', $accountId)->where('user_id', auth()->id())->firstOrFail();

        // Validación simplificada
        $request->validate([
            'customer_name' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            // Calcular total
            $total = 0;
            $orderItems = [];

            // Crear Orden Cabecera
            $order = Order::create([
                'account_id' => $accountId,
                'customer_name' => $request->customer_name,
                'customer_phone' => $request->customer_phone,
                'delivery_address' => $request->delivery_address ?? 'Local',
                'status' => 'confirmed', // Asumimos confirmado si lo crea el dueño
                'payment_method' => $request->payment_method ?? 'cash',
                'order_number' => 'ORD-' . strtoupper(uniqid()),
                'total' => 0, // Se actualiza luego
            ]);

            foreach ($request->items as $item) {
                // Aquí deberías buscar el precio real del producto en DB para seguridad
                // Por brevedad, asumimos lógica básica
                $product = \App\Models\Product::find($item['product_id']);
                $subtotal = $product->price * $item['quantity'];
                
                $order->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name, // Guardar nombre por si se borra el producto
                    'product_price' => $product->price,
                    'quantity' => $item['quantity'],
                    'subtotal' => $subtotal,
                ]);
                
                $total += $subtotal;
            }

            $order->update(['total' => $total]);
            
            DB::commit();

            return response()->json(['success' => true, 'data' => $order]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error($e);
            return response()->json(['success' => false, 'message' => 'Error al crear pedido'], 500);
        }
    }
}