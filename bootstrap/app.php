<?php

use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\EnsureUserIsSuperAdmin;
use App\Http\Middleware\EnsureUserIsAdminOrAbove;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            Route::prefix('api/customer')
                ->middleware('api')
                ->group(base_path('routes/customer.php'));
        }
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Alias de middleware para control de acceso por roles
        $middleware->alias([
            'super_admin' => EnsureUserIsSuperAdmin::class,
            'admin_or_above' => EnsureUserIsAdminOrAbove::class,
            'admin' => EnsureUserIsAdmin::class, // Mantener compatibilidad (ahora apunta a super_admin)
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Renderizar custom exceptions
        $exceptions->renderable(function (\App\Exceptions\Custom\AccountNotFoundException $e) {
            return $e->render();
        });

        $exceptions->renderable(function (\App\Exceptions\Custom\ProfileNotFoundException $e) {
            return $e->render();
        });

        $exceptions->renderable(function (\App\Exceptions\Custom\BookingConflictException $e) {
            return $e->render();
        });

        $exceptions->renderable(function (\App\Exceptions\Custom\UnauthorizedException $e) {
            return $e->render();
        });

        $exceptions->renderable(function (\App\Exceptions\Custom\ValidationException $e) {
            return $e->render();
        });

        $exceptions->renderable(function (\App\Exceptions\Custom\MediaUploadException $e) {
            return $e->render();
        });

        $exceptions->renderable(function (\App\Exceptions\Custom\EmailSendException $e) {
            return $e->render();
        });

        // Reportar errores críticos (opcional: integración con Sentry)
        $exceptions->reportable(function (\Throwable $e) {
            // Aquí puedes integrar con servicios como Sentry, Bugsnag, etc.
            // Sentry::captureException($e);
        });
    })->create();