import { useState } from 'react';

type FaqItem = {
    question: string;
    answer: string;
};

const FAQ_ITEMS: FaqItem[] = [
    {
        question: '¿Qué es exactamente Tribio?',
        answer:
            'Tribio es una mini página + tienda online conectada a una tarjeta NFC. Desde un solo link puedes mostrar tus servicios, productos, redes sociales y recibir pedidos o reservas por WhatsApp, mensajes o pasarela de pago según el plan.'
    },
    {
        question: '¿En qué se diferencia de un link-in-bio normal?',
        answer:
            'Un link-in-bio tradicional solo muestra enlaces. Tribio además te permite vender: mostrar catálogo, controlar stock, recibir pedidos, gestionar citas, registrar clientes y conectar tu perfil a tarjetas NFC físicas para compartir con un solo toque.'
    },
    {
        question: '¿Necesito saber de diseño o programación para usarlo?',
        answer:
            'No. Tribio viene con plantillas pensadas para distintos tipos de negocio: barberías, tiendas, gimnasios, academias, servicios profesionales y más. Solo eliges una plantilla, subes tus fotos y datos… y listo.'
    },
    {
        question: '¿Cómo funcionan las tarjetas NFC de Tribio?',
        answer:
            'Cada tarjeta NFC tiene tu enlace Tribio grabado. Cuando la acercas a un celular con NFC, tu mini página se abre automáticamente. Es ideal para atención al cliente, ventas en punto físico, ferias, eventos o para que tu equipo comercial comparta su contacto en segundos.'
    },
    {
        question: '¿Tribio funciona bien en celulares?',
        answer:
            'Sí. Tribio está diseñado primero para móviles. Todo se adapta a pantalla de celular: botones grandes, tipografía legible y tiempos de carga optimizados. También se ve perfecto en tablet y computadora.'
    },
    {
        question: '¿Puedo usar mi propio dominio o subdominio?',
        answer:
            'Por defecto tendrás un enlace tipo tribio.info/tu-negocio. En planes avanzados podemos conectar un dominio o subdominio propio (ej: links.tumarca.com) para que tu presencia sea aún más profesional.'
    },
    {
        question: '¿Puedo tener varios colaboradores o sucursales?',
        answer:
            'Sí. Con Tribio Pro y Corporativo puedes crear perfiles para tu equipo (ej: tribio.info/tumarca-juan), asignarles enlaces de venta y ver resultados por persona o sucursal. Ideal para equipos comerciales o franquicias.'
    },
    {
        question: '¿Qué métodos de pago puedo usar en Tribio?',
        answer:
            'Depende del país y el plan. Tribio puede enlazar a pasarelas de pago, links de cobro, Yape, Plin, transferencias y otros métodos. Tus clientes eligen cómo pagar y tú decides qué mostrar en tu mini página.'
    },
    {
        question: '¿Tengo que pagar también por las tarjetas NFC?',
        answer:
            'Sí. Las tarjetas NFC se venden por separado. Cada tarjeta Tribio estándar tiene un costo de S/ 30, y los diseños personalizados de marca tienen un costo adicional. Puedes pedir unidades sueltas o paquetes para tu equipo.'
    },
    {
        question: '¿Puedo cambiar de plan más adelante?',
        answer:
            'Claro. Puedes empezar con un plan básico y, cuando tu negocio crezca, subir a Tribio Pro o Corporativo sin perder tu información ni tus enlaces. Solo cambias el plan y sigues trabajando normalmente.'
    }
];

export default function FaqSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleIndex = (index: number) => {
        setOpenIndex((prev) => (prev === index ? null : index));
    };

    return (
        <section id="faq" className="bg-white py-20">
            <div className="mx-auto max-w-3xl px-6 lg:px-0">
                {/* Etiqueta arriba */}
                <div className="mb-4 flex justify-center">
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-1 text-xs font-semibold tracking-wide text-slate-600">
                        FAQ
                    </span>
                </div>

                {/* Título */}
                <h2 className="mb-8 text-center text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                    ¿Tienes preguntas?
                </h2>

                {/* Lista de preguntas */}
                <div className="space-y-3">
                    {FAQ_ITEMS.map((item, index) => {
                        const isOpen = openIndex === index;

                        return (
                            <div
                                key={index}
                                className="overflow-hidden rounded-[999px] bg-[#F5F5F7] transition-colors hover:bg-[#F0F0F2]"
                            >
                                <button
                                    type="button"
                                    onClick={() => toggleIndex(index)}
                                    className="flex w-full items-center justify-between gap-6 px-6 py-4 text-left md:px-8 md:py-5"
                                >
                                    <span className="text-sm font-medium text-slate-900 md:text-base">
                                        {item.question}
                                    </span>

                                    <span
                                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm transition-transform ${
                                            isOpen ? 'rotate-180' : ''
                                        }`}
                                    >
                                        <svg
                                            className="h-4 w-4"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M6 9l6 6 6-6"
                                                stroke="currentColor"
                                                strokeWidth="1.7"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </span>
                                </button>

                                {/* Contenido animado */}
                                <div
                                    className={`px-6 pb-4 pr-10 text-sm text-slate-600 md:px-8 md:pb-5 ${
                                        isOpen
                                            ? 'max-h-40 opacity-100'
                                            : 'max-h-0 opacity-0'
                                    } transition-all duration-300`}
                                >
                                    <p>{item.answer}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Nota final */}
                <p className="mt-8 text-center text-xs text-slate-500">
                    ¿Aún tienes dudas? Escríbenos por WhatsApp y te ayudamos a elegir el
                    mejor plan Tribio para tu negocio.
                </p>
            </div>
        </section>
    );
}
