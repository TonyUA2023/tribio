/**
 * Tarjeta de Producto - Estilo Shopify/Dolce Capriccio
 */

import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { FiHeart, FiShoppingCart, FiEye } from 'react-icons/fi';
import { useStore } from '../context/StoreContext';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'horizontal';
  showQuickView?: boolean;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({
  product,
  variant = 'default',
  showQuickView = true,
  onQuickView,
}: ProductCardProps) {
  const { config, formatPrice, addToCart } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const primaryColor = config.colors?.primary || '#f97316';
  const hasDiscount = product.compare_price && product.compare_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100)
    : 0;

  // Resolver URL de imagen
  const resolveImageUrl = (url?: string) => {
    if (!url) return '/images/placeholder-product.jpg';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return url;
    return `/storage/${url}`;
  };

  const productUrl = `/${config.slug}/producto/${product.slug || product.id}`;

  if (variant === 'horizontal') {
    return (
      <div className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all">
        {/* Image */}
        <Link href={productUrl} className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={resolveImageUrl(product.image)}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <Link href={productUrl}>
            <h3 className="font-medium text-gray-800 hover:text-orange-500 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
          <p className="text-sm text-gray-500 mt-1">{product.category}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-bold" style={{ color: primaryColor }}>
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.compare_price!)}
              </span>
            )}
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={() => addToCart(product)}
          disabled={!product.available}
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                   bg-gray-100 hover:bg-orange-500 hover:text-white transition-all
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiShoppingCart className="w-5 h-5" />
        </button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all">
        {/* Image */}
        <Link href={productUrl} className="block relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={resolveImageUrl(product.image)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {hasDiscount && (
            <span className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
              -{discountPercent}%
            </span>
          )}
        </Link>

        {/* Info */}
        <div className="p-3">
          <Link href={productUrl}>
            <h3 className="font-medium text-gray-800 text-sm line-clamp-2 hover:text-orange-500 transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-sm" style={{ color: primaryColor }}>
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(product.compare_price!)}
                </span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                addToCart(product);
              }}
              disabled={!product.available}
              className="w-8 h-8 rounded-full flex items-center justify-center
                       bg-gray-100 hover:bg-orange-500 hover:text-white transition-all text-sm
                       disabled:opacity-50"
            >
              +
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Link href={productUrl}>
          {/* Skeleton loader */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}

          {/* Main Image */}
          <img
            src={resolveImageUrl(product.image)}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-500
                      ${isHovered ? 'scale-110' : 'scale-100'}
                      ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Hover Image (if gallery exists) */}
          {product.images && product.images.length > 1 && isHovered && (
            <img
              src={resolveImageUrl(product.images[1])}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {hasDiscount && (
            <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              -{discountPercent}%
            </span>
          )}
          {product.new && (
            <span className="px-2.5 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
              NUEVO
            </span>
          )}
          {!product.available && (
            <span className="px-2.5 py-1 bg-gray-500 text-white text-xs font-bold rounded-full">
              AGOTADO
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center
                    transition-all duration-300 shadow-md
                    ${isFavorite
                      ? 'bg-red-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
                    }`}
        >
          <FiHeart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Actions */}
        <div
          className={`absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2
                    transition-all duration-300
                    ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          {showQuickView && onQuickView && (
            <button
              onClick={() => onQuickView(product)}
              className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center
                       text-gray-700 hover:bg-gray-100 transition-colors"
              title="Vista rapida"
            >
              <FiEye className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => addToCart(product)}
            disabled={!product.available}
            className="px-5 py-2.5 rounded-full text-white font-semibold text-sm
                     shadow-lg transition-all hover:shadow-xl hover:scale-105
                     disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: primaryColor }}
          >
            <span className="flex items-center gap-2">
              <FiShoppingCart className="w-4 h-4" />
              Agregar
            </span>
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        <Link
          href={`/${config.slug}/categoria/${product.category_slug || product.category}`}
          className="text-xs text-gray-500 hover:text-orange-500 transition-colors uppercase tracking-wide"
        >
          {product.category}
        </Link>

        {/* Name */}
        <Link href={productUrl}>
          <h3 className="font-semibold text-gray-800 mt-1 line-clamp-2 hover:text-orange-500 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.rating !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-sm ${star <= (product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </span>
              ))}
            </div>
            {product.reviews_count !== undefined && (
              <span className="text-xs text-gray-500">
                ({product.reviews_count})
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-3">
          <span className="text-xl font-bold" style={{ color: primaryColor }}>
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.compare_price!)}
            </span>
          )}
        </div>

        {/* Price Range (for products with options) */}
        {product.options && product.options.some(opt => opt.prices) && (
          <p className="text-xs text-gray-500 mt-1">
            Desde {formatPrice(product.price)}
          </p>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
