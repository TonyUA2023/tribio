import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import WebLayout from '@/layouts/WebLayout';
import { Button } from '@/components/ui/button';

/* === Tipos de tarjetas === */
const cardTypes = {
    pvc: {
        id: 'pvc',
        name: 'Tarjeta PVC',
        material: 'PVC Premium',
        priceNewAccount: 30,      // Crear cuenta nueva: mejor precio
        priceExistingAccount: 40, // Ya tiene cuenta: +S/10
        priceNoAccount: 50,       // Sin cuenta: +S/20
        image: '/images/cards/card-pvc.png',
        gradient: 'from-sky-500 to-blue-600',
        description: 'Resistente al agua, diseño full color, durabilidad 5+ años',
    },
    wood: {
        id: 'wood',
        name: 'Tarjeta Madera',
        material: 'Bambú Natural',
        priceNewAccount: 50,
        priceExistingAccount: 60,
        priceNoAccount: 70,
        image: '/images/cards/card-wood.png',
        gradient: 'from-amber-600 to-amber-800',
        description: 'Eco-friendly, grabado láser premium, textura natural única',
    },
    metal: {
        id: 'metal',
        name: 'Tarjeta Metal',
        material: 'Acero Inoxidable',
        priceNewAccount: 70,
        priceExistingAccount: 80,
        priceNoAccount: 90,
        image: '/images/cards/card-metal.png',
        gradient: 'from-zinc-400 to-zinc-600',
        description: 'Acabado espejo o mate, grabado de precisión, durabilidad de por vida',
    },
};

/* === Pasos del checkout === */
type Step = 'card' | 'account' | 'details' | 'payment';

interface FormData {
    cardType: keyof typeof cardTypes;
    quantity: number;
    hasAccount: boolean | null;
    wantsAccount: boolean;
    // Datos del negocio (si tiene/quiere cuenta)
    businessName: string;
    businessSlug: string;
    businessCategory: string;
    // Datos personales
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    // Notas para diseño
    designNotes: string;
}

export default function ComprarTarjetaNfc() {
    // Obtener tipo de tarjeta desde URL
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const initialCardType = (urlParams?.get('tipo') as keyof typeof cardTypes) || 'pvc';

    const [currentStep, setCurrentStep] = useState<Step>('card');
    const [formData, setFormData] = useState<FormData>({
        cardType: initialCardType,
        quantity: 1,
        hasAccount: null,
        wantsAccount: false,
        businessName: '',
        businessSlug: '',
        businessCategory: '',
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        designNotes: '',
    });

    const selectedCard = cardTypes[formData.cardType];

    // Calcular precio según opción de cuenta
    // - Crear cuenta nueva: mejor precio (priceNewAccount)
    // - Ya tiene cuenta: +S/10 (priceExistingAccount)
    // - Sin cuenta: precio más alto (priceNoAccount)
    const pricePerCard = formData.wantsAccount
        ? selectedCard.priceNewAccount
        : formData.hasAccount
            ? selectedCard.priceExistingAccount
            : selectedCard.priceNoAccount;

    const subtotal = pricePerCard * formData.quantity;
    // Descuento comparado con precio sin cuenta
    const discount = formData.wantsAccount
        ? (selectedCard.priceNoAccount - selectedCard.priceNewAccount) * formData.quantity  // S/20 de descuento
        : formData.hasAccount
            ? (selectedCard.priceNoAccount - selectedCard.priceExistingAccount) * formData.quantity  // S/10 de descuento
            : 0;
    // Primer mes GRATIS al crear cuenta con la tarjeta
    const monthlyPlan = 0; // El primer mes es gratis
    const total = subtotal; // Solo paga la tarjeta

    // Steps config
    const steps = [
        { id: 'card', label: 'Tarjeta', icon: '💳' },
        { id: 'account', label: 'Cuenta', icon: '🏪' },
        { id: 'details', label: 'Datos', icon: '📝' },
        { id: 'payment', label: 'Pago', icon: '💰' },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === currentStep);

    const canProceed = () => {
        switch (currentStep) {
            case 'card':
                // Requiere cantidad + seleccionar una opción de cuenta (tiene, quiere crear, o solo tarjeta)
                const hasSelectedAccountOption = formData.hasAccount === true ||
                    (formData.hasAccount === false && formData.wantsAccount) ||
                    (formData.hasAccount === false && !formData.wantsAccount);
                return formData.quantity >= 1 && hasSelectedAccountOption && formData.hasAccount !== null;
            case 'account':
                // Si tiene cuenta: necesita iniciar sesión (por ahora siempre true, el login redirige)
                // Si no tiene cuenta y quiere crear: puede continuar
                // Si no tiene cuenta y no quiere crear: puede continuar
                return true;
            case 'details':
                return formData.fullName && formData.email && formData.phone && formData.city;
            case 'payment':
                return true;
            default:
                return false;
        }
    };

    const nextStep = () => {
        const stepOrder: Step[] = ['card', 'account', 'details', 'payment'];
        const currentIndex = stepOrder.indexOf(currentStep);

        // Si no tiene cuenta y no quiere crear una, saltar directo a datos
        if (currentStep === 'account' && formData.hasAccount === false && !formData.wantsAccount) {
            setCurrentStep('details');
            return;
        }

        if (currentIndex < stepOrder.length - 1) {
            setCurrentStep(stepOrder[currentIndex + 1]);
        }
    };

    const prevStep = () => {
        const stepOrder: Step[] = ['card', 'account', 'details', 'payment'];
        const currentIndex = stepOrder.indexOf(currentStep);

        // Si está en details y no tiene cuenta, volver a account (o card si saltó account)
        if (currentStep === 'details' && formData.hasAccount === false && !formData.wantsAccount) {
            setCurrentStep('account');
            return;
        }

        if (currentIndex > 0) {
            setCurrentStep(stepOrder[currentIndex - 1]);
        }
    };

    const handleSubmit = () => {
        // Aquí iría la integración con pasarela de pago (Mercado Pago, Stripe, etc.)
        console.log('Datos del pedido:', formData);
        alert('¡Pedido enviado! Nos contactaremos contigo pronto para coordinar el diseño de tu tarjeta.');
    };

    return (
        <>
            <Head>
                <title>Comprar Tarjeta NFC - Tribio</title>
                <meta name="description" content="Compra tu tarjeta NFC inteligente Tribio. PVC, Madera o Metal. Incluye diseño personalizado." />
            </Head>

            <WebLayout>
                <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 md:py-12">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Volver al inicio
                            </Link>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
                                Comprar Tarjeta NFC
                            </h1>
                            <p className="text-slate-600">
                                Completa tu pedido en pocos pasos
                            </p>
                        </div>

                        {/* Progress Steps */}
                        <div className="flex items-center justify-center mb-10">
                            <div className="flex items-center gap-2 md:gap-4">
                                {steps.map((step, index) => (
                                    <div key={step.id} className="flex items-center">
                                        <button
                                            onClick={() => index <= currentStepIndex && setCurrentStep(step.id as Step)}
                                            disabled={index > currentStepIndex}
                                            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                                                currentStep === step.id
                                                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                                                    : index < currentStepIndex
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-slate-100 text-slate-400'
                                            }`}
                                        >
                                            <span>{step.icon}</span>
                                            <span className="hidden md:inline">{step.label}</span>
                                        </button>
                                        {index < steps.length - 1 && (
                                            <div className={`w-6 md:w-12 h-0.5 mx-1 ${
                                                index < currentStepIndex ? 'bg-emerald-400' : 'bg-slate-200'
                                            }`} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Main Content */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 md:p-8">
                                    {/* Step 1: Seleccionar Tarjeta */}
                                    {currentStep === 'card' && (
                                        <div className="space-y-6">
                                            <div>
                                                <h2 className="text-xl font-bold text-slate-900 mb-2">
                                                    1. Selecciona tu tarjeta
                                                </h2>
                                                <p className="text-sm text-slate-500">
                                                    Elige el material y la cantidad de tarjetas que necesitas.
                                                </p>
                                            </div>

                                            {/* Card Type Selection */}
                                            <div className="grid md:grid-cols-3 gap-4">
                                                {Object.values(cardTypes).map((card) => (
                                                    <button
                                                        key={card.id}
                                                        onClick={() => setFormData({ ...formData, cardType: card.id as keyof typeof cardTypes })}
                                                        className={`relative p-4 rounded-2xl border-2 transition-all text-left ${
                                                            formData.cardType === card.id
                                                                ? 'border-sky-500 bg-sky-50 shadow-lg'
                                                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        {formData.cardType === card.id && (
                                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center">
                                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        )}

                                                        {/* Card Preview */}
                                                        <div className={`h-20 rounded-xl bg-gradient-to-r ${card.gradient} mb-3 flex items-center justify-center`}>
                                                            <span className="text-white text-2xl">💳</span>
                                                        </div>

                                                        <h3 className="font-bold text-slate-900">{card.name}</h3>
                                                        <p className="text-xs text-slate-500 mb-2">{card.material}</p>
                                                        <div className="space-y-0.5">
                                                            <p className="text-lg font-bold text-emerald-600">
                                                                S/ {card.priceNewAccount}
                                                                <span className="text-[10px] font-normal ml-1">cuenta nueva</span>
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                S/ {card.priceExistingAccount} con cuenta
                                                            </p>
                                                            <p className="text-xs text-slate-400 line-through">
                                                                S/ {card.priceNoAccount} sin cuenta
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Quantity */}
                                            <div className="bg-slate-50 rounded-2xl p-4">
                                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                                    Cantidad de tarjetas
                                                </label>
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => setFormData({ ...formData, quantity: Math.max(1, formData.quantity - 1) })}
                                                        className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
                                                    >
                                                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                        </svg>
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={formData.quantity}
                                                        onChange={(e) => setFormData({ ...formData, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                                                        className="w-20 text-center text-2xl font-bold text-slate-900 bg-transparent border-none focus:outline-none"
                                                    />
                                                    <button
                                                        onClick={() => setFormData({ ...formData, quantity: formData.quantity + 1 })}
                                                        className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
                                                    >
                                                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                {formData.quantity >= 5 && (
                                                    <p className="mt-2 text-xs text-emerald-600 font-medium">
                                                        ✨ ¡Envío gratis por comprar 5 o más tarjetas!
                                                    </p>
                                                )}
                                            </div>

                                            {/* Info about design */}
                                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                                                <div className="flex gap-3">
                                                    <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                                        <span className="text-lg">🎨</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-amber-900 text-sm">Diseño personalizado incluido</h4>
                                                        <p className="text-xs text-amber-700 mt-1">
                                                            Nos contactaremos contigo para crear el diseño de tu tarjeta con tu logo, colores y estilo de marca.
                                                            <strong> Nosotros nos encargamos de todo.</strong>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Sección de Cuenta Tribio - Más llamativa */}
                                            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-xl">
                                                {/* Decoración de fondo */}
                                                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                                                <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                                                <div className="absolute right-12 bottom-8 w-16 h-16 bg-yellow-400/20 rounded-full blur-lg"></div>

                                                {/* Header con descuento destacado */}
                                                <div className="relative flex items-center justify-between mb-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                                            <span className="text-2xl">🏪</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-lg">¿Eres parte de Tribio?</h4>
                                                            <p className="text-emerald-100 text-sm">Obtén beneficios exclusivos</p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-full text-xs font-extrabold shadow-lg animate-pulse">
                                                        Hasta -S/ 20
                                                    </div>
                                                </div>

                                                {/* Opciones de cuenta */}
                                                <div className="relative grid md:grid-cols-3 gap-3">
                                                    {/* Opción 1: Ya tengo cuenta */}
                                                    <button
                                                        onClick={() => setFormData({ ...formData, hasAccount: true, wantsAccount: false })}
                                                        className={`relative p-4 rounded-xl border-2 transition-all text-left group ${
                                                            formData.hasAccount === true
                                                                ? 'border-white bg-white/20 backdrop-blur-sm shadow-lg scale-[1.02]'
                                                                : 'border-white/30 bg-white/10 hover:bg-white/15 hover:border-white/50'
                                                        }`}
                                                    >
                                                        {formData.hasAccount === true && (
                                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                                                                <svg className="w-4 h-4 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                        <div className="text-2xl mb-2">✅</div>
                                                        <p className="font-bold text-white text-sm mb-1">Ya tengo cuenta</p>
                                                        <p className="text-emerald-100 text-xs">Inicia sesión para el descuento</p>
                                                        <div className="mt-2 inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" />
                                                            </svg>
                                                            S/ 10 OFF
                                                        </div>
                                                    </button>

                                                    {/* Opción 2: Quiero crear cuenta */}
                                                    <button
                                                        onClick={() => setFormData({ ...formData, hasAccount: false, wantsAccount: true })}
                                                        className={`relative p-4 rounded-xl border-2 transition-all text-left group ${
                                                            formData.hasAccount === false && formData.wantsAccount
                                                                ? 'border-white bg-white/20 backdrop-blur-sm shadow-lg scale-[1.02]'
                                                                : 'border-white/30 bg-white/10 hover:bg-white/15 hover:border-white/50'
                                                        }`}
                                                    >
                                                        {formData.hasAccount === false && formData.wantsAccount && (
                                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                                                                <svg className="w-4 h-4 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-1 mb-2">
                                                            <span className="text-2xl">🚀</span>
                                                            <span className="bg-yellow-400 text-yellow-900 text-[9px] font-bold px-1.5 py-0.5 rounded">MEJOR PRECIO</span>
                                                        </div>
                                                        <p className="font-bold text-white text-sm mb-1">Quiero crear cuenta</p>
                                                        <p className="text-emerald-100 text-xs">Mejor precio + 1er mes gratis</p>
                                                        <div className="mt-2 inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" />
                                                            </svg>
                                                            S/ 20 OFF + 1er mes GRATIS
                                                        </div>
                                                    </button>

                                                    {/* Opción 3: Solo la tarjeta */}
                                                    <button
                                                        onClick={() => setFormData({ ...formData, hasAccount: false, wantsAccount: false })}
                                                        className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                                                            formData.hasAccount === false && !formData.wantsAccount
                                                                ? 'border-white/60 bg-white/10 backdrop-blur-sm shadow-lg'
                                                                : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
                                                        }`}
                                                    >
                                                        {formData.hasAccount === false && !formData.wantsAccount && (
                                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center shadow-lg">
                                                                <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                        <div className="text-2xl mb-2 opacity-70">💳</div>
                                                        <p className="font-bold text-white/90 text-sm mb-1">Solo la tarjeta</p>
                                                        <p className="text-emerald-200/70 text-xs">Sin cuenta Tribio</p>
                                                        <div className="mt-2 inline-flex items-center gap-1 bg-white/10 text-white/70 text-[10px] font-medium px-2 py-0.5 rounded-full">
                                                            Precio regular
                                                        </div>
                                                    </button>
                                                </div>

                                                {/* Info adicional */}
                                                <div className="relative mt-4 pt-4 border-t border-white/20">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <div className="flex items-center gap-4">
                                                            <span className="flex items-center gap-1 text-emerald-100">
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                                Tarjeta: pago único
                                                            </span>
                                                            <span className="flex items-center gap-1 text-yellow-300">
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                                1er mes GRATIS (cuenta nueva)
                                                            </span>
                                                        </div>
                                                        <span className="text-yellow-300 font-semibold">
                                                            Ahorras hasta S/ {(selectedCard.priceNoAccount - selectedCard.priceNewAccount) * formData.quantity + 29}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 2: Cuenta Tribio - Compacto y directo */}
                                    {currentStep === 'account' && (
                                        <div className="space-y-6">
                                            {/* Si TIENE cuenta - Solo login */}
                                            {formData.hasAccount === true && (
                                                <>
                                                    <div>
                                                        <h2 className="text-xl font-bold text-slate-900 mb-2">
                                                            2. Accede a tu cuenta
                                                        </h2>
                                                        <p className="text-sm text-slate-500">
                                                            Inicia sesión para vincular la tarjeta y aplicar tu descuento automáticamente.
                                                        </p>
                                                    </div>

                                                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl">
                                                        <div className="flex items-center gap-4 mb-5">
                                                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-lg">Inicia sesión</h4>
                                                                <p className="text-emerald-100 text-sm">Tu descuento se aplicará automáticamente</p>
                                                            </div>
                                                            <div className="ml-auto bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                                                                -S/ {(selectedCard.priceNoAccount - selectedCard.priceExistingAccount) * formData.quantity}
                                                            </div>
                                                        </div>

                                                        <Link href="/login?redirect=/comprar-tarjeta-nfc" className="block">
                                                            <Button className="w-full bg-white text-emerald-600 hover:bg-emerald-50 font-bold py-3.5 rounded-xl shadow-lg">
                                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                                                </svg>
                                                                Iniciar sesión
                                                            </Button>
                                                        </Link>

                                                        <p className="text-center text-emerald-100 text-sm mt-4">
                                                            ¿No tienes cuenta?{' '}
                                                            <button
                                                                onClick={() => setFormData({ ...formData, hasAccount: false, wantsAccount: true })}
                                                                className="font-semibold text-white hover:underline"
                                                            >
                                                                Crea una gratis
                                                            </button>
                                                        </p>
                                                    </div>
                                                </>
                                            )}

                                            {/* Si quiere CREAR cuenta - Formulario compacto */}
                                            {formData.hasAccount === false && formData.wantsAccount && (
                                                <>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h2 className="text-xl font-bold text-slate-900 mb-1">
                                                                2. Crea tu cuenta Tribio
                                                            </h2>
                                                            <p className="text-sm text-slate-500">
                                                                Completa los datos de tu negocio para obtener el descuento
                                                            </p>
                                                        </div>
                                                        <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold">
                                                            -S/ {(selectedCard.priceNoAccount - selectedCard.priceNewAccount) * formData.quantity}
                                                        </div>
                                                    </div>

                                                    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
                                                        <div className="grid md:grid-cols-2 gap-4">
                                                            <label className="block">
                                                                <span className="text-sm font-medium text-slate-700">Nombre del negocio *</span>
                                                                <input
                                                                    type="text"
                                                                    value={formData.businessName}
                                                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                                                    placeholder="Mi Barbería, Café Amate..."
                                                                    className="mt-1 w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400"
                                                                />
                                                            </label>

                                                            <label className="block">
                                                                <span className="text-sm font-medium text-slate-700">Tu link en Tribio</span>
                                                                <div className="mt-1 flex items-center">
                                                                    <span className="bg-slate-100 px-3 py-2.5 rounded-l-lg text-sm text-slate-600 font-medium border border-r-0 border-slate-300">
                                                                        tribio.info/
                                                                    </span>
                                                                    <input
                                                                        type="text"
                                                                        value={formData.businessSlug}
                                                                        onChange={(e) => setFormData({ ...formData, businessSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                                                        placeholder="mi-negocio"
                                                                        className="flex-1 px-3 py-2.5 bg-white border border-slate-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400"
                                                                    />
                                                                </div>
                                                            </label>
                                                        </div>

                                                        <label className="block">
                                                            <span className="text-sm font-medium text-slate-700">Tipo de negocio</span>
                                                            <select
                                                                value={formData.businessCategory}
                                                                onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
                                                                className="mt-1 w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900 appearance-none cursor-pointer"
                                                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.25rem' }}
                                                            >
                                                                <option value="">Selecciona el tipo de negocio</option>
                                                                <option value="barberia">💈 Barbería</option>
                                                                <option value="salon-belleza">💅 Salón de Belleza / Spa</option>
                                                                <option value="restaurante">🍽️ Restaurante / Café / Bar</option>
                                                                <option value="tienda">🛍️ Tienda / Retail</option>
                                                                <option value="gimnasio">💪 Gimnasio / Fitness</option>
                                                                <option value="salud">🏥 Salud / Clínica</option>
                                                                <option value="profesional">💼 Servicios Profesionales</option>
                                                                <option value="personal">👤 Marca Personal</option>
                                                                <option value="otro">📋 Otro</option>
                                                            </select>
                                                        </label>

                                                        <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                                    <span className="text-xl">🎁</span>
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-slate-900 text-sm">Plan Tribio Pro</p>
                                                                    <p className="text-xs text-slate-500">Tienda online + gestión de negocio</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm text-slate-400 line-through">S/ 29</span>
                                                                    <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">GRATIS</span>
                                                                </div>
                                                                <p className="text-xs text-emerald-600 font-medium">Primer mes incluido</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => setFormData({ ...formData, wantsAccount: false })}
                                                        className="w-full text-center text-sm text-slate-500 hover:text-slate-700"
                                                    >
                                                        Prefiero continuar sin cuenta
                                                    </button>
                                                </>
                                            )}

                                            {/* Si NO quiere cuenta - Confirmación rápida */}
                                            {formData.hasAccount === false && !formData.wantsAccount && (
                                                <>
                                                    <div>
                                                        <h2 className="text-xl font-bold text-slate-900 mb-2">
                                                            2. Continuar sin cuenta
                                                        </h2>
                                                        <p className="text-sm text-slate-500">
                                                            Puedes comprar solo la tarjeta, pero te perderás el descuento.
                                                        </p>
                                                    </div>

                                                    {/* Resumen del precio sin cuenta */}
                                                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${selectedCard.gradient} flex items-center justify-center`}>
                                                                <span className="text-white text-2xl">💳</span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-slate-900">{selectedCard.name}</p>
                                                                <p className="text-sm text-slate-500">
                                                                    {formData.quantity} x S/ {selectedCard.priceWithoutAccount}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-2xl font-bold text-slate-900">S/ {selectedCard.priceWithoutAccount * formData.quantity}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Banner para reconsiderar */}
                                                    <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-2xl">💡</span>
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-sm">¿Seguro que no quieres el descuento?</p>
                                                                <p className="text-amber-100 text-xs">Ahorrarías S/ {(selectedCard.priceNoAccount - selectedCard.priceNewAccount) * formData.quantity} + 1er mes gratis</p>
                                                            </div>
                                                            <Button
                                                                onClick={() => setFormData({ ...formData, wantsAccount: true })}
                                                                size="sm"
                                                                className="bg-white text-amber-600 hover:bg-amber-50 font-semibold rounded-lg"
                                                            >
                                                                Quiero el descuento
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Info boxes compactos */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-sky-50 border border-sky-200 rounded-xl p-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">💳</span>
                                                        <div>
                                                            <p className="font-semibold text-sky-900 text-xs">Tarjeta NFC</p>
                                                            <p className="text-[10px] text-sky-700">Pago único, tuya para siempre</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">🎁</span>
                                                        <div>
                                                            <p className="font-semibold text-emerald-900 text-xs">Plan Tribio</p>
                                                            <p className="text-[10px] text-emerald-700">1er mes GRATIS, luego S/ 29/mes</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 3: Datos personales */}
                                    {currentStep === 'details' && (
                                        <div className="space-y-6">
                                            <div>
                                                <h2 className="text-xl font-bold text-slate-900 mb-2">
                                                    3. Datos de contacto y envío
                                                </h2>
                                                <p className="text-sm text-slate-500">
                                                    Ingresa tus datos para coordinar el diseño y envío de tu tarjeta.
                                                </p>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4">
                                                <label className="block md:col-span-2">
                                                    <span className="text-sm font-medium text-slate-700">Nombre completo *</span>
                                                    <input
                                                        type="text"
                                                        value={formData.fullName}
                                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                        placeholder="Juan Pérez"
                                                        className="mt-1 w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-900 placeholder:text-slate-400"
                                                    />
                                                </label>

                                                <label className="block">
                                                    <span className="text-sm font-medium text-slate-700">Email *</span>
                                                    <input
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        placeholder="juan@email.com"
                                                        className="mt-1 w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-900 placeholder:text-slate-400"
                                                    />
                                                </label>

                                                <label className="block">
                                                    <span className="text-sm font-medium text-slate-700">Teléfono / WhatsApp *</span>
                                                    <input
                                                        type="tel"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        placeholder="999 888 777"
                                                        className="mt-1 w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-900 placeholder:text-slate-400"
                                                    />
                                                </label>

                                                <label className="block">
                                                    <span className="text-sm font-medium text-slate-700">Ciudad *</span>
                                                    <input
                                                        type="text"
                                                        value={formData.city}
                                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                        placeholder="Lima, Huancayo, Arequipa..."
                                                        className="mt-1 w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-900 placeholder:text-slate-400"
                                                    />
                                                </label>

                                                <label className="block">
                                                    <span className="text-sm font-medium text-slate-700">Dirección de envío</span>
                                                    <input
                                                        type="text"
                                                        value={formData.address}
                                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                        placeholder="Av. Principal 123"
                                                        className="mt-1 w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-900 placeholder:text-slate-400"
                                                    />
                                                </label>
                                            </div>

                                            <label className="block">
                                                <span className="text-sm font-medium text-slate-700">Notas para el diseño (opcional)</span>
                                                <textarea
                                                    value={formData.designNotes}
                                                    onChange={(e) => setFormData({ ...formData, designNotes: e.target.value })}
                                                    placeholder="Colores preferidos, estilo, información que debe incluir la tarjeta..."
                                                    rows={3}
                                                    className="mt-1 w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-900 placeholder:text-slate-400 resize-none"
                                                />
                                            </label>

                                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                                <div className="flex gap-3">
                                                    <span className="text-xl">📞</span>
                                                    <div>
                                                        <h5 className="font-semibold text-amber-900 text-sm">Te contactaremos por WhatsApp</h5>
                                                        <p className="text-xs text-amber-700">
                                                            Después del pago, nos comunicaremos contigo para coordinar el diseño de tu tarjeta.
                                                            <strong> Nosotros creamos el diseño por ti.</strong>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 4: Pago */}
                                    {currentStep === 'payment' && (
                                        <div className="space-y-6">
                                            <div>
                                                <h2 className="text-xl font-bold text-slate-900 mb-2">
                                                    4. Confirma y paga
                                                </h2>
                                                <p className="text-sm text-slate-500">
                                                    Revisa tu pedido y selecciona el método de pago.
                                                </p>
                                            </div>

                                            {/* Order Summary */}
                                            <div className="bg-slate-50 rounded-2xl p-6">
                                                <h4 className="font-semibold text-slate-900 mb-4">Resumen del pedido</h4>

                                                <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
                                                    <div className={`w-16 h-10 rounded-lg bg-gradient-to-r ${selectedCard.gradient} flex items-center justify-center`}>
                                                        <span className="text-white">💳</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-slate-900">{selectedCard.name}</p>
                                                        <p className="text-xs text-slate-500">Cantidad: {formData.quantity}</p>
                                                    </div>
                                                    <p className="font-bold text-slate-900">S/ {subtotal}</p>
                                                </div>

                                                {(formData.hasAccount || formData.wantsAccount) && (
                                                    <div className="flex items-center justify-between py-3 border-b border-slate-200 text-emerald-600">
                                                        <div className="flex items-center gap-2">
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" />
                                                            </svg>
                                                            <span className="text-sm">Descuento Tribio</span>
                                                        </div>
                                                        <span className="font-semibold">-S/ {discount}</span>
                                                    </div>
                                                )}

                                                {formData.wantsAccount && (
                                                    <div className="flex items-center justify-between py-3 border-b border-slate-200 bg-emerald-50 -mx-6 px-6">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg">🎁</span>
                                                            <div>
                                                                <p className="text-sm font-medium text-emerald-800">Plan Tribio Pro</p>
                                                                <p className="text-xs text-emerald-600">Primer mes GRATIS</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-sm text-slate-400 line-through mr-2">S/ 29</span>
                                                            <span className="font-bold text-emerald-600">S/ 0</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {formData.businessSlug && (
                                                    <div className="py-3 border-b border-slate-200">
                                                        <p className="text-xs text-slate-500">Tu enlace Tribio:</p>
                                                        <p className="font-medium text-sky-600">tribio.info/{formData.businessSlug}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Payment Methods */}
                                            <div>
                                                <h4 className="font-semibold text-slate-900 mb-4">Método de pago</h4>
                                                <div className="grid gap-3">
                                                    <button className="flex items-center gap-4 p-4 rounded-xl border-2 border-sky-500 bg-sky-50">
                                                        <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                                                            <span className="text-white text-xs font-bold">MP</span>
                                                        </div>
                                                        <div className="flex-1 text-left">
                                                            <p className="font-semibold text-slate-900">Mercado Pago</p>
                                                            <p className="text-xs text-slate-500">Tarjeta, Yape, Plin, transferencia</p>
                                                        </div>
                                                        <div className="w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center">
                                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    </button>

                                                    <button className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-300 opacity-50 cursor-not-allowed">
                                                        <div className="w-12 h-8 bg-green-500 rounded flex items-center justify-center">
                                                            <span className="text-white text-lg">💵</span>
                                                        </div>
                                                        <div className="flex-1 text-left">
                                                            <p className="font-semibold text-slate-900">Transferencia directa</p>
                                                            <p className="text-xs text-slate-500">Próximamente</p>
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Terms */}
                                            <div className="text-xs text-slate-500 text-center">
                                                Al realizar el pago, aceptas nuestros{' '}
                                                <Link href="/terminos" className="text-sky-600 hover:underline">términos y condiciones</Link>
                                                {' '}y{' '}
                                                <Link href="/privacidad" className="text-sky-600 hover:underline">política de privacidad</Link>.
                                            </div>
                                        </div>
                                    )}

                                    {/* Navigation Buttons */}
                                    <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200">
                                        {/* Botón Atrás */}
                                        {currentStep !== 'card' ? (
                                            <Button
                                                variant="outline"
                                                onClick={prevStep}
                                                className="rounded-full"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                                Atrás
                                            </Button>
                                        ) : (
                                            <div />
                                        )}

                                        {/* Botón Continuar / Pagar */}
                                        {currentStep === 'payment' ? (
                                            <Button
                                                onClick={handleSubmit}
                                                className="rounded-full bg-emerald-500 hover:bg-emerald-600 px-8"
                                            >
                                                Pagar S/ {total}
                                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </Button>
                                        ) : currentStep === 'account' && formData.hasAccount === true ? (
                                            // Si tiene cuenta, el botón de login ya está arriba
                                            <Link href="/login?redirect=/comprar-tarjeta-nfc">
                                                <Button className="rounded-full bg-emerald-500 hover:bg-emerald-600">
                                                    Iniciar sesión
                                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
                                                    </svg>
                                                </Button>
                                            </Link>
                                        ) : currentStep === 'account' && formData.hasAccount === false && !formData.wantsAccount ? (
                                            // Sin cuenta y sin querer crear - botón directo a datos
                                            <Button
                                                onClick={nextStep}
                                                className="rounded-full bg-sky-500 hover:bg-sky-600"
                                            >
                                                Continuar sin cuenta
                                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={nextStep}
                                                disabled={!canProceed()}
                                                className="rounded-full bg-sky-500 hover:bg-sky-600"
                                            >
                                                Continuar
                                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar - Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sticky top-8">
                                    <h3 className="font-bold text-slate-900 mb-4">Tu pedido</h3>

                                    {/* Card Preview */}
                                    <div className={`h-32 rounded-2xl bg-gradient-to-r ${selectedCard.gradient} p-4 mb-4 flex flex-col justify-between`}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-white/80 text-xs">{selectedCard.material}</span>
                                            <span className="text-white text-lg">💳</span>
                                        </div>
                                        <div>
                                            <p className="text-white font-bold">{selectedCard.name}</p>
                                            <p className="text-white/70 text-xs">x{formData.quantity} unidades</p>
                                        </div>
                                    </div>

                                    {/* Price Breakdown */}
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Subtotal ({formData.quantity} tarjetas)</span>
                                            <span className="text-slate-900">S/ {pricePerCard * formData.quantity}</span>
                                        </div>

                                        {(formData.hasAccount || formData.wantsAccount) && (
                                            <div className="flex justify-between text-emerald-600">
                                                <span>Descuento Tribio</span>
                                                <span>-S/ {discount}</span>
                                            </div>
                                        )}

                                        {formData.wantsAccount && (
                                            <div className="flex justify-between items-center bg-emerald-50 -mx-6 px-6 py-2 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <span>🎁</span>
                                                    <span className="text-emerald-700 text-xs">Plan Tribio (1er mes)</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-slate-400 line-through text-xs">S/ 29</span>
                                                    <span className="text-emerald-600 font-bold">GRATIS</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-3 border-t border-slate-200">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-slate-900">Total a pagar</span>
                                                <span className="text-2xl font-extrabold text-slate-900">S/ {total}</span>
                                            </div>
                                            {formData.wantsAccount && (
                                                <p className="text-xs text-emerald-600 mt-1">
                                                    Ahorraste S/ {discount + 29} (tarjeta + 1er mes) 🎉
                                                </p>
                                            )}
                                            {formData.hasAccount && !formData.wantsAccount && (
                                                <p className="text-xs text-emerald-600 mt-1">
                                                    Ahorraste S/ {discount} con tu cuenta Tribio 🎉
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Benefits */}
                                    <div className="mt-6 pt-4 border-t border-slate-200 space-y-2">
                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                            <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Diseño personalizado incluido
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                            <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Entrega en 3-5 días hábiles
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                            <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Garantía de por vida
                                        </div>
                                        {formData.quantity >= 5 && (
                                            <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                Envío gratis incluido
                                            </div>
                                        )}
                                    </div>

                                    {/* Help */}
                                    <div className="mt-6 pt-4 border-t border-slate-200">
                                        <a
                                            href="https://wa.me/51999888777?text=Hola,%20tengo%20una%20consulta%20sobre%20las%20tarjetas%20NFC"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-emerald-600 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                            </svg>
                                            ¿Tienes dudas? Escríbenos
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </WebLayout>
        </>
    );
}
