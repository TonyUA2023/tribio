<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Post;
use App\Models\Order;
use App\Models\Booking;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContentFeedController extends Controller
{
    /**
     * Mostrar el feed de contenido estilo TikTok
     */
    public function show(Request $request, string $accountSlug)
    {
        // Buscar la cuenta
        $account = Account::where('slug', $accountSlug)->firstOrFail();

        // Obtener posts publicados con paginación
        $posts = Post::where('account_id', $account->id)
            ->published()
            ->latest()
            ->with('account:id,name,slug,logo_url')
            ->paginate(10);

        // Calcular estadísticas del negocio
        $stats = $this->getBusinessStats($account);

        return Inertia::render('ContentFeed', [
            'account' => [
                'id' => $account->id,
                'name' => $account->name,
                'slug' => $account->slug,
                'logo' => $account->logo_url,
                'cover' => $account->cover_url,
                'bio' => $account->description,
            ],
            'posts' => $posts,
            'stats' => $stats,
        ]);
    }

    /**
     * API: Obtener más posts (para scroll infinito)
     */
    public function loadMore(Request $request, string $accountSlug)
    {
        $account = Account::where('slug', $accountSlug)->firstOrFail();

        $posts = Post::where('account_id', $account->id)
            ->published()
            ->latest()
            ->with('account:id,name,slug,logo_url')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $posts
        ]);
    }

    /**
     * API: Dar/quitar like a un post
     */
    public function toggleLike(Request $request, int $postId)
    {
        $post = Post::findOrFail($postId);

        // Identificador único del usuario (IP + User Agent hash)
        $userIdentifier = $this->getUserIdentifier($request);

        // Verificar si ya dio like
        $existingLike = $post->likes()
            ->where('user_identifier', $userIdentifier)
            ->first();

        if ($existingLike) {
            // Quitar like
            $existingLike->delete();
            $post->decrementLikes();
            $liked = false;
        } else {
            // Dar like
            $post->likes()->create([
                'user_identifier' => $userIdentifier,
                'ip_address' => $request->ip(),
            ]);
            $post->incrementLikes();
            $liked = true;
        }

        return response()->json([
            'success' => true,
            'liked' => $liked,
            'likes_count' => $post->fresh()->likes_count
        ]);
    }

    /**
     * API: Incrementar vistas de un post
     */
    public function incrementView(Request $request, int $postId)
    {
        $post = Post::findOrFail($postId);
        $post->incrementViews();

        return response()->json([
            'success' => true,
            'views_count' => $post->views_count
        ]);
    }

    /**
     * Calcular estadísticas del negocio
     */
    private function getBusinessStats(Account $account): array
    {
        // Total de likes en todos los posts
        $totalLikes = Post::where('account_id', $account->id)
            ->sum('likes_count');

        // Total de pedidos
        $totalOrders = Order::where('account_id', $account->id)
            ->whereIn('status', ['delivered', 'ready', 'preparing'])
            ->count();

        // Total de reservas
        $totalBookings = Booking::where('account_id', $account->id)
            ->whereIn('status', ['confirmed', 'completed'])
            ->count();

        // Promedio de calificación
        $averageRating = Review::where('account_id', $account->id)
            ->where('status', 'approved')
            ->avg('rating') ?? 0;

        // Total de vistas
        $totalViews = Post::where('account_id', $account->id)
            ->sum('views_count');

        // Total de posts
        $totalPosts = Post::where('account_id', $account->id)
            ->published()
            ->count();

        return [
            'total_likes' => (int) $totalLikes,
            'total_orders' => (int) $totalOrders,
            'total_bookings' => (int) $totalBookings,
            'average_rating' => round($averageRating, 1),
            'total_views' => (int) $totalViews,
            'total_posts' => (int) $totalPosts,
        ];
    }

    /**
     * Generar identificador único para usuario anónimo
     */
    private function getUserIdentifier(Request $request): string
    {
        $ip = $request->ip();
        $userAgent = $request->userAgent();

        return hash('sha256', $ip . $userAgent);
    }
}
