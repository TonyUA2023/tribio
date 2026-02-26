<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\GetsCurrentAccount;
use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AppointmentsController extends Controller
{
    use GetsCurrentAccount;

    public function index(Request $request)
    {
        $user = $request->user();
        $account = $this->getCurrentAccount($user);

        if (!$account) {
            return redirect()->route('dashboard');
        }

        // Obtener todas las citas de la cuenta
        $bookingsQuery = Booking::where('account_id', $account->id);

        // Estadísticas
        $stats = [
            'today' => (clone $bookingsQuery)->today()->count(),
            'pending' => (clone $bookingsQuery)->pending()->count(),
            'confirmed' => (clone $bookingsQuery)->confirmed()->count(),
            'completed' => (clone $bookingsQuery)->where('status', 'completed')->count(),
        ];

        // Próximas citas (ordenadas por fecha y hora)
        $upcomingBookings = (clone $bookingsQuery)
            ->upcoming()
            ->with('profile')
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'client_name' => $booking->client_name,
                    'client_phone' => $booking->client_phone,
                    'client_email' => $booking->client_email,
                    'booking_date' => $booking->booking_date->format('Y-m-d'),
                    'booking_time' => $booking->booking_time->format('H:i'),
                    'service' => $booking->service,
                    'status' => $booking->status,
                    'notes' => $booking->notes,
                    'profile_name' => $booking->profile?->name,
                ];
            });

        return Inertia::render('appointments/index', [
            'stats' => $stats,
            'bookings' => $upcomingBookings,
        ]);
    }

    public function updateStatus(Request $request, Booking $booking)
    {
        $user = $request->user();
        $account = $this->getCurrentAccount($user);

        // Verificar que la cita pertenece a la cuenta del usuario
        if ($booking->account_id !== $account->id) {
            abort(403, 'No tienes permiso para actualizar esta cita.');
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,completed,cancelled',
        ]);

        $booking->update([
            'status' => $validated['status'],
        ]);

        return back()->with('success', 'Estado de la cita actualizado correctamente.');
    }
}
