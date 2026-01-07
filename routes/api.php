<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

// Controladores existentes
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
use App\Http\Controllers\Api\PostController; 
use App\Http\Controllers\Api\PostsController; 
use App\Http\Controllers\Api\TemplateController;

// NUEVO: Controlador de Pedidos (Asegúrate de que el namespace coincida con la ubicación de tu archivo)
use App\Http\Controllers\OrderController; 

/*
|--------------------------------------------------------------------------
| API Routes - Public (Static)
|--------------------------------------------------------------------------
*/

// Rutas públicas para reservas
Route::post('/bookings', [BookingController::class, 'store']);
Route::get('/bookings/occupied-slots', [BookingController::class, 'getOccupiedSlots']);

// Rutas públicas para reseñas
Route::post('/reviews', [ReviewController::class, 'store']);
Route::get('/reviews', [ReviewController::class, 'index']);

// Cron jobs
Route::get('/cron/send-emails', [CronController::class, 'sendEmails']);

// Auth
Route::post('/auth/login', [AuthController::class, 'login']);

// Plantillas públicas (Catálogo)
Route::get('/templates', [TemplateController::class, 'index']);
Route::get('/templates/{id}', [TemplateController::class, 'show']);


/*
|--------------------------------------------------------------------------
| API Routes - Mobile App (Owner/Admin) - PROTEGIDAS
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    
    // Auth & Sesión
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Perfil
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

    // Stories
    Route::get('/account/stories', [StoriesController::class, 'index']);
    Route::post('/account/stories', [StoriesController::class, 'store']);
    Route::delete('/account/stories/{id}', [StoriesController::class, 'destroy']);

    // Reservas (Para Barberías/Spas)
    Route::get('/account/bookings', [BookingsController::class, 'index']);
    Route::get('/account/bookings/stats', [BookingsController::class, 'stats']);
    Route::put('/account/bookings/{id}/status', [BookingsController::class, 'updateStatus']);
    Route::put('/account/bookings/{id}', [BookingsController::class, 'update']);

    // ----------------------------------------------------------------------
    // NUEVO: GESTIÓN DE PEDIDOS (Para Restaurantes/Tiendas)
    // ----------------------------------------------------------------------
    Route::get('/account/orders', [OrderController::class, 'index']);         // Listar pedidos
    Route::get('/account/orders/{order}', [OrderController::class, 'show']);  // Ver detalle
    Route::put('/account/orders/{order}/status', [OrderController::class, 'updateStatus']); // Cambiar estado
    Route::put('/account/orders/{order}/notes', [OrderController::class, 'updateNotes']);   // Notas internas
    Route::delete('/account/orders/{order}', [OrderController::class, 'destroy']);          // Eliminar

    // Reseñas
    Route::get('/account/reviews', [ReviewsController::class, 'index']);
    Route::put('/account/reviews/{id}/featured', [ReviewsController::class, 'toggleFeatured']);
    Route::delete('/account/reviews/{id}', [ReviewsController::class, 'destroy']);

    // Analytics
    Route::get('/account/analytics/overview', [AnalyticsController::class, 'overview']);
    Route::get('/account/analytics/visits', [AnalyticsController::class, 'visits']);
    // NUEVO: Analytics específico para Influencers
    Route::get('/account/analytics/engagement', [AnalyticsController::class, 'engagement']); 

    // Posts (Gestión)
    Route::get('/account/posts', [PostsController::class, 'index']);      
    Route::post('/account/posts', [PostsController::class, 'store']);     
    Route::get('/account/posts/overview', [PostsController::class, 'overview']);
    Route::get('/account/posts/{id}', [PostsController::class, 'show']);  
    Route::put('/account/posts/{id}', [PostsController::class, 'update']); 
    Route::delete('/account/posts/{id}', [PostsController::class, 'destroy']); 
    Route::get('/account/posts/{id}/stats', [PostsController::class, 'stats']); 
    Route::post('/account/posts/{id}/toggle-publish', [PostsController::class, 'togglePublish']);

    // Comentarios
    Route::delete('/account/posts/comments/{comment}', [PostController::class, 'deleteComment']);
    Route::post('/account/posts/comments/{comment}/moderate', [PostController::class, 'moderateComment']);

    // --- GESTIÓN DE PLANTILLAS ---
    Route::get('/account/template/current', [TemplateController::class, 'getCurrentTemplate']);
    Route::post('/account/template', [TemplateController::class, 'applyTemplate']);
    Route::put('/account/template/customizations', [TemplateController::class, 'updateCustomizations']);
    
    // --- DESARROLLO DE PLANTILLAS (Admin/Developer) ---
    Route::post('/templates/create', [TemplateController::class, 'create']);
    Route::put('/templates/{id}', [TemplateController::class, 'update']);
    Route::delete('/templates/{id}', [TemplateController::class, 'destroy']);
    Route::get('/templates/preview/{slug}', [TemplateController::class, 'preview']);
});


/*
|--------------------------------------------------------------------------
| API Routes - Public (Dynamic)
|--------------------------------------------------------------------------
*/

Route::get('/profiles/{profile}/stories', [StoryController::class, 'index']);
Route::post('/stories/{story}/view', [StoryController::class, 'recordView']);

Route::get('/{accountSlug}/posts', [PostController::class, 'index']);
Route::get('/posts/{post}', [PostController::class, 'show']);
Route::post('/posts/{post}/like', [PostController::class, 'toggleLike']);
Route::post('/posts/{post}/share', [PostController::class, 'share']);
Route::get('/posts/{post}/comments', [PostController::class, 'getComments']);
Route::post('/posts/{post}/comments', [PostController::class, 'addComment']);