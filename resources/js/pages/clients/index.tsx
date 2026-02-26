import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import MlInsightCard, { type MlPrediction } from '@/components/MlInsightCard';
import {
    Bell,
    Calendar,
    Check,
    Clock,
    Mail,
    MessageSquare,
    Phone,
    Search,
    User,
    UserPlus,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Clientes',
        href: '/clients',
    },
];

interface Booking {
    id: number;
    booking_date: string;
    booking_time: string;
    service: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string;
}

interface Client {
    name: string;
    email: string;
    phone: string;
    total_bookings: number;
    last_booking_date: string;
    first_booking_date: string;
    pending_count: number;
    confirmed_count: number;
    completed_count: number;
    cancelled_count: number;
    days_since_last?: number;
    cancellation_rate?: number;
    ml_churn?: MlPrediction | null;
    bookings: Booking[];
}

interface Stats {
    total_clients: number;
    active_clients: number;
    total_bookings: number;
}

interface ClientsIndexProps {
    stats: Stats;
    clients: Client[];
}

export default function ClientsIndex({ stats, clients }: ClientsIndexProps) {
    const [expandedClient, setExpandedClient] = useState<string | null>(null);

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
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        }).format(date);
    };

    const toggleClientDetails = (clientEmail: string) => {
        if (expandedClient === clientEmail) {
            setExpandedClient(null);
        } else {
            setExpandedClient(clientEmail);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Clientes" />

            <div className="space-y-6 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Gestión de Clientes
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            Administra tu base de clientes y notificaciones
                        </p>
                    </div>
                    <Button className="gap-2" disabled>
                        <UserPlus className="h-4 w-4" />
                        Nuevo Cliente
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Total Clientes
                                </p>
                                <p className="mt-2 text-3xl font-bold">
                                    {stats.total_clients}
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10">
                                <Users className="h-6 w-6 text-cyan-500" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Clientes Activos
                                </p>
                                <p className="mt-2 text-3xl font-bold">
                                    {stats.active_clients}
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                                <UserPlus className="h-6 w-6 text-green-500" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Total Reservas
                                </p>
                                <p className="mt-2 text-3xl font-bold">
                                    {stats.total_bookings}
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                                <Calendar className="h-6 w-6 text-purple-500" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-lg border bg-card shadow-sm">
                        <div className="border-b p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">
                                    Lista de Clientes
                                </h2>
                                <Button variant="outline" size="sm">
                                    <Search className="mr-2 h-4 w-4" />
                                    Buscar
                                </Button>
                            </div>
                        </div>

                        <div className="p-6">
                            {clients.length === 0 ? (
                                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center">
                                    <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
                                    <h3 className="mb-2 text-lg font-semibold">
                                        No hay clientes registrados
                                    </h3>
                                    <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                                        Los clientes se registrarán
                                        automáticamente al hacer una reserva
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {clients.map((client) => (
                                        <div
                                            key={client.email}
                                            className="rounded-lg border bg-card transition-colors hover:bg-accent/5"
                                        >
                                            <div
                                                className="cursor-pointer p-4"
                                                onClick={() =>
                                                    toggleClientDetails(
                                                        client.email,
                                                    )
                                                }
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10">
                                                                <User className="h-5 w-5 text-cyan-500" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold">
                                                                    {client.name}
                                                                </h3>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Cliente desde{' '}
                                                                    {formatDate(
                                                                        client.first_booking_date,
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="grid gap-1 text-sm text-muted-foreground">
                                                            <div className="flex items-center gap-2">
                                                                <Phone className="h-3 w-3" />
                                                                <span>
                                                                    {
                                                                        client.phone
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Mail className="h-3 w-3" />
                                                                <span>
                                                                    {
                                                                        client.email
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-cyan-500">
                                                            {
                                                                client.total_bookings
                                                            }
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            reservas
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-3 flex gap-2">
                                                    <span className="rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-600">
                                                        {client.pending_count}{' '}
                                                        pendiente
                                                        {client.pending_count !==
                                                            1 && 's'}
                                                    </span>
                                                    <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-600">
                                                        {client.confirmed_count}{' '}
                                                        confirmada
                                                        {client.confirmed_count !==
                                                            1 && 's'}
                                                    </span>
                                                    <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600">
                                                        {client.completed_count}{' '}
                                                        completada
                                                        {client.completed_count !==
                                                            1 && 's'}
                                                    </span>
                                                </div>

                                                {/* Predicción ML M2 — Riesgo de Churn */}
                                                {client.ml_churn && (
                                                    <MlInsightCard
                                                        title="Riesgo de No Regresar"
                                                        prediction={client.ml_churn}
                                                        className="mt-3"
                                                        compact
                                                    />
                                                )}
                                            </div>

                                            {expandedClient === client.email && (
                                                <div className="border-t bg-muted/30 p-4">
                                                    <h4 className="mb-3 text-sm font-semibold">
                                                        Historial de Reservas
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {client.bookings.map(
                                                            (booking) => (
                                                                <div
                                                                    key={
                                                                        booking.id
                                                                    }
                                                                    className="rounded-md border bg-card p-3"
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex-1 space-y-1">
                                                                            <div className="flex items-center gap-2 text-sm">
                                                                                <Calendar className="h-3 w-3" />
                                                                                <span>
                                                                                    {formatDate(
                                                                                        booking.booking_date,
                                                                                    )}
                                                                                </span>
                                                                                <Clock className="ml-2 h-3 w-3" />
                                                                                <span>
                                                                                    {
                                                                                        booking.booking_time
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                            <div className="text-sm font-medium">
                                                                                {
                                                                                    booking.service
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                        <span
                                                                            className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(booking.status)}`}
                                                                        >
                                                                            {getStatusLabel(
                                                                                booking.status,
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card shadow-sm">
                        <div className="border-b p-6">
                            <h2 className="text-xl font-semibold">
                                Notificaciones
                            </h2>
                        </div>

                        <div className="space-y-4 p-6">
                            <div className="space-y-2">
                                <h3 className="font-medium">
                                    Canales Disponibles
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                                                <Mail className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    Email
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Confirmaciones y
                                                    recordatorios
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled
                                        >
                                            Configurar
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                                                <MessageSquare className="h-5 w-5 text-green-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    WhatsApp
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Mensajes instantáneos
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled
                                        >
                                            Configurar
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg bg-muted p-4">
                                <p className="text-sm text-muted-foreground">
                                    Las notificaciones automáticas te permiten
                                    mantener informados a tus clientes sobre sus
                                    reservas, cambios y recordatorios.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border-l-4 border-l-primary bg-primary/5 p-4">
                    <p className="text-sm">
                        <strong className="font-semibold">
                            Próximamente:
                        </strong>{' '}
                        Historial completo de citas por cliente, segmentación
                        de clientes, campañas de notificaciones masivas, y más.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
