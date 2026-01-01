import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import { useToast } from '@/components/toast-container';

interface Plan {
    id: number;
    name: string;
    type: string;
    price: number;
    billing_cycle: string;
}

interface PageProps {
    plans: Plan[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Nuevo Cliente',
        href: '/admin/accounts/create',
    },
];

export default function AccountCreate() {
    const { plans } = usePage<PageProps>().props;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showSuccess, showError } = useToast();

    const { data, setData, post, processing, errors, reset } = useForm({
        account_name: '',
        account_slug: '',
        account_type: 'personal' as 'company' | 'personal',
        plan_id: plans.length > 0 ? plans[0].id : 0,
        payment_status: 'active' as 'active' | 'due' | 'suspended',
        owner_name: '',
        owner_email: '',
        owner_password: '',
        owner_password_confirmation: '',
    });

    // Auto-generar slug cuando cambia el nombre de la cuenta
    useEffect(() => {
        if (data.account_name && !data.account_slug) {
            const slug = data.account_name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
            setData('account_slug', slug);
        }
    }, [data.account_name]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        post('/admin/accounts', {
            preserveScroll: true,
            onSuccess: () => {
                showSuccess('El cliente ha sido creado exitosamente');
                setTimeout(() => {
                    router.visit('/admin/dashboard');
                }, 1500);
            },
            onError: (errors) => {
                console.error('Errores:', errors);
                const errorMessage = Object.values(errors).flat().join(', ') || 'Error al crear el cliente';
                showError(errorMessage);
                setIsSubmitting(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Nuevo Cliente - JSTACK" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Crear Nuevo Cliente</h1>
                        <p className="text-neutral-600 dark:text-neutral-400">
                            Registra una nueva empresa o cliente individual
                        </p>
                    </div>
                    <Link
                        href="/admin/dashboard"
                        className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                    >
                        ← Volver
                    </Link>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Columna Izquierda - Información de la Cuenta */}
                        <div className="space-y-6 rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-900">
                            <h2 className="text-xl font-semibold">Información de la Cuenta</h2>

                            {/* Nombre de la Cuenta */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Nombre de la Cuenta *
                                </label>
                                <input
                                    type="text"
                                    value={data.account_name}
                                    onChange={(e) => setData('account_name', e.target.value)}
                                    className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
                                    placeholder="Ej: Empresa ABC S.A.C. o Juan Pérez"
                                    required
                                />
                                {errors.account_name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.account_name}</p>
                                )}
                            </div>

                            {/* Slug */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Slug (URL) *
                                </label>
                                <input
                                    type="text"
                                    value={data.account_slug}
                                    onChange={(e) => setData('account_slug', e.target.value)}
                                    className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
                                    placeholder="empresa-abc"
                                    pattern="[a-z0-9-]+"
                                    required
                                />
                                <p className="mt-1 text-xs text-neutral-500">
                                    Solo letras minúsculas, números y guiones. Ejemplo: empresa-abc
                                </p>
                                {errors.account_slug && (
                                    <p className="mt-1 text-sm text-red-600">{errors.account_slug}</p>
                                )}
                            </div>

                            {/* Tipo de Cuenta */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Tipo de Cuenta *
                                </label>
                                <select
                                    value={data.account_type}
                                    onChange={(e) =>
                                        setData('account_type', e.target.value as 'company' | 'personal')
                                    }
                                    className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
                                    required
                                >
                                    <option value="personal">👤 Personal (Emprendedor Individual)</option>
                                    <option value="company">🏢 Empresa (Múltiples Empleados)</option>
                                </select>
                                {errors.account_type && (
                                    <p className="mt-1 text-sm text-red-600">{errors.account_type}</p>
                                )}
                            </div>

                            {/* Plan */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Plan *
                                </label>
                                <select
                                    value={data.plan_id}
                                    onChange={(e) => setData('plan_id', parseInt(e.target.value))}
                                    className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
                                    required
                                >
                                    {plans.map((plan) => (
                                        <option key={plan.id} value={plan.id}>
                                            {plan.name} - ${plan.price} (
                                            {plan.billing_cycle === 'monthly'
                                                ? 'Mensual'
                                                : plan.billing_cycle === 'annual'
                                                  ? 'Anual'
                                                  : 'Pago Único'}
                                            )
                                        </option>
                                    ))}
                                </select>
                                {errors.plan_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.plan_id}</p>
                                )}
                            </div>

                            {/* Estado de Pago */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Estado de Pago *
                                </label>
                                <select
                                    value={data.payment_status}
                                    onChange={(e) =>
                                        setData(
                                            'payment_status',
                                            e.target.value as 'active' | 'due' | 'suspended',
                                        )
                                    }
                                    className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
                                    required
                                >
                                    <option value="active">✓ Activo</option>
                                    <option value="due">⚠ Pago Pendiente</option>
                                    <option value="suspended">✗ Suspendido</option>
                                </select>
                                {errors.payment_status && (
                                    <p className="mt-1 text-sm text-red-600">{errors.payment_status}</p>
                                )}
                            </div>
                        </div>

                        {/* Columna Derecha - Información del Usuario Dueño */}
                        <div className="space-y-6 rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-900">
                            <h2 className="text-xl font-semibold">Información del Usuario Dueño</h2>

                            {/* Nombre del Dueño */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Nombre Completo *
                                </label>
                                <input
                                    type="text"
                                    value={data.owner_name}
                                    onChange={(e) => setData('owner_name', e.target.value)}
                                    className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
                                    placeholder="Ej: Juan Pérez García"
                                    required
                                />
                                {errors.owner_name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.owner_name}</p>
                                )}
                            </div>

                            {/* Email del Dueño */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={data.owner_email}
                                    onChange={(e) => setData('owner_email', e.target.value)}
                                    className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
                                    placeholder="usuario@ejemplo.com"
                                    required
                                />
                                <p className="mt-1 text-xs text-neutral-500">
                                    Este será el email de inicio de sesión
                                </p>
                                {errors.owner_email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.owner_email}</p>
                                )}
                            </div>

                            {/* Contraseña */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Contraseña *
                                </label>
                                <input
                                    type="password"
                                    value={data.owner_password}
                                    onChange={(e) => setData('owner_password', e.target.value)}
                                    className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
                                    placeholder="Mínimo 8 caracteres"
                                    minLength={8}
                                    required
                                />
                                {errors.owner_password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.owner_password}</p>
                                )}
                            </div>

                            {/* Confirmar Contraseña */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Confirmar Contraseña *
                                </label>
                                <input
                                    type="password"
                                    value={data.owner_password_confirmation}
                                    onChange={(e) => setData('owner_password_confirmation', e.target.value)}
                                    className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
                                    placeholder="Repite la contraseña"
                                    minLength={8}
                                    required
                                />
                            </div>

                            {/* Información sobre el rol */}
                            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    ℹ️ El rol se asignará automáticamente:
                                    <br />
                                    <strong>Personal:</strong> rol "client" (emprendedor)
                                    <br />
                                    <strong>Empresa:</strong> rol "admin" (gestiona empleados)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex justify-end gap-4 rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-900">
                        <Link
                            href="/admin/dashboard"
                            className="rounded-lg border border-neutral-300 bg-white px-6 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={processing || isSubmitting}
                            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing || isSubmitting ? 'Creando...' : '✓ Crear Cliente'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
