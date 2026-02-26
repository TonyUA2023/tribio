<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Customer;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class StoreDisplayController extends Controller
{
    /**
     * Página principal de la tienda
     */
    public function home(string $slug): Response
    {
        $account = $this->getAccountBySlug($slug);

        if (!$account) {
            abort(404, 'Tienda no encontrada');
        }

        $categories = $this->getCategories($account);
        $products = $this->getProducts($account);
        $featuredProducts = $this->getFeaturedProducts($account);
        $newProducts = $this->getNewProducts($account);
        $banners = $this->getBanners($account);
        $eventProducts = $this->getProductsByCategory($account, 'eventos');

        $storeConfig = $this->buildStoreConfig($account);

        return Inertia::render($this->getInertiaComponent($account), [
            'config' => $storeConfig,
            'categories' => $categories,
            'products' => $products,
            'featured_products' => $featuredProducts,
            'new_products' => $newProducts,
            'banners' => $banners,
            'event_products' => $eventProducts,
            'page_type' => 'home',
            'seo' => $this->buildSeoMetadata($account),
        ]);
    }

    /**
     * Catálogo de productos con filtros
     */
    public function catalog(Request $request, string $slug): Response
    {
        $account = $this->getAccountBySlug($slug);

        if (!$account) {
            abort(404, 'Tienda no encontrada');
        }

        $filters = $this->extractFilters($request);
        $products = $this->getFilteredProducts($account, $filters);
        $categories = $this->getCategories($account);
        $brands = $this->getBrands($account);

        // Obtener opciones de filtro
        $filterOptions = $this->getFilterOptions($account);

        return Inertia::render($this->getInertiaComponent($account), [
            'config' => $this->buildStoreConfig($account),
            'categories' => $categories,
            'brands' => $brands,
            'products' => $products,
            'filters' => $filters,
            'filter_options' => $filterOptions,
            'page_type' => 'catalog',
            'page_title' => 'Todos los Productos',
            'breadcrumbs' => [
                ['label' => 'Inicio', 'href' => "/{$account->slug}"],
                ['label' => 'Productos', 'href' => null],
            ],
            'seo' => $this->buildCatalogSeo($account, $filters),
        ]);
    }

    /**
     * Productos por categoría
     */
    public function category(Request $request, string $slug, string $categorySlug): Response
    {
        $account = $this->getAccountBySlug($slug);

        if (!$account) {
            abort(404, 'Tienda no encontrada');
        }

        $category = ProductCategory::where('account_id', $account->id)
            ->where('slug', $categorySlug)
            ->with('children')
            ->first();

        if (!$category) {
            abort(404, 'Categoría no encontrada');
        }

        $filters = $this->extractFilters($request);
        $filters['category_id'] = $category->id;

        $products = $this->getFilteredProducts($account, $filters);
        $subcategories = $category->children;
        $categories = $this->getCategories($account);
        $brands = $this->getBrands($account);

        return Inertia::render($this->getInertiaComponent($account), [
            'config' => $this->buildStoreConfig($account),
            'categories' => $categories,
            'brands' => $brands,
            'current_category' => $this->formatCategory($category),
            'subcategories' => $subcategories->map(fn($c) => $this->formatCategory($c)),
            'products' => $products,
            'filters' => $filters,
            'filter_options' => $this->getFilterOptions($account, $category->id),
            'page_type' => 'category',
            'page_title' => $category->name,
            'breadcrumbs' => $this->buildCategoryBreadcrumbs($account, $category),
            'seo' => $this->buildCategorySeo($account, $category),
        ]);
    }

    /**
     * Subcategoría (categoria/subcategoria)
     */
    public function subcategory(Request $request, string $slug, string $categorySlug, string $subcategorySlug): Response
    {
        $account = $this->getAccountBySlug($slug);

        if (!$account) {
            abort(404, 'Tienda no encontrada');
        }

        // Buscar la subcategoría
        $parentCategory = ProductCategory::where('account_id', $account->id)
            ->where('slug', $categorySlug)
            ->first();

        if (!$parentCategory) {
            abort(404, 'Categoría no encontrada');
        }

        $subcategory = ProductCategory::where('account_id', $account->id)
            ->where('parent_id', $parentCategory->id)
            ->where('slug', $subcategorySlug)
            ->with('children')
            ->first();

        if (!$subcategory) {
            abort(404, 'Subcategoría no encontrada');
        }

        $filters = $this->extractFilters($request);
        $filters['category_id'] = $subcategory->id;

        $products = $this->getFilteredProducts($account, $filters);
        $categories = $this->getCategories($account);
        $brands = $this->getBrands($account);

        return Inertia::render($this->getInertiaComponent($account), [
            'config' => $this->buildStoreConfig($account),
            'categories' => $categories,
            'brands' => $brands,
            'current_category' => $this->formatCategory($subcategory),
            'parent_category' => $this->formatCategory($parentCategory),
            'subcategories' => $subcategory->children->map(fn($c) => $this->formatCategory($c)),
            'products' => $products,
            'filters' => $filters,
            'filter_options' => $this->getFilterOptions($account, $subcategory->id),
            'page_type' => 'subcategory',
            'page_title' => $subcategory->name,
            'breadcrumbs' => $this->buildCategoryBreadcrumbs($account, $subcategory),
            'seo' => $this->buildCategorySeo($account, $subcategory),
        ]);
    }

    /**
     * Detalle de producto
     */
    public function product(string $slug, string $productSlug): Response
    {
        $account = $this->getAccountBySlug($slug);

        if (!$account) {
            abort(404, 'Tienda no encontrada');
        }

        // Buscar por slug; si no existe la columna o no hay coincidencia, intentar por nombre slugificado
        $product = Product::where('account_id', $account->id)
            ->where('available', true)
            ->where(function ($q) use ($productSlug) {
                $q->where('slug', $productSlug)
                  ->orWhereRaw("LOWER(REPLACE(REPLACE(name, ' ', '-'), '_', '-')) = ?", [$productSlug]);
            })
            ->with(['productCategory', 'brandRelation'])
            ->first();

        if (!$product) {
            abort(404, 'Producto no encontrado');
        }

        // Productos relacionados
        $relatedProducts = Product::where('account_id', $account->id)
            ->where('id', '!=', $product->id)
            ->where('available', true)
            ->when($product->product_category_id, function ($query) use ($product) {
                return $query->where('product_category_id', $product->product_category_id);
            })
            ->limit(8)
            ->get()
            ->map(fn($p) => $this->formatProduct($p));

        $categories = $this->getCategories($account);

        return Inertia::render($this->getInertiaComponent($account), [
            'config' => $this->buildStoreConfig($account),
            'categories' => $categories,
            'product' => $this->formatProductDetail($product),
            'related_products' => $relatedProducts,
            'reviews' => [],
            'breadcrumbs' => $this->buildProductBreadcrumbs($account, $product),
            'seo' => $this->buildProductSeo($account, $product),
            'page_type' => 'product',
        ]);
    }

    /**
     * Búsqueda de productos
     */
    public function search(Request $request, string $slug): Response
    {
        $account = $this->getAccountBySlug($slug);

        if (!$account) {
            abort(404, 'Tienda no encontrada');
        }

        $query = $request->get('q', '');
        $filters = $this->extractFilters($request);
        $filters['search'] = $query;

        $products = $this->getFilteredProducts($account, $filters);
        $categories = $this->getCategories($account);
        $brands = $this->getBrands($account);

        return Inertia::render($this->getInertiaComponent($account), [
            'config' => $this->buildStoreConfig($account),
            'categories' => $categories,
            'brands' => $brands,
            'products' => $products,
            'filters' => $filters,
            'search_query' => $query,
            'filter_options' => $this->getFilterOptions($account),
            'page_type' => 'search',
            'page_title' => "Resultados para \"{$query}\"",
            'breadcrumbs' => [
                ['label' => 'Inicio', 'href' => "/{$account->slug}"],
                ['label' => 'Búsqueda', 'href' => null],
            ],
            'seo' => [
                'title' => "Resultados para \"{$query}\" | {$account->name}",
                'description' => "Encuentra {$query} en {$account->name}. Explora nuestra selección de productos.",
            ],
        ]);
    }

    /**
     * Productos por género (hombre, mujer, niños)
     */
    public function gender(Request $request, string $slug, string $gender): Response
    {
        $account = $this->getAccountBySlug($slug);

        if (!$account) {
            abort(404, 'Tienda no encontrada');
        }

        $genderMap = [
            'hombre' => 'male',
            'mujer' => 'female',
            'ninos' => 'kids',
            'niños' => 'kids',
            'unisex' => 'unisex',
        ];

        $genderValue = $genderMap[$gender] ?? null;

        if (!$genderValue) {
            abort(404, 'Género no encontrado');
        }

        $filters = $this->extractFilters($request);
        $filters['gender'] = $genderValue;

        $products = $this->getFilteredProducts($account, $filters);
        $categories = $this->getCategories($account);
        $brands = $this->getBrands($account);

        $genderLabels = [
            'male' => 'Hombre',
            'female' => 'Mujer',
            'kids' => 'Niños',
            'unisex' => 'Unisex',
        ];

        return Inertia::render($this->getInertiaComponent($account), [
            'config' => $this->buildStoreConfig($account),
            'categories' => $categories,
            'brands' => $brands,
            'products' => $products,
            'filters' => $filters,
            'filter_options' => $this->getFilterOptions($account),
            'page_type' => 'gender',
            'page_title' => $genderLabels[$genderValue],
            'breadcrumbs' => [
                ['label' => 'Inicio', 'href' => "/{$account->slug}"],
                ['label' => $genderLabels[$genderValue], 'href' => null],
            ],
            'seo' => [
                'title' => "{$genderLabels[$genderValue]} | {$account->name}",
                'description' => "Explora nuestra colección para {$genderLabels[$genderValue]}. Encuentra los mejores productos en {$account->name}.",
            ],
        ]);
    }

    /**
     * Productos nuevos
     */
    public function newArrivals(Request $request, string $slug): Response
    {
        $account = $this->getAccountBySlug($slug);

        if (!$account) {
            abort(404, 'Tienda no encontrada');
        }

        $filters = $this->extractFilters($request);
        $filters['sort'] = 'newest';

        $products = Product::where('account_id', $account->id)
            ->where('available', true)
            ->where('created_at', '>=', now()->subDays(30))
            ->orderBy('created_at', 'desc')
            ->paginate(24)
            ->through(fn($p) => $this->formatProduct($p));

        $categories = $this->getCategories($account);

        return Inertia::render($this->getInertiaComponent($account), [
            'config' => $this->buildStoreConfig($account),
            'categories' => $categories,
            'products' => $products,
            'filters' => $filters,
            'filter_options' => $this->getFilterOptions($account),
            'page_type' => 'new',
            'page_title' => 'Lo Nuevo',
            'breadcrumbs' => [
                ['label' => 'Inicio', 'href' => "/{$account->slug}"],
                ['label' => 'Lo Nuevo', 'href' => null],
            ],
            'seo' => [
                'title' => "Lo Nuevo | {$account->name}",
                'description' => "Descubre las últimas novedades en {$account->name}. Nuevos productos agregados recientemente.",
            ],
        ]);
    }

    /**
     * Ofertas
     */
    public function offers(Request $request, string $slug): Response
    {
        $account = $this->getAccountBySlug($slug);

        if (!$account) {
            abort(404, 'Tienda no encontrada');
        }

        $filters = $this->extractFilters($request);

        $products = Product::where('account_id', $account->id)
            ->where('available', true)
            ->whereNotNull('compare_price')
            ->whereColumn('compare_price', '>', 'price')
            ->orderByRaw('(compare_price - price) / compare_price DESC')
            ->paginate(24)
            ->through(fn($p) => $this->formatProduct($p));

        $categories = $this->getCategories($account);

        return Inertia::render($this->getInertiaComponent($account), [
            'config' => $this->buildStoreConfig($account),
            'categories' => $categories,
            'products' => $products,
            'filters' => $filters,
            'filter_options' => $this->getFilterOptions($account),
            'page_type' => 'offers',
            'page_title' => 'Ofertas',
            'breadcrumbs' => [
                ['label' => 'Inicio', 'href' => "/{$account->slug}"],
                ['label' => 'Ofertas', 'href' => null],
            ],
            'seo' => [
                'title' => "Ofertas y Descuentos | {$account->name}",
                'description' => "Aprovecha las mejores ofertas y descuentos en {$account->name}. Productos con precios especiales.",
            ],
        ]);
    }

    /**
     * Productos por marca
     */
    public function brand(Request $request, string $slug, string $brandSlug): Response
    {
        $account = $this->getAccountBySlug($slug);

        if (!$account) {
            abort(404, 'Tienda no encontrada');
        }

        $brand = Brand::where('account_id', $account->id)
            ->where('slug', $brandSlug)
            ->first();

        if (!$brand) {
            abort(404, 'Marca no encontrada');
        }

        $filters = $this->extractFilters($request);
        $filters['brand_id'] = $brand->id;

        $products = $this->getFilteredProducts($account, $filters);
        $categories = $this->getCategories($account);

        return Inertia::render($this->getInertiaComponent($account), [
            'config' => $this->buildStoreConfig($account),
            'categories' => $categories,
            'products' => $products,
            'filters' => $filters,
            'filter_options' => $this->getFilterOptions($account),
            'current_brand' => [
                'id' => $brand->id,
                'name' => $brand->name,
                'slug' => $brand->slug,
                'logo' => $brand->logo,
                'description' => $brand->description,
            ],
            'page_type' => 'brand',
            'page_title' => $brand->name,
            'breadcrumbs' => [
                ['label' => 'Inicio', 'href' => "/{$account->slug}"],
                ['label' => 'Marcas', 'href' => "/{$account->slug}/productos"],
                ['label' => $brand->name, 'href' => null],
            ],
            'seo' => [
                'title' => "{$brand->name} | {$account->name}",
                'description' => $brand->description ?? "Explora todos los productos {$brand->name} en {$account->name}.",
                'image' => $brand->logo,
            ],
        ]);
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    protected function getAccountBySlug(string $slug): ?Account
    {
        return Account::where('slug', $slug)
            ->with(['businessType', 'storeTemplate'])
            ->first();
    }

    /**
     * Determina el componente Inertia a renderizar según la plantilla del account.
     */
    protected function getInertiaComponent(Account $account): string
    {
        $template = $account->relationLoaded('storeTemplate') ? $account->storeTemplate : $account->storeTemplate()->first();

        if ($template && $template->slug === 'valentine-gifts') {
            return 'Store/templates/ValentineTemplate';
        }

        return 'Store/templates/NikeStyleTemplate';
    }

    protected function buildStoreConfig(Account $account): array
    {
        // Obtener la configuración de tienda desde el campo store_template_config
        $editorConfig = $account->store_template_config ?? [];

        // Si es string, decodificar JSON
        if (is_string($editorConfig)) {
            $editorConfig = json_decode($editorConfig, true) ?? [];
        }

        // DEBUG: Log para verificar la configuración
        \Log::info('=== DEBUG STORE CONFIG ===');
        \Log::info('Account ID: ' . $account->id);
        \Log::info('Account Slug: ' . $account->slug);
        \Log::info('store_template_config raw: ', ['config' => $account->store_template_config]);
        \Log::info('topBarText: ' . ($editorConfig['topBarText'] ?? 'NO EXISTE'));
        \Log::info('topBarEnabled: ' . ($editorConfig['topBarEnabled'] ?? 'NO EXISTE'));
        \Log::info('=== FIN DEBUG ===');

        // Mapear la configuración del editor al formato que espera el template
        $templateConfig = $this->mapEditorConfigToTemplateConfig($editorConfig);

        // Usar valores de la configuración si existen, sino usar los valores de la cuenta
        return [
            'id' => $account->id,
            'slug' => $account->slug,
            'name' => $editorConfig['brandName'] ?? $account->name,
            'description' => $editorConfig['description'] ?? $account->description,
            'logo' => $editorConfig['logo'] ?? $account->logo_url,
            'logo_dark' => $editorConfig['logoDark'] ?? $account->logo_url,
            'phone' => $editorConfig['phone'] ?? $account->phone,
            'whatsapp' => $editorConfig['whatsapp'] ?? $account->whatsapp,
            'email' => $editorConfig['email'] ?? $account->user?->email,
            'address' => $editorConfig['address'] ?? $account->address,
            'currency_symbol' => 'S/',
            'social_links' => [
                'instagram' => $editorConfig['instagram'] ?? $account->instagram,
                'facebook' => $editorConfig['facebook'] ?? $account->facebook,
                'tiktok' => $editorConfig['tiktok'] ?? $account->tiktok,
                'youtube' => $editorConfig['youtube'] ?? null,
                'twitter' => $editorConfig['twitter'] ?? null,
            ],
            'template_config' => $templateConfig,
        ];
    }

    /**
     * Mapear la configuración del editor al formato que espera el template NikeStyle
     */
    protected function mapEditorConfigToTemplateConfig(array $editorConfig): array
    {
        return [
            // Navigation
            'navigation' => [
                'topBar' => [
                    'enabled' => $editorConfig['topBarEnabled'] ?? true,
                    'content' => $editorConfig['topBarText'] ?? 'Envío gratis en compras mayores a S/199',
                    'links' => $editorConfig['topBarLinks'] ?? [],
                ],
                'showSearch' => $editorConfig['showSearch'] ?? true,
                'showWishlist' => $editorConfig['showWishlist'] ?? true,
                'showCart' => $editorConfig['showCart'] ?? true,
                'mainMenu' => $editorConfig['mainMenu'] ?? [],
            ],

            // Hero
            'hero' => [
                'type' => $editorConfig['heroType'] ?? 'slider',
                'autoplay' => $editorConfig['heroAutoplay'] ?? true,
                'autoplaySpeed' => $editorConfig['heroAutoplaySpeed'] ?? 5000,
                'showArrows' => $editorConfig['heroShowArrows'] ?? true,
                'showDots' => $editorConfig['heroShowDots'] ?? true,
                'height' => [
                    'desktop' => $editorConfig['heroHeight'] ?? '85vh',
                    'mobile' => '70vh',
                ],
            ],

            // Features
            'features' => array_map(function ($feature) {
                return [
                    'icon' => $feature['icon'] ?? '✨',
                    'iconType' => 'emoji',
                    'title' => $feature['title'] ?? '',
                    'description' => $feature['description'] ?? '',
                ];
            }, $editorConfig['features'] ?? []),

            // Footer
            'footer' => [
                'backgroundColor' => $editorConfig['footerBackgroundColor'] ?? '#111111',
                'textColor' => $editorConfig['footerTextColor'] ?? '#ffffff',
                'showSocialLinks' => $editorConfig['footerShowSocial'] ?? true,
                'showNewsletter' => $editorConfig['footerShowNewsletter'] ?? true,
                'columns' => array_map(function ($col) {
                    return [
                        'title' => $col['title'] ?? '',
                        'links' => $col['links'] ?? [],
                    ];
                }, $editorConfig['footerColumns'] ?? []),
                'bottomBar' => [
                    'copyright' => $editorConfig['footerCopyright'] ?? '© 2024 Mi Tienda. Todos los derechos reservados.',
                    'links' => [],
                ],
            ],

            // Colors
            'colors' => [
                'primary' => $editorConfig['primaryColor'] ?? '#111111',
                'secondary' => $editorConfig['secondaryColor'] ?? '#757575',
                'accent' => $editorConfig['accentColor'] ?? '#ff6b35',
                'background' => $editorConfig['backgroundColor'] ?? '#ffffff',
                'text' => [
                    'primary' => $editorConfig['textColor'] ?? '#111111',
                ],
            ],

            // Promo Banners
            'promoBanners' => $editorConfig['promoBanners'] ?? [],

            // Product Sections
            'productSections' => $editorConfig['productSections'] ?? [],
        ];
    }

    protected function getCategories(Account $account): \Illuminate\Support\Collection
    {
        return ProductCategory::where('account_id', $account->id)
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->ordered()
            ->with(['children' => function ($query) {
                $query->where('is_active', true)->ordered();
            }])
            ->get()
            ->map(fn($c) => $this->formatCategory($c));
    }

    protected function getBrands(Account $account): \Illuminate\Support\Collection
    {
        return Brand::where('account_id', $account->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn($b) => [
                'id' => $b->id,
                'name' => $b->name,
                'slug' => $b->slug,
                'logo' => $b->logo,
            ]);
    }

    protected function getProducts(Account $account, int $limit = 20): \Illuminate\Support\Collection
    {
        return Product::where('account_id', $account->id)
            ->where('available', true)
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn($p) => $this->formatProduct($p));
    }

    protected function getFeaturedProducts(Account $account, int $limit = 8): \Illuminate\Support\Collection
    {
        return Product::where('account_id', $account->id)
            ->where('available', true)
            ->where('featured', true)
            ->orderBy('sort_order')
            ->limit($limit)
            ->get()
            ->map(fn($p) => $this->formatProduct($p));
    }

    protected function getNewProducts(Account $account, int $limit = 8): \Illuminate\Support\Collection
    {
        return Product::where('account_id', $account->id)
            ->where('available', true)
            ->where('created_at', '>=', now()->subDays(30))
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn($p) => $this->formatProduct($p));
    }

    protected function getProductsByCategory(Account $account, string $categorySlugOrName, int $limit = 12): \Illuminate\Support\Collection
    {
        // Buscar por slug o nombre (case-insensitive) en categorías
        $category = ProductCategory::where('account_id', $account->id)
            ->where('is_active', true)
            ->where(function ($q) use ($categorySlugOrName) {
                $q->where('slug', $categorySlugOrName)
                  ->orWhereRaw('LOWER(name) LIKE ?', ['%' . strtolower($categorySlugOrName) . '%']);
            })
            ->first();

        if (!$category) {
            return collect();
        }

        // Incluir productos de subcategorías también
        $categoryIds = [$category->id];
        $children = ProductCategory::where('account_id', $account->id)
            ->where('parent_id', $category->id)
            ->where('is_active', true)
            ->pluck('id');
        $categoryIds = array_merge($categoryIds, $children->toArray());

        return Product::where('account_id', $account->id)
            ->where('available', true)
            ->whereIn('product_category_id', $categoryIds)
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn($p) => $this->formatProduct($p));
    }

    protected function getFilteredProducts(Account $account, array $filters)
    {
        $query = Product::where('account_id', $account->id)
            ->where('available', true);

        // Filtro por búsqueda
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Filtro por categoría (incluyendo subcategorías)
        if (!empty($filters['category_id'])) {
            $categoryIds = $this->getCategoryAndDescendantIds($filters['category_id']);
            $query->whereIn('product_category_id', $categoryIds);
        }

        // Filtro por marca (único o múltiple)
        if (!empty($filters['brand_id'])) {
            $query->where('brand_id', $filters['brand_id']);
        }
        if (!empty($filters['brands']) && is_array($filters['brands'])) {
            $query->whereIn('brand_id', $filters['brands']);
        }

        // Filtro por género (único o múltiple)
        if (!empty($filters['gender'])) {
            $query->where('gender', $filters['gender']);
        }
        if (!empty($filters['genders']) && is_array($filters['genders'])) {
            $query->whereIn('gender', $filters['genders']);
        }

        // Filtro por condición (único o múltiple)
        if (!empty($filters['condition'])) {
            $query->where('condition', $filters['condition']);
        }
        if (!empty($filters['conditions']) && is_array($filters['conditions'])) {
            $query->whereIn('condition', $filters['conditions']);
        }

        // Filtro por tallas (búsqueda en JSON variants)
        if (!empty($filters['sizes']) && is_array($filters['sizes'])) {
            $query->where(function ($q) use ($filters) {
                foreach ($filters['sizes'] as $size) {
                    $q->orWhereRaw("JSON_SEARCH(variants, 'one', ?, NULL, '$[*].attributes.Talla') IS NOT NULL", [$size])
                      ->orWhereRaw("JSON_SEARCH(variants, 'one', ?, NULL, '$[*].attributes.Size') IS NOT NULL", [$size]);
                }
            });
        }

        // Filtro por colores (búsqueda en JSON variants)
        if (!empty($filters['colors']) && is_array($filters['colors'])) {
            $query->where(function ($q) use ($filters) {
                foreach ($filters['colors'] as $color) {
                    $q->orWhereRaw("JSON_SEARCH(variants, 'one', ?, NULL, '$[*].attributes.Color') IS NOT NULL", [$color]);
                }
            });
        }

        // Filtro por precio
        if (!empty($filters['min_price'])) {
            $query->where('price', '>=', $filters['min_price']);
        }
        if (!empty($filters['max_price'])) {
            $query->where('price', '<=', $filters['max_price']);
        }

        // Filtro por descuento
        if (!empty($filters['on_sale'])) {
            $query->whereNotNull('compare_price')
                  ->whereColumn('compare_price', '>', 'price');
        }

        // Filtros de especificaciones
        if (!empty($filters['deporte'])) {
            $query->whereRaw("JSON_EXTRACT(specifications, '$.deporte') = ?", [$filters['deporte']]);
        }
        if (!empty($filters['coleccion'])) {
            $query->whereRaw("JSON_EXTRACT(specifications, '$.coleccion') = ?", [$filters['coleccion']]);
        }
        if (!empty($filters['tipo'])) {
            $query->whereRaw("JSON_EXTRACT(specifications, '$.tipo') = ?", [$filters['tipo']]);
        }
        if (!empty($filters['material'])) {
            $query->whereRaw("JSON_EXTRACT(specifications, '$.material') = ?", [$filters['material']]);
        }

        // Ordenamiento
        $sort = $filters['sort'] ?? 'featured';
        switch ($sort) {
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;
            case 'best_selling':
                $query->orderBy('sales_count', 'desc');
                break;
            default:
                $query->orderBy('featured', 'desc')
                      ->orderBy('sort_order')
                      ->orderBy('created_at', 'desc');
        }

        return $query->paginate(24)->through(fn($p) => $this->formatProduct($p));
    }

    /**
     * Obtener IDs de categoría y sus descendientes
     */
    protected function getCategoryAndDescendantIds(int $categoryId): array
    {
        $category = ProductCategory::find($categoryId);
        if (!$category) {
            return [$categoryId];
        }

        $ids = [$categoryId];
        $this->collectDescendantIds($category, $ids);

        return $ids;
    }

    /**
     * Recolectar IDs de descendientes recursivamente
     */
    protected function collectDescendantIds(ProductCategory $category, array &$ids): void
    {
        $children = ProductCategory::where('parent_id', $category->id)->get();
        foreach ($children as $child) {
            $ids[] = $child->id;
            $this->collectDescendantIds($child, $ids);
        }
    }

    protected function extractFilters(Request $request): array
    {
        return [
            'search' => $request->get('search'),
            'category_id' => $request->get('category'),
            // Soporte para array de marcas
            'brand_id' => $request->get('brand'),
            'brands' => $request->get('brands', []),
            // Soporte para array de géneros
            'gender' => $request->get('gender'),
            'genders' => $request->get('genders', []),
            // Soporte para array de condiciones
            'condition' => $request->get('condition'),
            'conditions' => $request->get('conditions', []),
            // Tallas (array)
            'sizes' => $request->get('sizes', []),
            // Colores (array)
            'colors' => $request->get('colors', []),
            // Precio
            'min_price' => $request->get('min_price'),
            'max_price' => $request->get('max_price'),
            // Descuento
            'on_sale' => $request->boolean('on_sale'),
            // Especificaciones
            'deporte' => $request->get('deporte'),
            'coleccion' => $request->get('coleccion'),
            'tipo' => $request->get('tipo'),
            'material' => $request->get('material'),
            // Ordenamiento
            'sort' => $request->get('sort', 'featured'),
        ];
    }

    protected function getFilterOptions(Account $account, ?int $categoryId = null): array
    {
        $query = Product::where('account_id', $account->id)
            ->where('available', true);

        if ($categoryId) {
            $query->where('product_category_id', $categoryId);
        }

        $products = $query->get();

        // Rango de precios
        $priceRange = [
            'min' => (float) ($products->min('price') ?? 0),
            'max' => (float) ($products->max('price') ?? 1000),
        ];

        // Géneros disponibles con conteo
        $genders = $products
            ->whereNotNull('gender')
            ->groupBy('gender')
            ->map(fn($items, $gender) => [
                'value' => $gender,
                'label' => match($gender) {
                    'male' => 'Hombre',
                    'female' => 'Mujer',
                    'kids' => 'Niños',
                    'unisex' => 'Unisex',
                    default => ucfirst($gender),
                },
                'count' => $items->count(),
            ])
            ->values();

        // Condiciones disponibles con conteo
        $conditions = $products
            ->whereNotNull('condition')
            ->groupBy('condition')
            ->map(fn($items, $condition) => [
                'value' => $condition,
                'label' => match($condition) {
                    'new' => 'Nuevo',
                    'used' => 'Usado',
                    'refurbished' => 'Reacondicionado',
                    default => ucfirst($condition),
                },
                'count' => $items->count(),
            ])
            ->values();

        // Marcas disponibles con conteo
        $brands = $this->extractBrandsWithCount($account, $products);

        // Tallas desde variantes JSON
        $sizes = $this->extractSizesFromVariants($products);

        // Colores desde variantes JSON
        $colors = $this->extractColorsFromVariants($products);

        // Especificaciones dinámicas
        $specifications = $this->extractSpecifications($products);

        // Productos en oferta
        $onSaleCount = $products
            ->filter(fn($p) => $p->compare_price && $p->compare_price > $p->price)
            ->count();

        return [
            'price_range' => $priceRange,
            'genders' => $genders,
            'conditions' => $conditions,
            'brands' => $brands,
            'sizes' => $sizes,
            'colors' => $colors,
            'specifications' => $specifications,
            'on_sale_count' => $onSaleCount,
        ];
    }

    /**
     * Extraer marcas con conteo de productos
     */
    protected function extractBrandsWithCount(Account $account, $products): \Illuminate\Support\Collection
    {
        $brandIds = $products->whereNotNull('brand_id')->pluck('brand_id')->unique();

        if ($brandIds->isEmpty()) {
            return collect();
        }

        $brands = Brand::whereIn('id', $brandIds)->get();
        $brandCounts = $products->whereNotNull('brand_id')->groupBy('brand_id');

        return $brands->map(fn($brand) => [
            'id' => $brand->id,
            'name' => $brand->name,
            'slug' => $brand->slug,
            'logo' => $brand->logo,
            'count' => $brandCounts->get($brand->id)?->count() ?? 0,
        ])->sortByDesc('count')->values();
    }

    /**
     * Extraer tallas desde las variantes JSON
     */
    protected function extractSizesFromVariants($products): array
    {
        $sizeCounts = [];

        foreach ($products as $product) {
            if (!$product->has_variants || empty($product->variants)) {
                continue;
            }

            foreach ($product->variants as $variant) {
                $size = $variant['attributes']['Talla'] ?? $variant['attributes']['Size'] ?? null;
                if ($size) {
                    $sizeCounts[$size] = ($sizeCounts[$size] ?? 0) + 1;
                }
            }
        }

        // Ordenar tallas de forma lógica (XS, S, M, L, XL, XXL, numéricas)
        $sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
        uksort($sizeCounts, function ($a, $b) use ($sizeOrder) {
            $posA = array_search($a, $sizeOrder);
            $posB = array_search($b, $sizeOrder);

            // Si ambos están en el orden predefinido
            if ($posA !== false && $posB !== false) {
                return $posA - $posB;
            }

            // Si solo uno está en el orden predefinido
            if ($posA !== false) return -1;
            if ($posB !== false) return 1;

            // Para tallas numéricas
            if (is_numeric($a) && is_numeric($b)) {
                return (float)$a - (float)$b;
            }

            // Orden alfabético por defecto
            return strcmp($a, $b);
        });

        $sizes = [];
        foreach ($sizeCounts as $size => $count) {
            $sizes[] = [
                'value' => $size,
                'count' => $count,
            ];
        }

        return $sizes;
    }

    /**
     * Extraer colores desde las variantes JSON
     */
    protected function extractColorsFromVariants($products): array
    {
        $colorCounts = [];

        foreach ($products as $product) {
            if (!$product->has_variants || empty($product->variants)) {
                continue;
            }

            foreach ($product->variants as $variant) {
                $colorName = $variant['attributes']['Color'] ?? null;
                if ($colorName) {
                    if (!isset($colorCounts[$colorName])) {
                        $colorCounts[$colorName] = [
                            'name' => $colorName,
                            'hex' => $this->colorNameToHex($colorName) ?? '#888888',
                            'count' => 0,
                        ];
                    }
                    $colorCounts[$colorName]['count']++;
                }
            }
        }

        return array_values($colorCounts);
    }

    /**
     * Extraer especificaciones dinámicas de los productos
     */
    protected function extractSpecifications($products): array
    {
        $specs = [
            'deportes' => [],
            'colecciones' => [],
            'tipos' => [],
            'materiales' => [],
        ];

        foreach ($products as $product) {
            if (empty($product->specifications)) {
                continue;
            }

            $productSpecs = is_array($product->specifications)
                ? $product->specifications
                : json_decode($product->specifications, true) ?? [];

            // Deporte
            if (isset($productSpecs['deporte'])) {
                $value = $productSpecs['deporte'];
                $specs['deportes'][$value] = ($specs['deportes'][$value] ?? 0) + 1;
            }

            // Colección
            if (isset($productSpecs['coleccion'])) {
                $value = $productSpecs['coleccion'];
                $specs['colecciones'][$value] = ($specs['colecciones'][$value] ?? 0) + 1;
            }

            // Tipo
            if (isset($productSpecs['tipo'])) {
                $value = $productSpecs['tipo'];
                $specs['tipos'][$value] = ($specs['tipos'][$value] ?? 0) + 1;
            }

            // Material
            if (isset($productSpecs['material'])) {
                $value = $productSpecs['material'];
                $specs['materiales'][$value] = ($specs['materiales'][$value] ?? 0) + 1;
            }
        }

        // Convertir a arrays con count
        $result = [];
        foreach ($specs as $key => $values) {
            if (!empty($values)) {
                $result[$key] = [];
                foreach ($values as $value => $count) {
                    $result[$key][] = ['value' => $value, 'count' => $count];
                }
                // Ordenar por conteo descendente
                usort($result[$key], fn($a, $b) => $b['count'] - $a['count']);
            }
        }

        return $result;
    }

    protected function getBanners(Account $account): array
    {
        // Obtener banners desde el campo store_template_config
        $config = $account->store_template_config ?? [];

        // Si es string, decodificar JSON
        if (is_string($config)) {
            $config = json_decode($config, true) ?? [];
        }

        if (empty($config)) {
            return [];
        }

        // Obtener los slides del hero
        $heroSlides = $config['heroSlides'] ?? [];

        return array_map(function ($slide, $index) {
            return [
                'id' => $index + 1,
                'image' => $slide['image'] ?? '',
                'image_mobile' => $slide['imageMobile'] ?? null,
                'title' => $slide['title'] ?? null,
                'subtitle' => $slide['subtitle'] ?? null,
                'cta_text' => $slide['ctaText'] ?? null,
                'cta_link' => $slide['ctaLink'] ?? null,
                'position' => $slide['position'] ?? 'center',
            ];
        }, $heroSlides, array_keys($heroSlides));
    }

    protected function formatCategory(ProductCategory $category): array
    {
        return [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
            'image' => $category->image,
            'products_count' => $category->products()->count(),
            'children' => $category->relationLoaded('children')
                ? $category->children->map(fn($c) => $this->formatCategory($c))->toArray()
                : [],
        ];
    }

    protected function formatProduct(Product $product): array
    {
        // Categoría: priorizar relación cargada, luego campo de texto
        $categoryName = $product->relationLoaded('productCategory') && $product->productCategory
            ? $product->productCategory->name
            : $product->category;
        $categorySlug = $product->relationLoaded('productCategory') && $product->productCategory
            ? $product->productCategory->slug
            : null;

        // Marca: priorizar relación cargada, luego campo de texto
        $brandName = $product->relationLoaded('brandRelation') && $product->brandRelation
            ? $product->brandRelation->name
            : $product->brand;

        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug ?? \Illuminate\Support\Str::slug($product->name),
            'price' => (float) $product->price,
            'compare_price' => $product->compare_price ? (float) $product->compare_price : null,
            'image' => $product->image,
            'images' => $product->images ?? [],
            'category' => $categoryName,
            'category_slug' => $categorySlug,
            'brand' => $brandName,
            'gender' => $product->gender,
            'is_new' => $product->created_at >= now()->subDays(30),
            'is_featured' => (bool) $product->featured,
            'has_variants' => (bool) $product->has_variants,
            'colors' => $this->extractProductColors($product),
        ];
    }

    protected function formatProductDetail(Product $product): array
    {
        return [
            ...$this->formatProduct($product),
            'description' => $product->description,
            'short_description' => $product->short_description,
            'specifications' => $product->specifications ?? [],
            'options' => $product->options ?? [],
            'variants' => $product->variants ?? [],
            'variant_attributes' => $product->variant_attributes ?? [],
            'sku' => $product->sku,
            'stock' => $product->stock,
            'weight' => $product->weight,
            'condition' => $product->condition,
            'condition_label' => $product->condition_label,
            'origin_country' => $product->origin_country,
        ];
    }

    protected function extractProductColors(Product $product): array
    {
        if (!$product->has_variants || empty($product->variants)) {
            return [];
        }

        $colors = [];
        foreach ($product->variants as $variant) {
            if (isset($variant['attributes']['Color'])) {
                $colorName = $variant['attributes']['Color'];
                // Mapear nombres de colores a hexadecimales
                $colorHex = $this->colorNameToHex($colorName);
                if ($colorHex && !in_array($colorHex, $colors)) {
                    $colors[] = $colorHex;
                }
            }
        }

        return $colors;
    }

    protected function colorNameToHex(string $colorName): ?string
    {
        $colorMap = [
            'Negro' => '#000000',
            'Blanco' => '#FFFFFF',
            'Gris' => '#6B7280',
            'Rojo' => '#EF4444',
            'Azul' => '#3B82F6',
            'Verde' => '#22C55E',
            'Amarillo' => '#EAB308',
            'Naranja' => '#F97316',
            'Morado' => '#A855F7',
            'Rosa' => '#EC4899',
            'Marrón' => '#92400E',
            'Beige' => '#D4C4A8',
            'Dorado' => '#D4AF37',
            'Plateado' => '#C0C0C0',
        ];

        return $colorMap[$colorName] ?? null;
    }

    protected function buildCategoryBreadcrumbs(Account $account, ProductCategory $category): array
    {
        $breadcrumbs = [
            ['label' => 'Inicio', 'href' => "/{$account->slug}"],
        ];

        // Agregar ancestros
        $ancestors = [];
        $parent = $category->parent;
        while ($parent) {
            array_unshift($ancestors, $parent);
            $parent = $parent->parent;
        }

        foreach ($ancestors as $ancestor) {
            $breadcrumbs[] = [
                'label' => $ancestor->name,
                'href' => "/{$account->slug}/categoria/{$ancestor->slug}",
            ];
        }

        $breadcrumbs[] = [
            'label' => $category->name,
            'href' => null,
        ];

        return $breadcrumbs;
    }

    protected function buildProductBreadcrumbs(Account $account, Product $product): array
    {
        $breadcrumbs = [
            ['label' => 'Inicio', 'href' => "/{$account->slug}"],
            ['label' => 'Productos', 'href' => "/{$account->slug}/productos"],
        ];

        if ($product->category) {
            $breadcrumbs[] = [
                'label' => $product->category->name,
                'href' => "/{$account->slug}/categoria/{$product->category->slug}",
            ];
        }

        $breadcrumbs[] = [
            'label' => $product->name,
            'href' => null,
        ];

        return $breadcrumbs;
    }

    // ============================================
    // SEO METHODS
    // ============================================

    protected function buildSeoMetadata(Account $account): array
    {
        $baseUrl = "https://tribio.info/{$account->slug}";

        return [
            'title' => $account->name,
            'description' => $account->description ?? "Tienda oficial de {$account->name}. Encuentra los mejores productos.",
            'keywords' => implode(', ', [$account->name, 'tienda online', 'compras', 'productos']),
            'url' => $baseUrl,
            'image' => $account->logo_url ? url($account->logo_url) : null,
            'type' => 'website',
            'site_name' => $account->name,
            'structured_data' => $this->buildOrganizationSchema($account),
        ];
    }

    protected function buildCatalogSeo(Account $account, array $filters): array
    {
        $title = "Productos | {$account->name}";
        $description = "Explora todos los productos de {$account->name}. Gran variedad y los mejores precios.";

        return [
            'title' => $title,
            'description' => $description,
            'url' => "https://tribio.info/{$account->slug}/productos",
        ];
    }

    protected function buildCategorySeo(Account $account, ProductCategory $category): array
    {
        return [
            'title' => "{$category->name} | {$account->name}",
            'description' => $category->description ?? "Explora {$category->name} en {$account->name}. Los mejores productos y precios.",
            'url' => "https://tribio.info/{$account->slug}/categoria/{$category->slug}",
            'image' => $category->image ? url($category->image) : null,
        ];
    }

    protected function buildProductSeo(Account $account, Product $product): array
    {
        $description = $product->short_description ?? $product->description ?? "{$product->name} disponible en {$account->name}";

        return [
            'title' => "{$product->name} | {$account->name}",
            'description' => \Illuminate\Support\Str::limit(strip_tags($description), 160),
            'url' => "https://tribio.info/{$account->slug}/producto/{$product->slug}",
            'image' => $product->image ? url($product->image) : null,
            'structured_data' => $this->buildProductSchema($account, $product),
        ];
    }

    protected function buildOrganizationSchema(Account $account): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            'name' => $account->name,
            'url' => "https://tribio.info/{$account->slug}",
            'logo' => $account->logo_url ? url($account->logo_url) : null,
            'description' => $account->description,
            'contactPoint' => [
                '@type' => 'ContactPoint',
                'telephone' => $account->phone,
                'contactType' => 'customer service',
            ],
        ];
    }

    protected function buildProductSchema(Account $account, Product $product): array
    {
        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'Product',
            'name' => $product->name,
            'description' => $product->description,
            'image' => $product->image ? url($product->image) : null,
            'sku' => $product->sku,
            'brand' => [
                '@type' => 'Brand',
                'name' => $product->brand ?? $account->name,
            ],
            'offers' => [
                '@type' => 'Offer',
                'url' => "https://tribio.info/{$account->slug}/producto/{$product->slug}",
                'priceCurrency' => 'PEN',
                'price' => $product->price,
                'availability' => $product->stock > 0
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock',
                'seller' => [
                    '@type' => 'Organization',
                    'name' => $account->name,
                ],
            ],
        ];

        if ($product->compare_price && $product->compare_price > $product->price) {
            $schema['offers']['priceValidUntil'] = now()->addDays(30)->format('Y-m-d');
        }

        return $schema;
    }

    /**
     * Checkout page - rendered within the NikeStyleTemplate
     */
    public function checkout(string $slug): Response
    {
        $account = $this->getAccountBySlug($slug);

        if (!$account) {
            abort(404, 'Tienda no encontrada');
        }

        $categories = $this->getCategories($account);
        $storeConfig = $this->buildStoreConfig($account);

        // Get authenticated customer data if logged in (any Tribio user can buy)
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

        // Get Culqi public key from account's payment settings (fallback to global)
        $paymentSettings = $account->payment_settings ?? [];
        $culqiSettings = $paymentSettings['culqi'] ?? [];
        $culqiEnabled = !empty($culqiSettings['enabled']) && !empty($culqiSettings['public_key']);
        $culqiPublicKey = $culqiEnabled
            ? $culqiSettings['public_key']
            : config('services.culqi.public_key');

        return Inertia::render($this->getInertiaComponent($account), [
            'config' => $storeConfig,
            'categories' => $categories,
            'products' => [],
            'featured_products' => [],
            'new_products' => [],
            'banners' => [],
            'page_type' => 'checkout',
            'customer' => $customer,
            'culqi_public_key' => $culqiPublicKey,
            'seo' => [
                'title' => 'Checkout | ' . ($storeConfig['name'] ?? $account->name),
                'description' => 'Completa tu compra',
            ],
        ]);
    }
}
