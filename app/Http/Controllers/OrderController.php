<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log; // Agregado para logs de errores
use Illuminate\Support\Facades\Mail; // Agregado para emails
use Inertia\Inertia;
use App\Services\BrevoSmsService; // Importamos el servicio de SMS

class OrderController extends Controller
{
    /**
     * Mostrar lista de pedidos
     */
    public function index(Request $request)
    {
        $account = Auth::user()->account;

        $query = Order::where('account_id', $account->id)->with('items.product');

        // Filtros
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('payment_status') && $request->payment_status !== 'all') {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('order_number', 'like', '%' . $request->search . '%')
                  ->orWhere('customer_name', 'like', '%' . $request->search . '%')
                  ->orWhere('customer_phone', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(20);

        return Inertia::render('Client/Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['status', 'payment_status', 'search', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Ver detalle de pedido
     */
    public function show(Order $order)
    {
        // Verificar que el pedido pertenece a la cuenta del usuario
        if ($order->account_id !== Auth::user()->account->id) {
            abort(403, 'No autorizado');
        }

        $order->load('items.product');

        return Inertia::render('Client/Orders/Show', [
            'order' => $order,
        ]);
    }

    /**
     * Actualizar estado del pedido (CON NOTIFICACIONES MULTICANAL)
     */
    public function updateStatus(Request $request, Order $order, BrevoSmsService $smsService)
    {
        // Verificar que el pedido pertenece a la cuenta del usuario
        if ($order->account_id !== Auth::user()->account->id) {
            abort(403, 'No autorizado');
        }

        // ACTUALIZADO: Estados estandarizados (Pending -> Preparing -> Ready -> Delivered)
        $validated = $request->validate([
            'status' => 'required|in:pending,preparing,ready,delivered,cancelled',
        ]);

        $newStatus = $validated['status'];
        $updateData = ['status' => $newStatus];

        // Actualizar timestamps según el estado
        // 'preparing' asume confirmación
        if ($newStatus === 'preparing' && !$order->confirmed_at) {
            $updateData['confirmed_at'] = now();
        }

        if ($newStatus === 'delivered' && !$order->delivered_at) {
            $updateData['delivered_at'] = now();
        }

        $order->update($updateData);

        // --- LÓGICA DE NOTIFICACIONES ---
        $messageText = $this->getNotificationMessage($order, $newStatus);
        $whatsappLink = null;
        $notificationSent = false;

        if ($messageText) {
            switch ($order->notification_channel) {
                case 'sms':
                    // Envío Automático por Brevo
                    if ($order->customer_phone) {
                        $smsService->sendSms($order->customer_phone, $messageText);
                        $notificationSent = true;
                    }
                    break;

                case 'whatsapp':
                    // Generar Link para envío manual (se pasa al frontend en flash session)
                    if ($order->customer_phone) {
                        $phone = preg_replace('/[^0-9]/', '', $order->customer_phone);
                        $whatsappLink = "https://wa.me/{$phone}?text=" . urlencode($messageText);
                    }
                    break;

                case 'email':
                default:
                    // Envío por Email
                    if ($order->customer_email) {
                        try {
                            // Usamos GenericEmail para simplificar, o tu mailable específico
                            Mail::to($order->customer_email)->send(
                                new \App\Mail\GenericEmail(
                                    "Actualización de Pedido #{$order->order_number}", 
                                    $messageText
                                )
                            );
                            $notificationSent = true;
                        } catch (\Exception $e) {
                            Log::error("Error enviando email pedido {$order->id}: " . $e->getMessage());
                        }
                    }
                    break;
            }
        }

        // Retornamos redirect con datos flash
        // Si hay whatsapp_link, el frontend (React) debería detectarlo y mostrar un modal o botón
        return redirect()->back()
            ->with('success', 'Estado actualizado a ' . ucfirst($newStatus))
            ->with('whatsapp_link', $whatsappLink);
    }

    /**
     * Helper privado para generar mensajes de notificación
     */
    private function getNotificationMessage($order, $status)
    {
        $id = $order->order_number;
        // Obtenemos el nombre del negocio desde la relación account
        $business = $order->account->name ?? 'JSTACK';

        return match ($status) {
            'preparing' => "Hola {$order->customer_name}, tu pedido #{$id} en {$business} se está preparando 👨‍🍳.",
            'ready'     => "¡{$order->customer_name}! Tu pedido #{$id} está LISTO ✅. Puedes recogerlo o esperar el delivery.",
            'delivered' => "Tu pedido #{$id} ha sido entregado. ¡Gracias por comprar en {$business}! ⭐",
            'cancelled' => "Tu pedido #{$id} en {$business} ha sido cancelado. Contáctanos para más info.",
            default     => null
        };
    }

    /**
     * Actualizar estado de pago
     */
    public function updatePaymentStatus(Request $request, Order $order)
    {
        // Verificar que el pedido pertenece a la cuenta del usuario
        if ($order->account_id !== Auth::user()->account->id) {
            abort(403, 'No autorizado');
        }

        $validated = $request->validate([
            'payment_status' => 'required|in:pending,paid',
        ]);

        $order->update(['payment_status' => $validated['payment_status']]);

        return redirect()->back()->with('success', 'Estado de pago actualizado');
    }

    /**
     * Estadísticas del dashboard
     */
    public function stats(Request $request)
    {
        $account = Auth::user()->account;

        // Período (por defecto: últimos 30 días)
        $dateFrom = $request->input('date_from', now()->subDays(30));
        $dateTo = $request->input('date_to', now());

        // Array de estados considerados "activos" o "validos" para ingresos
        $validStatuses = ['confirmed', 'preparing', 'ready', 'delivered']; // Actualizado 'ready'

        $stats = [
            // Pedidos de hoy
            'orders_today' => Order::where('account_id', $account->id)
                ->whereDate('created_at', today())
                ->count(),

            // Pedidos pendientes
            'orders_pending' => Order::where('account_id', $account->id)
                ->where('status', 'pending')
                ->count(),

            // Pedidos en proceso (preparing + ready)
            'orders_in_progress' => Order::where('account_id', $account->id)
                ->whereIn('status', ['preparing', 'ready'])
                ->count(),

            // Ingresos del período
            'revenue' => Order::where('account_id', $account->id)
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->whereIn('status', $validStatuses)
                ->sum('total'),

            // Ingresos de hoy
            'revenue_today' => Order::where('account_id', $account->id)
                ->whereDate('created_at', today())
                ->whereIn('status', $validStatuses)
                ->sum('total'),

            // Ticket promedio
            'average_ticket' => Order::where('account_id', $account->id)
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->whereIn('status', $validStatuses)
                ->avg('total'),

            // Total de pedidos en el período
            'total_orders' => Order::where('account_id', $account->id)
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->count(),

            // Productos más vendidos
            'top_products' => OrderItem::select('product_name', DB::raw('SUM(quantity) as total_sold'))
                ->whereHas('order', function ($q) use ($account, $dateFrom, $dateTo, $validStatuses) {
                    $q->where('account_id', $account->id)
                      ->whereBetween('created_at', [$dateFrom, $dateTo])
                      ->whereIn('status', $validStatuses);
                })
                ->groupBy('product_name')
                ->orderBy('total_sold', 'desc')
                ->limit(5)
                ->get(),

            // Pedidos por estado
            'orders_by_status' => Order::where('account_id', $account->id)
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->select('status', DB::raw('COUNT(*) as count'))
                ->groupBy('status')
                ->get(),

            // Pedidos por día (últimos 7 días)
            'orders_by_day' => Order::where('account_id', $account->id)
                ->whereBetween('created_at', [now()->subDays(7), now()])
                ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'), DB::raw('SUM(total) as revenue'))
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
        ];

        return response()->json($stats);
    }

    /**
     * Eliminar pedido (soft delete)
     */
    public function destroy(Order $order)
    {
        // Verificar que el pedido pertenece a la cuenta del usuario
        if ($order->account_id !== Auth::user()->account->id) {
            abort(403, 'No autorizado');
        }

        $order->delete();

        return redirect()->back()->with('success', 'Pedido eliminado exitosamente');
    }

    /**
     * Actualizar notas del pedido
     */
    public function updateNotes(Request $request, Order $order)
    {
        // Verificar que el pedido pertenece a la cuenta del usuario
        if ($order->account_id !== Auth::user()->account->id) {
            abort(403, 'No autorizado');
        }

        $validated = $request->validate([
            'notes' => 'nullable|string',
        ]);

        $order->update(['notes' => $validated['notes']]);

        return redirect()->back()->with('success', 'Notas actualizadas');
    }
}