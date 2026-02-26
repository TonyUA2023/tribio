<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\GetsCurrentAccount;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProductCategoryController extends Controller
{
    use GetsCurrentAccount;

    /**
     * Mostrar lista de categorías
     */
    public function index(Request $request)
    {
        $account = $this->getCurrentAccount(Auth::user());

        // Obtener categorías raíz con sus hijos recursivamente
        $categories = ProductCategory::where('account_id', $account->id)
            ->roots()
            ->withCount('products')
            ->with(['children' => function ($query) {
                $query->withCount('products')->ordered();
            }])
            ->ordered()
            ->get();

        // También obtener todas las categorías en formato plano para el select de "categoría padre"
        $allCategories = ProductCategory::where('account_id', $account->id)
            ->ordered()
            ->get()
            ->map(function ($cat) {
                return [
                    'id' => $cat->id,
                    'name' => $cat->name,
                    'full_path' => $cat->full_path,
                    'depth' => $cat->depth,
                    'parent_id' => $cat->parent_id,
                ];
            });

        return Inertia::render('Client/Categories/Index', [
            'categories' => $categories,
            'allCategories' => $allCategories,
        ]);
    }

    /**
     * Crear nueva categoría
     */
    public function store(Request $request)
    {
        $account = $this->getCurrentAccount(Auth::user());

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:product_categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'is_active' => 'boolean',
        ]);

        // Validar que el parent_id pertenezca a la misma cuenta
        if (!empty($validated['parent_id'])) {
            $parentCategory = ProductCategory::find($validated['parent_id']);
            if (!$parentCategory || $parentCategory->account_id !== $account->id) {
                abort(403, 'Categoría padre no válida');
            }
            // Limitar profundidad a 2 niveles (categoría > subcategoría)
            if ($parentCategory->depth >= 1) {
                return redirect()->back()->withErrors(['parent_id' => 'No se pueden crear más de 2 niveles de subcategorías']);
            }
        }

        $validated['account_id'] = $account->id;
        $validated['slug'] = Str::slug($validated['name']);

        // Verificar slug único dentro del mismo nivel
        $count = 1;
        $originalSlug = $validated['slug'];
        while (ProductCategory::where('account_id', $account->id)
            ->where('slug', $validated['slug'])
            ->where('parent_id', $validated['parent_id'] ?? null)
            ->exists()) {
            $validated['slug'] = $originalSlug . '-' . $count++;
        }

        // Manejar imagen
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('categories', 'public');
            $validated['image'] = $path;
        }

        ProductCategory::create($validated);

        return redirect()->back()->with('success', 'Categoría creada exitosamente');
    }

    /**
     * Actualizar categoría
     */
    public function update(Request $request, ProductCategory $category)
    {
        $account = $this->getCurrentAccount(Auth::user());

        if ($category->account_id !== $account->id) {
            abort(403, 'No autorizado');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:product_categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'is_active' => 'boolean',
        ]);

        // Validar que no se asigne como padre a sí misma o a sus hijos
        if (!empty($validated['parent_id'])) {
            if ($validated['parent_id'] == $category->id) {
                return redirect()->back()->withErrors(['parent_id' => 'Una categoría no puede ser su propio padre']);
            }

            $parentCategory = ProductCategory::find($validated['parent_id']);
            if (!$parentCategory || $parentCategory->account_id !== $account->id) {
                abort(403, 'Categoría padre no válida');
            }

            // Verificar que no sea hijo de la categoría actual
            $isChild = $this->isDescendant($category->id, $validated['parent_id']);
            if ($isChild) {
                return redirect()->back()->withErrors(['parent_id' => 'No se puede asignar una subcategoría como padre']);
            }

            // Limitar profundidad
            if ($parentCategory->depth >= 1) {
                return redirect()->back()->withErrors(['parent_id' => 'No se pueden crear más de 2 niveles de subcategorías']);
            }
        }

        // Manejar imagen
        if ($request->hasFile('image')) {
            // Eliminar imagen anterior
            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }
            $path = $request->file('image')->store('categories', 'public');
            $validated['image'] = $path;
        }

        $category->update($validated);

        return redirect()->back()->with('success', 'Categoría actualizada exitosamente');
    }

    /**
     * Eliminar categoría
     */
    public function destroy(ProductCategory $category)
    {
        $account = $this->getCurrentAccount(Auth::user());

        if ($category->account_id !== $account->id) {
            abort(403, 'No autorizado');
        }

        // Verificar si tiene subcategorías
        if ($category->children()->count() > 0) {
            return redirect()->back()->withErrors(['delete' => 'No se puede eliminar una categoría con subcategorías. Elimina primero las subcategorías.']);
        }

        // Eliminar imagen
        if ($category->image) {
            Storage::disk('public')->delete($category->image);
        }

        $category->delete();

        return redirect()->back()->with('success', 'Categoría eliminada exitosamente');
    }

    /**
     * Cambiar estado activo
     */
    public function toggleActive(ProductCategory $category)
    {
        $account = $this->getCurrentAccount(Auth::user());

        if ($category->account_id !== $account->id) {
            abort(403, 'No autorizado');
        }

        $category->update(['is_active' => !$category->is_active]);

        // Si se desactiva la categoría padre, desactivar también las subcategorías
        if (!$category->is_active) {
            $category->children()->update(['is_active' => false]);
        }

        return redirect()->back()->with('success', 'Estado actualizado');
    }

    /**
     * Verificar si un ID es descendiente de otro
     */
    private function isDescendant(int $parentId, int $childId): bool
    {
        $category = ProductCategory::find($childId);
        while ($category && $category->parent_id) {
            if ($category->parent_id == $parentId) {
                return true;
            }
            $category = $category->parent;
        }
        return false;
    }
}
