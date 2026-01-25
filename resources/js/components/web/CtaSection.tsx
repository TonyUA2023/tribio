import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken';

export default function CtaSection() {
    const [slug, setSlug] = useState('');
    const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
    const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (checkTimeoutRef.current) {
            clearTimeout(checkTimeoutRef.current);
        }

        if (slug.trim().length < 3) {
            setSlugStatus('idle');
            return;
        }

        setSlugStatus('checking');

        checkTimeoutRef.current = setTimeout(async () => {
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

        return () => {
            if (checkTimeoutRef.current) {
                clearTimeout(checkTimeoutRef.current);
            }
        };
    }, [slug]);

    const isButtonEnabled = slugStatus === 'available';

    const getInputBorderClass = () => {
        switch (slugStatus) {
            case 'available':
                return 'border-green-500 ring-2 ring-green-200';
            case 'taken':
                return 'border-red-500 ring-2 ring-red-200';
            default:
                return 'border-slate-200';
        }
    };

    const handleSubmit = () => {
        if (isButtonEnabled) {
            router.visit(`/registro?slug=${slug}`);
        }
    };

    return (
        <section className="bg-white py-20 md:py-24">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.15]">
                    Reclama tu link
                    <br />
                    antes de que lo tomen
                </h2>

                <div className="mt-10 max-w-xl mx-auto">
                    <div className="rounded-2xl bg-slate-50 border border-slate-200 shadow-sm px-4 py-4 sm:px-6 sm:py-5 flex flex-col gap-3">
                        {/* FILA INPUT / BOTÓN RESPONSIVA */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                            {/* dominio */}
                            <span className="w-full sm:w-auto px-4 py-3 rounded-full bg-white border border-slate-200 text-slate-700 font-medium text-sm text-center sm:text-left whitespace-nowrap">
                                tribio.info/
                            </span>

                            {/* input */}
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) =>
                                        setSlug(
                                            e.target.value
                                                .toLowerCase()
                                                .replace(/[^a-z0-9\-_]/g, ''),
                                        )
                                    }
                                    placeholder="tu_negocio"
                                    className={`
                                        w-full bg-white rounded-full px-4 py-3 text-sm text-slate-800
                                        placeholder-slate-400 focus:outline-none transition-all
                                        border ${getInputBorderClass()}
                                    `}
                                />

                                {slugStatus === 'checking' && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                                {slugStatus === 'available' && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <svg
                                            className="w-5 h-5 text-green-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                )}
                                {slugStatus === 'taken' && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <svg
                                            className="w-5 h-5 text-red-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* botón */}
                            <button
                                disabled={!isButtonEnabled}
                                onClick={handleSubmit}
                                className={`
                                    w-full sm:w-auto
                                    px-6 py-3 rounded-full font-semibold text-sm transition
                                    whitespace-nowrap
                                    ${
                                        !isButtonEnabled
                                            ? 'bg-slate-900 text-white cursor-not-allowed opacity-50'
                                            : 'bg-slate-900 text-white cursor-pointer hover:bg-slate-800'
                                    }
                                `}
                            >
                                Reclamar mi link
                            </button>
                        </div>

                        {/* Mensaje de estado */}
                        <div className="min-h-[20px] text-center">
                            {slugStatus === 'available' && (
                                <p className="text-xs text-green-600 font-medium flex items-center justify-center gap-1">
                                    <svg
                                        className="w-3 h-3"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Tu enlace de Tribio está disponible
                                </p>
                            )}
                            {slugStatus === 'taken' && (
                                <p className="text-xs text-red-600 font-medium flex items-center justify-center gap-1">
                                    <svg
                                        className="w-3 h-3"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Ups, este enlace ya está ocupado. Intenta con otro.
                                </p>
                            )}
                            {slugStatus === 'idle' && slug.length > 0 && slug.length < 3 && (
                                <p className="text-xs text-slate-500">
                                    El enlace debe tener al menos 3 caracteres
                                </p>
                            )}
                            {slugStatus === 'checking' && (
                                <p className="text-xs text-sky-600">
                                    Verificando disponibilidad...
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Línea decorativa ondulada */}
                <div className="mt-16 flex justify-center">
                    <svg
                        className="w-full max-w-4xl h-4 text-pink-300"
                        viewBox="0 0 800 20"
                        fill="none"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="M0 10 Q 25 0, 50 10 T 100 10 T 150 10 T 200 10 T 250 10 T 300 10 T 350 10 T 400 10 T 450 10 T 500 10 T 550 10 T 600 10 T 650 10 T 700 10 T 750 10 T 800 10"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                        />
                    </svg>
                </div>
            </div>
        </section>
    );
}
