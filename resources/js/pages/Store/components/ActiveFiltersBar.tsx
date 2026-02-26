import React from 'react';
import { X } from 'lucide-react';
import type { ActiveFilters, FilterOptions, Category, BrandOption } from '../types/filters';

interface ActiveFiltersBarProps {
  activeFilters: ActiveFilters;
  filterOptions: FilterOptions;
  categories?: Category[];
  currentCategory?: Category;
  totalResults: number;
  onRemoveFilter: (filterKey: keyof ActiveFilters, value?: string | number) => void;
  onClearAll: () => void;
}

interface FilterTag {
  key: keyof ActiveFilters;
  value: string | number;
  label: string;
}

const ActiveFiltersBar: React.FC<ActiveFiltersBarProps> = ({
  activeFilters,
  filterOptions,
  currentCategory,
  totalResults,
  onRemoveFilter,
  onClearAll,
}) => {
  // Generar tags de filtros activos
  const getFilterTags = (): FilterTag[] => {
    const tags: FilterTag[] = [];

    // Géneros
    if (activeFilters.genders && activeFilters.genders.length > 0) {
      activeFilters.genders.forEach((gender) => {
        const genderOption = filterOptions.genders?.find((g) => g.value === gender);
        tags.push({
          key: 'genders',
          value: gender,
          label: genderOption?.label || gender,
        });
      });
    }

    // Género único (de URL)
    if (activeFilters.gender) {
      const genderLabels: Record<string, string> = {
        male: 'Hombre',
        female: 'Mujer',
        kids: 'Niños',
        unisex: 'Unisex',
      };
      tags.push({
        key: 'gender',
        value: activeFilters.gender,
        label: genderLabels[activeFilters.gender] || activeFilters.gender,
      });
    }

    // Tallas
    if (activeFilters.sizes && activeFilters.sizes.length > 0) {
      activeFilters.sizes.forEach((size) => {
        tags.push({
          key: 'sizes',
          value: size,
          label: `Talla: ${size}`,
        });
      });
    }

    // Colores
    if (activeFilters.colors && activeFilters.colors.length > 0) {
      activeFilters.colors.forEach((color) => {
        tags.push({
          key: 'colors',
          value: color,
          label: color,
        });
      });
    }

    // Marcas
    if (activeFilters.brands && activeFilters.brands.length > 0) {
      activeFilters.brands.forEach((brandId) => {
        const brand = filterOptions.brands?.find((b: BrandOption) => b.id === brandId);
        tags.push({
          key: 'brands',
          value: brandId,
          label: brand?.name || `Marca ${brandId}`,
        });
      });
    }

    // Marca única
    if (activeFilters.brand_id) {
      const brand = filterOptions.brands?.find((b: BrandOption) => b.id === activeFilters.brand_id);
      tags.push({
        key: 'brand_id',
        value: activeFilters.brand_id,
        label: brand?.name || `Marca`,
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
      tags.push({
        key: 'min_price',
        value: 'price',
        label,
      });
    }

    // En oferta
    if (activeFilters.on_sale) {
      tags.push({
        key: 'on_sale',
        value: 'true',
        label: 'En descuento',
      });
    }

    // Condiciones
    if (activeFilters.conditions && activeFilters.conditions.length > 0) {
      activeFilters.conditions.forEach((condition) => {
        const conditionOption = filterOptions.conditions?.find((c) => c.value === condition);
        tags.push({
          key: 'conditions',
          value: condition,
          label: conditionOption?.label || condition,
        });
      });
    }

    // Condición única
    if (activeFilters.condition) {
      const conditionLabels: Record<string, string> = {
        new: 'Nuevo',
        used: 'Usado',
        refurbished: 'Reacondicionado',
      };
      tags.push({
        key: 'condition',
        value: activeFilters.condition,
        label: conditionLabels[activeFilters.condition] || activeFilters.condition,
      });
    }

    // Especificaciones
    if (activeFilters.deporte) {
      tags.push({
        key: 'deporte',
        value: activeFilters.deporte,
        label: `Deporte: ${activeFilters.deporte}`,
      });
    }

    if (activeFilters.coleccion) {
      tags.push({
        key: 'coleccion',
        value: activeFilters.coleccion,
        label: `Colección: ${activeFilters.coleccion}`,
      });
    }

    if (activeFilters.tipo) {
      tags.push({
        key: 'tipo',
        value: activeFilters.tipo,
        label: `Tipo: ${activeFilters.tipo}`,
      });
    }

    if (activeFilters.material) {
      tags.push({
        key: 'material',
        value: activeFilters.material,
        label: `Material: ${activeFilters.material}`,
      });
    }

    // Búsqueda
    if (activeFilters.search) {
      tags.push({
        key: 'search',
        value: activeFilters.search,
        label: `"${activeFilters.search}"`,
      });
    }

    return tags;
  };

  const tags = getFilterTags();
  const hasActiveFilters = tags.length > 0 || currentCategory;

  if (!hasActiveFilters) {
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
      {/* Contador de resultados */}
      <span className="text-sm font-medium text-gray-900 mr-2">
        {totalResults} {totalResults === 1 ? 'producto' : 'productos'}
      </span>

      {/* Separador */}
      {tags.length > 0 && <span className="text-gray-300">|</span>}

      {/* Tags de filtros */}
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

      {/* Botón limpiar todo */}
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

export default ActiveFiltersBar;
