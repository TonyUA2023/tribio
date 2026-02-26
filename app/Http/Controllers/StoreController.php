<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StoreController extends Controller
{
    /**
     * Datos base para todas las páginas de la tienda
     */
    protected function getStoreData(Account $account)
    {
        $profile = $account->profiles()->first();
        $profileData = $profile?->data ?? [];

        // Obtener categorías únicas de los productos
        $categories = Product::where('account_id', $account->id)
            ->where('available', true)
            ->select('category')
            ->distinct()
            ->get()
            ->map(function ($item, $index) {
                return [
                    'id' => $index + 1,
                    'name' => $item->category,
                    'slug' => \Illuminate\Support\Str::slug($item->category),
                    'products_count' => Product::where('account_id', request()->route('account')->id ?? 0)
                        ->where('category', $item->category)
                        ->where('available', true)
                        ->count(),
                ];
            });

        return [
            'config' => [
                'name' => $account->name,
                'slug' => $account->slug,
                'logo' => $profileData['profile_logo'] ?? $profileData['logo'] ?? null,
                'cover_image' => $profileData['cover_photo'] ?? null,
                'description' => $profileData['bio'] ?? null,
                'phone' => $profileData['phone'] ?? $account->phone ?? null,
                'email' => $account->email ?? null,
                'address' => $profileData['address'] ?? null,
                'social_links' => [
                    'whatsapp' => $profileData['whatsapp'] ?? $profileData['phone'] ?? null,
                    'instagram' => $profileData['instagram'] ?? null,
                    'facebook' => $profileData['facebook'] ?? null,
                    'tiktok' => $profileData['tiktok'] ?? null,
                ],
                'colors' => [
                    'primary' => $profileData['accent_color'] ?? $profileData['primary_color'] ?? '#f97316',
                    'secondary' => $profileData['secondary_color'] ?? '#1f2937',
                ],
                'currency' => 'PEN',
                'currency_symbol' => 'S/',
                'shipping_fee' => 10.00,
                'free_shipping_threshold' => 100.00,
                'business_hours' => $profileData['hours'] ?? 'Lun-Sab: 9am - 8pm',
                'meta_title' => $account->name . ' - Tienda Online',
                'meta_description' => $profileData['bio'] ?? 'Compra online los mejores productos',
            ],
            'categories' => $categories,
        ];
    }

    /**
     * Página principal de la tienda
     */
    public function home(string $accountSlug)
    {
        $account = Account::where('slug', $accountSlug)->firstOrFail();
        $storeData = $this->getStoreData($account);

        // Productos destacados
        $featuredProducts = Product::where('account_id', $account->id)
            ->where('available', true)
            ->where('featured', true)
            ->orderBy('sort_order')
            ->limit(10)
            ->get()
            ->map(fn($p) => $this->formatProduct($p, $account));

        // Productos nuevos (últimos 10)
        $newProducts = Product::where('account_id', $account->id)
            ->where('available', true)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn($p) => $this->formatProduct($p, $account));

        // Todos los productos (para tabs)
        $allProducts = Product::where('account_id', $account->id)
            ->where('available', true)
            ->orderBy('sort_order')
            ->get()
            ->map(fn($p) => $this->formatProduct($p, $account));

        return Inertia::render('Store/StoreHome', [
            'data' => array_merge($storeData, [
                'products' => $allProducts,
                'featured_products' => $featuredProducts,
                'new_products' => $newProducts,
                'banners' => [], // TODO: Implementar banners
            ]),
        ]);
    }

    /**
     * Página de catálogo / productos
     */
    public function catalog(Request $request, string $accountSlug, ?string $categorySlug = null)
    {
        $account = Account::where('slug', $accountSlug)->firstOrFail();
        $storeData = $this->getStoreData($account);

        // Query base
        $query = Product::where('account_id', $account->id)->where('available', true);

        // Filtrar por categoría
        $currentCategory = null;
        if ($categorySlug) {
            $categoryName = collect($storeData['categories'])
                ->firstWhere('slug', $categorySlug);

            if ($categoryName) {
                $query->where('category', $categoryName['name']);
                $currentCategory = $categoryName;
            }
        }

        // Filtros
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }
        if ($request->filled('in_stock')) {
            $query->where(function ($q) {
                $q->whereNull('stock')->orWhere('stock', '>', 0);
            });
        }
        if ($request->filled('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Ordenamiento
        switch ($request->input('sort', 'popular')) {
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'name':
                $query->orderBy('name', 'asc');
                break;
            default:
                $query->orderBy('featured', 'desc')->orderBy('sort_order');
        }

        // Paginación
        $perPage = 20;
        $products = $query->paginate($perPage);

        return Inertia::render('Store/StoreCatalog', [
            'data' => array_merge($storeData, [
                'products' => $products->items()
                    ? collect($products->items())->map(fn($p) => $this->formatProduct($p, $account))
                    : [],
                'current_category' => $currentCategory,
                'filters' => [
                    'category' => $categorySlug,
                    'min_price' => $request->min_price,
                    'max_price' => $request->max_price,
                    'sort_by' => $request->input('sort', 'popular'),
                    'search' => $request->q,
                    'in_stock' => $request->boolean('in_stock'),
                ],
                'pagination' => [
                    'current_page' => $products->currentPage(),
                    'total_pages' => $products->lastPage(),
                    'total_products' => $products->total(),
                    'per_page' => $perPage,
                ],
            ]),
        ]);
    }

    /**
     * Página de detalle de producto
     */
    public function product(string $accountSlug, string $productSlug)
    {
        $account = Account::where('slug', $accountSlug)->firstOrFail();
        $storeData = $this->getStoreData($account);

        // Buscar producto por ID o slug
        $product = Product::where('account_id', $account->id)
            ->where(function ($q) use ($productSlug) {
                $q->where('id', $productSlug)
                    ->orWhere('name', 'like', str_replace('-', '%', $productSlug));
            })
            ->firstOrFail();

        // Productos relacionados (misma categoría)
        $relatedProducts = Product::where('account_id', $account->id)
            ->where('category', $product->category)
            ->where('id', '!=', $product->id)
            ->where('available', true)
            ->limit(5)
            ->get()
            ->map(fn($p) => $this->formatProduct($p, $account));

        return Inertia::render('Store/StoreProductDetail', [
            'data' => array_merge($storeData, [
                'product' => $this->formatProduct($product, $account, true),
                'related_products' => $relatedProducts,
                'reviews' => [], // TODO: Implementar reviews de productos
            ]),
        ]);
    }

    /**
     * Página de checkout
     */
    public function checkout(string $accountSlug)
    {
        $account = Account::where('slug', $accountSlug)->firstOrFail();
        $storeData = $this->getStoreData($account);

        // Get authenticated customer data if logged in
        $customer = null;
        $user = Auth::user();

        if ($user) {
            $customerRecord = Customer::firstOrCreate(
                ['user_id' => $user->id, 'account_id' => $account->id],
                [
                    'name' => $user->name,
                    'email' => $user->email,
                ]
            );

            $customer = [
                'id' => $customerRecord->id,
                'name' => $customerRecord->name ?? $user->name,
                'email' => $customerRecord->email ?? $user->email,
                'phone' => $customerRecord->phone,
                'addresses' => $customerRecord->addresses ?? [],
            ];
        }

        // Determine which checkout template to use based on store template
        $storeTemplate = $account->store_template ?? 'default';
        $checkoutTemplate = 'Store/StoreCheckout';

        // Use Nike-style checkout for nike template
        if (in_array($storeTemplate, ['nike', 'nike_style', 'NikeStyleTemplate'])) {
            $checkoutTemplate = 'Store/NikeCheckout';
        }

        return Inertia::render($checkoutTemplate, [
            'data' => array_merge($storeData, [
                'customer' => $customer,
            ]),
        ]);
    }

    /**
     * Formatear producto para la respuesta
     */
    protected function formatProduct(Product $product, Account $account, bool $detailed = false): array
    {
        $data = [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => \Illuminate\Support\Str::slug($product->name) . '-' . $product->id,
            'description' => $product->description,
            'price' => (float) $product->price,
            'image' => $product->image ? (
                str_starts_with($product->image, 'http')
                    ? $product->image
                    : '/storage/' . $product->image
            ) : null,
            'category' => $product->category,
            'category_slug' => \Illuminate\Support\Str::slug($product->category),
            'available' => $product->available,
            'featured' => $product->featured ?? false,
            'stock' => $product->stock,
        ];

        if ($detailed) {
            $data['images'] = $product->image ? [$data['image']] : [];
            $data['options'] = $product->options ?? [];
            $data['sku'] = $product->sku ?? null;
        }

        return $data;
    }
}
