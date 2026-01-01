import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

export default function Hero() {
    const [isNFCAnimating, setIsNFCAnimating] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsNFCAnimating(true);
            setTimeout(() => setIsNFCAnimating(false), 2000);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-100/40 via-transparent to-purple-100/40" />

            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]" />

            {/* Colorful Gradient Orbs - Estilo Linktree */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-l from-purple-400/25 to-pink-500/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-tr from-orange-300/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute bottom-40 right-1/4 w-64 h-64 bg-gradient-to-bl from-pink-400/30 to-rose-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />

            <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-20 md:pt-40 md:pb-28">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left Column - Content */}
                    <div className="text-center lg:text-left space-y-8">
                        {/* Badge */}
                        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-sm font-medium text-purple-700 border border-purple-200/50 shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                            </span>
                            <span>+500 negocios activos</span>
                        </div>

                        {/* Main Heading */}
                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                                <span className="block bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
                                    Tu negocio,
                                </span>
                                <span className="block bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
                                    un toque de distancia
                                </span>
                            </h1>

                            <p className="text-lg md:text-xl text-gray-600 max-w-2xl">
                                Tarjetas NFC inteligentes + Perfil digital personalizado.
                                Comparte tu información de contacto, redes sociales y recibe
                                reservas con solo acercar tu tarjeta.
                            </p>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link href="#pricing">
                                <Button
                                    size="lg"
                                    className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all text-base px-8 h-12 border-0"
                                >
                                    Ver Precios
                                    <svg
                                        className="ml-2 w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                                        />
                                    </svg>
                                </Button>
                            </Link>
                            <Link href="#projects">
                                <Button
                                    size="lg"
                                    className="w-full sm:w-auto bg-gray-900 border-2 border-gray-900 hover:bg-black hover:border-black text-white hover:text-white text-base px-8 h-12"
                                >
                                    Ver Proyectos
                                    <svg
                                        className="ml-2 w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                        />
                                    </svg>
                                </Button>
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
                            <div className="text-center lg:text-left">
                                <div className="text-3xl md:text-4xl font-bold text-gray-900">
                                    500+
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                    Negocios
                                </div>
                            </div>
                            <div className="text-center lg:text-left">
                                <div className="text-3xl md:text-4xl font-bold text-gray-900">
                                    98%
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                    Satisfacción
                                </div>
                            </div>
                            <div className="text-center lg:text-left">
                                <div className="text-3xl md:text-4xl font-bold text-gray-900">
                                    24/7
                                </div>
                                <div className="text-sm text-gray-600 mt-1">Soporte</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - NFC Card Animation */}
                    <div className="relative flex items-center justify-center lg:justify-end">
                        <div className="relative w-full max-w-md">
                            {/* Phone Mockup */}
                            <div className="relative mx-auto w-72 h-[580px] bg-gray-900 rounded-[3rem] shadow-2xl border-8 border-gray-900 overflow-hidden">
                                {/* Phone Screen */}
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white">
                                    {/* Status Bar */}
                                    <div className="h-6 bg-gray-900" />

                                    {/* Profile Content */}
                                    <div className="p-6 pt-8 flex flex-col items-center text-center space-y-4">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                            <svg
                                                className="w-12 h-12 text-white"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                />
                                            </svg>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">
                                                Tu Negocio
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Profesional
                                            </p>
                                        </div>

                                        <div className="w-full space-y-2">
                                            {[
                                                { from: 'from-purple-400', to: 'to-pink-400' },
                                                { from: 'from-cyan-400', to: 'to-blue-400' },
                                                { from: 'from-orange-400', to: 'to-rose-400' }
                                            ].map((colors, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center space-x-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                                >
                                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center shadow-sm`}>
                                                        <div className="w-5 h-5 bg-white/30 rounded-md backdrop-blur-sm" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className={`h-2 bg-gradient-to-r ${colors.from} ${colors.to} rounded w-20 opacity-40`} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Home Indicator */}
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-700 rounded-full" />
                            </div>

                            {/* NFC Card */}
                            <div
                                className={`absolute -bottom-8 -right-8 w-56 h-36 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 shadow-2xl shadow-purple-500/30 transition-all duration-700 ${
                                    isNFCAnimating
                                        ? 'scale-105 shadow-purple-500/60'
                                        : 'scale-100'
                                }`}
                            >
                                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10" />

                                    {/* Animated NFC Waves */}
                                    {isNFCAnimating && (
                                        <div className="absolute top-4 right-4">
                                            {[0, 1, 2].map((i) => (
                                                <div
                                                    key={i}
                                                    className="absolute w-12 h-12 border-2 border-white/60 rounded-full animate-ping"
                                                    style={{
                                                        animationDelay: `${i * 0.3}s`,
                                                        animationDuration: '1.5s',
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    <div className="relative p-6 h-full flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div className="text-white">
                                                <div className="text-xs font-medium opacity-90">
                                                    Tribio
                                                </div>
                                                <div className="text-sm font-bold mt-1">
                                                    Smart Card
                                                </div>
                                            </div>
                                            <div
                                                className={`w-10 h-10 rounded-full ${
                                                    isNFCAnimating
                                                        ? 'bg-white'
                                                        : 'bg-white/20'
                                                } flex items-center justify-center transition-colors duration-300 shadow-lg`}
                                            >
                                                <svg
                                                    className={`w-6 h-6 ${isNFCAnimating ? 'text-purple-600' : 'text-white'}`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="text-white/90 text-xs font-medium">
                                            **** **** **** ****
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 opacity-30 rounded-full blur-xl animate-pulse" />
                            <div className="absolute -bottom-4 -left-8 w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-25 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
                            <div className="absolute top-1/2 -right-4 w-12 h-12 bg-gradient-to-r from-orange-400 to-rose-400 opacity-20 rounded-full blur-lg animate-pulse" style={{ animationDelay: '1.5s' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                </svg>
            </div>
        </section>
    );
}
