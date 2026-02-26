import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useRef } from 'react';

/* Hook para revelar secciones al hacer scroll */
function useSectionReveal() {
    const ref = useRef<HTMLDivElement | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisible(true);
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.15 },
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return { ref, visible };
}

/* Tipos de tarjetas NFC */
const cardTypes = [
    {
        id: 'pvc',
        name: 'Tarjeta PVC',
        description: 'Tarjeta clásica resistente y duradera. Ideal para uso diario y equipos de trabajo.',
        priceNewAccount: 30,      // Crear cuenta nueva: mejor precio
        priceExistingAccount: 40, // Ya tiene cuenta: +S/10
        priceNoAccount: 50,       // Sin cuenta: precio más alto
        material: 'PVC Premium',
        features: [
            'Resistente al agua',
            'Diseño personalizado a full color',
            'Durabilidad de 5+ años',
            'Chip NFC de alta calidad',
        ],
        gradient: 'from-sky-500 via-sky-600 to-sky-700',
        bgColor: 'bg-gradient-to-br from-sky-50 to-blue-100',
        borderColor: 'border-sky-300',
        accentColor: 'sky',
        popular: true, // PVC es el más popular
        icon: (
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5" />
                <rect x="4" y="13" width="4" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
        ),
    },
    {
        id: 'wood',
        name: 'Tarjeta Madera',
        description: 'Elegante acabado natural en bambú. Destaca con estilo eco-friendly y profesional.',
        priceNewAccount: 50,
        priceExistingAccount: 60,
        priceNoAccount: 70,
        material: 'Bambú Natural',
        features: [
            'Material eco-friendly',
            'Grabado láser premium',
            'Textura única natural',
            'Chip NFC integrado',
        ],
        gradient: 'from-amber-600 via-amber-700 to-amber-800',
        bgColor: 'bg-gradient-to-br from-amber-50 to-orange-100',
        borderColor: 'border-amber-300',
        accentColor: 'amber',
        popular: false,
        icon: (
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M12 22V12" stroke="currentColor" strokeWidth="1.5" />
                <path d="M20 7l-8 5-8-5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
        ),
    },
    {
        id: 'metal',
        name: 'Tarjeta Metal',
        description: 'Acabado premium en acero inoxidable. La máxima expresión de profesionalismo.',
        priceNewAccount: 70,
        priceExistingAccount: 80,
        priceNoAccount: 90,
        material: 'Acero Inoxidable',
        features: [
            'Acabado espejo o mate',
            'Grabado láser de precisión',
            'Peso premium 30g',
            'Durabilidad de por vida',
        ],
        gradient: 'from-zinc-400 via-zinc-500 to-zinc-600',
        bgColor: 'bg-gradient-to-br from-zinc-100 to-zinc-200',
        borderColor: 'border-zinc-400',
        accentColor: 'zinc',
        popular: false,
        icon: (
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 16.4 5.7 21l2.3-7-6-4.6h7.6L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
        ),
    },
];

/* Card Component */
function NfcCard({
    card,
    visible,
    index,
}: {
    card: typeof cardTypes[0];
    visible: boolean;
    index: number;
}) {
    const [showWithAccount, setShowWithAccount] = useState(true);
    // El ahorro máximo es cuando creas cuenta nueva vs sin cuenta
    const savings = card.priceNoAccount - card.priceNewAccount;

    return (
        <div
            className={`relative flex flex-col rounded-3xl border-2 ${card.borderColor} ${card.bgColor} p-6 shadow-xl transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            } ${card.popular ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}
            style={{ transitionDelay: visible ? `${index * 150}ms` : '0ms' }}
        >
            {/* Popular Badge */}
            {card.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                    ⭐ Más Popular
                </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${card.gradient} text-white shadow-lg`}>
                    {card.icon}
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">{card.name}</h3>
                    <p className="text-xs text-slate-500">{card.material}</p>
                </div>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 mb-4">{card.description}</p>

            {/* Price Toggle */}
            <div className="bg-white rounded-2xl p-4 mb-4 border border-slate-200 shadow-inner">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <button
                        onClick={() => setShowWithAccount(true)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            showWithAccount
                                ? 'bg-emerald-500 text-white shadow-md'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Con cuenta Tribio
                    </button>
                    <button
                        onClick={() => setShowWithAccount(false)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            !showWithAccount
                                ? 'bg-slate-700 text-white shadow-md'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Sin cuenta
                    </button>
                </div>

                <div className="text-center">
                    <div className="flex items-end justify-center gap-1">
                        <span className="text-sm text-slate-500">S/</span>
                        <span className={`text-4xl font-extrabold transition-all duration-300 ${
                            showWithAccount ? 'text-emerald-600' : 'text-slate-800'
                        }`}>
                            {showWithAccount ? card.priceNewAccount : card.priceNoAccount}
                        </span>
                        <span className="text-sm text-slate-500 mb-1">c/u</span>
                    </div>

                    {showWithAccount && (
                        <div className="mt-2 inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Ahorras S/ {savings}
                        </div>
                    )}
                </div>
            </div>

            {/* Features */}
            <ul className="space-y-2 mb-6 flex-1">
                {card.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                        {feature}
                    </li>
                ))}
            </ul>

            {/* CTA Button */}
            <Link href={`/comprar-tarjeta-nfc?tipo=${card.id}`} className="w-full">
                <Button
                    size="lg"
                    className={`w-full rounded-full font-semibold text-sm transition-all ${
                        card.popular
                            ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/30'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                >
                    Comprar {card.name}
                </Button>
            </Link>
        </div>
    );
}

export default function NfcSection() {
    const { ref, visible } = useSectionReveal();
    const [angle, setAngle] = useState(0);

    useEffect(() => {
        let frameId: number;
        const loop = () => {
            setAngle((prev) => (prev + 0.3) % 360);
            frameId = requestAnimationFrame(loop);
        };
        frameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frameId);
    }, []);

    const floatOffset = Math.sin((angle * Math.PI) / 180) * 4;

    return (
        <section ref={ref} id="tarjetas-nfc" className="bg-gradient-to-b from-white via-slate-50 to-white py-20 overflow-hidden">
            <div className="mx-auto max-w-7xl px-6">
                {/* Header */}
                <div className={`text-center max-w-3xl mx-auto mb-8 transition-all duration-700 ${
                    visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}>
                    <p className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-1 text-xs font-semibold text-sky-700 mb-4">
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
                        Tarjetas NFC Inteligentes
                    </p>

                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
                        Tu negocio en una tarjeta.
                        <br />
                        <span className="text-sky-600">Elige tu material favorito.</span>
                    </h2>

                    <p className="text-slate-600 text-sm md:text-base">
                        Cada tarjeta NFC Tribio abre tu mini página en el celular de tu cliente.
                        Solo acercas la tarjeta y listo: ven tus servicios, productos, redes y botón de WhatsApp en segundos.
                    </p>
                </div>

                {/* Discount Banner */}
                <div className={`relative mb-12 transition-all duration-700 ${
                    visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`} style={{ transitionDelay: visible ? '100ms' : '0ms' }}>
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 p-6 md:p-8 shadow-2xl shadow-emerald-500/30">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <svg className="absolute -right-20 -top-20 h-80 w-80 text-white" fill="currentColor" viewBox="0 0 200 200">
                                <path d="M100 0C44.8 0 0 44.8 0 100s44.8 100 100 100 100-44.8 100-100S155.2 0 100 0zm0 180c-44.2 0-80-35.8-80-80s35.8-80 80-80 80 35.8 80 80-35.8 80-80 80z" />
                            </svg>
                            <svg className="absolute -left-10 -bottom-10 h-60 w-60 text-white" fill="currentColor" viewBox="0 0 200 200">
                                <polygon points="100,10 40,198 190,78 10,78 160,198" />
                            </svg>
                        </div>

                        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex-1 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-3">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
                                    </span>
                                    <span className="text-xs font-semibold text-white">Oferta Exclusiva Tribio</span>
                                </div>

                                <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
                                    S/ 20 de descuento en cada tarjeta
                                </h3>

                                <p className="text-emerald-100 text-sm md:text-base max-w-xl">
                                    Crea tu <strong className="text-white">tienda o negocio en Tribio</strong> y obtén el mejor precio en tarjetas NFC.
                                    Plan mensual desde <strong className="text-white">S/ 29/mes</strong> + tarjeta con descuento especial.
                                </p>
                            </div>

                            <div className="flex flex-col items-center gap-3">
                                <div className="bg-white rounded-2xl p-4 shadow-xl">
                                    <div className="text-center mb-2">
                                        <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full mb-2">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" />
                                            </svg>
                                            DESCUENTO FIJO
                                        </div>
                                        <p className="text-3xl font-extrabold text-emerald-600">-S/ 20</p>
                                        <p className="text-xs text-slate-500">por cada tarjeta</p>
                                    </div>
                                </div>

                                <Link href="/comprar-tarjeta-nfc">
                                    <Button
                                        size="lg"
                                        className="rounded-full bg-white text-emerald-600 hover:bg-emerald-50 font-bold shadow-xl px-8"
                                    >
                                        Comprar tarjeta NFC
                                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {cardTypes.map((card, index) => (
                        <NfcCard key={card.id} card={card} visible={visible} index={index} />
                    ))}
                </div>

                {/* Bottom Info */}
                <div className={`flex flex-col md:flex-row items-center justify-center gap-8 pt-8 border-t border-slate-200 transition-all duration-700 ${
                    visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`} style={{ transitionDelay: visible ? '600ms' : '0ms' }}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-emerald-100">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900">Envío a todo Perú</p>
                            <p className="text-xs text-slate-500">Delivery gratis en pedidos +5 unidades</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-sky-100">
                            <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900">Entrega en 3-5 días</p>
                            <p className="text-xs text-slate-500">Diseño y producción express</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-amber-100">
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900">Garantía de por vida</p>
                            <p className="text-xs text-slate-500">Reemplazo gratis por defectos</p>
                        </div>
                    </div>
                </div>

                {/* Bulk Discount Note */}
                <p className="text-center text-xs text-slate-500 mt-8">
                    *Precios referenciales por unidad. <strong>Descuentos por volumen</strong> disponibles para equipos, academias, barberías, estudios y empresas.
                    <br />
                    <Link href="#contacto" className="text-sky-600 hover:underline font-medium">
                        Contáctanos para cotizaciones especiales →
                    </Link>
                </p>
            </div>
        </section>
    );
}
