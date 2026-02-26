<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\GetsCurrentAccount;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Brand;
use App\Services\MlPredictionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProductController extends Controller
{
    use GetsCurrentAccount;

    /**
     * Mostrar lista de productos
     */
    public function index(Request $request)
    {
        $account = $this->getCurrentAccount(Auth::user());

        $query = Product::where('account_id', $account->id)
            ->with(['productCategory', 'brandRelation']);

        // Filtros
        if ($request->has('category_id') && $request->category_id !== 'all') {
            $query->where('product_category_id', $request->category_id);
        }

        if ($request->has('brand_id') && $request->brand_id !== 'all') {
            $query->where('brand_id', $request->brand_id);
        }

        if ($request->has('gender') && $request->gender !== 'all') {
            $query->where('gender', $request->gender);
        }

        if ($request->has('available')) {
            $query->where('available', $request->available);
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%')
                  ->orWhere('sku', 'like', '%' . $request->search . '%');
            });
        }

        $products = $query->orderBy('sort_order')->orderBy('created_at', 'desc')->get();

        // Predicciones ML M1 en paralelo (solo primeros 24 para no sobrecargar)
        $mlService = new MlPredictionService();
        $slice = $products->take(24);
        $payloads = $slice->map(fn($p) => [
            'price'              => (float) $p->price,
            'discount_pct'       => ($p->compare_price && $p->compare_price > $p->price)
                                        ? (int) round((($p->compare_price - $p->price) / $p->compare_price) * 100)
                                        : 0,
            'stock'              => $p->stock ?? 99,
            'images_count'       => count($p->images ?? []) + ($p->image ? 1 : 0),
            'description_length' => strlen($p->description ?? ''),
            'featured'           => $p->featured ? 1 : 0,
        ])->values()->all();

        $mlResults = $mlService->batchPredict($payloads, '/predict/sales');

        // Re-indexar con values() para asegurar que los índices sean 0-based y alineen con $mlResults
        $products = $products->values()->map(function ($product, $index) use ($mlResults) {
            $mlResult = $mlResults[$index] ?? null;

            // Si la API no respondió, generar análisis local basado en los datos del producto
            if ($mlResult === null) {
                $mlResult = $this->buildLocalProductInsight($product);
            }

            $product->ml_sales_prediction = $mlResult;
            return $product;
        });

        // Obtener categorías con jerarquía
        $categories = ProductCategory::where('account_id', $account->id)
            ->with('children')
            ->roots()
            ->ordered()
            ->get();

        // Obtener todas las categorías en formato plano para el select
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

        // Obtener marcas
        $brands = Brand::where('account_id', $account->id)
            ->active()
            ->ordered()
            ->get();

        return Inertia::render('Client/Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'allCategories' => $allCategories,
            'brands' => $brands,
            'genderOptions' => Product::getGenderOptions(),
            'conditionOptions' => Product::getConditionOptions(),
            'variantAttributes' => Product::getCommonVariantAttributes(),
            'filters' => $request->only(['category_id', 'brand_id', 'gender', 'available', 'search']),
        ]);
    }

    /**
     * Crear nuevo producto
     */
    public function store(Request $request)
    {
        $account = $this->getCurrentAccount(Auth::user());

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:500',
            'price' => 'required|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'product_category_id' => 'nullable|exists:product_categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'category' => 'nullable|string|max:100',
            'brand' => 'nullable|string|max:100',
            'gender' => 'nullable|string|in:male,female,unisex,kids',
            'condition' => 'nullable|string|in:new,used,refurbished',
            'origin_country' => 'nullable|string|max:100',
            'sku' => 'nullable|string|max:100',
            'available' => 'boolean',
            'featured' => 'boolean',
            'stock' => 'nullable|integer|min:0',
            'weight' => 'nullable|numeric|min:0',
            'sort_order' => 'nullable|integer',
            'specifications' => 'nullable|array',
            'specifications.*.label' => 'required_with:specifications|string',
            'specifications.*.value' => 'required_with:specifications|string',
            'has_variants' => 'boolean',
            'variant_attributes' => 'nullable|array',
            'variants' => 'nullable|array',
            'display_settings' => 'nullable|array',
        ]);

        $validated['account_id'] = $account->id;

        // Auto-generar slug único por account
        $base = Str::slug($validated['name']);
        $slug = $base;
        $i = 1;
        while (Product::where('account_id', $account->id)->where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }
        $validated['slug'] = $slug;

        // Manejar imagen — guardar en products/{account_id}/
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store("products/{$account->id}", 'public');
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
        if ($product->account_id !== $this->getCurrentAccount(Auth::user())->id) {
            abort(403, 'No autorizado');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:500',
            'price' => 'required|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'product_category_id' => 'nullable|exists:product_categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'category' => 'nullable|string|max:100',
            'brand' => 'nullable|string|max:100',
            'gender' => 'nullable|string|in:male,female,unisex,kids',
            'condition' => 'nullable|string|in:new,used,refurbished',
            'origin_country' => 'nullable|string|max:100',
            'sku' => 'nullable|string|max:100',
            'available' => 'boolean',
            'featured' => 'boolean',
            'stock' => 'nullable|integer|min:0',
            'weight' => 'nullable|numeric|min:0',
            'sort_order' => 'nullable|integer',
            'specifications' => 'nullable|array',
            'specifications.*.label' => 'required_with:specifications|string',
            'specifications.*.value' => 'required_with:specifications|string',
            'has_variants' => 'boolean',
            'variant_attributes' => 'nullable|array',
            'variants' => 'nullable|array',
            'display_settings' => 'nullable|array',
        ]);

        // Regenerar slug si cambió el nombre (mantener único por account)
        if (isset($validated['name']) && Str::slug($validated['name']) !== Str::slug($product->name)) {
            $base = Str::slug($validated['name']);
            $slug = $base;
            $i = 1;
            while (
                Product::where('account_id', $product->account_id)
                    ->where('slug', $slug)
                    ->where('id', '!=', $product->id)
                    ->exists()
            ) {
                $slug = $base . '-' . $i++;
            }
            $validated['slug'] = $slug;
        }

        // Manejar imagen — guardar en products/{account_id}/
        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $path = $request->file('image')->store("products/{$product->account_id}", 'public');
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
        if ($product->account_id !== $this->getCurrentAccount(Auth::user())->id) {
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
        if ($product->account_id !== $this->getCurrentAccount(Auth::user())->id) {
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
        if ($product->account_id !== $this->getCurrentAccount(Auth::user())->id) {
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
                ->where('account_id', $this->getCurrentAccount(Auth::user())->id)
                ->update(['sort_order' => $productData['sort_order']]);
        }

        return redirect()->back()->with('success', 'Orden actualizado exitosamente');
    }

    /**
     * Genera un análisis local de ventas cuando la API ML no está disponible.
     * Evalúa los atributos del producto y devuelve probabilidad + recomendaciones.
     */
    private function buildLocalProductInsight(Product $product): array
    {
        $score = 0.0;
        $recommendations = [];

        // Imagen principal
        $imagesCount = count($product->images ?? []) + ($product->image ? 1 : 0);
        if ($imagesCount === 0) {
            $recommendations[] = 'Agrega al menos una imagen — los productos con foto venden 3x más.';
        } elseif ($imagesCount === 1) {
            $recommendations[] = 'Agrega más fotos (desde distintos ángulos) para aumentar la confianza del comprador.';
            $score += 0.15;
        } else {
            $score += 0.25;
        }

        // Descripción
        $descLen = strlen($product->description ?? '');
        if ($descLen === 0) {
            $recommendations[] = 'Escribe una descripción del producto — explica qué es, para qué sirve y sus beneficios.';
        } elseif ($descLen < 80) {
            $recommendations[] = 'La descripción es muy corta. Detalla materiales, tallas, usos o características.';
            $score += 0.05;
        } else {
            $score += 0.20;
        }

        // Precio comparativo / descuento
        if ($product->compare_price && $product->compare_price > $product->price) {
            $score += 0.15;
        } else {
            $recommendations[] = 'Considera agregar un precio tachado para mostrar el ahorro y motivar la compra.';
        }

        // Stock definido
        if ($product->stock === null) {
            $recommendations[] = 'Define el stock disponible para generar urgencia en el comprador.';
        } elseif ($product->stock === 0) {
            $recommendations[] = 'El producto está sin stock — actualízalo para que pueda venderse.';
        } else {
            $score += 0.10;
            if ($product->stock <= 5) {
                $recommendations[] = 'Stock bajo (' . $product->stock . ' unidades) — considera reponer pronto.';
            }
        }

        // Destacado
        if (!$product->featured) {
            $recommendations[] = 'Marca este producto como destacado para que aparezca primero en tu tienda.';
        } else {
            $score += 0.10;
        }

        // Disponible
        if (!$product->available) {
            $score = 0.05;
            $recommendations = ['El producto está oculto. Actívalo para que los clientes puedan comprarlo.'];
        } else {
            $score += 0.10;
        }

        // SKU definido (señal de catálogo organizado)
        if ($product->sku) {
            $score += 0.05;
        }

        $score = min(round($score, 2), 0.95);

        if ($score >= 0.70) {
            $label = 'Alta probabilidad de venta';
        } elseif ($score >= 0.40) {
            $label = 'Probabilidad media de venta';
        } else {
            $label = 'Baja probabilidad de venta';
        }

        return [
            'probability'     => $score,
            'prediction'      => $score >= 0.50 ? 1 : 0,
            'label'           => $label,
            'threshold'       => 0.50,
            'recommendations' => $recommendations,
        ];
    }
}
