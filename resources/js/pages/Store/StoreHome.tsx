/**
 * Página Principal de Tienda - Estilo Shopify/Dolce Capriccio
 */

import React, { useState, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { FiChevronLeft, FiChevronRight, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { StoreProvider, useStore } from './context/StoreContext';
import { StoreHeader } from './components/StoreHeader';
import { StoreFooter } from './components/StoreFooter';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import type { StorePageProps, Product, Category, Banner } from './types';

// ============================================
// HERO SLIDER COMPONENT
// ============================================
interface HeroSliderProps {
  banners: Banner[];
}

function HeroSlider({ banners }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { config } = useStore();
  const primaryColor = config.colors?.primary || '#f97316';

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (banners.length === 0) {
    // Default Hero when no banners
    return (
      <section className="relative h-[500px] md:h-[600px] bg-gradient-to-r from-orange-50 to-pink-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Text Content */}
            <div className="text-center md:text-left">
              <span
                className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4"
                style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
              >
                Bienvenido a {config.name}
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                El momento perfecto para un{' '}
                <span style={{ color: primaryColor }}>helado artesanal</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Cremosos, refrescantes y llenos de sabor
              </p>
              <Link
                href={`/${config.slug}/productos`}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold
                         text-white transition-all hover:opacity-90 hover:scale-105"
                style={{ backgroundColor: primaryColor }}
              >
                VER PRODUCTOS
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Decorative Element */}
            <div className="hidden md:flex justify-center">
              <div
                className="w-96 h-96 rounded-full opacity-20"
                style={{ backgroundColor: primaryColor }}
              />
            </div>
          </div>
        </div>

        {/* Decorative circles */}
        <div
          className="absolute top-10 right-10 w-32 h-32 rounded-full opacity-10"
          style={{ backgroundColor: primaryColor }}
        />
        <div
          className="absolute bottom-10 left-10 w-24 h-24 rounded-full opacity-10"
          style={{ backgroundColor: primaryColor }}
        />
      </section>
    );
  }

  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden">
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className="flex-shrink-0 w-full h-full relative"
          >
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
            <div className={`absolute inset-0 flex items-center px-4 md:px-16
                          ${banner.position === 'center' ? 'justify-center text-center' :
                            banner.position === 'right' ? 'justify-end text-right' : 'justify-start'}`}>
              <div className="max-w-xl">
                {banner.subtitle && (
                  <span className="text-white/80 text-sm md:text-base uppercase tracking-widest mb-2 block">
                    {banner.subtitle}
                  </span>
                )}
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                  {banner.title}
                </h2>
                {banner.button_text && banner.link && (
                  <Link
                    href={banner.link}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full
                             bg-white font-semibold transition-all hover:scale-105"
                    style={{ color: primaryColor }}
                  >
                    {banner.button_text}
                    <FiArrowRight className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full
                     bg-white/80 hover:bg-white flex items-center justify-center
                     shadow-lg transition-all"
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full
                     bg-white/80 hover:bg-white flex items-center justify-center
                     shadow-lg transition-all"
          >
            <FiChevronRight className="w-6 h-6" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all
                          ${index === currentSlide ? 'w-8' : 'bg-white/50'}`}
                style={index === currentSlide ? { backgroundColor: primaryColor } : undefined}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

// ============================================
// CATEGORIES SECTION
// ============================================
interface CategoriesSectionProps {
  categories: Category[];
}

function CategoriesSection({ categories }: CategoriesSectionProps) {
  const { config } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const primaryColor = config.colors?.primary || '#f97316';

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (categories.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ¿Que estas buscando hoy?
          </h2>
          <p className="text-gray-600">
            Explora nuestras categorias mas populares
          </p>
        </div>

        <div className="relative group">
          {/* Scroll Buttons */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full
                     bg-white shadow-lg flex items-center justify-center
                     opacity-0 group-hover:opacity-100 transition-opacity
                     hover:bg-gray-50 -translate-x-5"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full
                     bg-white shadow-lg flex items-center justify-center
                     opacity-0 group-hover:opacity-100 transition-opacity
                     hover:bg-gray-50 translate-x-5"
          >
            <FiChevronRight className="w-5 h-5" />
          </button>

          {/* Categories Grid */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
          >
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/${config.slug}/categoria/${category.slug}`}
                className="flex-shrink-0 w-48 group/card"
              >
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 mb-3
                              shadow-md group-hover/card:shadow-xl transition-shadow">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      {category.icon || '📦'}
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-800 text-center uppercase text-sm tracking-wide
                             group-hover/card:text-orange-500 transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// FEATURED PRODUCTS SECTION
// ============================================
interface ProductsSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink?: string;
  tabs?: string[];
}

function ProductsSection({ title, subtitle, products, viewAllLink, tabs }: ProductsSectionProps) {
  const { config } = useStore();
  const [activeTab, setActiveTab] = useState(tabs?.[0] || 'all');
  const primaryColor = config.colors?.primary || '#f97316';

  const filteredProducts = tabs
    ? products.filter(p => activeTab === 'all' || p.category === activeTab)
    : products;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-gray-600">{subtitle}</p>
            )}
          </div>

          {/* Tabs */}
          {tabs && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                            ${activeTab === tab
                              ? 'text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                  style={activeTab === tab ? { backgroundColor: primaryColor } : undefined}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="flex items-center gap-2 font-semibold transition-colors whitespace-nowrap"
              style={{ color: primaryColor }}
            >
              Ver todos
              <FiArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {filteredProducts.slice(0, 10).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Button (Mobile) */}
        {viewAllLink && (
          <div className="mt-8 text-center md:hidden">
            <Link
              href={viewAllLink}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full
                       font-semibold text-white transition-colors"
              style={{ backgroundColor: primaryColor }}
            >
              Ver todos los productos
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================
// PROMO BANNER SECTION
// ============================================
function PromoBanner() {
  const { config, getWhatsAppLink } = useStore();
  const primaryColor = config.colors?.primary || '#f97316';

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div
          className="relative rounded-3xl overflow-hidden p-8 md:p-16"
          style={{ background: `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}30 100%)` }}
        >
          <div className="relative z-10 max-w-xl">
            <span
              className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4 bg-white"
              style={{ color: primaryColor }}
            >
              Oferta Especial
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¡Hasta 30% de descuento en productos seleccionados!
            </h2>
            <p className="text-gray-600 mb-6">
              Aprovecha nuestras ofertas exclusivas. Solo por tiempo limitado.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href={`/${config.slug}/ofertas`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full
                         font-semibold text-white transition-all hover:scale-105"
                style={{ backgroundColor: primaryColor }}
              >
                Ver Ofertas
                <FiArrowRight className="w-5 h-5" />
              </Link>
              <a
                href={getWhatsAppLink('Hola! Me interesan las ofertas especiales')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full
                         font-semibold bg-green-500 text-white transition-all hover:bg-green-600"
              >
                <FaWhatsapp className="w-5 h-5" />
                Consultar
              </a>
            </div>
          </div>

          {/* Decorative */}
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 blur-3xl"
            style={{ backgroundColor: primaryColor }}
          />
        </div>
      </div>
    </section>
  );
}

// ============================================
// FEATURES SECTION
// ============================================
function FeaturesSection() {
  const features = [
    { icon: '🚚', title: 'Envio Rapido', description: 'Entrega en 24-48 horas' },
    { icon: '💳', title: 'Pago Seguro', description: 'Multiples metodos de pago' },
    { icon: '🔄', title: 'Devoluciones', description: 'Garantia de satisfaccion' },
    { icon: '🎁', title: 'Envio Gratis', description: 'En compras mayores a S/100' },
  ];

  return (
    <section className="py-12 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="text-3xl">{feature.icon}</div>
              <div>
                <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// MAIN STORE HOME COMPONENT
// ============================================
function StoreHomeContent() {
  const pageProps = usePage<{ data: StorePageProps }>().props;
  const { data } = pageProps;

  const {
    config,
    categories,
    products,
    featured_products = [],
    new_products = [],
    banners = [],
  } = data;

  // Group products by category for tabs
  const productCategories = ['Todos', ...new Set(products.map(p => p.category))];

  return (
    <>
      <Head title={config.meta_title || config.name}>
        <meta name="description" content={config.meta_description || config.description} />
        <meta name="keywords" content={config.meta_keywords} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <StoreHeader />

        <main>
          {/* Hero Slider */}
          <HeroSlider banners={banners} />

          {/* Categories */}
          <CategoriesSection categories={categories} />

          {/* Featured Products with Tabs */}
          <ProductsSection
            title="Recomendados para ti"
            products={featured_products.length > 0 ? featured_products : products}
            tabs={productCategories}
            viewAllLink={`/${config.slug}/productos`}
          />

          {/* Promo Banner */}
          <PromoBanner />

          {/* New Products */}
          {new_products.length > 0 && (
            <ProductsSection
              title="Novedades"
              subtitle="Los ultimos productos agregados a nuestra tienda"
              products={new_products}
              viewAllLink={`/${config.slug}/productos?sort=newest`}
            />
          )}

          {/* Features */}
          <FeaturesSection />
        </main>

        <StoreFooter />
        <CartDrawer />

        {/* WhatsApp FAB */}
        <a
          href={`https://wa.me/${config.social_links?.whatsapp || config.phone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full
                   bg-green-500 text-white shadow-lg shadow-green-500/30
                   flex items-center justify-center
                   hover:scale-110 transition-transform"
        >
          <FaWhatsapp className="w-7 h-7" />
        </a>
      </div>
    </>
  );
}

// Wrapper with Provider
export default function StoreHome() {
  const pageProps = usePage<{ data: StorePageProps }>().props;
  const { data } = pageProps;

  return (
    <StoreProvider config={data.config} categories={data.categories}>
      <StoreHomeContent />
    </StoreProvider>
  );
}
