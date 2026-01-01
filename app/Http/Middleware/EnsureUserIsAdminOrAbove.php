<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdminOrAbove
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Verificar que el usuario esté autenticado y sea admin o super_admin
        if (!$request->user() || !in_array($request->user()->role, ['admin', 'super_admin'])) {
            abort(403, 'Acceso denegado. Solo administradores pueden acceder.');
        }

        return $next($request);
    }
}
