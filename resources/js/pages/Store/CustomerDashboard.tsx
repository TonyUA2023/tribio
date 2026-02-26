/**
 * Customer Dashboard - Nike Style
 * Shows orders, favorites, bookings across all Tribio stores
 */

import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
  FiChevronLeft,
  FiPackage,
  FiHeart,
  FiCalendar,
  FiSettings,
  FiLogOut,
  FiChevronRight,
  FiTruck,
  FiClock,
  FiCheck,
  FiX,
  FiShoppingBag,
  FiMapPin,
} from 'react-icons/fi';
import type { StoreConfig } from './types';

interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  total: number;
  created_at: string;
  account: {
    name: string;
    slug: string;
  };
  items: Array<{
    id: number;
    product: {
      name: string;
      image: string;
    };
    quantity: number;
    price: number;
  }>;
}

interface Booking {
  id: number;
  service_name: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  account: {
    name: string;
    slug: string;
  };
}

interface CustomerDashboardProps {
  data: {
    config: StoreConfig;
    account_slug: string;
    user: {
      id: number;
      name: string;
      email: string;
      avatar: string | null;
    };
    orders: Order[];
    bookings: Booking[];
    favorites: any[];
    stats: {
      total_orders: number;
      total_spent: number;
      pending_orders: number;
      total_bookings: number;
    };
  };
}

type Tab = 'overview' | 'orders' | 'bookings' | 'favorites';

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: FiClock },
  processing: { label: 'Procesando', color: 'bg-blue-100 text-blue-800', icon: FiPackage },
  shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-800', icon: FiTruck },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800', icon: FiCheck },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: FiX },
  confirmed: { label: 'Confirmada', color: 'bg-green-100 text-green-800', icon: FiCheck },
  completed: { label: 'Completada', color: 'bg-gray-100 text-gray-800', icon: FiCheck },
};

export default function CustomerDashboard() {
  const pageProps = usePage<{ data: CustomerDashboardProps['data'] }>().props;
  const { config, account_slug, user, orders, bookings, favorites, stats } = pageProps.data;

  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const primaryColor = config.colors?.primary || '#000000';

  const formatPrice = (price: number) => {
    const symbol = config.currency_symbol || 'S/';
    return `${symbol} ${price.toFixed(2)}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const resolveImageUrl = (url?: string) => {
    if (!url) return '/images/placeholder-product.jpg';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return url;
    return `/storage/${url}`;
  };

  const tabs = [
    { id: 'overview' as Tab, label: 'Resumen', icon: FiShoppingBag },
    { id: 'orders' as Tab, label: 'Mis Pedidos', icon: FiPackage },
    { id: 'bookings' as Tab, label: 'Mis Citas', icon: FiCalendar },
    { id: 'favorites' as Tab, label: 'Favoritos', icon: FiHeart },
  ];

  return (
    <>
      <Head title={`Mi Cuenta | ${config.name}`} />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link
              href={`/${account_slug}`}
              className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
            >
              <FiChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Volver a la tienda</span>
            </Link>

            {config.logo ? (
              <img src={config.logo} alt={config.name} className="h-8" />
            ) : (
              <span className="text-xl font-bold" style={{ color: primaryColor }}>
                {config.name}
              </span>
            )}

            <div className="flex items-center gap-4">
              <Link
                href={`/${account_slug}/cuenta/configuracion`}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiSettings className="w-5 h-5 text-gray-600" />
              </Link>
              <Link
                href={`/${account_slug}/cuenta/logout`}
                method="post"
                as="button"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiLogOut className="w-5 h-5 text-gray-600" />
              </Link>
            </div>
          </div>
        </header>

        {/* User Banner */}
        <div className="bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">Hola, {user.name.split(' ')[0]}</h1>
                <p className="text-white/70">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-3xl font-bold text-black">{stats.total_orders}</p>
                <p className="text-sm text-gray-500">Pedidos totales</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-3xl font-bold" style={{ color: primaryColor }}>
                  {formatPrice(stats.total_spent)}
                </p>
                <p className="text-sm text-gray-500">Total gastado</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-3xl font-bold text-yellow-500">{stats.pending_orders}</p>
                <p className="text-sm text-gray-500">Pedidos pendientes</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-3xl font-bold text-blue-500">{stats.total_bookings}</p>
                <p className="text-sm text-gray-500">Citas reservadas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b sticky top-[65px] z-30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium whitespace-nowrap transition-colors
                            ${activeTab === tab.id
                              ? 'border-black text-black'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Recent Orders */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-black">Pedidos Recientes</h2>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-sm font-medium hover:underline"
                    style={{ color: primaryColor }}
                  >
                    Ver todos
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center">
                    <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aun no tienes pedidos</p>
                    <Link
                      href={`/${account_slug}/productos`}
                      className="inline-block mt-4 px-6 py-2 rounded-full text-white font-medium"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Explorar productos
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => {
                      const StatusIcon = statusConfig[order.status]?.icon || FiPackage;
                      return (
                        <div
                          key={order.id}
                          className="bg-white rounded-xl p-4 flex items-center gap-4"
                        >
                          <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                            {order.items[0]?.product?.image ? (
                              <img
                                src={resolveImageUrl(order.items[0].product.image)}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FiPackage className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-black truncate">
                              Pedido #{order.order_number}
                            </p>
                            <p className="text-sm text-gray-500">
                              {order.account.name} • {formatDate(order.created_at)}
                            </p>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1
                                          ${statusConfig[order.status]?.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig[order.status]?.label}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold" style={{ color: primaryColor }}>
                              {formatPrice(order.total)}
                            </p>
                            <Link
                              href={`/${order.account.slug}/pedido/${order.order_number}`}
                              className="text-sm text-gray-500 hover:text-black flex items-center gap-1"
                            >
                              Ver detalle <FiChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Recent Bookings */}
              {bookings.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-black">Citas Proximas</h2>
                    <button
                      onClick={() => setActiveTab('bookings')}
                      className="text-sm font-medium hover:underline"
                      style={{ color: primaryColor }}
                    >
                      Ver todas
                    </button>
                  </div>

                  <div className="space-y-4">
                    {bookings.slice(0, 2).map((booking) => {
                      const StatusIcon = statusConfig[booking.status]?.icon || FiCalendar;
                      return (
                        <div
                          key={booking.id}
                          className="bg-white rounded-xl p-4 flex items-center gap-4"
                        >
                          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FiCalendar className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-black">{booking.service_name}</p>
                            <p className="text-sm text-gray-500">
                              {booking.account.name} • {formatDate(booking.date)} a las {booking.time}
                            </p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                                        ${statusConfig[booking.status]?.color}`}>
                            {statusConfig[booking.status]?.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Quick Actions */}
              <section>
                <h2 className="text-xl font-bold text-black mb-4">Acciones Rapidas</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link
                    href={`/${account_slug}/productos`}
                    className="bg-white rounded-xl p-4 text-center hover:shadow-md transition-shadow"
                  >
                    <FiShoppingBag className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <p className="font-medium text-black">Comprar</p>
                  </Link>
                  <Link
                    href={`/${account_slug}/cuenta/configuracion`}
                    className="bg-white rounded-xl p-4 text-center hover:shadow-md transition-shadow"
                  >
                    <FiMapPin className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <p className="font-medium text-black">Direcciones</p>
                  </Link>
                  <button
                    onClick={() => setActiveTab('favorites')}
                    className="bg-white rounded-xl p-4 text-center hover:shadow-md transition-shadow w-full"
                  >
                    <FiHeart className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <p className="font-medium text-black">Favoritos</p>
                  </button>
                  <Link
                    href={`/${account_slug}/cuenta/configuracion`}
                    className="bg-white rounded-xl p-4 text-center hover:shadow-md transition-shadow"
                  >
                    <FiSettings className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <p className="font-medium text-black">Configuracion</p>
                  </Link>
                </div>
              </section>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-xl font-bold text-black mb-6">Todos mis Pedidos</h2>
              {orders.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center">
                  <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-black mb-2">Sin pedidos</h3>
                  <p className="text-gray-500 mb-6">Aun no has realizado ninguna compra</p>
                  <Link
                    href={`/${account_slug}/productos`}
                    className="inline-block px-8 py-3 rounded-full text-white font-medium"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Empezar a comprar
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const StatusIcon = statusConfig[order.status]?.icon || FiPackage;
                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-xl overflow-hidden"
                      >
                        <div className="p-4 border-b flex items-center justify-between">
                          <div>
                            <p className="font-bold text-black">Pedido #{order.order_number}</p>
                            <p className="text-sm text-gray-500">
                              {order.account.name} • {formatDate(order.created_at)}
                            </p>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
                                        ${statusConfig[order.status]?.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {statusConfig[order.status]?.label}
                          </span>
                        </div>
                        <div className="p-4">
                          <div className="flex gap-4 overflow-x-auto pb-2">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex-shrink-0 w-20">
                                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden mb-2">
                                  <img
                                    src={resolveImageUrl(item.product?.image)}
                                    alt={item.product?.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <p className="text-xs text-gray-500 truncate">{item.product?.name}</p>
                                <p className="text-xs font-medium">x{item.quantity}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 flex items-center justify-between">
                          <p className="font-bold text-lg" style={{ color: primaryColor }}>
                            Total: {formatPrice(order.total)}
                          </p>
                          <Link
                            href={`/${order.account.slug}/pedido/${order.order_number}`}
                            className="px-4 py-2 rounded-full text-sm font-medium border-2 border-black
                                     text-black hover:bg-black hover:text-white transition-colors"
                          >
                            Ver Detalle
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div>
              <h2 className="text-xl font-bold text-black mb-6">Todas mis Citas</h2>
              {bookings.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center">
                  <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-black mb-2">Sin citas</h3>
                  <p className="text-gray-500">No tienes citas programadas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => {
                    const StatusIcon = statusConfig[booking.status]?.icon || FiCalendar;
                    return (
                      <div
                        key={booking.id}
                        className="bg-white rounded-xl p-6 flex items-center gap-4"
                      >
                        <div className="flex-shrink-0 w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                          <FiCalendar className="w-7 h-7 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-black text-lg">{booking.service_name}</p>
                          <p className="text-gray-600">
                            {booking.account.name}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDate(booking.date)} a las {booking.time}
                          </p>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
                                      ${statusConfig[booking.status]?.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          {statusConfig[booking.status]?.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div>
              <h2 className="text-xl font-bold text-black mb-6">Mis Favoritos</h2>
              <div className="bg-white rounded-2xl p-12 text-center">
                <FiHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-black mb-2">Sin favoritos</h3>
                <p className="text-gray-500 mb-6">
                  Guarda tus productos favoritos para encontrarlos facilmente
                </p>
                <Link
                  href={`/${account_slug}/productos`}
                  className="inline-block px-8 py-3 rounded-full text-white font-medium"
                  style={{ backgroundColor: primaryColor }}
                >
                  Explorar productos
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
