<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\GetsCurrentAccount;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TemplateSettingsController extends Controller
{
    use GetsCurrentAccount;

    /**
     * Mostrar la página de selección de plantillas
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $account = $this->getCurrentAccount($user, ['activeTemplate']);

        // Obtener plantillas personales (perfiles)
        $personalTemplates = Template::where('is_active', true)
            ->where('category', '!=', 'store')
            ->orderBy('is_premium')
            ->orderBy('name')
            ->get()
            ->map(fn($t) => $this->formatTemplate($t, 'personal'));

        // Obtener plantillas de tienda (ecommerce)
        $storeTemplates = Template::where('is_active', true)
            ->where('category', 'store')
            ->orderBy('is_premium')
            ->orderBy('name')
            ->get()
            ->map(fn($t) => $this->formatTemplate($t, 'store'));

        // Obtener la plantilla activa de la cuenta
        $activePersonalTemplate = $account->activeTemplate;

        // Obtener configuración personalizada si existe
        $accountTemplate = DB::table('account_template')
            ->where('account_id', $account->id)
            ->first();

        $customizations = $accountTemplate
            ? json_decode($accountTemplate->customizations, true)
            : null;

        return Inertia::render('Client/TemplateSelector', [
            'personalTemplates' => $personalTemplates,
            'storeTemplates' => $storeTemplates,
            'activeTemplateId' => $account->active_template_id,
            'activeStoreTemplateId' => $account->store_template_id,
            'customizations' => $customizations,
            'accountSlug' => $account->slug,
        ]);
    }

    /**
     * Actualizar la plantilla seleccionada
     */
    public function update(Request $request)
    {
        $request->validate([
            'template_id' => 'required|exists:templates,id',
            'type' => 'required|in:personal,store',
        ]);

        $user = $request->user();
        $account = $this->getCurrentAccount($user);
        $template = Template::findOrFail($request->template_id);
        $type = $request->input('type');

        // Verificar si es premium y la cuenta tiene acceso
        if ($template->is_premium) {
            // TODO: Verificar plan de la cuenta
            // Por ahora permitimos todas
        }

        if ($type === 'store') {
            // Actualizar plantilla de tienda usando DB::table para evitar problemas con el cast
            DB::table('accounts')
                ->where('id', $account->id)
                ->update([
                    'store_template_id' => $template->id,
                    'store_template_config' => json_encode($template->config ?? []),
                    'updated_at' => now(),
                ]);
        } else {
            // Actualizar plantilla personal
            $account->active_template_id = $template->id;
            $account->save();

            // Actualizar o crear la relación en la tabla pivot para plantillas personales
            DB::table('account_template')->updateOrInsert(
                ['account_id' => $account->id],
                [
                    'template_id' => $template->id,
                    'customizations' => json_encode($template->config ?? []),
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }

        return back()->with('success', 'Plantilla actualizada correctamente');
    }

    /**
     * Actualizar la configuración personalizada de la plantilla
     */
    public function updateConfig(Request $request)
    {
        $request->validate([
            'config' => 'required|array',
        ]);

        $user = $request->user();
        $account = $this->getCurrentAccount($user);

        // Verificar que tenga una plantilla asignada
        if (!$account->active_template_id) {
            return back()->withErrors(['error' => 'No tienes una plantilla seleccionada']);
        }

        // Actualizar las personalizaciones
        DB::table('account_template')->updateOrInsert(
            ['account_id' => $account->id],
            [
                'template_id' => $account->active_template_id,
                'customizations' => json_encode($request->config),
                'updated_at' => now(),
            ]
        );

        return back()->with('success', 'Configuración guardada correctamente');
    }

    /**
     * Subir logo de la plantilla
     */
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ]);

        $user = $request->user();
        $account = $this->getCurrentAccount($user);

        // Eliminar logo anterior si existe
        $accountTemplate = DB::table('account_template')
            ->where('account_id', $account->id)
            ->first();

        if ($accountTemplate) {
            $customizations = json_decode($accountTemplate->customizations, true) ?? [];
            if (!empty($customizations['logo']) && str_starts_with($customizations['logo'], '/storage/')) {
                $oldPath = str_replace('/storage/', '', $customizations['logo']);
                Storage::disk('public')->delete($oldPath);
            }
        }

        // Guardar nuevo logo
        $path = $request->file('logo')->store('templates/' . $account->slug, 'public');
        $url = '/storage/' . $path;

        // Actualizar configuración
        $customizations = $accountTemplate
            ? json_decode($accountTemplate->customizations, true) ?? []
            : [];
        $customizations['logo'] = $url;

        DB::table('account_template')->updateOrInsert(
            ['account_id' => $account->id],
            [
                'template_id' => $account->active_template_id ?? 1,
                'customizations' => json_encode($customizations),
                'updated_at' => now(),
            ]
        );

        return response()->json([
            'success' => true,
            'url' => $url,
        ]);
    }

    /**
     * Subir imagen de portada de la plantilla
     */
    public function uploadCover(Request $request)
    {
        $request->validate([
            'cover' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $user = $request->user();
        $account = $this->getCurrentAccount($user);

        // Eliminar cover anterior si existe
        $accountTemplate = DB::table('account_template')
            ->where('account_id', $account->id)
            ->first();

        if ($accountTemplate) {
            $customizations = json_decode($accountTemplate->customizations, true) ?? [];
            if (!empty($customizations['coverImage']) && str_starts_with($customizations['coverImage'], '/storage/')) {
                $oldPath = str_replace('/storage/', '', $customizations['coverImage']);
                Storage::disk('public')->delete($oldPath);
            }
        }

        // Guardar nuevo cover
        $path = $request->file('cover')->store('templates/' . $account->slug . '/covers', 'public');
        $url = '/storage/' . $path;

        // Actualizar configuración
        $customizations = $accountTemplate
            ? json_decode($accountTemplate->customizations, true) ?? []
            : [];
        $customizations['coverImage'] = $url;

        DB::table('account_template')->updateOrInsert(
            ['account_id' => $account->id],
            [
                'template_id' => $account->active_template_id ?? 1,
                'customizations' => json_encode($customizations),
                'updated_at' => now(),
            ]
        );

        return response()->json([
            'success' => true,
            'url' => $url,
        ]);
    }

    /**
     * Mostrar el editor de plantilla (Tienda eCommerce)
     */
    public function editor(Request $request, $templateId)
    {
        $user = $request->user();
        $account = $this->getCurrentAccount($user);

        // DEBUG: Log para verificar qué cuenta se está cargando en el editor
        \Log::info('=== CARGANDO EDITOR ===');
        \Log::info('Account ID: ' . $account->id);
        \Log::info('Account Name: ' . $account->name);
        \Log::info('Account Slug: ' . $account->slug);
        \Log::info('Session current_account_id: ' . session('current_account_id'));
        \Log::info('=== FIN DEBUG CARGAR EDITOR ===');

        // Buscar la plantilla por ID o por slug
        if (is_numeric($templateId)) {
            $template = Template::findOrFail($templateId);
        } else {
            $template = Template::where('slug', $templateId)->firstOrFail();
        }

        // Obtener configuración de tienda desde el campo store_template_config
        $config = $account->store_template_config ?? [];

        // Si es array, usarlo directamente; si es string, decodificar
        if (is_string($config)) {
            $config = json_decode($config, true) ?? [];
        }

        // Merge con config base de la plantilla si no hay configuración guardada
        if (empty($config) && $template->config) {
            $config = $template->config;
        }

        return Inertia::render('Client/TemplateEditor', [
            'templateId' => $template->id,
            'templateName' => $template->name,
            'templateSlug' => $template->slug,
            'config' => $config,
            'accountSlug' => $account->slug,
            'accountName' => $account->name,
            'accountId' => $account->id,
            'previewUrl' => '/' . $account->slug . '/tienda',
        ]);
    }

    /**
     * Subir imagen genérica para el editor (hero, banner, logo)
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'type' => 'required|in:hero,banner,logo',
        ]);

        $user = $request->user();
        $account = $this->getCurrentAccount($user);

        $type = $request->input('type');
        $folder = 'templates/' . $account->slug;

        if ($type === 'hero') {
            $folder .= '/hero';
        } elseif ($type === 'banner') {
            $folder .= '/banners';
        } elseif ($type === 'logo') {
            $folder .= '/logos';
        }

        // Guardar imagen
        $path = $request->file('image')->store($folder, 'public');
        $url = '/storage/' . $path;

        return response()->json([
            'success' => true,
            'url' => $url,
        ]);
    }

    /**
     * Guardar configuración completa del editor (Tienda eCommerce)
     */
    public function saveEditor(Request $request)
    {
        $request->validate([
            'template_id' => 'required',
            'config' => 'required|array',
        ]);

        $user = $request->user();
        $account = $this->getCurrentAccount($user);

        if (!$account) {
            return back()->withErrors(['error' => 'No se encontró la cuenta del usuario']);
        }

        $templateId = $request->input('template_id');
        $config = $request->config;

        // DEBUG: Log para verificar que se está guardando en la cuenta correcta
        \Log::info('=== GUARDANDO CONFIG EN EDITOR ===');
        \Log::info('Account ID: ' . $account->id);
        \Log::info('Account Name: ' . $account->name);
        \Log::info('Account Slug: ' . $account->slug);
        \Log::info('Session current_account_id: ' . session('current_account_id'));
        \Log::info('Template ID: ' . $templateId);
        \Log::info('topBarText en config: ' . ($config['topBarText'] ?? 'NO EXISTE'));
        \Log::info('mainMenu count: ' . (isset($config['mainMenu']) ? count($config['mainMenu']) : 0));
        \Log::info('=== FIN DEBUG GUARDAR ===');

        // Usar DB::table para evitar problemas con el cast del modelo
        $updated = \Illuminate\Support\Facades\DB::table('accounts')
            ->where('id', $account->id)
            ->update([
                'store_template_id' => $templateId,
                'store_template_config' => json_encode($config),
                'updated_at' => now(),
            ]);

        if ($updated) {
            return back()->with('success', 'Configuración guardada correctamente');
        } else {
            return back()->withErrors(['error' => 'Error al guardar la configuración']);
        }
    }

    /**
     * Formatear plantilla para el frontend
     */
    protected function formatTemplate(Template $template, string $type): array
    {
        return [
            'id' => $template->id,
            'name' => $template->name,
            'slug' => $template->slug,
            'description' => $template->description,
            'preview_image' => $template->preview_url,
            'category' => $template->category,
            'is_premium' => $template->is_premium,
            'is_active' => $template->is_active,
            'config' => $template->config,
            'type' => $type,
            'features' => $this->getTemplateFeatures($template),
        ];
    }

    /**
     * Obtener características de la plantilla basadas en su configuración
     */
    protected function getTemplateFeatures(Template $template): array
    {
        $config = $template->config ?? [];
        $features = [];

        // Características comunes
        if (isset($config['hero'])) {
            $features[] = 'Hero personalizable';
        }
        if (isset($config['products']) || isset($config['productSections'])) {
            $features[] = 'Catálogo de productos';
        }
        if (isset($config['colors']) || isset($config['branding'])) {
            $features[] = 'Colores personalizables';
        }
        if (isset($config['navigation']) || isset($config['megaMenu'])) {
            $features[] = 'Navegación avanzada';
        }
        if (isset($config['footer'])) {
            $features[] = 'Footer personalizable';
        }
        if (isset($config['seo'])) {
            $features[] = 'SEO optimizado';
        }
        if (isset($config['cart']) || isset($config['checkout'])) {
            $features[] = 'Carrito de compras';
        }
        if (isset($config['filters'])) {
            $features[] = 'Filtros avanzados';
        }

        // Si no hay features detectadas, agregar algunas por defecto
        if (empty($features)) {
            $features = [
                'Diseño responsive',
                'Fácil personalización',
                'SEO optimizado',
            ];
        }

        return $features;
    }
}
