import React, { useState, useCallback } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import type { FilterOptions, ActiveFilters, Category } from '../types/filters';

interface FilterSidebarProps {
  filterOptions: FilterOptions;
  activeFilters: ActiveFilters;
  onFilterChange: (filters: Partial<ActiveFilters>) => void;
  categories?: Category[];
  currentCategory?: Category;
  storeSlug: string;
  isMobile?: boolean;
  onClose?: () => void;
}

interface FilterSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, defaultOpen = true, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-medium text-gray-900">{title}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
};

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filterOptions,
  activeFilters,
  onFilterChange,
  categories = [],
  currentCategory,
  storeSlug,
  isMobile = false,
  onClose,
}) => {
  const [priceMin, setPriceMin] = useState(activeFilters.min_price?.toString() || '');
  const [priceMax, setPriceMax] = useState(activeFilters.max_price?.toString() || '');

  // Manejar cambio de checkbox genérico
  const handleCheckboxChange = useCallback(
    (filterKey: keyof ActiveFilters, value: string | number, isChecked: boolean) => {
      const currentValues = (activeFilters[filterKey] as (string | number)[]) || [];
      let newValues: (string | number)[];

      if (isChecked) {
        newValues = [...currentValues, value];
      } else {
        newValues = currentValues.filter((v) => v !== value);
      }

      onFilterChange({ [filterKey]: newValues.length > 0 ? newValues : undefined });
    },
    [activeFilters, onFilterChange]
  );

  // Manejar filtro único (radio)
  const handleSingleFilter = useCallback(
    (filterKey: keyof ActiveFilters, value: string | undefined) => {
      onFilterChange({ [filterKey]: value });
    },
    [onFilterChange]
  );

  // Aplicar filtro de precio
  const applyPriceFilter = useCallback(() => {
    onFilterChange({
      min_price: priceMin ? parseFloat(priceMin) : undefined,
      max_price: priceMax ? parseFloat(priceMax) : undefined,
    });
  }, [priceMin, priceMax, onFilterChange]);

  // Verificar si un valor está activo
  const isValueActive = (filterKey: keyof ActiveFilters, value: string | number): boolean => {
    const values = activeFilters[filterKey];
    if (Array.isArray(values)) {
      return values.includes(value as never);
    }
    return values === value;
  };

  return (
    <div className={`${isMobile ? 'h-full overflow-y-auto' : ''}`}>
      {/* Header mobile */}
      {isMobile && (
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
          <h2 className="text-lg font-semibold">Filtros</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className={`${isMobile ? 'px-4' : ''}`}>
        {/* Categorías */}
        {categories.length > 0 && (
          <FilterSection title="Categorías" defaultOpen={true}>
            <div className="space-y-2">
              {categories.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  storeSlug={storeSlug}
                  currentCategoryId={currentCategory?.id}
                  depth={0}
                />
              ))}
            </div>
          </FilterSection>
        )}

        {/* Géneros */}
        {filterOptions.genders && filterOptions.genders.length > 0 && (
          <FilterSection title="Género" defaultOpen={true}>
            <div className="space-y-2">
              {filterOptions.genders.map((gender) => (
                <label
                  key={gender.value}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isValueActive('genders', gender.value)}
                      onChange={(e) =>
                        handleCheckboxChange('genders', gender.value, e.target.checked)
                      }
                      className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className="ml-3 text-sm text-gray-600">{gender.label}</span>
                  </div>
                  <span className="text-xs text-gray-400">({gender.count})</span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Tallas */}
        {filterOptions.sizes && filterOptions.sizes.length > 0 && (
          <FilterSection title="Talla" defaultOpen={true}>
            <div className="grid grid-cols-4 gap-2">
              {filterOptions.sizes.map((size) => (
                <button
                  key={size.value}
                  onClick={() => handleCheckboxChange('sizes', size.value, !isValueActive('sizes', size.value))}
                  className={`rounded border px-2 py-1.5 text-xs font-medium transition-all ${
                    isValueActive('sizes', size.value)
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {size.value}
                </button>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Colores */}
        {filterOptions.colors && filterOptions.colors.length > 0 && (
          <FilterSection title="Color" defaultOpen={true}>
            <div className="grid grid-cols-5 gap-3">
              {filterOptions.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() =>
                    handleCheckboxChange('colors', color.name, !isValueActive('colors', color.name))
                  }
                  className="group flex flex-col items-center"
                  title={`${color.name} (${color.count})`}
                >
                  <div
                    className={`h-7 w-7 rounded-full border-2 transition-all ${
                      isValueActive('colors', color.name)
                        ? 'border-black ring-2 ring-black ring-offset-2'
                        : 'border-gray-300 group-hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="mt-1 text-[10px] text-gray-500 truncate max-w-full">
                    {color.name}
                  </span>
                </button>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Marcas */}
        {filterOptions.brands && filterOptions.brands.length > 0 && (
          <FilterSection title="Marca" defaultOpen={false}>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filterOptions.brands.map((brand) => (
                <label
                  key={brand.id}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isValueActive('brands', brand.id)}
                      onChange={(e) =>
                        handleCheckboxChange('brands', brand.id, e.target.checked)
                      }
                      className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className="ml-3 text-sm text-gray-600">{brand.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">({brand.count})</span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Precio */}
        <FilterSection title="Precio" defaultOpen={false}>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  S/
                </span>
                <input
                  type="number"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  placeholder={filterOptions.price_range.min.toString()}
                  className="w-full rounded border border-gray-300 py-2 pl-8 pr-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <span className="text-gray-400">-</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  S/
                </span>
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder={filterOptions.price_range.max.toString()}
                  className="w-full rounded border border-gray-300 py-2 pl-8 pr-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>
            <button
              onClick={applyPriceFilter}
              className="w-full rounded bg-black py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              Aplicar
            </button>
          </div>
        </FilterSection>

        {/* En oferta */}
        {filterOptions.on_sale_count > 0 && (
          <FilterSection title="Ofertas" defaultOpen={false}>
            <label className="flex cursor-pointer items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={activeFilters.on_sale || false}
                  onChange={(e) => onFilterChange({ on_sale: e.target.checked || undefined })}
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="ml-3 text-sm text-gray-600">En descuento</span>
              </div>
              <span className="text-xs text-gray-400">({filterOptions.on_sale_count})</span>
            </label>
          </FilterSection>
        )}

        {/* Condición */}
        {filterOptions.conditions && filterOptions.conditions.length > 0 && (
          <FilterSection title="Condición" defaultOpen={false}>
            <div className="space-y-2">
              {filterOptions.conditions.map((condition) => (
                <label
                  key={condition.value}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isValueActive('conditions', condition.value)}
                      onChange={(e) =>
                        handleCheckboxChange('conditions', condition.value, e.target.checked)
                      }
                      className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className="ml-3 text-sm text-gray-600">{condition.label}</span>
                  </div>
                  <span className="text-xs text-gray-400">({condition.count})</span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Especificaciones dinámicas */}
        {filterOptions.specifications?.deportes && filterOptions.specifications.deportes.length > 0 && (
          <FilterSection title="Deporte" defaultOpen={false}>
            <div className="space-y-2">
              {filterOptions.specifications.deportes.map((item) => (
                <label
                  key={item.value}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="deporte"
                      checked={activeFilters.deporte === item.value}
                      onChange={() => handleSingleFilter('deporte', item.value)}
                      className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                    />
                    <span className="ml-3 text-sm text-gray-600">{item.value}</span>
                  </div>
                  <span className="text-xs text-gray-400">({item.count})</span>
                </label>
              ))}
              {activeFilters.deporte && (
                <button
                  onClick={() => handleSingleFilter('deporte', undefined)}
                  className="text-xs text-gray-500 underline hover:text-black"
                >
                  Limpiar
                </button>
              )}
            </div>
          </FilterSection>
        )}

        {filterOptions.specifications?.colecciones && filterOptions.specifications.colecciones.length > 0 && (
          <FilterSection title="Colección" defaultOpen={false}>
            <div className="space-y-2">
              {filterOptions.specifications.colecciones.map((item) => (
                <label
                  key={item.value}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="coleccion"
                      checked={activeFilters.coleccion === item.value}
                      onChange={() => handleSingleFilter('coleccion', item.value)}
                      className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                    />
                    <span className="ml-3 text-sm text-gray-600">{item.value}</span>
                  </div>
                  <span className="text-xs text-gray-400">({item.count})</span>
                </label>
              ))}
              {activeFilters.coleccion && (
                <button
                  onClick={() => handleSingleFilter('coleccion', undefined)}
                  className="text-xs text-gray-500 underline hover:text-black"
                >
                  Limpiar
                </button>
              )}
            </div>
          </FilterSection>
        )}

        {filterOptions.specifications?.tipos && filterOptions.specifications.tipos.length > 0 && (
          <FilterSection title="Tipo" defaultOpen={false}>
            <div className="space-y-2">
              {filterOptions.specifications.tipos.map((item) => (
                <label
                  key={item.value}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="tipo"
                      checked={activeFilters.tipo === item.value}
                      onChange={() => handleSingleFilter('tipo', item.value)}
                      className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                    />
                    <span className="ml-3 text-sm text-gray-600">{item.value}</span>
                  </div>
                  <span className="text-xs text-gray-400">({item.count})</span>
                </label>
              ))}
              {activeFilters.tipo && (
                <button
                  onClick={() => handleSingleFilter('tipo', undefined)}
                  className="text-xs text-gray-500 underline hover:text-black"
                >
                  Limpiar
                </button>
              )}
            </div>
          </FilterSection>
        )}
      </div>

      {/* Botón aplicar en mobile */}
      {isMobile && (
        <div className="sticky bottom-0 border-t border-gray-200 bg-white p-4">
          <button
            onClick={onClose}
            className="w-full rounded-full bg-black py-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Ver Resultados
          </button>
        </div>
      )}
    </div>
  );
};

// Componente para renderizar categorías de forma recursiva
interface CategoryItemProps {
  category: Category;
  storeSlug: string;
  currentCategoryId?: number;
  depth: number;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  storeSlug,
  currentCategoryId,
  depth,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const isActive = currentCategoryId === category.id;

  return (
    <div>
      <div
        className="flex items-center justify-between"
        style={{ paddingLeft: `${depth * 12}px` }}
      >
        <Link
          href={`/${storeSlug}/categoria/${category.slug}`}
          className={`flex-1 py-1 text-sm transition-colors ${
            isActive ? 'font-semibold text-black' : 'text-gray-600 hover:text-black'
          }`}
        >
          {category.name}
          <span className="ml-1 text-xs text-gray-400">({category.products_count})</span>
        </Link>
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {isExpanded ? (
              <ChevronUp className="h-3 w-3 text-gray-500" />
            ) : (
              <ChevronDown className="h-3 w-3 text-gray-500" />
            )}
          </button>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {category.children!.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              storeSlug={storeSlug}
              currentCategoryId={currentCategoryId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterSidebar;
