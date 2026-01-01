import { useEffect, useRef, useState } from 'react';

// Business profiles for carousel
const businessProfiles = [
    {
        name: 'Tribio',
        type: 'Plataforma Digital',
        color: 'from-purple-600 via-pink-600 to-rose-600',
        cardColor: 'from-purple-600 via-pink-600 to-rose-600',
        avatar: '🎯',
        links: [
            { color: 'from-purple-400 to-pink-400', icon: '🌐' },
            { color: 'from-cyan-400 to-blue-400', icon: '📱' },
            { color: 'from-orange-400 to-rose-400', icon: '✉️' }
        ]
    },
    {
        name: 'The Barber Co.',
        type: 'Barbería Premium',
        color: 'from-amber-600 via-orange-600 to-red-600',
        cardColor: 'from-amber-600 via-orange-600 to-red-600',
        avatar: '✂️',
        links: [
            { color: 'from-amber-400 to-orange-400', icon: '📅' },
            { color: 'from-orange-400 to-red-400', icon: '📍' },
            { color: 'from-red-400 to-rose-400', icon: '📞' }
        ]
    },
    {
        name: 'Sabor Peruano',
        type: 'Restaurante',
        color: 'from-green-600 via-emerald-600 to-teal-600',
        cardColor: 'from-green-600 via-emerald-600 to-teal-600',
        avatar: '🍽️',
        links: [
            { color: 'from-green-400 to-emerald-400', icon: '🍕' },
            { color: 'from-emerald-400 to-teal-400', icon: '🛵' },
            { color: 'from-teal-400 to-cyan-400', icon: '⭐' }
        ]
    },
    {
        name: 'Bella Spa',
        type: 'Centro de Belleza',
        color: 'from-pink-600 via-rose-600 to-purple-600',
        cardColor: 'from-pink-600 via-rose-600 to-purple-600',
        avatar: '💆',
        links: [
            { color: 'from-pink-400 to-rose-400', icon: '💅' },
            { color: 'from-rose-400 to-purple-400', icon: '🎁' },
            { color: 'from-purple-400 to-indigo-400', icon: '📲' }
        ]
    }
];

export default function Features() {
    const [activeSlide, setActiveSlide] = useState(0);
    const [currentBusiness, setCurrentBusiness] = useState(0);
    const [isTapping, setIsTapping] = useState(false);
    const slide1Ref = useRef<HTMLDivElement>(null);
    const slide2Ref = useRef<HTMLDivElement>(null);

    // Intersection Observer for slide detection
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        if (entry.target === slide1Ref.current) {
                            setActiveSlide(0);
                        } else if (entry.target === slide2Ref.current) {
                            setActiveSlide(1);
                        }
                    }
                });
            },
            { threshold: 0.5 }
        );

        if (slide1Ref.current) observer.observe(slide1Ref.current);
        if (slide2Ref.current) observer.observe(slide2Ref.current);

        return () => {
            if (slide1Ref.current) observer.unobserve(slide1Ref.current);
            if (slide2Ref.current) observer.unobserve(slide2Ref.current);
        };
    }, []);

    // Carousel auto-rotation with tap animation
    useEffect(() => {
        if (activeSlide !== 0) return; // Only run on first slide

        const interval = setInterval(() => {
            // Trigger tap animation
            setIsTapping(true);

            // After tap animation, change business profile
            setTimeout(() => {
                setCurrentBusiness((prev) => (prev + 1) % businessProfiles.length);
                setIsTapping(false);
            }, 800);
        }, 4000); // Change every 4 seconds

        return () => clearInterval(interval);
    }, [activeSlide]);

    return (
        <section id="features" className="relative">
            {/* Slide 1: NFC Card - Full Screen */}
            <div
                ref={slide1Ref}
                className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 overflow-hidden"
            >
                {/* Animated background orbs */}
                <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-l from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full">
                    <div className="grid lg:grid-cols-2 gap-24 items-center">
                        {/* Left: Visual - Phone + NFC Card Animation */}
                        <div className={`relative transition-all duration-1000 ease-out ${activeSlide === 0 ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-20 scale-95'}`}>
                            <div className="relative w-full max-w-lg mx-auto h-[650px]">
                                {/* Phone Mockup */}
                                <div className="absolute left-1/2 -translate-x-1/2 top-24 w-72 h-[580px] bg-gray-900 rounded-[3.5rem] shadow-2xl border-[10px] border-gray-900 overflow-hidden z-10">
                                    {/* Phone Screen */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
                                        {/* Status Bar */}
                                        <div className="h-8 bg-gray-900" />

                                        {/* Profile Content - Carousel */}
                                        <div className="relative h-full overflow-hidden">
                                            {businessProfiles.map((business, index) => (
                                                <div
                                                    key={index}
                                                    className={`absolute inset-0 p-8 pt-4 flex flex-col items-center transition-all duration-700 ${
                                                        index === currentBusiness
                                                            ? 'translate-x-0 opacity-100'
                                                            : index < currentBusiness
                                                            ? '-translate-x-full opacity-0'
                                                            : 'translate-x-full opacity-0'
                                                    }`}
                                                >
                                                    {/* Avatar */}
                                                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${business.color} flex items-center justify-center text-4xl shadow-xl transition-all duration-700`}>
                                                        {business.avatar}
                                                    </div>

                                                    {/* Business Name */}
                                                    <div className="text-center mt-4 space-y-1">
                                                        <h3 className="text-xl font-bold text-gray-900">{business.name}</h3>
                                                        <p className="text-sm text-gray-500">{business.type}</p>
                                                    </div>

                                                    {/* Links */}
                                                    <div className="w-full space-y-3 mt-8">
                                                        {business.links.map((link, i) => (
                                                            <div
                                                                key={i}
                                                                className={`h-14 bg-gradient-to-r ${link.color} rounded-2xl shadow-lg flex items-center justify-center text-2xl transition-all duration-300`}
                                                            >
                                                                {link.icon}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Home indicator */}
                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-gray-700 rounded-full" />
                                    </div>
                                </div>

                                {/* NFC Card - Synced with carousel - Above phone */}
                                <div
                                    className={`absolute left-1/2 -translate-x-1/2 -top-4 w-64 h-40 rounded-2xl bg-gradient-to-br ${businessProfiles[currentBusiness].cardColor} shadow-2xl transition-all duration-700 z-20 ${
                                        isTapping
                                            ? 'scale-105 shadow-purple-500/60 translate-y-16'
                                            : 'scale-100 translate-y-0'
                                    }`}
                                    style={{
                                        boxShadow: isTapping ? '0 25px 50px -12px rgba(147, 51, 234, 0.5)' : '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                                    }}
                                >
                                    <div className="absolute inset-0 rounded-2xl overflow-hidden">
                                        {/* Shine effect */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20" />

                                        {/* NFC Waves when tapping */}
                                        {isTapping && (
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                                {[0, 1, 2].map((i) => (
                                                    <div
                                                        key={i}
                                                        className="absolute w-24 h-24 border-2 border-white/60 rounded-full animate-ping"
                                                        style={{
                                                            animationDelay: `${i * 0.2}s`,
                                                            animationDuration: '1s',
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        <div className="relative p-6 h-full flex flex-col justify-between">
                                            {/* Top section */}
                                            <div className="flex justify-between items-start">
                                                <div className="text-white">
                                                    <div className="text-xs font-medium opacity-90">Tribio</div>
                                                    <div className="text-sm font-bold mt-1">Smart Card</div>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Bottom section - Business name */}
                                            <div className="text-white">
                                                <div className="text-lg font-bold transition-all duration-700">
                                                    {businessProfiles[currentBusiness].name}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating orbs */}
                                <div className="absolute -top-8 -left-16 w-28 h-28 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-2xl opacity-70 animate-bounce" />
                                <div className="absolute bottom-0 -right-16 w-36 h-36 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full blur-2xl opacity-70 animate-bounce" style={{ animationDelay: '0.5s' }} />
                            </div>
                        </div>

                        {/* Right: Content */}
                        <div className={`relative transition-all duration-1000 delay-200 ease-out ${activeSlide === 0 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}>
                            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                                Comparte todo con un{' '}
                                <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                                    solo toque
                                </span>
                            </h2>
                            <p className="text-xl text-gray-600 leading-relaxed mb-8">
                                Tu tarjeta NFC conecta al instante con cualquier smartphone. Sin apps, sin códigos QR.
                            </p>

                            {/* Benefits List */}
                            <div className="space-y-4 mb-10">
                                {[
                                    { icon: '⚡', text: 'Conexión en 3 segundos', color: 'from-purple-500 to-pink-500' },
                                    { icon: '📱', text: 'Compatible con iOS y Android', color: 'from-cyan-500 to-blue-500' },
                                    { icon: '🔗', text: 'Comparte redes, contacto y portfolio', color: 'from-orange-500 to-rose-500' }
                                ].map((benefit, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center space-x-4 group"
                                        style={{ animationDelay: `${i * 0.1}s` }}
                                    >
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${benefit.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                                            {benefit.icon}
                                        </div>
                                        <span className="text-lg font-medium text-gray-700">{benefit.text}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <a
                                    href="#pricing"
                                    className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all text-base"
                                >
                                    Solicitar mi tarjeta
                                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </a>
                                <a
                                    href="#demo"
                                    className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-gray-300 hover:border-purple-600 text-gray-700 hover:text-purple-600 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all text-base"
                                >
                                    Ver demostración
                                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </div>

            {/* Slide 2: Customizable Profile - Full Screen */}
            <div
                ref={slide2Ref}
                className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 overflow-hidden"
            >
                {/* Animated background orbs */}
                <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-l from-orange-400/20 to-rose-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-teal-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left: Content */}
                        <div className={`lg:order-1 order-2 relative transition-all duration-1000 ease-out ${activeSlide === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}>
                            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                                Tu marca,{' '}
                                <span className="block bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    tu estilo
                                </span>
                            </h2>
                            <p className="text-xl text-gray-600 leading-relaxed mb-8">
                                Personaliza completamente tu perfil digital con colores, logos y toda la info de tu negocio.
                            </p>

                            {/* Use Cases */}
                            <div className="space-y-4 mb-10">
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Ideal para:</p>
                                {[
                                    { icon: '💼', text: 'Emprendedores y freelancers', color: 'from-cyan-500 to-blue-500' },
                                    { icon: '🏢', text: 'Negocios locales y tiendas', color: 'from-purple-500 to-pink-500' },
                                    { icon: '✂️', text: 'Salones, spas y restaurantes', color: 'from-orange-500 to-rose-500' }
                                ].map((useCase, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center space-x-4 group"
                                        style={{ animationDelay: `${i * 0.1}s` }}
                                    >
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${useCase.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                                            {useCase.icon}
                                        </div>
                                        <span className="text-lg font-medium text-gray-700">{useCase.text}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Features Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-10">
                                {[
                                    { label: 'Colores personalizados' },
                                    { label: 'Logo de tu marca' },
                                    { label: 'Links ilimitados' },
                                    { label: 'Reservas integradas' }
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center space-x-2">
                                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm text-gray-600">{feature.label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <a
                                    href="#pricing"
                                    className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-700 hover:via-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all text-base"
                                >
                                    Crear mi perfil
                                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </a>
                                <a
                                    href="#examples"
                                    className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-gray-300 hover:border-cyan-600 text-gray-700 hover:text-cyan-600 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all text-base"
                                >
                                    Ver ejemplos
                                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Right: Visual */}
                        <div className={`lg:order-2 order-1 relative transition-all duration-1000 delay-200 ease-out ${activeSlide === 1 ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-20 scale-95'}`}>
                            {/* Phone Mockup 3D */}
                            <div className="relative w-full max-w-sm mx-auto">
                                <div className="relative aspect-[9/19] bg-gray-900 rounded-[3.5rem] shadow-2xl border-[10px] border-gray-900 overflow-hidden transform -rotate-6 hover:rotate-0 hover:scale-105 transition-all duration-700">
                                    {/* Screen */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50">
                                        {/* Status bar */}
                                        <div className="h-8 bg-gray-900" />

                                        {/* Profile content */}
                                        <div className="p-8 flex flex-col items-center space-y-6">
                                            {/* Avatar */}
                                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400 shadow-xl shadow-purple-500/30 animate-pulse" />

                                            {/* Name placeholders */}
                                            <div className="text-center space-y-2">
                                                <div className="h-4 w-40 bg-gray-300 rounded animate-pulse" />
                                                <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
                                            </div>

                                            {/* Links with gradient */}
                                            <div className="w-full space-y-3 pt-6">
                                                {[
                                                    { from: 'from-purple-400', to: 'to-pink-400' },
                                                    { from: 'from-cyan-400', to: 'to-blue-400' },
                                                    { from: 'from-orange-400', to: 'to-rose-400' }
                                                ].map((colors, i) => (
                                                    <div
                                                        key={i}
                                                        className={`h-14 bg-gradient-to-r ${colors.from} ${colors.to} rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300 animate-pulse`}
                                                        style={{ animationDelay: `${i * 0.2}s` }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Home indicator */}
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-gray-700 rounded-full" />
                                </div>

                                {/* Floating color palette - 3D effect */}
                                <div className="absolute -top-8 -right-8 flex flex-col space-y-3">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl shadow-purple-500/50 animate-bounce" />
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 shadow-2xl shadow-blue-500/50 animate-bounce" style={{ animationDelay: '0.2s' }} />
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 shadow-2xl shadow-rose-500/50 animate-bounce" style={{ animationDelay: '0.4s' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
