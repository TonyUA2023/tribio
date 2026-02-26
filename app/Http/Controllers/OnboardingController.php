<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\GetsCurrentAccount;
use App\Models\BusinessCategory;
use App\Models\Template;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OnboardingController extends Controller
{
    use GetsCurrentAccount;

    /**
     * Muestra la página de configuración inicial.
     */
    public function show()
    {
        $account = $this->getCurrentAccount(Auth::user());

        // Carga las categorías base (sin padre) con sus subcategorías
        $categories = BusinessCategory::with('children')
            ->where('is_active', true)
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->get();

        // Cargar las plantillas activas
        $templates = Template::active()->get();

        return Inertia::render('Onboarding/Setup', [
            'categories' => $categories,
            'accountName' => $account->name,
            'templates' => $templates,
        ]);
    }

    /**
     * Guarda la configuración del negocio.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'business_category_id' => 'required_without:other_category|nullable|exists:business_categories,id',
            'other_category' => 'required_without:business_category_id|nullable|string|max:100',
            'template_id' => 'required|exists:templates,id',
        ]);

        $account = $this->getCurrentAccount(Auth::user());

        $categoryId = $validated['business_category_id'] ?? null;
        $meta = $account->meta ?? [];

        // Si el usuario escribió una categoría personalizada
        if (!empty($validated['other_category'])) {
            // Buscamos la categoría genérica "Otro" en la BD para asignarla
            $otherCategory = BusinessCategory::where('slug', 'other')->first();
            
            if ($otherCategory) {
                $categoryId = $otherCategory->id;
            }
            
            // Guardamos el texto personalizado en el campo meta
            $meta['custom_category'] = $validated['other_category'];
        }

        $account->update([
            'business_category_id' => $categoryId,
            'meta' => $meta,
            'active_template_id' => $validated['template_id'],
        ]);

        // Obtener la plantilla seleccionada para sacar su configuración base
        $template = Template::find($validated['template_id']);
        $defaultConfig = is_array($template->config) ? $template->config : (json_decode($template->config ?? '[]', true) ?? []);

        // Crear el registro en la tabla 'profiles' necesario para la visualización
        Profile::firstOrCreate(
            ['account_id' => $account->id],
            [
                'name' => $account->name,
                'title' => $account->name,
                'slug' => 'home', // Slug interno del perfil
                'template_id' => $template->id,
                'custom_view_path' => null, // Se deja vacío como solicitaste
                'data' => [
                    'bio' => 'Bienvenido a ' . $account->name,
                    'phone' => $account->phone,
                    'email' => $account->email,
                ],
                'template_config' => $defaultConfig, // Configuración inicial de colores/diseño
            ]
        );

        // Registrar también en la tabla pivote para compatibilidad con el editor visual
        $account->templates()->syncWithoutDetaching([
            $template->id => ['customizations' => json_encode($defaultConfig)]
        ]);

        return redirect()->route('dashboard')->with('status', '¡Tu negocio ha sido configurado con éxito!');
    }
}