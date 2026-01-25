<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerOrderController extends Controller
{
    /**
     * Obtener todos los pedidos del cliente.
     *
     * GET /api/customer/orders
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isCustomer()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Obtener todos los customers del usuario
        $customerIds = \App\Models\Customer::where('user_id', $user->id)
            ->pluck('id');

        $query = Order::whereIn('customer_id', $customerIds)
            ->with(['account.profile', 'items.product']);

        // Filtrar por negocio específico
        if ($request->has('account_id')) {
            $query->where('account_id', $request->account_id);
        }

        // Filtrar por estado
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Ordenar
        $query->orderBy('created_at', 'desc');

        $orders = $query->paginate(20);

        return response()->json([
            'success' => true,
            'orders' => $orders,
        ]);
    }

    /**
     * Obtener un pedido específico del cliente.
     *
     * GET /api/customer/orders/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isCustomer()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Obtener todos los customers del usuario
        $customerIds = \App\Models\Customer::where('user_id', $user->id)
            ->pluck('id');

        $order = Order::whereIn('customer_id', $customerIds)
            ->with(['account.profile', 'items.product'])
            ->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'order' => $order,
        ]);
    }

    /**
     * Crear un nuevo pedido (autenticado).
     *
     * POST /api/customer/orders
     */
    public function store(Request $request): JsonResponse
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
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string',
            'delivery_type' => 'required|in:pickup,delivery',
            'delivery_address' => 'required_if:delivery_type,delivery|string',
            'notes' => 'nullable|string',
            'notification_channel' => 'nullable|in:email,sms,whatsapp',
        ]);

        // Buscar o crear customer para este account
        $customer = \App\Models\Customer::firstOrCreate(
            [
                'user_id' => $user->id,
                'account_id' => $validated['account_id'],
            ],
            [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->customer->phone ?? '',
                'avatar' => $user->avatar,
            ]
        );

        // Calcular total
        $total = 0;
        foreach ($validated['items'] as $item) {
            $product = \App\Models\Product::find($item['product_id']);
            $total += $product->price * $item['quantity'];
        }

        // Crear order
        $order = Order::create([
            'account_id' => $validated['account_id'],
            'customer_id' => $customer->id,
            'customer_name' => $user->name,
            'customer_phone' => $customer->phone,
            'customer_email' => $user->email,
            'delivery_type' => $validated['delivery_type'],
            'delivery_address' => $validated['delivery_address'] ?? null,
            'total' => $total,
            'notes' => $validated['notes'] ?? null,
            'notification_channel' => $validated['notification_channel'] ?? 'email',
            'status' => 'pending',
        ]);

        // Crear items del pedido
        foreach ($validated['items'] as $item) {
            $product = \App\Models\Product::find($item['product_id']);

            \App\Models\OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'product_name' => $product->name,
                'quantity' => $item['quantity'],
                'price' => $product->price,
                'notes' => $item['notes'] ?? null,
            ]);
        }

        // Actualizar last_order_at
        $customer->touchLastOrder();

        return response()->json([
            'success' => true,
            'message' => 'Order created successfully',
            'order' => $order->load(['account.profile', 'items.product']),
        ], 201);
    }

    /**
     * Cancelar un pedido del cliente.
     *
     * POST /api/customer/orders/{id}/cancel
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isCustomer()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Obtener todos los customers del usuario
        $customerIds = \App\Models\Customer::where('user_id', $user->id)
            ->pluck('id');

        $order = Order::whereIn('customer_id', $customerIds)
            ->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
            ], 404);
        }

        // Solo se puede cancelar si está pending o confirmed
        if (!in_array($order->status, ['pending', 'confirmed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot cancel this order',
            ], 400);
        }

        $order->update([
            'status' => 'cancelled',
            'cancellation_reason' => $request->input('reason', 'Cancelled by customer'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order cancelled successfully',
            'order' => $order,
        ]);
    }

    /**
     * Obtener pedidos activos del cliente.
     *
     * GET /api/customer/orders/active
     */
    public function active(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isCustomer()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $customerIds = \App\Models\Customer::where('user_id', $user->id)
            ->pluck('id');

        $orders = Order::whereIn('customer_id', $customerIds)
            ->whereIn('status', ['pending', 'confirmed', 'preparing', 'ready'])
            ->with(['account.profile', 'items.product'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'orders' => $orders,
        ]);
    }

    /**
     * Obtener historial de pedidos completados.
     *
     * GET /api/customer/orders/history
     */
    public function history(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isCustomer()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $customerIds = \App\Models\Customer::where('user_id', $user->id)
            ->pluck('id');

        $orders = Order::whereIn('customer_id', $customerIds)
            ->whereIn('status', ['completed', 'cancelled'])
            ->with(['account.profile', 'items.product'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'orders' => $orders,
        ]);
    }

    /**
     * Re-ordenar un pedido previo.
     *
     * POST /api/customer/orders/{id}/reorder
     */
    public function reorder(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isCustomer()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $customerIds = \App\Models\Customer::where('user_id', $user->id)
            ->pluck('id');

        $originalOrder = Order::whereIn('customer_id', $customerIds)
            ->with('items')
            ->find($id);

        if (!$originalOrder) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found',
            ], 404);
        }

        // Crear nuevo pedido basado en el original
        $newOrder = Order::create([
            'account_id' => $originalOrder->account_id,
            'customer_id' => $originalOrder->customer_id,
            'customer_name' => $user->name,
            'customer_phone' => $originalOrder->customer_phone,
            'customer_email' => $user->email,
            'delivery_type' => $request->input('delivery_type', $originalOrder->delivery_type),
            'delivery_address' => $request->input('delivery_address', $originalOrder->delivery_address),
            'total' => $originalOrder->total,
            'notification_channel' => $originalOrder->notification_channel,
            'status' => 'pending',
        ]);

        // Copiar items
        foreach ($originalOrder->items as $item) {
            \App\Models\OrderItem::create([
                'order_id' => $newOrder->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product_name,
                'quantity' => $item->quantity,
                'price' => $item->price,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Order reordered successfully',
            'order' => $newOrder->load(['account.profile', 'items.product']),
        ], 201);
    }
}
