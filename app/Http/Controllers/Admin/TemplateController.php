<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TemplateController extends Controller
{
    /**
     * Mostrar listado de plantillas
     */
    public function index(): Response
    {
        $templates = Template::orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/Templates/Index', [
            'templates' => $templates
        ]);
    }

    /**
     * Mostrar formulario de creación
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Templates/Create');
    }

    /**
     * Crear nueva plantilla
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9-]+$/',
                'unique:templates,slug'
            ],
            'description' => 'nullable|string',
            'category' => 'required|string|max:50',
            'is_active' => 'boolean',
            'is_premium' => 'boolean',
            'config' => 'required|array',
            'preview_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        try {
            // Subir imagen preview si existe
            $previewPath = null;
            if ($request->hasFile('preview_image')) {
                $previewPath = $request->file('preview_image')->store('templates/previews', 'public');
            }

            $template = Template::create([
                'name' => $validated['name'],
                'slug' => $validated['slug'],
                'description' => $validated['description'] ?? null,
                'category' => $validated['category'],
                'is_active' => $validated['is_active'] ?? true,
                'is_premium' => $validated['is_premium'] ?? false,
                'config' => $validated['config'],
                'preview_image_url' => $previewPath,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Plantilla creada exitosamente',
                'template' => $template
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear plantilla: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar formulario de edición
     */
    public function edit(Template $template): Response
    {
        return Inertia::render('Admin/Templates/Edit', [
            'template' => $template
        ]);
    }

    /**
     * Actualizar plantilla existente
     */
    public function update(Request $request, Template $template)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => [
                'sometimes',
                'string',
                'max:255',
                'regex:/^[a-z0-9-]+$/',
                Rule::unique('templates', 'slug')->ignore($template->id)
            ],
            'description' => 'nullable|string',
            'category' => 'sometimes|string|max:50',
            'is_active' => 'sometimes|boolean',
            'is_premium' => 'sometimes|boolean',
            'config' => 'sometimes|array',
            'preview_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'remove_preview' => 'sometimes|boolean',
        ]);

        try {
            // Eliminar imagen anterior si se solicita
            if ($request->input('remove_preview') && $template->preview_image_url) {
                Storage::disk('public')->delete($template->preview_image_url);
                $template->preview_image_url = null;
            }

            // Subir nueva imagen preview si existe
            if ($request->hasFile('preview_image')) {
                // Eliminar imagen anterior
                if ($template->preview_image_url) {
                    Storage::disk('public')->delete($template->preview_image_url);
                }

                $previewPath = $request->file('preview_image')->store('templates/previews', 'public');
                $validated['preview_image_url'] = $previewPath;
                unset($validated['preview_image']);
            }

            $template->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Plantilla actualizada exitosamente',
                'template' => $template->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar plantilla
     */
    public function destroy(Template $template)
    {
        try {
            // Eliminar imagen preview si existe
            if ($template->preview_image_url) {
                Storage::disk('public')->delete($template->preview_image_url);
            }

            // Eliminar relaciones en pivot table
            $template->accounts()->detach();

            // Eliminar plantilla
            $template->delete();

            return response()->json([
                'success' => true,
                'message' => 'Plantilla eliminada exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generar slug único basado en el nombre
     */
    public function generateSlug(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255'
        ]);

        $baseSlug = Str::slug($request->name);
        $slug = $baseSlug;
        $counter = 1;

        while (Template::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return response()->json([
            'slug' => $slug
        ]);
    }

    /**
     * Subir/actualizar imagen preview
     */
    public function uploadPreview(Request $request, Template $template)
    {
        $request->validate([
            'preview_image' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        try {
            // Eliminar imagen anterior si existe
            if ($template->preview_image_url) {
                Storage::disk('public')->delete($template->preview_image_url);
            }

            // Subir nueva imagen
            $previewPath = $request->file('preview_image')->store('templates/previews', 'public');

            $template->update([
                'preview_image_url' => $previewPath
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Imagen preview actualizada exitosamente',
                'preview_url' => Storage::url($previewPath)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al subir imagen: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar imagen preview
     */
    public function removePreview(Template $template)
    {
        try {
            if ($template->preview_image_url) {
                Storage::disk('public')->delete($template->preview_image_url);

                $template->update([
                    'preview_image_url' => null
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Imagen preview eliminada exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar imagen: ' . $e->getMessage()
            ], 500);
        }
    }
}
