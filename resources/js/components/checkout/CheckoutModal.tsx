// resources/js/components/checkout/CheckoutModal.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { FaTimes, FaUser, FaPhoneAlt, FaWhatsapp, FaInfoCircle } from 'react-icons/fa';
import { CartItem } from '@/hooks/useCart';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  total: number;
  accountSlug: string;     // Necesario para la API
  whatsappNumber?: string; // Para el mensaje final
  primaryColor?: string;
  onSuccess: () => void;   // Callback para limpiar el carrito
}

const money = (n: number) => `S/ ${n.toFixed(2)}`;

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  total,
  accountSlug,
  whatsappNumber,
  primaryColor = '#fbbf24',
  onSuccess
}) => {
  const [data, setData] = useState({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirmOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      // 1. Obtener Token CSRF (Laravel Security)
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

      // 2. Payload para tu Backend
      const payload = {
        customer_name: data.name,
        customer_phone: data.phone,
        items: cart.map(item => ({
          id: item.id,
          quantity: item.quantity
        }))
      };

      // 3. Enviar a la Base de Datos
      const response = await axios.post(`/${accountSlug}/checkout`, payload, {
        headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json'
        }
      });
      
      const { order_number } = response.data;

      // 4. Preparar Mensaje de WhatsApp
      const itemsList = cart.map(item => 
        `▪️ ${item.quantity}x ${item.name}`
      ).join('\n');

      const message = 
        `Hola, soy *${data.name}* 👋\n` +
        `Nuevo pedido *#${order_number}*:\n\n` +
        `${itemsList}\n\n` +
        `*💰 Total: ${money(total)}*\n\n` +
        `Quedo atento a su confirmación para realizar el pago.`;

      // 5. Redirigir y Limpiar
      const targetNumber = whatsappNumber?.replace(/\D/g, '') || '';
      const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappUrl, '_blank');
      onSuccess(); // Limpia el carrito en el componente padre
      onClose();

    } catch (error: any) {
      console.error("Error en checkout:", error);
      let errorMsg = 'Error al procesar el pedido.';
      
      if (error.response?.status === 419) {
          errorMsg = 'Tu sesión expiró. Por favor recarga la página.';
      } else if (error.response?.data?.message) {
          errorMsg = error.response.data.message;
      }
      
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-[#111] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-fade-up">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">Finalizar Pedido</h3>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white">
            <FaTimes />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 p-4 rounded-xl border border-white/5 mb-4 flex justify-between items-center">
            <span className="text-gray-400 text-sm">Total a pagar:</span>
            <div className="text-2xl font-bold text-white" style={{ color: primaryColor }}>{money(total)}</div>
          </div>

          <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 mb-4">
            <p className="text-blue-200 text-xs flex items-start gap-2 leading-relaxed">
               <FaInfoCircle className="mt-0.5 text-blue-400 shrink-0" />
               <span>
                  El pago se coordina por <b>WhatsApp</b> (Yape/Plin/Efectivo) tras confirmar tu pedido.
               </span>
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2 ml-1">Tu Nombre</label>
            <div className="relative">
              <FaUser className="absolute left-4 top-3.5 text-gray-500 text-sm" />
              <input 
                type="text"
                placeholder="Ej. Juan Pérez"
                className="w-full bg-[#000] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-white/30 transition-colors text-sm"
                value={data.name}
                onChange={e => setData({...data, name: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2 ml-1">WhatsApp / Teléfono</label>
            <div className="relative">
              <FaPhoneAlt className="absolute left-4 top-3.5 text-gray-500 text-sm" />
              <input 
                type="tel"
                placeholder="Ej. 999 999 999"
                className="w-full bg-[#000] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-white/30 transition-colors text-sm"
                value={data.phone}
                onChange={e => setData({...data, phone: e.target.value})}
              />
            </div>
          </div>

          <button
            onClick={handleConfirmOrder}
            disabled={!data.name || !data.phone || isSubmitting}
            className="w-full py-4 rounded-xl font-bold text-black text-base mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:brightness-110 transition-all"
            style={{ backgroundColor: primaryColor }}
          >
            {isSubmitting ? (
              <span className="animate-pulse">Procesando...</span>
            ) : (
              <>
                <span>Confirmar y Enviar</span>
                <FaWhatsapp className="text-xl" />
              </>
            )}
          </button>
        </div>
      </div>
      
       <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fadeUp 0.4s ease-out; }
      `}</style>
    </div>
  );
};