<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Review;
use App\Models\Account;

class ReviewsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // 1. Buscar por Cuenta
        $account = Account::where('user_id', $user->id)->first();

        if (!$account) {
            return response()->json([]);
        }

        // 2. Traer reseñas de la cuenta
        $reviews = Review::where('account_id', $account->id)
                         ->orderBy('created_at', 'desc')
                         ->paginate(20);

        return response()->json($reviews);
    }

    public function toggleFeatured(Request $request, $id)
    {
        $user = $request->user();
        $account = Account::where('user_id', $user->id)->first();
        
        $review = Review::where('id', $id)->where('account_id', $account->id)->first();

        if ($review) {
            $review->is_featured = !$review->is_featured;
            $review->save();
            return response()->json(['success' => true, 'is_featured' => $review->is_featured]);
        }
        
        return response()->json(['error' => 'Review not found'], 404);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $account = Account::where('user_id', $user->id)->first();
        
        $review = Review::where('id', $id)->where('account_id', $account->id)->first();

        if ($review) {
            $review->delete();
            return response()->json(['success' => true]);
        }
        
        return response()->json(['error' => 'Review not found'], 404);
    }
}