import React from 'react';

const money = (n: number) => `S/ ${n.toFixed(2)}`;

interface FloatingCartButtonProps {
    count: number;
    total: number;
    onClick: () => void;
    primaryColor: string;
}

export const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ count, total, onClick, primaryColor }) => {
    if (count === 0) return null;

    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 md:absolute md:w-full">
            <button
            onClick={onClick}
            className="w-full max-w-md bg-white text-black py-3.5 rounded-xl shadow-2xl shadow-white/10 flex items-center justify-between px-5 transform transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: primaryColor }}
            >
            <div className="flex items-center gap-3">
                <div className="bg-black/20 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-black/80">
                {count}
                </div>
                <span className="font-bold text-sm uppercase tracking-wide text-black/80">Ver Mi Pedido</span>
            </div>
            <span className="font-black text-lg text-black">{money(total)}</span>
            </button>
        </div>
    );
};