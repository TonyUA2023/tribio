import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaTimes,
  FaUser,
  FaEnvelope,
  FaCheckCircle,
  FaSpinner,
  FaWhatsapp,
  FaChevronDown
} from 'react-icons/fa';
import { CartItem } from '@/hooks/useCart';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  total: number;
  accountSlug: string;
  primaryColor?: string;
  onSuccess: () => void;
}

// Configuración de países con códigos y validación de dígitos
const COUNTRY_CODES = [
  { code: '+51', country: 'PE', flag: '🇵🇪', name: 'Perú', digits: 9 },
  { code: '+1', country: 'US', flag: '🇺🇸', name: 'Estados Unidos', digits: 10 },
  { code: '+52', country: 'MX', flag: '🇲🇽', name: 'México', digits: 10 },
  { code: '+57', country: 'CO', flag: '🇨🇴', name: 'Colombia', digits: 10 },
  { code: '+54', country: 'AR', flag: '🇦🇷', name: 'Argentina', digits: 10 },
  { code: '+56', country: 'CL', flag: '🇨🇱', name: 'Chile', digits: 9 },
  { code: '+593', country: 'EC', flag: '🇪🇨', name: 'Ecuador', digits: 9 },
  { code: '+591', country: 'BO', flag: '🇧🇴', name: 'Bolivia', digits: 8 },
  { code: '+34', country: 'ES', flag: '🇪🇸', name: 'España', digits: 9 },
];

const money = (n: number) => `S/ ${n.toFixed(2)}`;

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  total,
  accountSlug,
  primaryColor = '#fbbf24',
  onSuccess
}) => {
  // Estado del Formulario
  const [data, setData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    countryCode: '+51', // Perú por defecto
    notification_channel: 'whatsapp'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Obtener configuración del país seleccionado
  const selectedCountry = COUNTRY_CODES.find(c => c.code === data.countryCode) || COUNTRY_CODES[0];

  // Reiniciar estado al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      setOrderComplete(null);
      setErrorMsg(null);
      setPhoneError(null);
    }
  }, [isOpen]);

  // Validar número de teléfono
  const validatePhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== selectedCountry.digits) {
      setPhoneError(`El número debe tener ${selectedCountry.digits} dígitos para ${selectedCountry.name}`);
      return false;
    }
    setPhoneError(null);
    return true;
  };

  // Manejar cambio de teléfono (solo números)
  const handlePhoneChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, selectedCountry.digits);
    setData({ ...data, phone: cleanValue });
    if (cleanValue.length > 0) {
      validatePhone(cleanValue);
    } else {
      setPhoneError(null);
    }
  };

  if (!isOpen) return null;

  // Opciones de Canales de Notificación
  const channels = [
    { id: 'whatsapp', label: 'WhatsApp', icon: <FaWhatsapp size={24} />, color: '#25D366', desc: 'Te enviaremos un mensaje' },
    { id: 'email', label: 'Email', icon: <FaEnvelope size={24} />, color: '#ef4444', desc: 'Correo electrónico' },
  ];

  const isEmailRequired = data.notification_channel === 'email';
  const isPhoneValid = data.phone.length === selectedCountry.digits;

  const handleConfirmOrder = async () => {
    if (cart.length === 0) return;
    if (!data.name || !data.phone) {
      setErrorMsg('Nombre y teléfono son obligatorios');
      return;
    }
    if (!validatePhone(data.phone)) {
      return;
    }
    if (!data.address || data.address.trim() === '') {
      setErrorMsg('La dirección es obligatoria');
      return;
    }
    if (isEmailRequired && !data.email) {
      setErrorMsg('El email es obligatorio si eliges recibir notificaciones por correo.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      // Construir número completo con código de país (sin el +)
      const fullPhone = data.countryCode.replace('+', '') + data.phone;

      const payload = {
        customer_name: data.name,
        customer_phone: fullPhone,
        customer_email: data.email || null,
        delivery_address: data.address,
        notification_channel: data.notification_channel,
        items: cart.map(item => ({
          id: item.id,
          quantity: item.quantity
        }))
      };

      const response = await axios.post(`/${accountSlug}/checkout`, payload, {
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setOrderComplete(response.data.order_number);
        onSuccess();
      }

    } catch (error: any) {
      console.error("Error Checkout:", error);
      setErrorMsg(error.response?.data?.message || 'Error al procesar el pedido. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER: PANTALLA DE ÉXITO ---
  if (orderComplete) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
        <div className="relative bg-[#111] border border-white/10 w-full max-w-md rounded-3xl p-8 text-center animate-fade-up">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="text-4xl text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">¡Pedido Recibido!</h2>
          <p className="text-gray-400 mb-6">
            Tu orden <span className="text-white font-mono font-bold">#{orderComplete}</span> ha sido enviada correctamente.
          </p>

          <div className="bg-white/5 rounded-xl p-4 mb-6 text-sm text-gray-300">
             Te notificaremos el avance vía <span className="font-bold text-white uppercase">{data.notification_channel}</span>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl font-bold text-black hover:brightness-110 transition-all"
            style={{ backgroundColor: primaryColor }}
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER: FORMULARIO ---
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-[#0a0a0a] sm:rounded-3xl rounded-t-3xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold text-white">Finalizar Pedido</h2>
            <p className="text-sm text-gray-400">Total a pagar: <span className="text-white font-bold">{money(total)}</span></p>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all">
            <FaTimes />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="p-6 overflow-y-auto custom-scrollbar">

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              {errorMsg}
            </div>
          )}

          <div className="space-y-5">

            {/* 1. Datos Personales */}
            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Tu Nombre</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-3.5 text-gray-500 text-sm" />
                  <input
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    className="w-full bg-black border border-white/15 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-white/40 transition-colors text-sm"
                    value={data.name}
                    onChange={e => setData({...data, name: e.target.value})}
                  />
                </div>
              </div>

              {/* Teléfono con selector de país */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">
                  Celular / WhatsApp
                </label>
                <div className="flex gap-2">
                  {/* Selector de código de país */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryPicker(!showCountryPicker)}
                      className="flex items-center gap-1.5 bg-black border border-white/15 rounded-xl py-3 px-3 text-white hover:border-white/30 transition-colors min-w-[100px]"
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
                              setData({ ...data, countryCode: country.code, phone: '' });
                              setShowCountryPicker(false);
                              setPhoneError(null);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors ${
                              data.countryCode === country.code ? 'bg-white/10' : ''
                            }`}
                          >
                            <span className="text-lg">{country.flag}</span>
                            <span className="text-white text-sm flex-1 text-left">{country.name}</span>
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
                      placeholder={`${selectedCountry.digits} dígitos`}
                      maxLength={selectedCountry.digits}
                      className={`w-full bg-black border rounded-xl py-3 px-4 text-white focus:outline-none transition-colors text-sm font-mono tracking-wider ${
                        phoneError ? 'border-red-500/50' : isPhoneValid ? 'border-green-500/50' : 'border-white/15 focus:border-white/40'
                      }`}
                      value={data.phone}
                      onChange={e => handlePhoneChange(e.target.value)}
                    />
                    {/* Indicador de dígitos */}
                    <span className={`absolute right-3 top-3.5 text-xs ${
                      isPhoneValid ? 'text-green-500' : 'text-gray-500'
                    }`}>
                      {data.phone.length}/{selectedCountry.digits}
                    </span>
                  </div>
                </div>

                {/* Mensaje de error de teléfono */}
                {phoneError && (
                  <p className="text-red-400 text-xs mt-1.5 ml-1">{phoneError}</p>
                )}
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">
                  Dirección de Entrega
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ej: Av. Principal 123, Miraflores"
                    className={`w-full bg-black border rounded-xl py-3 px-4 text-white focus:outline-none transition-colors text-sm ${
                      !data.address ? 'border-red-500/50' : 'border-white/15 focus:border-white/40'
                    }`}
                    value={data.address}
                    onChange={e => setData({...data, address: e.target.value})}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">
                    Email {isEmailRequired ? '(Requerido)' : '(Opcional)'}
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-3.5 text-gray-500 text-sm" />
                  <input
                    type="email"
                    placeholder="juan@ejemplo.com"
                    className={`w-full bg-black border rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none transition-colors text-sm ${
                        isEmailRequired && !data.email ? 'border-red-500/50' : 'border-white/15 focus:border-white/40'
                    }`}
                    value={data.email}
                    onChange={e => setData({...data, email: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* 2. Selector de Notificaciones */}
            <div className="pt-2">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-3 text-center">
                    ¿Cómo quieres recibir actualizaciones?
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {channels.map((ch) => {
                        const isSelected = data.notification_channel === ch.id;
                        return (
                            <button
                                key={ch.id}
                                type="button"
                                onClick={() => setData({...data, notification_channel: ch.id})}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 relative overflow-hidden ${
                                    isSelected
                                        ? 'bg-white/10 border-white/30'
                                        : 'bg-black border-white/10 hover:bg-white/5 opacity-60 hover:opacity-100'
                                }`}
                            >
                                <div style={{ color: isSelected ? ch.color : '#9ca3af' }} className="mb-2">
                                    {ch.icon}
                                </div>
                                <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                                    {ch.label}
                                </span>

                                {isSelected && (
                                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: ch.color }} />
                                )}
                            </button>
                        )
                    })}
                </div>
                <p className="text-[10px] text-gray-500 text-center mt-2">
                   {channels.find(c => c.id === data.notification_channel)?.desc}
                </p>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/5 bg-[#0a0a0a] rounded-b-3xl">
          <button
            onClick={handleConfirmOrder}
            disabled={!data.name || !isPhoneValid || isSubmitting}
            className="w-full py-4 rounded-xl font-bold text-black text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-[0.98] transition-all"
            style={{ backgroundColor: primaryColor }}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin text-lg" />
                <span>Procesando...</span>
              </>
            ) : (
              <span>Confirmar Pedido - {money(total)}</span>
            )}
          </button>
        </div>

      </div>

      {/* Click outside to close country picker */}
      {showCountryPicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowCountryPicker(false)}
        />
      )}
    </div>
  );
};
