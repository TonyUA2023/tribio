import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import {
  FaInstagram, FaTiktok, FaFacebook, FaMapMarkerAlt,
  FaClock, FaUniversity, FaSearch, FaPlus, FaStar, FaTimes,
  FaAtom, FaChevronRight, FaChevronLeft, FaUser, FaPhoneAlt, 
  FaGraduationCap, FaMinus, FaInfoCircle, FaPen, 
  FaWhatsapp, FaGlobe, FaEnvelope, FaBookOpen
} from 'react-icons/fa';

// --- COMPONENTES MODULARES (Mismos imports) ---
import { useCart, Product } from '@/hooks/useCart';
import { CartDrawer } from '@/components/checkout/CartDrawer';
import { CheckoutModal } from '@/components/checkout/CheckoutModal';

// --- COMPONENTES UI ---
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
// 1. COMPONENTES VISUALES & UI (Estilo Quantum Academy)
// ==========================================

// Fondo "Cósmico/Quantum"
const CosmicBackground = ({ color }: { color: string }) => (
  <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-[#0a0204]">
    <div className="absolute inset-0 bg-gradient-to-b from-[#0a0204] via-[#1a0505] to-[#000000] opacity-95" />
    <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[120px] bg-[#D4AF37] opacity-10 animate-pulse" />
    <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full blur-[100px] bg-[#800020] opacity-15" />
    <div className="absolute inset-0 opacity-[0.05]" 
         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} 
    />
  </div>
);

// Pill de Facultad/Categoría
const FacultyPill = ({ label, isActive, onClick }: any) => (
  <button
    onClick={onClick}
    className={`px-5 py-2 rounded-sm text-xs font-cinzel font-bold transition-all duration-300 whitespace-nowrap border tracking-wider uppercase
      ${isActive 
        ? 'text-black bg-[#D4AF37] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
        : 'text-[#D4AF37] border-[#D4AF37]/30 bg-black/40 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]'}`}
  >
    {label}
  </button>
);

// Tarjeta de Curso (Estilo Diploma)
// NOTA: Esta tarjeta usa exactamente las mismas props que tu tarjeta de cupcakes
const AcademyCourseCard = ({ product, onAdd, onClick }: { product: Product, onAdd: (p: Product) => void, onClick?: (p: Product) => void }) => (
  <div
    className="group relative bg-[#0f0f0f] rounded-t-lg rounded-b-sm overflow-hidden border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all duration-500 flex flex-col h-full cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]"
    onClick={() => onClick?.(product)}
  >
    {/* Imagen del producto */}
    <div className="relative h-36 w-full overflow-hidden bg-gray-900">
        {product.image ? (
            <img 
            src={resolveMediaUrl(product.image)} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#151515]">
               <FaUniversity size={30} className="text-[#D4AF37]/40" />
            </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent opacity-80" />

        {product.featured && (
            <div className="absolute top-0 right-0 bg-[#D4AF37] text-black text-[9px] font-cinzel font-bold px-3 py-1 rounded-bl-lg shadow-sm z-10 flex items-center gap-1">
                <FaStar size={8} /> DESTACADO
            </div>
        )}
        
        {/* Botón de agregar (visible si available es true o undefined, igual que en NaturalCafe) */}
        {product.available && (
            <button
                onClick={(e) => { e.stopPropagation(); onAdd(product); }}
                className="absolute bottom-2 right-2 w-9 h-9 bg-[#D4AF37] text-black rounded-sm flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.5)] active:scale-90 transition-all z-20 hover:bg-white"
            >
                <FaGraduationCap size={16} />
            </button>
        )}
    </div>
    
    {/* Información del producto */}
    <div className="p-4 flex flex-col flex-1 relative">
      <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent"></div>
      
      {/* Categoría */}
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]/70 mb-2 truncate block font-cinzel">
        {product.category || 'PROGRAMA'}
      </span>
      
      {/* Nombre */}
      <h3 className="font-cinzel font-bold text-sm leading-snug text-gray-100 line-clamp-3 mb-3 min-h-[3em] group-hover:text-[#D4AF37] transition-colors">
        {product.name}
      </h3>
      
      {/* Precio */}
      <div className="mt-auto pt-2 border-t border-white/10 flex justify-between items-center">
        <span className="text-xs text-gray-500 font-raleway">Inversión:</span>
        <span className="text-sm font-cinzel font-bold text-[#D4AF37]">{money(product.price)}</span>
      </div>
    </div>
  </div>
);

// --- Componente de Reseñas ---
const AcademicReviewsSection = ({ profileId }: { profileId: number }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [userRating, setUserRating] = useState(0); 
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div className="bg-[#120505] rounded-lg p-5 border border-[#D4AF37]/20 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-[#D4AF37]/5 pointer-events-none">
                <FaUniversity size={100} />
            </div>

            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <div className="bg-[#D4AF37]/10 p-2.5 rounded-full text-[#D4AF37] border border-[#D4AF37]/30">
                        <FaStar size={16} />
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-cinzel font-bold text-white">5.0</span>
                            <span className="text-[10px] text-gray-400 font-raleway uppercase">Excelencia</span>
                        </div>
                        <p className="text-[9px] text-[#D4AF37] uppercase tracking-widest font-cinzel">Reseñas</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="px-4 py-1.5 rounded-sm text-[10px] font-bold border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all font-cinzel tracking-wide uppercase"
                >
                    {isExpanded ? 'Cerrar' : 'Evaluar'}
                </button>
            </div>

            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-[#D4AF37]/20 animate-fade-up relative z-10">
                    <form onSubmit={(e) => { e.preventDefault(); alert('Reseña enviada'); }} className="space-y-3">
                        <div className="flex justify-center gap-2 mb-3">
                             {[1,2,3,4,5].map(star => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setUserRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <FaStar size={22} className={star <= (hoverRating || userRating) ? "text-[#D4AF37]" : "text-gray-800"} />
                                </button>
                             ))}
                        </div>
                        <input type="text" placeholder="Nombre" className="w-full bg-black/40 border border-[#D4AF37]/30 rounded-sm px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] font-raleway"/>
                        <textarea placeholder="Comentario..." rows={2} className="w-full bg-black/40 border border-[#D4AF37]/30 rounded-sm px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] resize-none font-raleway"/>
                        <button className="w-full py-2.5 rounded-sm font-bold font-cinzel text-black text-xs bg-[#D4AF37] hover:bg-white transition-colors">ENVIAR</button>
                    </form>
                </div>
            )}
        </div>
    );
};

// -- Botón Flotante --
const EnrollmentCartButton = ({ count, total, onClick }: { count: number, total: number, onClick: () => void }) => {
    if (count === 0) return null;
    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 animate-fade-up pointer-events-none">
            <button
                onClick={onClick}
                className="pointer-events-auto flex items-center gap-4 pl-1 pr-6 py-2 bg-[#0f0f0f] rounded-sm shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-[#D4AF37] hover:bg-black transition-all duration-300 group"
            >
                <div className="w-10 h-10 bg-[#D4AF37] flex items-center justify-center text-black font-bold text-sm shadow-md group-hover:rotate-12 transition-transform">
                    {count}
                </div>
                <div className="flex flex-col items-start mr-2">
                    <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-widest leading-none mb-1 font-cinzel">Total</span>
                    <span className="text-sm font-bold text-white leading-none font-raleway">{money(total)}</span>
                </div>
                <div className="h-6 w-px bg-[#D4AF37]/30 mx-2"></div>
                <span className="text-xs font-bold text-gray-300 flex items-center gap-2 group-hover:text-[#D4AF37] transition-colors font-cinzel uppercase">
                    IR A CAJA <FaChevronRight size={10} />
                </span>
            </button>
        </div>
    );
};

// ==========================================
// 3. COMPONENTE PRINCIPAL (TEMPLATE ACADEMY)
// ==========================================

export const AcademyTemplate: React.FC<TemplateProps> = ({ config, customizations }) => {
  const finalConfig = useMemo(() => ({
    ...config,
    ...(customizations || {}),
    // FORZAMOS ESTILO QUANTUM
    primaryColor: '#38040E',   
    secondaryColor: '#000000',
    accentColor: '#D4AF37',    
    businessName: config.businessName || 'Universidad Quantum',
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

  // INYECCIÓN DE FUENTES Y COLORES
  useEffect(() => {
    const linkCinzel = document.createElement('link');
    linkCinzel.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Raleway:wght@300;400;600;700&display=swap';
    linkCinzel.rel = 'stylesheet';
    document.head.appendChild(linkCinzel);

    const originalBodyBg = document.body.style.backgroundColor;
    const originalFont = document.body.style.fontFamily;
    
    document.body.style.backgroundColor = '#0a0204'; 
    document.body.style.fontFamily = "'Raleway', sans-serif";
    
    return () => { 
        document.head.removeChild(linkCinzel);
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

  const categories = useMemo(() => {
    const safeProducts = Array.isArray(products) ? products : [];
    // Usamos la misma lógica que en NaturalCafe: p.category || 'General'
    const cats = Array.from(new Set(safeProducts.map(p => p.category || 'General')));
    return ['Todos', ...cats];
  }, [products]);

  // 🔥 LÓGICA COPIADA EXACTAMENTE DE NATURAL CAFE 🔥
  // Esto asegura que si tus productos se ven en el otro template, se verán aquí también
  const filteredProducts = useMemo(() => {
    const safeProducts = Array.isArray(products) ? products : [];
    
    return safeProducts.filter(p => {
      // 1. Normalización de categoría (si es null, es General)
      const pCat = p.category || 'General';
      // 2. Filtro de Categoría
      const matchCat = selectedCategory === 'Todos' || pCat === selectedCategory;
      // 3. Filtro de Búsqueda
      const matchSearch = p.name ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
      
      // NOTA IMPORTANTE: NO filtramos por 'available' aquí. Mostramos TODO lo que coincida.
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  const featuredProducts = useMemo(() => {
    const safeProducts = Array.isArray(products) ? products : [];
    return safeProducts.filter(p => p.featured && p.available);
  }, [products]);

  return (
    <>
      {isLoading && (
        <LoadingScreen
          logoUrl={loadingScreenUrl}
          onLoadingComplete={() => setIsLoading(false)}
          minDuration={1500}
        />
      )}

      <Head title={`${businessName} | Campus Virtual`}>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content={primaryColor} />
        <style>{`
          .font-cinzel { font-family: 'Cinzel', serif; }
          .font-raleway { font-family: 'Raleway', sans-serif; }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </Head>

      <div className="flex justify-center min-h-screen font-raleway bg-[#0a0204]">
        <div className="w-full md:max-w-[480px] min-h-screen relative shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden pb-32 border-x border-[#1a0505]">
          
          <CosmicBackground color={primaryColor} />

          {/* --- HERO SECTION --- */}
          <header className="relative h-[460px] w-full"> 
             <div className="absolute inset-0 overflow-hidden">
               {resolvedCover ? (
                  <img 
                    src={resolvedCover} 
                    className="w-full h-full object-cover grayscale-[20%] contrast-125" 
                    style={{ transform: `scale(1.1) translateY(${y * 0.3}px)` }} 
                  />
               ) : (
                  <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#38040E] via-[#1a0505] to-black" />
               )}
               <div className="absolute inset-0 bg-gradient-to-b from-[#38040E]/40 via-[#0a0204]/70 to-[#0a0204]" />
             </div>

             <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 px-6 text-center z-10">
                <div className="p-1 mb-4 relative">
                   <div className="absolute inset-0 rounded-full border border-dashed border-[#D4AF37]/40 animate-spin-slow"></div>
                   <StoryCircle 
                     profileId={profileId} 
                     logoUrl={resolvedLogo} 
                     size="lg" 
                     accentColor={accentColor} 
                     className="border-2 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                   />
                </div>
                
                <ScrollReveal>
                  <h1 className="text-3xl font-cinzel font-bold text-white mb-2 drop-shadow-lg tracking-wider">
                      {businessName.toUpperCase()}
                  </h1>
                  <div className="h-px w-24 bg-[#D4AF37] mx-auto mb-3"></div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37] mb-5 drop-shadow-md font-raleway">
                      {businessTitle}
                  </p>
                </ScrollReveal>
                
                <div className="flex flex-wrap justify-center gap-2 mb-5">
                    {schedule && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md border border-[#D4AF37]/30 text-[10px] text-gray-300 font-cinzel">
                            <FaClock className="text-[#D4AF37]" /> {schedule}
                        </div>
                    )}
                    {address && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md border border-[#D4AF37]/30 text-[10px] text-gray-300 font-cinzel">
                            <FaMapMarkerAlt className="text-[#D4AF37]" /> <span className="truncate max-w-[150px]">{address}</span>
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
                        className="flex items-center justify-center w-9 h-9 bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-[#D4AF37] transition-all hover:bg-[#D4AF37] hover:text-black transform hover:rotate-6 rounded-sm"
                      >
                        <span className="text-sm">{link.icon}</span>
                      </a>
                    ))}
                  </div>
                )}
             </div>
          </header>

          {/* --- BARRA STICKY --- */}
          <div className="sticky top-0 z-30 pt-4 pb-3 backdrop-blur-xl border-b border-[#D4AF37]/20 shadow-lg transition-all duration-300" 
               style={{ backgroundColor: 'rgba(10, 2, 4, 0.9)' }}>
             <div className="px-5 mb-3">
                <div className="relative group">
                   <FaSearch className="absolute left-4 top-3 text-[#D4AF37] text-xs" />
                   <input
                     type="text"
                     placeholder="Buscar programa..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="block w-full pl-10 pr-4 py-2.5 rounded-sm bg-white/5 border border-[#D4AF37]/20 text-white placeholder-gray-500 focus:outline-none focus:bg-black focus:border-[#D4AF37] transition-all text-sm font-raleway"
                   />
                </div>
             </div>
             
             <div className="overflow-x-auto scrollbar-hide px-5 flex gap-2 pb-1">
                {categories.map((cat) => (
                   <FacultyPill
                      key={cat}
                      label={cat}
                      isActive={selectedCategory === cat}
                      onClick={() => setSelectedCategory(cat)}
                   />
                ))}
             </div>
          </div>

          {/* --- DESTACADOS --- */}
          {featuredProducts.length > 0 && selectedCategory === 'Todos' && !searchTerm && (
            <section className="mt-8 pl-5 relative border-l-2 border-[#D4AF37] ml-4">
                <div className="flex items-center gap-2 mb-4 ml-[-9px]">
                    <div className="bg-[#0a0204] border border-[#D4AF37] p-1.5 rounded-full">
                        <FaAtom className="text-[#D4AF37] text-xs animate-spin-slow" />
                    </div>
                    <h2 className="text-xs font-cinzel font-bold text-white tracking-widest uppercase">Destacados</h2>
                </div>
                
                <div className="relative group pl-2">
                    <button 
                        onClick={() => scrollFavorites('left')}
                        className="absolute left-[-20px] top-[40%] z-20 w-8 h-8 bg-[#D4AF37] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg border border-black"
                    >
                        <FaChevronLeft size={10} />
                    </button>

                    <div ref={favoritesScrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-6 pr-5 snap-x snap-mandatory">
                        {featuredProducts.map(product => (
                            <div key={product.id} className="min-w-[150px] w-[150px] snap-center">
                                <AcademyCourseCard
                                    product={product}
                                    onAdd={addToCart}
                                    onClick={openProductModal}
                                />
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => scrollFavorites('right')}
                        className="absolute right-2 top-[40%] z-20 w-8 h-8 bg-[#D4AF37] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg border border-black"
                    >
                        <FaChevronRight size={10} />
                    </button>
                </div>
            </section>
          )}

          {/* --- GRID PRINCIPAL (AQUÍ APARECERÁN TUS PRODUCTOS) --- */}
          <main className="px-4 py-8 relative">
             <div className="flex items-center justify-center gap-3 mb-6 px-1">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#D4AF37]/40"></div>
                <h2 className="text-sm font-cinzel font-bold text-[#D4AF37] uppercase tracking-[0.2em] text-center">
                    Oferta Académica
                </h2>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#D4AF37]/40"></div>
             </div>

             {/* Renderizado idéntico al NaturalCafe */}
             {filteredProducts && filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                   {filteredProducts.map((product) => (
                      <ScrollReveal key={product.id || Math.random()} animation="fade">
                          <AcademyCourseCard
                             product={product}
                             onAdd={addToCart}
                             onClick={openProductModal}
                          />
                      </ScrollReveal>
                   ))}
                </div>
             ) : (
                <div className="flex flex-col items-center justify-center py-16 opacity-60 border border-dashed border-[#D4AF37]/30 rounded-lg bg-white/5 mx-4">
                   <FaBookOpen size={30} className="text-[#D4AF37] mb-3" />
                   <p className="text-gray-400 font-cinzel text-xs text-center">No se encontraron cursos activos<br/>en esta categoría.</p>
                </div>
             )}

             {/* SECCIONES EXTRA */}
             <div className="mt-16 space-y-12 px-1 relative z-10">
                {gallery && gallery.length > 0 && (
                   <section>
                      <h3 className="text-xs font-cinzel font-bold text-[#D4AF37] mb-4 border-l-4 border-[#D4AF37] pl-3 uppercase">Galería</h3>
                      <div className="rounded-sm overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-[#D4AF37]/20">
                         <PremiumCarousel images={gallery} accentColor={accentColor} />
                      </div>
                   </section>
                )}

                <section data-posts-section>
                   <h3 className="text-xs font-cinzel font-bold text-[#D4AF37] mb-4 border-l-4 border-[#D4AF37] pl-3 uppercase">Actualidad</h3>
                   <div className="rounded-sm overflow-hidden bg-[#0a0204] border border-[#D4AF37]/20 p-2">
                     <PostGridModal accountSlug={accountSlug} accentColor={accentColor} />
                   </div>
                </section>
                
                <AcademicReviewsSection profileId={profileId} />

                <section className="text-center pb-8 pt-10 border-t border-[#D4AF37]/10">
                    <p className="mt-8 text-[9px] text-gray-600 font-cinzel tracking-widest">
                        © {new Date().getFullYear()} {businessName.toUpperCase()}
                    </p>
                </section>
             </div>
          </main>

          <EnrollmentCartButton 
            count={cartCount} 
            total={cartTotal}
            onClick={() => setIsCartOpen(true)}
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
            primaryColor={accentColor}
            onSuccess={clearCart}
          />

          {/* Modal de Detalle */}
          {isModalOpen && selectedProduct && (
            <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
              <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={closeProductModal} />
              <div className="relative w-full sm:max-w-md bg-[#0f0f0f] rounded-t-xl sm:rounded-sm shadow-[0_0_50px_rgba(212,175,55,0.2)] overflow-hidden animate-slide-in-up max-h-[90vh] sm:max-h-[85vh] flex flex-col border border-[#D4AF37]/30">
                <button
                  onClick={closeProductModal}
                  className="absolute top-4 right-4 z-20 w-8 h-8 bg-black/50 text-[#D4AF37] border border-[#D4AF37] flex items-center justify-center hover:bg-[#D4AF37] hover:text-black transition-colors rounded-sm"
                >
                  <FaTimes />
                </button>

                <div className="relative h-64 w-full overflow-hidden">
                  {selectedProduct.image ? (
                    <img
                      src={resolveMediaUrl(selectedProduct.image)}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#151515]">
                      <FaUniversity size={50} className="text-[#D4AF37]/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] to-transparent" />
                </div>

                <div className="flex-1 overflow-y-auto p-6 relative">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-2 font-cinzel">
                    {selectedProduct.category || 'Programa'}
                  </div>
                  <h2 className="text-xl font-cinzel font-bold text-white mb-4 leading-tight">
                    {selectedProduct.name}
                  </h2>

                  {selectedProduct.description && (
                    <div className="mb-6 relative">
                      <h3 className="text-xs font-bold text-gray-500 mb-2 font-cinzel uppercase border-b border-white/10 pb-1">Descripción</h3>
                      <p className="text-sm text-gray-300 leading-relaxed font-raleway text-justify">
                        {selectedProduct.description}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-8 bg-black/30 p-4 border-l-2 border-[#D4AF37]">
                     <div>
                        <span className="text-[10px] text-gray-500 font-raleway uppercase block mb-1">Inversión</span>
                        <div className="text-2xl font-cinzel font-bold text-[#D4AF37]">
                            {money(selectedProduct.price)}
                        </div>
                     </div>
                  </div>
                </div>

                {/* Botón de Acción - Visible si available es true (Igual que NaturalCafe) */}
                {selectedProduct.available && (
                  <div className="p-5 border-t border-[#D4AF37]/20 bg-[#0a0a0a]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(selectedProduct);
                        closeProductModal();
                      }}
                      className="w-full py-3.5 font-cinzel font-bold text-black text-sm transition-all hover:bg-white active:scale-[0.98] shadow-[0_0_20px_rgba(212,175,55,0.2)] bg-[#D4AF37] flex items-center justify-center gap-2"
                    >
                        <FaPen size={12} /> INSCRIBIRSE
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <style>{`
            @keyframes slideInUp {
              from { transform: translateY(100%); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
            .animate-slide-in-up {
              animation: slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }
            @keyframes spin-slow {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .animate-spin-slow {
                animation: spin-slow 10s linear infinite;
            }
          `}</style>
        </div>
      </div>
    </>
  );
};

export default AcademyTemplate;