<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Actualizado para usar el nuevo sistema de roles
        // Este middleware ahora verifica que sea super_admin
        if (!Auth::check() || !Auth::user()->isSuperAdmin()) {
            // Si no está logueado o no es super admin, lo redirigimos
            return redirect(route('home'));
        }

        return $next($request);
    }
}