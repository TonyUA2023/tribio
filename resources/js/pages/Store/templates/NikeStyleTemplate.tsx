/**
 * Plantilla de Tienda Profesional - Estilo Nike
 * Diseño minimalista, elegante y enfocado en conversión
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowRight,
  Star,
  Filter,
  Grid3X3,
  LayoutGrid,
  Play,
  Plus,
  LogOut,
  Package,
} from 'lucide-react';
import { FaWhatsapp, FaInstagram, FaFacebook, FaTiktok, FaTwitter, FaYoutube } from 'react-icons/fa';
import { StoreTemplateConfig, defaultNikeStyleConfig } from '../types/storeTemplateConfig';
import { StoreProvider, useStore } from '../context/StoreContext';
import { CartDrawer } from '../components/CartDrawer';
import CatalogContent from '../components/CatalogContent';
import CheckoutContent from '../components/CheckoutContent';
import ProductDetailContent from '../components/ProductDetailContent';

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
  rating?: number;
  reviews_count?: number;
  variants?: any[];
  colors?: string[];
  // Detail fields
  description?: string;
  short_description?: string;
  specifications?: Array<{ label: string; value: string }>;
  stock?: number;
  sku?: string;
  options?: Array<{ name: string; values: string[]; prices?: Record<string, number> }>;
  has_variants?: boolean;
  condition?: string;
  origin_country?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  children?: Category[];
  products_count?: number;
}

interface Banner {
  id: number;
  image: string;
  image_mobile?: string;
  title?: string;
  subtitle?: string;
  cta_text?: string;
  cta_link?: string;
  position?: 'left' | 'center' | 'right';
}

interface StoreConfig {
  id: number;
  slug: string;
  name: string;
  description?: string;
  logo?: string;
  logo_dark?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  currency_symbol: string;
  social_links?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    twitter?: string;
  };
  template_config?: Partial<StoreTemplateConfig>;
}

interface NikeStyleTemplateProps {
  config: StoreConfig;
  categories: Category[];
  products: Product[] | PaginatedProducts;
  featured_products?: Product[];
  new_products?: Product[];
  banners?: Banner[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    structured_data?: Record<string, unknown>;
  };
  // Props para detalle de producto
  product?: Product;
  related_products?: Product[];
  reviews?: any[];
  // Props para páginas de catálogo/categorías
  page_type?: 'home' | 'catalog' | 'category' | 'subcategory' | 'search' | 'gender' | 'brand' | 'offers' | 'new' | 'checkout' | 'product';
  filters?: Record<string, any>;
  filter_options?: any;
  current_category?: Category;
  parent_category?: Category;
  subcategories?: Category[];
  breadcrumbs?: Array<{ label: string; href?: string | null }>;
  page_title?: string;
  search_query?: string;
  current_brand?: any;
  brands?: any[];
  // Props para checkout
  customer?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    addresses: Array<{
      id: string;
      label: string;
      address: string;
      reference?: string;
      department: string;
      province: string;
      district: string;
      postal_code?: string;
      phone?: string;
      is_default: boolean;
    }>;
  } | null;
  culqi_public_key?: string;
}

interface PaginatedProducts {
  data: Product[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links?: Array<{ url: string | null; label: string; active: boolean }>;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
const formatPrice = (price: number, symbol = 'S/') => {
  return `${symbol} ${price.toFixed(2)}`;
};

const resolveMediaUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return url;
  const publicPath = (window as any).appConfig?.filesystemPublicPath || 'storage';
  const clean = url.replace(/^uploaded_files\//, '').replace(/^storage\//, '');
  return `/${publicPath}/${clean}`;
};

// ============================================
// HEADER COMPONENT (Integrado con carrito)
// ============================================
interface HeaderProps {
  config: StoreConfig;
  templateConfig: StoreTemplateConfig;
  categories: Category[];
}

const Header: React.FC<HeaderProps> = ({ config, templateConfig, categories }) => {
  const { cart, setIsCartOpen } = useStore();
  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const { auth } = usePage<{ auth: { user: { id: number; name: string; email: string } | null } }>().props;
  const user = auth?.user;

  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.get(`/${config.slug}/productos`, { search: searchQuery });
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      {/* Top Bar */}
      {templateConfig.navigation.topBar?.enabled && (
        <div
          className="text-xs py-2 text-center"
          style={{ backgroundColor: templateConfig.navigation.topBar.backgroundColor || '#f5f5f5' }}
        >
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <div className="flex-1" />
            <p className="text-gray-700">{templateConfig.navigation.topBar.content}</p>
            <div className="flex-1 flex justify-end gap-4">
              {templateConfig.navigation.topBar.links?.map((link, idx) => (
                <Link key={idx} href={link.href} className="text-gray-600 hover:text-gray-900">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header
        className={`sticky top-0 z-40 bg-white transition-shadow duration-300 ${
          isScrolled ? 'shadow-md' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-[60px]">
            {/* Logo */}
            <Link href={`/${config.slug}`} className="flex-shrink-0">
              {config.logo ? (
                <img
                  src={resolveMediaUrl(config.logo)}
                  alt={config.name}
                  className="h-8 w-auto"
                />
              ) : (
                <span className="text-2xl font-bold tracking-tight">{config.name}</span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 static">
              {templateConfig.navigation.mainMenu.map((item) => (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => setActiveMenu(item.id)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <Link
                    href={item.href ? `/${config.slug}${item.href}` : '#'}
                    className="flex items-center gap-1 px-4 py-5 text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
                  >
                    {item.label}
                    {item.badge && (
                      <span
                        className="text-xs font-bold ml-1"
                        style={{ color: item.badgeColor || '#ff6b35' }}
                      >
                        {item.badge}
                      </span>
                    )}
                    {item.children && <ChevronDown className="w-4 h-4" />}
                  </Link>
                </div>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              {templateConfig.navigation.showWishlist && (
                <Link
                  href={`/${config.slug}/favoritos`}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block"
                  aria-label="Favoritos"
                >
                  <Heart className="w-5 h-5" />
                </Link>
              )}

              {/* User Account */}
              <div className="relative" ref={userMenuRef}>
                {user ? (
                  <>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-700 hidden xl:block max-w-[100px] truncate">
                        {user.name.split(' ')[0]}
                      </span>
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Link
                          href={`/${config.slug}/cuenta/pedidos`}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Package className="w-4 h-4" />
                          Mis pedidos
                        </Link>
                        <Link
                          href="/mis-compras"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Todas mis compras
                        </Link>
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <Link
                            href={`/${config.slug}/cuenta/logout`}
                            method="post"
                            as="button"
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <LogOut className="w-4 h-4" />
                            Cerrar sesion
                          </Link>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={`/${config.slug}/cuenta/login`}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Iniciar sesion"
                  >
                    <User className="w-5 h-5" />
                  </Link>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
                aria-label="Carrito"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors lg:hidden"
                aria-label="Menú"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mega Menu - Renderizado fuera del nav pero dentro del header container */}
        {activeMenu && (
          <>
            {templateConfig.navigation.mainMenu
              .filter((item) => item.id === activeMenu && item.children)
              .map((item) => (
                <div
                  key={item.id}
                  className="absolute left-0 right-0 top-full bg-white border-t border-gray-200 shadow-2xl z-50"
                  onMouseEnter={() => setActiveMenu(item.id)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <div className="max-w-7xl mx-auto px-6 py-8">
                    <div
                      className="grid gap-8"
                      style={{ gridTemplateColumns: `repeat(${Math.min(item.children!.length, item.columns || 4)}, minmax(0, 1fr))` }}
                    >
                      {item.children!.map((section: any, idx: number) => (
                        <div key={section.id || idx} className="min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
                            {section.label}
                          </h3>
                          <ul className="space-y-2.5">
                            {section.children?.map((link: any, linkIdx: number) => (
                              <li key={link.id || linkIdx}>
                                <Link
                                  href={`/${config.slug}${link.href || '/productos'}`}
                                  className="text-gray-600 hover:text-gray-900 text-sm flex items-center gap-2 transition-colors group"
                                  onClick={() => setActiveMenu(null)}
                                >
                                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                                    {link.label}
                                  </span>
                                  {link.badge && (
                                    <span className="text-orange-500 text-xs font-medium">{link.badge}</span>
                                  )}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
          </>
        )}
      </header>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="max-w-4xl mx-auto px-4 pt-20">
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            <form onSubmit={handleSearch}>
              <div className="flex items-center border-b-2 border-gray-900 pb-4">
                <Search className="w-6 h-6 mr-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  className="flex-1 text-2xl font-medium outline-none placeholder-gray-400"
                  autoFocus
                />
              </div>
            </form>
            <div className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">
                Búsquedas populares
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Air Max', 'Jordan', 'Running', 'Zapatillas', 'Ofertas'].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      router.get(`/${config.slug}/productos`, { search: term });
                      setIsSearchOpen(false);
                    }}
                    className="px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-8">
              <span className="text-xl font-bold">{config.name}</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="space-y-1">
              {templateConfig.navigation.mainMenu.map((item) => (
                <MobileMenuItem
                  key={item.id}
                  item={item}
                  storeSlug={config.slug}
                  onClose={() => setIsMobileMenuOpen(false)}
                />
              ))}
            </nav>

            {/* User section in mobile menu */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              {user ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-3 px-3 py-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href={`/${config.slug}/cuenta/pedidos`}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 text-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Package className="w-5 h-5" />
                    <span className="font-medium">Mis pedidos</span>
                  </Link>
                  <Link
                    href="/mis-compras"
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 text-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span className="font-medium">Todas mis compras</span>
                  </Link>
                  <Link
                    href={`/${config.slug}/cuenta/logout`}
                    method="post"
                    as="button"
                    className="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-red-50 text-red-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Cerrar sesion</span>
                  </Link>
                </div>
              ) : (
                <Link
                  href={`/${config.slug}/cuenta/login`}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg bg-black text-white font-medium justify-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="w-5 h-5" />
                  Iniciar sesion
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Mobile Menu Item Component
const MobileMenuItem: React.FC<{
  item: any;
  storeSlug: string;
  onClose: () => void;
  level?: number;
}> = ({ item, storeSlug, onClose, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!item.children) {
    return (
      <Link
        href={`/${storeSlug}${item.href || ''}`}
        onClick={onClose}
        className={`flex items-center justify-between py-4 border-b border-gray-100 ${
          level === 0 ? 'text-xl font-medium' : 'text-base text-gray-600'
        }`}
        style={{ paddingLeft: level * 16 }}
      >
        <span>{item.label}</span>
        {item.badge && (
          <span className="text-orange-500 text-sm">{item.badge}</span>
        )}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full py-4 border-b border-gray-100 ${
          level === 0 ? 'text-xl font-medium' : 'text-base text-gray-600'
        }`}
        style={{ paddingLeft: level * 16 }}
      >
        <span>{item.label}</span>
        <ChevronRight className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && (
        <div className="bg-gray-50">
          {item.children.map((child: any) => (
            <MobileMenuItem
              key={child.id}
              item={child}
              storeSlug={storeSlug}
              onClose={onClose}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// HERO SLIDER COMPONENT
// ============================================
interface HeroSliderProps {
  banners: Banner[];
  config: StoreConfig;
  templateConfig: StoreTemplateConfig;
}

const HeroSlider: React.FC<HeroSliderProps> = ({ banners, config, templateConfig }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(templateConfig.hero.autoplay);

  useEffect(() => {
    if (!isPlaying || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, templateConfig.hero.autoplaySpeed);
    return () => clearInterval(interval);
  }, [isPlaying, banners.length, templateConfig.hero.autoplaySpeed]);

  if (banners.length === 0) {
    return (
      <section
        className="relative flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"
        style={{ height: templateConfig.hero.height.desktop }}
      >
        <div className="text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            {config.name}
          </h1>
          <p className="text-lg text-gray-600 mb-8">{config.description}</p>
          <Link
            href={`/${config.slug}/productos`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            Explorar Productos
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden" style={{ height: templateConfig.hero.height.desktop }}>
      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="flex-shrink-0 w-full h-full relative">
            <img
              src={resolveMediaUrl(banner.image)}
              alt={banner.title || ''}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

            {/* Content */}
            <div className={`absolute inset-0 flex items-center ${
              banner.position === 'center' ? 'justify-center text-center' :
              banner.position === 'right' ? 'justify-end text-right pr-16' :
              'justify-start text-left pl-16'
            }`}>
              <div className="max-w-xl px-4">
                {banner.subtitle && (
                  <p className="text-white/80 uppercase tracking-widest text-sm mb-3">
                    {banner.subtitle}
                  </p>
                )}
                {banner.title && (
                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                    {banner.title}
                  </h2>
                )}
                {banner.cta_text && banner.cta_link && (
                  <Link
                    href={banner.cta_link}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors"
                  >
                    {banner.cta_text}
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      {banners.length > 1 && templateConfig.hero.showArrows && (
        <>
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots */}
      {banners.length > 1 && templateConfig.hero.showDots && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1 rounded-full transition-all ${
                idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

// ============================================
// PRODUCT CARD COMPONENT (con carrito integrado)
// ============================================
interface ProductCardProps {
  product: Product;
  storeSlug: string;
  currencySymbol: string;
  style?: 'minimal' | 'standard' | 'detailed';
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  storeSlug,
  currencySymbol,
  style = 'standard'
}) => {
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

    // Feedback visual
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
      <Link
        href={`/${storeSlug}/producto/${product.slug}`}
        className="block"
      >
        {/* Image Container */}
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

          {/* Wishlist Button */}
          <button
            className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:scale-110"
            onClick={(e) => {
              e.preventDefault();
              // Add to wishlist logic
            }}
          >
            <Heart className="w-4 h-4" />
          </button>

          {/* Add to Cart Button - aparece en hover */}
          <button
            onClick={handleAddToCart}
            className={`absolute bottom-3 right-3 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center
                       opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg
                       hover:bg-gray-800 hover:scale-110 ${isAdding ? 'scale-110 bg-green-500' : ''}`}
            title="Agregar al carrito"
          >
            {isAdding ? (
              <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <Plus className="w-5 h-5" />
            )}
          </button>

          {/* Image Navigation Dots */}
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

          {/* Color Variants Preview */}
          {product.colors && product.colors.length > 1 && !isHovered && (
            <div className="absolute bottom-3 left-3 flex gap-1">
              {product.colors.slice(0, 4).map((color, idx) => (
                <span
                  key={idx}
                  className="w-4 h-4 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="w-4 h-4 rounded-full bg-gray-200 text-[8px] flex items-center justify-center">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {/* Category/Brand Label */}
          {product.is_new && (
            <p className="text-orange-500 text-xs font-semibold uppercase tracking-wider mb-1">
              Nuevo
            </p>
          )}

          {/* Product Name */}
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-1 group-hover:text-gray-600 transition-colors">
            {product.name}
          </h3>

          {/* Category */}
          <p className="text-gray-500 text-sm mb-2 line-clamp-1">
            {product.category}
          </p>

          {/* Price */}
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
// PRODUCT CAROUSEL COMPONENT
// ============================================
interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: Product[];
  storeSlug: string;
  currencySymbol: string;
  viewAllLink?: string;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  title,
  subtitle,
  products,
  storeSlug,
  currencySymbol,
  viewAllLink,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 300);
    }
  };

  if (products.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {/* Carousel Controls */}
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center transition-colors ${
                canScrollLeft ? 'hover:bg-gray-100' : 'opacity-30 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center transition-colors ${
                canScrollRight ? 'hover:bg-gray-100' : 'opacity-30 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Products Scroll */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
        >
          {products.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-[280px]">
              <ProductCard
                product={product}
                storeSlug={storeSlug}
                currencySymbol={currencySymbol}
              />
            </div>
          ))}
        </div>

        {/* View All Link */}
        {viewAllLink && (
          <div className="mt-6 text-center">
            <Link
              href={viewAllLink}
              className="inline-flex items-center gap-2 text-gray-900 font-medium hover:underline"
            >
              Ver todo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

// ============================================
// PROMO BANNERS COMPONENT
// ============================================
interface PromoBanner {
  id: string;
  image: string;
  title: string;
  ctaText?: string;
  ctaLink?: string;
}

interface PromoBannersProps {
  storeSlug: string;
  promoBanners?: PromoBanner[];
}

const PromoBanners: React.FC<PromoBannersProps> = ({ storeSlug, promoBanners = [] }) => {
  // Si no hay banners configurados, no mostrar la sección
  if (promoBanners.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className={`grid gap-4 ${promoBanners.length === 1 ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
          {promoBanners.map((banner) => (
            <Link
              key={banner.id}
              href={banner.ctaLink || `/${storeSlug}/productos`}
              className="group relative aspect-[4/3] md:aspect-[16/9] overflow-hidden rounded-lg"
            >
              {banner.image ? (
                <img
                  src={resolveMediaUrl(banner.image)}
                  alt={banner.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold mb-3">{banner.title}</h3>
                {banner.ctaText && (
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full text-sm font-medium group-hover:bg-gray-100 transition-colors">
                    {banner.ctaText}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// FEATURED CATEGORIES COMPONENT
// ============================================
interface FeaturedCategoriesProps {
  categories: Category[];
  storeSlug: string;
}

const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({ categories, storeSlug }) => {
  const featuredCategories = categories.filter(c => c.image).slice(0, 5);

  if (featuredCategories.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
          Compra por categoría
        </h2>

        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 justify-center">
          {featuredCategories.map((category) => (
            <Link
              key={category.id}
              href={`/${storeSlug}/categoria/${category.slug}`}
              className="flex-shrink-0 group text-center"
            >
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-200 overflow-hidden mb-3 mx-auto group-hover:shadow-lg transition-shadow">
                <img
                  src={resolveMediaUrl(category.image)}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <span className="font-medium text-gray-900">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// FEATURES SECTION
// ============================================
interface FeaturesSectionProps {
  features: Array<{ icon: string; title: string; description: string }>;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ features }) => {
  return (
    <section className="py-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <span className="text-3xl">{feature.icon}</span>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">{feature.title}</h4>
                <p className="text-xs text-gray-500">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// FOOTER COMPONENT
// ============================================
interface FooterProps {
  config: StoreConfig;
  templateConfig: StoreTemplateConfig;
}

const Footer: React.FC<FooterProps> = ({ config, templateConfig }) => {
  const footerConfig = templateConfig.footer;

  return (
    <footer
      className="pt-16 pb-8"
      style={{
        backgroundColor: footerConfig.backgroundColor || '#111111',
        color: footerConfig.textColor || '#ffffff',
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {footerConfig.columns.map((column, idx) => (
            <div key={idx}>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4">
                {column.title}
              </h4>
              <ul className="space-y-2">
                {column.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Links */}
        {footerConfig.showSocialLinks && (
          <div className="flex items-center gap-4 mb-8">
            {config.social_links?.twitter && (
              <a href={config.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <FaTwitter className="w-6 h-6" />
              </a>
            )}
            {config.social_links?.facebook && (
              <a href={config.social_links.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <FaFacebook className="w-6 h-6" />
              </a>
            )}
            {config.social_links?.instagram && (
              <a href={config.social_links.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <FaInstagram className="w-6 h-6" />
              </a>
            )}
            {config.social_links?.tiktok && (
              <a href={config.social_links.tiktok} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <FaTiktok className="w-6 h-6" />
              </a>
            )}
          </div>
        )}

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">{footerConfig.bottomBar.copyright}</p>
          <div className="flex items-center gap-4">
            {footerConfig.bottomBar.links?.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

// ============================================
// MAIN TEMPLATE CONTENT (interno, usa el contexto)
// ============================================
const NikeStyleTemplateContent: React.FC<NikeStyleTemplateProps> = ({
  config,
  categories = [],
  products = [],
  featured_products = [],
  new_products = [],
  banners = [],
  seo,
  page_type = 'home',
  filters = {},
  filter_options = {},
  current_category,
  parent_category,
  subcategories = [],
  breadcrumbs = [],
  page_title,
  search_query,
  current_brand,
  brands = [],
  customer = null,
  culqi_public_key,
  product,
  related_products = [],
  reviews = [],
}) => {
  // Merge default config with custom config
  const templateConfig = useMemo(() => ({
    ...defaultNikeStyleConfig,
    ...config.template_config,
    // Navigation con mainMenu dinámico
    navigation: {
      ...defaultNikeStyleConfig.navigation,
      ...config.template_config?.navigation,
      // Si hay mainMenu personalizado, usarlo; sino usar el por defecto
      mainMenu: config.template_config?.navigation?.mainMenu?.length > 0
        ? config.template_config.navigation.mainMenu
        : defaultNikeStyleConfig.navigation.mainMenu,
    },
    hero: {
      ...defaultNikeStyleConfig.hero,
      ...config.template_config?.hero,
    },
    footer: {
      ...defaultNikeStyleConfig.footer,
      ...config.template_config?.footer,
    },
    // Los promoBanners vienen del editor con formato simplificado
    promoBanners: config.template_config?.promoBanners || [],
  }), [config.template_config]);

  const currencySymbol = config.currency_symbol || 'S/';

  // Get products by category - solo para home page
  // products puede ser un array o un objeto paginado con .data
  const productArray = Array.isArray(products) ? products : (products?.data || []);
  const displayProducts = featured_products.length > 0 ? featured_products : productArray.slice(0, 8);
  const latestProducts = new_products.length > 0 ? new_products : productArray.slice(0, 8);

  return (
    <>
      <Head title={seo?.title || config.name}>
        <meta name="description" content={seo?.description || config.description || ''} />
        {seo?.keywords && <meta name="keywords" content={seo.keywords} />}
        <link rel="canonical" href={seo?.url || `https://tribio.info/${config.slug}`} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={seo?.title || config.name} />
        <meta property="og:description" content={seo?.description || config.description || ''} />
        <meta property="og:url" content={seo?.url || `https://tribio.info/${config.slug}`} />
        <meta property="og:site_name" content={config.name} />
        <meta property="og:locale" content="es_PE" />
        {seo?.image && <meta property="og:image" content={seo.image} />}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo?.title || config.name} />
        <meta name="twitter:description" content={seo?.description || config.description || ''} />
        {seo?.image && <meta name="twitter:image" content={seo.image} />}

        {/* Structured Data */}
        {seo?.structured_data && (
          <script type="application/ld+json">
            {JSON.stringify(seo.structured_data)}
          </script>
        )}
      </Head>

      <div className="min-h-screen bg-white">
        <Header
          config={config}
          templateConfig={templateConfig}
          categories={categories}
        />

        <main>
          {page_type === 'home' ? (
            <>
              {/* Hero Slider */}
              <HeroSlider
                banners={banners}
                config={config}
                templateConfig={templateConfig}
              />

              {/* Product Carousel - Hits */}
              <ProductCarousel
                title="Destacados"
                products={displayProducts}
                storeSlug={config.slug}
                currencySymbol={currencySymbol}
                viewAllLink={`/${config.slug}/productos`}
              />

              {/* Promo Banners */}
              <PromoBanners storeSlug={config.slug} promoBanners={templateConfig.promoBanners} />

              {/* Featured Categories */}
              <FeaturedCategories categories={categories} storeSlug={config.slug} />

              {/* New Products */}
              <ProductCarousel
                title="Lo Nuevo"
                subtitle="Descubre las últimas novedades"
                products={latestProducts}
                storeSlug={config.slug}
                currencySymbol={currencySymbol}
                viewAllLink={`/${config.slug}/productos?sort=newest`}
              />

              {/* Features */}
              <FeaturesSection features={templateConfig.features} />
            </>
          ) : page_type === 'product' && product ? (
            /* Product Detail page */
            <ProductDetailContent
              product={product}
              relatedProducts={related_products}
              storeSlug={config.slug}
              currencySymbol={currencySymbol}
              primaryColor={templateConfig.colors?.primary || '#111'}
            />
          ) : page_type === 'checkout' ? (
            /* Checkout page */
            <CheckoutContent
              storeSlug={config.slug}
              customer={customer}
              culqiPublicKey={culqi_public_key}
            />
          ) : (
            /* Catalog/Category/Search pages */
            <CatalogContent
              storeSlug={config.slug}
              products={products}
              categories={categories}
              filterOptions={filter_options}
              activeFilters={filters}
              currentCategory={current_category}
              parentCategory={parent_category}
              subcategories={subcategories}
              breadcrumbs={breadcrumbs}
              pageTitle={page_title}
              searchQuery={search_query}
              currencySymbol={currencySymbol}
            />
          )}
        </main>

        <Footer config={config} templateConfig={templateConfig} />

        {/* Cart Drawer */}
        <CartDrawer />

        {/* WhatsApp FAB */}
        {config.whatsapp && (
          <a
            href={`https://wa.me/${config.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-green-500 text-white rounded-full shadow-lg shadow-green-500/30 flex items-center justify-center hover:scale-110 transition-transform"
          >
            <FaWhatsapp className="w-7 h-7" />
          </a>
        )}
      </div>
    </>
  );
};

// ============================================
// MAIN TEMPLATE COMPONENT (con Provider)
// ============================================
const NikeStyleTemplate: React.FC<NikeStyleTemplateProps> = (props) => {
  // Convertir config a formato compatible con StoreContext
  const storeConfig = {
    ...props.config,
    colors: {
      primary: props.config.template_config?.colors?.primary || '#111111',
    },
  };

  return (
    <StoreProvider config={storeConfig as any} categories={props.categories}>
      <NikeStyleTemplateContent {...props} />
    </StoreProvider>
  );
};

export default NikeStyleTemplate;
