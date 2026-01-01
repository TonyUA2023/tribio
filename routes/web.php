<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\ProfileDisplayController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\AccountController;
use App\Http\Controllers\Admin\AccountCreateController;
use App\Http\Controllers\Client\DashboardController as ClientDashboardController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\AppointmentsController;
use App\Http\Controllers\ClientsController;
use App\Http\Controllers\PageSettingsController;
use App\Http\Controllers\BusinessSettingsController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\ReviewManagementController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// --- SEO: Sitemap y Robots.txt ---
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');
Route::get('/robots.txt', [SitemapController::class, 'robots'])->name('robots');

// --- Landing Page Principal ---
Route::get('/', function () {
    return Inertia::render('landing', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [ClientDashboardController::class, 'index'])
        ->name('dashboard');

    // Rutas de reservas para clientes autenticados
    Route::get('/api/bookings', [BookingController::class, 'index'])->name('api.bookings.index');
    Route::patch('/api/bookings/{booking}/status', [BookingController::class, 'updateStatus'])->name('api.bookings.update-status');

    // Módulo de Configuración
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/business', [BusinessSettingsController::class, 'index'])->name('business');
        Route::post('/business', [BusinessSettingsController::class, 'update'])->name('business.update');

        Route::get('/page', [PageSettingsController::class, 'index'])->name('page');
        Route::post('/page/upload-gallery', [PageSettingsController::class, 'uploadGalleryMedia'])->name('page.upload-gallery');
        Route::post('/page/upload-loading-screen', [PageSettingsController::class, 'uploadLoadingScreen'])->name('page.upload-loading-screen');
        Route::post('/page/upload-profile-logo', [PageSettingsController::class, 'uploadProfileLogo'])->name('page.upload-profile-logo');
        Route::post('/page/upload-cover-photo', [PageSettingsController::class, 'uploadCoverPhoto'])->name('page.upload-cover-photo');
        Route::delete('/page/media/{media}', [PageSettingsController::class, 'deleteMedia'])->name('page.delete-media');
        Route::post('/page/reorder-gallery', [PageSettingsController::class, 'reorderGallery'])->name('page.reorder-gallery');
    });

    // Módulo de Citas
    Route::get('/appointments', [AppointmentsController::class, 'index'])
        ->name('appointments');
    Route::patch('/appointments/{booking}/status', [AppointmentsController::class, 'updateStatus'])
        ->name('appointments.update-status');

    // Módulo de Clientes
    Route::get('/clients', [ClientsController::class, 'index'])
        ->name('clients');

    // Módulo de Reseñas
    Route::prefix('reviews')->name('reviews.')->group(function () {
        Route::get('/manage', [ReviewManagementController::class, 'index'])->name('manage');
        Route::patch('/{review}/toggle-featured', [ReviewManagementController::class, 'toggleFeatured'])->name('toggle-featured');
        Route::post('/update-order', [ReviewManagementController::class, 'updateOrder'])->name('update-order');
        Route::delete('/{review}', [ReviewManagementController::class, 'destroy'])->name('destroy');
        Route::patch('/{review}/approve', [ReviewManagementController::class, 'approve'])->name('approve');
        Route::patch('/{review}/reject', [ReviewManagementController::class, 'reject'])->name('reject');
    });
});

require __DIR__.'/settings.php';

// --- RUTAS DEL SUPER ADMIN (JSTACK) ---
// *** MOVIMOS ESTO AQUÍ (ANTES DEL COMODÍN) ***
Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('admin.dashboard');

    // Gestión de Cuentas/Clientes
    Route::get('/accounts/create', AccountCreateController::class)
        ->name('admin.accounts.create');
    Route::get('/accounts/form-data', [AccountController::class, 'getFormData'])
        ->name('admin.accounts.form-data');
    Route::post('/accounts/generate-slug', [AccountController::class, 'generateSlug'])
        ->name('admin.accounts.generate-slug');
    Route::post('/accounts', [AccountController::class, 'store'])
        ->name('admin.accounts.store');
    Route::put('/accounts/{account}', [AccountController::class, 'update'])
        ->name('admin.accounts.update');
    Route::delete('/accounts/{account}', [AccountController::class, 'destroy'])
        ->name('admin.accounts.destroy');
});


// --- RUTAS PÚBLICAS DE PERFILES (COMODÍN) ---
// *** ESTAS RUTAS AHORA VAN AL FINAL ***

// Ruta para mostrar cuenta/perfil por defecto (sin slug de perfil)
Route::get('/{account_slug}', [ProfileDisplayController::class, 'showDefault'])
    ->name('profile.default');

// Ruta para mostrar perfil específico
Route::get('/{account_slug}/{profile_slug}', [ProfileDisplayController::class, 'show'])
    ->name('profile.show');

