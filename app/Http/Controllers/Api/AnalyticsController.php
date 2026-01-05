<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProfileVisit;
use App\Models\Booking;
use App\Models\Review;
use App\Models\Account;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    public function overview(Request $request)
    {
        $user = $request->user();
        
        // 1. Buscamos la CUENTA (Igual que en Bookings)
        $account = Account::where('user_id', $user->id)->first();
        
        if (!$account) {
            return response()->json(['success' => false, 'message' => 'Cuenta no encontrada'], 400);
        }

        // 2. Calculamos estadísticas basadas en ACCOUNT_ID
        // (Nota: ProfileVisit suele estar ligado a Profile, así que buscamos los perfiles de la cuenta)
        $profileIds = $account->profiles()->pluck('id');

        // VISITAS (Suma de todos los perfiles de la cuenta)
        $viewsCurrent = ProfileVisit::whereIn('profile_id', $profileIds)->count();

        // RESERVAS (Directo por account_id)
        $bookingsCurrent = Booking::where('account_id', $account->id)->count();
        
        // RESEÑAS (Directo por account_id)
        $reviewsCount = Review::where('account_id', $account->id)->count();
        $averageRating = Review::where('account_id', $account->id)->avg('rating') ?? 0;

        return response()->json([
            'success' => true,
            'profile_views' => $viewsCurrent,
            'profile_views_change' => 0, // Puedes implementar lógica de comparación de fechas luego
            'bookings_total' => $bookingsCurrent,
            'bookings_change' => 0,
            'reviews_count' => $reviewsCount,
            'average_rating' => round($averageRating, 1),
        ]);
    }
}