import { useEffect, useMemo, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
  FaWhatsapp,
  FaSearch,
  FaShoppingCart,
  FaTimes,
  FaPlus,
  FaMinus,
  FaLeaf,
  FaStar,
  FaClock,
  FaMapMarkerAlt,
  FaPhone,
  FaInstagram,
  FaTiktok,
  FaChevronRight,
} from 'react-icons/fa';

import { LoadingScreen } from '@/components/LoadingScreen';
import { StoryCircle } from '@/components/stories/StoryCircle';
import { PremiumCarousel, CarouselImage } from '@/components/gallery/PremiumCarousel';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewsList } from '@/components/reviews/ReviewsList';
import { ScrollReveal } from '@/components/animated/ScrollReveal';
import PostGridModal from '@/components/posts/PostGridModal';

// --- Interfaces ---
interface ProfileData {
  bio?: string;
  phone?: string;
  address?: string;
  hours?: string;
  links?: { title: string; url: string }[];
  services?: string[];
  menu?: Product[];
  primaryColor?: string;
  secondaryColor?: string;
}

interface ProfileMedia {
  id: number;
  url: string;
  file_path?: string;
  caption?: string;
  media_type?: string;
  thumbnail_url?: string;
}

interface Profile {
  id: number;
  name: string;
  title: string;
  data: ProfileData;
  gallery?: ProfileMedia[];
  logo?: ProfileMedia;
  cover?: ProfileMedia;
  loading_screen?: ProfileMedia;
}

interface SeoData {
  title?: string;
  description?: string;
  keywords?: string;
  url?: string;
  image?: string;
  type?: string;
  site_name?: string;
  structured_data?: any;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  available: boolean;
  featured?: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

interface PageProps extends Record<string, unknown> {
  profile: Profile;
  seo?: SeoData;
}

// --- Utils ---
const resolveMediaUrl = (raw?: string) => {
  if (!raw) return '';
  const s = String(raw).trim();
  if (!s) return '';
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  if (s.startsWith('/')) return s;
  const cleaned = s.replace(/^uploaded_files\//, '');
  return `/uploaded_files/${cleaned}`;
};

const money = (n: number) => `S/ ${n.toFixed(2)}`;

// --- Animated Background ---
const AmateBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-[#1a5c3a] via-[#2d7a4f] to-[#0f3b28]" />
    <div className="absolute top-0 -left-20 w-96 h-96 bg-[#9dc74a]/20 rounded-full blur-3xl animate-pulse"
         style={{ animationDuration: '4s' }} />
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#9dc74a]/10 rounded-full blur-3xl animate-pulse"
         style={{ animationDuration: '6s', animationDelay: '1s' }} />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl animate-pulse"
         style={{ animationDuration: '5s', animationDelay: '2s' }} />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(157,199,74,0.1),transparent_50%)]" />
  </div>
);

// --- Premium Social Button ---
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
      hover:border-white/10 transition-all duration-500 hover:-translate-y-1"
  >
    <div
      className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-r ${brandColor}`}
    />
    <div
      className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center
      bg-gradient-to-br from-[#2d7a4f] to-[#1a5c3a] border border-white/10 shadow-lg
      group-hover:scale-110 transition-transform duration-300"
    >
      <div className="text-[#9dc74a] group-hover:text-white transition-colors">
        {icon}
      </div>
    </div>

    <div className="relative z-10 flex flex-col flex-1">
      <span className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold group-hover:text-gray-300 transition-colors">
        {subtitle}
      </span>
      <span className="text-gray-100 font-bold text-base leading-tight group-hover:text-[#9dc74a] transition-colors">
        {title}
      </span>
    </div>

    <div className="relative z-10 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
      <FaChevronRight className="text-white/50" />
    </div>
  </a>
);

// --- Compact Product Card (2 columns) ---
const CompactProductCard = ({
  product,
  onAddToCart
}: {
  product: Product;
  onAddToCart: (product: Product) => void;
}) => {
  return (
    <div className="group relative bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden
                    transform transition-all duration-300 hover:border-[#9dc74a]/30 hover:shadow-lg hover:shadow-[#9dc74a]/10">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-white/5">
        {product.image ? (
          <img
            src={resolveMediaUrl(product.image)}
            alt={product.name}
            className="w-full h-full object-cover transform transition-all duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FaLeaf className="w-12 h-12 text-[#9dc74a]/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

        {/* Featured badge */}
        {product.featured && (
          <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <FaStar className="w-2 h-2" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-[#9dc74a] transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-white/50 line-clamp-1">
          {product.description}
        </p>

        <div className="flex items-center justify-between pt-1">
          <span className="text-lg font-bold text-[#9dc74a]">
            {money(product.price)}
          </span>

          <button
            onClick={() => onAddToCart(product)}
            disabled={!product.available}
            className={`
              px-3 py-1.5 rounded-full font-semibold text-xs
              transform transition-all duration-300
              ${product.available
                ? 'bg-gradient-to-r from-[#9dc74a] to-[#7ab83a] text-[#1a5c3a] hover:scale-105'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
            `}
          >
            {product.available ? '+' : '✕'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Featured Products Horizontal Scroll ---
const FeaturedProductsScroll = ({
  products,
  onAddToCart
}: {
  products: Product[];
  onAddToCart: (product: Product) => void;
}) => {
  const scrollContainerRef = useState<HTMLDivElement | null>(null);

  if (products.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef[0]) {
      const scrollAmount = 300;
      scrollContainerRef[0].scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative group">
      {/* Left Arrow */}
      {products.length > 1 && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full
                   bg-[#1a5c3a]/90 backdrop-blur-sm border border-[#9dc74a]/30
                   flex items-center justify-center text-[#9dc74a]
                   hover:bg-[#9dc74a] hover:text-[#1a5c3a] transition-all duration-300
                   opacity-0 group-hover:opacity-100 shadow-lg"
        >
          <FaChevronRight className="w-4 h-4 rotate-180" />
        </button>
      )}

      {/* Scroll Container */}
      <div
        ref={(el) => scrollContainerRef[1](el)}
        className="overflow-x-auto scrollbar-hide -mx-4 px-4"
      >
        <div className="flex gap-3 pb-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[280px] bg-gradient-to-br from-slate-900/90 to-black/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
            >
              {/* Product Image */}
              <div className="relative h-36 overflow-hidden">
                {product.image ? (
                  <img
                    src={resolveMediaUrl(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800">
                    <FaLeaf className="w-12 h-12 text-[#9dc74a]/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

                {/* Badge */}
                <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-orange-500
                             text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <FaStar className="w-2 h-2" />
                </div>
              </div>

              {/* Product Info */}
              <div className="p-3 space-y-2">
                <h3 className="text-sm font-bold text-white line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-xs text-white/60 line-clamp-1">
                  {product.description}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-lg font-bold text-[#9dc74a]">
                    {money(product.price)}
                  </span>

                  <button
                    onClick={() => onAddToCart(product)}
                    disabled={!product.available}
                    className={`
                      px-4 py-1.5 rounded-full font-bold text-xs
                      transform transition-all duration-300
                      ${product.available
                        ? 'bg-gradient-to-r from-[#9dc74a] to-[#7ab83a] text-[#1a5c3a] hover:scale-105'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
                    `}
                  >
                    {product.available ? 'Agregar' : 'Agotado'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Arrow */}
      {products.length > 1 && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full
                   bg-[#1a5c3a]/90 backdrop-blur-sm border border-[#9dc74a]/30
                   flex items-center justify-center text-[#9dc74a]
                   hover:bg-[#9dc74a] hover:text-[#1a5c3a] transition-all duration-300
                   opacity-0 group-hover:opacity-100 shadow-lg"
        >
          <FaChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// --- Cart Sheet ---
const CartSheet = ({
  cart,
  isOpen,
  onClose,
  onUpdateQuantity,
  onCheckout
}: {
  cart: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (productId: number, delta: number) => void;
  onCheckout: () => void;
}) => {
  const total = useMemo(() =>
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-br from-[#1a5c3a] to-[#2d7a4f]
                    shadow-2xl z-50 animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaShoppingCart className="w-6 h-6 text-[#9dc74a]" />
              <h2 className="text-2xl font-bold text-white">Tu Pedido</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <FaTimes className="w-6 h-6 text-white" />
            </button>
          </div>
          <p className="text-white/60 text-sm mt-1">{cart.length} productos</p>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FaShoppingCart className="w-20 h-20 text-white/20 mb-4" />
              <p className="text-white/60">Tu carrito está vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                    {item.image ? (
                      <img src={resolveMediaUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaLeaf className="w-8 h-8 text-[#9dc74a]/30" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{item.name}</h3>
                    <p className="text-[#9dc74a] font-bold">{money(item.price)}</p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20
                                 flex items-center justify-center transition-colors"
                      >
                        <FaMinus className="w-3 h-3 text-white" />
                      </button>
                      <span className="text-white font-semibold min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20
                                 flex items-center justify-center transition-colors"
                      >
                        <FaPlus className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right">
                    <p className="text-white font-bold">{money(item.price * item.quantity)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-white/10 space-y-4">
            <div className="flex justify-between items-center text-lg">
              <span className="text-white/80">Total:</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#9dc74a] to-white
                           bg-clip-text text-transparent">
                {money(total)}
              </span>
            </div>

            <button
              onClick={onCheckout}
              className="w-full bg-gradient-to-r from-[#9dc74a] to-[#7ab83a] text-[#1a5c3a]
                       py-4 rounded-full font-bold text-lg
                       transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#9dc74a]/30
                       flex items-center justify-center gap-3"
            >
              <FaWhatsapp className="w-6 h-6" />
              Hacer Pedido por WhatsApp
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// --- Main Component ---
const AmateCard = () => {
  const { profile, seo } = usePage<PageProps>().props;

  const primaryGreen = '#9dc74a';

  // Loading Screen State
  const [isLoading, setIsLoading] = useState(true);
  const loadingScreenUrl = profile.loading_screen?.url
    ? resolveMediaUrl(profile.loading_screen.url)
    : null;

  // Parallax
  const [y, setY] = useState(0);
  useEffect(() => {
    const onScroll = () => setY(Math.min(60, window.scrollY * 0.15));
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Links
  const whatsappLink =
    profile.data.links?.find((l) => l.title.toLowerCase().includes('whatsapp'))?.url ||
    (profile.data.phone ? `https://wa.me/${profile.data.phone.replace(/\D/g, '')}` : '#');
  const instagramLink = profile.data.links?.find((l) =>
    l.title.toLowerCase().includes('instagram')
  )?.url;
  const tiktokLink = profile.data.links?.find((l) =>
    l.title.toLowerCase().includes('tiktok')
  )?.url;

  // Gallery Images
  const galleryImages: CarouselImage[] = useMemo(() => {
    const raw = profile.gallery;

    if (!Array.isArray(raw)) return [];

    return raw
      .map((m: any) => ({
        url: resolveMediaUrl(m?.url || m?.file_path),
        caption: m?.caption,
        thumbnail: m?.thumbnail_url ? resolveMediaUrl(m.thumbnail_url) : undefined,
      }))
      .filter((img: any) => !!img.url);
  }, [profile]);

  // Mock products (replace with real data from API)
  const products: Product[] = useMemo(() => [
    {
      id: 1,
      name: 'Bowl de Açaí',
      description: 'Açaí con granola casera, plátano, fresas y miel',
      price: 65.00,
      category: 'Snacks',
      available: true,
      featured: true,
    },
    {
      id: 2,
      name: 'Smoothie Verde',
      description: 'Espinaca, manzana verde, plátano y jengibre',
      price: 45.00,
      category: 'Bebidas',
      available: true,
      featured: true,
    },
    {
      id: 3,
      name: 'Brownie Vegano',
      description: 'Brownie de chocolate sin lácteos ni huevos',
      price: 35.00,
      category: 'Postres',
      available: true,
      featured: true,
    },
    {
      id: 4,
      name: 'Tostada de Aguacate',
      description: 'Pan integral tostado con aguacate, tomate cherry y semillas',
      price: 55.00,
      category: 'Snacks',
      available: true,
      featured: false,
    },
    {
      id: 5,
      name: 'Latte con Leche de Almendra',
      description: 'Espresso con leche de almendra artesanal',
      price: 38.00,
      category: 'Bebidas',
      available: true,
      featured: false,
    },
    {
      id: 6,
      name: 'Cheesecake de Frutos Rojos',
      description: 'Base de galleta integral con queso crema y mermelada casera',
      price: 50.00,
      category: 'Postres',
      available: true,
      featured: false,
    },
    {
      id: 7,
      name: 'Jugo de Naranja Natural',
      description: 'Jugo recién exprimido de naranjas orgánicas',
      price: 30.00,
      category: 'Bebidas',
      available: true,
      featured: false,
    },
    {
      id: 8,
      name: 'Muffin de Arándanos',
      description: 'Muffin integral con arándanos frescos',
      price: 28.00,
      category: 'Postres',
      available: true,
      featured: false,
    },
  ], []);

  // Categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)));
    return ['Todos', ...cats];
  }, [products]);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch && !p.featured; // Excluir destacados
    });
  }, [products, selectedCategory, searchTerm]);

  const featuredProducts = useMemo(() =>
    products.filter(p => p.featured),
    [products]
  );

  // Cart Functions
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    // NO abrir el carrito automáticamente
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => {
      const updated = prev.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      );
      return updated.filter(item => item.quantity > 0);
    });
  };

  const checkout = () => {
    const message = `¡Hola! Quiero hacer un pedido de Ámate:\n\n` +
      cart.map(item => `• ${item.name} x${item.quantity} — ${money(item.price * item.quantity)}`).join('\n') +
      `\n\n*Total: ${money(cart.reduce((sum, item) => sum + item.price * item.quantity, 0))}*\n\n` +
      `¿Me confirmas disponibilidad y tiempo de entrega?`;

    window.open(`${whatsappLink}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // SEO
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const coverImage = resolveMediaUrl(profile.cover?.url);
  const logoImage = resolveMediaUrl(profile.logo?.url);
  const ogImage = coverImage || logoImage;

  return (
    <>
      {/* Loading Screen */}
      {isLoading && (
        <LoadingScreen
          logoUrl={loadingScreenUrl}
          onLoadingComplete={() => setIsLoading(false)}
          minDuration={1500}
        />
      )}

      <Head title={`${seo?.title || profile.name}`}>
        <meta name="description" content={seo?.description || profile.title} />
        <meta name="keywords" content={seo?.keywords || 'TRIBIO, snacks saludables, cafetería'} />
        <link rel="canonical" href={seo?.url || pageUrl} />
        <meta property="og:type" content={seo?.type || 'website'} />
        <meta property="og:title" content={seo?.title || profile.name} />
        <meta property="og:description" content={seo?.description || profile.title} />
        {seo?.image && <meta property="og:image" content={seo.image} />}
        {!seo?.image && ogImage && <meta property="og:image" content={ogImage} />}
        <meta property="og:url" content={seo?.url || pageUrl} />
        <meta property="og:site_name" content={seo?.site_name || 'TRIBIO'} />
        <meta property="og:locale" content="es_PE" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo?.title || profile.name} />
        <meta name="twitter:description" content={seo?.description || profile.title} />
        {seo?.image && <meta name="twitter:image" content={seo.image} />}
        {!seo?.image && ogImage && <meta name="twitter:image" content={ogImage} />}
        {seo?.structured_data && (
          <script type="application/ld+json">
            {JSON.stringify(seo.structured_data)}
          </script>
        )}
      </Head>

      <div
        className="relative w-full flex flex-col overflow-hidden bg-slate-950 min-h-screen font-sans text-gray-100
        md:max-w-screen-md md:h-[860px] md:rounded-[40px] md:shadow-2xl md:shadow-black md:mx-auto md:border md:border-white/5"
      >
        <AmateBackground />

        {/* --- HERO --- */}
        <header className="relative h-[380px] shrink-0">
          <div className="absolute inset-0 overflow-hidden">
            {coverImage ? (
              <img
                src={coverImage}
                alt="Cover"
                style={{ transform: `translateY(${y * 0.5}px) scale(1.1)` }}
                className="w-full h-full object-cover transition-transform duration-75 will-change-transform"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1a5c3a] to-[#2d7a4f]" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 px-6 z-10 text-center">
            <div className="mb-4 animate-fade-up">
              <StoryCircle
                profileId={profile.id}
                logoUrl={logoImage}
                name={profile.name}
                size="md"
                onOpenStories={() => {
                  console.log('Opening stories for profile:', profile.id);
                }}
              />
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 animate-fade-up delay-100 tracking-tight drop-shadow-2xl relative z-10">
              {profile.name || 'ÁMATE'}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9dc74a] via-[#b8e356] to-[#9dc74a] relative z-10">
                SNACKS
              </span>
            </h1>

            <div className="flex items-center gap-3 animate-fade-up delay-200 mb-3">
              <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-[#9dc74a]/50" />
              <p className="text-[#9dc74a]/90 text-xs uppercase tracking-[0.3em] font-medium">
                {profile.title || 'Snacks Saludables'}
              </p>
              <div className="h-[1px] w-6 bg-gradient-to-l from-transparent to-[#9dc74a]/50" />
            </div>

            <div className="flex items-center gap-2 animate-fade-up delay-300">
              <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                <FaStar className="text-[#9dc74a] text-xs" />
                <span className="text-xs font-bold text-white">5.0</span>
              </div>
              <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                <FaLeaf className="text-[#9dc74a] text-xs" />
                <span className="text-xs font-bold text-white">100% Natural</span>
              </div>
            </div>
          </div>
        </header>

        {/* --- MAIN --- */}
        <main className="relative z-20 flex-1 px-4 sm:px-6 pb-24 space-y-6 -mt-4 overflow-y-auto">
          {/* Bio */}
          {profile.data.bio && (
            <ScrollReveal animation="scale">
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-black/90 backdrop-blur-xl border border-white/5 shadow-xl">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#9dc74a] text-[#1a5c3a] text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                  Snacks Saludables
                </div>
                <p className="text-gray-300 leading-relaxed font-light text-center text-sm">
                  {profile.data.bio}
                </p>
              </div>
            </ScrollReveal>
          )}

          {/* Social Links */}
          {(instagramLink || tiktokLink) && (
            <ScrollReveal animation="slide-left">
              <section>
                <h2 className="text-white font-bold text-lg mb-3 flex items-center gap-2 px-1">
                  <span className="w-1 h-5 bg-[#9dc74a] rounded-full" />
                  <span>Síguenos</span>
                </h2>
                <div className="space-y-2">
                  {instagramLink && (
                    <PremiumSocialButton
                      href={instagramLink}
                      icon={<FaInstagram size={20} />}
                      title={profile.data.links?.find(l => l.title.toLowerCase().includes('instagram'))?.title || '@amate'}
                      subtitle="Instagram"
                      brandColor="from-purple-600 via-pink-600 to-orange-500"
                    />
                  )}
                  {tiktokLink && (
                    <PremiumSocialButton
                      href={tiktokLink}
                      icon={<FaTiktok size={18} />}
                      title={profile.data.links?.find(l => l.title.toLowerCase().includes('tiktok'))?.title || '@amate'}
                      subtitle="TikTok"
                      brandColor="from-cyan-500 via-black to-red-500"
                    />
                  )}
                </div>
              </section>
            </ScrollReveal>
          )}

          {/* Gallery */}
          {galleryImages.length > 0 && (
            <ScrollReveal animation="fade">
              <section>
                <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2 px-1">
                  <span className="text-[#9dc74a]">✨</span>
                  <span>
                    Galería
                  </span>
                </h2>
                <PremiumCarousel
                  images={galleryImages}
                  accentColor={primaryGreen}
                  autoPlay={true}
                  interval={4000}
                />
              </section>
            </ScrollReveal>
          )}

          {/* Posts Feed (Grid 3x3 + Modal Estilo TikTok) */}
          <ScrollReveal animation="fade">
            <section>
              <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2 px-1">
                <span className="text-[#9dc74a]">🎬</span>
                <span>Publicaciones</span>
              </h2>
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <PostGridModal
                  accountSlug="amate"
                  accentColor="#9dc74a"
                  ctaButton={{
                    label: 'Ver Menú',
                    onClick: () => {
                      const menuSection = document.querySelector('#menu-section');
                      if (menuSection) {
                        menuSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    },
                    icon: <FaShoppingCart className="w-4 h-4" />,
                  }}
                />
              </div>
            </section>
          </ScrollReveal>

          {/* Featured Products Carousel */}
          {featuredProducts.length > 0 && (
            <ScrollReveal animation="slide-right">
              <section>
                <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2 px-1">
                  <FaStar className="text-[#9dc74a]" />
                  <span>Destacados</span>
                </h2>
                <FeaturedProductsScroll products={featuredProducts} onAddToCart={addToCart} />
              </section>
            </ScrollReveal>
          )}

          {/* Search */}
          <ScrollReveal animation="scale">
            <section>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20
                           rounded-full text-white text-sm placeholder-white/40
                           focus:outline-none focus:ring-2 focus:ring-[#9dc74a] focus:border-transparent
                           transition-all duration-300"
                />
              </div>
            </section>
          </ScrollReveal>

          {/* Category Filters */}
          <ScrollReveal animation="blur">
            <section>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`
                      px-4 py-2 rounded-full font-semibold capitalize text-xs
                      transform transition-all duration-300
                      ${selectedCategory === cat
                        ? 'bg-gradient-to-r from-[#9dc74a] to-[#7ab83a] text-[#1a5c3a] shadow-md'
                        : 'bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/15'}
                    `}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </section>
          </ScrollReveal>

          {/* Products Grid (2 columns) */}
          <ScrollReveal animation="fade">
            <section id="menu-section">
              <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2 px-1">
                <FaShoppingCart className="text-[#9dc74a]" />
                <span>Nuestro Menú</span>
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {filteredProducts.map(product => (
                  <CompactProductCard key={product.id} product={product} onAddToCart={addToCart} />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <FaSearch className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/60 text-sm">No se encontraron productos</p>
                </div>
              )}
            </section>
          </ScrollReveal>

          {/* Reviews */}
          <ScrollReveal animation="slide-right">
            <section>
              <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2 px-1">
                <FaStar className="text-[#9dc74a]" />
                <span>Opiniones</span>
              </h2>
              <ReviewsList profileId={profile.id} accentColor={primaryGreen} />
            </section>
          </ScrollReveal>

          {/* Review Form */}
          <ScrollReveal animation="scale">
            <section>
              <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2 px-1">
                <span className="text-xl">💬</span>
                <span>Deja tu Opinión</span>
              </h2>
              <div className="rounded-2xl bg-slate-900/50 p-4 border border-white/5">
                <ReviewForm profileId={profile.id} accentColor={primaryGreen} />
              </div>
            </section>
          </ScrollReveal>

          {/* Hours & Contact */}
          <ScrollReveal animation="blur">
            <section className="space-y-3">
              {profile.data.hours && (
                <div className="rounded-2xl bg-slate-900/50 p-4 border border-white/5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#9dc74a]/10 flex items-center justify-center shrink-0 text-[#9dc74a] border border-[#9dc74a]/20">
                      <FaClock size={16} />
                    </div>
                    <div>
                      <h3 className="text-white text-xs font-bold uppercase tracking-wide">
                        Horario
                      </h3>
                      <p className="text-gray-400 text-sm mt-0.5 leading-snug">
                        {profile.data.hours}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {profile.data.address && (
                <div className="rounded-2xl bg-slate-900/50 p-4 border border-white/5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#9dc74a]/10 flex items-center justify-center shrink-0 text-[#9dc74a] border border-[#9dc74a]/20">
                      <FaMapMarkerAlt size={16} />
                    </div>
                    <div>
                      <h3 className="text-white text-xs font-bold uppercase tracking-wide">
                        Ubicación
                      </h3>
                      <p className="text-gray-400 text-sm mt-0.5 leading-snug">
                        {profile.data.address}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {profile.data.phone && (
                <div className="rounded-2xl bg-slate-900/50 p-4 border border-white/5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#9dc74a]/10 flex items-center justify-center shrink-0 text-[#9dc74a] border border-[#9dc74a]/20">
                      <FaPhone size={16} />
                    </div>
                    <div>
                      <h3 className="text-white text-xs font-bold uppercase tracking-wide">
                        Contacto
                      </h3>
                      <p className="text-gray-400 text-sm mt-0.5 leading-snug">
                        {profile.data.phone}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </ScrollReveal>
        </main>

        {/* Gradient Footer */}
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pointer-events-none z-30 md:absolute md:rounded-b-[40px]" />

        {/* WhatsApp FAB */}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-4 z-40 w-14 h-14 rounded-full flex items-center justify-center
          bg-[#25D366] text-white shadow-lg shadow-green-900/50 border-2 border-green-400/30
          hover:scale-110 active:scale-95 transition-all duration-300
          md:absolute md:bottom-6 md:right-6"
        >
          <FaWhatsapp size={28} />
        </a>

        {/* Cart FAB - Solo mostrar cuando hay productos */}
        {cart.length > 0 && (
          <button
            onClick={() => setCartOpen(true)}
            className="fixed bottom-6 left-4 z-40 w-14 h-14 rounded-full flex items-center justify-center
            bg-gradient-to-r from-[#9dc74a] to-[#7ab83a] text-[#1a5c3a] shadow-lg shadow-[#9dc74a]/30
            hover:scale-110 active:scale-95 transition-all duration-300
            md:absolute md:bottom-6 md:left-6"
          >
            <FaShoppingCart size={24} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold
                         w-5 h-5 rounded-full flex items-center justify-center
                         ring-2 ring-slate-950">
              {cart.length}
            </span>
          </button>
        )}

        {/* Cart Sheet */}
        <CartSheet
          cart={cart}
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          onUpdateQuantity={updateQuantity}
          onCheckout={checkout}
        />
      </div>

      <style>{`
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fade-up {
          animation: fade-up 0.6s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </>
  );
};

export default function Amate() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-neutral-950 md:p-10">
      <AmateCard />
    </div>
  );
}
