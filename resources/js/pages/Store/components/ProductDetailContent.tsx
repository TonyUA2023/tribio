/**
 * Contenido de Detalle de Producto - Compartido entre todos los templates
 */

import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import {
  ChevronRight,
  ShoppingBag,
  Minus,
  Plus,
  Truck,
  RefreshCw,
  Shield,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

// ============================================
// TYPES
// ============================================
interface ProductSpec {
  label: string;
  value: string;
}

interface ProductOption {
  name: string;
  values: string[];
  prices?: Record<string, number>;
}

export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  price: number;
  compare_price?: number;
  image?: string;
  images?: string[];
  category?: string;
  category_slug?: string;
  brand?: string;
  description?: string;
  short_description?: string;
  specifications?: ProductSpec[];
  stock?: number | null;
  sku?: string;
  options?: ProductOption[];
  has_variants?: boolean;
  condition?: string;
  origin_country?: string;
}

interface Props {
  product: ProductDetail;
  relatedProducts?: ProductDetail[];
  storeSlug: string;
  currencySymbol: string;
  primaryColor: string;
}

// ============================================
// IMAGE RESOLVER
// ============================================
const resolveImg = (url?: string): string => {
  if (!url) return '/images/placeholder-product.jpg';
  if (url.startsWith('http') || url.startsWith('/')) return url;
  const publicPath = (window as any).appConfig?.filesystemPublicPath || 'storage';
  const clean = url.replace(/^uploaded_files\//, '').replace(/^storage\//, '');
  return `/${publicPath}/${clean}`;
};

// ============================================
// COMPONENT
// ============================================
const ProductDetailContent: React.FC<Props> = ({
  product,
  relatedProducts = [],
  storeSlug,
  currencySymbol,
  primaryColor,
}) => {
  const { addToCart } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const images = (product.images && product.images.length > 0)
    ? product.images
    : product.image ? [product.image] : [];

  const discount = product.compare_price && product.compare_price > product.price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : null;

  const isOutOfStock = product.stock !== undefined && product.stock !== null && product.stock <= 0;
  const totalPrice = product.price * quantity;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || '',
      slug: product.slug,
    }, quantity);
  };

  return (
    <div className="bg-white min-h-screen">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 flex-wrap">
        <Link href={`/${storeSlug}/tienda`} className="hover:text-gray-900 transition-colors">Inicio</Link>
        <ChevronRight className="w-4 h-4 flex-shrink-0" />
        <Link href={`/${storeSlug}/productos`} className="hover:text-gray-900 transition-colors">Productos</Link>
        {product.category && (
          <>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            <span>{product.category}</span>
          </>
        )}
        <ChevronRight className="w-4 h-4 flex-shrink-0" />
        <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main grid */}
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Gallery */}
        <div className="flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[520px]">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    activeImage === i ? 'border-gray-900' : 'border-transparent'
                  }`}
                  style={activeImage === i ? { borderColor: primaryColor } : {}}
                >
                  <img src={resolveImg(img)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {/* Main image */}
          <div className="flex-1 aspect-square bg-gray-50 rounded-2xl overflow-hidden">
            <img
              src={resolveImg(images[activeImage])}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {product.brand && (
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-2">{product.brand}</p>
          )}
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">{product.name}</h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6 flex-wrap">
            <span className="text-3xl font-bold" style={{ color: primaryColor }}>
              {currencySymbol} {product.price.toFixed(2)}
            </span>
            {product.compare_price && product.compare_price > product.price && (
              <>
                <span className="text-xl text-gray-400 line-through">
                  {currencySymbol} {product.compare_price.toFixed(2)}
                </span>
                <span className="bg-red-100 text-red-600 text-sm font-semibold px-2 py-0.5 rounded">
                  -{discount}%
                </span>
              </>
            )}
          </div>

          {product.short_description && (
            <p className="text-gray-700 text-base mb-6 leading-relaxed">{product.short_description}</p>
          )}

          {/* Options */}
          {product.options && product.options.length > 0 && (
            <div className="space-y-4 mb-6">
              {product.options.map(opt => (
                <div key={opt.name}>
                  <p className="text-sm font-semibold text-gray-800 mb-2">{opt.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {(opt.values || []).map(val => (
                      <button
                        key={val}
                        onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.name]: val }))}
                        className={`px-4 py-2 text-sm rounded-lg border-2 transition-colors ${
                          selectedOptions[opt.name] === val
                            ? 'text-white'
                            : 'border-gray-200 hover:border-gray-400 text-gray-700'
                        }`}
                        style={selectedOptions[opt.name] === val
                          ? { borderColor: primaryColor, backgroundColor: primaryColor }
                          : {}
                        }
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-semibold text-gray-800">Cantidad:</span>
            <div className="flex items-center border border-gray-200 rounded-lg">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {isOutOfStock && (
              <span className="text-sm font-medium text-red-500">Agotado</span>
            )}
            {!isOutOfStock && product.stock !== undefined && product.stock !== null && (
              <span className="text-sm text-gray-500">{product.stock} disponibles</span>
            )}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between py-3 border-t border-b mb-6">
            <span className="font-semibold text-gray-800">Total:</span>
            <span className="text-2xl font-bold" style={{ color: primaryColor }}>
              {currencySymbol} {totalPrice.toFixed(2)}
            </span>
          </div>

          {/* CTA buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex items-center justify-center gap-2 py-4 border-2 rounded-xl font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:text-white"
              style={{ borderColor: primaryColor, color: primaryColor }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = primaryColor;
                (e.currentTarget as HTMLButtonElement).style.color = '#fff';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.color = primaryColor;
              }}
            >
              <ShoppingBag className="w-5 h-5" />
              Agregar al carrito
            </button>
            <button
              onClick={() => { handleAddToCart(); router.visit(`/${storeSlug}/checkout`); }}
              disabled={isOutOfStock}
              className="flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: primaryColor }}
            >
              Comprar ahora
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: <Truck className="w-5 h-5" />, label: 'Envío rápido' },
              { icon: <RefreshCw className="w-5 h-5" />, label: 'Devoluciones' },
              { icon: <Shield className="w-5 h-5" />, label: 'Pago seguro' },
            ].map(f => (
              <div key={f.label} className="text-center p-3 bg-gray-50 rounded-xl">
                <div className="flex justify-center text-gray-500 mb-1">{f.icon}</div>
                <span className="text-xs text-gray-600">{f.label}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          {(product.description || product.short_description) && (
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Descripción</h3>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {product.description || product.short_description}
              </div>
            </div>
          )}

          {/* Specifications */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="border-t pt-6 mt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Especificaciones</h3>
              <dl className="space-y-2">
                {product.specifications.map((spec, i) => (
                  <div key={i} className="flex gap-4 text-sm">
                    <dt className="w-32 font-medium text-gray-700 flex-shrink-0">{spec.label}</dt>
                    <dd className="text-gray-600">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* SKU */}
          {product.sku && (
            <p className="text-xs text-gray-400 mt-4">SKU: {product.sku}</p>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t pt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Productos relacionados</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {relatedProducts.slice(0, 5).map(rp => (
              <Link
                key={rp.id}
                href={`/${storeSlug}/producto/${rp.slug}`}
                className="group"
              >
                <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3">
                  <img
                    src={resolveImg(rp.image)}
                    alt={rp.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{rp.name}</p>
                <p className="text-sm font-bold" style={{ color: primaryColor }}>
                  {currencySymbol} {rp.price.toFixed(2)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
    </div>
  );
};

export default ProductDetailContent;
