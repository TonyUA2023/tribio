<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\CronController;
use App\Http\Controllers\Api\StoryController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AccountProfileController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\StoriesController;
use App\Http\Controllers\Api\BookingsController;
use App\Http\Controllers\Api\ReviewsController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\PostController; // Controlador para el FEED PÚBLICO
use App\Http\Controllers\Api\PostsController; // Controlador para GESTIÓN (APP MÓVIL)

/*
|--------------------------------------------------------------------------
| API Routes - Public (Static)
|--------------------------------------------------------------------------
| Estas rutas son estáticas y públicas, no generan conflicto.
*/

// Rutas públicas para reservas (clientes finales)
Route::post('/bookings', [BookingController::class, 'store']);
Route::get('/bookings/occupied-slots', [BookingController::class, 'getOccupiedSlots']);

// Rutas públicas para reseñas
Route::post('/reviews', [ReviewController::class, 'store']);
Route::get('/reviews', [ReviewController::class, 'index']);

// Ruta para cron jobs externos
Route::get('/cron/send-emails', [CronController::class, 'sendEmails']);

// Autenticación (Login)
Route::post('/auth/login', [AuthController::class, 'login']);


/*
|--------------------------------------------------------------------------
| API Routes - Mobile App (Owner/Admin) - PROTEGIDAS
|--------------------------------------------------------------------------
| IMPORTANTE: Este bloque se ha movido ANTES de las rutas dinámicas públicas
| para asegurar que '/account/posts' entre aquí y no sea capturado como un slug.
*/

Route::middleware('auth:sanctum')->group(function () {
    
    // Auth & Sesión
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Perfil de la cuenta
    Route::get('/account/profile', [AccountProfileController::class, 'show']);
    Route::put('/account/profile', [AccountProfileController::class, 'update']);
    Route::post('/account/profile/logo', [AccountProfileController::class, 'uploadLogo']);
    Route::post('/account/profile/cover', [AccountProfileController::class, 'uploadCover']);

    // Galería
    Route::get('/account/gallery', [GalleryController::class, 'index']);
    Route::post('/account/gallery', [GalleryController::class, 'store']);
    Route::put('/account/gallery/{id}', [GalleryController::class, 'update']);
    Route::delete('/account/gallery/{id}', [GalleryController::class, 'destroy']);
    Route::post('/account/gallery/reorder', [GalleryController::class, 'reorder']);

    // Stories (Gestión)
    Route::get('/account/stories', [StoriesController::class, 'index']);
    Route::post('/account/stories', [StoriesController::class, 'store']);
    Route::delete('/account/stories/{id}', [StoriesController::class, 'destroy']);

    // Reservas (Gestión)
    Route::get('/account/bookings', [BookingsController::class, 'index']);
    Route::get('/account/bookings/stats', [BookingsController::class, 'stats']);
    Route::put('/account/bookings/{id}/status', [BookingsController::class, 'updateStatus']);
    Route::put('/account/bookings/{id}', [BookingsController::class, 'update']);

    // Reseñas (Gestión)
    Route::get('/account/reviews', [ReviewsController::class, 'index']);
    Route::put('/account/reviews/{id}/featured', [ReviewsController::class, 'toggleFeatured']);
    Route::delete('/account/reviews/{id}', [ReviewsController::class, 'destroy']);

    // Analytics (Dashboard)
    Route::get('/account/analytics/overview', [AnalyticsController::class, 'overview']);
    Route::get('/account/analytics/visits', [AnalyticsController::class, 'visits']);

    // --- GESTIÓN DE PUBLICACIONES (APP MÓVIL) ---
    // Usamos PostsController (Plural) que tiene la lógica de gestión
    Route::get('/account/posts', [PostsController::class, 'index']);      // Ver mis posts
    Route::post('/account/posts', [PostsController::class, 'store']);     // Crear post
    Route::get('/account/posts/overview', [PostsController::class, 'overview']); // Resumen
    Route::get('/account/posts/{id}', [PostsController::class, 'show']);  // Ver detalle
    Route::put('/account/posts/{id}', [PostsController::class, 'update']); // Editar
    Route::delete('/account/posts/{id}', [PostsController::class, 'destroy']); // Eliminar
    Route::get('/account/posts/{id}/stats', [PostsController::class, 'stats']); // Estadísticas
    Route::post('/account/posts/{id}/toggle-publish', [PostsController::class, 'togglePublish']);

    // Gestión de comentarios (Moderación)
    Route::delete('/account/posts/comments/{comment}', [PostController::class, 'deleteComment']);
    Route::post('/account/posts/comments/{comment}/moderate', [PostController::class, 'moderateComment']);
});


/*
|--------------------------------------------------------------------------
| API Routes - Public (Dynamic / Wildcards)
|--------------------------------------------------------------------------
| Estas rutas van AL FINAL porque contienen comodines como {accountSlug}
| que podrían "tragarse" otras rutas si estuvieran más arriba.
*/

// Rutas públicas para stories (visualización)
Route::get('/profiles/{profile}/stories', [StoryController::class, 'index']);
Route::post('/stories/{story}/view', [StoryController::class, 'recordView']);

// Rutas públicas para posts (Feed de noticias para clientes)
Route::get('/{accountSlug}/posts', [PostController::class, 'index']);
Route::get('/posts/{post}', [PostController::class, 'show']);
Route::post('/posts/{post}/like', [PostController::class, 'toggleLike']);
Route::post('/posts/{post}/share', [PostController::class, 'share']);
Route::get('/posts/{post}/comments', [PostController::class, 'getComments']);
Route::post('/posts/{post}/comments', [PostController::class, 'addComment']);