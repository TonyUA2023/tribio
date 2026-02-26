<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\GetsCurrentAccount;
use App\Models\Account;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class BusinessSettingsController extends Controller
{
    use GetsCurrentAccount;
    /**
     * Mostrar la página de configuración del negocio
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $account = $this->getCurrentAccount($user);

        $paymentSettings = $account?->payment_settings ?? [];
        $culqiSettings = $paymentSettings['culqi'] ?? [];

        return Inertia::render('settings/business', [
            'paymentSettings' => [
                'culqi_enabled' => !empty($culqiSettings['enabled']),
                'culqi_public_key' => $culqiSettings['public_key'] ?? '',
                'culqi_secret_key' => $culqiSettings['secret_key'] ?? '',
            ],
        ]);
    }

    /**
     * Actualizar la configuración del negocio
     */
    public function update(Request $request)
    {
        $user = $request->user();
        $account = $this->getCurrentAccount($user);

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

    /**
     * Actualizar configuración de pasarela de pagos (Culqi)
     */
    public function updatePaymentSettings(Request $request)
    {
        $user = $request->user();
        $account = $this->getCurrentAccount($user);

        if (!$account) {
            return redirect()->route('dashboard')
                ->with('error', 'No se encontró una cuenta asociada');
        }

        $validated = $request->validate([
            'culqi_enabled' => ['required', 'boolean'],
            'culqi_public_key' => ['nullable', 'string', 'max:255'],
            'culqi_secret_key' => ['nullable', 'string', 'max:255'],
        ]);

        $paymentSettings = $account->payment_settings ?? [];

        $paymentSettings['culqi'] = [
            'enabled' => $validated['culqi_enabled'],
            'public_key' => $validated['culqi_public_key'] ?? '',
            'secret_key' => $validated['culqi_secret_key'] ?? '',
        ];

        $account->update(['payment_settings' => $paymentSettings]);

        return back()->with('success', 'Configuración de pagos actualizada exitosamente');
    }
}
