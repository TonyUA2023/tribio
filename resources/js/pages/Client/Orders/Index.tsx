import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';
import {
    ClipboardList,
    Search,
    Filter,
    Eye,
    MoreVertical,
    Phone,
    Mail,
    MapPin,
    Clock,
    Package,
    CheckCircle2,
    XCircle,
    Truck,
    ChefHat,
    Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pedidos', href: '/orders' },
];

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
    orders: {
        data: Order[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        status?: string;
        payment_status?: string;
        search?: string;
        date_from?: string;
        date_to?: string;
    };
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
    preparing: { label: 'Preparando', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: ChefHat },
    ready: { label: 'Listo', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: Package },
    delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
    cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendiente', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
    paid: { label: 'Pagado', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
};

export default function OrdersIndex({ orders, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(filters.payment_status || 'all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const handleSearch = () => {
        router.get('/orders', {
            search: searchTerm || undefined,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
            payment_status: selectedPaymentStatus !== 'all' ? selectedPaymentStatus : undefined,
        }, { preserveState: true });
    };

    const handleStatusFilter = (status: string) => {
        setSelectedStatus(status);
        router.get('/orders', {
            search: searchTerm || undefined,
            status: status !== 'all' ? status : undefined,
            payment_status: selectedPaymentStatus !== 'all' ? selectedPaymentStatus : undefined,
        }, { preserveState: true });
    };

    const handlePaymentStatusFilter = (paymentStatus: string) => {
        setSelectedPaymentStatus(paymentStatus);
        router.get('/orders', {
            search: searchTerm || undefined,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
            payment_status: paymentStatus !== 'all' ? paymentStatus : undefined,
        }, { preserveState: true });
    };

    const handleUpdateStatus = (order: Order, newStatus: string) => {
        router.patch(`/orders/${order.id}/status`, { status: newStatus });
    };

    const handleUpdatePaymentStatus = (order: Order, newPaymentStatus: string) => {
        router.patch(`/orders/${order.id}/payment-status`, { payment_status: newPaymentStatus });
    };

    const openDetailModal = (order: Order) => {
        setSelectedOrder(order);
        setIsDetailModalOpen(true);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pedidos" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
                        <p className="text-muted-foreground">
                            Gestiona los pedidos de tu tienda
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm">
                            {orders.total} pedido{orders.total !== 1 ? 's' : ''}
                        </Badge>
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por número, nombre o teléfono..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="pl-10"
                        />
                    </div>
                    <Select value={selectedStatus} onValueChange={handleStatusFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="preparing">Preparando</SelectItem>
                            <SelectItem value="ready">Listo</SelectItem>
                            <SelectItem value="delivered">Entregado</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={selectedPaymentStatus} onValueChange={handlePaymentStatusFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Pago" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="pending">Por pagar</SelectItem>
                            <SelectItem value="paid">Pagado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Lista de pedidos */}
                {orders.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                        <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">No hay pedidos</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Los pedidos de tu tienda aparecerán aquí
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Vista Desktop */}
                        <div className="hidden md:block rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Pedido</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Pago</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.data.map((order) => {
                                        const status = statusConfig[order.status];
                                        const paymentStatus = paymentStatusConfig[order.payment_status];
                                        const StatusIcon = status.icon;

                                        return (
                                            <TableRow key={order.id}>
                                                <TableCell>
                                                    <div>
                                                        <span className="font-medium">#{order.order_number}</span>
                                                        <p className="text-xs text-muted-foreground">
                                                            {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <span className="font-medium">{order.customer_name}</span>
                                                        {order.customer_phone && (
                                                            <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={cn("gap-1", status.color)}>
                                                        <StatusIcon className="h-3 w-3" />
                                                        {status.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={paymentStatus.color}>
                                                        {paymentStatus.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {formatPrice(order.total)}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {formatDate(order.created_at)}
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => openDetailModal(order)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Ver detalles
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            {getNextStatus(order.status) && (
                                                                <DropdownMenuItem
                                                                    onClick={() => handleUpdateStatus(order, getNextStatus(order.status)!)}
                                                                >
                                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                                    Marcar como {statusConfig[getNextStatus(order.status)!].label}
                                                                </DropdownMenuItem>
                                                            )}
                                                            {order.payment_status === 'pending' && (
                                                                <DropdownMenuItem
                                                                    onClick={() => handleUpdatePaymentStatus(order, 'paid')}
                                                                >
                                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                                    Marcar como pagado
                                                                </DropdownMenuItem>
                                                            )}
                                                            {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleUpdateStatus(order, 'cancelled')}
                                                                        className="text-destructive focus:text-destructive"
                                                                    >
                                                                        <XCircle className="mr-2 h-4 w-4" />
                                                                        Cancelar pedido
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Vista Mobile */}
                        <div className="md:hidden space-y-3">
                            {orders.data.map((order) => {
                                const status = statusConfig[order.status];
                                const paymentStatus = paymentStatusConfig[order.payment_status];
                                const StatusIcon = status.icon;

                                return (
                                    <div
                                        key={order.id}
                                        className="rounded-lg border bg-card p-4 space-y-3"
                                        onClick={() => openDetailModal(order)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <span className="font-semibold">#{order.order_number}</span>
                                                <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                                            </div>
                                            <span className="font-bold text-emerald-600">{formatPrice(order.total)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={cn("gap-1", status.color)}>
                                                <StatusIcon className="h-3 w-3" />
                                                {status.label}
                                            </Badge>
                                            <Badge className={paymentStatus.color}>
                                                {paymentStatus.label}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>{order.items.length} producto{order.items.length !== 1 ? 's' : ''}</span>
                                            <span>{formatDate(order.created_at)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Paginación */}
                        {orders.last_page > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={orders.current_page === 1}
                                    onClick={() => router.get('/orders', { ...filters, page: orders.current_page - 1 })}
                                >
                                    Anterior
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Página {orders.current_page} de {orders.last_page}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={orders.current_page === orders.last_page}
                                    onClick={() => router.get('/orders', { ...filters, page: orders.current_page + 1 })}
                                >
                                    Siguiente
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal Detalle del Pedido */}
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Pedido #{selectedOrder?.order_number}</DialogTitle>
                        <DialogDescription>
                            {selectedOrder && formatDate(selectedOrder.created_at)}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-6">
                            {/* Estado */}
                            <div className="flex items-center gap-3">
                                <Badge className={cn("gap-1 text-sm", statusConfig[selectedOrder.status].color)}>
                                    {(() => {
                                        const StatusIcon = statusConfig[selectedOrder.status].icon;
                                        return <StatusIcon className="h-4 w-4" />;
                                    })()}
                                    {statusConfig[selectedOrder.status].label}
                                </Badge>
                                <Badge className={paymentStatusConfig[selectedOrder.payment_status].color}>
                                    {paymentStatusConfig[selectedOrder.payment_status].label}
                                </Badge>
                            </div>

                            {/* Cliente */}
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Cliente</h4>
                                <div className="rounded-lg bg-muted p-3 space-y-2">
                                    <p className="font-medium">{selectedOrder.customer_name}</p>
                                    {selectedOrder.customer_phone && (
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            {selectedOrder.customer_phone}
                                        </p>
                                    )}
                                    {selectedOrder.customer_email && (
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            {selectedOrder.customer_email}
                                        </p>
                                    )}
                                    {selectedOrder.delivery_address && (
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            {selectedOrder.delivery_address}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Productos */}
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Productos</h4>
                                <div className="rounded-lg border divide-y">
                                    {selectedOrder.items.map((item) => (
                                        <div key={item.id} className="p-3 flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{item.product_name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.quantity} x {formatPrice(item.unit_price)}
                                                </p>
                                                {item.options && (
                                                    <p className="text-xs text-muted-foreground">{item.options}</p>
                                                )}
                                            </div>
                                            <span className="font-medium">{formatPrice(item.subtotal)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Totales */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                                </div>
                                {selectedOrder.delivery_fee > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span>Envío</span>
                                        <span>{formatPrice(selectedOrder.delivery_fee)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                    <span>Total</span>
                                    <span className="text-emerald-600">{formatPrice(selectedOrder.total)}</span>
                                </div>
                            </div>

                            {/* Notas */}
                            {selectedOrder.notes && (
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm">Notas</h4>
                                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                                        {selectedOrder.notes}
                                    </p>
                                </div>
                            )}

                            {/* Acciones */}
                            <div className="flex gap-2 pt-4 border-t">
                                {getNextStatus(selectedOrder.status) && (
                                    <Button
                                        className="flex-1"
                                        onClick={() => {
                                            handleUpdateStatus(selectedOrder, getNextStatus(selectedOrder.status)!);
                                            setIsDetailModalOpen(false);
                                        }}
                                    >
                                        Marcar como {statusConfig[getNextStatus(selectedOrder.status)!].label}
                                    </Button>
                                )}
                                {selectedOrder.payment_status === 'pending' && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            handleUpdatePaymentStatus(selectedOrder, 'paid');
                                            setIsDetailModalOpen(false);
                                        }}
                                    >
                                        Marcar pagado
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
