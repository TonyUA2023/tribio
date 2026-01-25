<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\CustomerBookingController;
use App\Http\Controllers\Api\CustomerOrderController;
use App\Http\Controllers\Api\CustomerProfileController;

/*
|--------------------------------------------------------------------------
| Customer API Routes
|--------------------------------------------------------------------------
|
| Rutas dedicadas para la aplicación móvil de clientes (público general).
| Incluye tanto rutas públicas (guests) como protegidas (autenticados).
|
*/

/*
|--------------------------------------------------------------------------
| RUTAS PÚBLICAS - Sin autenticación requerida
|--------------------------------------------------------------------------
*/

// Google OAuth
Route::get('/auth/google', [GoogleAuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'handleGoogleCallback']);

// Reservas (Guests pueden crear reservas)
Route::post('/bookings', [BookingController::class, 'store']);
Route::get('/bookings/occupied-slots', [BookingController::class, 'getOccupiedSlots']);

// Reseñas (Guests pueden crear y ver reseñas)
Route::post('/reviews', [ReviewController::class, 'store']);
Route::get('/reviews', [ReviewController::class, 'index']);

// Pedidos públicos (si en el futuro se permite hacer pedidos sin cuenta)
// Route::post('/orders', [OrderController::class, 'storePublic']);

/*
|--------------------------------------------------------------------------
| RUTAS PROTEGIDAS - Requieren autenticación (auth:sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // =========================================================
    // AUTENTICACIÓN
    // =========================================================

    Route::post('/auth/google/logout', [GoogleAuthController::class, 'logout']);

    // =========================================================
    // PERFIL DEL CLIENTE
    // =========================================================

    // Información general
    Route::get('/me', [CustomerController::class, 'me']);
    Route::get('/stats/{accountId}', [CustomerController::class, 'stats']);
    Route::get('/businesses', [CustomerController::class, 'getBusinesses']);

    // Preferencias
    Route::put('/preferences', [CustomerController::class, 'updatePreferences']);

    // Gestión de cuenta
    Route::get('/profile', [CustomerProfileController::class, 'show']);
    Route::put('/profile', [CustomerProfileController::class, 'update']);
    Route::post('/profile/avatar', [CustomerProfileController::class, 'updateAvatar']);
    Route::put('/profile/password', [CustomerProfileController::class, 'updatePassword']);
    Route::delete('/profile', [CustomerProfileController::class, 'destroy']);
    Route::post('/profile/verify-email', [CustomerProfileController::class, 'verifyEmail']);
    Route::post('/profile/resend-verification', [CustomerProfileController::class, 'resendVerification']);

    // =========================================================
    // DIRECCIONES
    // =========================================================

    Route::post('/addresses', [CustomerController::class, 'addAddress']);
    Route::get('/addresses/{accountId}', [CustomerController::class, 'getAddresses']);

    // =========================================================
    // RESERVAS (BOOKINGS)
    // =========================================================

    Route::prefix('bookings')->group(function () {
        Route::get('/', [CustomerBookingController::class, 'index']);
        Route::get('/upcoming', [CustomerBookingController::class, 'upcoming']);
        Route::get('/history', [CustomerBookingController::class, 'history']);
        Route::get('/{id}', [CustomerBookingController::class, 'show']);
        Route::post('/', [CustomerBookingController::class, 'store']);
        Route::post('/{id}/cancel', [CustomerBookingController::class, 'cancel']);
    });

    // =========================================================
    // PEDIDOS (ORDERS)
    // =========================================================

    Route::prefix('orders')->group(function () {
        Route::get('/', [CustomerOrderController::class, 'index']);
        Route::get('/active', [CustomerOrderController::class, 'active']);
        Route::get('/history', [CustomerOrderController::class, 'history']);
        Route::get('/{id}', [CustomerOrderController::class, 'show']);
        Route::post('/', [CustomerOrderController::class, 'store']);
        Route::post('/{id}/cancel', [CustomerOrderController::class, 'cancel']);
        Route::post('/{id}/reorder', [CustomerOrderController::class, 'reorder']);
    });
});
