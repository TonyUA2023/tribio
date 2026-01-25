import { Head } from '@inertiajs/react';
import WebLayout from '@/layouts/WebLayout';
import PricingSection from '@/components/web/PricingSection';

export default function PricingPage() {
    return (
        <WebLayout>
            <Head>
                <title>Precios - Tribio | Planes para tu Negocio</title>
                <meta
                    name="description"
                    content="Conoce los planes y precios de Tribio. Elige el plan perfecto para tu negocio y comienza a crear tu perfil digital."
                />
            </Head>

            {/* Espaciado para el header fijo */}
            <div className="pt-24">
                <PricingSection />
            </div>
        </WebLayout>
    );
}
