<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckOnboardingStatus
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if ($user && $user->role === 'client' && $user->account) {
            $isOnboardingComplete = !is_null($user->account->business_category_id);
            $isOnboardingRoute = $request->routeIs('onboarding.*');

            // Si el onboarding no está completo y no está en una ruta de onboarding, redirigir.
            if (!$isOnboardingComplete && !$isOnboardingRoute) {
                return redirect()->route('onboarding.show');
            }

            // Si el onboarding ya está completo y trata de acceder a las rutas de onboarding, redirigir al dashboard.
            if ($isOnboardingComplete && $isOnboardingRoute) {
                return redirect()->route('dashboard');
            }
        }

        return $next($request);
    }
}