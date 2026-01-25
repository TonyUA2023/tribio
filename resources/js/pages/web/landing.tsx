import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import WebLayout from '@/layouts/WebLayout';
import Hero from '@/components/web/Hero';
import LoadingScreen from '@/components/web/LoadingScreen';
import NfcSection from '@/components/web/NfcSection';
import FaqSection from '@/components/web/FaqSection';
import CtaSection from '@/components/web/CtaSection';

/* === Hook para revelar secciones al hacer scroll === */
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
            {
                threshold: 0.25,
            },
        );

        observer.observe(el);

        return () => {
            observer.disconnect();
        };
    }, []);

    return { ref, visible };
}

/* === Sección: Cómo funciona Tribio === */
function HowItWorksSection() {
    const { ref, visible } = useSectionReveal();

    return (
        <section
            id="como-funciona"
            ref={ref}
            className="bg-white py-20"
        >
            <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 lg:flex-row lg:items-center lg:gap-16 lg:px-0">
                {/* LADO IZQUIERDO: Texto + pasos */}
                <div
                    className={`max-w-xl transform transition-all duration-700 ease-out ${
                        visible
                            ? 'translate-y-0 opacity-100'
                            : 'translate-y-6 opacity-0'
                    }`}
                >
                    <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-1 text-xs font-semibold text-sky-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                        Cómo funciona Tribio
                    </p>
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                        Vende desde un solo link
                        <span className="text-sky-600"> en tres pasos.</span>
                    </h2>
                    <p className="mt-3 text-sm text-slate-600 md:text-base">
                        No necesitas ser diseñador ni programador. Tribio convierte tu
                        link en una mini tienda con NFC para que tus clientes te
                        encuentren, te escriban y te compren en segundos.
                    </p>

                    <div className="mt-8 space-y-4">
                        {/* Paso 1 */}
                        <div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_35px_-24px_rgba(15,23,42,0.4)]">
                            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white">
                                1
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">
                                    Crea tu cuenta y tu enlace Tribio
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    Regístrate, elige tu usuario y obtén un enlace único que
                                    podrás poner en tus redes, WhatsApp, tarjetas NFC y más.
                                </p>
                            </div>
                        </div>

                        {/* Paso 2 */}
                        <div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_35px_-24px_rgba(15,23,42,0.25)]">
                            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                                2
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">
                                    Escoge una plantilla y sube tus productos o servicios
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    Elige un diseño para tu rubro (barbería, tienda,
                                    gimnasio, academia, etc.), agrega fotos, precios, horarios
                                    y enlaces importantes.
                                </p>
                            </div>
                        </div>

                        {/* Paso 3 */}
                        <div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_35px_-24px_rgba(15,23,42,0.2)]">
                            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                                3
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">
                                    Comparte y comienza a vender en internet
                                </h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    Comparte tu link o tu tarjeta NFC, recibe pedidos o
                                    reservas, cobra online y administra tu negocio desde la
                                    app Tribio Pro.
                                </p>
                            </div>
                        </div>
                    </div>

                    <p className="mt-6 text-[11px] text-slate-500">
                        Ideal para negocios locales, creadores de contenido, freelancers,
                        equipos de ventas y marcas que quieren centralizar todo en un solo
                        enlace.
                    </p>
                </div>

                {/* LADO DERECHO: Mockups inclinados / imágenes */}
                <div
                    className={`relative flex flex-1 items-center justify-center transform transition-all duration-700 ease-out ${
                        visible
                            ? 'translate-y-0 opacity-100'
                            : 'translate-y-6 opacity-0'
                    }`}
                    style={{
                        transitionDelay: visible ? '140ms' : '0ms',
                    }}
                >
                    <div className="relative h-[420px] w-full max-w-md">
                        {/* Tarjeta 1 - superior izquierda */}
                        <div
                            className={`absolute left-0 top-6 w-[68%] rounded-3xl bg-[#FBE3FF] p-4 shadow-[0_18px_55px_-30px_rgba(15,23,42,0.8)] transform transition-all duration-700 ease-out ${
                                visible
                                    ? 'translate-y-0 translate-x-0 rotate-[-4deg] opacity-100'
                                    : 'translate-y-8 -translate-x-4 rotate-0 opacity-0'
                            }`}
                            style={{
                                transitionDelay: visible ? '220ms' : '0ms',
                            }}
                        >
                            <div className="mb-3 h-32 overflow-hidden rounded-2xl bg-slate-200">
                                {/* AQUÍ CAMBIAS LA IMAGEN */}
                                <img
                                    src="/images/how-it-works/contenido-tribio.jpg"
                                    alt="Ejemplo de contenido Tribio"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <p className="text-xs font-semibold text-slate-900">
                                Muestra todo tu contenido en un solo lugar
                            </p>
                            <p className="mt-1 text-[11px] text-slate-600">
                                Enlaces, redes, videos, catálogos y más en una mini página
                                optimizada para móviles.
                            </p>
                        </div>

                        {/* Tarjeta 2 - inferior izquierda */}
                        <div
                            className={`absolute bottom-0 left-4 w-[72%] rounded-3xl bg-[#FFF3C4] p-4 shadow-[0_22px_65px_-32px_rgba(15,23,42,0.85)] transform transition-all duration-700 ease-out ${
                                visible
                                    ? 'translate-y-0 translate-x-0 rotate-[-6deg] opacity-100'
                                    : 'translate-y-8 -translate-x-4 rotate-0 opacity-0'
                            }`}
                            style={{
                                transitionDelay: visible ? '280ms' : '0ms',
                            }}
                        >
                            <div className="mb-3 flex items-end justify-between gap-2">
                                <div className="flex gap-2">
                                    {/* Aquí puedes poner varias imágenes pequeñas de productos */}
                                    <div className="h-16 w-14 overflow-hidden rounded-2xl bg-slate-200">
                                        <img
                                            src="/images/how-it-works/producto-1.jpg"
                                            alt="Producto Tribio 1"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="h-16 w-14 overflow-hidden rounded-2xl bg-slate-200">
                                        <img
                                            src="/images/how-it-works/producto-2.jpg"
                                            alt="Producto Tribio 2"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="hidden h-16 w-14 overflow-hidden rounded-2xl bg-slate-200 sm:block">
                                        <img
                                            src="/images/how-it-works/producto-3.jpg"
                                            alt="Producto Tribio 3"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white">
                                    Venta rápida
                                </div>
                            </div>
                            <p className="text-xs font-semibold text-slate-900">
                                Vende productos y servicios directo desde tu link
                            </p>
                            <p className="mt-1 text-[11px] text-slate-600">
                                Tus clientes ven el precio, te escriben por WhatsApp o
                                pagan online según el plan que tengas.
                            </p>
                        </div>

                        {/* Tarjeta 3 - derecha (principal con celular / app) */}
                        <div
                            className={`absolute right-0 top-0 w-[62%] rounded-[32px] bg-slate-900 p-4 shadow-[0_26px_80px_-32px_rgba(15,23,42,0.95)] transform transition-all duration-700 ease-out ${
                                visible
                                    ? 'translate-y-0 translate-x-0 rotate-[8deg] opacity-100'
                                    : 'translate-y-8 translate-x-4 rotate-0 opacity-0'
                            }`}
                            style={{
                                transitionDelay: visible ? '340ms' : '0ms',
                            }}
                        >
                            <div className="mb-3 h-60 overflow-hidden rounded-3xl bg-slate-800">
                                {/* AQUÍ PONES EL MOCKUP DEL CELULAR CON UNA TIENDA TRIBIO */}
                                <img
                                    src="/images/how-it-works/app-tribio.jpg"
                                    alt="App de gestión Tribio"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <p className="text-xs font-semibold text-white">
                                Administra todo desde la app Tribio Pro
                            </p>
                            <p className="mt-1 text-[11px] text-slate-300">
                                Edita tu mini página, revisa pedidos, actualiza stock y
                                mira cómo crecen tus ventas en tiempo real.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function Landing() {
    return (
        <>
            <LoadingScreen />
            <Head>
                {/* Primary Meta Tags */}
                <title>
                    Tribio - Tarjetas NFC Inteligentes + Perfil Digital para tu
                    Negocio
                </title>
                <meta
                    name="title"
                    content="Tribio - Tarjetas NFC Inteligentes + Perfil Digital para tu Negocio"
                />
                <meta
                    name="description"
                    content="Crea tu perfil digital profesional con tarjeta NFC. Comparte información de contacto, recibe reservas y gestiona tu negocio todo en un solo lugar. ¡Prueba gratis!"
                />
                <meta
                    name="keywords"
                    content="tarjetas NFC, perfil digital, bio link, linktree, tarjetas inteligentes, marketing digital, contactless, QR alternativa, reservas online, agenda digital"
                />
                <meta name="author" content="Tribio" />
                <meta name="robots" content="index, follow" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
                <link rel="canonical" href="https://tribio.pe" />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://tribio.pe/" />
                <meta
                    property="og:title"
                    content="Tribio - Tarjetas NFC Inteligentes + Perfil Digital"
                />
                <meta
                    property="og:description"
                    content="Crea tu perfil digital profesional con tarjeta NFC. Comparte información de contacto, recibe reservas y gestiona tu negocio."
                />
                <meta
                    property="og:image"
                    content="https://tribio.pe/og-image.jpg"
                />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:locale" content="es_ES" />
                <meta property="og:site_name" content="Tribio" />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content="https://tribio.pe/" />
                <meta
                    property="twitter:title"
                    content="Tribio - Tarjetas NFC Inteligentes + Perfil Digital"
                />
                <meta
                    property="twitter:description"
                    content="Crea tu perfil digital profesional con tarjeta NFC. Comparte información, recibe reservas y gestiona tu negocio."
                />
                <meta
                    property="twitter:image"
                    content="https://tribio.pe/og-image.jpg"
                />

                {/* Additional SEO */}
                <meta name="language" content="Spanish" />
                <meta name="geo.region" content="PE" />
                <meta name="geo.placename" content="Lima" />

                {/* Schema.org JSON-LD */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Organization',
                        name: 'Tribio',
                        description:
                            'Plataforma de tarjetas NFC inteligentes y perfiles digitales para negocios',
                        url: 'https://tribio.pe',
                        logo: 'https://tribio.pe/logo/logo.png',
                        contactPoint: {
                            '@type': 'ContactPoint',
                            telephone: '+51-XXX-XXX-XXX',
                            contactType: 'customer service',
                            areaServed: 'PE',
                            availableLanguage: ['es'],
                        },
                        sameAs: [
                            'https://www.facebook.com/tribio.pe',
                            'https://www.instagram.com/tribio.pe',
                            'https://www.linkedin.com/company/tribio',
                        ],
                    })}
                </script>

                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Product',
                        name: 'Tribio Tarjeta NFC Inteligente',
                        description:
                            'Tarjeta NFC con perfil digital personalizado para compartir información de contacto y recibir reservas',
                        brand: {
                            '@type': 'Brand',
                            name: 'Tribio',
                        },
                        offers: {
                            '@type': 'Offer',
                            url: 'https://tribio.pe',
                            priceCurrency: 'PEN',
                            price: '0',
                            priceValidUntil: '2026-12-31',
                            availability: 'https://schema.org/InStock',
                            seller: {
                                '@type': 'Organization',
                                name: 'Tribio',
                            },
                        },
                        aggregateRating: {
                            '@type': 'AggregateRating',
                            ratingValue: '4.9',
                            reviewCount: '500',
                        },
                    })}
                </script>

                {/* Favicon */}
                <link rel="icon" type="image/x-icon" href="/logo/logo.ico" />
                <link rel="apple-touch-icon" href="/logo/logo.png" />
            </Head>

            <WebLayout>
                <Hero />
                <HowItWorksSection />
                <NfcSection />
                <FaqSection />
                <CtaSection />
            </WebLayout>
        </>
    );
}
