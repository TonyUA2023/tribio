import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import {
    Calendar,
    CalendarPlus,
    Check,
    Clock,
    Mail,
    Phone,
    Search,
    User,
    X,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Citas',
        href: '/appointments',
    },
];

interface Booking {
    id: number;
    client_name: string;
    client_phone: string;
    client_email: string;
    booking_date: string;
    booking_time: string;
    service: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string;
    profile_name?: string;
}

interface Stats {
    today: number;
    pending: number;
    confirmed: number;
    completed: number;
}

interface AppointmentsIndexProps {
    stats: Stats;
    bookings: Booking[];
}

export default function AppointmentsIndex({
    stats,
    bookings,
}: AppointmentsIndexProps) {
    const updateBookingStatus = (bookingId: number, status: string) => {
        router.patch(
            `/appointments/${bookingId}/status`,
            { status },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Mensaje de éxito opcional
                },
            },
        );
    };

    const getStatusColor = (status: Booking['status']) => {
        switch (status) {
            case 'pending':
                return 'bg-amber-500/10 text-amber-600';
            case 'confirmed':
                return 'bg-blue-500/10 text-blue-600';
            case 'completed':
                return 'bg-green-500/10 text-green-600';
            case 'cancelled':
                return 'bg-red-500/10 text-red-600';
            default:
                return 'bg-gray-500/10 text-gray-600';
        }
    };

    const getStatusLabel = (status: Booking['status']) => {
        switch (status) {
            case 'pending':
                return 'Pendiente';
            case 'confirmed':
                return 'Confirmada';
            case 'completed':
                return 'Completada';
            case 'cancelled':
                return 'Cancelada';
            default:
                return status;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(date);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Citas" />

            <div className="space-y-6 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Gestión de Citas
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            Administra todas las reservas de tus clientes
                        </p>
                    </div>
                    <Button className="gap-2">
                        <CalendarPlus className="h-4 w-4" />
                        Nueva Cita
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Citas Hoy
                                </p>
                                <p className="mt-2 text-3xl font-bold">
                                    {stats.today}
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10">
                                <Calendar className="h-6 w-6 text-cyan-500" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Pendientes
                                </p>
                                <p className="mt-2 text-3xl font-bold">
                                    {stats.pending}
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                                <Clock className="h-6 w-6 text-amber-500" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Confirmadas
                                </p>
                                <p className="mt-2 text-3xl font-bold">
                                    {stats.confirmed}
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                                <Check className="h-6 w-6 text-blue-500" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Completadas
                                </p>
                                <p className="mt-2 text-3xl font-bold">
                                    {stats.completed}
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                                <User className="h-6 w-6 text-green-500" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border bg-card shadow-sm">
                    <div className="border-b p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">
                                Próximas Citas
                            </h2>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                    <Search className="mr-2 h-4 w-4" />
                                    Buscar
                                </Button>
                                <Button variant="outline" size="sm">
                                    Filtrar
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {bookings.length === 0 ? (
                            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center">
                                <Calendar className="mb-4 h-16 w-16 text-muted-foreground/50" />
                                <h3 className="mb-2 text-lg font-semibold">
                                    No hay citas programadas
                                </h3>
                                <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                                    Cuando tus clientes hagan reservas,
                                    aparecerán aquí. También puedes crear citas
                                    manualmente.
                                </p>
                                <Button>
                                    <CalendarPlus className="mr-2 h-4 w-4" />
                                    Crear Primera Cita
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {bookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="rounded-lg border bg-card p-6 transition-colors hover:bg-accent/5"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-semibold">
                                                        {booking.client_name}
                                                    </h3>
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(booking.status)}`}
                                                    >
                                                        {getStatusLabel(
                                                            booking.status,
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="grid gap-2 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>
                                                            {formatDate(
                                                                booking.booking_date,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4" />
                                                        <span>
                                                            {
                                                                booking.booking_time
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4" />
                                                        <span>
                                                            {booking.service}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4" />
                                                        <span>
                                                            {
                                                                booking.client_phone
                                                            }
                                                        </span>
                                                    </div>
                                                    {booking.client_email && (
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="h-4 w-4" />
                                                            <span>
                                                                {
                                                                    booking.client_email
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                    {booking.notes && (
                                                        <div className="mt-2 rounded-md bg-muted/50 p-3">
                                                            <p className="text-sm">
                                                                <strong>
                                                                    Notas:
                                                                </strong>{' '}
                                                                {booking.notes}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="ml-4 flex gap-2">
                                                {booking.status ===
                                                    'pending' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            className="gap-2 cursor-pointer"
                                                            onClick={() =>
                                                                updateBookingStatus(
                                                                    booking.id,
                                                                    'confirmed',
                                                                )
                                                            }
                                                        >
                                                            <Check className="h-4 w-4" />
                                                            Confirmar
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            className="gap-2 cursor-pointer"
                                                            onClick={() =>
                                                                updateBookingStatus(
                                                                    booking.id,
                                                                    'cancelled',
                                                                )
                                                            }
                                                        >
                                                            <X className="h-4 w-4" />
                                                            Rechazar
                                                        </Button>
                                                    </>
                                                )}
                                                {booking.status ===
                                                    'confirmed' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-2 cursor-pointer"
                                                        onClick={() =>
                                                            updateBookingStatus(
                                                                booking.id,
                                                                'completed',
                                                            )
                                                        }
                                                    >
                                                        <Check className="h-4 w-4" />
                                                        Completar
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border-l-4 border-l-primary bg-primary/5 p-4">
                    <p className="text-sm">
                        <strong className="font-semibold">
                            Próximamente:
                        </strong>{' '}
                        Calendario interactivo, notificaciones automáticas,
                        recordatorios por email y WhatsApp, y mucho más.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
