import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface UserAccount {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    plan_type?: string;
    subscription_status?: string;
}

interface PageProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        } | null;
    };
    userAccounts: UserAccount[];
}

export default function SelectAccount() {
    const { auth, userAccounts } = usePage<PageProps>().props;
    const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSelectAccount = (accountId: number) => {
        setSelectedAccount(accountId);
        setIsLoading(true);

        // Guardar la cuenta seleccionada en sesión y redirigir al dashboard
        router.post('/auth/select-account', { account_id: accountId }, {
            onSuccess: () => {
                router.visit('/dashboard');
            },
            onError: () => {
                setIsLoading(false);
                setSelectedAccount(null);
            }
        });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .substring(0, 2)
            .toUpperCase();
    };

    return (
        <>
            <Head title="Selecciona tu negocio - Tribio" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl">
                    {/* Logo y Header */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-3 mb-6">
                            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 shadow-lg shadow-slate-900/30">
                                <svg
                                    className="w-8 h-8 text-cyan-400"
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
                            <span className="text-2xl font-bold text-slate-900">
                                Tribio<span className="text-cyan-500">.info</span>
                            </span>
                        </Link>

                        <h1 className="text-2xl font-bold text-slate-900">
                            Selecciona tu negocio
                        </h1>
                        <p className="mt-2 text-slate-600">
                            Elige el negocio que deseas administrar
                        </p>

                        {auth?.user && (
                            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">
                                        {getInitials(auth.user.name)}
                                    </span>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-slate-900">{auth.user.name}</p>
                                    <p className="text-xs text-slate-500">{auth.user.email}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Lista de Negocios */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                        <div className="p-1">
                            {userAccounts.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900">No tienes negocios</h3>
                                    <p className="mt-2 text-sm text-slate-600">
                                        Crea tu primer negocio para empezar a usar Tribio
                                    </p>
                                    <Link
                                        href="/registro"
                                        className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-xl font-semibold text-sm hover:bg-sky-700 transition"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Crear mi primer negocio
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid gap-1">
                                    {userAccounts.map((account) => (
                                        <button
                                            key={account.id}
                                            onClick={() => handleSelectAccount(account.id)}
                                            disabled={isLoading}
                                            className={`
                                                w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all
                                                ${selectedAccount === account.id
                                                    ? 'bg-sky-50 border-2 border-sky-500'
                                                    : 'hover:bg-slate-50 border-2 border-transparent'
                                                }
                                                ${isLoading && selectedAccount !== account.id ? 'opacity-50' : ''}
                                            `}
                                        >
                                            {/* Logo o Iniciales */}
                                            <div className="relative">
                                                <div className={`
                                                    w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden
                                                    ${account.logo
                                                        ? 'bg-white border border-slate-200'
                                                        : 'bg-gradient-to-br from-sky-500 to-cyan-500'
                                                    }
                                                `}>
                                                    {account.logo ? (
                                                        <img
                                                            src={account.logo}
                                                            alt={account.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-white text-xl font-bold">
                                                            {getInitials(account.name)}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Indicador de carga */}
                                                {isLoading && selectedAccount === account.id && (
                                                    <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
                                                        <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info del negocio */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-slate-900 truncate">
                                                    {account.name}
                                                </h3>
                                                <p className="text-sm text-sky-600">
                                                    tribio.info/{account.slug}
                                                </p>
                                                {account.plan_type && (
                                                    <span className={`
                                                        inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium
                                                        ${account.plan_type === 'pro'
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : 'bg-slate-100 text-slate-600'
                                                        }
                                                    `}>
                                                        Plan {account.plan_type === 'pro' ? 'Pro' : 'Personal'}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Flecha */}
                                            <div className={`
                                                w-10 h-10 rounded-full flex items-center justify-center transition
                                                ${selectedAccount === account.id
                                                    ? 'bg-sky-500 text-white'
                                                    : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                                                }
                                            `}>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer con opción de agregar negocio */}
                        {userAccounts.length > 0 && (
                            <div className="border-t border-slate-100 p-4">
                                <Link
                                    href="/registro"
                                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50 transition"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Agregar otro negocio
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Logout */}
                    <div className="mt-6 text-center">
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="text-sm text-slate-500 hover:text-slate-700 transition"
                        >
                            Cerrar sesión
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
