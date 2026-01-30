<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountSelectorController extends Controller
{
    /**
     * Mostrar la página de selección de cuentas
     */
    public function show(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        $accounts = $user->accounts()->get()->map(function ($account) {
            $profile = $account->profiles()->first();
            $profileData = $profile?->data ?? [];
            $logo = $profileData['profile_logo'] ?? $profileData['logo'] ?? $account->logo_url ?? null;

            // Obtener información de suscripción
            $subscription = $account->subscription;

            return [
                'id' => $account->id,
                'name' => $account->name,
                'slug' => $account->slug,
                'logo' => $logo,
                'plan_type' => $subscription?->plan_type ?? 'personal',
                'subscription_status' => $subscription?->status ?? 'active',
            ];
        });

        // Si solo tiene una cuenta, redirigir directamente al dashboard
        if ($accounts->count() === 1) {
            session(['current_account_id' => $accounts->first()['id']]);
            return redirect()->route('dashboard');
        }

        return Inertia::render('auth/SelectAccount', [
            'userAccounts' => $accounts->toArray(),
        ]);
    }

    /**
     * Guardar la cuenta seleccionada en sesión
     */
    public function select(Request $request)
    {
        $request->validate([
            'account_id' => 'required|integer',
        ]);

        $user = $request->user();

        // Verificar que la cuenta pertenece al usuario
        $account = $user->accounts()->where('id', $request->account_id)->first();

        if (!$account) {
            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return response()->json(['error' => 'No tienes acceso a esta cuenta'], 403);
            }
            return back()->withErrors(['account_id' => 'No tienes acceso a esta cuenta']);
        }

        // Guardar en sesión y persistir inmediatamente
        session(['current_account_id' => $account->id]);
        session()->save();

        // Si es una petición Inertia, forzar la recarga completa de la página
        if ($request->header('X-Inertia')) {
            return Inertia::location(route('dashboard'));
        }

        return redirect()->route('dashboard');
    }
}
