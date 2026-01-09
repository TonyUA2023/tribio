import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Head } from '@inertiajs/react';
import {
  FaInstagram, FaTiktok, FaFacebook, FaMapMarkerAlt,
  FaClock, FaSearch, FaPlus, FaChevronRight, FaChevronLeft,
  FaWhatsapp, FaDumbbell, FaBolt, FaHeartbeat, FaGlobe, FaEnvelope
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
import { ContentButton } from '@/components/content/ContentButton';

// --- CONFIGURACIÓN ---
const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram', icon: <FaInstagram size={20} />, color: 'from-purple-600 via-pink-600 to-orange-500', iconColor: 'text-pink-400' },
  { key: 'tiktok', label: 'TikTok', icon: <FaTiktok size={20} />, color: 'from-cyan-400 via-pink-500 to-purple-600', iconColor: 'text-cyan-400' },
  { key: 'facebook', label: 'Facebook', icon: <FaFacebook size={20} />, color: 'from-blue-600 to-blue-500', iconColor: 'text-blue-400' },
  { key: 'whatsapp', label: 'WhatsApp', icon: <FaWhatsapp size={20} />, color: 'from-green-500 to-green-600', iconColor: 'text-green-400' },
  { key: 'website', label: 'Web', icon: <FaGlobe size={20} />, color: 'from-gray-500 to-gray-600', iconColor: 'text-gray-400' },
  { key: 'email', label: 'Email', icon: <FaEnvelope size={20} />, color: 'from-red-500 to-red-600', iconColor: 'text-red-400' },
];

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
}

interface TemplateProps {
  config: WellnessConfig;
  customizations?: any;
}

const resolveMediaUrl = (raw?: string) => {
  if (!raw) return '';
  const s = String(raw).trim();
  if (s.startsWith('http')) return s;
  return `/uploaded_files/${s.replace(/^uploaded_files\//, '')}`;
};

const money = (n: number) => `S/ ${Number(n).toFixed(2)}`;

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

const CategoryPill = ({ label, isActive, onClick }: any) => (
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

const DarkProductCard = ({ product, onAdd, accentColor }: { product: Product, onAdd: (p: Product) => void, accentColor: string }) => (
  <div className="group relative bg-[#18181b] rounded-xl overflow-hidden border border-white/5 shadow-lg flex flex-col h-full hover:border-white/20 transition-all duration-300">
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
      <div className="mt-auto pt-2 border-t border-white/5 flex justify-between items-center">
        <span className="text-lg font-bold" style={{ color: accentColor }}>{money(product.price)}</span>
      </div>
    </div>
  </div>
);

const DarkCartButton = ({ count, total, onClick, color }: { count: number, total: number, onClick: () => void, color: string }) => {
    if (count === 0) return null;
    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 animate-fade-up pointer-events-none">
            <button
                onClick={onClick}
                className="pointer-events-auto flex items-center justify-between w-full max-w-[350px] pl-2 pr-6 py-2 bg-[#18181b] rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] border border-white/10 hover:scale-[1.02] active:scale-95 transition-all duration-300"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-black font-black text-sm shadow-lg" style={{ backgroundColor: color }}>
                        {count}
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">Total a pagar</span>
                        <span className="text-base font-bold text-white leading-none">{money(total)}</span>
                    </div>
                </div>
                <span className="text-xs font-bold text-white flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-md border border-white/5">
                    Ver Pedido <FaChevronRight size={10} />
                </span>
            </button>
        </div>
    );
};

// ==========================================
// TEMPLATE
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
    accountSlug
  } = finalConfig;

  const rawSocialLinks = { ...(links2 || {}), ...(links1 || {}) };

  const activeLinks = useMemo(() => {
    return SOCIAL_PLATFORMS.filter(platform => {
      const url = rawSocialLinks[platform.key];
      return url && url.length > 0;
    }).map(platform => ({
      ...platform,
      url: rawSocialLinks[platform.key]!
    }));
  }, [rawSocialLinks]);

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
  
  const favoritesScrollRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(() => ['Todos', ...Array.from(new Set(products.map(p => p.category || 'General')))], [products]);
  const featuredProducts = useMemo(() => products.filter(p => p.featured && p.available), [products]);
  
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const pCat = p.category || 'General';
      const matchCat = selectedCategory === 'Todos' || pCat === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchTerm]);

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

      <div className="flex justify-center min-h-screen font-sans selection:bg-yellow-500/30" style={{ backgroundColor }}>
        <div className="w-full md:max-w-[480px] min-h-screen relative shadow-2xl overflow-hidden pb-32 bg-[#09090b]">
          
          <DarkFitnessBackground color={primaryColor} />

          {/* --- HERO SECTION CORREGIDA --- */}
          {/* 1. Aumentamos altura (h-[500px]) para que se vea más imagen */}
          <header className="relative w-full h-[500px] pb-8 overflow-hidden"> 
             
             {/* Imagen de Fondo */}
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
               {/* 2. DEGRADADO CORREGIDO: 
                 Cambiamos 'via-[#09090b]/60' a 'via-transparent'.
                 Esto asegura que el centro de la imagen esté LIMPIO y solo se oscurezca el fondo 
                 para el texto.
               */}
               <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent" />
               {/* Capa extra solo abajo para legibilidad extrema del texto */}
               <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#09090b] to-transparent opacity-90" />
             </div>

             {/* Contenido Hero */}
             <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 px-6 text-center z-10">
                {/* 3. ESPACIADO DE LA FOTO DE PERFIL: 
                   Aumentamos 'mb-4' a 'mb-8' para separar la foto del texto.
                */}
                <div className="relative mb-8 transform hover:scale-105 transition-transform duration-500">
                    {/* Brillo detrás de la foto */}
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

                {/* Info Pills */}
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

                {/* Redes Sociales Header */}
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
                    </div>
                )}
             </div>
          </header>

          {/* ... RESTO DEL CÓDIGO (Igual que antes) ... */}
          
          <div className="sticky top-0 z-30 pt-4 pb-4 backdrop-blur-xl border-b border-white/5 transition-all duration-300 shadow-2xl" 
               style={{ backgroundColor: 'rgba(9, 9, 11, 0.95)' }}>
             <div className="px-4 mb-4">
                <div className="relative group">
                   <FaSearch className="absolute left-4 top-3.5 text-gray-500 text-xs" />
                   <input
                      type="text"
                      placeholder="Buscar suplementos..."
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
                   />
                ))}
             </div>
          </div>

          {featuredProducts.length > 0 && selectedCategory === 'Todos' && !searchTerm && (
            <section className="mt-8 pl-4 relative">
                <div className="flex items-center justify-between pr-4 mb-4">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <FaBolt style={{ color: primaryColor }} /> Destacados
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={() => scrollFavorites('left')} className="p-1.5 rounded-md bg-[#18181b] text-white border border-white/5 hover:bg-white/10"><FaChevronLeft size={10} /></button>
                        <button onClick={() => scrollFavorites('right')} className="p-1.5 rounded-md bg-[#18181b] text-white border border-white/5 hover:bg-white/10"><FaChevronRight size={10} /></button>
                    </div>
                </div>
                
                <div ref={favoritesScrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 pr-4 snap-x">
                    {featuredProducts.map(product => (
                        <div key={product.id} className="min-w-[160px] w-[160px] snap-center h-[260px]">
                            <DarkProductCard 
                                product={product} 
                                onAdd={addToCart} 
                                accentColor={primaryColor}
                            />
                        </div>
                    ))}
                </div>
            </section>
          )}

          <main className="px-4 py-6">
             <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Catálogo Completo</h2>
             </div>

             {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                   {filteredProducts.map((product) => (
                      <ScrollReveal key={product.id} animation="fade">
                         <DarkProductCard
                            product={product}
                            onAdd={addToCart}
                            accentColor={primaryColor}
                         />
                      </ScrollReveal>
                   ))}
                </div>
             ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                   <FaDumbbell size={40} className="text-gray-500 mb-2" />
                   <p className="text-gray-400 font-medium text-sm">No se encontraron productos.</p>
                </div>
             )}

             <div className="mt-16 space-y-10">
                {gallery && gallery.length > 0 && (
                   <section>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Galería</h3>
                      <div className="rounded-xl overflow-hidden shadow-lg border border-white/5">
                         <PremiumCarousel images={gallery} accentColor={primaryColor} />
                      </div>
                   </section>
                )}

                <section data-posts-section>
                   <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Blog & Tips</h3>
                   <div className="bg-[#18181b] rounded-xl p-1">
                     <PostGridModal accountSlug={accountSlug} accentColor={primaryColor} />
                   </div>
                </section>
                
                <section>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Testimonios</h3>
                    <div className="bg-[#18181b] rounded-xl border border-white/5 p-4 mb-4">
                        <ReviewsList accountSlug={accountSlug} accentColor={primaryColor} />
                    </div>
                    <div className="bg-[#18181b] rounded-xl border border-white/5 p-4">
                        <ReviewForm accountSlug={accountSlug} accentColor={primaryColor} />
                    </div>
                </section>
             </div>
          </main>

          <ContentButton
            accountSlug={accountSlug}
            accentColor={primaryColor}
            position="left"
          />

          <DarkCartButton
            count={cartCount}
            total={cartTotal}
            onClick={() => setIsCartOpen(true)}
            color={primaryColor}
          />

          <CartDrawer 
            isOpen={isCartOpen} 
            onClose={() => setIsCartOpen(false)} 
            cart={cart} 
            total={cartTotal} 
            onUpdateQuantity={updateQuantity} 
            onProceed={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} 
            primaryColor={primaryColor} 
          />

          <CheckoutModal 
            isOpen={isCheckoutOpen} 
            onClose={() => setIsCheckoutOpen(false)} 
            cart={cart} 
            total={cartTotal} 
            accountSlug={accountSlug} 
            whatsappNumber={activeLinks.find(l => l.key === 'whatsapp')?.url} 
            primaryColor={primaryColor} 
            onSuccess={clearCart} 
          />

        </div>
      </div>
    </>
  );
};

export default WellnessCoachTemplate;