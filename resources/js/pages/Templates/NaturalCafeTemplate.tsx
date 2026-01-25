import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Head } from '@inertiajs/react';
import {
  FaInstagram, FaTiktok, FaFacebook, FaMapMarkerAlt,
  FaClock, FaLeaf, FaSearch, FaPlus, FaStar, FaTimes,
  FaFire, FaChevronRight, FaChevronLeft,
  FaWhatsapp, FaGlobe, FaEnvelope, FaShoppingBag, FaFilter
} from 'react-icons/fa';

import { useCart, Product } from '@/hooks/useCart';
import { CartDrawer } from '@/components/checkout/CartDrawer';
import { CheckoutModal } from '@/components/checkout/CheckoutModal';
import { PremiumCarousel, CarouselImage } from '@/components/gallery/PremiumCarousel';
import { StoryCircle } from '@/components/stories/StoryCircle';
import { ScrollReveal } from '@/components/animated/ScrollReveal';
import { LoadingScreen } from '@/components/LoadingScreen';
import PostGridModal from '@/components/posts/PostGridModal';
import { normalizeSocialLinks } from '@/utils/socialLinks';
import { resolveMediaUrl } from '@/utils/mediaUrl';
import { ShareButton } from '@/components/ShareButton';

// --- INTERFACES ---
export interface NaturalCafeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  loadingImage?: string;
  coverImage?: string;
  logoImage?: string;
  businessName: string;
  businessTitle: string;
  businessBio?: string;
  products: Product[];
  socialLinks: {
    whatsapp?: string;
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    website?: string;
    email?: string;
    location?: string;
    [key: string]: string | undefined;
  };
  schedule?: string;
  address?: string;
  gallery?: CarouselImage[];
  profileId: number;
  accountSlug: string;
}

interface TemplateProps {
  config: NaturalCafeConfig;
  customizations?: any;
}

// --- UTILIDADES ---
const money = (n: number) => `S/ ${Number(n).toFixed(2)}`;

const SOCIAL_PLATFORMS = [
  { key: 'whatsapp', label: 'WhatsApp', icon: <FaWhatsapp /> },
  { key: 'instagram', label: 'Instagram', icon: <FaInstagram /> },
  { key: 'tiktok', label: 'TikTok', icon: <FaTiktok /> },
  { key: 'facebook', label: 'Facebook', icon: <FaFacebook /> },
  { key: 'website', label: 'Web', icon: <FaGlobe /> },
  { key: 'email', label: 'Email', icon: <FaEnvelope /> },
];

// ==========================================
// COMPONENTES VISUALES
// ==========================================

const OrganicBackground = ({ color }: { color: string }) => (
  <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" style={{ backgroundColor: color }}>
    <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full blur-[80px] bg-white opacity-10" />
    <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full blur-[80px] bg-[#8BC53F] opacity-10" />
    <div className="absolute inset-0 opacity-[0.03]"
         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E")` }}
    />
  </div>
);

const CategoryPill = ({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap border
      ${isActive
        ? 'text-[#005C35] bg-white border-transparent shadow-md transform scale-105'
        : 'text-white/70 border-white/20 hover:bg-white/10 hover:text-white'}`}
  >
    {label}
  </button>
);

// Card para Mobile
const MobileProductCard = ({
  product,
  onAdd,
  accentColor,
  onClick
}: {
  product: Product,
  onAdd: (p: Product) => void,
  accentColor: string,
  onClick?: (p: Product) => void
}) => (
  <div
    className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full border border-stone-100 cursor-pointer"
    onClick={() => onClick?.(product)}
  >
    <div className="relative h-28 w-full overflow-hidden bg-gray-50">
        {product.image ? (
            <img
            src={resolveMediaUrl(product.image)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center">
               <FaLeaf size={20} className="text-gray-300" />
            </div>
        )}
        {product.featured && (
            <div className="absolute top-1.5 left-1.5 bg-[#8BC53F] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow-sm z-10">TOP</div>
        )}
        {product.available && (
            <button
                onClick={(e) => { e.stopPropagation(); onAdd(product); }}
                className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform z-20"
                style={{ backgroundColor: accentColor, color: '#fff' }}
            >
                <FaPlus size={10} />
            </button>
        )}
    </div>
    <div className="p-2.5 flex flex-col flex-1">
      <span className="text-[9px] font-bold uppercase tracking-wide text-gray-400 mb-0.5 truncate block">{product.category}</span>
      <h3 className="font-quicksand font-bold text-sm leading-tight text-[#005C35] line-clamp-2 mb-1 min-h-[2.5em]">{product.name}</h3>
      <div className="mt-auto pt-1 border-t border-gray-100 flex justify-between items-end">
        <span className="text-sm font-black text-gray-800">{money(product.price)}</span>
      </div>
    </div>
  </div>
);

// Card para Desktop - Más grande y elegante
const DesktopProductCard = ({
  product,
  onAdd,
  accentColor,
  onClick
}: {
  product: Product,
  onAdd: (p: Product) => void,
  accentColor: string,
  onClick?: (p: Product) => void
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-stone-100 cursor-pointer"
      onClick={() => onClick?.(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 w-full overflow-hidden bg-gray-50">
          {product.image ? (
              <img
              src={resolveMediaUrl(product.image)}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
              />
          ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                 <FaLeaf size={32} className="text-green-200" />
              </div>
          )}

          {/* Overlay en hover */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute bottom-4 left-4 right-4">
              {product.available && (
                <button
                  onClick={(e) => { e.stopPropagation(); onAdd(product); }}
                  className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:brightness-110 text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  <FaPlus size={12} />
                  Agregar
                </button>
              )}
            </div>
          </div>

          {product.featured && (
              <div className="absolute top-3 left-3 bg-[#8BC53F] text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg z-10 flex items-center gap-1">
                <FaStar size={10} /> Destacado
              </div>
          )}

          {/* Quick add en mobile */}
          {product.available && !isHovered && (
              <button
                  onClick={(e) => { e.stopPropagation(); onAdd(product); }}
                  className="absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform z-20 lg:hidden"
                  style={{ backgroundColor: accentColor, color: '#fff' }}
              >
                  <FaPlus size={14} />
              </button>
          )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1 block">{product.category}</span>
        <h3 className="font-quicksand font-bold text-base leading-tight text-[#005C35] line-clamp-2 mb-2 min-h-[2.5em] group-hover:text-[#004428] transition-colors">{product.name}</h3>

        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{product.description}</p>
        )}

        <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
          <span className="text-xl font-black text-gray-800">{money(product.price)}</span>
          {!product.available && (
            <span className="text-xs text-red-500 font-medium">No disponible</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Modal de Producto compartido
const ProductModal = ({
  product,
  onClose,
  onAdd,
  accentColor
}: {
  product: Product,
  onClose: () => void,
  onAdd: (p: Product) => void,
  accentColor: string
}) => (
  <div className="fixed inset-0 z-[70] flex items-end lg:items-center justify-center p-0 lg:p-4">
    <div
      className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    />

    <div className="relative w-full lg:max-w-md bg-white rounded-t-3xl lg:rounded-3xl shadow-2xl overflow-hidden animate-slide-in-up lg:animate-scale-in max-h-[90vh] lg:max-h-[80vh] flex flex-col">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/40 transition-colors"
      >
        <FaTimes />
      </button>

      <div className="relative h-64 lg:h-72 w-full overflow-hidden bg-gray-100">
        {product.image ? (
          <img
            src={resolveMediaUrl(product.image)}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FaLeaf size={48} className="text-gray-300" />
          </div>
        )}
        {product.featured && (
          <div className="absolute top-4 left-4 bg-[#8BC53F] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
            <FaStar size={12} /> DESTACADO
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
          {product.category}
        </div>
        <h2 className="text-2xl font-bold text-[#005C35] mb-3">
          {product.name}
        </h2>

        {product.description && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Descripción</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>
        )}

        <div className="text-3xl font-black text-gray-800 mb-6">
          {money(product.price)}
        </div>

        {!product.available && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-600 font-medium">
              Producto no disponible actualmente
            </p>
          </div>
        )}
      </div>

      {product.available && (
        <div className="p-6 border-t border-gray-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd(product);
              onClose();
            }}
            className="w-full py-4 rounded-xl font-bold text-white text-base transition-all hover:brightness-110 active:scale-[0.98] shadow-lg"
            style={{ backgroundColor: accentColor }}
          >
            <div className="flex items-center justify-center gap-2">
              <FaPlus size={14} />
              <span>Agregar al Carrito</span>
            </div>
          </button>
        </div>
      )}
    </div>

    <style>{`
      @keyframes slideInUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }
      @keyframes scaleIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      .animate-slide-in-up { animation: slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      .animate-scale-in { animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
    `}</style>
  </div>
);

// Botón Flotante Mobile
const MobileCartButton = ({ count, total, onClick, color }: { count: number, total: number, onClick: () => void, color: string }) => {
    if (count === 0) return null;
    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 animate-fade-up pointer-events-none lg:hidden">
            <button
                onClick={onClick}
                className="pointer-events-auto flex items-center gap-4 pl-1 pr-6 py-1.5 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-stone-100 hover:scale-105 active:scale-95 transition-all duration-300 group"
            >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md transition-transform group-hover:rotate-12" style={{ backgroundColor: color }}>
                    {count}
                </div>
                <div className="flex flex-col items-start mr-2">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider leading-none mb-0.5">Total</span>
                    <span className="text-sm font-black text-stone-800 leading-none">{money(total)}</span>
                </div>
                <div className="h-6 w-px bg-stone-200 mx-1"></div>
                <span className="text-xs font-bold text-stone-600 flex items-center gap-1 group-hover:text-green-700 transition-colors">
                    Ver Pedido <FaChevronRight size={10} />
                </span>
            </button>
        </div>
    );
};

// Reseñas Minimalista
const MinimalReviewsSection = ({ primaryColor }: { primaryColor: string }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-amber-100 p-2 rounded-lg text-amber-500">
                        <FaStar size={20} />
                    </div>
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-stone-800">5.0</span>
                            <span className="text-xs text-stone-400">/ 5.0</span>
                        </div>
                        <p className="text-[10px] font-medium text-stone-400 uppercase tracking-wide">Opiniones</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="px-4 py-2 rounded-full text-xs font-bold border transition-colors"
                    style={{ borderColor: primaryColor, color: primaryColor }}
                >
                    {isExpanded ? 'Cerrar' : 'Escribir'}
                </button>
            </div>

            {isExpanded && (
                <div className="mt-5 pt-5 border-t border-stone-100 animate-fade-up">
                    <form onSubmit={(e) => { e.preventDefault(); alert('Reseña enviada (Demo)'); }} className="space-y-3">
                        <p className="text-sm text-stone-600 font-medium mb-2 text-center">Califica tu experiencia:</p>

                        <div className="flex justify-center gap-2 mb-4">
                             {[1,2,3,4,5].map(star => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setUserRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <FaStar
                                        size={28}
                                        className={star <= (hoverRating || userRating) ? "text-amber-400" : "text-stone-200"}
                                    />
                                </button>
                             ))}
                        </div>

                        <input
                            type="text"
                            placeholder="Tu Nombre"
                            className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-green-500 transition-colors"
                        />
                        <textarea
                            placeholder="¿Qué te pareció?"
                            rows={2}
                            className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-green-500 resize-none transition-colors"
                        />
                        <button className="w-full py-3 rounded-xl font-bold text-white text-sm shadow-md hover:opacity-90 transition-opacity" style={{ backgroundColor: primaryColor }}>
                            Enviar Reseña
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

// ==========================================
// COMPONENTES DESKTOP
// ==========================================

const DesktopHeader = ({
  businessName,
  cartCount,
  cartTotal,
  onCartClick,
  accentColor,
  primaryColor
}: {
  businessName: string,
  cartCount: number,
  cartTotal: number,
  onCartClick: () => void,
  accentColor: string,
  primaryColor: string
}) => (
  <header className="hidden lg:flex fixed top-0 left-0 right-0 z-40 h-16 backdrop-blur-xl border-b border-white/10 items-center justify-between px-8" style={{ backgroundColor: 'rgba(0, 92, 53, 0.95)' }}>
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
        <FaLeaf className="text-white" size={18} />
      </div>
      <span className="text-white font-bold text-lg">{businessName}</span>
    </div>

    <button
      onClick={onCartClick}
      className="flex items-center gap-3 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all"
    >
      <div className="relative">
        <FaShoppingBag className="text-white" size={18} />
        {cartCount > 0 && (
          <div
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ backgroundColor: accentColor }}
          >
            {cartCount}
          </div>
        )}
      </div>
      {cartCount > 0 ? (
        <span className="text-white font-semibold">{money(cartTotal)}</span>
      ) : (
        <span className="text-white/70 text-sm">Ver Carrito</span>
      )}
    </button>
  </header>
);

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
  primaryColor,
  categories,
  selectedCategory,
  setSelectedCategory,
  normalizedLinks
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
  primaryColor: string,
  categories: string[],
  selectedCategory: string,
  setSelectedCategory: (cat: string) => void,
  normalizedLinks: Record<string, string | undefined>
}) => (
  <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-80 border-r border-white/10 overflow-y-auto" style={{ backgroundColor: primaryColor }}>
    {/* Cover Image */}
    <div className="relative h-40 w-full overflow-hidden">
      {coverImage ? (
        <img src={resolveMediaUrl(coverImage)} className="w-full h-full object-cover" alt="Cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#004d2c] to-[#002917]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#005C35] to-transparent" />
    </div>

    {/* Profile Info */}
    <div className="px-6 -mt-12 relative z-10">
      <div className="p-1 bg-white/20 backdrop-blur-md rounded-full mx-auto mb-4 w-24 h-24 ring-2 ring-white/30">
        <StoryCircle
          profileId={profileId}
          logoUrl={logoImage ? resolveMediaUrl(logoImage) : undefined}
          name={businessName}
          size="lg"
          className="border-2 border-white"
        />
      </div>

      <h1 className="text-xl font-bold text-white text-center mb-1">
        {businessName}
      </h1>
      {businessTitle && (
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-center mb-3" style={{ color: accentColor }}>
          {businessTitle}
        </p>
      )}
      {businessBio && (
        <p className="text-sm text-white/70 text-center leading-relaxed mb-4">
          {businessBio}
        </p>
      )}

      {/* Info Pills */}
      <div className="space-y-2 mb-6">
        {schedule && (
          <div className="flex items-center gap-3 px-3 py-2 bg-black/20 backdrop-blur-sm rounded-xl text-xs text-white border border-white/10">
            <FaClock style={{ color: accentColor }} /> {schedule}
          </div>
        )}
        {address && (
          <div className="flex items-center gap-3 px-3 py-2 bg-black/20 backdrop-blur-sm rounded-xl text-xs text-white border border-white/10">
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
              className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
            >
              {link.icon}
            </a>
          ))}
        </div>
      )}

      {/* Categories */}
      <div className="border-t border-white/10 pt-6">
        <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
          <FaFilter size={10} /> Categorías
        </h3>
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-white text-[#005C35]'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Social Footer */}
      <div className="border-t border-white/10 pt-6 mt-6 text-center pb-6">
        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3">Síguenos</p>
        <div className="flex justify-center gap-3">
          {normalizedLinks.instagram && <a href={normalizedLinks.instagram} target="_blank" className="p-2 bg-white/10 rounded-full text-white hover:bg-[#E4405F] transition-colors"><FaInstagram size={16} /></a>}
          {normalizedLinks.facebook && <a href={normalizedLinks.facebook} target="_blank" className="p-2 bg-white/10 rounded-full text-white hover:bg-[#1877F2] transition-colors"><FaFacebook size={16} /></a>}
          {normalizedLinks.tiktok && <a href={normalizedLinks.tiktok} target="_blank" className="p-2 bg-white/10 rounded-full text-white hover:bg-black transition-colors"><FaTiktok size={16} /></a>}
        </div>
      </div>
    </div>
  </aside>
);

// ==========================================
// TEMPLATE PRINCIPAL
// ==========================================

export const NaturalCafeTemplate: React.FC<TemplateProps> = ({ config, customizations }) => {
  const finalConfig = useMemo(() => ({
    primaryColor: '#005C35',
    secondaryColor: '#FFFFFF',
    accentColor: '#8BC53F',
    businessName: 'Ámate',
    ...config,
    ...(customizations || {}),
  }), [config, customizations]);

  const {
    primaryColor,
    accentColor,
    loadingImage,
    coverImage,
    logoImage,
    businessName,
    businessTitle,
    businessBio,
    schedule,
    address,
    products = [],
    socialLinks = {},
    gallery = [],
    profileId,
    accountSlug
  } = finalConfig;

  const {
    cart, cartTotal, cartCount,
    addToCart, updateQuantity, clearCart,
    isCartOpen, setIsCartOpen,
    isCheckoutOpen, setIsCheckoutOpen
  } = useCart();

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [y, setY] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const favoritesScrollRef = useRef<HTMLDivElement>(null);

  const loadingScreenUrl = loadingImage ? resolveMediaUrl(loadingImage) : null;
  const resolvedCover = coverImage ? resolveMediaUrl(coverImage) : null;
  const resolvedLogo = logoImage ? resolveMediaUrl(logoImage) : null;

  const normalizedLinks = useMemo(() => normalizeSocialLinks(socialLinks), [socialLinks]);

  const activeLinks = useMemo(() => {
    return SOCIAL_PLATFORMS.filter(platform => {
      const url = normalizedLinks[platform.key];
      return url && url.length > 0;
    }).map(platform => ({
      ...platform,
      url: normalizedLinks[platform.key]!
    }));
  }, [normalizedLinks]);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const originalBodyBg = document.body.style.backgroundColor;
    const originalFont = document.body.style.fontFamily;

    document.body.style.backgroundColor = primaryColor;
    document.body.style.fontFamily = "'Quicksand', sans-serif";

    return () => {
        document.head.removeChild(link);
        document.body.style.backgroundColor = originalBodyBg;
        document.body.style.fontFamily = originalFont;
    };
  }, [primaryColor]);

  useEffect(() => {
    const onScroll = () => setY(Math.min(60, window.scrollY * 0.15));
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollFavorites = (direction: 'left' | 'right') => {
    if (favoritesScrollRef.current) {
        const { current } = favoritesScrollRef;
        const scrollAmount = 180;
        current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  const categories = useMemo<string[]>(() => {
    const cats = Array.from(new Set(products.map(p => p.category || 'General')));
    return ['Todos', ...cats];
  }, [products]);

  const featuredProducts = useMemo(() => products.filter(p => p.featured && p.available), [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const pCat = p.category || 'General';
      const matchCat = selectedCategory === 'Todos' || pCat === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  return (
    <>
      {isLoading && (
        <LoadingScreen
          logoUrl={loadingScreenUrl}
          onLoadingComplete={() => setIsLoading(false)}
          minDuration={1500}
        />
      )}

      <Head title={`${businessName} | Catálogo`}>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content={primaryColor} />
        <style>{`
          .font-quicksand { font-family: 'Quicksand', sans-serif; }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </Head>

      {/* ==================== DESKTOP LAYOUT ==================== */}
      <div className="hidden lg:block min-h-screen font-quicksand" style={{ backgroundColor: primaryColor }}>
        <OrganicBackground color={primaryColor} />

        {/* Header Desktop */}
        <DesktopHeader
          businessName={businessName}
          cartCount={cartCount}
          cartTotal={cartTotal}
          onCartClick={() => setIsCartOpen(true)}
          accentColor={accentColor}
          primaryColor={primaryColor}
        />

        {/* Sidebar Desktop */}
        <DesktopSidebar
          logoImage={resolvedLogo}
          coverImage={resolvedCover}
          businessName={businessName}
          businessTitle={businessTitle}
          businessBio={businessBio}
          schedule={schedule}
          address={address}
          activeLinks={activeLinks}
          profileId={profileId}
          accentColor={accentColor}
          primaryColor={primaryColor}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          normalizedLinks={normalizedLinks}
        />

        {/* Main Content Desktop */}
        <main className="lg:ml-80 pt-16 min-h-screen">
          {/* Search Bar */}
          <div className="sticky top-16 z-30 backdrop-blur-xl border-b border-white/5 px-8 py-4" style={{ backgroundColor: 'rgba(0, 92, 53, 0.95)' }}>
            <div className="max-w-5xl mx-auto flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-4 top-3.5 text-white/60 text-sm" />
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-white/60 focus:outline-none focus:bg-white/20 focus:border-[#8BC53F]/50 transition-all text-sm font-medium"
                />
              </div>
              <div className="text-sm text-white/60">
                {filteredProducts.length} productos
              </div>
            </div>
          </div>

          <div className="px-8 py-8 max-w-5xl mx-auto">
            {/* Featured Products - Desktop Carousel */}
            {featuredProducts.length > 0 && selectedCategory === 'Todos' && !searchTerm && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white flex items-center gap-3">
                    <FaFire style={{ color: accentColor }} /> Favoritos
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={() => scrollFavorites('left')} className="p-2 rounded-lg bg-white text-[#005C35] border border-white/20 hover:bg-white/90 transition-colors">
                      <FaChevronLeft size={12} />
                    </button>
                    <button onClick={() => scrollFavorites('right')} className="p-2 rounded-lg bg-white text-[#005C35] border border-white/20 hover:bg-white/90 transition-colors">
                      <FaChevronRight size={12} />
                    </button>
                  </div>
                </div>

                <div ref={favoritesScrollRef} className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x">
                  {featuredProducts.map(product => (
                    <div key={product.id} className="min-w-[260px] w-[260px] snap-center">
                      <DesktopProductCard
                        product={product}
                        onAdd={addToCart}
                        accentColor={accentColor}
                        onClick={openProductModal}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Catalog Grid - Desktop */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: accentColor }}></div>
                <h2 className="text-lg font-bold text-white">Nuestra Carta</h2>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <DesktopProductCard
                      key={product.id}
                      product={product}
                      onAdd={addToCart}
                      accentColor={accentColor}
                      onClick={openProductModal}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                  <FaLeaf size={48} className="text-white/30 mb-4" />
                  <p className="text-white/50 font-medium">No hay productos aquí.</p>
                </div>
              )}
            </section>

            {/* Gallery, Posts, Reviews - Desktop Grid */}
            <div className="mt-16 grid grid-cols-1 xl:grid-cols-2 gap-8">
              {gallery && gallery.length > 0 && (
                <section className="bg-white rounded-2xl border border-white/10 overflow-hidden shadow-lg">
                  <h3 className="text-sm font-bold text-[#005C35] p-6 border-b border-stone-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }}></span>
                    Galería
                  </h3>
                  <div className="p-4">
                    <PremiumCarousel images={gallery} accentColor={accentColor} />
                  </div>
                </section>
              )}

              <section className="bg-white rounded-2xl border border-white/10 overflow-hidden shadow-lg">
                <h3 className="text-sm font-bold text-[#005C35] p-6 border-b border-stone-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }}></span>
                  Novedades
                </h3>
                <div className="p-4">
                  <PostGridModal accountSlug={accountSlug} accentColor={accentColor} />
                </div>
              </section>
            </div>

            {/* Reviews - Full Width */}
            <section className="mt-8">
              <MinimalReviewsSection primaryColor={primaryColor} />
            </section>
          </div>
        </main>
      </div>

      {/* ==================== MOBILE LAYOUT (ORIGINAL) ==================== */}
      <div className="lg:hidden flex justify-center min-h-screen font-quicksand" style={{ backgroundColor: primaryColor }}>
        <div className="w-full md:max-w-[480px] min-h-screen relative shadow-2xl overflow-hidden pb-32" style={{ backgroundColor: primaryColor }}>

          <OrganicBackground color={primaryColor} />

          {/* --- HERO SECTION MOBILE --- */}
          <header className="relative h-[480px] w-full">
             <div className="absolute inset-0 overflow-hidden shadow-2xl">
               {resolvedCover ? (
                  <img
                    src={resolvedCover}
                    className="w-full h-full object-cover"
                    style={{ transform: `scale(1.1) translateY(${y * 0.3}px)` }}
                    alt="Cover"
                  />
               ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#004d2c] to-[#002917]" />
               )}
               <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#005C35]" />
             </div>

             <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 px-6 text-center z-10">
                <div className="p-1 bg-white/20 backdrop-blur-md rounded-full mb-3 transform hover:scale-105 transition-transform duration-500 ring-2 ring-white/30">
                   <StoryCircle
                     profileId={profileId}
                     logoUrl={resolvedLogo}
                     name={businessName}
                     size="lg"
                     className="border-2 border-white"
                   />
                </div>

                <ScrollReveal>
                  <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg tracking-tight leading-none">
                      {businessName}
                  </h1>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#8BC53F] mb-5 drop-shadow-md">
                      {businessTitle}
                  </p>
                </ScrollReveal>

                <div className="flex flex-wrap justify-center gap-2 mb-5">
                    {schedule && (
                        <div className="flex items-center gap-1.5 px-4 py-2 bg-black/30 backdrop-blur-md rounded-full border border-white/10 text-[10px] text-white font-medium">
                            <FaClock className="text-[#8BC53F]" /> {schedule}
                        </div>
                    )}
                    {address && (
                        <div className="flex items-center gap-1.5 px-4 py-2 bg-black/30 backdrop-blur-md rounded-full border border-white/10 text-[10px] text-white font-medium">
                            <FaMapMarkerAlt className="text-[#8BC53F]" /> <span className="truncate max-w-[150px]">{address}</span>
                        </div>
                    )}
                </div>

                {activeLinks.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-3 animate-fade-up">
                    {activeLinks.map((link) => (
                      <a
                        key={link.key}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white transition-all hover:bg-white/20 hover:scale-105 active:scale-95 group"
                      >
                        <span className="text-lg group-hover:text-[#8BC53F] transition-colors">{link.icon}</span>
                        <span className="text-xs font-bold tracking-wide">{link.label}</span>
                      </a>
                    ))}
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white transition-all hover:bg-white/20 hover:scale-105 active:scale-95 group cursor-pointer">
                      <ShareButton
                        url={window.location.href}
                        title={businessName}
                        text={businessBio || `Conoce ${businessName}`}
                        iconSize={16}
                        color="currentColor"
                      />
                      <span className="text-xs font-bold tracking-wide">Compartir</span>
                    </div>
                  </div>
                )}
             </div>
          </header>

          {/* Search & Categories - Mobile */}
          <div className="sticky top-0 z-30 pt-4 pb-3 backdrop-blur-xl border-b border-white/5 shadow-lg transition-all duration-300"
               style={{ backgroundColor: 'rgba(0, 92, 53, 0.95)' }}>
             <div className="px-5 mb-3">
                <div className="relative group">
                   <FaSearch className="absolute left-4 top-3 text-white/60 text-xs" />
                   <input
                      type="text"
                      placeholder="Buscar producto..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 rounded-full bg-white/10 border border-white/10 text-white placeholder-white/60 focus:outline-none focus:bg-white/20 focus:border-[#8BC53F]/50 transition-all text-sm font-medium"
                   />
                </div>
             </div>

             <div className="overflow-x-auto scrollbar-hide px-5 flex gap-2 pb-1">
                {categories.map((cat) => (
                   <CategoryPill
                      key={cat}
                      label={cat}
                      isActive={selectedCategory === cat}
                      onClick={() => setSelectedCategory(cat)}
                   />
                ))}
             </div>
          </div>

          {/* Featured Products - Mobile */}
          {featuredProducts.length > 0 && selectedCategory === 'Todos' && !searchTerm && (
            <section className="mt-8 pl-5 relative">
                <div className="flex items-center gap-2 mb-3">
                    <FaFire className="text-[#8BC53F] text-sm" />
                    <h2 className="text-base font-bold text-white">Favoritos</h2>
                </div>

                <div className="relative group">
                    <button
                        onClick={() => scrollFavorites('left')}
                        className="absolute left-[-12px] top-[40%] z-20 w-8 h-8 rounded-full bg-white text-[#005C35] shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                        <FaChevronLeft size={12} />
                    </button>

                    <div
                        ref={favoritesScrollRef}
                        className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 pr-5 snap-x snap-mandatory"
                    >
                        {featuredProducts.map(product => (
                            <div key={product.id} className="min-w-[140px] w-[140px] snap-center">
                                <MobileProductCard
                                    product={product}
                                    onAdd={addToCart}
                                    accentColor={accentColor}
                                    onClick={openProductModal}
                                />
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => scrollFavorites('right')}
                        className="absolute right-2 top-[40%] z-20 w-8 h-8 rounded-full bg-white text-[#005C35] shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                        <FaChevronRight size={12} />
                    </button>
                </div>
            </section>
          )}

          {/* Catalog - Mobile */}
          <main className="px-4 py-4">
             <div className="flex items-center gap-2 mb-4 px-1">
                <div className="w-1 h-4 rounded-full" style={{ backgroundColor: accentColor }}></div>
                <h2 className="text-base font-bold text-white">Nuestra Carta</h2>
             </div>

             {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                   {filteredProducts.map((product) => (
                      <ScrollReveal key={product.id} animation="fade">
                         <MobileProductCard
                            product={product}
                            onAdd={addToCart}
                            accentColor={accentColor}
                            onClick={openProductModal}
                         />
                      </ScrollReveal>
                   ))}
                </div>
             ) : (
                <div className="flex flex-col items-center justify-center py-16 opacity-50">
                   <p className="text-white font-medium text-sm">No hay productos aquí.</p>
                </div>
             )}

             {/* Extra Sections - Mobile */}
             <div className="mt-12 space-y-8 px-1">
                {gallery && gallery.length > 0 && (
                   <section>
                      <h3 className="text-base font-bold text-white mb-3">Galería</h3>
                      <div className="rounded-2xl overflow-hidden shadow-lg border border-white/10">
                         <PremiumCarousel images={gallery} accentColor={accentColor} />
                      </div>
                   </section>
                )}

                <section data-posts-section>
                   <h3 className="text-base font-bold text-white mb-3">Novedades</h3>
                   <div className="rounded-2xl overflow-hidden bg-black/20 border border-white/5">
                     <PostGridModal accountSlug={accountSlug} accentColor={accentColor} />
                   </div>
                </section>

                <MinimalReviewsSection primaryColor={primaryColor} />

                <section className="text-center pb-8 pt-2">
                    <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-4">Síguenos</h3>
                    <div className="flex justify-center gap-4">
                        {normalizedLinks.instagram && <a href={normalizedLinks.instagram} target="_blank" className="p-3 bg-white/10 rounded-full text-white hover:bg-[#E4405F] transition-colors"><FaInstagram size={20} /></a>}
                        {normalizedLinks.facebook && <a href={normalizedLinks.facebook} target="_blank" className="p-3 bg-white/10 rounded-full text-white hover:bg-[#1877F2] transition-colors"><FaFacebook size={20} /></a>}
                        {normalizedLinks.tiktok && <a href={normalizedLinks.tiktok} target="_blank" className="p-3 bg-white/10 rounded-full text-white hover:bg-black transition-colors"><FaTiktok size={20} /></a>}
                    </div>
                </section>
             </div>
          </main>

          {/* Cart Button - Mobile */}
          <MobileCartButton
            count={cartCount}
            total={cartTotal}
            onClick={() => setIsCartOpen(true)}
            color={accentColor}
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
        primaryColor={accentColor}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        total={cartTotal}
        accountSlug={accountSlug}
        primaryColor={accentColor}
        onSuccess={clearCart}
      />

      {/* Product Modal */}
      {isModalOpen && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={closeProductModal}
          onAdd={addToCart}
          accentColor={accentColor}
        />
      )}
    </>
  );
};

export default NaturalCafeTemplate;
