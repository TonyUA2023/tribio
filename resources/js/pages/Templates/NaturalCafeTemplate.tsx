import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import {
  FaInstagram, FaTiktok, FaFacebook, FaMapMarkerAlt,
  FaClock, FaLeaf, FaSearch, FaPlus, FaStar, FaTimes,
  FaFire, FaChevronRight, FaChevronLeft, FaUser, FaPhoneAlt, 
  FaShoppingCart, FaMinus, FaInfoCircle, FaPen, 
  FaWhatsapp, FaGlobe, FaEnvelope
} from 'react-icons/fa';

// --- COMPONENTES MODULARES ---
import { useCart, Product } from '@/hooks/useCart';
import { CartDrawer } from '@/components/checkout/CartDrawer';
import { CheckoutModal } from '@/components/checkout/CheckoutModal';

// --- COMPONENTES UI ---
import { PremiumCarousel, CarouselImage } from '@/components/gallery/PremiumCarousel';
import { StoryCircle } from '@/components/stories/StoryCircle';
import { ScrollReveal } from '@/components/animated/ScrollReveal';
import { LoadingScreen } from '@/components/LoadingScreen';
import PostGridModal from '@/components/posts/PostGridModal';

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
const resolveMediaUrl = (raw?: string) => {
  if (!raw) return '';
  const s = String(raw).trim();
  if (s.startsWith('http')) return s;
  return `/uploaded_files/${s.replace(/^uploaded_files\//, '')}`;
};

const money = (n: number) => `S/ ${Number(n).toFixed(2)}`;

// Configuración de Plataformas Sociales
const SOCIAL_PLATFORMS = [
  { key: 'whatsapp', label: 'WhatsApp', icon: <FaWhatsapp /> },
  { key: 'instagram', label: 'Instagram', icon: <FaInstagram /> },
  { key: 'tiktok', label: 'TikTok', icon: <FaTiktok /> },
  { key: 'facebook', label: 'Facebook', icon: <FaFacebook /> },
  { key: 'website', label: 'Web', icon: <FaGlobe /> },
  { key: 'email', label: 'Email', icon: <FaEnvelope /> },
];

// ==========================================
// 1. COMPONENTES VISUALES & UI
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

const CategoryPill = ({ label, isActive, onClick, activeColor }: any) => (
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

const CompactProductCard = ({ product, onAdd, primaryColor, accentColor }: { product: Product, onAdd: (p: Product) => void, primaryColor: string, accentColor: string }) => (
  <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full border border-stone-100">
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

// --- Componente de Reseñas Minimalista ---
const MinimalReviewsSection = ({ profileId, primaryColor }: { profileId: number, primaryColor: string }) => {
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

// -- Botón Flotante Elegante --
const ElegantCartButton = ({ count, total, onClick, color }: { count: number, total: number, onClick: () => void, color: string }) => {
    if (count === 0) return null;
    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 animate-fade-up pointer-events-none">
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

// ==========================================
// 3. COMPONENTE PRINCIPAL (TEMPLATE)
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

  // Hooks
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

  const loadingScreenUrl = loadingImage ? resolveMediaUrl(loadingImage) : null;
  const resolvedCover = coverImage ? resolveMediaUrl(coverImage) : null;
  const resolvedLogo = logoImage ? resolveMediaUrl(logoImage) : null;

  // Calcular Links Activos
  const activeLinks = useMemo(() => {
    return SOCIAL_PLATFORMS.filter(platform => {
      const url = socialLinks[platform.key];
      return url && url.length > 0;
    }).map(platform => ({
      ...platform,
      url: socialLinks[platform.key]!
    }));
  }, [socialLinks]);

  // 🔥 FORZAR FONDO Y FUENTE 🔥
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

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category || 'General')));
    return ['Todos', ...cats];
  }, [products]);

  const featuredProducts = useMemo(() => {
    return products.filter(p => p.featured && p.available);
  }, [products]);

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

      <div className="flex justify-center min-h-screen font-quicksand" style={{ backgroundColor: primaryColor }}>
        <div className="w-full md:max-w-[480px] min-h-screen relative shadow-2xl overflow-hidden pb-32" style={{ backgroundColor: primaryColor }}>
          
          <OrganicBackground color={primaryColor} />

          {/* --- HERO SECTION INMERSIVO --- */}
          <header className="relative h-[480px] w-full"> 
             {/* Imagen de Fondo Completa (Sin redondeo) */}
             <div className="absolute inset-0 overflow-hidden shadow-2xl">
               {resolvedCover ? (
                  <img 
                    src={resolvedCover} 
                    className="w-full h-full object-cover" 
                    style={{ transform: `scale(1.1) translateY(${y * 0.3}px)` }} 
                  />
               ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#004d2c] to-[#002917]" />
               )}
               {/* Degradado para texto */}
               <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#005C35]" />
             </div>

             {/* Contenido Superpuesto */}
             <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 px-6 text-center z-10">
                <div className="p-1 bg-white/20 backdrop-blur-md rounded-full mb-3 transform hover:scale-105 transition-transform duration-500 ring-2 ring-white/30">
                   <StoryCircle 
                     profileId={profileId} 
                     logoUrl={resolvedLogo} 
                     size="lg" 
                     accentColor={accentColor} 
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
                
                {/* Pills Info */}
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

                {/* 🔥 SOCIAL LINKS (NUEVA SECCIÓN) 🔥 */}
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
                  </div>
                )}
             </div>
          </header>

          {/* --- BUSCADOR Y CATEGORÍAS (Sticky) --- */}
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
                      activeColor={accentColor}
                   />
                ))}
             </div>
          </div>

          {/* --- SECCIÓN DESTACADOS --- */}
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
                                <CompactProductCard 
                                    product={product} 
                                    onAdd={addToCart} 
                                    primaryColor={primaryColor}
                                    accentColor={accentColor}
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

          {/* --- GRID DE PRODUCTOS PRINCIPAL --- */}
          <main className="px-4 py-4">
             <div className="flex items-center gap-2 mb-4 px-1">
                <div className="w-1 h-4 rounded-full" style={{ backgroundColor: accentColor }}></div>
                <h2 className="text-base font-bold text-white">Nuestra Carta</h2>
             </div>

             {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                   {filteredProducts.map((product) => (
                      <ScrollReveal key={product.id} animation="fade">
                         <CompactProductCard 
                            product={product} 
                            onAdd={addToCart} 
                            primaryColor={primaryColor}
                            accentColor={accentColor}
                         />
                      </ScrollReveal>
                   ))}
                </div>
             ) : (
                <div className="flex flex-col items-center justify-center py-16 opacity-50">
                   <p className="text-white font-medium text-sm">No hay productos aquí.</p>
                </div>
             )}

             {/* SECCIONES EXTRA */}
             <div className="mt-12 space-y-8 px-1">
                {gallery && gallery.length > 0 && (
                   <section>
                      <h3 className="text-base font-bold text-white mb-3">Galería</h3>
                      <div className="rounded-2xl overflow-hidden shadow-lg border border-white/10">
                         <PremiumCarousel images={gallery} accentColor={accentColor} />
                      </div>
                   </section>
                )}

                <section>
                   <h3 className="text-base font-bold text-white mb-3">Novedades</h3>
                   <div className="rounded-2xl overflow-hidden bg-black/20 border border-white/5">
                     <PostGridModal accountSlug={accountSlug} accentColor={accentColor} />
                   </div>
                </section>
                
                <MinimalReviewsSection profileId={profileId} primaryColor={primaryColor} />

                <section className="text-center pb-8 pt-2">
                    <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-4">Síguenos</h3>
                    <div className="flex justify-center gap-4">
                        {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" className="p-3 bg-white/10 rounded-full text-white hover:bg-[#E4405F] transition-colors"><FaInstagram size={20} /></a>}
                        {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" className="p-3 bg-white/10 rounded-full text-white hover:bg-[#1877F2] transition-colors"><FaFacebook size={20} /></a>}
                        {socialLinks.tiktok && <a href={socialLinks.tiktok} target="_blank" className="p-3 bg-white/10 rounded-full text-white hover:bg-black transition-colors"><FaTiktok size={20} /></a>}
                    </div>
                </section>
             </div>
          </main>

          <ElegantCartButton 
            count={cartCount} 
            total={cartTotal} 
            onClick={() => setIsCartOpen(true)} 
            color={accentColor}
          />

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
            whatsappNumber={socialLinks.whatsapp} 
            primaryColor={accentColor} 
            onSuccess={clearCart} 
          />

        </div>
      </div>
    </>
  );
};

export default NaturalCafeTemplate;