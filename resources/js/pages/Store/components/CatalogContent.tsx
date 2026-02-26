/**
 * Contenido del catálogo para usar dentro del NikeStyleTemplate
 * Incluye filtros, grid de productos y paginación
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import {
  ChevronRight,
  ChevronDown,
  X,
  Filter,
  Grid3X3,
  LayoutGrid,
  SlidersHorizontal
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { ActiveFilters, FilterOptions, Category, Breadcrumb, SORT_OPTIONS } from '../types/filters';

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
  colors?: string[];
}

interface PaginatedProducts {
  data: Product[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links?: Array<{ url: string | null; label: string; active: boolean }>;
}

interface CatalogContentProps {
  storeSlug: string;
  products: PaginatedProducts | Product[];
  categories: Category[];
  filterOptions: FilterOptions;
  activeFilters: ActiveFilters;
  currentCategory?: Category;
  parentCategory?: Category;
  subcategories?: Category[];
  breadcrumbs?: Breadcrumb[];
  pageTitle?: string;
  searchQuery?: string;
  currencySymbol?: string;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
const formatPrice = (price: number, symbol = 'S/') => {
  return `${symbol} ${price.toFixed(2)}`;
};

const resolveMediaUrl = (url?: string) => {
  if (!url) return '/images/placeholder-product.jpg';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return url;
  const publicPath = (window as any).appConfig?.filesystemPublicPath || 'storage';
  const clean = url.replace(/^uploaded_files\//, '').replace(/^storage\//, '');
  return `/${publicPath}/${clean}`;
};

const SORT_OPTIONS_LIST = [
  { value: 'featured', label: 'Destacados' },
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: Menor a Mayor' },
  { value: 'price_desc', label: 'Precio: Mayor a Menor' },
  { value: 'name_asc', label: 'Nombre: A-Z' },
  { value: 'name_desc', label: 'Nombre: Z-A' },
];

// ============================================
// FILTER SIDEBAR COMPONENT
// ============================================
interface FilterSidebarProps {
  filterOptions: FilterOptions;
  activeFilters: ActiveFilters;
  categories: Category[];
  currentCategory?: Category;
  storeSlug: string;
  onFilterChange: (filters: ActiveFilters) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filterOptions,
  activeFilters,
  categories,
  currentCategory,
  storeSlug,
  onFilterChange,
  isMobile,
  onClose,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    categories: true,
    gender: true,
    sizes: true,
    colors: true,
    brands: true,
    price: true,
  });

  const [priceRange, setPriceRange] = useState({
    min: activeFilters.min_price || '',
    max: activeFilters.max_price || '',
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleArrayFilterToggle = (key: keyof ActiveFilters, value: string | number) => {
    const currentValues = (activeFilters[key] as (string | number)[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];

    onFilterChange({
      ...activeFilters,
      [key]: newValues.length > 0 ? newValues : undefined,
    });
  };

  const handlePriceFilter = () => {
    onFilterChange({
      ...activeFilters,
      min_price: priceRange.min ? Number(priceRange.min) : undefined,
      max_price: priceRange.max ? Number(priceRange.max) : undefined,
    });
  };

  const FilterSection: React.FC<{ title: string; sectionKey: string; children: React.ReactNode }> = ({
    title,
    sectionKey,
    children,
  }) => (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="font-semibold text-gray-900">{title}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-700 transition-transform ${expandedSections[sectionKey] ? 'rotate-180' : ''}`}
        />
      </button>
      {expandedSections[sectionKey] && <div className="mt-4">{children}</div>}
    </div>
  );

  return (
    <div className={`${isMobile ? 'p-4' : ''}`}>
      {/* Header móvil */}
      {isMobile && (
        <div className="flex items-center justify-between mb-4 pb-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-900" />
          </button>
        </div>
      )}

      {/* Categorías */}
      {categories.length > 0 && (
        <FilterSection title="Categorías" sectionKey="categories">
          <ul className="space-y-2">
            <li>
              <Link
                href={`/${storeSlug}/productos`}
                className={`block text-sm ${!currentCategory ? 'font-semibold text-black' : 'text-gray-600 hover:text-black'}`}
              >
                Todos los productos
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/${storeSlug}/categoria/${category.slug}`}
                  className={`block text-sm ${
                    currentCategory?.id === category.id
                      ? 'font-semibold text-black'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {category.name}
                  {category.products_count !== undefined && (
                    <span className="text-gray-400 ml-1">({category.products_count})</span>
                  )}
                </Link>
                {/* Subcategorías */}
                {category.children && category.children.length > 0 && (
                  <ul className="ml-4 mt-2 space-y-1">
                    {category.children.map((sub) => (
                      <li key={sub.id}>
                        <Link
                          href={`/${storeSlug}/categoria/${category.slug}/${sub.slug}`}
                          className={`block text-sm ${
                            currentCategory?.id === sub.id
                              ? 'font-semibold text-black'
                              : 'text-gray-500 hover:text-black'
                          }`}
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </FilterSection>
      )}

      {/* Géneros */}
      {filterOptions.genders && filterOptions.genders.length > 0 && (
        <FilterSection title="Género" sectionKey="gender">
          <div className="space-y-2">
            {filterOptions.genders.map((gender) => (
              <label key={gender.value} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={(activeFilters.genders || []).includes(gender.value)}
                  onChange={() => handleArrayFilterToggle('genders', gender.value)}
                  className="w-4 h-4 rounded border-gray-400 text-black focus:ring-black accent-black"
                />
                <span className="text-sm text-gray-800 group-hover:text-black">
                  {gender.label}
                </span>
                <span className="text-xs text-gray-600">({gender.count})</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Tallas */}
      {filterOptions.sizes && filterOptions.sizes.length > 0 && (
        <FilterSection title="Talla" sectionKey="sizes">
          <div className="flex flex-wrap gap-2">
            {filterOptions.sizes.map((size) => {
              const isSelected = (activeFilters.sizes || []).includes(size.value);
              return (
                <button
                  key={size.value}
                  onClick={() => handleArrayFilterToggle('sizes', size.value)}
                  className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
                    isSelected
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                  }`}
                >
                  {size.value}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Colores */}
      {filterOptions.colors && filterOptions.colors.length > 0 && (
        <FilterSection title="Color" sectionKey="colors">
          <div className="flex flex-wrap gap-2">
            {filterOptions.colors.map((color) => {
              const isSelected = (activeFilters.colors || []).includes(color.name);
              return (
                <button
                  key={color.name}
                  onClick={() => handleArrayFilterToggle('colors', color.name)}
                  title={color.name}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    isSelected ? 'ring-2 ring-offset-2 ring-black' : 'hover:scale-110'
                  }`}
                  style={{
                    backgroundColor: color.hex,
                    borderColor: color.hex === '#FFFFFF' ? '#e5e7eb' : color.hex,
                  }}
                />
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Marcas */}
      {filterOptions.brands && filterOptions.brands.length > 0 && (
        <FilterSection title="Marca" sectionKey="brands">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filterOptions.brands.map((brand) => (
              <label key={brand.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={(activeFilters.brands || []).includes(brand.id)}
                  onChange={() => handleArrayFilterToggle('brands', brand.id)}
                  className="w-4 h-4 rounded border-gray-400 text-black focus:ring-black accent-black"
                />
                <span className="text-sm text-gray-800 group-hover:text-black">
                  {brand.name}
                </span>
                <span className="text-xs text-gray-600">({brand.count})</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Precio */}
      {filterOptions.price_range && (
        <FilterSection title="Precio" sectionKey="price">
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder={`Min (${filterOptions.price_range.min})`}
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-500 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
              <input
                type="number"
                placeholder={`Max (${filterOptions.price_range.max})`}
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-500 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <button
              onClick={handlePriceFilter}
              className="w-full py-2.5 text-sm font-semibold text-white bg-black rounded-md hover:bg-gray-800 transition-colors"
            >
              Aplicar
            </button>
          </div>
        </FilterSection>
      )}

      {/* En oferta */}
      {filterOptions.on_sale_count && filterOptions.on_sale_count > 0 && (
        <div className="py-4">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={activeFilters.on_sale || false}
              onChange={() => onFilterChange({ ...activeFilters, on_sale: !activeFilters.on_sale })}
              className="w-4 h-4 rounded border-gray-400 text-black focus:ring-black accent-black"
            />
            <span className="text-sm font-semibold text-gray-900 group-hover:text-black">
              En oferta
            </span>
            <span className="text-xs text-gray-600">({filterOptions.on_sale_count})</span>
          </label>
        </div>
      )}
    </div>
  );
};

// ============================================
// PRODUCT CARD COMPONENT
// ============================================
interface ProductCardProps {
  product: Product;
  storeSlug: string;
  currencySymbol: string;
}

const CatalogProductCard: React.FC<ProductCardProps> = ({ product, storeSlug, currencySymbol }) => {
  const { addToCart, setIsCartOpen } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  const images = product.images?.length ? product.images : [product.image];
  const hasDiscount = product.compare_price && product.compare_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.compare_price!) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);

    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
      quantity: 1,
    });

    setTimeout(() => {
      setIsAdding(false);
      setIsCartOpen(true);
    }, 300);
  };

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImageIndex(0);
      }}
    >
      <Link href={`/${storeSlug}/producto/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
          <img
            src={resolveMediaUrl(images[currentImageIndex])}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.is_new && (
              <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
                Nuevo
              </span>
            )}
            {hasDiscount && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            className={`absolute bottom-3 right-3 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center
                       opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg
                       hover:bg-gray-800 hover:scale-110 ${isAdding ? 'scale-110 bg-green-500' : ''}`}
          >
            {isAdding ? (
              <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>

          {/* Image dots */}
          {images.length > 1 && isHovered && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {images.slice(0, 4).map((_, idx) => (
                <button
                  key={idx}
                  onMouseEnter={() => setCurrentImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === currentImageIndex ? 'bg-black' : 'bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Colors */}
          {product.colors && product.colors.length > 1 && !isHovered && (
            <div className="absolute bottom-3 left-3 flex gap-1">
              {product.colors.slice(0, 4).map((color, idx) => (
                <span
                  key={idx}
                  className="w-4 h-4 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.is_new && (
            <p className="text-orange-500 text-xs font-semibold uppercase tracking-wider mb-1">
              Nuevo
            </p>
          )}
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-1 group-hover:text-gray-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-gray-500 text-sm mb-2 line-clamp-1">{product.category}</p>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">
              {formatPrice(product.price, currencySymbol)}
            </span>
            {hasDiscount && (
              <span className="text-gray-400 line-through text-sm">
                {formatPrice(product.compare_price!, currencySymbol)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

// ============================================
// ACTIVE FILTERS BAR
// ============================================
interface ActiveFiltersBarProps {
  activeFilters: ActiveFilters;
  filterOptions: FilterOptions;
  totalResults: number;
  onRemoveFilter: (key: keyof ActiveFilters, value?: string | number) => void;
  onClearAll: () => void;
}

const ActiveFiltersBar: React.FC<ActiveFiltersBarProps> = ({
  activeFilters,
  filterOptions,
  totalResults,
  onRemoveFilter,
  onClearAll,
}) => {
  const getFilterTags = () => {
    const tags: Array<{ key: keyof ActiveFilters; value: string | number; label: string }> = [];

    // Géneros
    if (activeFilters.genders?.length) {
      activeFilters.genders.forEach((gender) => {
        const genderOption = filterOptions.genders?.find((g) => g.value === gender);
        tags.push({ key: 'genders', value: gender, label: genderOption?.label || gender });
      });
    }

    // Tallas
    if (activeFilters.sizes?.length) {
      activeFilters.sizes.forEach((size) => {
        tags.push({ key: 'sizes', value: size, label: `Talla: ${size}` });
      });
    }

    // Colores
    if (activeFilters.colors?.length) {
      activeFilters.colors.forEach((color) => {
        tags.push({ key: 'colors', value: color, label: color });
      });
    }

    // Marcas
    if (activeFilters.brands?.length) {
      activeFilters.brands.forEach((brandId) => {
        const brand = filterOptions.brands?.find((b) => b.id === brandId);
        tags.push({ key: 'brands', value: brandId, label: brand?.name || `Marca ${brandId}` });
      });
    }

    // Precio
    if (activeFilters.min_price || activeFilters.max_price) {
      let label = 'Precio: ';
      if (activeFilters.min_price && activeFilters.max_price) {
        label += `S/${activeFilters.min_price} - S/${activeFilters.max_price}`;
      } else if (activeFilters.min_price) {
        label += `desde S/${activeFilters.min_price}`;
      } else {
        label += `hasta S/${activeFilters.max_price}`;
      }
      tags.push({ key: 'min_price', value: 'price', label });
    }

    // En oferta
    if (activeFilters.on_sale) {
      tags.push({ key: 'on_sale', value: 'true', label: 'En descuento' });
    }

    // Búsqueda
    if (activeFilters.search) {
      tags.push({ key: 'search', value: activeFilters.search, label: `"${activeFilters.search}"` });
    }

    return tags;
  };

  const tags = getFilterTags();

  if (tags.length === 0) {
    return (
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-gray-600">
          {totalResults} {totalResults === 1 ? 'producto' : 'productos'}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 py-3">
      <span className="text-sm font-medium text-gray-900 mr-2">
        {totalResults} {totalResults === 1 ? 'producto' : 'productos'}
      </span>
      <span className="text-gray-300">|</span>
      {tags.map((tag, index) => (
        <button
          key={`${tag.key}-${tag.value}-${index}`}
          onClick={() => onRemoveFilter(tag.key, tag.value)}
          className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 transition-colors"
        >
          {tag.label}
          <X className="h-3 w-3" />
        </button>
      ))}
      {tags.length > 1 && (
        <button
          onClick={onClearAll}
          className="ml-2 text-sm font-medium text-gray-500 underline hover:text-black transition-colors"
        >
          Limpiar todo
        </button>
      )}
    </div>
  );
};

// ============================================
// MAIN CATALOG CONTENT COMPONENT
// ============================================
const CatalogContent: React.FC<CatalogContentProps> = ({
  storeSlug,
  products,
  categories,
  filterOptions,
  activeFilters: initialFilters,
  currentCategory,
  parentCategory,
  subcategories,
  breadcrumbs,
  pageTitle,
  searchQuery,
  currencySymbol = 'S/',
}) => {
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(initialFilters);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const [sortBy, setSortBy] = useState(initialFilters.sort || 'featured');
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(3);

  // Normalize products data
  const productList = !products ? [] : Array.isArray(products) ? products : (products as any).data || [];
  const pagination = !products || Array.isArray(products) ? null : products;
  const totalProducts = pagination?.total || productList.length;

  // Build URL with filters
  const buildFilterUrl = useCallback((filters: ActiveFilters) => {
    const params = new URLSearchParams();

    if (filters.search) params.set('search', filters.search);
    if (filters.sort && filters.sort !== 'featured') params.set('sort', filters.sort);
    if (filters.min_price) params.set('min_price', String(filters.min_price));
    if (filters.max_price) params.set('max_price', String(filters.max_price));
    if (filters.on_sale) params.set('on_sale', '1');

    filters.genders?.forEach(g => params.append('genders[]', g));
    filters.sizes?.forEach(s => params.append('sizes[]', s));
    filters.colors?.forEach(c => params.append('colors[]', c));
    filters.brands?.forEach(b => params.append('brands[]', String(b)));
    filters.conditions?.forEach(c => params.append('conditions[]', c));

    return params.toString();
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((newFilters: ActiveFilters) => {
    setActiveFilters(newFilters);

    // Build base URL
    let baseUrl = `/${storeSlug}/productos`;
    if (currentCategory) {
      baseUrl = `/${storeSlug}/categoria/${currentCategory.slug}`;
      if (parentCategory) {
        baseUrl = `/${storeSlug}/categoria/${parentCategory.slug}/${currentCategory.slug}`;
      }
    }

    const queryString = buildFilterUrl(newFilters);
    router.get(`${baseUrl}${queryString ? `?${queryString}` : ''}`, {}, { preserveState: true });
  }, [storeSlug, currentCategory, parentCategory, buildFilterUrl]);

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value);
    handleFilterChange({ ...activeFilters, sort: value });
  };

  // Handle remove filter
  const handleRemoveFilter = (key: keyof ActiveFilters, value?: string | number) => {
    const newFilters = { ...activeFilters };

    if (key === 'min_price' || key === 'max_price') {
      delete newFilters.min_price;
      delete newFilters.max_price;
    } else if (Array.isArray(newFilters[key])) {
      const arr = newFilters[key] as (string | number)[];
      newFilters[key] = arr.filter(v => v !== value) as any;
      if ((newFilters[key] as any[]).length === 0) {
        delete newFilters[key];
      }
    } else {
      delete newFilters[key];
    }

    handleFilterChange(newFilters);
  };

  // Clear all filters
  const handleClearAll = () => {
    handleFilterChange({});
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 text-sm mb-6">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-4 h-4 text-gray-600" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="text-gray-700 hover:text-black hover:underline">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-gray-900 font-semibold">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {pageTitle || currentCategory?.name || 'Todos los Productos'}
            </h1>
            {searchQuery && (
              <p className="text-gray-500 mt-1">
                Resultados para: "{searchQuery}"
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Toggle filters button - Desktop */}
            <button
              onClick={() => setIsFilterVisible(!isFilterVisible)}
              className="hidden lg:flex items-center gap-2 text-sm text-gray-900 hover:text-black font-medium"
            >
              <SlidersHorizontal className="w-4 h-4 text-gray-900" />
              {isFilterVisible ? 'Ocultar filtros' : 'Mostrar filtros'}
            </button>

            {/* Grid toggle */}
            <div className="hidden md:flex items-center gap-1 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setGridCols(2)}
                className={`p-1.5 rounded ${gridCols === 2 ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGridCols(3)}
                className={`p-1.5 rounded ${gridCols === 3 ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
            >
              {SORT_OPTIONS_LIST.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Mobile filter button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 font-medium"
            >
              <Filter className="w-4 h-4 text-gray-900" />
              Filtros
            </button>
          </div>
        </div>

        {/* Active Filters Bar */}
        <ActiveFiltersBar
          activeFilters={activeFilters}
          filterOptions={filterOptions}
          totalResults={totalProducts}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={handleClearAll}
        />

        {/* Main Content */}
        <div className="flex gap-8 mt-6">
          {/* Sidebar - Desktop */}
          {isFilterVisible && (
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <FilterSidebar
                filterOptions={filterOptions}
                activeFilters={activeFilters}
                categories={categories}
                currentCategory={currentCategory}
                storeSlug={storeSlug}
                onFilterChange={handleFilterChange}
              />
            </aside>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            {productList.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-gray-500 mb-6">
                  Intenta ajustar los filtros o buscar algo diferente
                </p>
                <button
                  onClick={handleClearAll}
                  className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <>
                <div
                  className={`grid gap-4 md:gap-6 ${
                    gridCols === 2
                      ? 'grid-cols-2'
                      : gridCols === 3
                      ? 'grid-cols-2 md:grid-cols-3'
                      : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                  }`}
                >
                  {productList.map((product) => (
                    <CatalogProductCard
                      key={product.id}
                      product={product}
                      storeSlug={storeSlug}
                      currencySymbol={currencySymbol}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    {pagination.links?.map((link, idx) => {
                      if (!link.url) {
                        return (
                          <span
                            key={idx}
                            className="px-3 py-2 text-gray-400"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                          />
                        );
                      }
                      return (
                        <Link
                          key={idx}
                          href={link.url}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            link.active
                              ? 'bg-black text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-white z-50 overflow-y-auto">
            <FilterSidebar
              filterOptions={filterOptions}
              activeFilters={activeFilters}
              categories={categories}
              currentCategory={currentCategory}
              storeSlug={storeSlug}
              onFilterChange={(filters) => {
                handleFilterChange(filters);
                setIsMobileFilterOpen(false);
              }}
              isMobile
              onClose={() => setIsMobileFilterOpen(false)}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CatalogContent;
