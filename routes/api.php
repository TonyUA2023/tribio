<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
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
// Nuevos controladores para la lógica de Cafetería/Pedidos
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;

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

    // Reservas (Gestión)
    Route::get('/account/bookings', [BookingsController::class, 'index']);
    Route::get('/account/bookings/stats', [BookingsController::class, 'stats']);
    Route::put('/account/bookings/{id}/status', [BookingsController::class, 'updateStatus']);
    Route::put('/account/bookings/{id}', [BookingsController::class, 'update']);

    // Reseñas (Gestión)
    Route::get('/account/reviews', [ReviewsController::class, 'index']);
    Route::put('/account/reviews/{id}/featured', [ReviewsController::class, 'toggleFeatured']);
    Route::delete('/account/reviews/{id}', [ReviewsController::class, 'destroy']);

    // Analytics
    Route::get('/account/analytics/overview', [AnalyticsController::class, 'overview']);
    Route::get('/account/analytics/visits', [AnalyticsController::class, 'visits']);

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

    // =========================================================
    // NUEVAS RUTAS: GESTIÓN DE PRODUCTOS Y PEDIDOS (CAFETERÍA)
    // =========================================================

    // Productos (Carta Digital)
    Route::get('/accounts/{accountId}/products', [ProductController::class, 'index']);
    Route::post('/accounts/{accountId}/products', [ProductController::class, 'store']);
    // Usamos POST para update para manejar mejor multipart/form-data en algunos entornos
    Route::post('/products/{id}', [ProductController::class, 'update']); 
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    Route::post('/products/{id}/toggle-availability', [ProductController::class, 'toggleAvailability']);

    // Pedidos (Gestión de órdenes)
    Route::get('/accounts/{accountId}/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);

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