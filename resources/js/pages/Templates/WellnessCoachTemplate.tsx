import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Head } from '@inertiajs/react';
import {
  FaInstagram, FaTiktok, FaFacebook, FaMapMarkerAlt,
  FaClock, FaSearch, FaPlus, FaChevronRight, FaChevronLeft,
  FaWhatsapp, FaDumbbell, FaBolt, FaHeartbeat, FaGlobe, FaEnvelope,
  FaTimes, FaInfoCircle, FaShoppingBag, FaStar, FaFilter
} from 'react-icons/fa';

import { useCart, Product } from '@/hooks/useCart';
import { CartDrawer } from '@/components/checkout/CartDrawer';
import { CheckoutModal } from '@/components/checkout/CheckoutModal';
import { PremiumCarousel, CarouselImage } from '@/components/gallery/PremiumCarousel';
import { StoryCircle } from '@/components/stories/StoryCircle';
import { ScrollReveal } from '@/components/animated/ScrollReveal';
import { LoadingScreen } from '@/components/LoadingScreen';
import PostGridModal from '@/components/posts/PostGridModal';
import { ReviewsList } from '@/components/reviews/ReviewsList';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ShareButton } from '@/components/ShareButton';
import { normalizeSocialLinks } from '@/utils/socialLinks';
import { resolveMediaUrl } from '@/utils/mediaUrl';

// --- CONFIGURACIÓN ---
const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram', icon: <FaInstagram size={20} />, color: 'from-purple-600 via-pink-600 to-orange-500', iconColor: 'text-pink-400' },
  { key: 'tiktok', label: 'TikTok', icon: <FaTiktok size={20} />, color: 'from-cyan-400 via-pink-500 to-purple-600', iconColor: 'text-cyan-400' },
  { key: 'facebook', label: 'Facebook', icon: <FaFacebook size={20} />, color: 'from-blue-600 to-blue-500', iconColor: 'text-blue-400' },
  { key: 'whatsapp', label: 'WhatsApp', icon: <FaWhatsapp size={20} />, color: 'from-green-500 to-green-600', iconColor: 'text-green-400' },
  { key: 'website', label: 'Web', icon: <FaGlobe size={20} />, color: 'from-gray-500 to-gray-600', iconColor: 'text-gray-400' },
  { key: 'email', label: 'Email', icon: <FaEnvelope size={20} />, color: 'from-red-500 to-red-600', iconColor: 'text-red-400' },
];

export interface TemplateConfig {
  hide_prices?: boolean;
  language?: 'es' | 'en';
  show_description?: boolean;
  currency?: string;
  currency_symbol?: string;
}

export interface WellnessConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  loadingImage?: string;
  coverImage?: string;
  logoImage?: string;
  businessName: string;
  businessTitle: string;
  businessBio?: string;
  products: Product[];
  socialLinks?: Record<string, string>;
  social_links?: Record<string, string>;
  schedule?: string;
  address?: string;
  gallery?: CarouselImage[];
  profileId: number;
  accountSlug: string;
  templateConfig?: TemplateConfig;
}

interface TemplateProps {
  config: WellnessConfig;
  customizations?: any;
}

// Textos multiidioma
interface Translations {
  search: string;
  all: string;
  featured: string;
  catalog: string;
  noProducts: string;
  gallery: string;
  blog: string;
  testimonials: string;
  total: string;
  viewOrder: string;
  seeMore: string;
  description: string;
  addToCart: string;
  yourOrder: string;
  emptyCart: string;
  subtotal: string;
  continue: string;
  items: string;
  item: string;
  checkOut: string;
  filters: string;
  categories: string;
  viewCart: string;
  products: string;
}

const translations: Record<'es' | 'en', Translations> = {
  es: {
    search: 'Buscar suplementos...',
    all: 'Todos',
    featured: 'Destacados',
    catalog: 'Catálogo Completo',
    noProducts: 'No se encontraron productos.',
    gallery: 'Galería',
    blog: 'Blog & Tips',
    testimonials: 'Testimonios',
    total: 'Total a pagar',
    viewOrder: 'Ver Pedido',
    seeMore: 'Ver más',
    description: 'Descripción',
    addToCart: 'Agregar al Carrito',
    yourOrder: 'Tu Pedido',
    emptyCart: 'Tu carrito está vacío',
    subtotal: 'Subtotal',
    continue: 'Continuar',
    items: 'productos',
    item: 'producto',
    checkOut: 'Conoce',
    filters: 'Filtros',
    categories: 'Categorías',
    viewCart: 'Ver Carrito',
    products: 'Productos',
  },
  en: {
    search: 'Search supplements...',
    all: 'All',
    featured: 'Featured',
    catalog: 'Full Catalog',
    noProducts: 'No products found.',
    gallery: 'Gallery',
    blog: 'Blog & Tips',
    testimonials: 'Testimonials',
    total: 'Total to pay',
    viewOrder: 'View Order',
    seeMore: 'See more',
    description: 'Description',
    addToCart: 'Add to Cart',
    yourOrder: 'Your Order',
    emptyCart: 'Your cart is empty',
    subtotal: 'Subtotal',
    continue: 'Continue',
    items: 'items',
    item: 'item',
    checkOut: 'Check out',
    filters: 'Filters',
    categories: 'Categories',
    viewCart: 'View Cart',
    products: 'Products',
  }
};

const money = (n: number, config?: TemplateConfig) => {
  const symbol = config?.currency_symbol || 'S/';
  return `${symbol} ${Number(n).toFixed(2)}`;
};

// --- COMPONENTES VISUALES ---
const DarkFitnessBackground = ({ color }: { color: string }) => (
  <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-[#09090b]">
    <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-[#1c1c1c] to-transparent opacity-60" />
    <div className="absolute inset-0 opacity-[0.03]" style={{ color: color }}>
        <div className="grid grid-cols-6 gap-12 p-4 rotate-12 scale-125">
             {[...Array(50)].map((_, i) => {
                 const Icon = [FaDumbbell, FaBolt, FaHeartbeat][i % 3];
                 return <div key={i} className="flex justify-center"><Icon size={40} /></div>
             })}
        </div>
    </div>
  </div>
);

const CategoryPill = ({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap border
      ${isActive
        ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] transform scale-105'
        : 'bg-black/40 text-gray-400 border-white/10 hover:border-white/30 hover:text-white'}`}
  >
    {label}
  </button>
);

// Card para Desktop - Más grande y con más detalles
const DesktopProductCard = ({
  product,
  onAdd,
  accentColor,
  hidePrices,
  showDescription,
  templateConfig,
  t
}: {
  product: Product,
  onAdd: (p: Product) => void,
  accentColor: string,
  hidePrices?: boolean,
  showDescription?: boolean,
  templateConfig?: TemplateConfig,
  t?: Translations
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative bg-[#18181b] rounded-2xl overflow-hidden border border-white/5 shadow-lg flex flex-col h-full hover:border-white/20 transition-all duration-300 cursor-pointer"
      >
        {/* Imagen más grande para desktop */}
        <div className="relative h-52 w-full overflow-hidden bg-[#0f0f10]">
            {product.image ? (
                <img
                src={resolveMediaUrl(product.image)}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-500 ${isHovered ? 'scale-110 brightness-110' : 'scale-100'}`}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-700 bg-gradient-to-br from-gray-800 to-gray-900">
                   <FaDumbbell size={40} />
                </div>
            )}

            {/* Overlay en hover */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <div className="absolute bottom-4 left-4 right-4">
                {product.available && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onAdd(product); }}
                    className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:brightness-110"
                    style={{ backgroundColor: accentColor, color: '#000' }}
                  >
                    <FaPlus size={12} />
                    {t?.addToCart || 'Agregar'}
                  </button>
                )}
              </div>
            </div>

            {product.featured && (
                <div className="absolute top-3 left-3 bg-yellow-500 text-black text-[10px] font-black px-3 py-1.5 rounded-lg shadow-lg z-10 uppercase tracking-wide flex items-center gap-1">
                    <FaStar size={10} /> Top
                </div>
            )}

            {/* Quick add en mobile dentro de desktop */}
            {product.available && !isHovered && (
                <button
                    onClick={(e) => { e.stopPropagation(); onAdd(product); }}
                    className="absolute bottom-3 right-3 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform z-20 hover:brightness-110 lg:hidden"
                    style={{ backgroundColor: accentColor, color: '#000' }}
                >
                    <FaPlus size={14} />
                </button>
            )}
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2 block">{product.category}</span>
          <h3 className="text-white font-bold text-base leading-tight line-clamp-2 mb-2 min-h-[2.5em] group-hover:text-white/90">{product.name}</h3>

          {showDescription && product.description && (
            <p className="text-xs text-gray-400 line-clamp-2 mb-3">{product.description}</p>
          )}

          <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
            {!hidePrices && (
              <span className="text-xl font-black" style={{ color: accentColor }}>
                {money(product.price, templateConfig)}
              </span>
            )}
            {!product.available && (
              <span className="text-xs text-red-400 font-medium">No disponible</span>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Producto */}
      {isModalOpen && (
        <ProductModal
          product={product}
          onClose={() => setIsModalOpen(false)}
          onAdd={onAdd}
          accentColor={accentColor}
          hidePrices={hidePrices}
          templateConfig={templateConfig}
          t={t}
        />
      )}
    </>
  );
};

// Card para Mobile - El diseño original
const MobileProductCard = ({
  product,
  onAdd,
  accentColor,
  hidePrices,
  showDescription,
  templateConfig,
  t
}: {
  product: Product,
  onAdd: (p: Product) => void,
  accentColor: string,
  hidePrices?: boolean,
  showDescription?: boolean,
  templateConfig?: TemplateConfig,
  t?: Translations
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="group relative bg-[#18181b] rounded-xl overflow-hidden border border-white/5 shadow-lg flex flex-col h-full hover:border-white/20 transition-all duration-200 cursor-pointer hover:brightness-110 active:scale-[0.98]"
      >
        <div className="relative h-32 w-full overflow-hidden bg-[#0f0f10]">
            {product.image ? (
                <img
                src={resolveMediaUrl(product.image)}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-700">
                   <FaDumbbell size={24} />
                </div>
            )}
            {product.featured && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-black text-[9px] font-black px-2 py-1 rounded shadow-sm z-10 uppercase tracking-wide">
                    Top
                </div>
            )}
            {product.available && (
                <button
                    onClick={(e) => { e.stopPropagation(); onAdd(product); }}
                    className="absolute bottom-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg active:scale-90 transition-transform z-20 hover:brightness-110"
                    style={{ backgroundColor: accentColor, color: '#000' }}
                >
                    <FaPlus size={12} />
                </button>
            )}
        </div>
        <div className="p-3 flex flex-col flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block">{product.category}</span>
          <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 mb-2 min-h-[2.5em]">{product.name}</h3>

          <div className="mt-auto pt-2 border-t border-white/5">
            {showDescription && product.description ? (
              <p className="text-xs text-gray-400 line-clamp-2 mb-2">{product.description}</p>
            ) : null}

            {!hidePrices && (
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold" style={{ color: accentColor }}>
                  {money(product.price, templateConfig)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Producto */}
      {isModalOpen && (
        <ProductModal
          product={product}
          onClose={() => setIsModalOpen(false)}
          onAdd={onAdd}
          accentColor={accentColor}
          hidePrices={hidePrices}
          templateConfig={templateConfig}
          t={t}
        />
      )}
    </>
  );
};

// Modal de producto compartido
const ProductModal = ({
  product,
  onClose,
  onAdd,
  accentColor,
  hidePrices,
  templateConfig,
  t
}: {
  product: Product,
  onClose: () => void,
  onAdd: (p: Product) => void,
  accentColor: string,
  hidePrices?: boolean,
  templateConfig?: TemplateConfig,
  t?: Translations
}) => (
  <div className="fixed inset-0 z-[70] flex items-end lg:items-center justify-center p-0 lg:p-4" onClick={onClose}>
    <div className="absolute inset-0 bg-black/95 backdrop-blur-md animate-fade-in" />
    <div
      className="relative bg-[#18181b] rounded-t-3xl lg:rounded-2xl max-w-lg w-full border-t lg:border border-white/10 shadow-2xl overflow-hidden animate-slide-up lg:animate-scale-in max-h-[90vh] flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header con Imagen */}
      <div className="relative h-56 lg:h-72 w-full overflow-hidden bg-[#0f0f10] shrink-0">
        {product.image ? (
          <>
            <img
              src={resolveMediaUrl(product.image)}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-700">
            <FaDumbbell size={48} />
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 text-white transition-colors z-10"
        >
          <FaTimes size={18} />
        </button>

        {product.featured && (
          <div className="absolute top-4 left-4 bg-yellow-500 text-black text-xs font-black px-3 py-1.5 rounded-lg shadow-lg uppercase tracking-wide flex items-center gap-1">
            <FaStar size={12} /> Top
          </div>
        )}
      </div>

      {/* Contenido Scrolleable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: accentColor }}>
            {product.category}
          </span>
          <h3 className="text-2xl font-bold text-white mb-3 leading-tight">
            {product.name}
          </h3>
          {!hidePrices && (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black" style={{ color: accentColor }}>
                {money(product.price, templateConfig)}
              </span>
              <span className="text-sm text-gray-500">
                {templateConfig?.currency || 'PEN'}
              </span>
            </div>
          )}
        </div>

        {product.description && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <FaInfoCircle style={{ color: accentColor }} size={16} />
              <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                {t?.description || 'Descripción'}
              </h4>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
              {product.description || 'Sin descripción disponible.'}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${product.available ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className={product.available ? 'text-green-400' : 'text-red-400'}>
            {product.available ? 'Disponible' : 'No disponible'}
          </span>
        </div>
      </div>

      {/* Footer con Botón de Acción */}
      {product.available && (
        <div className="p-4 bg-[#0a0a0a] border-t border-white/5 shrink-0">
          <button
            onClick={() => {
              onAdd(product);
              onClose();
            }}
            className="w-full py-4 rounded-xl font-bold text-black text-base flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all shadow-lg"
            style={{ backgroundColor: accentColor }}
          >
            <FaPlus size={18} />
            {t?.addToCart || 'Agregar al Carrito'}
          </button>
        </div>
      )}
    </div>

    <style>{`
      @keyframes scaleIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .animate-scale-in { animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
      .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      .animate-fade-in { animation: fadeIn 0.2s ease-out; }
    `}</style>
  </div>
);

// Botón de carrito para Mobile
const MobileCartButton = ({
  count,
  total,
  onClick,
  color,
  templateConfig,
  t
}: {
  count: number,
  total: number,
  onClick: () => void,
  color: string,
  templateConfig?: TemplateConfig,
  t: Translations
}) => {
    if (count === 0) return null;
    const hidePrices = templateConfig?.hide_prices || false;

    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 animate-fade-up pointer-events-none lg:hidden">
            <button
                onClick={onClick}
                className="pointer-events-auto flex items-center justify-between w-full max-w-[350px] pl-2 pr-6 py-2 bg-[#18181b] rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] border border-white/10 hover:scale-[1.02] active:scale-95 transition-all duration-300"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-black font-black text-sm shadow-lg" style={{ backgroundColor: color }}>
                        {count}
                    </div>
                    {!hidePrices ? (
                        <div className="flex flex-col items-start">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">{t.total}</span>
                            <span className="text-base font-bold text-white leading-none">{money(total, templateConfig)}</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-start">
                            <span className="text-sm font-bold text-white">{count} {count === 1 ? t.item : t.items}</span>
                        </div>
                    )}
                </div>
                <span className="text-xs font-bold text-white flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-md border border-white/5">
                    {t.viewOrder} <FaChevronRight size={10} />
                </span>
            </button>
        </div>
    );
};

// ==========================================
// COMPONENTES DESKTOP
// ==========================================

// Header Desktop
const DesktopHeader = ({
  businessName,
  cartCount,
  cartTotal,
  onCartClick,
  accentColor,
  templateConfig,
  t
}: {
  businessName: string,
  cartCount: number,
  cartTotal: number,
  onCartClick: () => void,
  accentColor: string,
  templateConfig?: TemplateConfig,
  t: Translations
}) => {
  const hidePrices = templateConfig?.hide_prices || false;

  return (
    <header className="hidden lg:flex fixed top-0 left-0 right-0 z-40 h-16 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5 items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: accentColor }}>
          <FaDumbbell className="text-black" size={18} />
        </div>
        <span className="text-white font-bold text-lg">{businessName}</span>
      </div>

      <button
        onClick={onCartClick}
        className="flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
      >
        <div className="relative">
          <FaShoppingBag className="text-white" size={18} />
          {cartCount > 0 && (
            <div
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-black"
              style={{ backgroundColor: accentColor }}
            >
              {cartCount}
            </div>
          )}
        </div>
        {cartCount > 0 && !hidePrices && (
          <span className="text-white font-semibold">{money(cartTotal, templateConfig)}</span>
        )}
        {cartCount > 0 && hidePrices && (
          <span className="text-white font-semibold">{cartCount} {cartCount === 1 ? t.item : t.items}</span>
        )}
        {cartCount === 0 && (
          <span className="text-gray-400 text-sm">{t.viewCart}</span>
        )}
      </button>
    </header>
  );
};

// Sidebar Desktop
const DesktopSidebar = ({
  logoImage,
  coverImage,
  businessName,
  businessTitle,
  businessBio,
  schedule,
  address,
  activeLinks,
  profileId,
  accentColor,
  categories,
  selectedCategory,
  setSelectedCategory,
  t
}: {
  logoImage?: string,
  coverImage?: string,
  businessName: string,
  businessTitle?: string,
  businessBio?: string,
  schedule?: string,
  address?: string,
  activeLinks: any[],
  profileId: number,
  accentColor: string,
  categories: string[],
  selectedCategory: string,
  setSelectedCategory: (cat: string) => void,
  t: Translations
}) => (
  <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-80 bg-[#0f0f10] border-r border-white/5 overflow-y-auto">
    {/* Cover Image */}
    <div className="relative h-40 w-full overflow-hidden">
      {coverImage ? (
        <img src={resolveMediaUrl(coverImage)} className="w-full h-full object-cover" alt="Cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f10] to-transparent" />
    </div>

    {/* Profile Info */}
    <div className="px-6 -mt-12 relative z-10">
      <div className="w-24 h-24 rounded-2xl p-1 bg-gradient-to-b from-gray-700 to-black shadow-2xl mx-auto mb-4">
        <StoryCircle
          profileId={profileId}
          logoUrl={logoImage ? resolveMediaUrl(logoImage) : undefined}
          name={businessName}
          size="lg"
          className="border-[3px] border-[#0f0f10] rounded-xl"
        />
      </div>

      <h1 className="text-xl font-black text-white text-center uppercase tracking-tight mb-1">
        {businessName}
      </h1>
      {businessTitle && (
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-center mb-3" style={{ color: accentColor }}>
          {businessTitle}
        </p>
      )}
      {businessBio && (
        <p className="text-sm text-gray-400 text-center leading-relaxed mb-4">
          {businessBio}
        </p>
      )}

      {/* Info Pills */}
      <div className="space-y-2 mb-6">
        {schedule && (
          <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl text-xs text-gray-300">
            <FaClock style={{ color: accentColor }} /> {schedule}
          </div>
        )}
        {address && (
          <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl text-xs text-gray-300">
            <FaMapMarkerAlt style={{ color: accentColor }} /> <span className="truncate">{address}</span>
          </div>
        )}
      </div>

      {/* Social Links */}
      {activeLinks.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {activeLinks.map((link) => (
            <a
              key={link.key}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.color} p-[1.5px] hover:scale-110 transition-transform duration-300`}
            >
              <div className="w-full h-full rounded-[10px] bg-[#18181b] flex items-center justify-center hover:bg-transparent transition-all duration-300">
                <div className="text-white text-sm">{link.icon}</div>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Categories */}
      <div className="border-t border-white/5 pt-6">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <FaFilter size={10} /> {t.categories}
        </h3>
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  </aside>
);

// ==========================================
// TEMPLATE PRINCIPAL
// ==========================================

export const WellnessCoachTemplate: React.FC<TemplateProps> = ({ config, customizations }) => {
  const finalConfig = useMemo(() => ({
    primaryColor: '#d4af37',
    secondaryColor: '#18181b',
    backgroundColor: '#09090b',
    businessName: 'Coach Profile',
    ...config,
    ...(customizations || {}),
  }), [config, customizations]);

  const {
    primaryColor,
    backgroundColor,
    logoImage,
    coverImage,
    businessName,
    businessTitle,
    businessBio,
    schedule,
    address,
    products = [],
    socialLinks: links1,
    social_links: links2,
    gallery = [],
    profileId,
    accountSlug,
    templateConfig
  } = finalConfig;

  const tConfig: TemplateConfig = useMemo(() => ({
    hide_prices: false,
    language: 'es',
    show_description: true,
    currency: 'PEN',
    currency_symbol: 'S/',
    ...templateConfig
  }), [templateConfig]);

  const t = translations[tConfig.language || 'es'];

  const rawSocialLinks = { ...(links2 || {}), ...(links1 || {}) };
  const normalizedLinks = useMemo(() => normalizeSocialLinks(rawSocialLinks), [rawSocialLinks]);

  const activeLinks = useMemo(() => {
    return SOCIAL_PLATFORMS.filter(platform => {
      const url = normalizedLinks[platform.key];
      return url && url.length > 0;
    }).map(platform => ({
      ...platform,
      url: normalizedLinks[platform.key]!
    }));
  }, [normalizedLinks]);

  const {
    cart, cartTotal, cartCount,
    addToCart, updateQuantity, clearCart,
    isCartOpen, setIsCartOpen,
    isCheckoutOpen, setIsCheckoutOpen
  } = useCart();

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(t.all);
  const [y, setY] = useState(0);

  const favoritesScrollRef = useRef<HTMLDivElement>(null);

  const categories = useMemo<string[]>(() => {
    const cats = products.map((p: Product) => p.category || 'General');
    return [t.all, ...Array.from(new Set(cats))] as string[];
  }, [products, t.all]);
  const featuredProducts = useMemo(() => products.filter(p => p.featured && p.available), [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const pCat = p.category || 'General';
      const matchCat = selectedCategory === t.all || pCat === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchTerm, t.all]);

  useEffect(() => {
    const onScroll = () => setY(Math.min(60, window.scrollY * 0.15));
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollFavorites = (direction: 'left' | 'right') => {
    if (favoritesScrollRef.current) {
        const { current } = favoritesScrollRef;
        current.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  return (
    <>
      {isLoading && (
        <LoadingScreen
          logoUrl={logoImage ? resolveMediaUrl(logoImage) : undefined}
          onLoadingComplete={() => setIsLoading(false)}
          minDuration={1500}
        />
      )}

      <Head title={`${businessName} | Wellness Coach`} />

      {/* ==================== DESKTOP LAYOUT ==================== */}
      <div className="hidden lg:block min-h-screen font-sans selection:bg-yellow-500/30" style={{ backgroundColor }}>
        <DarkFitnessBackground color={primaryColor} />

        {/* Header Desktop */}
        <DesktopHeader
          businessName={businessName}
          cartCount={cartCount}
          cartTotal={cartTotal}
          onCartClick={() => setIsCartOpen(true)}
          accentColor={primaryColor}
          templateConfig={tConfig}
          t={t}
        />

        {/* Sidebar Desktop */}
        <DesktopSidebar
          logoImage={logoImage}
          coverImage={coverImage}
          businessName={businessName}
          businessTitle={businessTitle}
          businessBio={businessBio}
          schedule={schedule}
          address={address}
          activeLinks={activeLinks}
          profileId={profileId}
          accentColor={primaryColor}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          t={t}
        />

        {/* Main Content Desktop */}
        <main className="lg:ml-80 pt-16 min-h-screen">
          {/* Search Bar */}
          <div className="sticky top-16 z-30 bg-[#09090b]/95 backdrop-blur-xl border-b border-white/5 px-8 py-4">
            <div className="max-w-6xl mx-auto flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-4 top-3.5 text-gray-500 text-sm" />
                <input
                  type="text"
                  placeholder={t.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 rounded-xl bg-[#18181b] border border-white/5 text-white placeholder-gray-600 focus:outline-none focus:border-white/20 transition-all text-sm font-medium"
                />
              </div>
              <div className="text-sm text-gray-500">
                {filteredProducts.length} {t.products}
              </div>
            </div>
          </div>

          <div className="px-8 py-8 max-w-6xl mx-auto">
            {/* Featured Products - Desktop Carousel */}
            {featuredProducts.length > 0 && selectedCategory === t.all && !searchTerm && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-3">
                    <FaBolt style={{ color: primaryColor }} /> {t.featured}
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={() => scrollFavorites('left')} className="p-2 rounded-lg bg-[#18181b] text-white border border-white/5 hover:bg-white/10 transition-colors">
                      <FaChevronLeft size={12} />
                    </button>
                    <button onClick={() => scrollFavorites('right')} className="p-2 rounded-lg bg-[#18181b] text-white border border-white/5 hover:bg-white/10 transition-colors">
                      <FaChevronRight size={12} />
                    </button>
                  </div>
                </div>

                <div ref={favoritesScrollRef} className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x">
                  {featuredProducts.map(product => (
                    <div key={product.id} className="min-w-[280px] w-[280px] snap-center">
                      <DesktopProductCard
                        product={product}
                        onAdd={addToCart}
                        accentColor={primaryColor}
                        hidePrices={tConfig.hide_prices}
                        showDescription={tConfig.show_description}
                        templateConfig={tConfig}
                        t={t}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Catalog Grid - Desktop */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">{t.catalog}</h2>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <DesktopProductCard
                      key={product.id}
                      product={product}
                      onAdd={addToCart}
                      accentColor={primaryColor}
                      hidePrices={tConfig.hide_prices}
                      showDescription={tConfig.show_description}
                      templateConfig={tConfig}
                      t={t}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                  <FaDumbbell size={48} className="text-gray-500 mb-4" />
                  <p className="text-gray-400 font-medium">{t.noProducts}</p>
                </div>
              )}
            </section>

            {/* Gallery, Blog, Testimonials - Desktop Grid */}
            <div className="mt-16 grid grid-cols-1 xl:grid-cols-2 gap-8">
              {gallery && gallery.length > 0 && (
                <section className="bg-[#18181b] rounded-2xl border border-white/5 overflow-hidden">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider p-6 border-b border-white/5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                    {t.gallery}
                  </h3>
                  <div className="p-4">
                    <PremiumCarousel images={gallery} accentColor={primaryColor} />
                  </div>
                </section>
              )}

              <section className="bg-[#18181b] rounded-2xl border border-white/5 overflow-hidden">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider p-6 border-b border-white/5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                  {t.blog}
                </h3>
                <div className="p-4">
                  <PostGridModal accountSlug={accountSlug} accentColor={primaryColor} />
                </div>
              </section>
            </div>

            {/* Testimonials - Full Width */}
            <section className="mt-8">
              <div className="bg-[#18181b] rounded-2xl border border-white/5 overflow-hidden">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider p-6 border-b border-white/5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                  {t.testimonials}
                </h3>
                <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div>
                    <ReviewsList accountSlug={accountSlug} accentColor={primaryColor} />
                  </div>
                  <div>
                    <ReviewForm accountSlug={accountSlug} accentColor={primaryColor} />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* ==================== MOBILE LAYOUT (ORIGINAL) ==================== */}
      <div className="lg:hidden flex justify-center min-h-screen font-sans selection:bg-yellow-500/30" style={{ backgroundColor }}>
        <div className="w-full md:max-w-[480px] min-h-screen relative shadow-2xl overflow-hidden pb-32 bg-[#09090b]">

          <DarkFitnessBackground color={primaryColor} />

          {/* --- HERO SECTION MOBILE --- */}
          <header className="relative w-full h-[500px] pb-8 overflow-hidden">
             <div className="absolute inset-0 w-full h-full">
               {coverImage ? (
                  <img
                    src={resolveMediaUrl(coverImage)}
                    className="w-full h-full object-cover"
                    style={{ transform: `scale(1.1) translateY(${y * 0.2}px)` }}
                    alt="Cover"
                  />
               ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black" />
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent" />
               <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#09090b] to-transparent opacity-90" />
             </div>

             <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 px-6 text-center z-10">
                <div className="relative mb-8 transform hover:scale-105 transition-transform duration-500">
                    <div className="absolute inset-0 bg-black/40 blur-xl rounded-full" />
                    <div className="relative w-32 h-32 rounded-full p-1 bg-gradient-to-b from-gray-700 to-black shadow-2xl mx-auto">
                        <StoryCircle
                            profileId={profileId}
                            logoUrl={logoImage ? resolveMediaUrl(logoImage) : undefined}
                            size="lg"
                            accentColor={primaryColor}
                            className="border-[3px] border-[#09090b]"
                        />
                    </div>
                </div>

                <ScrollReveal>
                  <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tight leading-none drop-shadow-lg">
                      {businessName}
                  </h1>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: primaryColor }}>
                      {businessTitle}
                  </p>
                  {businessBio && (
                    <p className="text-sm text-gray-200 leading-relaxed max-w-xs mx-auto mb-6 px-2 drop-shadow-md">
                      {businessBio}
                    </p>
                  )}
                </ScrollReveal>

                <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {schedule && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-[10px] text-white font-medium uppercase tracking-wide">
                            <FaClock className="text-gray-300" /> {schedule}
                        </div>
                    )}
                    {address && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-[10px] text-white font-medium uppercase tracking-wide">
                            <FaMapMarkerAlt className="text-gray-300" /> <span className="truncate max-w-[120px]">{address}</span>
                        </div>
                    )}
                </div>

                {activeLinks.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {activeLinks.map((link) => (
                             <a
                                key={link.key}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`group relative w-10 h-10 rounded-full bg-gradient-to-br ${link.color} p-[1.5px] hover:scale-110 transition-transform duration-300 shadow-lg`}
                             >
                                <div className="w-full h-full rounded-full bg-[#18181b] flex items-center justify-center group-hover:bg-transparent transition-all duration-300">
                                   <div className="text-white">
                                       {link.icon}
                                   </div>
                                </div>
                             </a>
                        ))}
                        <div className="group relative w-10 h-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 p-[1.5px] hover:scale-110 transition-transform duration-300 shadow-lg">
                            <div className="w-full h-full rounded-full bg-[#18181b] flex items-center justify-center group-hover:bg-transparent transition-all duration-300">
                                <ShareButton
                                    url={window.location.href}
                                    title={businessName}
                                    text={businessBio || `${t.checkOut} ${businessName}`}
                                    iconSize={18}
                                    color="#fff"
                                />
                            </div>
                        </div>
                    </div>
                )}
             </div>
          </header>

          {/* Search & Categories - Mobile */}
          <div className="sticky top-0 z-30 pt-4 pb-4 backdrop-blur-xl border-b border-white/5 transition-all duration-300 shadow-2xl"
               style={{ backgroundColor: 'rgba(9, 9, 11, 0.95)' }}>
             <div className="px-4 mb-4">
                <div className="relative group">
                   <FaSearch className="absolute left-4 top-3.5 text-gray-500 text-xs" />
                   <input
                      type="text"
                      placeholder={t.search}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 rounded-xl bg-[#18181b] border border-white/5 text-white placeholder-gray-600 focus:outline-none focus:border-white/20 transition-all text-sm font-medium"
                   />
                </div>
             </div>

             <div className="overflow-x-auto scrollbar-hide px-4 flex gap-2 pb-1">
                {categories.map((cat) => (
                   <CategoryPill
                      key={cat}
                      label={cat}
                      isActive={selectedCategory === cat}
                      onClick={() => setSelectedCategory(cat)}
                      accentColor={primaryColor}
                   />
                ))}
             </div>
          </div>

          {/* Featured Products - Mobile */}
          {featuredProducts.length > 0 && selectedCategory === t.all && !searchTerm && (
            <section className="mt-8 pl-4 relative">
                <div className="flex items-center justify-between pr-4 mb-4">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <FaBolt style={{ color: primaryColor }} /> {t.featured}
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={() => scrollFavorites('left')} className="p-1.5 rounded-md bg-[#18181b] text-white border border-white/5 hover:bg-white/10"><FaChevronLeft size={10} /></button>
                        <button onClick={() => scrollFavorites('right')} className="p-1.5 rounded-md bg-[#18181b] text-white border border-white/5 hover:bg-white/10"><FaChevronRight size={10} /></button>
                    </div>
                </div>

                <div ref={favoritesScrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 pr-4 snap-x">
                    {featuredProducts.map(product => (
                        <div key={product.id} className="min-w-[160px] w-[160px] snap-center h-[260px]">
                            <MobileProductCard
                                product={product}
                                onAdd={addToCart}
                                accentColor={primaryColor}
                                hidePrices={tConfig.hide_prices}
                                showDescription={tConfig.show_description}
                                templateConfig={tConfig}
                                t={t}
                            />
                        </div>
                    ))}
                </div>
            </section>
          )}

          {/* Catalog - Mobile */}
          <main className="px-4 py-6">
             <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">{t.catalog}</h2>
             </div>

             {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                   {filteredProducts.map((product) => (
                      <div key={product.id} className="h-full">
                         <MobileProductCard
                            product={product}
                            onAdd={addToCart}
                            accentColor={primaryColor}
                            hidePrices={tConfig.hide_prices}
                            showDescription={tConfig.show_description}
                            templateConfig={tConfig}
                            t={t}
                         />
                      </div>
                   ))}
                </div>
             ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                   <FaDumbbell size={40} className="text-gray-500 mb-2" />
                   <p className="text-gray-400 font-medium text-sm">{t.noProducts}</p>
                </div>
             )}

             {/* Gallery, Blog, Testimonials - Mobile */}
             <div className="mt-16 space-y-10">
                {gallery && gallery.length > 0 && (
                   <section>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">{t.gallery}</h3>
                      <div className="rounded-xl overflow-hidden shadow-lg border border-white/5">
                         <PremiumCarousel images={gallery} accentColor={primaryColor} />
                      </div>
                   </section>
                )}

                <section data-posts-section>
                   <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">{t.blog}</h3>
                   <div className="bg-[#18181b] rounded-xl p-1">
                     <PostGridModal accountSlug={accountSlug} accentColor={primaryColor} />
                   </div>
                </section>

                <section>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">{t.testimonials}</h3>
                    <div className="bg-[#18181b] rounded-xl border border-white/5 p-4 mb-4">
                        <ReviewsList accountSlug={accountSlug} accentColor={primaryColor} />
                    </div>
                    <div className="bg-[#18181b] rounded-xl border border-white/5 p-4">
                        <ReviewForm accountSlug={accountSlug} accentColor={primaryColor} />
                    </div>
                </section>
             </div>
          </main>

          {/* Cart Button - Mobile */}
          <MobileCartButton
            count={cartCount}
            total={cartTotal}
            onClick={() => setIsCartOpen(true)}
            color={primaryColor}
            templateConfig={tConfig}
            t={t}
          />
        </div>
      </div>

      {/* Shared Components */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        total={cartTotal}
        onUpdateQuantity={updateQuantity}
        onProceed={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
        primaryColor={primaryColor}
        hidePrices={tConfig.hide_prices}
        translations={{
          yourOrder: t.yourOrder,
          emptyCart: t.emptyCart,
          subtotal: t.subtotal,
          continue: t.continue
        }}
        currencySymbol={tConfig.currency_symbol}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        total={cartTotal}
        accountSlug={accountSlug}
        primaryColor={primaryColor}
        onSuccess={clearCart}
      />
    </>
  );
};

export default WellnessCoachTemplate;
