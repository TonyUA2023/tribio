import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaUser, FaPhone, FaEnvelope, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaCheck } from 'react-icons/fa';

interface Booking {
    id: number;
    client_name: string;
    client_phone: string | null;
    client_email: string | null;
    booking_date: string;
    booking_time: string;
    service: string | null;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    created_at: string;
}

interface BookingsData {
    data: Booking[];
    current_page: number;
    last_page: number;
    total: number;
}

export default function Bookings({ profileId }: { profileId?: number }) {
    const [bookings, setBookings] = useState<BookingsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        fetchBookings();
    }, [filter]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (profileId) params.append('profile_id', profileId.toString());
            if (filter !== 'all') params.append('status', filter);

            const response = await fetch(`/api/bookings?${params.toString()}`);
            const result = await response.json();

            if (result.success) {
                setBookings(result.data);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateBookingStatus = async (bookingId: number, newStatus: string) => {
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
                fetchBookings(); // Refresh the list
            } else {
                alert('Error al actualizar el estado');
            }
        } catch (error) {
            console.error('Error updating booking:', error);
            alert('Error al actualizar el estado');
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: {
                icon: <FaHourglassHalf size={14} />,
                bg: 'bg-yellow-500/20',
                text: 'text-yellow-400',
                border: 'border-yellow-500/30',
                label: 'Pendiente'
            },
            confirmed: {
                icon: <FaCheckCircle size={14} />,
                bg: 'bg-blue-500/20',
                text: 'text-blue-400',
                border: 'border-blue-500/30',
                label: 'Confirmada'
            },
            completed: {
                icon: <FaCheck size={14} />,
                bg: 'bg-green-500/20',
                text: 'text-green-400',
                border: 'border-green-500/30',
                label: 'Completada'
            },
            cancelled: {
                icon: <FaTimesCircle size={14} />,
                bg: 'bg-red-500/20',
                text: 'text-red-400',
                border: 'border-red-500/30',
                label: 'Cancelada'
            }
        };

        const badge = badges[status as keyof typeof badges] || badges.pending;

        return (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${badge.bg} ${badge.text} border ${badge.border}`}>
                {badge.icon}
                <span className="text-xs font-semibold">{badge.label}</span>
            </div>
        );
    };

    return (
        <AppLayout>
            <Head title="Mis Reservas" />

            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Mis Reservas
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Gestiona las citas agendadas por tus clientes
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all
                                    ${filter === status
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {status === 'all' ? 'Todas' : status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Stats */}
                    {bookings && (
                        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-xl p-4">
                                <p className="text-yellow-600 dark:text-yellow-400 text-sm font-semibold mb-1">Pendientes</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {bookings.data.filter(b => b.status === 'pending').length}
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-4">
                                <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold mb-1">Confirmadas</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {bookings.data.filter(b => b.status === 'confirmed').length}
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-4">
                                <p className="text-green-600 dark:text-green-400 text-sm font-semibold mb-1">Completadas</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {bookings.data.filter(b => b.status === 'completed').length}
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-gray-500/10 to-gray-600/10 border border-gray-500/20 rounded-xl p-4">
                                <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-1">Total</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {bookings.total}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Bookings List */}
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : bookings && bookings.data.length > 0 ? (
                        <div className="grid gap-4">
                            {bookings.data.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                                <FaUser className="text-blue-600" size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                                    {booking.client_name}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Reserva #{booking.id}
                                                </p>
                                            </div>
                                        </div>
                                        {getStatusBadge(booking.status)}
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                                        <div className="flex items-center gap-3">
                                            <FaCalendarAlt className="text-gray-400" size={16} />
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Fecha</p>
                                                <p className="font-semibold text-gray-900 dark:text-white">{booking.booking_date}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <FaClock className="text-gray-400" size={16} />
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Hora</p>
                                                <p className="font-semibold text-gray-900 dark:text-white">{booking.booking_time}</p>
                                            </div>
                                        </div>
                                        {booking.client_phone && (
                                            <div className="flex items-center gap-3">
                                                <FaPhone className="text-gray-400" size={16} />
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Teléfono</p>
                                                    <p className="font-semibold text-gray-900 dark:text-white">{booking.client_phone}</p>
                                                </div>
                                            </div>
                                        )}
                                        {booking.service && (
                                            <div className="flex items-center gap-3">
                                                <FaCheckCircle className="text-gray-400" size={16} />
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Servicio</p>
                                                    <p className="font-semibold text-gray-900 dark:text-white">{booking.service}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    {booking.status === 'pending' && (
                                        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <button
                                                onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                            >
                                                Confirmar
                                            </button>
                                            <button
                                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    )}
                                    {booking.status === 'confirmed' && (
                                        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <button
                                                onClick={() => updateBookingStatus(booking.id, 'completed')}
                                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                                            >
                                                Marcar como Completada
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaCalendarAlt className="text-gray-400" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                No hay reservas
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Cuando los clientes agenden citas, aparecerán aquí
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
