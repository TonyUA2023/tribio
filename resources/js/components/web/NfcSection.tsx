import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export default function NfcSection() {
    const [angle, setAngle] = useState(0);

    useEffect(() => {
        let frameId: number;

        const loop = () => {
            setAngle((prev) => (prev + 0.4) % 360); // velocidad de giro
            frameId = requestAnimationFrame(loop);
        };

        frameId = requestAnimationFrame(loop);

        return () => cancelAnimationFrame(frameId);
    }, []);

    // altura flotante suave
    const floatOffset = Math.sin((angle * Math.PI) / 180) * 6;

    return (
        <section className="bg-white py-20">
            <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 lg:flex-row lg:items-center lg:gap-16 lg:px-0">
                {/* ======= TEXTO ======= */}
                <div className="max-w-xl space-y-6">
                    <p className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-1 text-xs font-semibold text-sky-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                        Tarjeta NFC inteligente
                    </p>

                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                        Tu negocio en una tarjeta.
                        <br />
                        <span className="text-sky-600">Comparte con un solo toque.</span>
                    </h2>

                    <p className="text-sm text-slate-600 md:text-base">
                        Cada tarjeta NFC Tribio abre tu mini página en el celular de tu
                        cliente. Solo acercas la tarjeta y listo: ven tus servicios,
                        productos, redes y botón de WhatsApp en segundos.
                    </p>

                    {/* Precio y bullets */}
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_45px_-30px_rgba(15,23,42,0.45)]">
                        <div className="flex flex-wrap items-baseline gap-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Tarjeta NFC Tribio
                            </p>
                            <div className="flex items-end gap-1">
                                <span className="text-xs text-slate-500">S/</span>
                                <span className="text-3xl font-extrabold text-slate-900">
                                    30
                                </span>
                                <span className="mb-[2px] text-xs text-slate-500">
                                    por tarjeta
                                </span>
                            </div>
                        </div>

                        <p className="text-xs text-slate-500">
                            Incluye configuración con tu enlace Tribio. Puedes añadir
                            diseños personalizados de tu marca por{' '}
                            <span className="font-semibold text-slate-900">
                                S/ 30 adicionales
                            </span>{' '}
                            por modelo.
                        </p>

                        <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                            <div className="flex items-start gap-2">
                                <span className="mt-[5px] h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <p>Funciona con la mayoría de celulares con NFC.</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="mt-[5px] h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <p>No necesita batería ni app adicional.</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="mt-[5px] h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <p>Ideal para ventas, eventos y equipos comerciales.</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="mt-[5px] h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <p>Diseños con tu logo, colores y estilo de marca.</p>
                            </div>
                        </div>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                        <Link href="#contacto">
                            <Button
                                size="lg"
                                className="w-full sm:w-auto rounded-full bg-sky-600 px-7 text-sm font-semibold text-white hover:bg-sky-700"
                            >
                                Solicitar tarjetas NFC
                            </Button>
                        </Link>

                        <Link href="#projects">
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full sm:w-auto rounded-full border-slate-300 bg-white px-7 text-sm font-semibold text-slate-900 hover:bg-slate-900 hover:text-white"
                            >
                                Ver diseños y ejemplos
                            </Button>
                        </Link>
                    </div>

                    <p className="text-[11px] text-slate-500">
                        *Precio referencial por unidad. Descuentos por volumen para
                        equipos, academias, barberías, estudios y empresas.
                    </p>
                </div>

                {/* ======= ANIMACIÓN 3D ======= */}
                <div className="relative flex flex-1 items-center justify-center">
                    <div
                        className="relative h-[380px] w-full max-w-md"
                        style={{ perspective: '1400px' }}
                    >
                        {/* Glow de fondo */}
                        <div className="absolute -inset-10 rounded-[40px] bg-gradient-to-tr from-sky-200/60 via-cyan-100/40 to-emerald-100/50 blur-3xl" />

                        {/* Teléfono estático */}
                        <div className="absolute right-4 top-10 z-10 h-[290px] w-[150px] rounded-[32px] bg-slate-950 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.9)] ring-4 ring-white">
                            <div className="relative h-full w-full overflow-hidden rounded-[26px] bg-slate-900">
                                {/* mockup de pantalla tribio */}
                                <img
                                    src="/images/landing/mockup-phone-tribio.png"
                                    alt="Mini página Tribio en el celular"
                                    className="h-full w-full object-cover"
                                />

                                {/* badge NFC detectado */}
                                <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/95 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm">
                                    <span className="h-1.5 w-1.5 animate-ping rounded-full bg-white/90" />
                                    NFC detectado
                                </div>
                            </div>
                        </div>

                        {/* Tarjeta NFC animada 3D */}
                        <div
                            className="absolute left-0 top-1/2 z-20 h-[220px] w-[350px] -translate-y-1/2"
                            style={{ perspective: '1400px' }}
                        >
                            <div
                                className="relative h-full w-full rounded-[28px] border border-white/70 bg-gradient-to-br from-slate-900 via-sky-900 to-slate-950 p-[2px] shadow-[0_30px_80px_-32px_rgba(15,23,42,0.95)]"
                                style={{
                                    transformStyle: 'preserve-3d',
                                    transform: `
                                        translateY(${floatOffset}px)
                                        rotateX(16deg)
                                        rotateY(${angle}deg)
                                    `,
                                    transition: 'transform 80ms linear',
                                }}
                            >
                                {/* Cara frontal de la tarjeta */}
                                <div className="flex h-full w-full flex-col justify-between rounded-[26px] bg-gradient-to-br from-slate-950 via-slate-900 to-sky-900 px-6 py-5 text-slate-50">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-slate-900/80 ring-1 ring-sky-500/40">
                                                <img
                                                    src="/logo/logo.png"
                                                    alt="Tribio"
                                                    className="h-6 w-6 object-contain"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-[11px] uppercase tracking-[0.18em] text-sky-300">
                                                    Tribio NFC
                                                </p>
                                                <p className="text-xs font-semibold">
                                                    Tarjeta de contacto inteligente
                                                </p>
                                            </div>
                                        </div>
                                        <div className="rounded-full bg-slate-900/70 px-3 py-1 text-[10px] font-medium text-sky-200 ring-1 ring-sky-500/40">
                                            Acerca y toca
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-xs text-slate-300">
                                            Acerca esta tarjeta al celular y abre tu mini
                                            página Tribio al instante. Comparte tu link, redes,
                                            servicios y botón de WhatsApp con un gesto.
                                        </p>
                                        <div className="flex items-center justify-between text-[11px] text-slate-300">
                                            <div className="flex items-center gap-2">
                                                <span className="h-6 w-6 rounded-full bg-slate-900/60" />
                                                <span>Nombre y logo de tu negocio</span>
                                            </div>
                                            <span className="rounded-full bg-sky-500/90 px-2 py-1 text-[10px] font-semibold text-slate-950">
                                                S/ 30
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                                        <span>tribio.info/tu-negocio</span>
                                        <span className="flex items-center gap-1">
                                            <svg
                                                className="h-4 w-4 text-sky-300"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M7 12a5 5 0 015-5h2"
                                                    stroke="currentColor"
                                                    strokeWidth="1.6"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M17 12a5 5 0 01-5 5h-2"
                                                    stroke="currentColor"
                                                    strokeWidth="1.6"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M9 12h6"
                                                    stroke="currentColor"
                                                    strokeWidth="1.6"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                            NFC
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sombra en la “mesa” */}
                        <div className="absolute bottom-6 left-6 right-10 z-0 h-10 rounded-full bg-slate-900/10 blur-xl" />
                    </div>
                </div>
            </div>
        </section>
    );
}
