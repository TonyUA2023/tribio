<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class BusinessSettingsController extends Controller
{
    /**
     * Mostrar la página de configuración del negocio
     */
    public function index(Request $request)
    {
        return Inertia::render('settings/business');
    }

    /**
     * Actualizar la configuración del negocio
     */
    public function update(Request $request)
    {
        $user = $request->user();
        $account = $user->account()->first();

        if (!$account) {
            return redirect()->route('dashboard')
                ->with('error', 'No se encontró una cuenta asociada');
        }

        $profile = Profile::where('account_id', $account->id)->first();

        if (!$profile) {
            return redirect()->route('dashboard')
                ->with('error', 'No se encontró un perfil asociado');
        }

        $validated = $request->validate([
            'business_name' => ['required', 'string', 'max:255'],
            'business_title' => ['nullable', 'string', 'max:255'],
            'business_slug' => [
                'required',
                'string',
                'max:100',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('accounts', 'slug')->ignore($account->id),
            ],
            'notification_email' => ['nullable', 'email', 'max:255'],
        ]);

        // Actualizar Account
        $account->update([
            'name' => $validated['business_name'],
            'slug' => $validated['business_slug'],
        ]);

        // Actualizar Profile
        $profile->update([
            'name' => $validated['business_name'],
            'title' => $validated['business_title'],
            'notification_email' => $validated['notification_email'],
        ]);

        return back()->with('success', 'Configuración actualizada exitosamente');
    }
}
