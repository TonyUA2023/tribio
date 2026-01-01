import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, usePage } from '@inertiajs/react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Configuración',
        href: '/settings',
    },
    {
        title: 'Negocio',
        href: '/settings/business',
    },
];

export default function BusinessSettings() {
    const { account } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración del Negocio" />

            <div className="mx-auto max-w-4xl space-y-6 py-12">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Configuración del Negocio
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Administra la información básica de tu negocio
                    </p>
                </div>

                <div className="space-y-6 rounded-lg border bg-card p-6 shadow-sm">
                    <HeadingSmall
                        title="Información del Negocio"
                        description="Actualiza el nombre y detalles de tu negocio"
                    />

                    <Form
                        method="post"
                        action="/settings/business"
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="business_name">
                                        Nombre del Negocio
                                    </Label>

                                    <Input
                                        id="business_name"
                                        className="mt-1 block w-full"
                                        defaultValue={
                                            account?.profile?.name ||
                                            account?.name ||
                                            ''
                                        }
                                        name="business_name"
                                        required
                                        placeholder="Nombre de tu negocio"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.business_name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="business_title">
                                        Título o Subtítulo
                                    </Label>

                                    <Input
                                        id="business_title"
                                        className="mt-1 block w-full"
                                        defaultValue={
                                            account?.profile?.title || ''
                                        }
                                        name="business_title"
                                        placeholder="Ej: Barbería Premium, Spa & Wellness"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.business_title}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="business_slug">
                                        URL Personalizada
                                    </Label>

                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                            {window.location.origin}/
                                        </span>
                                        <Input
                                            id="business_slug"
                                            className="flex-1"
                                            defaultValue={account?.slug || ''}
                                            name="business_slug"
                                            required
                                            placeholder="mi-negocio"
                                        />
                                    </div>

                                    <p className="text-xs text-muted-foreground">
                                        Esta será la dirección web de tu página
                                        de reservas
                                    </p>

                                    <InputError
                                        className="mt-2"
                                        message={errors.business_slug}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="notification_email">
                                        Email para Notificaciones de Reservas
                                    </Label>

                                    <Input
                                        id="notification_email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={
                                            account?.profile?.notification_email || ''
                                        }
                                        name="notification_email"
                                        placeholder="notificaciones@tunegocio.com"
                                    />

                                    <p className="text-xs text-muted-foreground">
                                        Recibirás un email cada vez que un cliente haga una reserva
                                    </p>

                                    <InputError
                                        className="mt-2"
                                        message={errors.notification_email}
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-business-button"
                                    >
                                        Guardar Cambios
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-muted-foreground">
                                            Cambios guardados exitosamente
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <div className="space-y-6 rounded-lg border bg-card p-6 shadow-sm">
                    <HeadingSmall
                        title="Gestión de Usuarios"
                        description="Administra los usuarios que tienen acceso al panel"
                    />

                    <div className="text-sm text-muted-foreground">
                        <p>
                            Próximamente: Aquí podrás agregar, editar o eliminar
                            usuarios que tengan acceso al panel de
                            administración de tu negocio.
                        </p>
                    </div>
                </div>

                <div className="space-y-6 rounded-lg border border-destructive/50 bg-card p-6 shadow-sm">
                    <HeadingSmall
                        title="Zona de Peligro"
                        description="Acciones irreversibles para tu cuenta"
                    />

                    <div>
                        <Button variant="destructive" disabled>
                            Eliminar Negocio
                        </Button>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Esta acción eliminará permanentemente tu negocio y
                            todos los datos asociados.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
