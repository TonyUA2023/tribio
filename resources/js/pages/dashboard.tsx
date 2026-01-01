import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
// Importamos 'usePage' y 'Link' de Inertia
import { Head, Link, usePage } from '@inertiajs/react';

// --- Definición de Tipos (Props de Laravel) ---
interface Template {
    id: number;
    name: string;
}

interface Plan {
    id: number;
    name: string;
}

interface Profile {
    id: number;
    name: string;
    slug: string;
    render_type: 'template' | 'custom';
    template: Template | null;
}

interface Account {
    id: number;
    name: string;
    slug: string;
    type: 'company' | 'personal';
    payment_status: 'active' | 'due' | 'suspended';
    plan: Plan | null;
}

interface PageProps {
    account: Account | null;
    profiles: Profile[];
    [key: string]: any; // Para que TypeScript acepte otras props de Inertia
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    // Obtenemos los datos que pasamos desde Client/DashboardController.php
    const { account, profiles } = usePage<PageProps>().props;

    // --- Manejo de Error: Si el usuario no tiene cuenta ---
    if (!account) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Error de Cuenta" />
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    <h1 className="text-xl font-semibold text-red-500">Error</h1>
                    <p>Tu usuario no está asociado a ninguna cuenta de cliente.</p>
                </div>
            </AppLayout>
        );
    }

    // --- Vista Principal del Dashboard del Cliente ---
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Dashboard de ${account.name}`} />
            
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                
                {/* --- Cabecera de Bienvenida --- */}
                <div className="mb-4">
                    <h1 className="text-2xl font-bold">Bienvenido, {account.name}</h1>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        Aquí puedes ver y gestionar tus perfiles públicos.
                    </p>
                </div>

                {/* --- Rejilla de Estadísticas (reemplazando los 3 placeholders) --- */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Total Perfiles</h3>
                        <p className="text-4xl font-bold">{profiles.length}</p>
                    </div>
                    <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Plan Actual</h3>
                        <p className="text-4xl font-bold">{account.plan?.name ?? 'N/A'}</p>
                    </div>
                    <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Estado de Cuenta</h3>
                        <p className="text-4xl font-bold capitalize text-green-500">{account.payment_status}</p>
                    </div>
                </div>

                {/* --- Lista de Perfiles (reemplazando el placeholder grande) --- */}
                <div className="relative min-h-[50vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 p-4 md:min-h-min dark:border-sidebar-border">
                    <h3 className="text-xl font-semibold mb-4">Mis Perfiles</h3>
                    
                    {profiles.length > 0 ? (
                        <ul className="space-y-4">
                            {profiles.map((profile) => (
                                <li 
                                    key={profile.id} 
                                    className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-sidebar-border/70 p-4 dark:border-sidebar-border"
                                >
                                    <div>
                                        <h4 className="font-semibold">{profile.name}</h4>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                            Tipo: {profile.render_type === 'custom' ? 'Diseño Personalizado' : `Plantilla (${profile.template?.name ?? 'N/A'})`}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 space-x-4">
                                        <a 
                                            href={`/${account.slug}/${profile.slug}`} 
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-medium text-blue-600 hover:underline dark:text-blue-500"
                                        >
                                            Ver Perfil
                                        </a>
                                        {/* Próximo paso: Enlace de Edición */}
                                        {/* <Link href={...} className="font-medium text-gray-600 hover:underline dark:text-gray-400">Editar</Link> */}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-neutral-500 dark:text-neutral-400">
                            No tienes ningún perfil creado todavía.
                        </p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
