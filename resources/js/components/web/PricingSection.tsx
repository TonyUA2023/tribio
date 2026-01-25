import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

type FeatureItemProps = {
    label: string;
};

function FeatureItem({ label }: FeatureItemProps) {
    return (
        <li className="flex items-start gap-2">
            <span className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                ✓
            </span>
            <span className="text-sm text-slate-600">{label}</span>
        </li>
    );
}

type SimpleBulletProps = {
    text: string;
};

function SimpleBullet({ text }: SimpleBulletProps) {
    return (
        <div className="flex items-start gap-2 text-sm text-slate-600">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-500" />
            <p>{text}</p>
        </div>
    );
}

type BillingPeriod = 'monthly' | 'yearly';

type Plan = {
    id: 'personal' | 'pro' | 'corporate';
    name: string;
    label: string;
    description: string;
    priceMonthly: number | null;
    priceYearly?: number | null;
    note: string;
    href: string;
    cta: string;
    badge?: string;
    highlight?: boolean;
    features: string[];
};

const plans: Plan[] = [
    {
        id: 'personal',
        name: 'Personal',
        label: 'Tu tarjeta digital siempre lista.',
        description:
            'Para creadores, freelancers y profesionales que solo necesitan un perfil bonito y directo.',
        priceMonthly: 0,
        priceYearly: 0,
        note: 'Ideal para compartir tus redes, contactos y una breve descripción.',
        href: '/register',
        cta: 'Crear cuenta gratis',
        features: [
            'Perfil personal Tribio con foto, nombre y descripción.',
            'Un enlace único para compartir tu perfil en cualquier red.',
            'Botones para tus redes sociales y enlaces importantes.',
            'Compatible con tarjeta NFC Tribio para compartir tus datos.',
            'Sin módulos de stock, ventas ni gestión de equipo.'
        ]
    },
    {
        id: 'pro',
        name: 'Pro',
        label: 'Todo tu negocio en un solo link.',
        description:
            'Para emprendedores y negocios que venden todos los días desde su celular.',
        priceMonthly: 29,
        priceYearly: 24,
        note: 'Incluye app de gestión Tribio para administrar productos, pedidos, clientes y equipo.',
        href: '/register',
        cta: 'Comenzar con Tribio Pro',
        badge: 'Más elegido por negocios',
        highlight: true,
        features: [
            'Mini tienda + link-in-bio para tu marca con diseño profesional.',
            'Pasarela de pagos integrada (según país y disponibilidad).',
            'Gestión de stock si trabajas con catálogo de productos.',
            'Pedidos o reservas de citas según el tipo de negocio.',
            'Galerías, banners y secciones para mostrar servicios y promociones.',
            'Estados, anuncios y novedades para tus clientes frecuentes.',
            'Notificaciones automáticas por WhatsApp para pedidos o reservas.',
            'Notificaciones por email para ti y tus clientes.',
            'Comprobantes digitales en PDF de compras o reservas.',
            'Reseñas y calificaciones de clientes visibles en tu perfil.',
            'Ventas directas desde tu mini página Tribio.',
            'Plantillas listas para rubros como tiendas, servicios, gyms y más.'
        ]
    },
    {
        id: 'corporate',
        name: 'Corporativo',
        label: 'Diseñado para equipos y cadenas.',
        description:
            'Para marcas, franquicias y empresas que manejan varios puntos de venta o colaboradores.',
        priceMonthly: null,
        priceYearly: null,
        note: 'Te acompañamos en la implementación, capacitación y reportes a medida.',
        href: '/contacto',
        cta: 'Hablar con un asesor',
        features: [
            'Todo lo incluido en Tribio Pro.',
            'Múltiples usuarios y colaboradores por marca.',
            'Perfiles individuales por colaborador (ej: tu-marca/juan).',
            'Vista matriz con sucursales, equipos y canales de venta.',
            'Onboarding guiado para tu equipo (configuración inicial y capacitación).',
            'Reportes avanzados de ventas por colaborador, canal y sucursal.',
            'Soporte prioritario y canal directo con el equipo Tribio.',
            'Integraciones especiales y flujos personalizados según tu operación.'
        ]
    }
];

export default function Pricing() {
    const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
    const [isAnimated, setIsAnimated] = useState(false);

    // Dispara las animaciones al montar el componente
    useEffect(() => {
        const timer = setTimeout(() => setIsAnimated(true), 80);
        return () => clearTimeout(timer);
    }, []);

    return (
        <section id="pricing" className="relative overflow-hidden bg-white py-20">
            <div className="mx-auto max-w-6xl px-6 lg:px-0">
                {/* ======= HEADER ======= */}
                <div
                    className={`mx-auto mb-10 max-w-3xl text-center transform transition-all duration-700 ease-out ${
                        isAnimated
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-4'
                    }`}
                >
                    <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-1 text-xs font-semibold text-sky-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                        Planes diseñados para personas, negocios y equipos.
                    </p>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                        Elige tu plan Tribio y empieza a vender desde un solo link.
                    </h1>
                    <p className="mt-3 text-sm text-slate-600 md:text-base">
                        Crea tu perfil personal gratis o usa Tribio Pro y Corporativo para
                        manejar productos, pedidos y equipo desde una sola plataforma.
                    </p>

                    {/* Toggle de facturación */}
                    <div className="mt-6 flex flex-col items-center gap-2">
                        <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-1 text-xs text-slate-600">
                            <button
                                type="button"
                                onClick={() => setBillingPeriod('monthly')}
                                className={`rounded-full px-4 py-1.5 transition ${
                                    billingPeriod === 'monthly'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                Mensual
                            </button>
                            <button
                                type="button"
                                onClick={() => setBillingPeriod('yearly')}
                                className={`flex items-center gap-1 rounded-full px-4 py-1.5 transition ${
                                    billingPeriod === 'yearly'
                                        ? 'bg-sky-600 text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                Anual
                                <span className="text-[10px] font-semibold">-20%</span>
                            </button>
                        </div>
                        <p className="text-[11px] text-slate-500">
                            Cambia de plan o cancela cuando quieras, sin permanencias.
                        </p>
                    </div>
                </div>

                {/* ======= CARDS ======= */}
                <div className="mb-12 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.2fr)_minmax(0,1.05fr)]">
                    {plans.map((plan, index) => {
                        const isFree = plan.priceMonthly === 0;
                        const isCustom =
                            plan.priceMonthly === null && plan.priceYearly === null;
                        const isHighlight = plan.highlight;

                        let priceContent: JSX.Element;
                        if (isCustom) {
                            priceContent = (
                                <span className="text-2xl font-semibold text-slate-900">
                                    A medida
                                </span>
                            );
                        } else if (isFree) {
                            priceContent = (
                                <span className="text-3xl font-extrabold text-slate-900">
                                    Gratis
                                </span>
                            );
                        } else {
                            const value =
                                billingPeriod === 'monthly'
                                    ? plan.priceMonthly!
                                    : plan.priceYearly ?? plan.priceMonthly!;
                            priceContent = (
                                <div className="flex items-end gap-1">
                                    <span className="text-xs text-slate-500">S/</span>
                                    <span className="text-3xl font-extrabold text-slate-900">
                                        {value}
                                    </span>
                                    <span className="mb-[2px] text-xs text-slate-500">
                                        {billingPeriod === 'monthly'
                                            ? '/ mes'
                                            : '/ mes (anual)'}
                                    </span>
                                </div>
                            );
                        }

                        const buttonClasses =
                            plan.id === 'pro'
                                ? 'w-full rounded-full bg-sky-600 text-white hover:bg-sky-700 text-sm font-semibold'
                                : plan.id === 'corporate'
                                ? 'w-full rounded-full bg-slate-900 text-white hover:bg-black text-sm font-semibold'
                                : 'w-full rounded-full border border-slate-900 bg-white text-sm font-semibold text-slate-900 hover:bg-slate-900 hover:text-white';

                        // delay escalonado por tarjeta
                        const delay = 120 + index * 140; // ms

                        return (
                            <div
                                key={plan.id}
                                style={{
                                    transitionDelay: isAnimated ? `${delay}ms` : '0ms'
                                }}
                                className={`relative flex h-full transform flex-col rounded-3xl border bg-white transition-all duration-700 ease-out ${
                                    isAnimated
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-0 translate-y-6'
                                } ${
                                    isHighlight
                                        ? 'border-sky-400 shadow-[0_18px_50px_-28px_rgba(56,189,248,0.9)] lg:-mt-4'
                                        : 'border-slate-200 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)]'
                                }`}
                            >
                                {plan.badge && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <span className="inline-flex items-center rounded-full bg-sky-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
                                            {plan.badge}
                                        </span>
                                    </div>
                                )}

                                {/* Top strip */}
                                <div
                                    className={`h-1.5 w-full rounded-t-3xl ${
                                        plan.id === 'pro'
                                            ? 'bg-gradient-to-r from-sky-500 to-emerald-400'
                                            : 'bg-slate-100'
                                    }`}
                                />

                                {/* Content */}
                                <div className="flex flex-1 flex-col px-6 pb-6 pt-5 md:px-7 md:pt-6">
                                    {/* Header */}
                                    <div className="mb-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                            {plan.name}
                                        </p>
                                        <h2 className="mt-1 text-base font-semibold text-slate-900">
                                            {plan.label}
                                        </h2>
                                        <p className="mt-2 text-xs text-slate-500">
                                            {plan.description}
                                        </p>
                                    </div>

                                    {/* Price */}
                                    <div className="mb-5">
                                        {priceContent}
                                        {!isCustom && !isFree && (
                                            <p className="mt-1 text-[11px] text-slate-500">
                                                {billingPeriod === 'yearly'
                                                    ? 'Pagas 12 meses con descuento por pago anual.'
                                                    : 'Puedes cambiar a anual en cualquier momento.'}
                                            </p>
                                        )}
                                        {isFree && (
                                            <p className="mt-1 text-[11px] text-slate-500">
                                                Siempre podrás subir a Pro sin perder tu perfil.
                                            </p>
                                        )}
                                        {isCustom && (
                                            <p className="mt-1 text-[11px] text-slate-500">
                                                Cotizamos según puntos de venta, equipo y necesidades.
                                            </p>
                                        )}
                                        <p className="mt-2 text-xs text-slate-500">
                                            {plan.note}
                                        </p>
                                    </div>

                                    {/* Features */}
                                    <ul className="mb-6 flex-1 space-y-2.5">
                                        {plan.features.map((feature) => (
                                            <FeatureItem key={feature} label={feature} />
                                        ))}
                                    </ul>

                                    {/* CTA */}
                                    <div className="pt-2">
                                        <Link href={plan.href}>
                                            <Button className={buttonClasses} size="lg">
                                                {plan.cta}
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ======= BLOQUE INFORMATIVO EXTRA ======= */}
                <div
                    className={`mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-slate-50 px-6 py-6 shadow-[0_14px_40px_-30px_rgba(15,23,42,0.4)] md:px-8 transform transition-all duration-700 ease-out ${
                        isAnimated
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-5'
                    }`}
                    style={{
                        transitionDelay: isAnimated ? '560ms' : '0ms'
                    }}
                >
                    <h3 className="mb-3 text-sm font-semibold text-slate-900">
                        Tribio está pensado para que vendas rápido, sin complicarte con
                        sistemas gigantes.
                    </h3>
                    <div className="grid gap-3 md:grid-cols-2">
                        <SimpleBullet text="Diseños inspirados en las mejores experiencias de link-in-bio, optimizados para móviles y tarjetas NFC." />
                        <SimpleBullet text="Actualizaciones constantes de la plataforma sin interrumpir tu negocio." />
                        <SimpleBullet text="Plantillas listas para tiendas, servicios, restaurantes, gimnasios, academias y más." />
                        <SimpleBullet text="Infraestructura segura en la nube para que tu mini tienda esté disponible 24/7." />
                    </div>
                </div>
            </div>
        </section>
    );
}
