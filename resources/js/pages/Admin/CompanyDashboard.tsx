import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

interface Template {
    id: number;
    name: string;
}

interface Plan {
    id: number;
    name: string;
    price: number;
    type: string;
}

interface Profile {
    id: number;
    name: string;
    title: string;
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

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface PageProps {
    account: Account;
    profiles: Profile[];
    user: User;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard Empresarial',
        href: dashboard().url,
    },
];

export default function CompanyDashboard({ account, profiles, user }: PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Dashboard - ${account.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">

                {/* Cabecera de Bienvenida */}
                <div className="mb-2">
                    <h1 className="text-3xl font-bold">{account.name}</h1>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        Panel de administración de perfiles corporativos
                    </p>
                </div>

                {/* Estadísticas Generales */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
                        <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Perfiles</h3>
                        <p className="mt-2 text-3xl font-bold text-blue-600">{profiles.length}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Empleados activos</p>
                    </div>

                    <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
                        <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Plan Contratado</h3>
                        <p className="mt-2 text-xl font-bold">{account.plan?.name ?? 'Sin Plan'}</p>
                        {account.plan && (
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                {account.plan.type === 'service' ? 'Servicio Personalizado' : 'Plan SaaS'}
                            </p>
                        )}
                    </div>

                    <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
                        <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Estado de Cuenta</h3>
                        <p className={`mt-2 text-xl font-bold capitalize ${
                            account.payment_status === 'active' ? 'text-green-600' :
                            account.payment_status === 'due' ? 'text-yellow-600' :
                            'text-red-600'
                        }`}>
                            {account.payment_status === 'active' ? '✓ Activa' :
                             account.payment_status === 'due' ? '⚠ Pendiente' :
                             '✗ Suspendida'}
                        </p>
                    </div>

                    <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
                        <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Tipo de Diseño</h3>
                        <p className="mt-2 text-xl font-bold">
                            {profiles.length > 0 && profiles[0].render_type === 'custom' ?
                                '🎨 Personalizado' :
                                '📄 Plantilla'}
                        </p>
                    </div>
                </div>

                {/* Tabla de Perfiles de Empleados */}
                <div className="relative flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
                    <div className="border-b border-neutral-200 p-6 dark:border-neutral-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-semibold">Perfiles de Empleados</h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    Gestiona las tarjetas digitales de tu equipo
                                </p>
                            </div>
                            {/*
                            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                                + Añadir Empleado
                            </button>
                            */}
                        </div>
                    </div>

                    <div className="p-6">
                        {profiles.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="border-b border-neutral-200 dark:border-neutral-700">
                                        <tr>
                                            <th className="pb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                                Nombre
                                            </th>
                                            <th className="pb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                                Cargo
                                            </th>
                                            <th className="pb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                                Tipo
                                            </th>
                                            <th className="pb-3 text-right text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                        {profiles.map((profile) => (
                                            <tr key={profile.id} className="group hover:bg-neutral-50 dark:hover:bg-neutral-800">
                                                <td className="py-4">
                                                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                                        {profile.name}
                                                    </div>
                                                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                                        /{account.slug}/{profile.slug}
                                                    </div>
                                                </td>
                                                <td className="py-4 text-sm text-neutral-600 dark:text-neutral-400">
                                                    {profile.title}
                                                </td>
                                                <td className="py-4">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                        profile.render_type === 'custom' ?
                                                            'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                                            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                    }`}>
                                                        {profile.render_type === 'custom' ?
                                                            '🎨 Custom' :
                                                            `📄 ${profile.template?.name ?? 'Template'}`}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <a
                                                            href={`/${account.slug}/${profile.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                                                        >
                                                            Ver Perfil
                                                        </a>
                                                        {/*
                                                        <button className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700">
                                                            Editar
                                                        </button>
                                                        */}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="text-4xl mb-4">👥</div>
                                <p className="text-lg font-medium text-neutral-700 dark:text-neutral-300">
                                    No hay perfiles creados
                                </p>
                                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                                    Comienza añadiendo perfiles para tus empleados
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
