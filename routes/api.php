<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CronController;
use App\Http\Controllers\Api\StoryController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AccountProfileController;
// GalleryController eliminado - ahora usamos publicaciones e historias
use App\Http\Controllers\Api\StoriesController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\BookingsController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ReviewsController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\PostsController;
use App\Http\Controllers\Api\TemplateController;
use App\Http\Controllers\Api\TemplateConfigController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\WhatsAppWebhookController;
use App\Http\Controllers\Api\BusinessDirectoryController;
use App\Http\Controllers\Api\CulqiController;

/*
|--------------------------------------------------------------------------
| API Routes - Public (Static)
|--------------------------------------------------------------------------
*/

// Directorio de Negocios (Público)
Route::get('/directory/businesses', [BusinessDirectoryController::class, 'index']);
Route::get('/directory/categories', [BusinessDirectoryController::class, 'categories']);
Route::get('/directory/stats', [BusinessDirectoryController::class, 'stats']);
Route::get('/directory/check-slug', [BusinessDirectoryController::class, 'checkSlug']);

// Cron jobs
Route::get('/cron/send-emails', [CronController::class, 'sendEmails']);

/*
|--------------------------------------------------------------------------
| WhatsApp Business API Webhook
|--------------------------------------------------------------------------
| Endpoint para recibir webhooks de Meta (WhatsApp Business API)
| GET  - Verificación del webhook (Meta envía hub.verify_token)
| POST - Recepción de mensajes y estados
|
| URL para configurar en Meta: https://tu-dominio.com/api/whatsapp/webhook
*/
Route::get('/whatsapp/webhook', [WhatsAppWebhookController::class, 'verify']);
Route::post('/whatsapp/webhook', [WhatsAppWebhookController::class, 'handle']);

// Auth (Business Owners)
Route::post('/auth/login', [AuthController::class, 'login']);

// Plantillas públicas (Catálogo)
Route::get('/templates', [TemplateController::class, 'index']);
Route::get('/templates/{id}', [TemplateController::class, 'show']);

/*
|--------------------------------------------------------------------------
| Culqi Payment Gateway - Pasarela de Pagos
|--------------------------------------------------------------------------
| Endpoints públicos para procesamiento de pagos con Culqi
*/
Route::prefix('payments')->group(function () {
    // Obtener llave pública para el frontend
    Route::get('/culqi-key', [CulqiController::class, 'getPublicKey']);
    // Obtener planes disponibles
    Route::get('/plans', [CulqiController::class, 'getPlans']);
    // Procesar registro con pago (nuevo usuario)
    Route::post('/register', [CulqiController::class, 'processRegistration']);
    // Agregar nuevo negocio a usuario existente (soporta ambas auth: sanctum para API y web para sesión)
    Route::post('/add-business', [CulqiController::class, 'addBusiness'])->middleware(['web', 'auth']);
    // Webhook de Culqi (para notificaciones de eventos)
    Route::post('/webhook', [CulqiController::class, 'handleWebhook']);
});


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

    // =========================================================
    // PAGOS Y SUSCRIPCIONES (Culqi)
    // =========================================================
    Route::prefix('account/billing')->group(function () {
        // Suscripción actual
        Route::get('/subscription', [CulqiController::class, 'getSubscription']);
        // Historial de pagos
        Route::get('/payments', [CulqiController::class, 'getPaymentHistory']);
        // Realizar un pago (upgrade de plan)
        Route::post('/upgrade', [CulqiController::class, 'upgradePlan']);
        // Procesar pago único
        Route::post('/charge', [CulqiController::class, 'processPayment']);
    });

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
    // GESTIÓN DE PRODUCTOS Y PEDIDOS (CAFETERÍA)
    // =========================================================

    // Productos (Carta Digital)
    // Listar y Crear
    Route::get('/accounts/{accountId}/products', [ProductController::class, 'index']);
    Route::post('/accounts/{accountId}/products', [ProductController::class, 'store']);
    
    // Acciones sobre producto individual
    // 'match' permite PUT normal o POST con _method:PUT (para imágenes)
    Route::match(['put', 'post'], '/products/{id}', [ProductController::class, 'update']);
    
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

// Public Booking API (for customers)
Route::post('/bookings', [BookingController::class, 'store']);
Route::get('/bookings', [BookingController::class, 'index']);
Route::put('/bookings/{booking}/status', [BookingController::class, 'updateStatus']);
Route::get('/bookings/occupied-slots', [BookingController::class, 'getOccupiedSlots']);

// Public Review API (for customers)
Route::post('/reviews', [ReviewController::class, 'store']);
Route::get('/reviews', [ReviewController::class, 'index']);

// Template Configuration API (Public - for mobile app)
Route::get('/{accountSlug}/template-config', [TemplateConfigController::class, 'show']);
Route::put('/{accountSlug}/template-config', [TemplateConfigController::class, 'update']);
Route::delete('/{accountSlug}/template-config', [TemplateConfigController::class, 'reset']);