/**
 * My Purchases - User's purchases across all Tribio stores
 * This page shows the user their orders as a customer in other stores
 */

import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
  Package,
  Truck,
  Clock,
  Check,
  X,
  ChevronRight,
  ShoppingBag,
  Calendar,
  Store,
  Heart,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  total: number;
  created_at: string;
  store: {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
  };
  items: Array<{
    id: number;
    product_name: string;
    product_image: string | null;
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
  store: {
    id: number;
    name: string;
    slug: string;
  };
}

interface Props {
  orders: Order[];
  bookings: Booking[];
  favorites: any[];
  stats: {
    total_orders: number;
    total_spent: number;
    pending_orders: number;
    total_bookings: number;
    stores_shopped: number;
  };
}

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  processing: { label: 'Procesando', color: 'bg-blue-100 text-blue-800', icon: Package },
  shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-800', icon: Truck },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800', icon: Check },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: X },
  confirmed: { label: 'Confirmada', color: 'bg-green-100 text-green-800', icon: Check },
  completed: { label: 'Completada', color: 'bg-gray-100 text-gray-800', icon: Check },
};

export default function MyPurchases({ orders, bookings, favorites, stats }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Mis Compras', href: '/mis-compras' },
  ];

  const [activeTab, setActiveTab] = useState('orders');

  const formatPrice = (price: number) => `S/ ${price.toFixed(2)}`;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const resolveImageUrl = (url?: string | null) => {
    if (!url) return '/images/placeholder-product.jpg';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return url;
    const publicPath = (window as any).appConfig?.filesystemPublicPath || 'storage';
    const clean = url.replace(/^uploaded_files\//, '').replace(/^storage\//, '');
    return `/${publicPath}/${clean}`;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Mis Compras" />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Mis Compras</h1>
          <p className="text-muted-foreground mt-1">
            Historial de compras y reservas en tiendas Tribio
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-foreground">{stats.total_orders}</p>
              <p className="text-sm text-muted-foreground">Pedidos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-primary">{formatPrice(stats.total_spent)}</p>
              <p className="text-sm text-muted-foreground">Total gastado</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-yellow-500">{stats.pending_orders}</p>
              <p className="text-sm text-muted-foreground">Pendientes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-500">{stats.total_bookings}</p>
              <p className="text-sm text-muted-foreground">Citas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-purple-500">{stats.stores_shopped}</p>
              <p className="text-sm text-muted-foreground">Tiendas</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Citas
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Favoritos
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Sin pedidos</h3>
                  <p className="text-muted-foreground mb-6">
                    Aun no has realizado ninguna compra en tiendas Tribio
                  </p>
                  <Button asChild>
                    <Link href="/directorio">
                      Explorar tiendas
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const StatusIcon = statusConfig[order.status]?.icon || Package;
                  return (
                    <Card key={order.id}>
                      <CardContent className="p-0">
                        {/* Order Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                              {order.store.logo ? (
                                <img
                                  src={resolveImageUrl(order.store.logo)}
                                  alt={order.store.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Store className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold">{order.store.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Pedido #{order.order_number} • {formatDate(order.created_at)}
                              </p>
                            </div>
                          </div>
                          <Badge className={statusConfig[order.status]?.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[order.status]?.label}
                          </Badge>
                        </div>

                        {/* Order Items */}
                        <div className="p-4">
                          <div className="flex gap-3 overflow-x-auto pb-2">
                            {order.items.slice(0, 4).map((item) => (
                              <div key={item.id} className="flex-shrink-0 w-16">
                                <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden">
                                  <img
                                    src={resolveImageUrl(item.product_image)}
                                    alt={item.product_name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground truncate mt-1">
                                  {item.product_name}
                                </p>
                              </div>
                            ))}
                            {order.items.length > 4 && (
                              <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                                <span className="text-sm text-muted-foreground">
                                  +{order.items.length - 4}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Order Footer */}
                        <div className="flex items-center justify-between p-4 bg-muted/30 border-t">
                          <p className="font-bold text-lg">{formatPrice(order.total)}</p>
                          <Button variant="outline" size="sm" asChild>
                            <Link
                              href={`/${order.store.slug}/pedido/${order.order_number}`}
                              target="_blank"
                              className="flex items-center gap-2"
                            >
                              Ver detalle
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            {bookings.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Calendar className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Sin citas</h3>
                  <p className="text-muted-foreground">
                    No tienes citas programadas
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const StatusIcon = statusConfig[booking.status]?.icon || Calendar;
                  return (
                    <Card key={booking.id}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{booking.service_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.store.name} • {formatDate(booking.date)} a las {booking.time}
                          </p>
                        </div>
                        <Badge className={statusConfig[booking.status]?.color}>
                          {statusConfig[booking.status]?.label}
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <Card>
              <CardContent className="py-16 text-center">
                <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Sin favoritos</h3>
                <p className="text-muted-foreground mb-6">
                  Guarda productos para encontrarlos facilmente despues
                </p>
                <Button asChild>
                  <Link href="/directorio">
                    Explorar tiendas
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
