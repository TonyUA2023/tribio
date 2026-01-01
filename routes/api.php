<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\CronController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rutas públicas para reservas (sin autenticación)
Route::post('/bookings', [BookingController::class, 'store']);
Route::get('/bookings/occupied-slots', [BookingController::class, 'getOccupiedSlots']);

// Rutas públicas para reseñas (sin autenticación)
Route::post('/reviews', [ReviewController::class, 'store']);
Route::get('/reviews', [ReviewController::class, 'index']);

// Ruta para cron jobs externos
Route::get('/cron/send-emails', [CronController::class, 'sendEmails']);
