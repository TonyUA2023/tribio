// resources/js/components/checkout/CartDrawer.tsx
import React from 'react';
import { FaShoppingCart, FaTimes, FaMinus, FaPlus, FaLeaf } from 'react-icons/fa';
import { CartItem } from '@/hooks/useCart'; // Asegúrate de importar la interfaz

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  total: number;
  onUpdateQuantity: (id: number, delta: number) => void;
  onProceed: () => void;
  primaryColor?: string;
}

const resolveMediaUrl = (raw?: string) => {
    if (!raw) return '';
    const s = String(raw).trim();
    if (s.startsWith('http')) return s;
    return `/uploaded_files/${s.replace(/^uploaded_files\//, '')}`;
};

const money = (n: number) => `S/ ${n.toFixed(2)}`;

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  total,
  onUpdateQuantity,
  onProceed,
  primaryColor = '#fbbf24'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end sm:items-center sm:justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#111] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl h-[85vh] sm:h-[600px] flex flex-col animate-slide-in-up">
        
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <FaShoppingCart style={{ color: primaryColor }} /> 
            Tu Pedido
          </h2>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white">
            <FaTimes />
          </button>
        </div>

        {/* Lista de Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {cart.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full opacity-50">
                <FaShoppingCart size={40} className="mb-2"/>
                <p>Tu carrito está vacío</p>
             </div>
          ) : (
            cart.map((item) => (
                <div key={item.id} className="flex gap-3 bg-white/5 p-3 rounded-xl border border-white/5 items-center">
                {/* Imagen */}
                <div className="w-14 h-14 bg-slate-800 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                    {item.image ? (
                        <img src={resolveMediaUrl(item.image)} className="w-full h-full object-cover" alt={item.name} />
                    ) : (
                        <FaLeaf className="text-white/20" />
                    )}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-sm truncate">{item.name}</h4>
                    <span className="font-medium text-gray-400 text-xs">{money(item.price)}</span>
                </div>
                
                {/* Controles */}
                <div className="flex items-center gap-3 bg-black/40 rounded-lg p-1">
                    <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-6 h-6 rounded-md flex items-center justify-center text-white hover:bg-white/10">
                        <FaMinus size={8} />
                    </button>
                    <span className="font-bold text-white text-xs w-4 text-center">{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-6 h-6 rounded-md flex items-center justify-center text-white hover:bg-white/10">
                        <FaPlus size={8} />
                    </button>
                </div>
                </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
            <div className="p-6 bg-[#0a0a0a] border-t border-white/5">
            <div className="flex justify-between mb-4 text-lg font-bold text-white">
                <span className="text-gray-400 text-sm font-normal">Subtotal</span>
                <span>{money(total)}</span>
            </div>
            <button
                onClick={onProceed}
                className="w-full py-4 rounded-xl font-bold text-black text-base text-center hover:brightness-110 transition-all shadow-lg"
                style={{ backgroundColor: primaryColor }}
            >
                Continuar
            </button>
            </div>
        )}
      </div>
      
      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-in-up { animation: slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};