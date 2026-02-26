// Tipos para el sistema de filtros del catálogo

export interface FilterOption {
  value: string;
  label?: string;
  count: number;
}

export interface ColorOption {
  name: string;
  hex: string;
  count: number;
}

export interface BrandOption {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  count: number;
}

export interface SizeOption {
  value: string;
  count: number;
}

export interface SpecificationOptions {
  deportes?: FilterOption[];
  colecciones?: FilterOption[];
  tipos?: FilterOption[];
  materiales?: FilterOption[];
}

export interface FilterOptions {
  price_range: {
    min: number;
    max: number;
  };
  genders: FilterOption[];
  conditions: FilterOption[];
  brands: BrandOption[];
  sizes: SizeOption[];
  colors: ColorOption[];
  specifications: SpecificationOptions;
  on_sale_count: number;
}

export interface ActiveFilters {
  search?: string;
  category_id?: number;
  brand_id?: number;
  brands?: number[];
  gender?: string;
  genders?: string[];
  condition?: string;
  conditions?: string[];
  sizes?: string[];
  colors?: string[];
  min_price?: number;
  max_price?: number;
  on_sale?: boolean;
  deporte?: string;
  coleccion?: string;
  tipo?: string;
  material?: string;
  sort?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  products_count: number;
  children?: Category[];
}

export interface Breadcrumb {
  label: string;
  href: string | null;
}

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Destacados' },
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'name_asc', label: 'Nombre: A-Z' },
  { value: 'name_desc', label: 'Nombre: Z-A' },
  { value: 'best_selling', label: 'Más vendidos' },
];
