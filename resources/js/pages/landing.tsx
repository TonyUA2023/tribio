import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import LandingHeader from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import CustomCursor from '@/components/CustomCursor';
import LoadingScreen from '@/components/landing/LoadingScreen';

export default function Landing() {
    useEffect(() => {
        // Enable custom cursor
        document.body.classList.add('custom-cursor-enabled');
        return () => {
            document.body.classList.remove('custom-cursor-enabled');
        };
    }, []);

    return (
        <>
            <LoadingScreen />
            <CustomCursor />
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

            <div className="min-h-screen bg-white antialiased">
                <LandingHeader />
                <Hero />
                <Features />

                {/* Placeholder for more sections */}
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Más secciones próximamente...
                        </h2>
                        <p className="text-gray-600">
                            How it Works, Testimonials, Pricing, etc.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
