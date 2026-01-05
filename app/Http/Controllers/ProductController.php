<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Mostrar lista de productos
     */
    public function index(Request $request)
    {
        $account = Auth::user()->account;

        $query = Product::where('account_id', $account->id);

        // Filtros
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->has('available')) {
            $query->where('available', $request->available);
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        $products = $query->orderBy('sort_order')->orderBy('created_at', 'desc')->get();

        // Obtener categorías únicas
        $categories = Product::where('account_id', $account->id)
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category');

        return Inertia::render('Client/Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['category', 'available', 'search']),
        ]);
    }

    /**
     * Crear nuevo producto
     */
    public function store(Request $request)
    {
        $account = Auth::user()->account;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'category' => 'nullable|string|max:100',
            'available' => 'boolean',
            'featured' => 'boolean',
            'stock' => 'nullable|integer|min:0',
            'sort_order' => 'nullable|integer',
            'options' => 'nullable|array',
        ]);

        $validated['account_id'] = $account->id;

        // Manejar imagen
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image'] = $path;
        }

        $product = Product::create($validated);

        return redirect()->back()->with('success', 'Producto creado exitosamente');
    }

    /**
     * Actualizar producto
     */
    public function update(Request $request, Product $product)
    {
        // Verificar que el producto pertenece a la cuenta del usuario
        if ($product->account_id !== Auth::user()->account->id) {
            abort(403, 'No autorizado');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'category' => 'nullable|string|max:100',
            'available' => 'boolean',
            'featured' => 'boolean',
            'stock' => 'nullable|integer|min:0',
            'sort_order' => 'nullable|integer',
            'options' => 'nullable|array',
        ]);

        // Manejar imagen
        if ($request->hasFile('image')) {
            // Eliminar imagen anterior
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $path = $request->file('image')->store('products', 'public');
            $validated['image'] = $path;
        }

        $product->update($validated);

        return redirect()->back()->with('success', 'Producto actualizado exitosamente');
    }

    /**
     * Eliminar producto (soft delete)
     */
    public function destroy(Product $product)
    {
        // Verificar que el producto pertenece a la cuenta del usuario
        if ($product->account_id !== Auth::user()->account->id) {
            abort(403, 'No autorizado');
        }

        $product->delete();

        return redirect()->back()->with('success', 'Producto eliminado exitosamente');
    }

    /**
     * Cambiar disponibilidad rápidamente
     */
    public function toggleAvailability(Product $product)
    {
        // Verificar que el producto pertenece a la cuenta del usuario
        if ($product->account_id !== Auth::user()->account->id) {
            abort(403, 'No autorizado');
        }

        $product->update(['available' => !$product->available]);

        return redirect()->back()->with('success', 'Disponibilidad actualizada');
    }

    /**
     * Cambiar destacado rápidamente
     */
    public function toggleFeatured(Product $product)
    {
        // Verificar que el producto pertenece a la cuenta del usuario
        if ($product->account_id !== Auth::user()->account->id) {
            abort(403, 'No autorizado');
        }

        $product->update(['featured' => !$product->featured]);

        return redirect()->back()->with('success', 'Producto destacado actualizado');
    }

    /**
     * Actualizar orden de productos
     */
    public function updateOrder(Request $request)
    {
        $validated = $request->validate([
            'products' => 'required|array',
            'products.*.id' => 'required|exists:products,id',
            'products.*.sort_order' => 'required|integer',
        ]);

        foreach ($validated['products'] as $productData) {
            Product::where('id', $productData['id'])
                ->where('account_id', Auth::user()->account->id)
                ->update(['sort_order' => $productData['sort_order']]);
        }

        return redirect()->back()->with('success', 'Orden actualizado exitosamente');
    }
}
