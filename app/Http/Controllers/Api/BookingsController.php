<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Account;
use Carbon\Carbon;

class BookingsController extends Controller
{
    /**
     * Helper privado para obtener la CUENTA (No el perfil)
     * Igual que en tu Dashboard Web
     */
    private function getAccount($user) {
        return Account::where('user_id', $user->id)->first();
    }

    public function index(Request $request)
    {
        $user = $request->user();
        
        // 1. Buscamos la CUENTA, no solo el perfil
        $account = $this->getAccount($user);

        if (!$account) {
            return response()->json(['success' => false, 'message' => 'Cuenta no encontrada'], 400);
        }

        // 2. Filtramos por account_id (IGUAL QUE EN LA WEB)
        $query = Booking::where('account_id', $account->id)
                        ->orderBy('booking_date', 'desc')
                        ->orderBy('booking_time', 'desc');

        // Filtros de estado desde la App
        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // 3. Mapeamos los datos para asegurar que la App reciba lo que espera
        // Incluimos el nombre del perfil por si tienes varias sucursales
        $bookings = $query->paginate(20);

        return response()->json($bookings);
    }

    public function stats(Request $request)
    {
        $user = $request->user();
        $account = $this->getAccount($user);

        if (!$account) return response()->json(['error' => 'No account'], 400);

        // Estadísticas basadas en la CUENTA COMPLETA
        $stats = [
            'pending' => Booking::where('account_id', $account->id)->where('status', 'pending')->count(),
            'confirmed' => Booking::where('account_id', $account->id)->where('status', 'confirmed')->count(),
            'today' => Booking::where('account_id', $account->id)->whereDate('booking_date', Carbon::today())->count(),
            'completed' => Booking::where('account_id', $account->id)->where('status', 'completed')->count(),
            'cancelled' => Booking::where('account_id', $account->id)->where('status', 'cancelled')->count(),
        ];

        return response()->json(['success' => true, 'data' => $stats]);
    }
    
    /**
     * Actualizar estado (Copiado lógica de seguridad de AppointmentsController)
     */
    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();
        $account = $this->getAccount($user);

        if (!$account) return response()->json(['error' => 'No account'], 400);

        $booking = Booking::where('id', $id)->where('account_id', $account->id)->first();

        if (!$booking) {
            return response()->json(['success' => false, 'message' => 'Reserva no encontrada o no pertenece a tu cuenta'], 404);
        }

        $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled,completed'
        ]);

        $booking->update(['status' => $request->status]);

        return response()->json(['success' => true, 'message' => 'Estado actualizado', 'data' => $booking]);
    }
}