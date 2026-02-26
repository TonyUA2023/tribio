/**
 * Plantilla San Valentin - "Amor & Regalos"
 * Diseño elegante y romantico para tiendas de regalos 14 de Febrero
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
  Gift,
  LogOut,
  Package,
} from 'lucide-react';
import { FaWhatsapp, FaInstagram, FaFacebook, FaTiktok, FaTwitter } from 'react-icons/fa';
import { StoreTemplateConfig } from '../types/storeTemplateConfig';
import { defaultValentineConfig } from '../types/valentineConfig';
import { StoreProvider, useStore } from '../context/StoreContext';
import { CartDrawer } from '../components/CartDrawer';
import CatalogContent from '../components/CatalogContent';
import CheckoutContent from '../components/CheckoutContent';
import ProductDetailContent from '../components/ProductDetailContent';

// ============================================
// TYPES (identical to NikeStyleTemplate)
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
  is_new?: boolean;
  is_featured?: boolean;
  rating?: number;
  reviews_count?: number;
  variants?: any[];
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

interface ValentineTemplateProps {
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
  page_type?: 'home' | 'catalog' | 'category' | 'subcategory' | 'search' | 'gender' | 'brand' | 'offers' | 'new' | 'checkout' | 'product';
  product?: any;
  related_products?: any[];
  reviews?: any[];
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
  event_products?: Product[];
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
const formatPrice = (price: number, symbol = 'S/') => `${symbol} ${price.toFixed(2)}`;

const resolveMediaUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return url;
  const publicPath = (window as any).appConfig?.filesystemPublicPath || 'storage';
  const clean = url.replace(/^uploaded_files\//, '').replace(/^storage\//, '');
  return `/${publicPath}/${clean}`;
};

// ============================================
// MOBILE MENU ITEM
// ============================================
const MobileMenuItem: React.FC<{ item: any; storeSlug: string; onClose: () => void; level?: number }> = ({
  item, storeSlug, onClose, level = 0,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  if (!item.children || item.children.length === 0) {
    return (
      <Link
        href={item.href ? `/${storeSlug}${item.href}` : '#'}
        onClick={onClose}
        className={`flex items-center justify-between py-3 border-b border-pink-100 ${level === 0 ? 'text-lg font-medium text-rose-900' : 'text-base text-rose-700'}`}
        style={{ paddingLeft: level * 16 + 16 }}
      >
        <span>{item.label}</span>
        {item.badge && <span className="text-pink-500 text-sm font-bold">{item.badge}</span>}
      </Link>
    );
  }
  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full py-3 border-b border-pink-100 ${level === 0 ? 'text-lg font-medium text-rose-900' : 'text-base text-rose-700'}`}
        style={{ paddingLeft: level * 16 + 16 }}
      >
        <span>{item.label}</span>
        <ChevronRight className={`w-5 h-5 transition-transform text-pink-400 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && (
        <div className="bg-rose-50">
          {item.children.map((child: any) => (
            <MobileMenuItem key={child.id} item={child} storeSlug={storeSlug} onClose={onClose} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// HEADER COMPONENT
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

  const primary = templateConfig.colors?.primary || '#c0392b';
  const secondary = templateConfig.colors?.secondary || '#e91e8c';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
        <div className="text-xs py-2 text-center text-white" style={{ backgroundColor: primary }}>
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <div className="flex-1" />
            <p className="font-medium tracking-wide">{templateConfig.navigation.topBar.content}</p>
            <div className="flex-1 flex justify-end gap-4">
              {templateConfig.navigation.topBar.links?.map((link, idx) => (
                <Link key={idx} href={link.href} className="text-white/80 hover:text-white transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className={`sticky top-0 z-40 bg-white transition-shadow duration-300 ${isScrolled ? 'shadow-md' : 'border-b border-pink-100'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-[64px]">
            {/* Logo */}
            <Link href={`/${config.slug}`} className="flex-shrink-0 flex items-center gap-2">
              {config.logo ? (
                <img src={resolveMediaUrl(config.logo)} alt={config.name} className="h-10 w-auto" />
              ) : (
                <div className="flex items-center gap-2">
                  <Heart className="w-6 h-6 fill-current" style={{ color: secondary }} />
                  <span className="text-xl font-bold" style={{ fontFamily: '"Playfair Display", Georgia, serif', color: primary }}>
                    {config.name}
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {templateConfig.navigation.mainMenu.map((item) => (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => setActiveMenu(item.id)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <Link
                    href={item.href ? `/${config.slug}${item.href}` : '#'}
                    className="flex items-center gap-1 px-4 py-5 text-sm font-medium text-rose-900 hover:text-rose-600 transition-colors"
                  >
                    {item.label}
                    {item.badge && (
                      <span className="text-xs font-bold ml-1" style={{ color: item.badgeColor || secondary }}>
                        {item.badge}
                      </span>
                    )}
                    {item.children && <ChevronDown className="w-4 h-4 text-pink-400" />}
                  </Link>
                </div>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:bg-rose-50 rounded-full transition-colors text-rose-800"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <button className="p-2 hover:bg-rose-50 rounded-full transition-colors hidden sm:block text-rose-800">
                <Heart className="w-5 h-5" />
              </button>

              {/* User Account */}
              <div className="relative" ref={userMenuRef}>
                {user ? (
                  <>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-rose-50 rounded-full transition-colors"
                    >
                      <div
                        className="w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-bold"
                        style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-rose-900 hidden xl:block max-w-[100px] truncate">
                        {user.name.split(' ')[0]}
                      </span>
                    </button>
                    {isUserMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-pink-100 py-2 z-50">
                        <div className="px-4 py-3 border-b border-pink-100">
                          <p className="text-sm font-semibold text-rose-900 truncate">{user.name}</p>
                          <p className="text-xs text-rose-400 truncate">{user.email}</p>
                        </div>
                        <Link
                          href={`/${config.slug}/cuenta/pedidos`}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-rose-800 hover:bg-rose-50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Package className="w-4 h-4 text-pink-500" />
                          Mis pedidos
                        </Link>
                        <Link
                          href="/mis-compras"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-rose-800 hover:bg-rose-50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Gift className="w-4 h-4 text-pink-500" />
                          Todas mis compras
                        </Link>
                        <div className="border-t border-pink-100 mt-1 pt-1">
                          <Link
                            href={`/${config.slug}/cuenta/logout`}
                            method="post"
                            as="button"
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
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
                    className="p-2 hover:bg-rose-50 rounded-full transition-colors text-rose-800"
                  >
                    <User className="w-5 h-5" />
                  </Link>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 hover:bg-rose-50 rounded-full transition-colors relative text-rose-800"
                aria-label="Carrito"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center font-medium"
                    style={{ backgroundColor: primary }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 hover:bg-rose-50 rounded-full transition-colors lg:hidden text-rose-800"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mega Menu */}
        {activeMenu && (
          <>
            {templateConfig.navigation.mainMenu
              .filter((item) => item.id === activeMenu && item.children)
              .map((item) => (
                <div
                  key={item.id}
                  className="absolute left-0 right-0 top-full bg-white border-t border-pink-100 shadow-2xl z-50"
                  onMouseEnter={() => setActiveMenu(item.id)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <div className="max-w-7xl mx-auto px-6 py-8">
                    <div
                      className="grid gap-8"
                      style={{ gridTemplateColumns: `repeat(${Math.min(item.children!.length, item.columns || 3)}, minmax(0, 1fr))` }}
                    >
                      {item.children!.map((section: any, idx: number) => (
                        <div key={section.id || idx} className="min-w-0">
                          <h3 className="font-bold text-rose-900 text-sm uppercase tracking-wider mb-4 pb-2 border-b border-pink-200">
                            {section.label}
                          </h3>
                          <ul className="space-y-2.5">
                            {section.children?.map((link: any, linkIdx: number) => (
                              <li key={link.id || linkIdx}>
                                <Link
                                  href={`/${config.slug}${link.href || '/productos'}`}
                                  className="text-rose-700 hover:text-rose-500 text-sm flex items-center gap-2 transition-colors group"
                                  onClick={() => setActiveMenu(null)}
                                >
                                  <span className="group-hover:translate-x-1 transition-transform duration-200">{link.label}</span>
                                  {link.badge && <span className="text-pink-400 text-xs">{link.badge}</span>}
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
        <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 pt-20">
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-rose-50 rounded-full text-rose-700"
            >
              <X className="w-6 h-6" />
            </button>
            <form onSubmit={handleSearch}>
              <div className="flex items-center border-b-2 pb-4" style={{ borderColor: primary }}>
                <Search className="w-6 h-6 mr-4 text-rose-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Busca el regalo perfecto..."
                  className="flex-1 text-2xl font-medium outline-none placeholder-rose-300 text-rose-900"
                  autoFocus
                />
              </div>
            </form>
            <div className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400 mb-4">Busquedas populares</h3>
              <div className="flex flex-wrap gap-2">
                {['Rosas', 'Perfumes', 'Joyeria', 'Chocolates', 'Peluches', 'Experiencias'].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      router.get(`/${config.slug}/productos`, { search: term });
                      setIsSearchOpen(false);
                    }}
                    className="px-4 py-2 bg-rose-50 text-rose-700 rounded-full text-sm hover:bg-rose-100 transition-colors border border-pink-200"
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
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 fill-current" style={{ color: secondary }} />
                <span className="text-xl font-bold" style={{ fontFamily: '"Playfair Display", Georgia, serif', color: primary }}>
                  {config.name}
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-rose-50 rounded-full text-rose-700"
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

            {/* User section */}
            <div className="mt-8 pt-6 border-t border-pink-200">
              {user ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-3 px-3 py-3 mb-2">
                    <div
                      className="w-10 h-10 rounded-full text-white flex items-center justify-center text-sm font-bold"
                      style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-rose-900 truncate">{user.name}</p>
                      <p className="text-xs text-rose-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link href={`/${config.slug}/cuenta/pedidos`} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-rose-50 text-rose-800" onClick={() => setIsMobileMenuOpen(false)}>
                    <Package className="w-5 h-5 text-pink-400" /><span className="font-medium">Mis pedidos</span>
                  </Link>
                  <Link
                    href={`/${config.slug}/cuenta/logout`}
                    method="post"
                    as="button"
                    className="flex items-center gap-3 w-full px-3 py-3 rounded-xl hover:bg-red-50 text-red-500"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LogOut className="w-5 h-5" /><span className="font-medium">Cerrar sesion</span>
                  </Link>
                </div>
              ) : (
                <Link
                  href={`/${config.slug}/cuenta/login`}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium text-white"
                  style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
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

// ============================================
// HERO SLIDER - Valentín
// ============================================
interface HeroSliderProps {
  banners: Banner[];
  config: StoreConfig;
  templateConfig: StoreTemplateConfig;
}

const HeroSlider: React.FC<HeroSliderProps> = ({ banners, config, templateConfig }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const primary = templateConfig.colors?.primary || '#c0392b';
  const secondary = templateConfig.colors?.secondary || '#e91e8c';

  // Use default valentine slides when no banners
  const slides = useMemo(() => {
    if (banners.length > 0) return banners;
    return templateConfig.hero.slides || [];
  }, [banners, templateConfig.hero.slides]);

  useEffect(() => {
    if (!templateConfig.hero.autoplay || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, templateConfig.hero.autoplaySpeed || 5000);
    return () => clearInterval(interval);
  }, [slides.length, templateConfig.hero.autoplay, templateConfig.hero.autoplaySpeed]);

  if (slides.length === 0) {
    return (
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          height: templateConfig.hero.height?.desktop || '88vh',
          background: `linear-gradient(135deg, #2d0a0a 0%, #4a0a2e 50%, #1a0a00 100%)`,
        }}
      >
        {/* Decorative hearts */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {['top-10 left-10', 'top-20 right-20', 'bottom-16 left-1/4', 'top-1/3 right-1/3'].map((pos, i) => (
            <div key={i} className={`absolute ${pos} opacity-10 text-white text-6xl`}>❤️</div>
          ))}
        </div>
        <div className="text-center px-4 relative z-10">
          <p className="text-pink-300 uppercase tracking-widest text-sm mb-4">San Valentin 2025</p>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            {config.name}
          </h1>
          <p className="text-lg text-pink-200 mb-10 max-w-lg mx-auto">{config.description || 'El regalo perfecto para el amor de tu vida'}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${config.slug}/productos`}
              className="inline-flex items-center gap-2 px-8 py-4 text-white rounded-full font-semibold hover:opacity-90 transition-opacity shadow-lg"
              style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
            >
              <Gift className="w-5 h-5" />
              Explorar Regalos
            </Link>
            <Link
              href={`/${config.slug}/ofertas`}
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/40 text-white rounded-full font-medium hover:border-white transition-colors"
            >
              Ver Ofertas
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative overflow-hidden"
      style={{ height: templateConfig.hero.height?.desktop || '88vh' }}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide: any, idx: number) => {
          const mediaUrl = slide.media || slide.image || '';
          const slideTitle = slide.title || '';
          const slideSubtitle = slide.subtitle || slide.description || '';
          const cta = slide.cta || (slide.cta_text ? { text: slide.cta_text, href: slide.cta_link || '/productos' } : null);
          const secondaryCta = slide.secondaryCta;
          const overlayColor = slide.overlayColor || '#000000';
          const overlayOpacity = slide.overlayOpacity ?? 0.5;
          const contentPos = slide.contentPosition || 'center';

          return (
            <div key={slide.id || idx} className="flex-shrink-0 w-full h-full relative">
              {mediaUrl ? (
                <img src={resolveMediaUrl(mediaUrl)} alt={slideTitle} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full" style={{ background: `linear-gradient(135deg, #2d0a0a 0%, #4a0a2e 100%)` }} />
              )}

              {/* Overlay */}
              <div
                className="absolute inset-0"
                style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
              />

              {/* Romantic decorative elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-8 left-8 opacity-20 text-white text-4xl">❤️</div>
                <div className="absolute bottom-12 right-12 opacity-15 text-white text-6xl">💕</div>
                <div className="absolute top-1/4 right-1/4 opacity-10 text-white text-3xl">✨</div>
              </div>

              {/* Content */}
              <div className={`absolute inset-0 flex items-center z-10 ${
                contentPos === 'center' ? 'justify-center text-center' :
                contentPos === 'right' ? 'justify-end text-right' :
                'justify-start text-left'
              } px-8 md:px-16 lg:px-24`}>
                <div className="max-w-2xl">
                  {slideSubtitle && (
                    <p className="text-pink-300 uppercase tracking-widest text-sm md:text-base mb-4 font-medium">
                      {slideSubtitle}
                    </p>
                  )}
                  {slideTitle && (
                    <h2
                      className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight whitespace-pre-line"
                      style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                    >
                      {slideTitle}
                    </h2>
                  )}
                  <div className="flex flex-col sm:flex-row gap-4 mt-8" style={{ justifyContent: contentPos === 'center' ? 'center' : contentPos === 'right' ? 'flex-end' : 'flex-start' }}>
                    {cta && (
                      <Link
                        href={`/${config.slug}${cta.href?.startsWith('/') ? cta.href : '/' + (cta.href || 'productos')}`}
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 text-white"
                        style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                      >
                        <Heart className="w-5 h-5 fill-current" />
                        {cta.text}
                      </Link>
                    )}
                    {secondaryCta && (
                      <Link
                        href={`/${config.slug}${secondaryCta.href?.startsWith('/') ? secondaryCta.href : '/' + (secondaryCta.href || 'productos')}`}
                        className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/60 text-white rounded-full font-medium hover:border-white hover:bg-white/10 transition-all"
                      >
                        {secondaryCta.text}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && templateConfig.hero.showArrows && (
        <>
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors text-white"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && templateConfig.hero.showDots && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className="h-2 rounded-full transition-all"
              style={{
                width: idx === currentSlide ? 32 : 8,
                backgroundColor: idx === currentSlide ? '#fff' : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
};

// ============================================
// PRODUCT CARD - Valentine Style
// ============================================
interface ProductCardProps {
  product: Product;
  storeSlug: string;
  currencySymbol: string;
  primary: string;
  secondary: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, storeSlug, currencySymbol, primary, secondary }) => {
  const { addToCart, setIsCartOpen } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isWished, setIsWished] = useState(false);

  const images = product.images?.length ? product.images : [product.image];
  const hasDiscount = product.compare_price && product.compare_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.compare_price!) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    addToCart({ id: product.id, name: product.name, slug: product.slug, price: product.price, image: product.image, quantity: 1 });
    setTimeout(() => { setIsAdding(false); setIsCartOpen(true); }, 300);
  };

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      <Link href={`/${storeSlug}/producto/${product.slug}`} className="block">
        <div className="relative aspect-square bg-rose-50 overflow-hidden">
          <img
            src={resolveMediaUrl(images[0])}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
            style={{ transform: undefined }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_new && (
              <span className="px-2.5 py-1 text-white text-xs font-bold rounded-full" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
                Nuevo
              </span>
            )}
            {hasDiscount && (
              <span className="px-2.5 py-1 bg-rose-500 text-white text-xs font-bold rounded-full">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={(e) => { e.preventDefault(); setIsWished(!isWished); }}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          >
            <Heart className={`w-4 h-4 transition-colors ${isWished ? 'fill-rose-500 text-rose-500' : 'text-rose-400'}`} />
          </button>

          {/* Add to cart overlay */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="w-full py-3 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-opacity"
              style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
            >
              {isAdding ? (
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4 fill-current animate-pulse" /> Agregado ❤️
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Gift className="w-4 h-4" /> Agregar al carrito
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="p-4">
          <p className="text-xs text-rose-400 uppercase tracking-wider mb-1">{product.category || product.brand}</p>
          <h3 className="font-semibold text-rose-900 mb-2 line-clamp-2 leading-snug">{product.name}</h3>
          <div className="flex items-center gap-2">
            <span className="font-bold text-rose-800 text-lg">{formatPrice(product.price, currencySymbol)}</span>
            {hasDiscount && (
              <span className="text-sm text-rose-300 line-through">{formatPrice(product.compare_price!, currencySymbol)}</span>
            )}
          </div>
          {product.rating && (
            <div className="flex items-center gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
              ))}
              {product.reviews_count && <span className="text-xs text-rose-300 ml-1">({product.reviews_count})</span>}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

// ============================================
// PRODUCT CAROUSEL - Valentine
// ============================================
interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: Product[];
  storeSlug: string;
  currencySymbol: string;
  viewAllLink?: string;
  primary: string;
  secondary: string;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  title, subtitle, products, storeSlug, currencySymbol, viewAllLink, primary, secondary,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
    }
  };

  if (!products.length) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2
              className="text-2xl md:text-4xl font-bold mb-2"
              style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#2d1b1b' }}
            >
              {title}
            </h2>
            {subtitle && <p className="text-rose-500 text-sm">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => scroll('left')} className="w-10 h-10 border-2 border-pink-200 rounded-full flex items-center justify-center hover:border-rose-400 transition-colors text-rose-600">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => scroll('right')} className="w-10 h-10 border-2 border-pink-200 rounded-full flex items-center justify-center hover:border-rose-400 transition-colors text-rose-600">
              <ChevronRight className="w-5 h-5" />
            </button>
            {viewAllLink && (
              <Link
                href={viewAllLink}
                className="hidden sm:flex items-center gap-1 text-sm font-medium transition-colors"
                style={{ color: primary }}
              >
                Ver todos <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth -mx-4 px-4 pb-4"
        >
          {products.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-64 md:w-72">
              <ProductCard
                product={product}
                storeSlug={storeSlug}
                currencySymbol={currencySymbol}
                primary={primary}
                secondary={secondary}
              />
            </div>
          ))}
        </div>

        {viewAllLink && (
          <div className="mt-8 text-center sm:hidden">
            <Link href={viewAllLink} className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: primary }}>
              Ver todos los productos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

// ============================================
// PRODUCT GRID - Valentine
// ============================================
interface ProductGridProps {
  title: string;
  subtitle?: string;
  products: Product[];
  storeSlug: string;
  currencySymbol: string;
  viewAllLink?: string;
  columns?: number;
  primary: string;
  secondary: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  title, subtitle, products, storeSlug, currencySymbol, viewAllLink, columns = 4, primary, secondary,
}) => {
  if (!products.length) return null;

  return (
    <section className="py-12 md:py-16 bg-rose-50/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2
              className="text-2xl md:text-4xl font-bold mb-2"
              style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#2d1b1b' }}
            >
              {title}
            </h2>
            {subtitle && <p className="text-rose-500 text-sm">{subtitle}</p>}
          </div>
          {viewAllLink && (
            <Link href={viewAllLink} className="text-sm font-medium flex items-center gap-1" style={{ color: primary }}>
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
        <div className={`grid gap-4 grid-cols-2 md:grid-cols-${Math.min(columns, 3)} lg:grid-cols-${columns}`}>
          {products.slice(0, columns * 2).map((product) => (
            <ProductCard key={product.id} product={product} storeSlug={storeSlug} currencySymbol={currencySymbol} primary={primary} secondary={secondary} />
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// PROMO BANNERS - Valentine Split
// ============================================
interface PromoBannersProps {
  config: StoreConfig;
  primary: string;
  secondary: string;
}

const PromoBanners: React.FC<PromoBannersProps> = ({ config, primary, secondary }) => {
  const defaultItems = [
    {
      gradient: `linear-gradient(135deg, #4a0a2e 0%, #c0392b 100%)`,
      emoji: '👸',
      title: 'Para Ella',
      subtitle: 'Joyeria, flores y fragancias',
      href: `/${config.slug}/productos`,
    },
    {
      gradient: `linear-gradient(135deg, #1a0a00 0%, #4a2000 100%)`,
      emoji: '🤴',
      title: 'Para El',
      subtitle: 'Relojes, perfumes y experiencias',
      href: `/${config.slug}/productos`,
    },
  ];

  return (
    <section className="py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {defaultItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="relative rounded-2xl overflow-hidden group block h-56 md:h-72"
              style={{ background: item.gradient }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-8">
                <span className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">{item.emoji}</span>
                <h3 className="text-3xl font-bold mb-2" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>{item.title}</h3>
                <p className="text-white/80 text-sm mb-6">{item.subtitle}</p>
                <span className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-white/60 text-white rounded-full text-sm font-medium group-hover:bg-white/20 transition-colors">
                  Ver Regalos <ArrowRight className="w-4 h-4" />
                </span>
              </div>
              {/* Decorative hearts */}
              <div className="absolute top-4 left-4 opacity-20 text-4xl">❤️</div>
              <div className="absolute bottom-4 right-4 opacity-15 text-3xl">💕</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// COUNTDOWN BANNER
// ============================================
const CountdownBanner: React.FC<{ primary: string; secondary: string }> = ({ primary, secondary }) => {
  const valentineDate = new Date('2025-02-14T00:00:00');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [show, setShow] = useState(false);

  useEffect(() => {
    const now = new Date();
    if (now >= valentineDate) return;
    setShow(true);
    const tick = () => {
      const diff = valentineDate.getTime() - new Date().getTime();
      if (diff <= 0) { setShow(false); return; }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!show) return null;

  return (
    <section
      className="py-12 text-white text-center relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, #2d0a0a 0%, #4a0a2e 50%, #1a0a00 100%)` }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-4 left-8 opacity-20 text-4xl">❤️</div>
        <div className="absolute bottom-4 right-8 opacity-20 text-4xl">💕</div>
      </div>
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <p className="text-pink-300 uppercase tracking-widest text-sm mb-3">Cuenta regresiva</p>
        <h2 className="text-3xl md:text-4xl font-bold mb-8" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
          ❤️ El 14 de Febrero se acerca ❤️
        </h2>
        <div className="flex items-center justify-center gap-4 md:gap-8">
          {[{ value: timeLeft.days, label: 'Dias' }, { value: timeLeft.hours, label: 'Horas' }, { value: timeLeft.minutes, label: 'Minutos' }, { value: timeLeft.seconds, label: 'Segundos' }].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-2 border border-white/20">
                <span className="text-3xl md:text-4xl font-bold tabular-nums">
                  {String(value).padStart(2, '0')}
                </span>
              </div>
              <span className="text-xs text-pink-300 uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>
        <p className="text-pink-200 mt-8 text-sm">No esperes mas — sorprende a esa persona especial</p>
      </div>
    </section>
  );
};

// ============================================
// FEATURED CATEGORIES - Valentine
// ============================================
interface FeaturedCategoriesProps {
  categories: Category[];
  storeSlug: string;
  primary: string;
}

const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({ categories, storeSlug, primary }) => {
  const categoryIcons: Record<string, string> = {
    default: '🎁',
    flores: '🌹', rosas: '🌹', arreglos: '💐',
    joyeria: '💎', collares: '📿', pulseras: '📿', anillos: '💍',
    perfumes: '🌸', chocolates: '🍫', peluches: '🧸',
    relojes: '⌚', experiencias: '✨', spa: '🛁',
  };

  const withImages = categories.filter(c => c.image).slice(0, 6);
  const noImages = categories.filter(c => !c.image).slice(0, 8);
  const displayCats = withImages.length >= 4 ? withImages : noImages;

  if (displayCats.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10" style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#2d1b1b' }}>
          Explora por Categoria
        </h2>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 justify-start lg:justify-center -mx-4 px-4">
          {displayCats.map((category) => {
            const icon = categoryIcons[category.slug?.toLowerCase()] || categoryIcons.default;
            return (
              <Link
                key={category.id}
                href={`/${storeSlug}/categoria/${category.slug}`}
                className="flex-shrink-0 group text-center"
              >
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden mb-3 mx-auto group-hover:shadow-lg transition-all duration-300 border-2 border-pink-100 group-hover:border-pink-400" style={{ background: 'linear-gradient(135deg, #fff5f7 0%, #fce4ec 100%)' }}>
                  {category.image ? (
                    <img src={resolveMediaUrl(category.image)} alt={category.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">{icon}</div>
                  )}
                </div>
                <span className="font-medium text-rose-800 text-sm">{category.name}</span>
                {category.products_count !== undefined && (
                  <p className="text-xs text-rose-400 mt-0.5">{category.products_count} regalos</p>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ============================================
// FEATURES SECTION - Valentine
// ============================================
const FeaturesSection: React.FC<{ features: Array<{ icon: string; title: string; description: string }>; primary: string }> = ({ features, primary }) => {
  return (
    <section className="py-12 md:py-16 border-t border-pink-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="text-center group">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 transition-transform group-hover:scale-110 shadow-sm"
                style={{ background: 'linear-gradient(135deg, #fff0f5 0%, #fce4ec 100%)', border: '1px solid #f8bbd0' }}
              >
                {feature.icon}
              </div>
              <h4 className="font-semibold text-rose-900 text-sm mb-1">{feature.title}</h4>
              <p className="text-xs text-rose-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// FOOTER - Valentine
// ============================================
interface FooterProps {
  config: StoreConfig;
  templateConfig: StoreTemplateConfig;
}

const Footer: React.FC<FooterProps> = ({ config, templateConfig }) => {
  const footerConfig = templateConfig.footer;
  const bgColor = footerConfig.backgroundColor || '#2d0a0a';
  const textColor = footerConfig.textColor || '#fce4ec';
  const [email, setEmail] = useState('');

  return (
    <footer style={{ backgroundColor: bgColor, color: textColor }}>
      {/* Newsletter */}
      {footerConfig.showNewsletter && (
        <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="max-w-xl mx-auto text-center">
              <p className="text-pink-300 uppercase tracking-widest text-xs mb-3">Newsletter</p>
              <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                {footerConfig.newsletterTitle || 'Recibe Inspiracion Romantica'}
              </h3>
              <p className="text-sm mb-6 opacity-70">{footerConfig.newsletterDescription || 'Suscribete y recibe ideas de regalos y ofertas exclusivas'}</p>
              <form
                onSubmit={(e) => { e.preventDefault(); setEmail(''); }}
                className="flex gap-2 max-w-md mx-auto"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="flex-1 px-4 py-3 rounded-full text-sm bg-white/10 border border-white/20 placeholder-white/40 text-white outline-none focus:border-pink-400"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-full text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #c0392b, #e91e8c)' }}
                >
                  Suscribirse
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6 fill-current text-pink-400" />
              <span className="text-xl font-bold" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>{config.name}</span>
            </div>
            <p className="text-sm opacity-60 mb-6 leading-relaxed">
              {config.description || 'El regalo perfecto para el amor de tu vida este 14 de Febrero.'}
            </p>
            {footerConfig.showSocialLinks && (
              <div className="flex gap-3">
                {config.social_links?.instagram && (
                  <a href={config.social_links.instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-pink-500 transition-colors">
                    <FaInstagram className="w-4 h-4" />
                  </a>
                )}
                {config.social_links?.facebook && (
                  <a href={config.social_links.facebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                    <FaFacebook className="w-4 h-4" />
                  </a>
                )}
                {config.social_links?.tiktok && (
                  <a href={config.social_links.tiktok} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-black transition-colors">
                    <FaTiktok className="w-4 h-4" />
                  </a>
                )}
                {config.social_links?.twitter && (
                  <a href={config.social_links.twitter} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-sky-500 transition-colors">
                    <FaTwitter className="w-4 h-4" />
                  </a>
                )}
                {config.whatsapp && (
                  <a href={`https://wa.me/${config.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-green-500 transition-colors">
                    <FaWhatsapp className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Footer columns */}
          {footerConfig.columns.slice(0, 3).map((col, idx) => (
            <div key={idx}>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-pink-300">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link href={link.href} className="text-sm opacity-60 hover:opacity-100 transition-opacity">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs opacity-50">{footerConfig.bottomBar.copyright}</p>
          <div className="flex gap-4">
            {footerConfig.bottomBar.links?.map((link, idx) => (
              <Link key={idx} href={link.href} className="text-xs opacity-50 hover:opacity-80 transition-opacity">
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
// MAIN TEMPLATE CONTENT
// ============================================
const ValentineTemplateContent: React.FC<ValentineTemplateProps> = ({
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
  event_products = [],
}) => {
  const templateConfig = useMemo(() => ({
    ...defaultValentineConfig,
    ...config.template_config,
    navigation: {
      ...defaultValentineConfig.navigation,
      ...config.template_config?.navigation,
      mainMenu:
        config.template_config?.navigation?.mainMenu?.length > 0
          ? config.template_config.navigation.mainMenu
          : defaultValentineConfig.navigation.mainMenu,
    },
    hero: { ...defaultValentineConfig.hero, ...config.template_config?.hero },
    footer: { ...defaultValentineConfig.footer, ...config.template_config?.footer },
    colors: { ...defaultValentineConfig.colors, ...config.template_config?.colors },
    features: config.template_config?.features?.length
      ? config.template_config.features
      : defaultValentineConfig.features,
    promoBanners: config.template_config?.promoBanners || [],
  }), [config.template_config]);

  const currencySymbol = config.currency_symbol || 'S/';
  const primary = templateConfig.colors?.primary || '#c0392b';
  const secondary = templateConfig.colors?.secondary || '#e91e8c';

  const productArray = Array.isArray(products) ? products : (products?.data || []);
  const displayProducts = featured_products.length > 0 ? featured_products : productArray.slice(0, 8);
  const latestProducts = new_products.length > 0 ? new_products : productArray.slice(0, 8);
  const moreProducts = productArray.slice(0, 6);

  return (
    <>
      <Head title={seo?.title || `${config.name} - Regalos San Valentin`}>
        <meta name="description" content={seo?.description || config.description || 'Regalos perfectos para San Valentin'} />
        {seo?.keywords && <meta name="keywords" content={seo.keywords} />}
        <link rel="canonical" href={seo?.url || `https://tribio.info/${config.slug}`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={seo?.title || config.name} />
        <meta property="og:description" content={seo?.description || config.description || ''} />
        {seo?.image && <meta property="og:image" content={seo.image} />}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700&display=swap" rel="stylesheet" />
        {seo?.structured_data && (
          <script type="application/ld+json">{JSON.stringify(seo.structured_data)}</script>
        )}
      </Head>

      <div className="min-h-screen" style={{ backgroundColor: templateConfig.colors?.background || '#fff5f7', fontFamily: '"Lato", "Helvetica Neue", sans-serif' }}>
        <Header config={config} templateConfig={templateConfig} categories={categories} />

        <main>
          {page_type === 'home' ? (
            <>
              {/* Hero */}
              <HeroSlider banners={banners} config={config} templateConfig={templateConfig} />

              {/* Regalos Mas Populares */}
              <ProductCarousel
                title="Regalos Mas Populares"
                subtitle="Los favoritos de San Valentin"
                products={displayProducts}
                storeSlug={config.slug}
                currencySymbol={currencySymbol}
                viewAllLink={`/${config.slug}/productos`}
                primary={primary}
                secondary={secondary}
              />

              {/* Para Ella / Para El banners */}
              <PromoBanners config={config} primary={primary} secondary={secondary} />

              {/* Categorias */}
              <FeaturedCategories categories={categories} storeSlug={config.slug} primary={primary} />

              {/* Categoria Eventos */}
              {event_products.length > 0 && (
                <ProductCarousel
                  title="🎉 Categoría Eventos"
                  subtitle="Regalos perfectos para cada celebración especial"
                  products={event_products}
                  storeSlug={config.slug}
                  currencySymbol={currencySymbol}
                  viewAllLink={`/${config.slug}/categoria/eventos`}
                  primary={primary}
                  secondary={secondary}
                />
              )}

              {/* Novedades */}
              <ProductGrid
                title="Novedades San Valentin"
                subtitle="Recien llegados para esta temporada"
                products={latestProducts}
                storeSlug={config.slug}
                currencySymbol={currencySymbol}
                viewAllLink={`/${config.slug}/productos`}
                columns={4}
                primary={primary}
                secondary={secondary}
              />

              {/* Countdown */}
              <CountdownBanner primary={primary} secondary={secondary} />

              {/* Experiencias & Detalles */}
              {moreProducts.length > 0 && (
                <ProductGrid
                  title="Experiencias & Detalles"
                  subtitle="Momentos que se recuerdan para siempre"
                  products={moreProducts}
                  storeSlug={config.slug}
                  currencySymbol={currencySymbol}
                  viewAllLink={`/${config.slug}/productos`}
                  columns={3}
                  primary={primary}
                  secondary={secondary}
                />
              )}

              {/* Features */}
              <FeaturesSection features={templateConfig.features} primary={primary} />
            </>
          ) : page_type === 'product' && product ? (
            <ProductDetailContent
              product={product}
              relatedProducts={related_products}
              storeSlug={config.slug}
              currencySymbol={currencySymbol}
              primaryColor={primary}
            />
          ) : page_type === 'checkout' ? (
            <CheckoutContent
              storeSlug={config.slug}
              customer={customer}
              culqiPublicKey={culqi_public_key}
            />
          ) : (
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
            className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          >
            <FaWhatsapp className="w-7 h-7" />
          </a>
        )}

        {/* Love FAB - scroll to top */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 right-6 z-40 w-12 h-12 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform text-xl"
          style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
          aria-label="Volver arriba"
        >
          ❤️
        </button>
      </div>
    </>
  );
};

// ============================================
// MAIN EXPORT - con StoreProvider
// ============================================
const ValentineTemplate: React.FC<ValentineTemplateProps> = (props) => {
  const storeConfig = {
    ...props.config,
    colors: {
      primary: props.config.template_config?.colors?.primary || '#c0392b',
    },
  };

  return (
    <StoreProvider config={storeConfig as any} categories={props.categories}>
      <ValentineTemplateContent {...props} />
    </StoreProvider>
  );
};

export default ValentineTemplate;
