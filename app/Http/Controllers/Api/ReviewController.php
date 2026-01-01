<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ReviewController extends Controller
{
    /**
     * Crear una nueva reseña
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'profile_id' => 'required|exists:profiles,id',
            'client_name' => 'required|string|max:255',
            'client_email' => 'nullable|email|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:1000',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,gif,heic,webp|max:5120', // Max 5MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Obtener el profile y su account_id
            $profile = Profile::findOrFail($request->profile_id);

            $imagePath = null;

            // Procesar imagen si se subió
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $fileName = Str::random(40) . '.' . $image->getClientOriginalExtension();

                // Guardar en: storage/app/public/reviews/{account_id}/
                $imagePath = $image->storeAs(
                    "reviews/{$profile->account_id}",
                    $fileName,
                    'public'
                );
            }

            $review = Review::create([
                'profile_id' => $request->profile_id,
                'account_id' => $profile->account_id,
                'client_name' => $request->client_name,
                'client_email' => $request->client_email,
                'rating' => $request->rating,
                'comment' => $request->comment,
                'image_path' => $imagePath,
                'status' => 'pending', // Requiere aprobación
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'success' => true,
                'message' => '¡Gracias por tu reseña! Será publicada una vez aprobada.',
                'data' => [
                    'review_id' => $review->id,
                    'rating' => $review->rating,
                    'status' => $review->status,
                    'has_image' => !!$imagePath,
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la reseña',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener reseñas aprobadas de un perfil
     */
    public function index(Request $request)
    {
        $profileId = $request->query('profile_id');

        if (!$profileId) {
            return response()->json([
                'success' => false,
                'message' => 'profile_id es requerido'
            ], 422);
        }

        $reviews = Review::where('profile_id', $profileId)
            ->approved()
            ->ordered() // Usar el scope que incluye destacados
            ->get()
            ->map(function ($review) {
                return [
                    'id' => $review->id,
                    'client_name' => $review->client_name,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'image_url' => $review->image_url,
                    'is_featured' => $review->is_featured,
                    'created_at' => $review->created_at->diffForHumans(),
                ];
            });

        // Calcular promedio de calificación
        $averageRating = $reviews->count() > 0
            ? round($reviews->avg('rating'), 1)
            : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'reviews' => $reviews,
                'total' => $reviews->count(),
                'average_rating' => $averageRating,
            ]
        ]);
    }

    /**
     * Actualizar estado de una reseña (para el dashboard del cliente)
     */
    public function updateStatus(Request $request, Review $review)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,approved,rejected',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $review->update([
            'status' => $request->status
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Estado actualizado exitosamente',
            'data' => $review
        ]);
    }
}
