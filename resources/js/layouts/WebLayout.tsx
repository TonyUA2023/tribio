import { Link } from '@inertiajs/react';
import { useState, useEffect, useRef, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import CustomCursor from '@/components/CustomCursor';

interface BusinessResult {
    id: number;
    name: string;
    slug: string;
    logo_url: string | null;
    description: string | null;
    business_category: {
        id: number;
        name: string;
        icon: string | null;
    } | null;
    address: string | null;
}

interface WebLayoutProps {
    children: ReactNode;
    showFooter?: boolean;
}

function WebHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<BusinessResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            setShowResults(false);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const response = await axios.get('/api/directory/businesses', {
                    params: { search: searchQuery, per_page: 6 }
                });

                if (response.data.success && Array.isArray(response.data.data)) {
                    setSearchResults(response.data.data);
                    setShowResults(true);
                }
            } catch (error) {
                console.error('Error searching:', error);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    const handleSearchFocus = () => {
        if (searchResults.length > 0) {
            setShowResults(true);
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
            <div className="max-w-7xl mx-auto px-4 lg:px-6">
                <div className="py-3">
                    <div
                        className="
                        w-full flex items-center gap-4
                        bg-white border border-slate-200
                        rounded-full shadow-xl
                        px-6 py-4
                        md:py-5
                        transition-all
                    "
                    >
                        {/* LOGO */}
                        <Link href="/" className="flex items-center gap-3 shrink-0 group">
                            <div
                                className="
                                flex items-center justify-center
                                w-12 h-12 rounded-xl
                                bg-slate-900 border border-slate-800
                                shadow-md shadow-slate-900/40
                                group-hover:scale-105
                                transition
                            "
                            >
                                <svg
                                    className="w-7 h-7 text-cyan-400"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M12 3L4 9v6l8 6 8-6V9l-8-6z" />
                                    <path d="M9.5 12.5c.5-2 1.5-3 2.5-3s2 1 2.5 3" />
                                    <path d="M10 15a2 2 0 0 0 4 0" />
                                </svg>
                            </div>

                            <span className="hidden sm:inline-block text-xl font-bold text-slate-900 tracking-tight">
                                Tribio<span className="text-cyan-500">.info</span>
                            </span>
                        </Link>

                        {/* BUSCADOR CON AUTOCOMPLETADO */}
                        <div className="flex-1 max-w-3xl" ref={searchRef}>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-4 flex items-center text-slate-400 z-10">
                                    {isSearching ? (
                                        <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <circle cx="11" cy="11" r="7" />
                                            <line x1="16.65" y1="16.65" x2="21" y2="21" />
                                        </svg>
                                    )}
                                </span>

                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={handleSearchFocus}
                                    placeholder="Buscar un negocio..."
                                    className="
                                        w-full rounded-full
                                        bg-slate-50 border border-slate-200
                                        pl-12 pr-4 py-3
                                        text-sm text-slate-800 placeholder-slate-400
                                        focus:outline-none focus:ring-2 focus:ring-cyan-400
                                        transition
                                    "
                                />

                                {/* DROPDOWN DE RESULTADOS */}
                                {showResults && (
                                    <div
                                        className="
                                        absolute top-full left-0 right-0 mt-2
                                        bg-slate-900 border border-slate-700
                                        rounded-2xl shadow-2xl
                                        overflow-hidden
                                        z-50
                                    "
                                    >
                                        {searchResults.length === 0 ? (
                                            <div className="px-4 py-6 text-center text-slate-400">
                                                No se encontraron negocios
                                            </div>
                                        ) : (
                                            <div className="py-2">
                                                {searchResults.map((business) => (
                                                    <Link
                                                        key={business.id}
                                                        href={`/${business.slug}`}
                                                        className="
                                                            flex items-center gap-4 px-4 py-3
                                                            hover:bg-slate-800
                                                            transition-colors
                                                        "
                                                        onClick={() => {
                                                            setShowResults(false);
                                                            setSearchQuery('');
                                                        }}
                                                    >
                                                        <div
                                                            className="
                                                            w-12 h-12 rounded-xl
                                                            bg-slate-700 border border-slate-600
                                                            flex items-center justify-center
                                                            overflow-hidden shrink-0
                                                        "
                                                        >
                                                            {business.logo_url ? (
                                                                <img
                                                                    src={business.logo_url}
                                                                    alt={business.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-lg font-bold text-cyan-400">
                                                                    {business.name?.charAt(0) || '?'}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-white font-semibold truncate">
                                                                {business.name}
                                                            </h4>
                                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                                {business.business_category && (
                                                                    <span
                                                                        className="
                                                                        px-2 py-0.5 text-xs
                                                                        bg-slate-700 text-slate-300
                                                                        rounded-full
                                                                    "
                                                                    >
                                                                        {business.business_category.name}
                                                                    </span>
                                                                )}
                                                                {business.address && (
                                                                    <span className="text-xs text-slate-400 truncate">
                                                                        {business.address}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <svg
                                                            className="w-5 h-5 text-slate-500 shrink-0"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M9 5l7 7-7 7"
                                                            />
                                                        </svg>
                                                    </Link>
                                                ))}

                                                <Link
                                                    href="/directorio"
                                                    className="
                                                        flex items-center justify-center gap-2
                                                        px-4 py-3 mt-1
                                                        border-t border-slate-700
                                                        text-cyan-400 text-sm font-medium
                                                        hover:bg-slate-800
                                                        transition-colors
                                                    "
                                                    onClick={() => {
                                                        setShowResults(false);
                                                        setSearchQuery('');
                                                    }}
                                                >
                                                    Ver todos los negocios
                                                    <svg
                                                        className="w-4 h-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                                                        />
                                                    </svg>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* NAVEGACION */}
                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium ml-4">
                            <Link
                                href="/precios"
                                className="text-slate-900 hover:text-cyan-600 transition"
                            >
                                Precios
                            </Link>

                            <Link
                                href="/directorio"
                                className="text-slate-900 hover:text-cyan-600 transition"
                            >
                                Negocios
                            </Link>

                            {/* CTA grupo lado derecho */}
                            <div className="flex items-center gap-3 ml-1">
                                <Link
                                    href="/tarjetas-nfc"
                                    title="Comprar tarjeta NFC directamente"
                                >
                                    <Button
                                        size="sm"
                                        className="
                                            rounded-full
                                            border border-slate-300
                                            bg-white text-slate-900
                                            hover:bg-slate-900 hover:text-white
                                            px-5
                                            transition
                                        "
                                    >
                                        Comprar tarjeta NFC
                                    </Button>
                                </Link>

                                <Link href="/registro-negocio">
                                    <Button
                                        size="sm"
                                        className="
                                            bg-sky-600 text-white font-semibold
                                            hover:bg-sky-700
                                            shadow-md shadow-sky-500/30
                                            hover:shadow-lg hover:shadow-sky-500/40
                                            px-5
                                            rounded-full
                                            border-0
                                            transition
                                        "
                                    >
                                        Registrar mi negocio
                                    </Button>
                                </Link>

                                <Link href="/login">
                                    <Button
                                        size="sm"
                                        className="
                                            bg-cyan-500 text-white font-semibold
                                            hover:bg-cyan-600
                                            shadow-md shadow-cyan-500/30
                                            hover:shadow-lg hover:shadow-cyan-500/40
                                            px-5
                                            rounded-full
                                            border-0
                                            transition
                                        "
                                    >
                                        Ingresar
                                    </Button>
                                </Link>
                            </div>
                        </nav>

                        {/* MENU MOVIL */}
                        <button
                            className="md:hidden p-2 text-slate-900 hover:bg-slate-100 rounded-full"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {mobileMenuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* MENU MOVIL EXPANDIDO */}
                {mobileMenuOpen && (
                    <div
                        className="
                        md:hidden absolute top-full left-0 right-0
                        bg-white border-b border-slate-200 shadow-xl
                        animate-in slide-in-from-top-2 duration-200
                    "
                    >
                        <nav className="flex flex-col p-4 space-y-2 text-sm font-medium">
                            <Link
                                href="/precios"
                                className="px-4 py-3 text-slate-900 hover:bg-slate-100 rounded-xl"
                            >
                                Precios
                            </Link>

                            <Link
                                href="/directorio"
                                className="px-4 py-3 text-slate-900 hover:bg-slate-100 rounded-xl"
                            >
                                Negocios
                            </Link>

                            <Link
                                href="/tarjetas-nfc"
                                className="px-4 py-3 text-slate-900 hover:bg-slate-100 rounded-xl"
                            >
                                Comprar tarjeta NFC
                            </Link>

                            <Link
                                href="/registro-negocio"
                                className="px-4 py-3 text-slate-900 hover:bg-slate-100 rounded-xl"
                            >
                                Registrar mi negocio
                            </Link>

                            <Link
                                href="/login"
                                className="px-4 py-3 text-slate-900 hover:bg-slate-100 rounded-xl text-center"
                            >
                                Ingresar
                            </Link>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}

function WebFooter() {
    return (
        <footer className="bg-white border-t border-slate-200 pt-16 pb-10 mt-16">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
                    {/* LOGO + DESCRIPCIÓN */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 shadow-sm">
                                <svg
                                    className="w-6 h-6 text-cyan-400"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M12 3L4 9v6l8 6 8-6V9l-8-6z" />
                                    <path d="M9.5 12.5c.5-2 1.5-3 2.5-3s2 1 2.5 3" />
                                    <path d="M10 15a2 2 0 0 0 4 0" />
                                </svg>
                            </div>
                            <span className="text-xl font-extrabold tracking-tight text-slate-900">
                                Tribio<span className="text-cyan-500">.info</span>
                            </span>
                        </div>

                        <p className="max-w-xs text-sm text-slate-600">
                            Tarjetas NFC inteligentes y mini páginas para negocios,
                            equipos y emprendedores que quieren compartir y vender más
                            desde un solo link.
                        </p>
                    </div>

                    {/* PRODUCTO */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Producto
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/#features"
                                    className="text-slate-700 transition hover:text-cyan-600"
                                >
                                    Características
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/#pricing"
                                    className="text-slate-700 transition hover:text-cyan-600"
                                >
                                    Planes y precios
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/#projects"
                                    className="text-slate-700 transition hover:text-cyan-600"
                                >
                                    Tiendas creadas
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/#faq"
                                    className="text-slate-700 transition hover:text-cyan-600"
                                >
                                    Preguntas frecuentes
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* TARJETAS NFC */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Tarjetas NFC
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/#nfc"
                                    className="text-slate-700 transition hover:text-cyan-600"
                                >
                                    ¿Qué es una tarjeta NFC?
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/#nfc"
                                    className="text-slate-700 transition hover:text-cyan-600"
                                >
                                    Comprar tarjetas
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/#nfc"
                                    className="text-slate-700 transition hover:text-cyan-600"
                                >
                                    Diseños personalizados
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* SOPORTE */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Soporte
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/contacto"
                                    className="text-slate-700 transition hover:text-cyan-600"
                                >
                                    Contacto y ayuda
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="https://wa.me/51900000000"
                                    className="text-slate-700 transition hover:text-cyan-600"
                                >
                                    WhatsApp
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/terminos"
                                    className="text-slate-700 transition hover:text-cyan-600"
                                >
                                    Términos de servicio
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/privacidad"
                                    className="text-slate-700 transition hover:text-cyan-600"
                                >
                                    Política de privacidad
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* LÍNEA DIVISORIA */}
                <div className="my-10 border-t border-slate-200" />

                {/* COPYRIGHT */}
                <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row">
                    <p className="text-xs text-slate-500">
                        © {new Date().getFullYear()} Tribio. Todos los derechos reservados.
                    </p>

                    <div className="flex items-center gap-4 text-xs">
                        <Link
                            href="/terminos"
                            className="text-slate-500 transition hover:text-cyan-600"
                        >
                            Términos
                        </Link>
                        <Link
                            href="/privacidad"
                            className="text-slate-500 transition hover:text-cyan-600"
                        >
                            Privacidad
                        </Link>
                        <Link
                            href="#"
                            className="text-slate-500 transition hover:text-cyan-600"
                        >
                            Cookies
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default function WebLayout({ children, showFooter = true }: WebLayoutProps) {
    useEffect(() => {
        document.body.classList.add('custom-cursor-enabled');
        return () => {
            document.body.classList.remove('custom-cursor-enabled');
        };
    }, []);

    return (
        <>
            <CustomCursor />
            <div className="min-h-screen bg-white antialiased">
                <WebHeader />
                {children}
                {showFooter && <WebFooter />}
            </div>
        </>
    );
}

export { WebHeader, WebFooter };
