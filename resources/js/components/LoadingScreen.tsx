import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
    logoUrl?: string | null;
    onLoadingComplete?: () => void;
    minDuration?: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
    logoUrl,
    onLoadingComplete,
    minDuration = 1500,
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onLoadingComplete?.();
        }, minDuration);

        return () => clearTimeout(timer);
    }, [minDuration, onLoadingComplete]);

    if (!isVisible) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950 transition-opacity duration-500"
            style={{ opacity: isVisible ? 1 : 0 }}
        >
            {/* Fondo animado */}
            <div className="absolute inset-0 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `repeating-linear-gradient(
                            45deg,
                            transparent,
                            transparent 40px,
                            #fbbf24 40px,
                            #fbbf24 80px
                        )`,
                        backgroundSize: '200% 200%',
                        animation: 'barberScroll 60s linear infinite',
                    }}
                />
            </div>

            {/* Contenido de carga */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-8">
                {/* Logo o Spinner */}
                {logoUrl ? (
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full border-2 border-amber-500/30 p-2 bg-black/60 backdrop-blur-sm shadow-[0_0_60px_rgba(251,191,36,0.3)]">
                            <img
                                src={logoUrl}
                                alt="Loading"
                                className="w-full h-full object-contain rounded-full animate-pulse"
                            />
                        </div>
                        {/* Anillo giratorio alrededor del logo */}
                        <div className="absolute -inset-2">
                            <div className="w-full h-full rounded-full border-2 border-transparent border-t-amber-500 border-r-amber-500/50 animate-spin" />
                        </div>
                    </div>
                ) : (
                    <div className="relative w-32 h-32">
                        <div className="absolute inset-0 rounded-full border-4 border-amber-500/20" />
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 border-r-amber-500/50 animate-spin" />
                        <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-amber-400 border-r-amber-400/50 animate-spin animation-delay-150" style={{ animationDuration: '1s' }} />
                    </div>
                )}

                {/* Texto de carga */}
                <div className="flex flex-col items-center gap-3">
                    <p className="text-white text-lg font-semibold tracking-wide">Cargando...</p>
                    {/* Barra de progreso animada */}
                    <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full animate-loading-progress" />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes barberScroll {
                    0% { background-position: 0 0; }
                    100% { background-position: 80px 80px; }
                }
                @keyframes loading-progress {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-loading-progress {
                    animation: loading-progress 1.5s ease-in-out infinite;
                }
                .animation-delay-150 {
                    animation-delay: 150ms;
                }
            `}</style>
        </div>
    );
};
