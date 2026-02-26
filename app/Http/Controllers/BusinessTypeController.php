<?php

namespace App\Http\Controllers;

use App\Models\BusinessType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BusinessTypeController extends Controller
{
    /**
     * Muestra la página de selección de tipo de negocio
     */
    public function select()
    {
        $businessTypes = BusinessType::active()
            ->orderBy('sort_order')
            ->get()
            ->map(function ($type) {
                return [
                    'id' => $type->id,
                    'slug' => $type->slug,
                    'name' => $type->name,
                    'description' => $type->description,
                    'icon' => $type->icon,
                    'color' => $type->color,
                    'features' => $type->features ?? [],
                    'coming_soon' => $type->coming_soon,
                ];
            });

        $account = $this->getCurrentAccount();

        return Inertia::render('BusinessType/Select', [
            'businessTypes' => $businessTypes,
            'account' => $account ? [
                'id' => $account->id,
                'name' => $account->name,
                'slug' => $account->slug,
            ] : null,
        ]);
    }

    /**
     * Guarda el tipo de negocio seleccionado
     */
    public function store(Request $request)
    {
        $request->validate([
            'business_type_id' => 'required|exists:business_types,id',
        ]);

        $businessType = BusinessType::findOrFail($request->business_type_id);

        // Verificar que no sea "coming_soon"
        if ($businessType->coming_soon) {
            return back()->withErrors(['business_type_id' => 'Este tipo de negocio aún no está disponible.']);
        }

        $account = $this->getCurrentAccount();

        if (!$account) {
            return redirect()->route('login');
        }

        // Actualizar el tipo de negocio
        $account->update([
            'business_type_id' => $businessType->id,
        ]);

        // Activar los módulos por defecto del tipo
        if ($businessType->default_modules) {
            foreach ($businessType->default_modules as $moduleSlug) {
                $account->modules()->updateOrCreate(
                    ['module_slug' => $moduleSlug],
                    [
                        'is_active' => true,
                        'config' => $businessType->default_config[$moduleSlug] ?? null,
                    ]
                );
            }
        }

        return redirect()->route('dashboard')->with('success', '¡Tipo de negocio configurado correctamente!');
    }

    /**
     * Obtiene la cuenta actual del usuario
     */
    private function getCurrentAccount()
    {
        $user = Auth::user();
        if (!$user) return null;

        $currentAccountId = session('current_account_id');

        if ($currentAccountId) {
            $account = $user->accounts()->where('id', $currentAccountId)->first();
            if ($account) {
                return $account;
            }
        }

        $account = $user->accounts()->first();
        if ($account) {
            session(['current_account_id' => $account->id]);
        }

        return $account;
    }
}
