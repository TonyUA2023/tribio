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

        if ($user && $user->role === 'client') {
            // Obtener la cuenta actual desde la sesión (multi-negocio)
            $account = $this->getCurrentAccount($user);

            if ($account) {
                // Verificar onboarding de categoría
                $hasCategoryComplete = !is_null($account->business_category_id);
                $isCategoryOnboardingRoute = $request->routeIs('onboarding.*');

                // Verificar onboarding de tipo de negocio
                $hasBusinessType = !is_null($account->business_type_id);
                $isBusinessTypeRoute = $request->routeIs('business-type.*');

                // Si no tiene categoría, ir al onboarding de categoría primero
                if (!$hasCategoryComplete && !$isCategoryOnboardingRoute) {
                    return redirect()->route('onboarding.show');
                }

                // Si ya tiene categoría y trata de acceder al onboarding de categoría, redirigir
                if ($hasCategoryComplete && $isCategoryOnboardingRoute) {
                    // Si no tiene tipo de negocio, ir a seleccionar tipo
                    if (!$hasBusinessType) {
                        return redirect()->route('business-type.select');
                    }
                    return redirect()->route('dashboard');
                }

                // Si tiene categoría pero no tiene tipo de negocio
                if ($hasCategoryComplete && !$hasBusinessType && !$isBusinessTypeRoute) {
                    return redirect()->route('business-type.select');
                }

                // Si ya tiene tipo de negocio y trata de acceder a la selección de tipo
                if ($hasBusinessType && $isBusinessTypeRoute) {
                    return redirect()->route('dashboard');
                }
            }
        }

        return $next($request);
    }

    /**
     * Obtiene la cuenta actual del usuario desde la sesión
     */
    private function getCurrentAccount($user)
    {
        $currentAccountId = session('current_account_id');

        if ($currentAccountId) {
            $account = $user->accounts()->where('id', $currentAccountId)->first();
            if ($account) {
                return $account;
            }
        }

        // Si no hay cuenta en sesión, usar la primera
        $account = $user->accounts()->first();
        if ($account) {
            session(['current_account_id' => $account->id]);
        }

        return $account;
    }
}