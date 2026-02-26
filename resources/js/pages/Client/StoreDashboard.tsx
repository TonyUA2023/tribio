import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useToast } from '@/contexts/ToastContext';
import MlInsightCard, { type MlPrediction } from '@/components/MlInsightCard';
import {
    Package,
    ShoppingCart,
    TrendingUp,
    AlertTriangle,
    Eye,
    ExternalLink,
    Copy,
    Sparkles,
    CreditCard,
    ArrowRight,
    Settings,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    Store,
} from 'lucide-react';

interface Template {
    id: number;
    name: string;
}

interface Plan {
    id: number;
    name: string;
    price: number;
    billing_cycle: string;
}

interface Profile {
    id: number;
    name: string;
    title: string;
    slug: string;
    render_type: 'template' | 'custom';
    template: Template | null;
    data: any;
}

interface Account {
    id: number;
    name: string;
    slug: string;
    type: 'company' | 'personal';
    payment_status: 'active' | 'due' | 'suspended';
    plan: Plan | null;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Order {
    id: number;
    order_number: string;
    status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
    total: number;
    created_at: string;
    customer: {
        id: number;
        name: string;
        phone: string | null;
    } | null;
}

interface Product {
    id: number;
    name: string;
    stock: number;
    image: string | null;
}

interface Stats {
    products: {
        total: number;
        available: number;
        featured: number;
        lowStock: number;
    };
    orders: {
        total: number;
        pending: number;
        processing: number;
        completed: number;
        today_revenue: number;
        month_revenue: number;
    };
}

interface PageProps {
    profile: Profile | null;
    user: User;
    stats: Stats;
    recentOrders: Order[];
    lowStockProducts: Product[];
    ml_design?: MlPrediction | null;
    ml_growth?: MlPrediction | null;
}

interface SharedProps {
    account: Account & {
        businessType?: {
            id: number;
            slug: string;
            name: string;
        } | null;
    };
    [key: string]: any;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function StoreDashboard({
    profile,
    user,
    stats,
    recentOrders,
    lowStockProducts,
    ml_design,
    ml_growth,
}: PageProps) {
    // Obtener account desde los datos compartidos del middleware
    const { account } = usePage<SharedProps>().props;
    const toast = useToast();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getOrderStatusConfig = (status: string) => {
        switch (status) {
            case 'completed':
                return { label: 'Completado', bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400' };
            case 'processing':
                return { label: 'En proceso', bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-400' };
            case 'pending':
                return { label: 'Pendiente', bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-400' };
            case 'shipped':
                return { label: 'Enviado', bg: 'bg-purple-100 dark:bg-purple-500/20', text: 'text-purple-700 dark:text-purple-400' };
            case 'cancelled':
                return { label: 'Cancelado', bg: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-700 dark:text-red-400' };
            default:
                return { label: status, bg: 'bg-gray-100 dark:bg-gray-500/20', text: 'text-gray-700 dark:text-gray-400' };
        }
    };

    const copyUrl = (url: string, label: string) => {
        navigator.clipboard.writeText(url);
        toast.success(`URL de ${label} copiada`);
    };

    const profileUrl = `${window.location.origin}/${account.slug}/${profile?.slug || 'home'}`;
    const storeUrl = `${window.location.origin}/${account.slug}/tienda`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Dashboard - ${account.name}`} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header de Bienvenida con gradiente Tienda (emerald) */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-6 md:p-8 text-white">
                    <div className="absolute inset-0 opacity-10">
                        <svg className="absolute -right-20 -top-20 h-80 w-80" fill="currentColor" viewBox="0 0 200 200">
                            <circle cx="100" cy="100" r="80" />
                        </svg>
                        <svg className="absolute -left-10 -bottom-10 h-60 w-60" fill="currentColor" viewBox="0 0 200 200">
                            <polygon points="100,10 40,198 190,78 10,78 160,198" />
                        </svg>
                    </div>

                    <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Store className="w-5 h-5 text-emerald-200" />
                                <span className="text-sm font-medium text-emerald-100">Tienda Virtual</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold mb-1">
                                Hola, {user.name.split(' ')[0]}
                            </h1>
                            <p className="text-emerald-100 text-sm md:text-base">
                                Gestiona tu tienda y pedidos desde aquí
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Link
                                href={storeUrl}
                                target="_blank"
                                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                            >
                                <Eye className="w-4 h-4" />
                                Ver tienda
                                <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Estadísticas principales */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Productos */}
                    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/30">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Productos</p>
                                <p className="text-2xl font-bold text-foreground">{stats.products.total}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {stats.products.available} disponibles
                                </p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                <Package className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Pedidos Pendientes */}
                    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/30">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Pedidos Pendientes</p>
                                <p className="text-2xl font-bold text-foreground">{stats.orders.pending + stats.orders.processing}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Requieren atención
                                </p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                                <ShoppingCart className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Ventas del Mes */}
                    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/30">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Ventas del Mes</p>
                                <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.orders.month_revenue)}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Hoy: {formatCurrency(stats.orders.today_revenue)}
                                </p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                <DollarSign className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Stock Bajo */}
                    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/30">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Stock Bajo</p>
                                <p className={`text-2xl font-bold ${stats.products.lowStock > 0 ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                                    {stats.products.lowStock}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Productos por reabastecer
                                </p>
                            </div>
                            <div className={`p-2.5 rounded-xl ${stats.products.lowStock > 0 ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400'}`}>
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>

                {/* Panel IA — Salud de tu Tienda */}
                {(ml_design || ml_growth) && (
                    <div className="rounded-2xl border border-border bg-card overflow-hidden">
                        <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <h3 className="text-base font-semibold text-foreground">
                                Análisis de tu Tienda — Motor IA
                            </h3>
                            <span className="ml-auto text-xs text-muted-foreground">Predicciones próximos 30 días</span>
                        </div>
                        <div className="p-5 grid sm:grid-cols-2 gap-4">
                            {ml_design && (
                                <MlInsightCard
                                    title="Configuración de Tienda"
                                    prediction={ml_design}
                                />
                            )}
                            {ml_growth && (
                                <MlInsightCard
                                    title="Potencial de Crecimiento"
                                    prediction={ml_growth}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Grid: URLs + Pedidos Recientes */}
                <div className="grid gap-6 lg:grid-cols-5">
                    {/* URLs de tu Tienda - 2 columnas */}
                    <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
                        <div className="px-5 py-4 border-b border-border bg-muted/30">
                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-primary/10">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                </div>
                                Tu Tienda Online
                            </h3>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* URL Perfil/Home */}
                            <div className="rounded-xl border border-border bg-muted/30 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Página Principal
                                    </p>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400">
                                        Perfil
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 text-sm text-primary font-medium truncate">
                                        {profileUrl}
                                    </code>
                                    <button
                                        onClick={() => copyUrl(profileUrl, 'perfil')}
                                        className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* URL Tienda Completa */}
                            <div className="rounded-xl border border-border bg-muted/30 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Tienda Completa
                                    </p>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                                        Catálogo
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 text-sm text-primary font-medium truncate">
                                        {storeUrl}
                                    </code>
                                    <button
                                        onClick={() => copyUrl(storeUrl, 'tienda')}
                                        className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Acciones rápidas */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <Link
                                    href={storeUrl}
                                    target="_blank"
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
                                >
                                    <Eye className="w-4 h-4" />
                                    Ver Tienda
                                </Link>
                                <Link
                                    href="/products"
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium text-sm hover:bg-muted transition-colors"
                                >
                                    <Package className="w-4 h-4" />
                                    Productos
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Pedidos Recientes - 3 columnas */}
                    <div className="lg:col-span-3 rounded-xl border border-border bg-card overflow-hidden">
                        <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-primary/10">
                                    <ShoppingCart className="w-4 h-4 text-primary" />
                                </div>
                                Pedidos Recientes
                            </h3>
                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                {stats.orders.total} totales
                            </span>
                        </div>

                        <div className="p-5">
                            {recentOrders.length > 0 ? (
                                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                                    {recentOrders.map((order) => {
                                        const statusConfig = getOrderStatusConfig(order.status);
                                        return (
                                            <div
                                                key={order.id}
                                                className="rounded-xl border border-border bg-background p-4 transition-all hover:shadow-md hover:border-primary/30"
                                            >
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-mono text-sm font-semibold text-foreground">
                                                                #{order.order_number}
                                                            </span>
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                                                                {statusConfig.label}
                                                            </span>
                                                        </div>

                                                        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                                                            <span>{order.customer?.name || 'Cliente'}</span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                {formatDate(order.created_at)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-foreground">
                                                            {formatCurrency(order.total)}
                                                        </p>
                                                        <p className={`text-xs ${order.payment_status === 'paid' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                                            {order.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                                        <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground font-medium">
                                        No tienes pedidos aún
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Los pedidos de tu tienda aparecerán aquí
                                    </p>
                                </div>
                            )}
                        </div>

                        {recentOrders.length > 0 && (
                            <div className="px-5 py-3 border-t border-border bg-muted/30">
                                <Link
                                    href="/orders"
                                    className="flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                                >
                                    Ver todos los pedidos
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Productos con Stock Bajo */}
                {lowStockProducts.length > 0 && (
                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                        <div className="px-5 py-4 border-b border-border bg-red-50 dark:bg-red-500/10 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
                                Productos con Stock Bajo
                            </h3>
                        </div>

                        <div className="p-5">
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {lowStockProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background"
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Package className="w-6 h-6 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground truncate">{product.name}</p>
                                            <p className="text-sm text-red-600 dark:text-red-400 font-semibold">
                                                Stock: {product.stock} unidades
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 text-center">
                                <Link
                                    href="/products"
                                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                                >
                                    Gestionar productos
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
