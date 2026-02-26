<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\GetsCurrentAccount;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BrandController extends Controller
{
    use GetsCurrentAccount;

    /**
     * Mostrar lista de marcas
     */
    public function index(Request $request)
    {
        $account = $this->getCurrentAccount(Auth::user());

        $brands = Brand::where('account_id', $account->id)
            ->withCount('products')
            ->ordered()
            ->get();

        return Inertia::render('Client/Brands/Index', [
            'brands' => $brands,
        ]);
    }

    /**
     * Crear nueva marca
     */
    public function store(Request $request)
    {
        $account = $this->getCurrentAccount(Auth::user());

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'is_active' => 'boolean',
        ]);

        $validated['account_id'] = $account->id;
        $validated['slug'] = Str::slug($validated['name']);

        // Verificar slug único
        $count = 1;
        $originalSlug = $validated['slug'];
        while (Brand::where('account_id', $account->id)->where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $count++;
        }

        // Manejar logo
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('brands', 'public');
            $validated['logo'] = $path;
        }

        Brand::create($validated);

        return redirect()->back()->with('success', 'Marca creada exitosamente');
    }

    /**
     * Actualizar marca
     */
    public function update(Request $request, Brand $brand)
    {
        $account = $this->getCurrentAccount(Auth::user());

        if ($brand->account_id !== $account->id) {
            abort(403, 'No autorizado');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'is_active' => 'boolean',
        ]);

        // Manejar logo
        if ($request->hasFile('logo')) {
            // Eliminar logo anterior
            if ($brand->logo) {
                Storage::disk('public')->delete($brand->logo);
            }
            $path = $request->file('logo')->store('brands', 'public');
            $validated['logo'] = $path;
        }

        $brand->update($validated);

        return redirect()->back()->with('success', 'Marca actualizada exitosamente');
    }

    /**
     * Eliminar marca
     */
    public function destroy(Brand $brand)
    {
        $account = $this->getCurrentAccount(Auth::user());

        if ($brand->account_id !== $account->id) {
            abort(403, 'No autorizado');
        }

        // Eliminar logo
        if ($brand->logo) {
            Storage::disk('public')->delete($brand->logo);
        }

        $brand->delete();

        return redirect()->back()->with('success', 'Marca eliminada exitosamente');
    }

    /**
     * Cambiar estado activo
     */
    public function toggleActive(Brand $brand)
    {
        $account = $this->getCurrentAccount(Auth::user());

        if ($brand->account_id !== $account->id) {
            abort(403, 'No autorizado');
        }

        $brand->update(['is_active' => !$brand->is_active]);

        return redirect()->back()->with('success', 'Estado actualizado');
    }
}
