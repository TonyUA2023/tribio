import React, { useEffect, useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import {
  FaWhatsapp,
  FaInstagram,
  FaTiktok,
  FaFacebook,
  FaShoppingCart,
  FaPlus,
  FaMinus,
  FaTimes,
  FaSearch,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaUser,
  FaUtensils,
  FaFire,
  FaChevronRight,
  FaStar,
  FaClock
} from 'react-icons/fa';

// --- COMPONENTES REUTILIZABLES (De tu proyecto) ---
import { PremiumCarousel, CarouselImage } from '@/components/gallery/PremiumCarousel';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewsList } from '@/components/reviews/ReviewsList';
import { ScrollReveal } from '@/components/animated/ScrollReveal';
import { LoadingScreen } from '@/components/LoadingScreen';
import { StoryCircle } from '@/components/stories/StoryCircle';
import PostGridModal from '@/components/posts/PostGridModal';

// --- INTERFACES ---
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  available: boolean;
  featured?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ProductTemplateConfig {
  primaryColor: string;
  backgroundColor: string;
  loadingImage?: string;
  coverImage?: string;
  logoImage?: string;
  businessName: string;
  businessTitle: string;
  businessBio?: string;
  schedule?: string;
  address?: string;
  phone?: string;
  
  // Datos dinámicos
  products: Product[];
  socialLinks: {
    whatsapp?: string;
    instagram?: string;
    tiktok?: string;
    facebook?: string;
  };
  gallery?: CarouselImage[];
  profileId: number;
  accountSlug: string;
}

interface ProductTemplateProps {
  config: ProductTemplateConfig;
  customizations?: any;
}

// --- UTILIDADES ---
const resolveMediaUrl = (raw?: string) => {
  if (!raw) return '';
  const s = String(raw).trim();
  if (s.startsWith('http')) return s;
  return `/uploaded_files/${s.replace(/^uploaded_files\//, '')}`;
};

const money = (n: number) => `S/ ${n.toFixed(2)}`;

// --- COMPONENTES INTERNOS ---

/**
 * 1. Botón Social (Reutilizando estilo de BarberTemplate)
 */
const PremiumSocialButton = ({
    icon,
    title,
    subtitle,
    href,
    brandColor,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    href: string;
    brandColor: string;
  }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center gap-4 p-4 rounded-xl overflow-hidden
        bg-white/5 border border-white/5 backdrop-blur-md
        hover:border-white/10 transition-all duration-500 hover:-translate-y-1 active:scale-95"
    >
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-r ${brandColor}`}
      />
      <div
        className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center
        bg-gradient-to-br from-gray-800 to-black border border-white/10 shadow-lg
        group-hover:scale-110 transition-transform duration-300"
      >
        <div className="text-gray-300 group-hover:text-white transition-colors">
          {icon}
        </div>
      </div>
  
      <div className="relative z-10 flex flex-col flex-1 text-left">
        <span className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold group-hover:text-gray-300 transition-colors">
          {subtitle}
        </span>
        <span className="text-gray-100 font-bold text-base leading-tight group-hover:text-amber-400 transition-colors truncate">
          {title}
        </span>
      </div>
  
      <div className="relative z-10 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        <FaChevronRight className="text-white/50" />
      </div>
    </a>
  );

/**
 * 2. Tarjeta de Producto (Optimizada para Grid)
 */
const ProductCard = ({ product, onAdd, primaryColor }: { product: Product, onAdd: (p: Product) => void, primaryColor: string }) => (
  <div className="group relative bg-[#151515] border border-white/5 rounded-2xl overflow-hidden flex flex-col h-full hover:border-white/20 transition-all duration-300 shadow-lg">
    {/* Imagen */}
    <div className="relative h-36 sm:h-40 overflow-hidden bg-slate-800">
      {product.image ? (
        <img 
          src={resolveMediaUrl(product.image)} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white/10">
          <FaUtensils size={32} />
        </div>
      )}
      {!product.available && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm z-10">
          <span className="text-white font-bold text-[10px] px-3 py-1 rounded-full bg-red-600 uppercase tracking-wider">Agotado</span>
        </div>
      )}
      {product.featured && (
        <div className="absolute top-2 right-2 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-lg">
            Popular
        </div>
      )}
    </div>

    {/* Info */}
    <div className="p-3 flex flex-col flex-1">
      <div className="mb-1">
        <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">{product.name}</h3>
      </div>
      <p className="text-gray-500 text-[11px] line-clamp-2 mb-3 flex-1">{product.description}</p>
      
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
        <span className="text-lg font-bold text-white">{money(product.price)}</span>
        <button
          onClick={() => product.available && onAdd(product)}
          disabled={!product.available}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg
            ${product.available ? 'text-black hover:brightness-110' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
          style={product.available ? { backgroundColor: primaryColor } : {}}
        >
          <FaPlus size={12} />
        </button>
      </div>
    </div>
  </div>
);

/**
 * 3. Modal de Datos del Cliente (Paso final antes de WhatsApp)
 */
const CustomerModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  total, 
  isSubmitting,
  primaryColor 
}: any) => {
  const [data, setData] = useState({ name: '', phone: '', address: '' });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-[#111] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-fade-up">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">Finalizar Pedido</h3>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white">
            <FaTimes />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 p-4 rounded-xl border border-white/5 mb-4 flex justify-between items-center">
            <span className="text-gray-400 text-sm">Total a pagar:</span>
            <div className="text-2xl font-bold text-white" style={{ color: primaryColor }}>{money(total)}</div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2 ml-1">Tu Nombre</label>
            <div className="relative">
              <FaUser className="absolute left-4 top-3.5 text-gray-500 text-sm" />
              <input 
                type="text"
                placeholder="Ej. Juan Pérez"
                className="w-full bg-[#000] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-white/30 transition-colors text-sm"
                value={data.name}
                onChange={e => setData({...data, name: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2 ml-1">WhatsApp / Teléfono</label>
            <div className="relative">
              <FaPhoneAlt className="absolute left-4 top-3.5 text-gray-500 text-sm" />
              <input 
                type="tel"
                placeholder="Ej. 999 999 999"
                className="w-full bg-[#000] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-white/30 transition-colors text-sm"
                value={data.phone}
                onChange={e => setData({...data, phone: e.target.value})}
              />
            </div>
          </div>

          <button
            onClick={() => onConfirm(data)}
            disabled={!data.name || !data.phone || isSubmitting}
            className="w-full py-4 rounded-xl font-bold text-black text-base mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:brightness-110 transition-all"
            style={{ backgroundColor: primaryColor }}
          >
            {isSubmitting ? (
              <span className="animate-pulse">Procesando...</span>
            ) : (
              <>
                <span>Confirmar y Enviar</span>
                <FaWhatsapp className="text-xl" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export const ProductShowcaseTemplate: React.FC<ProductTemplateProps> = ({ config, customizations }) => {
  const finalConfig = useMemo(() => ({ ...config, ...(customizations || {}) }), [config, customizations]);

  const {
    primaryColor = '#fbbf24',
    backgroundColor = '#0f172a',
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

  // Estados
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [y, setY] = useState(0);

  // URLs
  const resolvedCover = coverImage ? resolveMediaUrl(coverImage) : null;
  const resolvedLogo = logoImage ? resolveMediaUrl(logoImage) : null;
  const loadingScreenUrl = loadingImage ? resolveMediaUrl(loadingImage) : null;

  // Parallax
  useEffect(() => {
    const onScroll = () => setY(Math.min(60, window.scrollY * 0.15));
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Categorías
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category || 'General')));
    return ['Todos', ...cats];
  }, [products]);

  // Filtros
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const pCat = p.category || 'General';
      const matchCat = selectedCategory === 'Todos' || pCat === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // --- CARRITO ---
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  // --- CHECKOUT ---
  const handleConfirmOrder = async (customerData: { name: string, phone: string }) => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const payload = {
        customer_name: customerData.name,
        customer_phone: customerData.phone,
        items: cart.map(item => ({
          id: item.id,
          quantity: item.quantity
        }))
      };

      const response = await axios.post(`/${accountSlug}/checkout`, payload);
      const { order_number } = response.data;

      // Mensaje WhatsApp
      const itemsList = cart.map(item => 
        `▪️ ${item.quantity}x ${item.name}`
      ).join('\n');

      const message = 
        `Hola, soy *${customerData.name}* 👋\n` +
        `Nuevo pedido *#${order_number}*:\n\n` +
        `${itemsList}\n\n` +
        `*💰 Total: ${money(cartTotal)}*`;

      const whatsappUrl = `https://wa.me/${socialLinks.whatsapp?.replace(/\D/g, '') || ''}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      setCart([]);
      setIsCheckoutOpen(false);
      setIsCartOpen(false);

    } catch (error) {
      console.error(error);
      alert('Error al procesar el pedido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isLoading && (
        <LoadingScreen
          logoUrl={loadingScreenUrl}
          onLoadingComplete={() => setIsLoading(false)}
          minDuration={1000}
        />
      )}

      <Head title={`${businessName} | Menú`}>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content={backgroundColor} />
      </Head>

      <div className="flex justify-center items-center min-h-screen bg-neutral-950 md:p-8">
        
        {/* Container Principal */}
        <div className="relative w-full flex flex-col overflow-hidden bg-slate-950 min-h-screen font-sans text-gray-100
          md:max-w-screen-md md:h-[860px] md:rounded-[40px] md:shadow-2xl md:shadow-black md:mx-auto md:border md:border-white/5 md:overflow-y-auto custom-scrollbar">
          
          {/* --- HEADER --- */}
          <header className="relative shrink-0">
            <div className="h-60 overflow-hidden relative">
              {resolvedCover ? (
                <img 
                    src={resolvedCover} 
                    alt="Cover" 
                    className="w-full h-full object-cover transition-transform duration-500"
                    style={{ transform: `translateY(${y * 0.5}px) scale(1.1)` }} 
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-800 to-black" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            </div>
            
            <div className="px-6 -mt-20 relative z-10 flex flex-col items-center text-center">
              <StoryCircle 
                profileId={profileId} 
                logoUrl={resolvedLogo} 
                name={businessName} 
                size="lg" 
                accentColor={primaryColor} 
                className="shadow-2xl ring-4 ring-slate-950"
              />
              
              <div className="mt-4 animate-fade-up">
                 <h1 className="text-3xl font-black text-white leading-tight">{businessName}</h1>
                 <p className="text-sm font-bold uppercase tracking-widest mt-1 opacity-80" style={{ color: primaryColor }}>{businessTitle}</p>
              </div>

              {businessBio && (
                <p className="text-gray-400 text-xs sm:text-sm mt-3 line-clamp-2 px-4 max-w-sm animate-fade-up delay-100">
                    {businessBio}
                </p>
              )}

              {/* Info Bar */}
              <div className="flex gap-4 mt-4 text-xs text-gray-400 animate-fade-up delay-200">
                {schedule && (
                  <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                    <FaClock className={primaryColor ? `text-[${primaryColor}]` : 'text-amber-400'} /> {schedule}
                  </div>
                )}
                {address && (
                    <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                      <FaMapMarkerAlt className="text-red-400" /> 
                      <span className="truncate max-w-[150px]">{address}</span>
                    </div>
                )}
              </div>
            </div>
          </header>

          {/* --- SEARCH & FILTER --- */}
          <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md pt-4 pb-2 border-b border-white/5">
             <div className="px-6 mb-3">
                <div className="relative">
                    <FaSearch className="absolute left-3 top-3 text-gray-500 text-xs" />
                    <input 
                        type="text" 
                        placeholder="Buscar en el menú..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-[#111] border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                    />
                </div>
             </div>
             
             <div className="overflow-x-auto scrollbar-hide px-6 flex gap-2 pb-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border
                    ${selectedCategory === cat 
                      ? 'text-black border-transparent shadow-lg transform scale-105' 
                      : 'bg-transparent text-gray-400 border-white/10 hover:bg-white/5'}`}
                  style={selectedCategory === cat ? { backgroundColor: primaryColor } : {}}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* --- PRODUCT GRID --- */}
          <main className="px-5 py-6 pb-32 min-h-[400px]">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {filteredProducts.map(product => (
                  <ScrollReveal key={product.id} animation="fade">
                    <ProductCard 
                      product={product} 
                      onAdd={addToCart} 
                      primaryColor={primaryColor}
                    />
                  </ScrollReveal>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 opacity-40">
                <FaSearch className="text-4xl mb-3" />
                <p className="text-sm">No encontramos productos</p>
              </div>
            )}

            {/* SECCIONES EXTRA (Reutilizadas) */}
            <div className="mt-12 space-y-12 border-t border-white/5 pt-10">
                
                {/* Redes Sociales */}
                <section>
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                        <span className="w-1 h-5 rounded-full" style={{background: primaryColor}}></span>
                        Síguenos
                    </h3>
                    <div className="space-y-2">
                        {socialLinks.instagram && <PremiumSocialButton href={socialLinks.instagram} icon={<FaInstagram size={20}/>} title="Instagram" subtitle="Fotos y Novedades" brandColor="from-purple-600 via-pink-600 to-orange-500" />}
                        {socialLinks.tiktok && <PremiumSocialButton href={socialLinks.tiktok} icon={<FaTiktok size={20}/>} title="TikTok" subtitle="Videos Virales" brandColor="from-black to-gray-800" />}
                        {socialLinks.facebook && <PremiumSocialButton href={socialLinks.facebook} icon={<FaFacebook size={20}/>} title="Facebook" subtitle="Comunidad" brandColor="from-blue-600 to-blue-800" />}
                    </div>
                </section>

                {/* Posts */}
                <section>
                   <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                        <span className="text-xl">📸</span> Galería Social
                   </h3>
                   <div className="rounded-2xl overflow-hidden border border-white/5">
                      <PostGridModal accountSlug={accountSlug} accentColor={primaryColor} />
                   </div>
                </section>

                {/* Reviews */}
                <section>
                   <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                        <FaStar style={{color: primaryColor}} /> Opiniones
                   </h3>
                   <ReviewsList accountSlug={accountSlug} accentColor={primaryColor} />
                   <div className="mt-4">
                      <ReviewForm accountSlug={accountSlug} accentColor={primaryColor} />
                   </div>
                </section>
            </div>
          </main>

          {/* --- FLOATING CART BUTTON --- */}
          {cart.length > 0 && (
            <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 md:absolute md:w-full">
              <button
                onClick={() => setIsCartOpen(true)}
                className="w-full max-w-md bg-white text-black py-3.5 rounded-xl shadow-2xl shadow-white/10 flex items-center justify-between px-5 transform transition-transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-black/20 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-black/80">
                    {cartCount}
                  </div>
                  <span className="font-bold text-sm uppercase tracking-wide text-black/80">Ver Mi Pedido</span>
                </div>
                <span className="font-black text-lg text-black">{money(cartTotal)}</span>
              </button>
            </div>
          )}

          {/* --- CART SHEET (Modal) --- */}
          {isCartOpen && (
            <div className="fixed inset-0 z-[60] flex flex-col justify-end sm:items-center sm:justify-center">
              <div className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />
              
              <div className="relative w-full max-w-md bg-[#111] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl h-[80vh] sm:h-[600px] flex flex-col animate-slide-in-up">
                {/* Header Cart */}
                <div className="p-5 border-b border-white/5 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <FaShoppingCart style={{ color: primaryColor }} /> 
                    Tu Carrito
                  </h2>
                  <button onClick={() => setIsCartOpen(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white">
                    <FaTimes />
                  </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-3 bg-white/5 p-3 rounded-xl border border-white/5 items-center">
                      <div className="w-14 h-14 bg-slate-800 rounded-lg overflow-hidden shrink-0">
                        {item.image && <img src={resolveMediaUrl(item.image)} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white text-sm truncate">{item.name}</h4>
                          <span className="font-medium text-gray-400 text-xs">{money(item.price)}</span>
                      </div>
                      
                      {/* Controls */}
                      <div className="flex items-center gap-3 bg-black/40 rounded-lg p-1">
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded-md flex items-center justify-center text-white hover:bg-white/10"><FaMinus size={8} /></button>
                          <span className="font-bold text-white text-xs w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded-md flex items-center justify-center text-white hover:bg-white/10"><FaPlus size={8} /></button>
                        </div>
                    </div>
                  ))}
                </div>

                {/* Footer Cart */}
                <div className="p-6 bg-[#0a0a0a] border-t border-white/5">
                  <div className="flex justify-between mb-4 text-lg font-bold text-white">
                    <span className="text-gray-400 text-sm font-normal">Subtotal</span>
                    <span>{money(cartTotal)}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    className="w-full py-4 rounded-xl font-bold text-black text-base text-center hover:brightness-110 transition-all shadow-lg"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- CHECKOUT MODAL --- */}
          <CustomerModal 
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            onConfirm={handleConfirmOrder}
            total={cartTotal}
            isSubmitting={isSubmitting}
            primaryColor={primaryColor}
          />

        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slideInUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-in-up { animation: slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fadeUp 0.5s ease-out; }
      `}</style>
    </>
  );
};

export default ProductShowcaseTemplate;