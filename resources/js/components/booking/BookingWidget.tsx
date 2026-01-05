import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { FaCalendarAlt, FaClock, FaUser, FaPhone, FaEnvelope, FaCheckCircle, FaInstagram, FaFacebook, FaTiktok, FaWhatsapp } from 'react-icons/fa';

interface BookingConfig {
    profileId: number;
    businessName: string;
    services?: string[];
    accentColor?: string;
    socialLinks?: {
        instagram?: string;
        facebook?: string;
        tiktok?: string;
        whatsapp?: string;
    };
}

interface BookingWidgetProps {
    config: BookingConfig;
    className?: string;
}

export const BookingWidget: React.FC<BookingWidgetProps> = ({
    config,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedService, setSelectedService] = useState('');
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingData, setBookingData] = useState<any>(null);
    const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    const accentColor = config.accentColor || '#ef4444';

    // Fetch occupied slots when date changes
    useEffect(() => {
        if (selectedDate) {
            fetchOccupiedSlots();
        } else {
            setOccupiedSlots([]);
        }
    }, [selectedDate]);

    const fetchOccupiedSlots = async () => {
        setLoadingSlots(true);
        try {
            const response = await fetch(
                `/api/bookings/occupied-slots?profile_id=${config.profileId}&date=${selectedDate}`
            );
            const result = await response.json();

            if (result.success) {
                setOccupiedSlots(result.data);
            }
        } catch (error) {
            console.error('Error fetching occupied slots:', error);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleBooking = async () => {
        if (!selectedDate || !selectedTime || !clientName || !clientPhone) {
            alert('Por favor completa todos los campos requeridos (Nombre, Teléfono, Fecha y Hora)');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Asegúrate de que esto coincida con tu meta tag en el layout principal
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    profile_id: config.profileId,
                    client_name: clientName,
                    client_phone: clientPhone,
                    client_email: clientEmail,
                    booking_date: selectedDate,
                    booking_time: selectedTime,
                    service: selectedService,
                }),
            });

            const result = await response.json();

            if (result.success) {
                setBookingData(result.data);
                setIsOpen(false);
                setShowConfirmation(true);

                // Reset form
                setSelectedDate('');
                setSelectedTime('');
                setSelectedService('');
                setClientName('');
                setClientPhone('');
                setClientEmail('');
            } else {
                // --- MEJORA AQUÍ ---
                // Si hubo error (ej: horario ocupado), refrescamos los slots visualmente
                if (selectedDate) {
                    await fetchOccupiedSlots(); 
                    setSelectedTime(''); // Desmarcamos la hora que intentó seleccionar
                }
                // -------------------

                if (result.errors) {
                    const errorMessages = Object.values(result.errors).flat().join('\n');
                    alert('No se pudo agendar:\n' + errorMessages);
                } else {
                    alert(result.message || 'Error al crear la reserva');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al procesar la reserva. Por favor intenta nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Generar horarios disponibles
    const timeSlots = [
        '09:00', '10:00', '11:00', '12:00',
        '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
    ];

    // Función para verificar si una hora ya pasó (solo para el día actual)
    const isTimePast = (time: string): boolean => {
        if (!selectedDate) return false;

        const today = new Date().toISOString().split('T')[0];
        if (selectedDate !== today) return false; // Solo bloquear para hoy

        const now = new Date();
        const [hours, minutes] = time.split(':').map(Number);
        const timeDate = new Date();
        timeDate.setHours(hours, minutes, 0, 0);

        return timeDate <= now; // Bloquear si la hora ya pasó
    };

    if (showConfirmation) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
                onClick={() => setShowConfirmation(false)}>
                <div
                    className="bg-gradient-to-br from-gray-900 to-slate-900 rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl
                    transform animate-[slideUp_0.4s_ease-out]"
                    onClick={(e) => e.stopPropagation()}
                    style={{ borderColor: accentColor, borderWidth: '1px' }}
                >
                    {/* Header con animación */}
                    <div className="relative pt-12 pb-8 px-6 text-center">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/50"></div>

                        {/* Checkmark animado */}
                        <div className="relative mb-6">
                            <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center
                                animate-[scaleIn_0.5s_ease-out]"
                                style={{ backgroundColor: `${accentColor}20` }}>
                                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: accentColor }}>
                                    <FaCheckCircle className="text-white" size={48} />
                                </div>
                            </div>
                        </div>

                        {/* Mensaje principal */}
                        <h2 className="text-3xl font-bold text-white mb-2 animate-[fadeIn_0.6s_ease-out]">
                            ¡Reserva Confirmada!
                        </h2>
                        <p className="text-gray-300 text-base animate-[fadeIn_0.7s_ease-out]">
                            Tu cita ha sido agendada exitosamente
                        </p>
                    </div>

                    {/* Detalles de la reserva */}
                    <div className="px-6 pb-6 space-y-4">
                        <div className="bg-gray-800/50 rounded-2xl p-5 space-y-3 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: `${accentColor}20` }}>
                                    <FaUser style={{ color: accentColor }} size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Cliente</p>
                                    <p className="text-white font-semibold">{bookingData?.client_name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: `${accentColor}20` }}>
                                    <FaCalendarAlt style={{ color: accentColor }} size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Fecha</p>
                                    <p className="text-white font-semibold">{bookingData?.booking_date}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: `${accentColor}20` }}>
                                    <FaClock style={{ color: accentColor }} size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Hora</p>
                                    <p className="text-white font-semibold">{bookingData?.booking_time}</p>
                                </div>
                            </div>

                            {bookingData?.service && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: `${accentColor}20` }}>
                                        <FaCheckCircle style={{ color: accentColor }} size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Servicio</p>
                                        <p className="text-white font-semibold">{bookingData?.service}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Redes Sociales */}
                        {config.socialLinks && (
                            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-5 backdrop-blur-sm">
                                <p className="text-white font-semibold mb-3 text-center">
                                    ¡Síguenos en redes sociales!
                                </p>
                                <div className="grid grid-cols-4 gap-3">
                                    {config.socialLinks.instagram && (
                                        <a
                                            href={config.socialLinks.instagram}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="aspect-square rounded-xl bg-gradient-to-br from-purple-600 to-pink-600
                                                flex items-center justify-center hover:scale-110 transition-transform"
                                        >
                                            <FaInstagram className="text-white" size={24} />
                                        </a>
                                    )}
                                    {config.socialLinks.facebook && (
                                        <a
                                            href={config.socialLinks.facebook}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="aspect-square rounded-xl bg-gradient-to-br from-blue-600 to-blue-700
                                                flex items-center justify-center hover:scale-110 transition-transform"
                                        >
                                            <FaFacebook className="text-white" size={24} />
                                        </a>
                                    )}
                                    {config.socialLinks.tiktok && (
                                        <a
                                            href={config.socialLinks.tiktok}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="aspect-square rounded-xl bg-gradient-to-br from-gray-800 to-gray-900
                                                flex items-center justify-center hover:scale-110 transition-transform
                                                ring-2 ring-white/20"
                                        >
                                            <FaTiktok className="text-white" size={24} />
                                        </a>
                                    )}
                                    {config.socialLinks.whatsapp && (
                                        <a
                                            href={config.socialLinks.whatsapp}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="aspect-square rounded-xl bg-gradient-to-br from-green-600 to-green-700
                                                flex items-center justify-center hover:scale-110 transition-transform"
                                        >
                                            <FaWhatsapp className="text-white" size={24} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Botón cerrar */}
                        <button
                            onClick={() => setShowConfirmation(false)}
                            className="w-full py-4 rounded-2xl font-bold text-white transition-all hover:scale-[1.02]"
                            style={{ backgroundColor: accentColor }}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>

                <style>{`
                    @keyframes slideUp {
                        from {
                            opacity: 0;
                            transform: translateY(100px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    @keyframes scaleIn {
                        from {
                            transform: scale(0);
                        }
                        to {
                            transform: scale(1);
                        }
                    }
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
                    }
                `}</style>
            </div>
        );
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className={`booking-widget-trigger w-full flex items-center justify-center gap-3 py-4 md:py-5 rounded-full font-bold text-base
                    shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] ${className}`}
                style={{
                    background: `linear-gradient(135deg, ${accentColor} 0%, #d97706 100%)`,
                    color: '#000000',
                    boxShadow: `0 10px 40px -10px ${accentColor}80, 0 0 20px ${accentColor}40`,
                    border: '1px solid rgba(251, 191, 36, 0.3)'
                }}
                aria-label="Agendar Cita"
            >
                <FaCalendarAlt size={22} />
                <span className="tracking-wide">AGENDAR CITA</span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}>
            <div
                className="bg-gradient-to-b from-slate-900 to-black rounded-3xl w-full max-w-md max-h-[85vh]
                    overflow-y-auto shadow-2xl transform animate-[slideUpSmooth_0.3s_ease-out] scrollbar-hide"
                onClick={(e) => e.stopPropagation()}
                style={{
                    border: `2px solid ${accentColor}`,
                    boxShadow: `0 0 40px ${accentColor}40, 0 20px 60px rgba(0,0,0,0.5)`
                }}
            >
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-b from-slate-900 to-slate-900/95 backdrop-blur-sm px-6 py-4 rounded-t-3xl z-10"
                    style={{ borderBottom: `1px solid ${accentColor}30` }}>
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FaCalendarAlt style={{ color: accentColor }} />
                            Agenda tu Cita
                        </h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-white text-3xl w-10 h-10 flex items-center justify-center
                                transition-all hover:bg-white/5 rounded-full"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Form */}
                <div className="p-6 space-y-5">
                    {/* Nombre */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold mb-2"
                            style={{ color: accentColor }}>
                            <FaUser size={14} />
                            Tu Nombre *
                        </label>
                        <input
                            type="text"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            placeholder="Ej: Juan Pérez"
                            className="w-full px-4 py-3 rounded-xl bg-slate-800/50 backdrop-blur-sm
                                text-white placeholder-gray-500 focus:outline-none transition-all"
                            style={{
                                border: clientName ? `2px solid ${accentColor}` : '1px solid rgba(255,255,255,0.1)',
                                boxShadow: clientName ? `0 0 15px ${accentColor}30` : 'none'
                            }}
                        />
                    </div>

                    {/* Teléfono */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold mb-2"
                            style={{ color: accentColor }}>
                            <FaPhone size={14} />
                            Teléfono *
                        </label>
                        <input
                            type="tel"
                            value={clientPhone}
                            onChange={(e) => setClientPhone(e.target.value)}
                            placeholder="Ej: +51 987 654 321"
                            className="w-full px-4 py-3 rounded-xl bg-slate-800/50 backdrop-blur-sm
                                text-white placeholder-gray-500 focus:outline-none transition-all"
                            style={{
                                border: clientPhone ? `2px solid ${accentColor}` : '1px solid rgba(255,255,255,0.1)',
                                boxShadow: clientPhone ? `0 0 15px ${accentColor}30` : 'none'
                            }}
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
                            <FaEnvelope size={14} style={{ color: accentColor }} />
                            Email (Opcional)
                        </label>
                        <input
                            type="email"
                            value={clientEmail}
                            onChange={(e) => setClientEmail(e.target.value)}
                            placeholder="Ej: juan@ejemplo.com"
                            className="w-full px-4 py-3 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-white/10
                                text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all"
                            style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                        />
                    </div>

                    {/* Servicio */}
                    {config.services && config.services.length > 0 && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-200 mb-2">
                                Servicio (Opcional)
                            </label>
                            <select
                                value={selectedService}
                                onChange={(e) => setSelectedService(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700
                                    text-white focus:outline-none focus:ring-2 transition-all"
                                style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                            >
                                <option value="">Selecciona un servicio</option>
                                {config.services.map((service, idx) => (
                                    <option key={idx} value={service}>{service}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Fecha */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
                            <FaCalendarAlt size={14} style={{ color: accentColor }} />
                            Fecha *
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700
                                text-white focus:outline-none focus:ring-2 transition-all"
                            style={{
                                '--tw-ring-color': accentColor,
                                borderColor: selectedDate ? accentColor : undefined
                            } as React.CSSProperties}
                        />
                    </div>

                    {/* Hora */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
                            <FaClock size={14} style={{ color: accentColor }} />
                            Hora *
                        </label>
                        {loadingSlots ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-6 h-6 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-3 text-gray-400">Cargando horarios...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {timeSlots.map((time) => {
                                    const isOccupied = occupiedSlots.includes(time);
                                    const isPast = isTimePast(time);
                                    const isBlocked = isOccupied || isPast;
                                    const isSelected = selectedTime === time;

                                    return (
                                        <button
                                            key={time}
                                            onClick={() => !isBlocked && setSelectedTime(time)}
                                            disabled={isBlocked}
                                            className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all
                                                ${isBlocked
                                                    ? 'bg-gray-700/40 text-gray-500 cursor-not-allowed'
                                                    : isSelected
                                                        ? 'text-white shadow-lg'
                                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 active:scale-95'
                                                }`}
                                            style={isSelected && !isBlocked ? {
                                                backgroundColor: accentColor,
                                                boxShadow: `0 4px 15px ${accentColor}40`
                                            } : {}}
                                        >
                                            {time}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Botón de Confirmar */}
                    <button
                        onClick={handleBooking}
                        disabled={!selectedDate || !selectedTime || !clientName || !clientPhone || isSubmitting}
                        className="w-full flex items-center justify-center gap-3 py-4 rounded-xl
                            font-bold text-white shadow-lg transition-all hover:scale-[1.02]
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        style={{ backgroundColor: accentColor }}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Procesando...</span>
                            </>
                        ) : (
                            <>
                                <FaCheckCircle size={20} />
                                <span>Confirmar Reserva</span>
                            </>
                        )}
                    </button>
                </div>

                <style>{`
                    @keyframes slideUpSmooth {
                        from {
                            opacity: 0;
                            transform: translateY(50px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default BookingWidget;
