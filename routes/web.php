<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\ProfileDisplayController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\AccountController;
use App\Http\Controllers\Admin\AccountCreateController;
use App\Http\Controllers\Admin\TemplateController;
use App\Http\Controllers\Client\DashboardController as ClientDashboardController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\AppointmentsController;
use App\Http\Controllers\ClientsController;
use App\Http\Controllers\PageSettingsController;
use App\Http\Controllers\BusinessSettingsController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\ReviewManagementController;
use App\Http\Controllers\Api\StoryController;
// 👇 NUEVO CONTROLADOR PARA PEDIDOS PÚBLICOS
use App\Http\Controllers\PublicCheckoutController;
// 👇 NUEVO CONTROLADOR PARA ONBOARDING
use App\Http\Controllers\OnboardingController;
// 👇 CONTROLADOR PARA SELECCIÓN DE CUENTAS (MULTI-NEGOCIO)
use App\Http\Controllers\AccountSelectorController;

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
    return Inertia::render('web/landing', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// --- Directorio de Negocios ---
Route::get('/directorio', function () {
    return Inertia::render('web/Directory');
})->name('directory');

// --- Página de Precios ---
Route::get('/precios', function () {
    return Inertia::render('web/pricing');
})->name('pricing');

// --- Página de Checkout/Registro ---
Route::get('/registro', function () {
    return Inertia::render('web/Checkout', [
        'slug' => request()->query('slug', ''),
        'plan' => request()->query('plan', 'pro'),
    ]);
})->name('checkout');

// --- Páginas Legales ---
Route::get('/terminos', function () {
    return Inertia::render('web/TermsAndConditions');
})->name('terms');

Route::get('/privacidad', function () {
    return Inertia::render('web/PrivacyPolicy');
})->name('privacy');

// --- RUTAS PROTEGIDAS (PANEL DE CLIENTE/DUEÑO) ---
Route::middleware(['auth', 'verified'])->group(function () {
    // Rutas para selección de cuenta (multi-negocio)
    Route::get('/select-account', [AccountSelectorController::class, 'show'])->name('select-account');
    Route::post('/auth/select-account', [AccountSelectorController::class, 'select'])->name('auth.select-account');

    // Rutas para el proceso de Onboarding.
    // Estas deben estar fuera del middleware 'onboarding.check'.
    Route::prefix('onboarding')->name('onboarding.')->group(function () {
        Route::get('/', [OnboardingController::class, 'show'])->name('show');
        Route::post('/', [OnboardingController::class, 'store'])->name('store');
    });

    // Grupo de rutas que requieren que el onboarding esté completo.
    Route::middleware(['onboarding.check'])->group(function () {
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

        // Módulo de Historias (Stories)
        Route::prefix('stories')->name('stories.')->group(function () {
            Route::get('/', function () {
                return Inertia::render('stories/index');
            })->name('index');

            Route::get('/create', function () {
                $user = auth()->user();
                $profile = $user->account?->profiles->first();

                return Inertia::render('stories/create', [
                    'profile' => $profile,
                ]);
            })->name('create');
        });

        // API de Stories (autenticadas con sesión web)
        Route::prefix('api')->group(function () {
            Route::get('/my-stories', [StoryController::class, 'myStories']);
            Route::post('/stories', [StoryController::class, 'store']);
            Route::delete('/stories/{story}', [StoryController::class, 'destroy']);
            Route::get('/stories/{story}/analytics', [StoryController::class, 'analytics']);
        });

        // Módulo de Productos (Gestión Admin)
        Route::prefix('products')->name('products.')->group(function () {
            Route::get('/', [\App\Http\Controllers\ProductController::class, 'index'])->name('index');
            Route::post('/', [\App\Http\Controllers\ProductController::class, 'store'])->name('store');
            Route::put('/{product}', [\App\Http\Controllers\ProductController::class, 'update'])->name('update');
            Route::delete('/{product}', [\App\Http\Controllers\ProductController::class, 'destroy'])->name('destroy');
            Route::patch('/{product}/toggle-availability', [\App\Http\Controllers\ProductController::class, 'toggleAvailability'])->name('toggle-availability');
            Route::patch('/{product}/toggle-featured', [\App\Http\Controllers\ProductController::class, 'toggleFeatured'])->name('toggle-featured');
            Route::post('/update-order', [\App\Http\Controllers\ProductController::class, 'updateOrder'])->name('update-order');
        });

        // Módulo de Pedidos (Gestión Admin)
        Route::prefix('orders')->name('orders.')->group(function () {
            Route::get('/', [\App\Http\Controllers\OrderController::class, 'index'])->name('index');
            Route::get('/{order}', [\App\Http\Controllers\OrderController::class, 'show'])->name('show');
            Route::patch('/{order}/status', [\App\Http\Controllers\OrderController::class, 'updateStatus'])->name('update-status');
            Route::patch('/{order}/payment-status', [\App\Http\Controllers\OrderController::class, 'updatePaymentStatus'])->name('update-payment-status');
            Route::patch('/{order}/notes', [\App\Http\Controllers\OrderController::class, 'updateNotes'])->name('update-notes');
            Route::delete('/{order}', [\App\Http\Controllers\OrderController::class, 'destroy'])->name('destroy');
            Route::get('/stats/dashboard', [\App\Http\Controllers\OrderController::class, 'stats'])->name('stats');
        });
    });
});

require __DIR__.'/settings.php';

// --- RUTAS DEL SUPER ADMIN (JSTACK) ---
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

    // Gestión de Plantillas
    Route::get('/templates', [TemplateController::class, 'index'])
        ->name('admin.templates.index');
    Route::get('/templates/create', [TemplateController::class, 'create'])
        ->name('admin.templates.create');
    Route::post('/templates', [TemplateController::class, 'store'])
        ->name('admin.templates.store');
    Route::get('/templates/{template}/edit', [TemplateController::class, 'edit'])
        ->name('admin.templates.edit');
    Route::put('/templates/{template}', [TemplateController::class, 'update'])
        ->name('admin.templates.update');
    Route::delete('/templates/{template}', [TemplateController::class, 'destroy'])
        ->name('admin.templates.destroy');
    Route::post('/templates/generate-slug', [TemplateController::class, 'generateSlug'])
        ->name('admin.templates.generate-slug');
    Route::post('/templates/{template}/upload-preview', [TemplateController::class, 'uploadPreview'])
        ->name('admin.templates.upload-preview');
    Route::delete('/templates/{template}/remove-preview', [TemplateController::class, 'removePreview'])
        ->name('admin.templates.remove-preview');
});


// =========================================================================
// RUTAS PÚBLICAS Y DE PERFILES (COMODÍN - ESTAS VAN AL FINAL)
// =========================================================================

// 🔥 NUEVO: Ruta pública para guardar pedidos (Checkout Web)
// Debe ir ANTES de los comodines genéricos /{account_slug}
Route::post('/{account_slug}/checkout', [PublicCheckoutController::class, 'store'])
    ->name('public.checkout');

// Ruta para feed de posts estilo TikTok
Route::get('/{account_slug}/posts', function ($accountSlug) {
    // Buscar la cuenta
    $account = \App\Models\Account::where('slug', $accountSlug)->firstOrFail();

    // Obtener el primer perfil de la cuenta
    $profile = $account->profiles()->first();

    if (!$profile) {
        abort(404, 'No se encontró un perfil para esta cuenta');
    }

    // Obtener datos del perfil (están en el campo JSON 'data')
    $profileData = $profile->data ?? [];

    return Inertia::render('Posts/Feed', [
        'accountSlug' => $accountSlug,
        'accentColor' => $profileData['accent_color'] ?? '#f59e0b',
        'profileId' => $profile->id,
        'businessName' => $account->name,
        'services' => $profileData['services'] ?? [],
        'socialLinks' => [
            'instagram' => $profileData['instagram'] ?? null,
            'facebook' => $profileData['facebook'] ?? null,
            'tiktok' => $profileData['tiktok'] ?? null,
            'whatsapp' => $profileData['whatsapp'] ?? null,
        ],
    ]);
})->name('posts.feed');

// Ruta para mostrar cuenta/perfil por defecto (sin slug de perfil)
Route::get('/{account_slug}', [ProfileDisplayController::class, 'showDefault'])
    ->name('profile.default');

// Ruta para mostrar perfil específico
Route::get('/{account_slug}/{profile_slug}', [ProfileDisplayController::class, 'show'])
    ->name('profile.show');