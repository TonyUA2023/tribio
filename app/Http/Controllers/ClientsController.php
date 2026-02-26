<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\GetsCurrentAccount;
use App\Models\Booking;
use App\Services\MlPredictionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class ClientsController extends Controller
{
    use GetsCurrentAccount;

    public function index(Request $request)
    {
        $user = $request->user();
        $account = $this->getCurrentAccount($user);

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

                $completedCount = $bookings->where('status', 'completed')->count();
                $cancelledCount = $bookings->where('status', 'cancelled')->count();
                $totalCount     = $bookings->count();
                $daysSinceLast  = $client->last_booking_date
                    ? (int) Carbon::parse($client->last_booking_date)->diffInDays(now())
                    : 999;

                return [
                    'name' => $client->client_name,
                    'email' => $client->client_email,
                    'phone' => $client->client_phone,
                    'total_bookings' => $client->total_bookings,
                    'last_booking_date' => $client->last_booking_date ? Carbon::parse($client->last_booking_date)->format('Y-m-d') : null,
                    'first_booking_date' => $client->first_booking_date ? Carbon::parse($client->first_booking_date)->format('Y-m-d') : null,
                    'pending_count' => $bookings->where('status', 'pending')->count(),
                    'confirmed_count' => $bookings->where('status', 'confirmed')->count(),
                    'completed_count' => $completedCount,
                    'cancelled_count' => $cancelledCount,
                    'days_since_last' => $daysSinceLast,
                    'cancellation_rate' => $totalCount > 0 ? round($cancelledCount / $totalCount, 2) : 0,
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

        // Predicciones M2 churn en batch (máx 20 clientes para no sobrecargar)
        $mlService = new MlPredictionService();
        $churnSlice = $clients->take(20);
        $churnPayloads = $churnSlice->map(fn($c) => [
            'days_since_last_order' => $c['days_since_last'],
            'total_orders_paid'     => $c['completed_count'],
            'avg_order_value'       => 0.0,
            'cancellation_rate'     => $c['cancellation_rate'],
        ])->values()->all();

        $churnResults = $mlService->batchPredict($churnPayloads, '/predict/churn');

        $clients = $clients->map(function ($client, $index) use ($churnResults) {
            $client['ml_churn'] = $churnResults[$index] ?? null;
            return $client;
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
