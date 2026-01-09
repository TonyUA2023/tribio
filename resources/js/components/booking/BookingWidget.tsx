import React, { useState, useEffect } from 'react';
import {
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCheckCircle,
  FaSpinner,
  FaWhatsapp,
  FaCommentDots,
  FaTimes,
  FaCut,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

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
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Estados del Formulario
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState('');

  // Datos del Cliente
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [notificationChannel, setNotificationChannel] =
    useState<'whatsapp' | 'sms' | 'email'>('email');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const accentColor = config.accentColor || '#ef4444';
  const isEmailRequired = notificationChannel === 'email';

  const channels = [
    {
      id: 'email',
      label: 'Email',
      icon: <FaEnvelope size={14} />,
      color: '#ef4444',
      disabled: false,
      comingSoon: false,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: <FaWhatsapp size={14} />,
      color: '#25D366',
      disabled: true,
      comingSoon: true,
    },
    {
      id: 'sms',
      label: 'SMS',
      icon: <FaCommentDots size={14} />,
      color: '#3b82f6',
      disabled: true,
      comingSoon: true,
    },
  ] as const;

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
        `/api/bookings/occupied-slots?profile_id=${config.profileId}&date=${selectedDate}`,
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
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }
    if (isEmailRequired && !clientEmail) {
      alert(
        'El email es obligatorio si eliges recibir notificaciones por correo.',
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN':
            document
              .querySelector('meta[name="csrf-token"]')
              ?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          profile_id: config.profileId,
          client_name: clientName,
          client_phone: clientPhone,
          client_email: clientEmail,
          booking_date: selectedDate,
          booking_time: selectedTime,
          service: selectedService,
          notification_channel: notificationChannel,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setBookingData(result.data);
        setIsOpen(false);
        setShowConfirmation(true);

        setSelectedDate('');
        setSelectedTime('');
        setSelectedService('');
        setClientName('');
        setClientPhone('');
        setClientEmail('');
      } else {
        if (selectedDate) {
          await fetchOccupiedSlots();
          setSelectedTime('');
        }

        if (result.errors) {
          const errorMessages = Object.values(result.errors)
            .flat()
            .join('\n');
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

  const timeSlots = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
  ];

  const isTimePast = (time: string): boolean => {
    if (!selectedDate) return false;
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate !== today) return false;
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const timeDate = new Date();
    timeDate.setHours(hours, minutes, 0, 0);
    return timeDate <= now;
  };

  // ========== RENDER ==========

  // 1. Pantalla de confirmación
  if (showConfirmation) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-lg p-4"
          onClick={() => setShowConfirmation(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-sm overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              border: `1px solid ${accentColor}40`,
              boxShadow: `0 0 60px ${accentColor}30, 0 20px 60px -20px rgba(0,0,0,0.8)`
            }}
          >
            <div className="relative px-6 pt-12 pb-6 text-center">
              {/* Círculo animado con check */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', damping: 10 }}
                  className="flex h-20 w-20 items-center justify-center rounded-full"
                  style={{ backgroundColor: accentColor }}
                >
                  <FaCheckCircle className="text-white" size={40} />
                </motion.div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-3 text-2xl font-bold text-white"
              >
                Appointment Confirmed!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-gray-300 leading-relaxed"
              >
                We will send you the confirmation via{' '}
                <span
                  className="font-bold uppercase px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                >
                  {notificationChannel}
                </span>
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-6 border-t border-white/5"
            >
              <button
                onClick={() => setShowConfirmation(false)}
                className="w-full rounded-2xl py-4 text-base font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 10px 30px -10px ${accentColor}60`
                }}
              >
                Perfect
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // 2. Botones flotantes - Book Appointment y Contact Us
  if (!isOpen) {
    const whatsappNumber = config.socialLinks?.whatsapp || '';

    const handleContactUs = () => {
      if (!whatsappNumber) {
        alert('WhatsApp number not configured');
        return;
      }

      // Create WhatsApp message with business info
      const message = encodeURIComponent(
        `Hello ${config.businessName}! I would like to get in touch with you.`
      );
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    };

    return (
      <div className={`flex gap-2 ${className}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold tracking-wide text-black shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, ${accentColor} 0%, #d97706 100%)`,
            boxShadow: `0 10px 40px -10px ${accentColor}80, 0 0 20px ${accentColor}40`,
            border: '1px solid rgba(251, 191, 36, 0.3)',
          }}
        >
          <FaCalendarAlt className="text-sm" />
          <span className="uppercase text-xs">Book Appointment</span>
        </button>

        {whatsappNumber && (
          <button
            onClick={handleContactUs}
            className="flex-1 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold tracking-wide text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] bg-emerald-500"
            style={{
              boxShadow: '0 10px 40px -10px rgba(16, 185, 129, 0.5), 0 0 20px rgba(16, 185, 129, 0.25)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            <FaWhatsapp className="text-sm" />
            <span className="uppercase text-xs">Contact Us</span>
          </button>
        )}
      </div>
    );
  }

  // 3. Modal formulario
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-lg sm:p-4"
        onClick={() => setIsOpen(false)}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="w-full max-w-lg max-h-[95vh] overflow-hidden rounded-t-[32px] sm:rounded-[32px] bg-[#0a0a0a] shadow-2xl border border-white/10"
          onClick={(e) => e.stopPropagation()}
          style={{
            boxShadow: `0 -10px 80px ${accentColor}20, 0 0 0 1px ${accentColor}20`,
          }}
        >
          {/* Header Mejorado */}
          <div className="sticky top-0 z-10 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a] to-transparent backdrop-blur-xl border-b border-white/5">
            <div className="flex items-center justify-between px-6 py-5">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${accentColor}15` }}
                >
                  <FaCalendarAlt size={18} style={{ color: accentColor }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Book Your Appointment</h2>
                  <p className="text-xs text-gray-500">{config.businessName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center"
              >
                <FaTimes size={16} />
              </button>
            </div>
          </div>

        {/* Body - Scrollable */}
        <div className="overflow-y-auto px-6 py-6 space-y-6" style={{ maxHeight: 'calc(95vh - 200px)' }}>
          {/* Fecha */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-300">
              <FaCalendarAlt size={14} style={{ color: accentColor }} />
              Select a Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition-all focus:border-white/20 focus:bg-white/10 text-base"
                style={{
                  colorScheme: 'dark',
                }}
              />
            </div>
          </motion.div>

          {/* Horario */}
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-300">
                <FaClock size={14} style={{ color: accentColor }} />
                Choose Your Time
              </label>
              {loadingSlots ? (
                <div className="py-8 text-center">
                  <FaSpinner className="inline animate-spin text-2xl" style={{ color: accentColor }} />
                  <p className="mt-3 text-sm text-gray-400">Loading times...</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2.5">
                  {timeSlots.map((time) => {
                    const isOccupied = occupiedSlots.includes(time.substring(0, 5));
                    const isPast = isTimePast(time);
                    const isBlocked = isOccupied || isPast;
                    const isSelected = selectedTime === time;
                    return (
                      <motion.button
                        key={time}
                        disabled={isBlocked}
                        onClick={() => setSelectedTime(time)}
                        whileHover={{ scale: isBlocked ? 1 : 1.05 }}
                        whileTap={{ scale: isBlocked ? 1 : 0.95 }}
                        className={`rounded-xl py-3 text-sm font-bold transition-all ${
                          isBlocked
                            ? 'cursor-not-allowed bg-red-500/10 text-red-500/40 line-through border border-red-500/20'
                            : isSelected
                            ? 'text-white shadow-lg border-2'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                        }`}
                        style={
                          isSelected && !isBlocked
                            ? {
                                backgroundColor: accentColor,
                                borderColor: accentColor,
                                boxShadow: `0 4px 20px ${accentColor}40`
                              }
                            : {}
                        }
                      >
                        {time}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Servicio */}
          {config.services && config.services.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-300">
                <FaCut size={14} style={{ color: accentColor }} />
                Service (optional)
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition-all focus:border-white/20 focus:bg-white/10 text-base appearance-none cursor-pointer"
                style={{ colorScheme: 'dark' }}
              >
                <option value="">Select service...</option>
                {config.services.map((svc, i) => (
                  <option key={i} value={svc}>
                    {svc}
                  </option>
                ))}
              </select>
            </motion.div>
          )}

          <div className="border-t border-white/5" />

          {/* Datos personales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-bold text-white mb-4">Your Information</h3>

            <div>
              <label className="mb-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <FaUser size={16} />
                </div>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-5 py-4 text-white outline-none transition-all focus:border-white/20 focus:bg-white/10 placeholder:text-gray-600"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Phone *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <FaPhone size={14} />
                  </div>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 py-4 text-white outline-none transition-all focus:border-white/20 focus:bg-white/10 placeholder:text-gray-600"
                    placeholder="999..."
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Email {isEmailRequired && '*'}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <FaEnvelope size={14} />
                  </div>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className={`w-full rounded-2xl bg-white/5 pl-11 pr-4 py-4 text-white outline-none transition-all placeholder:text-gray-600 ${
                      isEmailRequired && !clientEmail
                        ? 'border-2 border-red-500/60'
                        : 'border border-white/10 focus:border-white/20 focus:bg-white/10'
                    }`}
                    placeholder="optional"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Selector de canal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] p-5 border border-white/10"
          >
            <label className="mb-4 block text-center text-xs font-bold uppercase tracking-wider text-gray-300">
              How would you like to receive confirmation?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {channels.map((ch) => {
                const isSelected = notificationChannel === ch.id;
                const isDisabled = ch.disabled;
                return (
                  <motion.button
                    key={ch.id}
                    onClick={() =>
                      !isDisabled && setNotificationChannel(ch.id as typeof notificationChannel)
                    }
                    whileHover={{ scale: isDisabled ? 1 : 1.05 }}
                    whileTap={{ scale: isDisabled ? 1 : 0.95 }}
                    disabled={isDisabled}
                    className={`relative flex flex-col items-center justify-center rounded-2xl border-2 p-4 text-xs font-bold uppercase transition-all ${
                      isDisabled
                        ? 'border-white/5 bg-white/[0.02] opacity-40 cursor-not-allowed'
                        : isSelected
                        ? 'border-white/30 bg-white/10 shadow-lg'
                        : 'border-white/10 bg-white/5 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <motion.div
                      className="mb-2 text-xl"
                      animate={isSelected && !isDisabled ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                      style={{ color: isSelected && !isDisabled ? ch.color : '#9ca3af' }}
                    >
                      {ch.icon}
                    </motion.div>
                    <span
                      className={isSelected && !isDisabled ? 'text-white' : 'text-gray-500'}
                    >
                      {ch.label}
                    </span>
                    {ch.comingSoon && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                        Coming Soon
                      </span>
                    )}
                    {isSelected && !isDisabled && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -right-1 -top-1 w-3 h-3 rounded-full"
                        style={{ backgroundColor: ch.color }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Footer - Botón fixed */}
        <div className="sticky bottom-0 p-6 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent border-t border-white/5">
          <motion.button
            onClick={handleBooking}
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-base font-bold text-white shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 10px 40px -10px ${accentColor}60, 0 0 0 1px ${accentColor}40`
            }}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin text-lg" />
                <span>Processing your appointment...</span>
              </>
            ) : (
              <>
                <FaCheckCircle className="text-lg" />
                <span>Confirm Appointment</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
    </AnimatePresence>
  );
};

export default BookingWidget;
