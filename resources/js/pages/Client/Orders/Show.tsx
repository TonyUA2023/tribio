import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { resolveMediaUrl } from '@/utils/mediaUrl';
import { type BreadcrumbItem } from '@/types';
import {
    ArrowLeft,
    Phone,
    Mail,
    MapPin,
    Clock,
    Package,
    CheckCircle2,
    XCircle,
    ChefHat,
    Truck,
    CreditCard,
    Calendar,
    MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    options?: string;
    product?: {
        id: number;
        name: string;
        image: string | null;
    };
}

interface Order {
    id: number;
    order_number: string;
    customer_name: string;
    customer_phone: string | null;
    customer_email: string | null;
    delivery_address: string | null;
    delivery_type: 'pickup' | 'delivery';
    status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
    payment_status: 'pending' | 'paid';
    payment_method: string | null;
    subtotal: number;
    delivery_fee: number;
    total: number;
    notes: string | null;
    created_at: string;
    confirmed_at: string | null;
    delivered_at: string | null;
    items: OrderItem[];
}

interface Props {
    order: Order;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType; bgColor: string }> = {
    pending: { label: 'Pendiente', color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30', icon: Clock },
    preparing: { label: 'Preparando', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30', icon: ChefHat },
    ready: { label: 'Listo para entregar', color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30', icon: Package },
    delivered: { label: 'Entregado', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30', icon: CheckCircle2 },
    cancelled: { label: 'Cancelado', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30', icon: XCircle },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendiente', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
    paid: { label: 'Pagado', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
};

export default function OrderShow({ order }: Props) {
    const [notes, setNotes] = useState(order.notes || '');
    const [savingNotes, setSavingNotes] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pedidos', href: '/orders' },
        { title: `#${order.order_number}`, href: `/orders/${order.id}` },
    ];

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleUpdateStatus = (newStatus: string) => {
        router.patch(`/orders/${order.id}/status`, { status: newStatus });
    };

    const handleUpdatePaymentStatus = (newPaymentStatus: string) => {
        router.patch(`/orders/${order.id}/payment-status`, { payment_status: newPaymentStatus });
    };

    const handleSaveNotes = () => {
        setSavingNotes(true);
        router.patch(`/orders/${order.id}/notes`, { notes }, {
            onFinish: () => setSavingNotes(false),
        });
    };

    const getNextStatus = (currentStatus: string): string | null => {
        const statusFlow: Record<string, string> = {
            pending: 'preparing',
            preparing: 'ready',
            ready: 'delivered',
        };
        return statusFlow[currentStatus] || null;
    };

    const status = statusConfig[order.status];
    const StatusIcon = status.icon;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Pedido #${order.order_number}`} />

            <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/orders">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">Pedido #{order.order_number}</h1>
                        <p className="text-muted-foreground text-sm">
                            {formatDate(order.created_at)}
                        </p>
                    </div>
                </div>

                {/* Estado principal */}
                <div className={cn("rounded-xl p-6", status.bgColor)}>
                    <div className="flex items-center gap-4">
                        <div className={cn("p-3 rounded-full bg-white/80 dark:bg-black/20", status.color)}>
                            <StatusIcon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <h2 className={cn("text-xl font-bold", status.color)}>{status.label}</h2>
                            <p className="text-sm opacity-80">
                                {order.status === 'pending' && 'El pedido está esperando confirmación'}
                                {order.status === 'preparing' && 'El pedido está siendo preparado'}
                                {order.status === 'ready' && 'El pedido está listo para ser entregado'}
                                {order.status === 'delivered' && `Entregado el ${order.delivered_at ? formatDate(order.delivered_at) : ''}`}
                                {order.status === 'cancelled' && 'Este pedido ha sido cancelado'}
                            </p>
                        </div>
                        <Badge className={paymentStatusConfig[order.payment_status].color}>
                            {paymentStatusConfig[order.payment_status].label}
                        </Badge>
                    </div>

                    {/* Acciones de estado */}
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <div className="flex gap-2 mt-4 pt-4 border-t border-black/10 dark:border-white/10">
                            {getNextStatus(order.status) && (
                                <Button
                                    onClick={() => handleUpdateStatus(getNextStatus(order.status)!)}
                                    className="flex-1"
                                >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Marcar como {statusConfig[getNextStatus(order.status)!].label}
                                </Button>
                            )}
                            {order.payment_status === 'pending' && (
                                <Button
                                    variant="outline"
                                    onClick={() => handleUpdatePaymentStatus('paid')}
                                >
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Marcar como pagado
                                </Button>
                            )}
                            <Button
                                variant="destructive"
                                onClick={() => handleUpdateStatus('cancelled')}
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancelar
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Cliente */}
                    <div className="rounded-lg border bg-card p-5 space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Package className="h-5 w-5 text-muted-foreground" />
                            Información del Cliente
                        </h3>
                        <div className="space-y-3">
                            <p className="font-medium text-lg">{order.customer_name}</p>
                            {order.customer_phone && (
                                <a
                                    href={`tel:${order.customer_phone}`}
                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Phone className="h-4 w-4" />
                                    {order.customer_phone}
                                </a>
                            )}
                            {order.customer_email && (
                                <a
                                    href={`mailto:${order.customer_email}`}
                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Mail className="h-4 w-4" />
                                    {order.customer_email}
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Entrega */}
                    <div className="rounded-lg border bg-card p-5 space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Truck className="h-5 w-5 text-muted-foreground" />
                            Entrega
                        </h3>
                        <div className="space-y-3">
                            <Badge variant="outline" className="text-sm">
                                {order.delivery_type === 'pickup' ? 'Recojo en tienda' : 'Delivery'}
                            </Badge>
                            {order.delivery_address && (
                                <p className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    {order.delivery_address}
                                </p>
                            )}
                            {order.payment_method && (
                                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CreditCard className="h-4 w-4" />
                                    Método de pago: {order.payment_method}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Productos */}
                <div className="rounded-lg border bg-card p-5 space-y-4">
                    <h3 className="font-semibold">Productos</h3>
                    <div className="divide-y">
                        {order.items.map((item) => (
                            <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                                {item.product?.image ? (
                                    <img
                                        src={resolveMediaUrl(item.product.image)}
                                        alt={item.product_name}
                                        className="w-16 h-16 rounded-lg object-cover bg-muted"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                                        <Package className="h-6 w-6 text-muted-foreground/50" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <p className="font-medium">{item.product_name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {item.quantity} x {formatPrice(item.unit_price)}
                                    </p>
                                    {item.options && (
                                        <p className="text-xs text-muted-foreground mt-1">{item.options}</p>
                                    )}
                                </div>
                                <span className="font-semibold">{formatPrice(item.subtotal)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Totales */}
                    <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        {order.delivery_fee > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Costo de envío</span>
                                <span>{formatPrice(order.delivery_fee)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold pt-2 border-t">
                            <span>Total</span>
                            <span className="text-emerald-600">{formatPrice(order.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Notas */}
                <div className="rounded-lg border bg-card p-5 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-muted-foreground" />
                        Notas del pedido
                    </h3>
                    <Textarea
                        placeholder="Agregar notas internas sobre este pedido..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveNotes}
                        disabled={savingNotes || notes === (order.notes || '')}
                    >
                        {savingNotes ? 'Guardando...' : 'Guardar notas'}
                    </Button>
                </div>

                {/* Timeline */}
                <div className="rounded-lg border bg-card p-5 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        Historial
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2"></div>
                            <div>
                                <p className="font-medium">Pedido creado</p>
                                <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                            </div>
                        </div>
                        {order.confirmed_at && (
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                                <div>
                                    <p className="font-medium">Pedido confirmado</p>
                                    <p className="text-sm text-muted-foreground">{formatDate(order.confirmed_at)}</p>
                                </div>
                            </div>
                        )}
                        {order.delivered_at && (
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                                <div>
                                    <p className="font-medium">Pedido entregado</p>
                                    <p className="text-sm text-muted-foreground">{formatDate(order.delivered_at)}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
