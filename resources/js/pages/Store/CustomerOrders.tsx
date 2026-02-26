/**
 * Customer Orders - Shows user's orders for a specific store
 * Rendered within the store's visual context
 */

import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Package, ChevronLeft, Clock, Check, Truck, X as XIcon } from 'lucide-react';

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  subtotal: number;
  product: {
    id: number;
    name: string;
    image: string | null;
    price: number;
  } | null;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  total: number;
  subtotal: number;
  delivery_fee: number;
  delivery_address: string;
  customer_name: string;
  notes: string | null;
  created_at: string;
  items: OrderItem[];
  account: {
    id: number;
    name: string;
    slug: string;
  };
}

interface StoreConfig {
  name: string;
  slug: string;
  logo: string | null;
}

interface Props {
  data: {
    config: StoreConfig;
    account_slug: string;
    orders: Order[];
  };
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  preparing: { label: 'Preparando', color: 'bg-blue-100 text-blue-800', icon: Package },
  ready: { label: 'Listo', color: 'bg-green-100 text-green-800', icon: Check },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800', icon: Truck },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XIcon },
};

function formatPrice(price: number) {
  return `S/ ${Number(price).toFixed(2)}`;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CustomerOrders({ data }: Props) {
  const { config, orders } = data;

  return (
    <>
      <Head title={`Mis Pedidos - ${config.name}`} />

      <div className="min-h-screen bg-gray-50">
        {/* Simple Header */}
        <header className="bg-white border-b sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link
              href={`/${config.slug}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Volver a la tienda</span>
            </Link>
            <Link href={`/${config.slug}`} className="flex-shrink-0">
              {config.logo ? (
                <img src={config.logo} alt={config.name} className="h-7 w-auto" />
              ) : (
                <span className="text-lg font-bold">{config.name}</span>
              )}
            </Link>
            <div className="w-[120px]" />
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Mis Pedidos</h1>
            <p className="text-sm text-gray-500 mt-1">
              {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'} en {config.name}
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                No tienes pedidos aun
              </h2>
              <p className="text-gray-500 mb-6">
                Cuando realices una compra, podras ver tus pedidos aqui.
              </p>
              <Link
                href={`/${config.slug}/productos`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
              >
                Ver productos
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = statusConfig[order.status] || statusConfig.pending;
                const StatusIcon = status.icon;

                return (
                  <div key={order.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                    {/* Order header */}
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          Pedido #{order.order_number}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {status.label}
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(order.total)}
                        </span>
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="px-5 py-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 py-3">
                          <div className="w-14 h-14 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                            {item.product?.image ? (
                              <img
                                src={(() => { const img = item.product.image; if (img.startsWith('http') || img.startsWith('/')) return img; const p = (window as any).appConfig?.filesystemPublicPath || 'storage'; return `/${p}/${img.replace(/^uploaded_files\//, '').replace(/^storage\//, '')}`; })()}
                                alt={item.product_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Package className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.product_name || item.product?.name || 'Producto'}
                            </p>
                            <p className="text-xs text-gray-500">
                              Cantidad: {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatPrice(item.subtotal)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Order footer */}
                    <div className="px-5 py-3 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {order.payment_method === 'card' ? 'Tarjeta' : order.payment_method === 'yape' ? 'Yape' : order.payment_method}
                        {' - '}
                        {order.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                      </span>
                      <span className="truncate max-w-[200px]">
                        {order.delivery_address}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
