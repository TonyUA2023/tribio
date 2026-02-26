/**
 * Página de Catálogo/Productos - Estilo Nike con filtros avanzados
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import {
  Grid3X3,
  LayoutGrid,
  SlidersHorizontal,
  X,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { StoreProvider, useStore } from './context/StoreContext';
import { StoreHeader } from './components/StoreHeader';
import { StoreFooter } from './components/StoreFooter';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import FilterSidebar from './components/FilterSidebar';
import ActiveFiltersBar from './components/ActiveFiltersBar';
import type { FilterOptions, ActiveFilters, Category, Breadcrumb, SORT_OPTIONS } from './types/filters';

// ============================================
// TYPES
// ============================================
interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  compare_price?: number;
  image: string;
  images?: string[];
  category?: string;
  category_slug?: string;
  brand?: string;
  gender?: string;
  is_new?: boolean;
  is_featured?: boolean;
  has_variants?: boolean;
  colors?: string[];
}

interface StoreConfig {
  id: number;
  slug: string;
  name: string;
  description?: string;
  logo?: string;
  phone?: string;
  whatsapp?: string;
  currency_symbol?: string;
  social_links?: {
    whatsapp?: string;
  };
  template_config?: any;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface CatalogPageProps {
  config: StoreConfig;
  categories: Category[];
  brands?: { id: number; name: string; slug: string; logo?: string }[];
  products: {
    data: Product[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  current_category?: Category;
  parent_category?: Category;
  subcategories?: Category[];
  filters: ActiveFilters;
  filter_options: FilterOptions;
  breadcrumbs?: Breadcrumb[];
  page_title?: string;
  search_query?: string;
  current_brand?: { id: number; name: string; slug: string; logo?: string; description?: string };
  seo?: {
    title?: string;
    description?: string;
  };
}

// ============================================
// SORT OPTIONS
// ============================================
const SORT_OPTIONS_LIST = [
  { value: 'featured', label: 'Destacados' },
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'name_asc', label: 'Nombre: A-Z' },
  { value: 'name_desc', label: 'Nombre: Z-A' },
];

// ============================================
// SORT DROPDOWN COMPONENT
// ============================================
interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentOption = SORT_OPTIONS_LIST.find((opt) => opt.value === value) || SORT_OPTIONS_LIST[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg
                   text-sm font-medium text-gray-700 hover:border-gray-300 transition-colors"
      >
        <span className="hidden sm:inline">Ordenar por:</span>
        <span>{currentOption.label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 z-20 py-1">
            {SORT_OPTIONS_LIST.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  value === option.value
                    ? 'bg-gray-100 text-black font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================
// MAIN CATALOG CONTENT
// ============================================
function StoreCatalogContent() {
  const pageProps = usePage<CatalogPageProps>().props;

  const {
    config,
    categories,
    brands,
    products,
    current_category,
    parent_category,
    subcategories,
    filters: initialFilters,
    filter_options,
    breadcrumbs: propsBreadcrumbs,
    page_title,
    search_query,
    current_brand,
    seo,
  } = pageProps;

  const { formatPrice, isCartOpen, setIsCartOpen } = useStore();

  const [showFilters, setShowFilters] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid-3' | 'grid-2'>('grid-3');
  const [filters, setFilters] = useState<ActiveFilters>(initialFilters);
  const [searchInput, setSearchInput] = useState(search_query || '');

  // Productos paginados
  const productsList = products?.data || [];
  const pagination: PaginationData = {
    current_page: products?.current_page || 1,
    last_page: products?.last_page || 1,
    per_page: products?.per_page || 24,
    total: products?.total || 0,
    from: products?.from || 0,
    to: products?.to || 0,
  };

  // Sincronizar filtros con URL
  const updateUrlWithFilters = useCallback(
    (newFilters: ActiveFilters) => {
      const params = new URLSearchParams();

      // Agregar filtros a la URL
      if (newFilters.search) params.set('search', newFilters.search);
      if (newFilters.min_price) params.set('min_price', String(newFilters.min_price));
      if (newFilters.max_price) params.set('max_price', String(newFilters.max_price));
      if (newFilters.sort && newFilters.sort !== 'featured') params.set('sort', newFilters.sort);
      if (newFilters.on_sale) params.set('on_sale', '1');

      // Arrays
      if (newFilters.genders?.length) {
        newFilters.genders.forEach((g) => params.append('genders[]', g));
      }
      if (newFilters.sizes?.length) {
        newFilters.sizes.forEach((s) => params.append('sizes[]', s));
      }
      if (newFilters.colors?.length) {
        newFilters.colors.forEach((c) => params.append('colors[]', c));
      }
      if (newFilters.brands?.length) {
        newFilters.brands.forEach((b) => params.append('brands[]', String(b)));
      }
      if (newFilters.conditions?.length) {
        newFilters.conditions.forEach((c) => params.append('conditions[]', c));
      }

      // Especificaciones
      if (newFilters.deporte) params.set('deporte', newFilters.deporte);
      if (newFilters.coleccion) params.set('coleccion', newFilters.coleccion);
      if (newFilters.tipo) params.set('tipo', newFilters.tipo);
      if (newFilters.material) params.set('material', newFilters.material);

      const queryString = params.toString();
      const currentPath = window.location.pathname;
      const newUrl = queryString ? `${currentPath}?${queryString}` : currentPath;

      router.get(newUrl, {}, { preserveState: true, preserveScroll: true });
    },
    []
  );

  // Manejar cambios de filtros
  const handleFilterChange = useCallback(
    (newFilters: Partial<ActiveFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);
      updateUrlWithFilters(updatedFilters);
    },
    [filters, updateUrlWithFilters]
  );

  // Remover un filtro específico
  const handleRemoveFilter = useCallback(
    (filterKey: keyof ActiveFilters, value?: string | number) => {
      const updatedFilters = { ...filters };

      if (filterKey === 'min_price' || filterKey === 'max_price') {
        delete updatedFilters.min_price;
        delete updatedFilters.max_price;
      } else if (Array.isArray(updatedFilters[filterKey])) {
        const arr = updatedFilters[filterKey] as (string | number)[];
        updatedFilters[filterKey] = arr.filter((v) => v !== value) as any;
        if ((updatedFilters[filterKey] as any[]).length === 0) {
          delete updatedFilters[filterKey];
        }
      } else {
        delete updatedFilters[filterKey];
      }

      setFilters(updatedFilters);
      updateUrlWithFilters(updatedFilters);
    },
    [filters, updateUrlWithFilters]
  );

  // Limpiar todos los filtros
  const handleClearAllFilters = useCallback(() => {
    const clearedFilters: ActiveFilters = { sort: filters.sort };
    setFilters(clearedFilters);
    updateUrlWithFilters(clearedFilters);
  }, [filters.sort, updateUrlWithFilters]);

  // Manejar cambio de ordenamiento
  const handleSortChange = useCallback(
    (sort: string) => {
      handleFilterChange({ sort });
    },
    [handleFilterChange]
  );

  // Manejar búsqueda
  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handleFilterChange({ search: searchInput || undefined });
    },
    [searchInput, handleFilterChange]
  );

  // Manejar paginación
  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(window.location.search);
      params.set('page', String(page));
      router.get(`${window.location.pathname}?${params.toString()}`, {}, { preserveScroll: false });
    },
    []
  );

  // Construir breadcrumbs
  const breadcrumbs: Breadcrumb[] = propsBreadcrumbs || [
    { label: 'Inicio', href: `/${config.slug}` },
    { label: page_title || current_category?.name || 'Productos', href: null },
  ];

  // Título de la página
  const pageDisplayTitle =
    page_title ||
    current_category?.name ||
    current_brand?.name ||
    (search_query ? `Resultados para "${search_query}"` : 'Todos los productos');

  return (
    <>
      <Head title={seo?.title || `${pageDisplayTitle} | ${config.name}`}>
        <meta name="description" content={seo?.description || config.description} />
      </Head>

      <div className="min-h-screen bg-white">
        <StoreHeader />

        <main className="pt-4">
          {/* Breadcrumbs */}
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12">
            <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <ChevronRight className="w-3 h-3" />}
                  {item.href ? (
                    <Link href={item.href} className="hover:text-black transition-colors">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-gray-900">{item.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Header con título y controles */}
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 mb-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Título y conteo */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{pageDisplayTitle}</h1>
                {current_category?.description && (
                  <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                    {current_category.description}
                  </p>
                )}
              </div>

              {/* Controles */}
              <div className="flex items-center gap-3">
                {/* Toggle Filtros (Desktop) */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="hidden lg:flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                             hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
                  <Filter className="w-4 h-4" />
                </button>

                {/* Filtros Mobile */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200
                             rounded-lg text-sm font-medium"
                >
                  <Filter className="w-4 h-4" />
                  Filtros
                </button>

                {/* Ordenar */}
                <SortDropdown value={filters.sort || 'featured'} onChange={handleSortChange} />

                {/* Vista Grid */}
                <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid-2')}
                    className={`p-2 rounded ${viewMode === 'grid-2' ? 'bg-white shadow-sm' : ''}`}
                    title="2 columnas"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid-3')}
                    className={`p-2 rounded ${viewMode === 'grid-3' ? 'bg-white shadow-sm' : ''}`}
                    title="3 columnas"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros activos */}
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12">
            <ActiveFiltersBar
              activeFilters={filters}
              filterOptions={filter_options}
              categories={categories}
              currentCategory={current_category}
              totalResults={pagination.total}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={handleClearAllFilters}
            />
          </div>

          {/* Layout principal con sidebar y productos */}
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-6">
            <div className="flex gap-8">
              {/* Sidebar de filtros - Desktop */}
              {showFilters && (
                <aside className="hidden lg:block w-64 flex-shrink-0">
                  <div className="sticky top-24">
                    <FilterSidebar
                      filterOptions={filter_options}
                      activeFilters={filters}
                      onFilterChange={handleFilterChange}
                      categories={categories}
                      currentCategory={current_category}
                      storeSlug={config.slug}
                    />
                  </div>
                </aside>
              )}

              {/* Grid de productos */}
              <div className="flex-1 min-w-0">
                {productsList.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      No se encontraron productos
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Intenta con otros filtros o términos de búsqueda
                    </p>
                    <button
                      onClick={handleClearAllFilters}
                      className="px-6 py-2.5 rounded-full font-medium text-white bg-black hover:bg-gray-800 transition-colors"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Grid de productos */}
                    <div
                      className={`grid gap-4 ${
                        viewMode === 'grid-3'
                          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                          : 'grid-cols-1 sm:grid-cols-2'
                      } ${!showFilters ? 'xl:grid-cols-4' : ''}`}
                    >
                      {productsList.map((product) => (
                        <ProductCard key={product.id} product={product} storeSlug={config.slug} />
                      ))}
                    </div>

                    {/* Paginación */}
                    {pagination.last_page > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-12">
                        {/* Botón anterior */}
                        <button
                          onClick={() => handlePageChange(pagination.current_page - 1)}
                          disabled={pagination.current_page === 1}
                          className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200
                                     hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Anterior
                        </button>

                        {/* Números de página */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                            let pageNum: number;
                            if (pagination.last_page <= 5) {
                              pageNum = i + 1;
                            } else if (pagination.current_page <= 3) {
                              pageNum = i + 1;
                            } else if (pagination.current_page >= pagination.last_page - 2) {
                              pageNum = pagination.last_page - 4 + i;
                            } else {
                              pageNum = pagination.current_page - 2 + i;
                            }
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                                  pageNum === pagination.current_page
                                    ? 'bg-black text-white'
                                    : 'hover:bg-gray-100'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>

                        {/* Botón siguiente */}
                        <button
                          onClick={() => handlePageChange(pagination.current_page + 1)}
                          disabled={pagination.current_page === pagination.last_page}
                          className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200
                                     hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Siguiente
                        </button>
                      </div>
                    )}

                    {/* Info de paginación */}
                    <p className="text-center text-sm text-gray-500 mt-4">
                      Mostrando {pagination.from}-{pagination.to} de {pagination.total} productos
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>

        <StoreFooter />
        <CartDrawer />

        {/* Mobile Filter Drawer */}
        {isMobileFilterOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-white z-50 lg:hidden overflow-y-auto">
              <FilterSidebar
                filterOptions={filter_options}
                activeFilters={filters}
                onFilterChange={handleFilterChange}
                categories={categories}
                currentCategory={current_category}
                storeSlug={config.slug}
                isMobile
                onClose={() => setIsMobileFilterOpen(false)}
              />
            </div>
          </>
        )}

        {/* WhatsApp FAB */}
        {(config.whatsapp || config.social_links?.whatsapp || config.phone) && (
          <a
            href={`https://wa.me/${config.whatsapp || config.social_links?.whatsapp || config.phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full
                       bg-green-500 text-white shadow-lg shadow-green-500/30
                       flex items-center justify-center
                       hover:scale-110 transition-transform"
          >
            <FaWhatsapp className="w-7 h-7" />
          </a>
        )}
      </div>
    </>
  );
}

// ============================================
// WRAPPER WITH PROVIDER
// ============================================
export default function StoreCatalog() {
  const pageProps = usePage<CatalogPageProps>().props;

  return (
    <StoreProvider config={pageProps.config} categories={pageProps.categories}>
      <StoreCatalogContent />
    </StoreProvider>
  );
}
