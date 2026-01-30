<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Illuminate\Http\Request;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     *
     * @param  Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function toResponse($request)
    {
        $user = $request->user();

        // Contar cuántas cuentas/negocios tiene el usuario
        $accountsCount = $user->accounts()->count();

        // Si tiene más de una cuenta, redirigir a la selección de cuenta
        if ($accountsCount > 1) {
            return redirect()->intended(route('select-account'));
        }

        // Si tiene exactamente una cuenta, guardar en sesión y redirigir al dashboard
        if ($accountsCount === 1) {
            $account = $user->accounts()->first();
            session(['current_account_id' => $account->id]);
        }

        // Si es una solicitud JSON (API), retornar JSON
        if ($request->wantsJson()) {
            return response()->json([
                'two_factor' => false,
                'redirect' => route('dashboard'),
            ]);
        }

        // Redirigir al dashboard
        return redirect()->intended(route('dashboard'));
    }
}
