<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class ClientsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $account = $user->account()->first();

        if (!$account) {
            return redirect()->route('dashboard');
        }

        // Obtener clientes únicos agrupados por email/teléfono
        $clients = Booking::where('account_id', $account->id)
            ->select([
                'client_name',
                'client_email',
                'client_phone',
                DB::raw('COUNT(*) as total_bookings'),
                DB::raw('MAX(booking_date) as last_booking_date'),
                DB::raw('MIN(created_at) as first_booking_date'),
            ])
            ->groupBy('client_email', 'client_phone', 'client_name')
            ->orderBy('last_booking_date', 'desc')
            ->get()
            ->map(function ($client) use ($account) {
                // Obtener todas las citas de este cliente
                $bookings = Booking::where('account_id', $account->id)
                    ->where('client_email', $client->client_email)
                    ->where('client_phone', $client->client_phone)
                    ->orderBy('booking_date', 'desc')
                    ->get();

                return [
                    'name' => $client->client_name,
                    'email' => $client->client_email,
                    'phone' => $client->client_phone,
                    'total_bookings' => $client->total_bookings,
                    'last_booking_date' => $client->last_booking_date ? Carbon::parse($client->last_booking_date)->format('Y-m-d') : null,
                    'first_booking_date' => $client->first_booking_date ? Carbon::parse($client->first_booking_date)->format('Y-m-d') : null,
                    'pending_count' => $bookings->where('status', 'pending')->count(),
                    'confirmed_count' => $bookings->where('status', 'confirmed')->count(),
                    'completed_count' => $bookings->where('status', 'completed')->count(),
                    'cancelled_count' => $bookings->where('status', 'cancelled')->count(),
                    'bookings' => $bookings->map(function ($booking) {
                        return [
                            'id' => $booking->id,
                            'booking_date' => $booking->booking_date->format('Y-m-d'),
                            'booking_time' => $booking->booking_time->format('H:i'),
                            'service' => $booking->service,
                            'status' => $booking->status,
                            'notes' => $booking->notes,
                        ];
                    }),
                ];
            });

        // Estadísticas generales
        $stats = [
            'total_clients' => $clients->count(),
            'active_clients' => $clients->where('pending_count', '>', 0)
                ->merge($clients->where('confirmed_count', '>', 0))
                ->unique('email')
                ->count(),
            'total_bookings' => Booking::where('account_id', $account->id)->count(),
        ];

        return Inertia::render('clients/index', [
            'stats' => $stats,
            'clients' => $clients,
        ]);
    }
}
