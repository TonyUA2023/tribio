<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerBookingController extends Controller
{
    /**
     * Obtener todas las reservas del cliente.
     *
     * GET /api/customer/bookings
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

        $query = Booking::whereIn('customer_id', $customerIds)
            ->with(['account.profile']);

        // Filtrar por negocio específico
        if ($request->has('account_id')) {
            $query->where('account_id', $request->account_id);
        }

        // Filtrar por estado
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Ordenar
        $query->orderBy('booking_date', 'desc')
              ->orderBy('booking_time', 'desc');

        $bookings = $query->paginate(20);

        return response()->json([
            'success' => true,
            'bookings' => $bookings,
        ]);
    }

    /**
     * Obtener una reserva específica del cliente.
     *
     * GET /api/customer/bookings/{id}
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

        $booking = Booking::whereIn('customer_id', $customerIds)
            ->with(['account.profile'])
            ->find($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'booking' => $booking,
        ]);
    }

    /**
     * Crear una nueva reserva (autenticado).
     *
     * POST /api/customer/bookings
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
            'booking_date' => 'required|date|after_or_equal:today',
            'booking_time' => 'required|date_format:H:i',
            'service' => 'required|string|max:255',
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

        // Crear booking
        $booking = Booking::create([
            'account_id' => $validated['account_id'],
            'customer_id' => $customer->id,
            'client_name' => $user->name,
            'client_phone' => $customer->phone,
            'client_email' => $user->email,
            'booking_date' => $validated['booking_date'],
            'booking_time' => $validated['booking_time'],
            'service' => $validated['service'],
            'notes' => $validated['notes'] ?? null,
            'notification_channel' => $validated['notification_channel'] ?? 'email',
            'status' => 'pending',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Actualizar last_booking_at
        $customer->touchLastBooking();

        return response()->json([
            'success' => true,
            'message' => 'Booking created successfully',
            'booking' => $booking->load(['account.profile']),
        ], 201);
    }

    /**
     * Cancelar una reserva del cliente.
     *
     * POST /api/customer/bookings/{id}/cancel
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

        $booking = Booking::whereIn('customer_id', $customerIds)
            ->find($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found',
            ], 404);
        }

        // Solo se puede cancelar si está pending o confirmed
        if (!in_array($booking->status, ['pending', 'confirmed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot cancel this booking',
            ], 400);
        }

        $booking->update([
            'status' => 'cancelled',
            'cancellation_reason' => $request->input('reason', 'Cancelled by customer'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Booking cancelled successfully',
            'booking' => $booking,
        ]);
    }

    /**
     * Obtener próximas reservas del cliente.
     *
     * GET /api/customer/bookings/upcoming
     */
    public function upcoming(Request $request): JsonResponse
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

        $bookings = Booking::whereIn('customer_id', $customerIds)
            ->whereIn('status', ['pending', 'confirmed'])
            ->where('booking_date', '>=', now()->toDateString())
            ->with(['account.profile'])
            ->orderBy('booking_date', 'asc')
            ->orderBy('booking_time', 'asc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'bookings' => $bookings,
        ]);
    }

    /**
     * Obtener historial de reservas completadas.
     *
     * GET /api/customer/bookings/history
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

        $bookings = Booking::whereIn('customer_id', $customerIds)
            ->whereIn('status', ['completed', 'cancelled'])
            ->with(['account.profile'])
            ->orderBy('booking_date', 'desc')
            ->orderBy('booking_time', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'bookings' => $bookings,
        ]);
    }
}
