import { useState, useMemo, useEffect, useCallback } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import WebLayout from '@/layouts/WebLayout';
import axios from 'axios';

declare global {
    interface Window {
        Culqi: any;
        culqi: () => void;
    }
}

// Types for authenticated user
interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface UserAccount {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
}

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
        image: undefined, // Usaremos un icono SVG
    },
    {
        id: 'pvc',
        name: 'Tarjeta PVC',
        price: 30,
        description: 'Material resistente, ideal para uso diario',
        image: '/images/nfc/tarjeta-pvc.png',
    },
    {
        id: 'madera',
        name: 'Tarjeta Madera',
        price: 50,
        description: 'Acabado premium eco-friendly',
        image: '/images/nfc/tarjeta-madera.png',
    },
    {
        id: 'metal',
        name: 'Tarjeta Metal',
        price: 70,
        description: 'Acabado premium, elegante y duradero',
        image: '/images/nfc/tarjeta-metal.png',
    },
];

// Lista de países con códigos telefónicos
const countries = [
    { code: 'PE', name: 'Perú', dialCode: '+51', flag: '🇵🇪' },
    { code: 'MX', name: 'México', dialCode: '+52', flag: '🇲🇽' },
    { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴' },
    { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷' },
    { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱' },
    { code: 'EC', name: 'Ecuador', dialCode: '+593', flag: '🇪🇨' },
    { code: 'BO', name: 'Bolivia', dialCode: '+591', flag: '🇧🇴' },
    { code: 'VE', name: 'Venezuela', dialCode: '+58', flag: '🇻🇪' },
    { code: 'US', name: 'Estados Unidos', dialCode: '+1', flag: '🇺🇸' },
    { code: 'ES', name: 'España', dialCode: '+34', flag: '🇪🇸' },
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
    culqiPublicKey?: string;
    auth?: {
        user: AuthUser | null;
    };
    account?: UserAccount | null;
    userAccounts?: UserAccount[];
};

export default function Checkout() {
    const pageProps = usePage().props as PageProps;
    const initialSlug = pageProps.slug || '';
    const initialPlan = pageProps.plan || 'pro';

    // Check if user is logged in
    const isLoggedIn = !!pageProps.auth?.user;
    const currentUser = pageProps.auth?.user;
    const userAccounts = pageProps.userAccounts || [];

    // Form state
    const [slug, setSlug] = useState(() => initialSlug);
    const [selectedPlan, setSelectedPlan] = useState<'personal' | 'pro' | 'corporate'>(
        () => initialPlan as 'personal' | 'pro' | 'corporate'
    );
    const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
    const [selectedNfcCard, setSelectedNfcCard] = useState<NfcCardType>('none');

    // Contact info
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [emailPrefix, setEmailPrefix] = useState(''); // Solo el prefijo antes del @
    const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Perú por defecto
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);

    // Payment state
    const [culqiPublicKey, setCulqiPublicKey] = useState<string | null>(pageProps.culqiPublicKey || null);
    const [culqiLoaded, setCulqiLoaded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    // Success modal state
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Slug validation
    const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

    // Email completo para enviar al servidor
    const fullEmail = useMemo(() => {
        return emailPrefix ? `${emailPrefix.toLowerCase().replace(/[^a-z0-9._-]/g, '')}@tribio.info` : '';
    }, [emailPrefix]);

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

    // Amount in centimos for Culqi (S/29.00 = 2900)
    const totalAmountCentimos = useMemo(() => {
        return totalPrice * 100;
    }, [totalPrice]);

    // Validación de contraseñas
    const passwordsMatch = useMemo(() => {
        return password === confirmPassword && password.length >= 6;
    }, [password, confirmPassword]);

    const isFormValid = useMemo(() => {
        // Si el usuario está logueado, solo necesita slug y nombre de negocio
        if (isLoggedIn) {
            return (
                slug.trim().length >= 3 &&
                slugStatus === 'available' &&
                businessName.trim().length >= 2 &&
                acceptTerms
            );
        }

        // Validación completa para usuarios nuevos
        return (
            slug.trim().length >= 3 &&
            slugStatus === 'available' &&
            firstName.trim().length >= 2 &&
            lastName.trim().length >= 2 &&
            businessName.trim().length >= 2 &&
            emailPrefix.trim().length >= 3 &&
            phone.trim().length >= 6 &&
            password.length >= 6 &&
            passwordsMatch &&
            acceptTerms
        );
    }, [slug, slugStatus, firstName, lastName, businessName, emailPrefix, phone, password, passwordsMatch, acceptTerms, isLoggedIn]);

    // Fetch Culqi public key on mount
    useEffect(() => {
        if (!culqiPublicKey) {
            axios.get('/api/payments/culqi-key')
                .then((response) => {
                    if (response.data.success && response.data.public_key) {
                        setCulqiPublicKey(response.data.public_key);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching Culqi key:', error);
                });
        }
    }, [culqiPublicKey]);

    // Load Culqi Checkout script
    useEffect(() => {
        if (!culqiPublicKey) return;

        // Check if already loaded
        if (window.Culqi) {
            setCulqiLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.culqi.com/js/v4';
        script.async = true;
        script.onload = () => {
            setCulqiLoaded(true);
        };
        document.body.appendChild(script);

        return () => {
            // Cleanup if component unmounts
            const existingScript = document.querySelector('script[src="https://checkout.culqi.com/js/v4"]');
            if (existingScript) {
                existingScript.remove();
            }
        };
    }, [culqiPublicKey]);

    // Check slug availability
    useEffect(() => {
        if (slug.trim().length < 3) {
            setSlugStatus('idle');
            return;
        }

        setSlugStatus('checking');
        const timer = setTimeout(async () => {
            try {
                const response = await axios.get('/api/directory/check-slug', {
                    params: { slug: slug.trim() },
                });
                if (response.data.success) {
                    setSlugStatus(response.data.available ? 'available' : 'taken');
                }
            } catch (error) {
                console.error('Error checking slug:', error);
                setSlugStatus('idle');
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [slug]);

    // Process registration after receiving Culqi token
    const processRegistration = useCallback(async (tokenId: string) => {
        // 1. Cierre inmediato del modal de Culqi
        if (window.Culqi) {
            try {
                window.Culqi.close();
            } catch (e) {
                console.error("Error cerrando Culqi:", e);
            }
        }

        setIsProcessing(true);
        setPaymentError(null);

        try {
            // Diferentes endpoints según si el usuario está logueado o no
            const endpoint = isLoggedIn ? '/api/payments/add-business' : '/api/payments/register';

            const payload = isLoggedIn
                ? {
                    // Usuario logueado: solo datos del nuevo negocio
                    token_id: tokenId,
                    slug: slug.trim().toLowerCase(),
                    business_name: businessName.trim(),
                    plan_type: selectedPlan === 'corporate' ? 'pro' : selectedPlan,
                    billing_cycle: billingPeriod,
                }
                : {
                    // Usuario nuevo: datos completos
                    token_id: tokenId,
                    email: fullEmail,
                    slug: slug.trim().toLowerCase(),
                    password: password,
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                    phone: phone.replace(/\s/g, ''),
                    country_code: selectedCountry.code,
                    business_name: businessName.trim(),
                    plan_type: selectedPlan === 'corporate' ? 'pro' : selectedPlan,
                    billing_cycle: billingPeriod,
                };

            const response = await axios.post(endpoint, payload);

            if (response.data.success) {
                setShowSuccessModal(true);
            } else {
                setPaymentError(response.data.message || 'Error al procesar el registro');
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            setPaymentError(error.response?.data?.message || 'Error al procesar el pago');
        } finally {
            setIsProcessing(false);
        }
    }, [fullEmail, slug, firstName, lastName, phone, selectedCountry, businessName, selectedPlan, billingPeriod, password, isLoggedIn]);

    // Configure Culqi and open checkout
    const openCulqiCheckout = useCallback(() => {
        if (!culqiLoaded || !window.Culqi) {
            setPaymentError('El sistema de pagos no está listo.');
            return;
        }

        window.Culqi.publicKey = culqiPublicKey;

        window.Culqi.settings({
            title: 'Tribio',
            currency: 'PEN',
            amount: totalAmountCentimos,
            description: `Plan ${currentPlan.name} - ${billingPeriod === 'yearly' ? 'Anual' : 'Mensual'}`,
        });

        window.Culqi.options({
            lang: 'es',
            installments: false,
            paymentMethods: { tarjeta: true, yape: true },
            style: {
                bannerColor: '#0284c7',
                buttonBackground: '#0284c7',
            },
        });

        // Asignamos la función de respuesta justo antes de abrir
        window.culqi = function() {
            if (window.Culqi.token) {
                processRegistration(window.Culqi.token.id);
            } else {
                console.error(window.Culqi.error);
                setPaymentError(window.Culqi.error.user_message);
                setIsProcessing(false);
            }
        };

        window.Culqi.open();
    }, [culqiLoaded, culqiPublicKey, totalAmountCentimos, currentPlan, billingPeriod, processRegistration]);

    // Handle free registration (Personal plan)
    const handleFreeRegistration = useCallback(async () => {
        setIsProcessing(true);
        setPaymentError(null);

        try {
            const endpoint = isLoggedIn ? '/api/payments/add-business' : '/api/payments/register';

            const payload = isLoggedIn
                ? {
                    token_id: 'free_plan',
                    slug: slug.trim().toLowerCase(),
                    business_name: businessName.trim(),
                    plan_type: 'personal',
                    billing_cycle: 'monthly',
                }
                : {
                    token_id: 'free_plan',
                    email: fullEmail,
                    slug: slug.trim().toLowerCase(),
                    business_name: businessName.trim(),
                    plan_type: 'personal',
                    billing_cycle: 'monthly',
                    password: password,
                    phone: `${selectedCountry.dialCode}${phone.replace(/\s/g, '')}`,
                };

            const response = await axios.post(endpoint, payload);

            if (response.data.success) {
                setShowSuccessModal(true);
            } else {
                setPaymentError(response.data.message || 'Error al crear la cuenta');
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            setPaymentError(error.response?.data?.message || 'Error al crear la cuenta');
        } finally {
            setIsProcessing(false);
        }
    }, [fullEmail, slug, businessName, password, selectedCountry, phone, isLoggedIn]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid || isProcessing) return;

        setPaymentError(null);

        if (totalPrice === 0) {
            // Free plan - no payment needed
            handleFreeRegistration();
        } else {
            // Paid plan - open Culqi checkout
            openCulqiCheckout();
        }
    };

    const handleGoToLogin = () => {
        router.visit('/login');
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

                    {/* Payment Error Alert */}
                    {paymentError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <div className="flex gap-3">
                                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-red-800">Error en el pago</p>
                                    <p className="text-sm text-red-700">{paymentError}</p>
                                </div>
                                <button
                                    onClick={() => setPaymentError(null)}
                                    className="ml-auto text-red-500 hover:text-red-700"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

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
                                    <div className="flex-1 relative">
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
                                            className={`w-full bg-white rounded-lg px-3 py-2 text-sm text-sky-600 font-medium border focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent placeholder:text-slate-400 placeholder:font-normal ${
                                                slugStatus === 'available' ? 'border-green-500' :
                                                slugStatus === 'taken' ? 'border-red-500' :
                                                'border-slate-200'
                                            }`}
                                        />
                                        {slugStatus === 'checking' && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        )}
                                        {slugStatus === 'available' && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                        {slugStatus === 'taken' && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-2 min-h-[18px]">
                                    {slug.length > 0 && slug.length < 3 && (
                                        <p className="text-xs text-amber-600">
                                            El enlace debe tener al menos 3 caracteres
                                        </p>
                                    )}
                                    {slugStatus === 'available' && (
                                        <p className="text-xs text-green-600 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Este enlace está disponible
                                        </p>
                                    )}
                                    {slugStatus === 'taken' && (
                                        <p className="text-xs text-red-600 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                            Este enlace ya está ocupado
                                        </p>
                                    )}
                                </div>
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
                                                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center z-10">
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

                                                {/* Imagen o icono */}
                                                <div className="mb-3 flex justify-center">
                                                    {card.id === 'none' ? (
                                                        // Icono de "sin tarjeta"
                                                        <div className="w-20 h-14 bg-slate-100 rounded-lg flex items-center justify-center">
                                                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                            </svg>
                                                        </div>
                                                    ) : (
                                                        // Imagen de la tarjeta
                                                        <div className="w-20 h-14 bg-slate-100 rounded-lg overflow-hidden">
                                                            <img
                                                                src={card.image}
                                                                alt={card.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    // Fallback si no carga la imagen
                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <p className="font-semibold text-slate-900 text-sm">
                                                        {card.name}
                                                    </p>
                                                    <p className="font-bold text-slate-900 text-sm">
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

                                <div className="space-y-6">

                                {/* ALERTA PARA USUARIOS LOGUEADOS */}
                                {isLoggedIn && currentUser && (
                                    <div className="p-4 bg-gradient-to-r from-sky-50 to-cyan-50 border border-sky-200 rounded-xl">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-full flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-sm font-semibold text-sky-900">
                                                    Tus datos ya están registrados
                                                </h3>
                                                <div className="mt-2 space-y-1 text-sm text-sky-700">
                                                    <p><span className="font-medium">Nombre:</span> {currentUser.name}</p>
                                                    <p><span className="font-medium">Correo:</span> {currentUser.email}</p>
                                                </div>

                                                {/* Negocios existentes del usuario */}
                                                {userAccounts.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-sky-200">
                                                        <p className="text-xs font-medium text-sky-800 mb-2">
                                                            Tus negocios actuales ({userAccounts.length}):
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {userAccounts.map((acc) => (
                                                                <span
                                                                    key={acc.id}
                                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-full text-xs font-medium text-sky-700 border border-sky-200"
                                                                >
                                                                    {acc.logo ? (
                                                                        <img src={acc.logo} alt={acc.name} className="w-4 h-4 rounded-full object-cover" />
                                                                    ) : (
                                                                        <span className="w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold">
                                                                            {acc.name.charAt(0)}
                                                                        </span>
                                                                    )}
                                                                    {acc.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="mt-4 flex flex-wrap gap-3">
                                                    <p className="text-xs text-sky-600">
                                                        El nuevo negocio se agregará a tu cuenta existente.
                                                    </p>
                                                </div>

                                                <div className="mt-3 pt-3 border-t border-sky-200">
                                                    <p className="text-xs text-sky-700 mb-2">
                                                        ¿Deseas crear el negocio con otra cuenta?
                                                    </p>
                                                    <Link
                                                        href="/logout"
                                                        method="post"
                                                        as="button"
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-sky-300 rounded-lg text-sm font-medium text-sky-700 hover:bg-sky-50 transition"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                        </svg>
                                                        Cerrar sesión
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* SUBSECCIÓN: PROPIETARIO - Solo para usuarios no logueados */}
                                {!isLoggedIn && (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-sky-600 uppercase tracking-widest border-b border-sky-50 pb-2">
                                        Datos del Propietario
                                    </h3>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1">Nombres</label>
                                            <input
                                                type="text"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                placeholder="Ej: Juan"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 text-slate-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Apellidos</label>
                                            <input
                                                type="text"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                placeholder="Ej: Pérez"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 text-slate-900"
                                            />
                                        </div>
                                    </div>

                                    {/* Teléfono vinculado al Usuario */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">WhatsApp / Celular Personal</label>
                                        <div className="flex items-center gap-0">
                                            <button
                                                type="button"
                                                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                                className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-r-0 border-slate-200 rounded-l-xl text-sm"
                                            >
                                                <span className="font-medium text-slate-900">{selectedCountry.dialCode}</span>
                                            </button>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value.replace(/[^0-9\s]/g, ''))}
                                                placeholder="999 999 999"
                                                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-r-xl text-sm focus:ring-2 focus:ring-sky-500 text-slate-900"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Tu correo Tribio
                                        </label>
                                        <div className="flex items-center gap-0">
                                            <input
                                                type="text"
                                                value={emailPrefix}
                                                onChange={(e) => setEmailPrefix(
                                                    e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '')
                                                )}
                                                placeholder="tu_usuario"
                                                autoComplete="off"
                                                autoCorrect="off"
                                                autoCapitalize="off"
                                                spellCheck="false"
                                                data-form-type="other"
                                                className="flex-1 px-4 py-2.5 rounded-l-xl border border-r-0 border-slate-200 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent placeholder:text-slate-400 placeholder:font-normal"
                                            />
                                            <div className="px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-r-xl text-sm text-slate-500 font-medium">
                                                @tribio.info
                                            </div>
                                        </div>
                                        {emailPrefix && (
                                            <p className="mt-1 text-xs text-sky-600">
                                                Tu correo será: {fullEmail}
                                            </p>
                                        )}
                                    </div>

                                    {/* Contraseña */}
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Contraseña
                                            </label>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Mínimo 6 caracteres"
                                                autoComplete="new-password"
                                                data-form-type="other"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent placeholder:text-slate-400 placeholder:font-normal"
                                            />
                                            {password.length > 0 && password.length < 6 && (
                                                <p className="mt-1 text-xs text-amber-600">
                                                    Mínimo 6 caracteres
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Repetir contraseña
                                            </label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Confirma tu contraseña"
                                                autoComplete="new-password"
                                                data-form-type="other"
                                                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent placeholder:text-slate-400 placeholder:font-normal ${
                                                    confirmPassword && !passwordsMatch
                                                        ? 'border-red-300 bg-red-50'
                                                        : confirmPassword && passwordsMatch
                                                            ? 'border-green-300 bg-green-50'
                                                            : 'border-slate-200'
                                                }`}
                                            />
                                            {confirmPassword && !passwordsMatch && (
                                                <p className="mt-1 text-xs text-red-600">
                                                    Las contraseñas no coinciden
                                                </p>
                                            )}
                                            {confirmPassword && passwordsMatch && (
                                                <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Las contraseñas coinciden
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                )}

                                {/* SUBSECCIÓN: EMPRESA */}
                                <div className="space-y-4 pt-2">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">
                                        {isLoggedIn ? 'Datos del Nuevo Negocio' : 'Datos de la Empresa'}
                                    </h3>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Nombre Comercial de la Empresa</label>
                                        <input
                                            type="text"
                                            value={businessName}
                                            onChange={(e) => setBusinessName(e.target.value)}
                                            placeholder="Ej: Barbería Don Carlos"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-sky-500"
                                        />
                                    </div>
                                </div>





                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="terms"
                                            checked={acceptTerms}
                                            onChange={(e) => setAcceptTerms(e.target.checked)}
                                            className="mt-1 w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 accent-sky-600"
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
                                    disabled={!isFormValid || isProcessing}
                                    className={`w-full py-4 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 ${
                                        isFormValid && !isProcessing
                                            ? 'bg-sky-600 text-white hover:bg-sky-700'
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Procesando...
                                        </>
                                    ) : totalPrice === 0 ? (
                                        'Crear mi cuenta gratis'
                                    ) : (
                                        `Pagar S/${totalPrice} y crear cuenta`
                                    )}
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
                                        disabled={!isFormValid || isProcessing}
                                        className={`w-full py-4 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 ${
                                            isFormValid && !isProcessing
                                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Procesando...
                                            </>
                                        ) : totalPrice === 0 ? (
                                            'Crear mi cuenta gratis'
                                        ) : (
                                            `Pagar S/${totalPrice} y crear cuenta`
                                        )}
                                    </button>

                                    <p className="mt-3 text-center text-xs text-slate-500">
                                        Pago seguro procesado por Culqi
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

                            {/* Payment methods */}
                            <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200">
                                <p className="text-xs text-slate-500 text-center mb-3">
                                    Métodos de pago aceptados
                                </p>
                                <div className="flex items-center justify-center gap-3">
                                    <div className="px-3 py-1.5 bg-slate-100 rounded text-xs font-medium text-slate-600">Visa</div>
                                    <div className="px-3 py-1.5 bg-slate-100 rounded text-xs font-medium text-slate-600">Mastercard</div>
                                    <div className="px-3 py-1.5 bg-[#6C1D7B] rounded text-xs font-medium text-white">Yape</div>
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

            {/* Modal de Compra Confirmada */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

                    {/* Modal */}
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Header con icono de éxito */}
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-8 text-white text-center">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold">
                                {isLoggedIn ? '¡Negocio creado!' : '¡Compra confirmada!'}
                            </h2>
                            <p className="text-emerald-100 mt-2">
                                {isLoggedIn
                                    ? `${businessName} ha sido agregado a tu cuenta`
                                    : 'Tu cuenta ha sido creada exitosamente'}
                            </p>
                        </div>

                        {/* Contenido */}
                        <div className="p-6 space-y-4">
                            {isLoggedIn ? (
                                <>
                                    <div className="text-center">
                                        <p className="text-slate-600">
                                            Tu nuevo negocio está listo. Ahora puedes configurarlo desde el panel de control.
                                        </p>
                                    </div>

                                    {/* Info del negocio creado */}
                                    <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                                        <h3 className="text-sm font-semibold text-slate-700">Detalles del negocio:</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                <span className="text-sm text-slate-600">Negocio:</span>
                                                <span className="text-sm font-medium text-slate-900">{businessName}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                </svg>
                                                <span className="text-sm text-slate-600">Tu enlace:</span>
                                                <span className="text-sm font-medium text-sky-600">tribio.info/{slug}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Botón para ir al dashboard */}
                                    <button
                                        onClick={() => router.visit('/dashboard')}
                                        className="w-full py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                        </svg>
                                        Ir al Panel de Control
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="text-center">
                                        <p className="text-slate-600">
                                            Ingresa al login para configurar tu cuenta de Tribio.
                                        </p>
                                    </div>

                                    {/* Credenciales */}
                                    <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                                        <h3 className="text-sm font-semibold text-slate-700">Tus credenciales de acceso:</h3>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-sm text-slate-600">Correo:</span>
                                                <span className="text-sm font-medium text-sky-600">{fullEmail}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                                <span className="text-sm text-slate-600">Contraseña:</span>
                                                <span className="text-sm font-medium text-slate-900">La que ingresaste en el paso 4</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info adicional */}
                                    <div className="flex items-start gap-2 text-xs text-slate-500 bg-amber-50 p-3 rounded-lg">
                                        <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p>
                                            Guarda estas credenciales en un lugar seguro. Las necesitarás para acceder a tu cuenta.
                                        </p>
                                    </div>

                                    {/* Botón de ir al login */}
                                    <button
                                        onClick={handleGoToLogin}
                                        className="w-full py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                        </svg>
                                        Ir al Login
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </WebLayout>
    );
}
