import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useToast } from '@/contexts/ToastContext';
import {
    CalendarDays,
    Clock,
    Phone,
    Mail,
    MessageSquare,
    Scissors,
    Check,
    X,
    ExternalLink,
    Copy,
    Sparkles,
    TrendingUp,
    Users,
    CreditCard,
    ArrowRight,
    Eye,
    Settings,
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

interface Booking {
    id: number;
    client_name: string;
    client_phone: string | null;
    client_email: string | null;
    booking_date: string;
    booking_time: string;
    service: string | null;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    notes: string | null;
}

interface PageProps {
    profile: Profile | null;
    bookings: Booking[];
    user: User;
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

export default function ClientDashboard({ profile, bookings, user }: PageProps) {
    // Obtener account desde los datos compartidos del middleware
    const { account } = usePage<SharedProps>().props;
    const [localBookings, setLocalBookings] = React.useState(bookings);
    const [updatingBookingId, setUpdatingBookingId] = React.useState<number | null>(null);
    const toast = useToast();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    const formatTime = (timeString: string) => {
        return timeString.substring(0, 5);
    };

    const handleUpdateStatus = async (bookingId: number, newStatus: string) => {
        setUpdatingBookingId(bookingId);

        try {
            const response = await fetch(`/api/bookings/${bookingId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const result = await response.json();

            if (result.success) {
                setLocalBookings(prevBookings =>
                    prevBookings.map(booking =>
                        booking.id === bookingId
                            ? { ...booking, status: newStatus as any }
                            : booking
                    )
                );

                if (newStatus === 'confirmed') {
                    toast.success('Cita confirmada exitosamente');
                } else if (newStatus === 'cancelled') {
                    toast.warning('Cita rechazada correctamente');
                } else if (newStatus === 'completed') {
                    toast.success('Cita marcada como completada');
                }
            } else {
                toast.error(result.message || 'No se pudo actualizar el estado de la cita');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al procesar la solicitud. Por favor, intenta de nuevo.');
        } finally {
            setUpdatingBookingId(null);
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'confirmed':
                return {
                    label: 'Confirmada',
                    bg: 'bg-emerald-100 dark:bg-emerald-500/20',
                    text: 'text-emerald-700 dark:text-emerald-400',
                    dot: 'bg-emerald-500'
                };
            case 'pending':
                return {
                    label: 'Pendiente',
                    bg: 'bg-amber-100 dark:bg-amber-500/20',
                    text: 'text-amber-700 dark:text-amber-400',
                    dot: 'bg-amber-500'
                };
            case 'cancelled':
                return {
                    label: 'Cancelada',
                    bg: 'bg-red-100 dark:bg-red-500/20',
                    text: 'text-red-700 dark:text-red-400',
                    dot: 'bg-red-500'
                };
            case 'completed':
                return {
                    label: 'Completada',
                    bg: 'bg-sky-100 dark:bg-sky-500/20',
                    text: 'text-sky-700 dark:text-sky-400',
                    dot: 'bg-sky-500'
                };
            default:
                return {
                    label: status,
                    bg: 'bg-gray-100 dark:bg-gray-500/20',
                    text: 'text-gray-700 dark:text-gray-400',
                    dot: 'bg-gray-500'
                };
        }
    };

    const pendingCount = localBookings.filter(b => b.status === 'pending').length;
    const confirmedCount = localBookings.filter(b => b.status === 'confirmed').length;

    const copyProfileUrl = () => {
        if (profile) {
            navigator.clipboard.writeText(`${window.location.origin}/${account.slug}/${profile.slug}`);
            toast.success('URL copiada al portapapeles');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Dashboard - ${account.name}`} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header de Bienvenida con gradiente Tribio */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 via-cyan-600 to-cyan-700 p-6 md:p-8 text-white">
                    {/* Decoración de fondo */}
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
                                <Sparkles className="w-5 h-5 text-cyan-200" />
                                <span className="text-sm font-medium text-cyan-100">Panel de Control</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold mb-1">
                                Hola, {user.name.split(' ')[0]}
                            </h1>
                            <p className="text-cyan-100 text-sm md:text-base">
                                Bienvenido a tu espacio de trabajo en Tribio
                            </p>
                        </div>

                        {profile && (
                            <Link
                                href={`/${account.slug}/${profile.slug}`}
                                target="_blank"
                                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                            >
                                <Eye className="w-4 h-4" />
                                Ver mi perfil
                                <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                        )}
                    </div>
                </div>

                {/* Estadísticas en Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Plan Actual */}
                    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/30">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Tu Plan</p>
                                <p className="text-xl font-bold text-foreground">{account.plan?.name ?? 'Sin Plan'}</p>
                                {account.plan && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        S/ {account.plan.price}/{account.plan.billing_cycle === 'monthly' ? 'mes' : 'año'}
                                    </p>
                                )}
                            </div>
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                <CreditCard className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Estado de Pago */}
                    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/30">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Estado de Pago</p>
                                <p className={`text-xl font-bold ${
                                    account.payment_status === 'active' ? 'text-emerald-600 dark:text-emerald-400' :
                                    account.payment_status === 'due' ? 'text-amber-600 dark:text-amber-400' :
                                    'text-red-600 dark:text-red-400'
                                }`}>
                                    {account.payment_status === 'active' ? 'Activo' :
                                     account.payment_status === 'due' ? 'Pendiente' :
                                     'Suspendido'}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {account.payment_status === 'active' ? 'Todo al día' : 'Revisar pagos'}
                                </p>
                            </div>
                            <div className={`p-2.5 rounded-xl ${
                                account.payment_status === 'active' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                account.payment_status === 'due' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' :
                                'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                            }`}>
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Citas Pendientes */}
                    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/30">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Citas Pendientes</p>
                                <p className="text-xl font-bold text-foreground">{pendingCount}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {pendingCount === 1 ? 'Requiere atención' : 'Requieren atención'}
                                </p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                                <CalendarDays className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Citas Confirmadas */}
                    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/30">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Citas Confirmadas</p>
                                <p className="text-xl font-bold text-foreground">{confirmedCount}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Esta semana
                                </p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>

                {/* Grid de 2 columnas: Perfil + Citas */}
                <div className="grid gap-6 lg:grid-cols-5">
                    {/* Tu Perfil Digital - 2 columnas */}
                    <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
                        <div className="px-5 py-4 border-b border-border bg-muted/30">
                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-primary/10">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                </div>
                                Tu Perfil Digital
                            </h3>
                        </div>

                        <div className="p-5">
                            {profile ? (
                                <div className="space-y-4">
                                    {/* Info del perfil */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-xl font-bold shadow-lg">
                                            {profile.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-lg font-semibold text-foreground truncate">{profile.name}</h4>
                                            <p className="text-sm text-muted-foreground truncate">{profile.title}</p>
                                            <span className={`inline-flex items-center gap-1.5 mt-2 text-xs font-medium px-2.5 py-1 rounded-full ${
                                                profile.render_type === 'custom'
                                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'
                                                    : 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400'
                                            }`}>
                                                {profile.render_type === 'custom' ? 'Diseño Personalizado' : `Plantilla: ${profile.template?.name ?? 'N/A'}`}
                                            </span>
                                        </div>
                                    </div>

                                    {/* URL del Perfil */}
                                    <div className="rounded-xl border border-border bg-muted/30 p-4">
                                        <p className="text-xs font-medium text-muted-foreground mb-2">
                                            URL de tu perfil público
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 text-sm text-primary font-medium truncate">
                                                {window.location.origin}/{account.slug}/{profile.slug}
                                            </code>
                                            <button
                                                onClick={copyProfileUrl}
                                                className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Acciones rápidas */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <Link
                                            href={`/${account.slug}/${profile.slug}`}
                                            target="_blank"
                                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Ver Perfil
                                        </Link>
                                        <Link
                                            href="/settings/page"
                                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium text-sm hover:bg-muted transition-colors"
                                        >
                                            <Settings className="w-4 h-4" />
                                            Editar
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                                        <Sparkles className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground font-medium">
                                        Aún no tienes un perfil creado
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Contacta con soporte para crear tu perfil digital
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Próximas Citas - 3 columnas */}
                    <div className="lg:col-span-3 rounded-xl border border-border bg-card overflow-hidden">
                        <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-primary/10">
                                    <CalendarDays className="w-4 h-4 text-primary" />
                                </div>
                                Próximas Citas
                            </h3>
                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                {localBookings.length} {localBookings.length === 1 ? 'cita' : 'citas'}
                            </span>
                        </div>

                        <div className="p-5">
                            {localBookings.length > 0 ? (
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                                    {localBookings.map((booking) => {
                                        const statusConfig = getStatusConfig(booking.status);
                                        return (
                                            <div
                                                key={booking.id}
                                                className="rounded-xl border border-border bg-background p-4 transition-all hover:shadow-md hover:border-primary/30"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        {/* Nombre y Estado */}
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className="font-semibold text-foreground">
                                                                {booking.client_name}
                                                            </h4>
                                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                                                                {statusConfig.label}
                                                            </span>
                                                        </div>

                                                        {/* Detalles */}
                                                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1.5">
                                                                <CalendarDays className="w-4 h-4" />
                                                                {formatDate(booking.booking_date)}
                                                            </span>
                                                            <span className="flex items-center gap-1.5">
                                                                <Clock className="w-4 h-4" />
                                                                {formatTime(booking.booking_time)}
                                                            </span>
                                                            {booking.service && (
                                                                <span className="flex items-center gap-1.5">
                                                                    <Scissors className="w-4 h-4" />
                                                                    {booking.service}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Contacto */}
                                                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                                            {booking.client_phone && (
                                                                <span className="flex items-center gap-1.5">
                                                                    <Phone className="w-3.5 h-3.5" />
                                                                    {booking.client_phone}
                                                                </span>
                                                            )}
                                                            {booking.client_email && (
                                                                <span className="flex items-center gap-1.5">
                                                                    <Mail className="w-3.5 h-3.5" />
                                                                    {booking.client_email}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Notas */}
                                                        {booking.notes && (
                                                            <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm">
                                                                <span className="flex items-start gap-2">
                                                                    <MessageSquare className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                                                                    <span className="text-foreground">{booking.notes}</span>
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Botones de acción */}
                                                        {booking.status === 'pending' && (
                                                            <div className="mt-4 flex gap-2">
                                                                <button
                                                                    onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                                                    disabled={updatingBookingId === booking.id}
                                                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    <Check className="w-4 h-4" />
                                                                    {updatingBookingId === booking.id ? 'Procesando...' : 'Aceptar'}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                                                    disabled={updatingBookingId === booking.id}
                                                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                    {updatingBookingId === booking.id ? 'Procesando...' : 'Rechazar'}
                                                                </button>
                                                            </div>
                                                        )}

                                                        {booking.status === 'confirmed' && (
                                                            <div className="mt-4 flex gap-2">
                                                                <button
                                                                    onClick={() => handleUpdateStatus(booking.id, 'completed')}
                                                                    disabled={updatingBookingId === booking.id}
                                                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    <Check className="w-4 h-4" />
                                                                    {updatingBookingId === booking.id ? 'Procesando...' : 'Marcar Completada'}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                                                    disabled={updatingBookingId === booking.id}
                                                                    className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                                        <CalendarDays className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground font-medium">
                                        No tienes citas próximas
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Las citas reservadas aparecerán aquí automáticamente
                                    </p>
                                </div>
                            )}
                        </div>

                        {localBookings.length > 0 && (
                            <div className="px-5 py-3 border-t border-border bg-muted/30">
                                <Link
                                    href="/appointments"
                                    className="flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                                >
                                    Ver todas las citas
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
