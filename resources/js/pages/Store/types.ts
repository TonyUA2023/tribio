/**
 * Tipos para la Tienda Virtual
 */

export interface Product {
  id: number;
  name: string;
  slug?: string;
  description: string;
  price: number;
  compare_price?: number; // Precio anterior (tachado)
  image?: string;
  images?: string[]; // Galería de imágenes
  category: string;
  category_slug?: string;
  subcategory?: string;
  available: boolean;
  featured?: boolean;
  new?: boolean; // Producto nuevo
  stock?: number;
  sku?: string;
  options?: ProductOption[];
  tags?: string[];
  rating?: number;
  reviews_count?: number;
}

export interface ProductOption {
  name: string; // "Tamaño", "Sabor", etc.
  values: string[];
  prices?: { [key: string]: number }; // Precio adicional por opción
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  products_count?: number;
  subcategories?: Category[];
  parent_id?: number;
}

export interface CartItem extends Product {
  quantity: number;
  selected_options?: { [key: string]: string }; // Opciones seleccionadas
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  coupon_code?: string;
}

export interface StoreConfig {
  name: string;
  slug: string;
  logo?: string;
  cover_image?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  social_links?: {
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  currency?: string;
  currency_symbol?: string;
  shipping_fee?: number;
  free_shipping_threshold?: number;
  business_hours?: string;
  delivery_info?: string;
  payment_methods?: string[];
  // SEO
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  button_text?: string;
  position?: 'left' | 'center' | 'right';
}

export interface Review {
  id: number;
  product_id: number;
  customer_name: string;
  rating: number;
  comment: string;
  date: string;
  verified?: boolean;
}

export interface CustomerInfo {
  name: string;
  email?: string;
  phone: string;
  address?: string;
  district?: string;
  city?: string;
  notes?: string;
  delivery_type: 'pickup' | 'delivery';
}

export interface Order {
  id: number;
  order_number: string;
  customer: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  payment_method: 'cash' | 'transfer' | 'card';
  payment_status: 'pending' | 'paid';
  created_at: string;
}

// Filtros de búsqueda
export interface ProductFilters {
  category?: string;
  subcategory?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: 'name' | 'price_asc' | 'price_desc' | 'newest' | 'popular';
  search?: string;
  tags?: string[];
  in_stock?: boolean;
}

// Props para páginas
export interface StorePageProps {
  config: StoreConfig;
  categories: Category[];
  products: Product[];
  featured_products?: Product[];
  new_products?: Product[];
  banners?: Banner[];
}

export interface CatalogPageProps extends StorePageProps {
  current_category?: Category;
  filters: ProductFilters;
  pagination: {
    current_page: number;
    total_pages: number;
    total_products: number;
    per_page: number;
  };
}

export interface ProductPageProps extends StorePageProps {
  product: Product;
  related_products: Product[];
  reviews: Review[];
}
