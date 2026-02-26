<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\GetsCurrentAccount;
use App\Models\Review;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ReviewManagementController extends Controller
{
    use GetsCurrentAccount;
    /**
     * Muestra la página de administración de reseñas
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $account = $this->getCurrentAccount($user);

        if (!$account) {
            return redirect()->route('dashboard')
                ->with('error', 'No se encontró una cuenta asociada');
        }

        // Obtener el perfil del usuario autenticado
        $profile = Profile::where('account_id', $account->id)->first();

        if (!$profile) {
            return redirect()->route('dashboard')
                ->with('error', 'No se encontró un perfil asociado a tu cuenta');
        }

        // Obtener todas las reseñas del perfil ordenadas
        $reviews = Review::where('profile_id', $profile->id)
            ->ordered()
            ->get();

        return Inertia::render('reviews/manage', [
            'reviews' => $reviews,
            'profile' => $profile,
        ]);
    }

    /**
     * Marcar/desmarcar reseña como destacada
     */
    public function toggleFeatured(Request $request, Review $review)
    {
        // Verificar que la reseña pertenece al usuario
        $user = $request->user();
        $account = $this->getCurrentAccount($user);

        if (!$account) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $profile = Profile::where('account_id', $account->id)->first();

        if (!$profile || $review->profile_id !== $profile->id) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $review->is_featured = !$review->is_featured;
        $review->save();

        return response()->json([
            'success' => true,
            'review' => $review->fresh(),
        ]);
    }

    /**
     * Actualizar el orden de las reseñas
     */
    public function updateOrder(Request $request)
    {
        $request->validate([
            'reviews' => 'required|array',
            'reviews.*.id' => 'required|exists:reviews,id',
            'reviews.*.order' => 'required|integer',
        ]);

        $user = $request->user();
        $account = $this->getCurrentAccount($user);

        if (!$account) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $profile = Profile::where('account_id', $account->id)->first();

        if (!$profile) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        foreach ($request->reviews as $reviewData) {
            $review = Review::find($reviewData['id']);

            // Verificar que la reseña pertenece al usuario
            if ($review->profile_id !== $profile->id) {
                continue;
            }

            $review->display_order = $reviewData['order'];
            $review->save();
        }

        return response()->json(['success' => true]);
    }

    /**
     * Eliminar una reseña
     */
    public function destroy(Request $request, Review $review)
    {
        $user = $request->user();
        $account = $this->getCurrentAccount($user);

        if (!$account) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $profile = Profile::where('account_id', $account->id)->first();

        if (!$profile || $review->profile_id !== $profile->id) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        // Eliminar imagen si existe
        if ($review->image_path) {
            Storage::disk('public')->delete($review->image_path);
        }

        $review->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Aprobar una reseña pendiente
     */
    public function approve(Request $request, Review $review)
    {
        $user = $request->user();
        $account = $this->getCurrentAccount($user);

        if (!$account) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $profile = Profile::where('account_id', $account->id)->first();

        if (!$profile || $review->profile_id !== $profile->id) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $review->status = 'approved';
        $review->save();

        return response()->json([
            'success' => true,
            'review' => $review->fresh(),
        ]);
    }

    /**
     * Rechazar una reseña
     */
    public function reject(Request $request, Review $review)
    {
        $user = $request->user();
        $account = $this->getCurrentAccount($user);

        if (!$account) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $profile = Profile::where('account_id', $account->id)->first();

        if (!$profile || $review->profile_id !== $profile->id) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $review->status = 'rejected';
        $review->save();

        return response()->json([
            'success' => true,
            'review' => $review->fresh(),
        ]);
    }
}
