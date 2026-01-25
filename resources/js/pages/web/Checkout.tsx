import { useState, useMemo, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import WebLayout from '@/layouts/WebLayout';

type BillingPeriod = 'monthly' | 'yearly';

type NfcCardType = 'none' | 'pvc' | 'madera' | 'metal';

type NfcCard = {
    id: NfcCardType;
    name: string;
    price: number;
    description: string;
    image?: string;
};

const nfcCards: NfcCard[] = [
    {
        id: 'none',
        name: 'Sin tarjeta NFC',
        price: 0,
        description: 'Solo quiero el plan digital por ahora',
    },
    {
        id: 'pvc',
        name: 'Tarjeta PVC',
        price: 30,
        description: 'Material resistente, ideal para uso diario',
    },
    {
        id: 'madera',
        name: 'Tarjeta Madera',
        price: 50,
        description: 'Acabado premium eco-friendly',
    },
    {
        id: 'metal',
        name: 'Tarjeta Metal',
        price: 70,
        description: 'Acabado premium, elegante y duradero',
    },
];

type Plan = {
    id: 'personal' | 'pro' | 'corporate';
    name: string;
    label: string;
    priceMonthly: number | null;
    priceYearly?: number | null;
    features: string[];
};

const plans: Plan[] = [
    {
        id: 'personal',
        name: 'Personal',
        label: 'Tu tarjeta digital siempre lista.',
        priceMonthly: 0,
        priceYearly: 0,
        features: [
            'Perfil personal Tribio',
            'Enlace único para compartir',
            'Botones para redes sociales',
            'Compatible con tarjeta NFC',
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        label: 'Todo tu negocio en un solo link.',
        priceMonthly: 29,
        priceYearly: 24,
        features: [
            'Mini tienda + link-in-bio',
            'Pasarela de pagos integrada',
            'Gestión de stock',
            'Pedidos o reservas de citas',
            'Notificaciones por WhatsApp',
            'Reseñas de clientes',
        ],
    },
    {
        id: 'corporate',
        name: 'Corporativo',
        label: 'Para equipos y cadenas.',
        priceMonthly: null,
        priceYearly: null,
        features: [
            'Todo lo de Pro',
            'Múltiples usuarios',
            'Vista matriz con sucursales',
            'Reportes avanzados',
            'Soporte prioritario',
        ],
    },
];

type PageProps = {
    slug?: string;
    plan?: 'personal' | 'pro' | 'corporate';
};

export default function Checkout() {
    const pageProps = usePage().props as PageProps;
    const initialSlug = pageProps.slug || '';
    const initialPlan = pageProps.plan || 'pro';

    // Form state - inicializado con los props de Inertia
    const [slug, setSlug] = useState(() => initialSlug);
    const [selectedPlan, setSelectedPlan] = useState<'personal' | 'pro' | 'corporate'>(
        () => initialPlan as 'personal' | 'pro' | 'corporate'
    );
    const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
    const [selectedNfcCard, setSelectedNfcCard] = useState<NfcCardType>('none');

    // Contact info
    const [businessName, setBusinessName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);

    const currentPlan = useMemo(
        () => plans.find((p) => p.id === selectedPlan) || plans[1],
        [selectedPlan]
    );

    const currentNfcCard = useMemo(
        () => nfcCards.find((c) => c.id === selectedNfcCard) || nfcCards[0],
        [selectedNfcCard]
    );

    const planPrice = useMemo(() => {
        if (currentPlan.priceMonthly === null) return 0;
        if (currentPlan.priceMonthly === 0) return 0;
        return billingPeriod === 'yearly'
            ? (currentPlan.priceYearly ?? currentPlan.priceMonthly)
            : currentPlan.priceMonthly;
    }, [currentPlan, billingPeriod]);

    const totalPrice = useMemo(() => {
        return planPrice + currentNfcCard.price;
    }, [planPrice, currentNfcCard]);

    const isFormValid = useMemo(() => {
        return (
            slug.trim().length >= 3 &&
            businessName.trim().length >= 2 &&
            email.trim().length >= 5 &&
            phone.trim().length >= 6 &&
            acceptTerms
        );
    }, [slug, businessName, email, phone, acceptTerms]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        // TODO: Implement actual checkout logic
        console.log({
            slug,
            plan: selectedPlan,
            billingPeriod,
            nfcCard: selectedNfcCard,
            businessName,
            email,
            phone,
        });
    };

    return (
        <WebLayout showFooter={true}>
            <Head title="Registrar mi negocio - Tribio" />

            <div className="min-h-screen bg-slate-50 pt-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                            Completa tu registro en Tribio
                        </h1>
                        <p className="mt-2 text-slate-600">
                            Configura tu perfil y empieza a vender desde un solo link
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-[1fr_380px] gap-8">
                        {/* Left Panel - Form */}
                        <div className="space-y-6">
                            {/* Tu enlace Tribio */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-sm font-bold">
                                        1
                                    </span>
                                    Tu enlace Tribio
                                </h2>

                                <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-3 border border-slate-200">
                                    <span className="text-slate-500 font-medium text-sm">
                                        tribio.info/
                                    </span>
                                    <input
                                        type="text"
                                        value={slug}
                                        onChange={(e) =>
                                            setSlug(
                                                e.target.value
                                                    .toLowerCase()
                                                    .replace(/[^a-z0-9\-_]/g, '')
                                            )
                                        }
                                        placeholder="tu_negocio"
                                        className="flex-1 bg-white rounded-lg px-3 py-2 text-sm text-sky-600 font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent placeholder:text-slate-400 placeholder:font-normal"
                                    />
                                </div>
                                {slug.length > 0 && slug.length < 3 && (
                                    <p className="mt-2 text-xs text-amber-600">
                                        El enlace debe tener al menos 3 caracteres
                                    </p>
                                )}
                            </div>

                            {/* Selecciona tu plan */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-sm font-bold">
                                        2
                                    </span>
                                    Selecciona tu plan
                                </h2>

                                {/* Billing toggle */}
                                <div className="flex justify-center mb-4">
                                    <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-1 text-xs">
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
                                </div>

                                {/* Plan cards */}
                                <div className="grid sm:grid-cols-3 gap-3">
                                    {plans.map((plan) => {
                                        const isSelected = selectedPlan === plan.id;
                                        const isFree = plan.priceMonthly === 0;
                                        const isCustom = plan.priceMonthly === null;

                                        let priceLabel: string;
                                        if (isCustom) {
                                            priceLabel = 'A medida';
                                        } else if (isFree) {
                                            priceLabel = 'Gratis';
                                        } else {
                                            const price =
                                                billingPeriod === 'yearly'
                                                    ? (plan.priceYearly ?? plan.priceMonthly)
                                                    : plan.priceMonthly;
                                            priceLabel = `S/${price}/mes`;
                                        }

                                        return (
                                            <button
                                                key={plan.id}
                                                type="button"
                                                onClick={() =>
                                                    plan.id !== 'corporate' &&
                                                    setSelectedPlan(plan.id)
                                                }
                                                disabled={plan.id === 'corporate'}
                                                className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                                                    isSelected
                                                        ? 'border-sky-500 bg-sky-50'
                                                        : 'border-slate-200 hover:border-slate-300'
                                                } ${plan.id === 'corporate' ? 'opacity-60 cursor-not-allowed' : ''}`}
                                            >
                                                {isSelected && (
                                                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center">
                                                        <svg
                                                            className="w-3 h-3 text-white"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={3}
                                                                d="M5 13l4 4L19 7"
                                                            />
                                                        </svg>
                                                    </div>
                                                )}

                                                {plan.id === 'pro' && (
                                                    <span className="absolute -top-2 left-3 bg-sky-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                                        Popular
                                                    </span>
                                                )}

                                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                    {plan.name}
                                                </p>
                                                <p className="mt-1 text-lg font-bold text-slate-900">
                                                    {priceLabel}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                                                    {plan.label}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Features list */}
                                <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs font-semibold text-slate-700 mb-2">
                                        Incluido en {currentPlan.name}:
                                    </p>
                                    <ul className="grid sm:grid-cols-2 gap-1.5">
                                        {currentPlan.features.map((feature) => (
                                            <li
                                                key={feature}
                                                className="flex items-start gap-1.5 text-xs text-slate-600"
                                            >
                                                <span className="mt-0.5 text-emerald-500">
                                                    <svg
                                                        className="w-3.5 h-3.5"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Tarjeta NFC */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-sm font-bold">
                                        3
                                    </span>
                                    Tarjeta NFC (opcional)
                                </h2>

                                <div className="grid sm:grid-cols-2 gap-3">
                                    {nfcCards.map((card) => {
                                        const isSelected = selectedNfcCard === card.id;

                                        return (
                                            <button
                                                key={card.id}
                                                type="button"
                                                onClick={() => setSelectedNfcCard(card.id)}
                                                className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                                                    isSelected
                                                        ? 'border-sky-500 bg-sky-50'
                                                        : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                            >
                                                {isSelected && (
                                                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center">
                                                        <svg
                                                            className="w-3 h-3 text-white"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={3}
                                                                d="M5 13l4 4L19 7"
                                                            />
                                                        </svg>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <p className="font-semibold text-slate-900">
                                                        {card.name}
                                                    </p>
                                                    <p className="font-bold text-slate-900">
                                                        {card.price === 0
                                                            ? 'Gratis'
                                                            : `S/${card.price}`}
                                                    </p>
                                                </div>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {card.description}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>

                                {selectedNfcCard !== 'none' && (
                                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0">
                                                <svg
                                                    className="w-5 h-5 text-amber-500"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-amber-800">
                                                    Importante sobre tu tarjeta NFC
                                                </p>
                                                <p className="mt-1 text-xs text-amber-700">
                                                    Luego de completar el pago, nos pondremos en
                                                    contacto contigo por WhatsApp para coordinar el
                                                    diseño personalizado de tu tarjeta NFC.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Datos de contacto */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-sm font-bold">
                                        4
                                    </span>
                                    Datos de contacto
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Nombre del negocio
                                        </label>
                                        <input
                                            type="text"
                                            value={businessName}
                                            onChange={(e) => setBusinessName(e.target.value)}
                                            placeholder="Ej: Barbería Don Carlos"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent placeholder:text-slate-400 placeholder:font-normal"
                                        />
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Correo electrónico
                                            </label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="tu@email.com"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent placeholder:text-slate-400 placeholder:font-normal"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                WhatsApp
                                            </label>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="+51 999 999 999"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent placeholder:text-slate-400 placeholder:font-normal"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="terms"
                                            checked={acceptTerms}
                                            onChange={(e) => setAcceptTerms(e.target.checked)}
                                            className="mt-1 w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                        />
                                        <label
                                            htmlFor="terms"
                                            className="text-xs text-slate-600"
                                        >
                                            Acepto los{' '}
                                            <a
                                                href="/terminos"
                                                className="text-sky-600 hover:underline"
                                            >
                                                términos y condiciones
                                            </a>{' '}
                                            y la{' '}
                                            <a
                                                href="/privacidad"
                                                className="text-sky-600 hover:underline"
                                            >
                                                política de privacidad
                                            </a>{' '}
                                            de Tribio.
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Submit button - mobile only */}
                            <div className="lg:hidden">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={!isFormValid}
                                    className={`w-full py-4 rounded-xl font-semibold text-sm transition ${
                                        isFormValid
                                            ? 'bg-sky-600 text-white hover:bg-sky-700'
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}
                                >
                                    {totalPrice === 0
                                        ? 'Crear mi cuenta gratis'
                                        : `Pagar S/${totalPrice} y crear cuenta`}
                                </button>
                            </div>
                        </div>

                        {/* Right Panel - Order Summary */}
                        <div className="lg:sticky lg:top-24 h-fit">
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                    Resumen de tu pedido
                                </h3>

                                {/* Slug preview */}
                                {slug && (
                                    <div className="mb-4 p-3 bg-slate-50 rounded-xl">
                                        <p className="text-xs text-slate-500 mb-1">Tu enlace:</p>
                                        <p className="text-sm font-medium text-sky-600">
                                            tribio.info/{slug || 'tu_negocio'}
                                        </p>
                                    </div>
                                )}

                                {/* Items */}
                                <div className="space-y-3 border-b border-slate-100 pb-4">
                                    {/* Plan */}
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-slate-900">
                                                Plan {currentPlan.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {billingPeriod === 'yearly'
                                                    ? 'Facturación anual'
                                                    : 'Facturación mensual'}
                                            </p>
                                        </div>
                                        <p className="font-semibold text-slate-900">
                                            {planPrice === 0 ? 'Gratis' : `S/${planPrice}/mes`}
                                        </p>
                                    </div>

                                    {/* NFC Card */}
                                    {selectedNfcCard !== 'none' && (
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    {currentNfcCard.name}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Pago único
                                                </p>
                                            </div>
                                            <p className="font-semibold text-slate-900">
                                                S/{currentNfcCard.price}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Total */}
                                <div className="pt-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <p className="text-lg font-bold text-slate-900">Total</p>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-slate-900">
                                                {totalPrice === 0 ? 'Gratis' : `S/${totalPrice}`}
                                            </p>
                                            {planPrice > 0 && (
                                                <p className="text-xs text-slate-500">
                                                    + S/{planPrice}/mes después
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={!isFormValid}
                                        className={`w-full py-4 rounded-xl font-semibold text-sm transition ${
                                            isFormValid
                                                ? 'bg-sky-600 text-white hover:bg-sky-700'
                                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {totalPrice === 0
                                            ? 'Crear mi cuenta gratis'
                                            : `Pagar S/${totalPrice} y crear cuenta`}
                                    </button>

                                    <p className="mt-3 text-center text-xs text-slate-500">
                                        Pago seguro procesado por Mercado Pago
                                    </p>
                                </div>

                                {/* Guarantee */}
                                <div className="mt-4 p-3 bg-emerald-50 rounded-xl">
                                    <div className="flex gap-2">
                                        <svg
                                            className="w-5 h-5 text-emerald-500 flex-shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                            />
                                        </svg>
                                        <div>
                                            <p className="text-xs font-medium text-emerald-800">
                                                Garantía de satisfacción
                                            </p>
                                            <p className="text-xs text-emerald-700">
                                                7 días para probar. Si no te convence, te devolvemos
                                                el dinero.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Help */}
                            <div className="mt-4 text-center">
                                <p className="text-xs text-slate-500">
                                    ¿Tienes dudas?{' '}
                                    <a
                                        href="https://wa.me/51999999999"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sky-600 hover:underline"
                                    >
                                        Escríbenos por WhatsApp
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </WebLayout>
    );
}
