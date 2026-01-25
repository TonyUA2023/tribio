import React, { useState, useEffect } from 'react';
import {
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaEnvelope,
  FaCheckCircle,
  FaSpinner,
  FaWhatsapp,
  FaTimes,
  FaCut,
  FaChevronDown,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// Configuración de países con códigos y validación de dígitos
const COUNTRY_CODES = [
  { code: '+51', country: 'PE', flag: '🇵🇪', name: 'Perú', nameEn: 'Peru', digits: 9 },
  { code: '+1', country: 'US', flag: '🇺🇸', name: 'Estados Unidos', nameEn: 'United States', digits: 10 },
  { code: '+52', country: 'MX', flag: '🇲🇽', name: 'México', nameEn: 'Mexico', digits: 10 },
  { code: '+57', country: 'CO', flag: '🇨🇴', name: 'Colombia', nameEn: 'Colombia', digits: 10 },
  { code: '+54', country: 'AR', flag: '🇦🇷', name: 'Argentina', nameEn: 'Argentina', digits: 10 },
  { code: '+56', country: 'CL', flag: '🇨🇱', name: 'Chile', nameEn: 'Chile', digits: 9 },
  { code: '+593', country: 'EC', flag: '🇪🇨', name: 'Ecuador', nameEn: 'Ecuador', digits: 9 },
  { code: '+591', country: 'BO', flag: '🇧🇴', name: 'Bolivia', nameEn: 'Bolivia', digits: 8 },
  { code: '+34', country: 'ES', flag: '🇪🇸', name: 'España', nameEn: 'Spain', digits: 9 },
];

// Traducciones
interface Translations {
  bookAppointment: string;
  scheduleYourAppointment: string;
  selectDate: string;
  selectTime: string;
  loadingTimes: string;
  service: string;
  selectService: string;
  yourInfo: string;
  fullName: string;
  phone: string;
  email: string;
  optional: string;
  required: string;
  howToReceiveConfirmation: string;
  confirmAppointment: string;
  processing: string;
  appointmentConfirmed: string;
  confirmationVia: string;
  perfect: string;
  digitsRequired: string;
  phoneValidationError: string;
  fillRequiredFields: string;
  emailRequiredError: string;
  errorProcessing: string;
  couldNotSchedule: string;
}

const translations: Record<'es' | 'en', Translations> = {
  es: {
    bookAppointment: 'Agendar Cita',
    scheduleYourAppointment: 'Agenda Tu Cita',
    selectDate: 'Selecciona una Fecha',
    selectTime: 'Elige Tu Horario',
    loadingTimes: 'Cargando horarios...',
    service: 'Servicio',
    selectService: 'Seleccionar servicio...',
    yourInfo: 'Tus Datos',
    fullName: 'Nombre Completo',
    phone: 'Teléfono',
    email: 'Email',
    optional: 'opcional',
    required: '*',
    howToReceiveConfirmation: '¿Cómo quieres recibir la confirmación?',
    confirmAppointment: 'Confirmar Cita',
    processing: 'Procesando tu cita...',
    appointmentConfirmed: '¡Cita Confirmada!',
    confirmationVia: 'Te enviaremos la confirmación vía',
    perfect: 'Perfecto',
    digitsRequired: 'dígitos',
    phoneValidationError: 'El número debe tener {digits} dígitos para {country}',
    fillRequiredFields: 'Por favor completa todos los campos obligatorios.',
    emailRequiredError: 'El email es obligatorio si eliges recibir notificaciones por correo.',
    errorProcessing: 'Error al procesar la reserva. Por favor intenta nuevamente.',
    couldNotSchedule: 'No se pudo agendar:',
  },
  en: {
    bookAppointment: 'Book Appointment',
    scheduleYourAppointment: 'Schedule Your Appointment',
    selectDate: 'Select a Date',
    selectTime: 'Choose Your Time',
    loadingTimes: 'Loading times...',
    service: 'Service',
    selectService: 'Select a service...',
    yourInfo: 'Your Information',
    fullName: 'Full Name',
    phone: 'Phone',
    email: 'Email',
    optional: 'optional',
    required: '*',
    howToReceiveConfirmation: 'How would you like to receive confirmation?',
    confirmAppointment: 'Confirm Appointment',
    processing: 'Processing your appointment...',
    appointmentConfirmed: 'Appointment Confirmed!',
    confirmationVia: 'We will send confirmation via',
    perfect: 'Perfect',
    digitsRequired: 'digits',
    phoneValidationError: 'Phone must have {digits} digits for {country}',
    fillRequiredFields: 'Please fill in all required fields.',
    emailRequiredError: 'Email is required if you choose to receive notifications by email.',
    errorProcessing: 'Error processing reservation. Please try again.',
    couldNotSchedule: 'Could not schedule:',
  },
};

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
  language?: 'es' | 'en';
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
  const [countryCode, setCountryCode] = useState('+51'); // Perú por defecto
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [notificationChannel, setNotificationChannel] =
    useState<'whatsapp' | 'email'>('email');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const accentColor = config.accentColor || '#ef4444';
  const language = config.language || 'es';
  const t = translations[language];
  const isEmailRequired = notificationChannel === 'email';

  // Obtener configuración del país seleccionado
  const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0];
  const isPhoneValid = clientPhone.length === selectedCountry.digits;

  // Validar número de teléfono
  const validatePhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== selectedCountry.digits) {
      const countryName = language === 'en' ? selectedCountry.nameEn : selectedCountry.name;
      setPhoneError(
        t.phoneValidationError
          .replace('{digits}', String(selectedCountry.digits))
          .replace('{country}', countryName)
      );
      return false;
    }
    setPhoneError(null);
    return true;
  };

  // Manejar cambio de teléfono (solo números)
  const handlePhoneChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, selectedCountry.digits);
    setClientPhone(cleanValue);
    if (cleanValue.length > 0) {
      validatePhone(cleanValue);
    } else {
      setPhoneError(null);
    }
  };

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
      disabled: false,
      comingSoon: false,
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
      alert(t.fillRequiredFields);
      return;
    }
    if (!validatePhone(clientPhone)) {
      return;
    }
    if (isEmailRequired && !clientEmail) {
      alert(t.emailRequiredError);
      return;
    }

    setIsSubmitting(true);

    try {
      // Construir número completo con código de país (sin el +)
      const fullPhone = countryCode.replace('+', '') + clientPhone;

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
          client_phone: fullPhone,
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
        setPhoneError(null);
      } else {
        if (selectedDate) {
          await fetchOccupiedSlots();
          setSelectedTime('');
        }

        if (result.errors) {
          const errorMessages = Object.values(result.errors)
            .flat()
            .join('\n');
          alert(t.couldNotSchedule + '\n' + errorMessages);
        } else {
          alert(result.message || t.errorProcessing);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert(t.errorProcessing);
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
                {t.appointmentConfirmed}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-gray-300 leading-relaxed"
              >
                {t.confirmationVia}{' '}
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
                {t.perfect}
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // 2. Botón flotante - Book Appointment
  if (!isOpen) {
    return (
      <div className={`${className}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold tracking-wide text-black shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] booking-widget-trigger"
          style={{
            background: `linear-gradient(135deg, ${accentColor} 0%, #d97706 100%)`,
            boxShadow: `0 10px 40px -10px ${accentColor}80, 0 0 20px ${accentColor}40`,
            border: '1px solid rgba(251, 191, 36, 0.3)',
          }}
        >
          <FaCalendarAlt className="text-sm" />
          <span className="uppercase text-xs">{t.bookAppointment}</span>
        </button>
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
                  <h2 className="text-lg font-bold text-white">{t.scheduleYourAppointment}</h2>
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
              {t.selectDate}
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
                {t.selectTime}
              </label>
              {loadingSlots ? (
                <div className="py-8 text-center">
                  <FaSpinner className="inline animate-spin text-2xl" style={{ color: accentColor }} />
                  <p className="mt-3 text-sm text-gray-400">{t.loadingTimes}</p>
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
                {t.service} ({t.optional})
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition-all focus:border-white/20 focus:bg-white/10 text-base appearance-none cursor-pointer"
                style={{ colorScheme: 'dark' }}
              >
                <option value="">{t.selectService}</option>
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
            <h3 className="text-sm font-bold text-white mb-4">{t.yourInfo}</h3>

            <div>
              <label className="mb-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
                {t.fullName} {t.required}
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
                  placeholder={language === 'en' ? 'John Doe' : 'Juan Pérez'}
                />
              </div>
            </div>

            {/* Teléfono con selector de país */}
            <div>
              <label className="mb-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
                {t.phone} {t.required}
              </label>
              <div className="flex gap-2">
                {/* Selector de código de país */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryPicker(!showCountryPicker)}
                    className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-2xl py-4 px-3 text-white hover:border-white/20 transition-colors min-w-[100px]"
                  >
                    <span className="text-lg">{selectedCountry.flag}</span>
                    <span className="text-sm font-medium">{selectedCountry.code}</span>
                    <FaChevronDown className="text-gray-500 text-xs ml-auto" />
                  </button>

                  {/* Dropdown de países */}
                  {showCountryPicker && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-[#111] border border-white/10 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                      {COUNTRY_CODES.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            setCountryCode(country.code);
                            setClientPhone('');
                            setShowCountryPicker(false);
                            setPhoneError(null);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors ${
                            countryCode === country.code ? 'bg-white/10' : ''
                          }`}
                        >
                          <span className="text-lg">{country.flag}</span>
                          <span className="text-white text-sm flex-1 text-left">
                            {language === 'en' ? country.nameEn : country.name}
                          </span>
                          <span className="text-gray-400 text-xs">{country.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Input de teléfono */}
                <div className="flex-1 relative">
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder={`${selectedCountry.digits} ${t.digitsRequired}`}
                    maxLength={selectedCountry.digits}
                    className={`w-full bg-white/5 border rounded-2xl py-4 px-4 text-white focus:outline-none transition-colors text-sm font-mono tracking-wider ${
                      phoneError ? 'border-red-500/50' : isPhoneValid ? 'border-green-500/50' : 'border-white/10 focus:border-white/20'
                    }`}
                    value={clientPhone}
                    onChange={e => handlePhoneChange(e.target.value)}
                  />
                  {/* Indicador de dígitos */}
                  <span className={`absolute right-3 top-4 text-xs ${
                    isPhoneValid ? 'text-green-500' : 'text-gray-500'
                  }`}>
                    {clientPhone.length}/{selectedCountry.digits}
                  </span>
                </div>
              </div>

              {/* Mensaje de error de teléfono */}
              {phoneError && (
                <p className="text-red-400 text-xs mt-1.5 ml-1">{phoneError}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
                {t.email} {isEmailRequired ? t.required : `(${t.optional})`}
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
                  placeholder={t.optional}
                />
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
              {t.howToReceiveConfirmation}
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
                        Próximamente
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
            disabled={isSubmitting || !isPhoneValid}
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
                <span>{t.processing}</span>
              </>
            ) : (
              <>
                <FaCheckCircle className="text-lg" />
                <span>{t.confirmAppointment}</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Click outside to close country picker */}
      {showCountryPicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowCountryPicker(false)}
        />
      )}
    </motion.div>
    </AnimatePresence>
  );
};

export default BookingWidget;
