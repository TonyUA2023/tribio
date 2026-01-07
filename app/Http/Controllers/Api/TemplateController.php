<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TemplateController extends Controller
{
    /**
     * Listar todas las plantillas activas
     */
    public function index(Request $request)
    {
        try {
            $query = Template::query()->where('is_active', 1);

            if ($request->filled('category') && $request->category !== 'all') {
                $query->where('category', $request->category);
            }

            if ($request->has('premium')) {
                $query->where('is_premium', $request->boolean('premium'));
            }

            $templates = $query->orderBy('id', 'asc')->get();

            return response()->json([
                'success' => true,
                'data' => $templates,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener plantillas',
                'error_detail' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Aplicar una plantilla a la cuenta (CORREGIDO PARA UNIQUE CONSTRAINT)
     */
    public function applyTemplate(Request $request)
    {
        try {
            $request->validate([
                'template_id' => ['required', 'integer', 'exists:templates,id'],
            ]);

            $user = Auth::user();
            if (!$user) return response()->json(['success' => false, 'message' => 'No auth'], 401);
            
            $account = $user->account;
            if (!$account) return response()->json(['success' => false, 'message' => 'No account'], 404);

            $template = Template::find($request->template_id);
            
            // 1. Obtener configuración base del template
            $defaultConfig = is_array($template->config) ? $template->config : (json_decode($template->config ?? '[]', true) ?? []);

            // 2. Rescatar personalizaciones previas para no perder datos (teléfonos, redes, etc.)
            //    Usamos DB::table directamente para evitar problemas de caché de modelos
            $currentData = DB::table('account_template')
                ->where('account_id', $account->id)
                ->value('customizations');
                
            $currentCustom = $currentData ? (json_decode($currentData, true) ?? []) : [];

            // 3. FUSIÓN DE DATOS (Smart Merge)
            // Prioridad: Datos actuales > Configuración del Template
            $smartCustomization = array_merge($defaultConfig, $currentCustom);

            // Asegurar datos críticos de la cuenta
            $smartCustomization['businessName'] = $account->name;
            if ($account->logo_url) $smartCustomization['logoImage'] = $account->logo_url;
            if ($account->cover_url) $smartCustomization['coverImage'] = $account->cover_url;
            
            // Asegurar redes sociales
            if (empty($smartCustomization['socialLinks'])) {
                 $smartCustomization['socialLinks'] = [
                    'whatsapp' => $account->whatsapp,
                    'instagram' => $account->instagram,
                    'facebook' => $account->facebook,
                    'tiktok' => $account->tiktok,
                 ];
            }

            // 4. GUARDADO SEGURO (Upsert)
            DB::transaction(function () use ($account, $template, $smartCustomization) {
                
                // USAMOS updateOrInsert para respetar la restricción UNIQUE KEY 'unique_account'
                // Esto busca por 'account_id'. Si existe, actualiza 'template_id'. Si no, inserta.
                DB::table('account_template')->updateOrInsert(
                    ['account_id' => $account->id], // Condición de búsqueda
                    [
                        'template_id' => $template->id,
                        'customizations' => json_encode($smartCustomization),
                        'updated_at' => now(),
                        // Si es nuevo registro, created_at será now(). Si ya existe, no se toca.
                    ]
                );

                // Actualizar la referencia en la tabla accounts
                $account->update(['active_template_id' => $template->id]);
            });

            return response()->json([
                'success' => true,
                'message' => 'Plantilla aplicada correctamente.',
                'data' => [
                    'active_template_id' => $template->id,
                    'template' => $template,
                    'customizations' => $smartCustomization,
                ],
            ]);

        } catch (\Throwable $e) {
            // Loguear error real para depuración
            \Illuminate\Support\Facades\Log::error("Error aplicando template: " . $e->getMessage());
            
            return response()->json([
                'success' => false, 
                'message' => 'Error al aplicar plantilla (SQL)', 
                'error' => $e->getMessage() // Esto mostrará el mensaje limpio en tu App
            ], 500);
        }
    }

    /**
     * Obtener plantilla actual (AQUÍ ESTÁ LA SOLUCIÓN)
     * Inyecta los datos de la BD en la respuesta
     */
    public function getCurrentTemplate()
    {
        try {
            $user = Auth::user();
            if (!$user) return response()->json(['success' => false, 'message' => 'No autenticado'], 401);

            $account = $user->account;
            if (!$account) return response()->json(['success' => false, 'message' => 'Cuenta no encontrada'], 404);

            $template = null;
            $customizations = [];

            // 1. Cargar Configuración Visual Guardada
            if (!empty($account->active_template_id)) {
                $template = Template::find($account->active_template_id);
                if ($template) {
                    $pivotRow = $account->templates()->where('templates.id', $template->id)->first();
                    $customizations = $pivotRow ? (json_decode($pivotRow->pivot->customizations ?? '{}', true) ?? []) : [];
                }
            }

            // =========================================================
            // 2. EL PUENTE: Inyectar datos de la Base de Datos
            // =========================================================
            
            // Redes Sociales (Lee las columnas que creamos en la migración)
            $customizations['socialLinks'] = [
                'whatsapp'  => $account->whatsapp,
                'instagram' => $account->instagram,
                'tiktok'    => $account->tiktok,
                'facebook'  => $account->facebook,
            ];

            // Datos del Negocio
            $customizations['businessName'] = $account->name;
            // Si existe descripción en BD, tiene prioridad sobre la del diseño
            if (!empty($account->description)) {
                $customizations['businessBio'] = $account->description;
            }
            
            // Imágenes (Prioridad a la BD)
            if ($account->logo_url) $customizations['logoImage'] = $account->logo_url;
            if ($account->cover_url) $customizations['coverImage'] = $account->cover_url;

            // =========================================================

            return response()->json([
                'success' => true,
                'data' => [
                    'template' => $template,
                    'customizations' => $customizations, // Contiene los datos frescos
                ],
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Error al obtener plantilla', 
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar personalización visual (Colores, Servicios)
     */
    public function updateCustomizations(Request $request)
    {
        $request->validate(['customizations' => ['required', 'array']]);

        try {
            $user = Auth::user();
            $account = $user->account;

            if (!$account || empty($account->active_template_id)) {
                return response()->json(['success' => false, 'message' => 'No hay plantilla activa'], 404);
            }

            $activeId = $account->active_template_id;
            
            // Asegurar que existe la relación
            if (!$account->templates()->where('template_id', $activeId)->exists()) {
                $account->templates()->attach($activeId, ['customizations' => json_encode($request->customizations)]);
            } else {
                $account->templates()->updateExistingPivot($activeId, ['customizations' => json_encode($request->customizations)]);
            }

            return response()->json(['success' => true, 'data' => $request->customizations]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => 'Error al guardar', 'error' => $e->getMessage()], 500);
        }
    }

    // --- MÉTODOS DE DESARROLLO (Mantener intactos) ---

    public function create(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string',
                'slug' => 'required|string|unique:templates,slug',
                'category' => 'required|string',
                'is_premium' => 'boolean',
                'config' => 'required|array',
            ]);

            $template = Template::create(array_merge($validated, ['is_active' => true]));

            return response()->json(['success' => true, 'data' => $template], 201);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $template = Template::findOrFail($id);
        $template->update($request->all());
        return response()->json(['success' => true, 'data' => $template]);
    }

    public function destroy($id)
    {
        $template = Template::findOrFail($id);
        $template->delete();
        return response()->json(['success' => true]);
    }

    public function preview($slug)
    {
        $template = Template::where('slug', $slug)->firstOrFail();
        // Datos falsos para desarrollo
        $fakeData = [
            'businessName' => 'Demo ' . ucfirst($template->category),
            'businessTitle' => 'Servicios Profesionales',
            'businessBio' => 'Vista previa con datos de prueba.',
            'socialLinks' => [
                'whatsapp' => '51999999999',
                'instagram' => 'demo_insta',
            ],
            'services' => $this->getFakeServices($template->category),
            'schedule' => 'Lun-Vie 9am-6pm',
            'profileId' => 0,
            'accountSlug' => 'preview',
        ];
        
        $config = array_merge(
            is_array($template->config) ? $template->config : json_decode($template->config ?? '[]', true),
            $fakeData
        );

        return response()->json(['success' => true, 'data' => ['template' => $template, 'config' => $config]]);
    }

    private function getFakeServices($category)
    {
        $defaults = ['Servicio 1', 'Servicio 2', 'Servicio 3'];
        $services = [
            'barber' => ['Corte Clásico', 'Barba', 'Corte Niño'],
            'restaurant' => ['Desayuno', 'Almuerzo', 'Cena'],
        ];
        return $services[$category] ?? $defaults;
    }
}