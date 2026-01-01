import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

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
    account: Account;
    profile: Profile | null;
    bookings: Booking[];
    user: User;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function ClientDashboard({ account, profile, bookings, user }: PageProps) {
    const [localBookings, setLocalBookings] = React.useState(bookings);
    const [updatingBookingId, setUpdatingBookingId] = React.useState<number | null>(null);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString: string) => {
        return timeString.substring(0, 5); // HH:mm
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
                // Actualizar el estado local
                setLocalBookings(prevBookings =>
                    prevBookings.map(booking =>
                        booking.id === bookingId
                            ? { ...booking, status: newStatus as any }
                            : booking
                    )
                );
                alert('Estado actualizado exitosamente');
            } else {
                alert('Error al actualizar el estado');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al procesar la solicitud');
        } finally {
            setUpdatingBookingId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'completed':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default:
                return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'Confirmada';
            case 'pending':
                return 'Pendiente';
            case 'cancelled':
                return 'Cancelada';
            case 'completed':
                return 'Completada';
            default:
                return status;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Dashboard - ${account.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">

                {/* Cabecera de Bienvenida */}
                <div className="mb-2">
                    <h1 className="text-3xl font-bold">Hola, {user.name}!</h1>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        Bienvenido a tu panel de control personal
                    </p>
                </div>

                {/* Estadísticas Generales */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
                        <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Tu Plan</h3>
                        <p className="mt-2 text-2xl font-bold">{account.plan?.name ?? 'Sin Plan'}</p>
                        {account.plan && (
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                ${account.plan.price} / {account.plan.billing_cycle === 'monthly' ? 'mes' : 'año'}
                            </p>
                        )}
                    </div>

                    <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
                        <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Estado de Pago</h3>
                        <p className={`mt-2 text-2xl font-bold capitalize ${
                            account.payment_status === 'active' ? 'text-green-600' :
                            account.payment_status === 'due' ? 'text-yellow-600' :
                            'text-red-600'
                        }`}>
                            {account.payment_status === 'active' ? 'Activo' :
                             account.payment_status === 'due' ? 'Pendiente' :
                             'Suspendido'}
                        </p>
                    </div>

                    <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
                        <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Tipo de Cuenta</h3>
                        <p className="mt-2 text-2xl font-bold capitalize">
                            {account.type === 'personal' ? 'Personal' : 'Empresa'}
                        </p>
                    </div>
                </div>

                {/* Tarjeta del Perfil Personal */}
                <div className="relative flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
                    <h3 className="mb-4 text-xl font-semibold">Tu Perfil Digital</h3>

                    {profile ? (
                        <div className="space-y-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="text-lg font-semibold">{profile.name}</h4>
                                    <p className="text-neutral-600 dark:text-neutral-400">{profile.title}</p>
                                    <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                                        Tipo: {profile.render_type === 'custom' ?
                                            '🎨 Diseño Personalizado' :
                                            `📄 Plantilla (${profile.template?.name ?? 'N/A'})`}
                                    </p>
                                </div>
                            </div>

                            {/* URL del Perfil */}
                            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
                                <p className="mb-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                    URL de tu perfil público:
                                </p>
                                <div className="flex items-center justify-between gap-2">
                                    <code className="text-sm text-blue-600 dark:text-blue-400">
                                        {window.location.origin}/{account.slug}/{profile.slug}
                                    </code>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(
                                                `${window.location.origin}/${account.slug}/${profile.slug}`
                                            );
                                            alert('¡URL copiada al portapapeles!');
                                        }}
                                        className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                                    >
                                        Copiar
                                    </button>
                                </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex gap-3">
                                <a
                                    href={`/${account.slug}/${profile.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    👁️ Ver Perfil Público
                                </a>
                                {/*
                                <button className="inline-flex items-center rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700">
                                    ✏️ Editar Perfil
                                </button>
                                */}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-neutral-500 dark:text-neutral-400">
                                Aún no tienes un perfil creado.
                            </p>
                            <p className="mt-2 text-sm text-neutral-400 dark:text-neutral-500">
                                Contacta con el administrador para crear tu perfil digital.
                            </p>
                        </div>
                    )}
                </div>

                {/* Sección de Calendario de Citas */}
                {profile && (
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-xl font-semibold">📅 Próximas Citas</h3>
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {localBookings.length} {localBookings.length === 1 ? 'cita' : 'citas'}
                            </span>
                        </div>

                        {localBookings.length > 0 ? (
                            <div className="space-y-3">
                                {localBookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 transition-all hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-neutral-900 dark:text-white">
                                                        {booking.client_name}
                                                    </h4>
                                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(booking.status)}`}>
                                                        {getStatusLabel(booking.status)}
                                                    </span>
                                                </div>

                                                <div className="mt-2 space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                                                    <p className="flex items-center gap-2">
                                                        <span className="font-medium">📅</span>
                                                        {formatDate(booking.booking_date)}
                                                    </p>
                                                    <p className="flex items-center gap-2">
                                                        <span className="font-medium">🕐</span>
                                                        {formatTime(booking.booking_time)}
                                                    </p>
                                                    {booking.service && (
                                                        <p className="flex items-center gap-2">
                                                            <span className="font-medium">✂️</span>
                                                            {booking.service}
                                                        </p>
                                                    )}
                                                    {booking.client_phone && (
                                                        <p className="flex items-center gap-2">
                                                            <span className="font-medium">📞</span>
                                                            {booking.client_phone}
                                                        </p>
                                                    )}
                                                    {booking.client_email && (
                                                        <p className="flex items-center gap-2">
                                                            <span className="font-medium">📧</span>
                                                            {booking.client_email}
                                                        </p>
                                                    )}
                                                    {booking.notes && (
                                                        <p className="flex items-start gap-2 mt-2 p-2 bg-white rounded dark:bg-neutral-900">
                                                            <span className="font-medium">💬</span>
                                                            <span className="flex-1">{booking.notes}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Botones de acción */}
                                                {booking.status === 'pending' && (
                                                    <div className="mt-4 flex gap-2">
                                                        <button
                                                            onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                                            disabled={updatingBookingId === booking.id}
                                                            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700
                                                                disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                                                        >
                                                            {updatingBookingId === booking.id ? 'Procesando...' : '✓ Aceptar Cita'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                                            disabled={updatingBookingId === booking.id}
                                                            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700
                                                                disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                                                        >
                                                            {updatingBookingId === booking.id ? 'Procesando...' : '✗ Rechazar'}
                                                        </button>
                                                    </div>
                                                )}

                                                {booking.status === 'confirmed' && (
                                                    <div className="mt-4 flex gap-2">
                                                        <button
                                                            onClick={() => handleUpdateStatus(booking.id, 'completed')}
                                                            disabled={updatingBookingId === booking.id}
                                                            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                                                                disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                                                        >
                                                            {updatingBookingId === booking.id ? 'Procesando...' : '✓ Marcar Completada'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                                            disabled={updatingBookingId === booking.id}
                                                            className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700
                                                                disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                                                        >
                                                            ✗ Cancelar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="text-6xl mb-4">📅</div>
                                <p className="text-neutral-500 dark:text-neutral-400">
                                    No tienes citas próximas
                                </p>
                                <p className="mt-2 text-sm text-neutral-400 dark:text-neutral-500">
                                    Las citas reservadas aparecerán aquí automáticamente
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
