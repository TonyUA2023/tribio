import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import WebLayout from '@/layouts/WebLayout';

interface Business {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    logo_url: string | null;
    cover_url: string | null;
    address: string | null;
    whatsapp: string | null;
    business_category: {
        id: number;
        name: string;
    } | null;
}

export default function Directory() {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchBusinesses();
    }, []);

    const fetchBusinesses = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/directory/businesses');

            if (response.data.success && Array.isArray(response.data.data)) {
                setBusinesses(response.data.data);
            } else {
                setError('Formato de respuesta inválido');
            }
        } catch (err: any) {
            console.error('Error:', err);
            setError(err.message || 'Error al cargar negocios');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head title="Directorio de Negocios | Tribio" />

            <WebLayout>
                {/* Hero Section */}
                <section className="pt-32 pb-16 bg-gradient-to-b from-slate-50 to-white">
                    <div className="max-w-6xl mx-auto px-6 text-center">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-700 text-xs font-semibold mb-6">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            Explora negocios verificados
                        </span>

                        <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-[1.1]">
                            Directorio de
                            <span className="text-cyan-500"> Negocios</span>
                        </h1>

                        <p className="mt-4 text-slate-600 text-lg max-w-2xl mx-auto">
                            Descubre negocios, emprendedores y profesionales que ya confían en Tribio
                            para conectar con sus clientes.
                        </p>
                    </div>
                </section>

                {/* Content */}
                <section className="py-12 bg-white">
                    <div className="max-w-6xl mx-auto px-6">
                        {/* Estado de carga */}
                        {loading && (
                            <div className="text-center py-20">
                                <div className="inline-block w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="mt-4 text-slate-500">Cargando negocios...</p>
                            </div>
                        )}

                        {/* Estado de error */}
                        {error && (
                            <div className="text-center py-20">
                                <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-2xl inline-block">
                                    <svg className="w-12 h-12 mx-auto mb-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p className="font-medium">{error}</p>
                                    <button
                                        onClick={fetchBusinesses}
                                        className="mt-4 px-5 py-2 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700 transition"
                                    >
                                        Reintentar
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Sin resultados */}
                        {!loading && !error && businesses.length === 0 && (
                            <div className="text-center py-20">
                                <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <p className="text-slate-500 text-lg">No hay negocios registrados aún.</p>
                                <p className="text-slate-400 text-sm mt-2">Sé el primero en unirte a Tribio</p>
                            </div>
                        )}

                        {/* Lista de negocios */}
                        {!loading && !error && businesses.length > 0 && (
                            <>
                                <div className="flex items-center justify-between mb-8">
                                    <p className="text-slate-500 text-sm">
                                        Mostrando <span className="font-semibold text-slate-700">{businesses.length}</span> negocios
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {businesses.map((business) => (
                                        <Link
                                            key={business.id}
                                            href={`/${business.slug}`}
                                            className="group block bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 hover:border-cyan-300 transition-all duration-300"
                                        >
                                            {/* Cover */}
                                            <div className="h-36 bg-gradient-to-br from-cyan-400 to-cyan-600 relative overflow-hidden">
                                                {business.cover_url ? (
                                                    <img
                                                        src={business.cover_url}
                                                        alt=""
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-cyan-400 via-cyan-500 to-cyan-600">
                                                        <div className="absolute inset-0 opacity-30">
                                                            <div className="absolute top-4 right-4 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
                                                            <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/20 rounded-full blur-xl"></div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Logo */}
                                                <div className="absolute -bottom-8 left-5">
                                                    <div className="w-16 h-16 bg-white rounded-2xl border-4 border-white shadow-lg overflow-hidden ring-1 ring-slate-100">
                                                        {business.logo_url ? (
                                                            <img
                                                                src={business.logo_url}
                                                                alt=""
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-slate-900 flex items-center justify-center text-cyan-400 text-xl font-bold">
                                                                {business.name?.charAt(0) || '?'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="pt-12 pb-5 px-5">
                                                <h3 className="font-bold text-slate-900 text-lg truncate group-hover:text-cyan-600 transition-colors">
                                                    {business.name || 'Sin nombre'}
                                                </h3>

                                                {business.business_category && (
                                                    <span className="inline-block mt-2 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                                                        {business.business_category.name}
                                                    </span>
                                                )}

                                                {business.description && (
                                                    <p className="mt-3 text-slate-500 text-sm line-clamp-2">
                                                        {business.description}
                                                    </p>
                                                )}

                                                {business.address && (
                                                    <p className="mt-3 text-slate-400 text-xs flex items-center gap-1.5 truncate">
                                                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        {business.address}
                                                    </p>
                                                )}

                                                <div className="mt-4 flex items-center text-cyan-600 text-sm font-semibold group-hover:gap-2 transition-all">
                                                    Ver perfil
                                                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-slate-50">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-10 md:p-14">
                            <div className="w-16 h-16 mx-auto mb-6 bg-cyan-100 rounded-2xl flex items-center justify-center">
                                <svg className="w-8 h-8 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>

                            <h2 className="font-display text-2xl md:text-3xl font-black text-slate-900 mb-4">
                                ¿Tienes un negocio?
                            </h2>

                            <p className="text-slate-600 max-w-lg mx-auto mb-8">
                                Únete a Tribio y crea tu perfil digital profesional.
                                Comparte tu link, recibe clientes y vende desde un solo lugar.
                            </p>

                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-semibold rounded-full hover:bg-slate-800 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 transition-all"
                            >
                                Registrar mi Negocio
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </section>
            </WebLayout>
        </>
    );
}
