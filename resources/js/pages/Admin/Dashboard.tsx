import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

interface Plan {
    id: number;
    name: string;
    price: number;
    type: string;
}

interface Owner {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Account {
    id: number;
    name: string;
    slug: string;
    type: 'company' | 'personal';
    payment_status: 'active' | 'due' | 'suspended';
    next_billing_date: string | null;
    plan: Plan | null;
    owner: Owner;
}

interface PageProps {
    accounts: Account[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Super Admin Dashboard',
        href: '/admin/dashboard',
    },
];

export default function AdminDashboard() {
    const { accounts } = usePage<PageProps>().props;
    const [filterType, setFilterType] = useState<'all' | 'company' | 'personal'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'due' | 'suspended'>('all');
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleViewAccount = (account: Account) => {
        setSelectedAccount(account);
        setIsDialogOpen(true);
    };

    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        alert('URL copiada al portapapeles');
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Filtrar cuentas
    const filteredAccounts = accounts.filter((account) => {
        const typeMatch = filterType === 'all' || account.type === filterType;
        const statusMatch = filterStatus === 'all' || account.payment_status === filterStatus;
        return typeMatch && statusMatch;
    });

    // Estadísticas
    const stats = {
        total: accounts.length,
        companies: accounts.filter((a) => a.type === 'company').length,
        individuals: accounts.filter((a) => a.type === 'personal').length,
        active: accounts.filter((a) => a.payment_status === 'active').length,
        due: accounts.filter((a) => a.payment_status === 'due').length,
        suspended: accounts.filter((a) => a.payment_status === 'suspended').length,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Super Admin Dashboard - JSTACK" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Cabecera */}
                <div className="mb-2">
                    <h1 className="text-3xl font-bold">Dashboard de Super Admin</h1>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        Panel de control maestro de JSTACK Hub
                    </p>
                </div>

                {/* Estadísticas Globales */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg dark:border-sidebar-border">
                        <h3 className="text-sm font-medium opacity-90">Total Clientes</h3>
                        <p className="mt-2 text-4xl font-bold">{stats.total}</p>
                        <div className="mt-2 text-xs opacity-75">
                            {stats.companies} empresas · {stats.individuals} individuales
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg dark:border-sidebar-border">
                        <h3 className="text-sm font-medium opacity-90">Cuentas Activas</h3>
                        <p className="mt-2 text-4xl font-bold">{stats.active}</p>
                        <div className="mt-2 text-xs opacity-75">
                            {((stats.active / stats.total) * 100).toFixed(0)}% del total
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 text-white shadow-lg dark:border-sidebar-border">
                        <h3 className="text-sm font-medium opacity-90">Pagos Pendientes</h3>
                        <p className="mt-2 text-4xl font-bold">{stats.due}</p>
                        <div className="mt-2 text-xs opacity-75">Requieren atención</div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-gradient-to-br from-red-500 to-red-600 p-6 text-white shadow-lg dark:border-sidebar-border">
                        <h3 className="text-sm font-medium opacity-90">Suspendidas</h3>
                        <p className="mt-2 text-4xl font-bold">{stats.suspended}</p>
                        <div className="mt-2 text-xs opacity-75">Sin acceso al sistema</div>
                    </div>
                </div>

                {/* Panel de Gestión */}
                <div className="relative flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
                    {/* Header con filtros y botón */}
                    <div className="border-b border-neutral-200 p-6 dark:border-neutral-700">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-semibold">Gestión de Clientes</h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    Administra todas las cuentas de la plataforma
                                </p>
                            </div>

                            <button
                                onClick={() => router.visit('/admin/accounts/create')}
                                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                + Nuevo Cliente
                            </button>
                        </div>

                        {/* Filtros */}
                        <div className="mt-4 flex flex-wrap gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Tipo:
                                </span>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value as any)}
                                    className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
                                >
                                    <option value="all">Todos</option>
                                    <option value="company">Empresas</option>
                                    <option value="personal">Individuales</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Estado:
                                </span>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value as any)}
                                    className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
                                >
                                    <option value="all">Todos</option>
                                    <option value="active">Activos</option>
                                    <option value="due">Pendientes</option>
                                    <option value="suspended">Suspendidos</option>
                                </select>
                            </div>

                            <div className="ml-auto text-sm text-neutral-500 dark:text-neutral-400">
                                Mostrando {filteredAccounts.length} de {accounts.length} clientes
                            </div>
                        </div>
                    </div>

                    {/* Tabla de Clientes */}
                    <div className="overflow-x-auto p-6">
                        {filteredAccounts.length > 0 ? (
                            <table className="w-full text-left text-sm">
                                <thead className="border-b-2 border-neutral-200 dark:border-neutral-700">
                                    <tr>
                                        <th className="pb-3 font-semibold text-neutral-700 dark:text-neutral-300">
                                            Cliente
                                        </th>
                                        <th className="pb-3 font-semibold text-neutral-700 dark:text-neutral-300">
                                            Contacto
                                        </th>
                                        <th className="pb-3 font-semibold text-neutral-700 dark:text-neutral-300">
                                            Tipo
                                        </th>
                                        <th className="pb-3 font-semibold text-neutral-700 dark:text-neutral-300">
                                            Plan
                                        </th>
                                        <th className="pb-3 font-semibold text-neutral-700 dark:text-neutral-300">
                                            Estado
                                        </th>
                                        <th className="pb-3 font-semibold text-neutral-700 dark:text-neutral-300">
                                            Próx. Pago
                                        </th>
                                        <th className="pb-3 text-right font-semibold text-neutral-700 dark:text-neutral-300">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                    {filteredAccounts.map((account) => (
                                        <tr
                                            key={account.id}
                                            className="group hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                        >
                                            <td className="py-4">
                                                <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                                    {account.name}
                                                </div>
                                                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                                    /{account.slug}
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <div className="text-neutral-700 dark:text-neutral-300">
                                                    {account.owner.name}
                                                </div>
                                                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                                    {account.owner.email}
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                        account.type === 'company'
                                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                    }`}
                                                >
                                                    {account.type === 'company'
                                                        ? '🏢 Empresa'
                                                        : '👤 Individual'}
                                                </span>
                                            </td>
                                            <td className="py-4 text-neutral-700 dark:text-neutral-300">
                                                {account.plan?.name ?? 'Sin Plan'}
                                            </td>
                                            <td className="py-4">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                        account.payment_status === 'active'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                            : account.payment_status === 'due'
                                                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                    }`}
                                                >
                                                    {account.payment_status === 'active'
                                                        ? '✓ Activo'
                                                        : account.payment_status === 'due'
                                                          ? '⚠ Pendiente'
                                                          : '✗ Suspendido'}
                                                </span>
                                            </td>
                                            <td className="py-4 text-neutral-600 dark:text-neutral-400">
                                                {formatDate(account.next_billing_date)}
                                            </td>
                                            <td className="py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleViewAccount(account)}
                                                        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                                                    >
                                                        Ver
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            console.log('Editar:', account.name)
                                                        }
                                                        className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                                                    >
                                                        Editar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="mb-4 text-4xl">🔍</div>
                                <p className="text-lg font-medium text-neutral-700 dark:text-neutral-300">
                                    No se encontraron clientes
                                </p>
                                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                                    Intenta ajustar los filtros
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Detalles del Cliente */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detalles del Cliente</DialogTitle>
                        <DialogDescription>
                            Información completa y URLs del portafolio
                        </DialogDescription>
                    </DialogHeader>

                    {selectedAccount && (
                        <div className="space-y-6">
                            {/* Información de la Cuenta */}
                            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
                                <h3 className="mb-3 font-semibold text-neutral-900 dark:text-neutral-100">
                                    Información de la Cuenta
                                </h3>
                                <div className="grid gap-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600 dark:text-neutral-400">
                                            Nombre:
                                        </span>
                                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                            {selectedAccount.name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600 dark:text-neutral-400">
                                            Slug:
                                        </span>
                                        <span className="font-mono text-neutral-900 dark:text-neutral-100">
                                            {selectedAccount.slug}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600 dark:text-neutral-400">
                                            Tipo:
                                        </span>
                                        <span className="font-medium">
                                            {selectedAccount.type === 'company'
                                                ? '🏢 Empresa'
                                                : '👤 Individual'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600 dark:text-neutral-400">
                                            Plan:
                                        </span>
                                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                            {selectedAccount.plan?.name ?? 'Sin Plan'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600 dark:text-neutral-400">
                                            Estado:
                                        </span>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                selectedAccount.payment_status === 'active'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : selectedAccount.payment_status === 'due'
                                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}
                                        >
                                            {selectedAccount.payment_status === 'active'
                                                ? '✓ Activo'
                                                : selectedAccount.payment_status === 'due'
                                                  ? '⚠ Pendiente'
                                                  : '✗ Suspendido'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Información del Dueño */}
                            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
                                <h3 className="mb-3 font-semibold text-neutral-900 dark:text-neutral-100">
                                    Dueño de la Cuenta
                                </h3>
                                <div className="grid gap-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600 dark:text-neutral-400">
                                            Nombre:
                                        </span>
                                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                            {selectedAccount.owner.name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600 dark:text-neutral-400">
                                            Email:
                                        </span>
                                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                            {selectedAccount.owner.email}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600 dark:text-neutral-400">
                                            Rol:
                                        </span>
                                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                            {selectedAccount.owner.role}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* URLs del Portafolio */}
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                <h3 className="mb-3 font-semibold text-blue-900 dark:text-blue-100">
                                    🔗 URLs del Portafolio
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-blue-800 dark:text-blue-200">
                                            URL Base del Cliente:
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                readOnly
                                                value={`${window.location.origin}/${selectedAccount.slug}`}
                                                className="flex-1 rounded-md border border-blue-300 bg-white px-3 py-2 font-mono text-sm text-blue-900 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-100"
                                            />
                                            <button
                                                onClick={() =>
                                                    handleCopyUrl(
                                                        `${window.location.origin}/${selectedAccount.slug}`,
                                                    )
                                                }
                                                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                            >
                                                Copiar
                                            </button>
                                        </div>
                                        <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                                            {selectedAccount.type === 'personal'
                                                ? 'URL principal del portafolio (muestra su perfil por defecto)'
                                                : 'URL principal de la empresa (muestra el primer perfil o listado)'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-blue-800 dark:text-blue-200">
                                            Formato para Perfiles Individuales:
                                        </label>
                                        <div className="rounded-md border border-blue-300 bg-white px-3 py-2 font-mono text-sm text-blue-900 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-100">
                                            {window.location.origin}/{selectedAccount.slug}/
                                            <span className="text-blue-600 dark:text-blue-400">
                                                [slug-del-perfil]
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                                            Reemplaza [slug-del-perfil] con el slug del perfil
                                            específico
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
