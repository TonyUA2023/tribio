import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import { useToast } from '@/contexts/ToastContext';

interface Plan {
    id: number;
    name: string;
    type: string;
    price: number;
    billing_cycle: string;
}

interface BusinessCategory {
    id: number;
    slug: string;
    name: string;
    icon: string | null;
    default_modules: string[];
    children?: BusinessCategory[];
}

interface PageProps {
    plans: Plan[];
    categories: BusinessCategory[];
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
    const { plans, categories } = usePage<PageProps>().props;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedModules, setSelectedModules] = useState<string[]>([]);
    const [availableModules, setAvailableModules] = useState<string[]>([]);
    const { success, error } = useToast();

    const { data, setData, post, processing, errors, reset } = useForm({
        account_name: '',
        account_slug: '',
        account_type: 'business' as 'company' | 'personal' | 'business',
        plan_id: plans.length > 0 ? plans[0].id : 0,
        payment_status: 'active' as 'active' | 'due' | 'suspended',
        business_category_id: null as number | null,
        modules: [] as string[],
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

    // Actualizar módulos disponibles cuando cambia la categoría
    useEffect(() => {
        if (data.business_category_id) {
            const allCategories = categories.flatMap(cat => [cat, ...(cat.children || [])]);
            const selectedCategory = allCategories.find(cat => cat.id === data.business_category_id);

            if (selectedCategory && selectedCategory.default_modules) {
                setAvailableModules(selectedCategory.default_modules);
                setSelectedModules(selectedCategory.default_modules);
                setData('modules', selectedCategory.default_modules);
            }
        } else {
            setAvailableModules([]);
            setSelectedModules([]);
            setData('modules', []);
        }
    }, [data.business_category_id]);

    const handleModuleToggle = (moduleSlug: string) => {
        const newModules = selectedModules.includes(moduleSlug)
            ? selectedModules.filter(m => m !== moduleSlug)
            : [...selectedModules, moduleSlug];

        setSelectedModules(newModules);
        setData('modules', newModules);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        post('/admin/accounts', {
            preserveScroll: true,
            onSuccess: () => {
                success('El cliente ha sido creado exitosamente');
                setTimeout(() => {
                    router.visit('/admin/dashboard');
                }, 1500);
            },
            onError: (errors) => {
                console.error('Errores:', errors);
                const errorMessage = Object.values(errors).flat().join(', ') || 'Error al crear el cliente';
                error(errorMessage);
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
                                        setData('account_type', e.target.value as 'company' | 'personal' | 'business')
                                    }
                                    className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
                                    required
                                >
                                    <option value="personal">👤 Personal (Emprendedor Individual)</option>
                                    <option value="company">🏢 Empresa (Múltiples Empleados)</option>
                                    <option value="business">💼 Negocio (Categoría Modular)</option>
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

                            {/* Categoría de Negocio */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Categoría de Negocio
                                </label>
                                <select
                                    value={data.business_category_id || ''}
                                    onChange={(e) =>
                                        setData('business_category_id', e.target.value ? parseInt(e.target.value) : null)
                                    }
                                    className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200"
                                >
                                    <option value="">Seleccionar categoría...</option>
                                    {categories.map((category) => (
                                        <optgroup key={category.id} label={category.name}>
                                            {category.children && category.children.map((child) => (
                                                <option key={child.id} value={child.id}>
                                                    {child.name}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-neutral-500">
                                    Selecciona el tipo de negocio para cargar módulos sugeridos
                                </p>
                                {errors.business_category_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.business_category_id}</p>
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

                    {/* Módulos Section */}
                    {availableModules.length > 0 && (
                        <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-900">
                            <h2 className="mb-4 text-xl font-semibold">Módulos del Negocio</h2>
                            <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
                                Selecciona los módulos que estarán disponibles para este negocio
                            </p>

                            <div className="grid gap-3 md:grid-cols-3">
                                {availableModules.map((moduleSlug) => (
                                    <label
                                        key={moduleSlug}
                                        className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                                            selectedModules.includes(moduleSlug)
                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                : 'border-neutral-300 bg-white hover:border-indigo-300 dark:border-neutral-600 dark:bg-neutral-800'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedModules.includes(moduleSlug)}
                                            onChange={() => handleModuleToggle(moduleSlug)}
                                            className="h-5 w-5 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="font-medium capitalize">
                                            {moduleSlug.replace(/-/g, ' ')}
                                        </span>
                                    </label>
                                ))}
                            </div>

                            {errors.modules && (
                                <p className="mt-2 text-sm text-red-600">{errors.modules}</p>
                            )}
                        </div>
                    )}

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
