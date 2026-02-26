/**
 * Página de Detalle de Producto - Estilo Shopify/Dolce Capriccio
 */

import React, { useState, useMemo } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
  FiMinus,
  FiPlus,
  FiShoppingCart,
  FiHeart,
  FiShare2,
  FiChevronRight,
  FiChevronLeft,
  FiCheck,
  FiTruck,
  FiRefreshCw,
  FiShield,
  FiStar,
} from 'react-icons/fi';
import { FaWhatsapp, FaStar, FaRegStar } from 'react-icons/fa';
import { StoreProvider, useStore } from './context/StoreContext';
import { StoreHeader } from './components/StoreHeader';
import { StoreFooter } from './components/StoreFooter';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import type { ProductPageProps, Product, Review } from './types';

// ============================================
// IMAGE GALLERY COMPONENT
// ============================================
interface ImageGalleryProps {
  images: string[];
  productName: string;
}

function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const resolveImageUrl = (url?: string) => {
    if (!url) return '/images/placeholder-product.jpg';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return url;
    return `/storage/${url}`;
  };

  const displayImages = images.length > 0 ? images : ['/images/placeholder-product.jpg'];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails */}
      <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[500px]">
        {displayImages.map((img, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all
                      ${activeIndex === index ? 'border-orange-500' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <img
              src={resolveImageUrl(img)}
              alt={`${productName} - ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="flex-1 relative">
        <div
          className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 cursor-zoom-in"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
        >
          <img
            src={resolveImageUrl(displayImages[activeIndex])}
            alt={productName}
            className="w-full h-full object-cover transition-transform duration-300"
            style={isZoomed ? { transform: 'scale(1.5)', transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : undefined}
          />
        </div>

        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={() => setActiveIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg
                       flex items-center justify-center hover:bg-white transition-colors"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveIndex((prev) => (prev + 1) % displayImages.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg
                       flex items-center justify-center hover:bg-white transition-colors"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================
// REVIEWS SECTION
// ============================================
interface ReviewsSectionProps {
  reviews: Review[];
  productId: number;
}

function ReviewsSection({ reviews, productId }: ReviewsSectionProps) {
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Opiniones de clientes ({reviews.length})
        </h2>
        <button className="px-6 py-2 border border-gray-300 rounded-full font-medium hover:bg-gray-50 transition-colors">
          Escribir reseña
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <FiStar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Sin reseñas todavia
          </h3>
          <p className="text-gray-500 mb-4">
            Se el primero en dejar una opinion sobre este producto
          </p>
        </div>
      ) : (
        <>
          {/* Rating Summary */}
          <div className="flex items-center gap-8 p-6 bg-gray-50 rounded-2xl mb-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
              <div className="flex items-center justify-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  star <= averageRating
                    ? <FaStar key={star} className="w-5 h-5 text-yellow-400" />
                    : <FaRegStar key={star} className="w-5 h-5 text-gray-300" />
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">{reviews.length} reseñas</p>
            </div>

            {/* Rating Bars */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter(r => r.rating === rating).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-4">{rating}</span>
                    <FaStar className="w-4 h-4 text-yellow-400" />
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review List */}
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="p-6 bg-white rounded-xl border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{review.customer_name}</span>
                      {review.verified && (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <FiCheck className="w-3 h-3" />
                          Compra verificada
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          star <= review.rating
                            ? <FaStar key={star} className="w-4 h-4 text-yellow-400" />
                            : <FaRegStar key={star} className="w-4 h-4 text-gray-300" />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

// ============================================
// MAIN PRODUCT DETAIL CONTENT
// ============================================
function StoreProductDetailContent() {
  const pageProps = usePage<ProductPageProps>().props;

  const { config, categories, product, related_products = [], reviews = [] } = pageProps;
  const { formatPrice, addToCart, getWhatsAppLink } = useStore();
  const primaryColor = config.colors?.primary || '#f97316';

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});
  const [isFavorite, setIsFavorite] = useState(false);

  // Initialize default options
  useState(() => {
    if (product.options) {
      const defaults: { [key: string]: string } = {};
      product.options.forEach(opt => {
        if (opt.values.length > 0) {
          defaults[opt.name] = opt.values[0];
        }
      });
      setSelectedOptions(defaults);
    }
  });

  // Calculate total price with options
  const totalPrice = useMemo(() => {
    let price = product.price;
    if (product.options) {
      product.options.forEach(opt => {
        const selected = selectedOptions[opt.name];
        if (selected && opt.prices?.[selected]) {
          price += opt.prices[selected];
        }
      });
    }
    return price * quantity;
  }, [product, selectedOptions, quantity]);

  // Breadcrumb
  const breadcrumb = [
    { label: 'Inicio', href: `/${config.slug}` },
    { label: 'Productos', href: `/${config.slug}/productos` },
    { label: product.category, href: `/${config.slug}/categoria/${product.category_slug || product.category}` },
    { label: product.name, href: '#' },
  ];

  // Handle add to cart
  const handleAddToCart = () => {
    addToCart(product, quantity, selectedOptions);
  };

  // Handle buy now
  const handleBuyNow = () => {
    addToCart(product, quantity, selectedOptions);
    window.location.href = `/${config.slug}/checkout`;
  };

  // WhatsApp message
  const whatsappMessage = `Hola! Me interesa el producto: ${product.name} (${formatPrice(product.price)})`;

  // Product images
  const productImages = product.images && product.images.length > 0
    ? product.images
    : product.image
      ? [product.image]
      : [];

  return (
    <>
      <Head title={`${product.name} | ${config.name}`}>
        <meta name="description" content={product.description} />
      </Head>

      <div className="min-h-screen bg-white">
        <StoreHeader />

        <main>
          {/* Breadcrumb */}
          <div className="max-w-7xl mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm text-gray-500">
              {breadcrumb.map((item, index) => (
                <React.Fragment key={item.href + index}>
                  {index > 0 && <FiChevronRight className="w-4 h-4" />}
                  {index === breadcrumb.length - 1 ? (
                    <span className="text-gray-900 font-medium truncate">{item.label}</span>
                  ) : (
                    <Link href={item.href} className="hover:text-gray-700 transition-colors">
                      {item.label}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Product Section */}
          <section className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Gallery */}
              <ImageGallery images={productImages} productName={product.name} />

              {/* Product Info */}
              <div className="lg:sticky lg:top-24 lg:self-start">
                {/* Category */}
                <Link
                  href={`/${config.slug}/categoria/${product.category_slug || product.category}`}
                  className="text-sm uppercase tracking-wider hover:underline"
                  style={{ color: primaryColor }}
                >
                  {product.category}
                </Link>

                {/* Name */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                  {product.name}
                </h1>

                {/* Rating */}
                {product.rating !== undefined && (
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        star <= (product.rating || 0)
                          ? <FaStar key={star} className="w-5 h-5 text-yellow-400" />
                          : <FaRegStar key={star} className="w-5 h-5 text-gray-300" />
                      ))}
                    </div>
                    <span className="text-gray-500">
                      ({product.reviews_count || 0} reseñas)
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-3 mt-4">
                  <span className="text-3xl font-bold" style={{ color: primaryColor }}>
                    {formatPrice(product.price)}
                  </span>
                  {product.compare_price && product.compare_price > product.price && (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        {formatPrice(product.compare_price)}
                      </span>
                      <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded">
                        -{Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 mt-4 leading-relaxed">
                  {product.description}
                </p>

                {/* Options */}
                {product.options && product.options.length > 0 && (
                  <div className="mt-6 space-y-4">
                    {product.options.map((option) => (
                      <div key={option.name}>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          {option.name}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {option.values.map((value) => (
                            <button
                              key={value}
                              onClick={() => setSelectedOptions({ ...selectedOptions, [option.name]: value })}
                              className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all
                                        ${selectedOptions[option.name] === value
                                          ? 'border-orange-500 bg-orange-50'
                                          : 'border-gray-200 hover:border-gray-300'
                                        }`}
                              style={selectedOptions[option.name] === value ? { borderColor: primaryColor, backgroundColor: `${primaryColor}10` } : undefined}
                            >
                              {value}
                              {option.prices?.[value] && (
                                <span className="ml-1 text-gray-500">
                                  (+{formatPrice(option.prices[value])})
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quantity & Add to Cart */}
                <div className="mt-6 space-y-4">
                  {/* Quantity */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-800">Cantidad:</span>
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <FiMinus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-semibold">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <FiPlus className="w-4 h-4" />
                      </button>
                    </div>
                    {product.stock !== undefined && (
                      <span className="text-sm text-gray-500">
                        {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                      </span>
                    )}
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between py-3 border-t border-b">
                    <span className="font-semibold text-gray-800">Total:</span>
                    <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                      {formatPrice(totalPrice)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={!product.available}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full
                               font-semibold border-2 transition-all
                               disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                      style={{ borderColor: primaryColor, color: primaryColor }}
                    >
                      <FiShoppingCart className="w-5 h-5" />
                      Agregar al carrito
                    </button>

                    <button
                      onClick={handleBuyNow}
                      disabled={!product.available}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full
                               font-semibold text-white transition-all
                               disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 hover:scale-[1.02]"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Comprar ahora
                    </button>
                  </div>

                  {/* Secondary Actions */}
                  <div className="flex items-center justify-center gap-6">
                    <button
                      onClick={() => setIsFavorite(!isFavorite)}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors
                                ${isFavorite ? 'text-red-500' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      <FiHeart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                      {isFavorite ? 'Guardado' : 'Guardar'}
                    </button>

                    <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                      <FiShare2 className="w-5 h-5" />
                      Compartir
                    </button>

                    <a
                      href={getWhatsAppLink(whatsappMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                    >
                      <FaWhatsapp className="w-5 h-5" />
                      Consultar
                    </a>
                  </div>
                </div>

                {/* Features */}
                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <FiTruck className="w-6 h-6 mx-auto text-gray-600 mb-2" />
                    <span className="text-xs text-gray-600">Envio rapido</span>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <FiRefreshCw className="w-6 h-6 mx-auto text-gray-600 mb-2" />
                    <span className="text-xs text-gray-600">Devoluciones</span>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <FiShield className="w-6 h-6 mx-auto text-gray-600 mb-2" />
                    <span className="text-xs text-gray-600">Pago seguro</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <ReviewsSection reviews={reviews} productId={product.id} />

            {/* Related Products */}
            {related_products.length > 0 && (
              <section className="mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">
                  Productos relacionados
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                  {related_products.slice(0, 5).map((relatedProduct) => (
                    <ProductCard key={relatedProduct.id} product={relatedProduct} />
                  ))}
                </div>
              </section>
            )}
          </section>
        </main>

        <StoreFooter />
        <CartDrawer />

        {/* WhatsApp FAB */}
        <a
          href={getWhatsAppLink(whatsappMessage)}
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
export default function StoreProductDetail() {
  const pageProps = usePage<ProductPageProps>().props;

  return (
    <StoreProvider config={pageProps.config} categories={pageProps.categories}>
      <StoreProductDetailContent />
    </StoreProvider>
  );
}
