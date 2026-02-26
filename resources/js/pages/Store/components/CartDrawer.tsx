/**
 * Carrito lateral (Drawer) - Estilo Shopify
 */

import React from 'react';
import { Link } from '@inertiajs/react';
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useStore } from '../context/StoreContext';

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    config,
    formatPrice,
  } = useStore();

  const primaryColor = config.colors?.primary || '#f97316';

  // Resolver URL de imagen
  const resolveImageUrl = (url?: string) => {
    if (!url) return '/images/placeholder-product.jpg';
    if (url.startsWith('http') || url.startsWith('/')) return url;
    const publicPath = (window as any).appConfig?.filesystemPublicPath || 'storage';
    const clean = url.replace(/^uploaded_files\//, '').replace(/^storage\//, '');
    return `/${publicPath}/${clean}`;
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 shadow-2xl
                    flex flex-col transform transition-transform duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <FiShoppingBag className="w-6 h-6" style={{ color: primaryColor }} />
            <h2 className="text-xl font-bold text-gray-800">
              Tu Carrito
            </h2>
            <span className="px-2 py-0.5 bg-gray-100 rounded-full text-sm text-gray-600">
              {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <FiShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Tu carrito esta vacio
              </h3>
              <p className="text-gray-500 mb-6">
                Agrega productos para comenzar tu pedido
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-6 py-3 rounded-full font-semibold text-white transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                Explorar Productos
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {cart.items.map((item, index) => (
                <div key={`${item.id}-${index}`} className="p-4 flex gap-4">
                  {/* Image */}
                  <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={resolveImageUrl(item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/${config.slug}/producto/${item.slug || item.id}`}
                      className="font-medium text-gray-800 hover:text-orange-500 transition-colors line-clamp-1"
                      onClick={() => setIsCartOpen(false)}
                    >
                      {item.name}
                    </Link>

                    {/* Selected Options */}
                    {item.selected_options && Object.keys(item.selected_options).length > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {Object.entries(item.selected_options)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(' | ')}
                      </p>
                    )}

                    <p className="font-semibold mt-1" style={{ color: primaryColor }}>
                      {formatPrice(item.price)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-gray-200 rounded-full">
                        <button
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-l-full transition-colors"
                        >
                          <FiMinus className="w-3 h-3" />
                        </button>
                        <span className="w-10 text-center font-medium text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-r-full transition-colors"
                        >
                          <FiPlus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(index)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="flex-shrink-0 text-right">
                    <p className="font-bold text-gray-800">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Only show if cart has items */}
        {cart.items.length > 0 && (
          <div className="border-t bg-gray-50 p-6 space-y-4">
            {/* Free Shipping Progress */}
            {config.free_shipping_threshold && cart.subtotal < config.free_shipping_threshold && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">
                    Te faltan{' '}
                    <span className="font-semibold" style={{ color: primaryColor }}>
                      {formatPrice(config.free_shipping_threshold - cart.subtotal)}
                    </span>
                    {' '}para envio gratis
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((cart.subtotal / config.free_shipping_threshold) * 100, 100)}%`,
                      backgroundColor: primaryColor,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(cart.subtotal)}</span>
              </div>

              {cart.shipping > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Envio</span>
                  <span className="font-medium">{formatPrice(cart.shipping)}</span>
                </div>
              )}

              {cart.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Descuento</span>
                  <span>-{formatPrice(cart.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span style={{ color: primaryColor }}>{formatPrice(cart.total)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <Link
                href={`/${config.slug}/checkout`}
                onClick={() => setIsCartOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full
                         font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                <span>Finalizar Compra</span>
                <FiArrowRight className="w-5 h-5" />
              </Link>

              <button
                onClick={() => setIsCartOpen(false)}
                className="w-full py-3 rounded-full font-medium text-gray-700
                         border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Seguir Comprando
              </button>
            </div>

            {/* Security badges */}
            <div className="flex items-center justify-center gap-4 pt-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span>🔒</span> Compra Segura
              </span>
              <span className="flex items-center gap-1">
                <span>🚚</span> Envio Rapido
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default CartDrawer;
