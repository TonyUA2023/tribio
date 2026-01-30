import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import WebLayout from '@/layouts/WebLayout';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

function Login({ status, canResetPassword, canRegister }: LoginProps) {
    return (
        <>
            <Head title="Ingresar" />

            {/* El degradado ahora cubre al menos toda la pantalla */}
            <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100">
                <div className="max-w-6xl mx-auto px-4">
                    {/* Contenedor centrado en toda la altura disponible */}
                    <div className="min-h-screen flex flex-col items-center justify-center gap-8 py-12">
                        {/* Cabecera / título */}
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center rounded-full border border-sky-100 bg-sky-50 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
                                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-sky-500" />
                                Panel Tribio
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
                                    Ingresa a tu cuenta Tribio
                                </h1>
                                <p className="text-sm md:text-base text-slate-500 max-w-xl mx-auto">
                                    Accede a tu mini página, tarjetas NFC y panel de negocio desde un solo lugar.
                                </p>
                            </div>
                        </div>

                        {/* Mensaje de estado */}
                        {status && (
                            <div className="w-full max-w-md rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700">
                                {status}
                            </div>
                        )}

                        {/* Card del formulario */}
                        <div className="w-full max-w-md">
                            <Form
                                {...store.form()}
                                resetOnSuccess={['password']}
                                className="space-y-6"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-[0_22px_60px_-36px_rgba(15,23,42,0.6)] backdrop-blur-sm">
                                            {/* Email */}
                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor="email"
                                                    className="text-sm font-medium text-slate-800"
                                                >
                                                    Correo electrónico
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    required
                                                    autoFocus
                                                    tabIndex={1}
                                                    autoComplete="email"
                                                    placeholder="tucorreo@ejemplo.com"
                                                    className="h-11 rounded-full border-slate-200 bg-slate-50/70 text-sm placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                                />
                                                <InputError message={errors.email} />
                                            </div>

                                            {/* Password */}
                                            <div className="grid gap-2">
                                                <div className="flex items-center">
                                                    <Label
                                                        htmlFor="password"
                                                        className="text-sm font-medium text-slate-800"
                                                    >
                                                        Contraseña
                                                    </Label>
                                                    {canResetPassword && (
                                                        <TextLink
                                                            href={request()}
                                                            className="ml-auto text-xs font-medium text-sky-600 hover:text-sky-700"
                                                            tabIndex={5}
                                                        >
                                                            ¿Olvidaste tu contraseña?
                                                        </TextLink>
                                                    )}
                                                </div>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    name="password"
                                                    required
                                                    tabIndex={2}
                                                    autoComplete="current-password"
                                                    placeholder="••••••••"
                                                    className="h-11 rounded-full border-slate-200 bg-slate-50/70 text-sm placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                                                />
                                                <InputError message={errors.password} />
                                            </div>

                                            {/* Remember me */}
                                            <div className="flex items-center justify-between gap-3">
                                                <label htmlFor="remember" className="inline-flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                                                    <Checkbox
                                                        id="remember"
                                                        name="remember"
                                                        tabIndex={3}
                                                        aria-label="Recordarme en este dispositivo"
                                                    />
                                                    <span>Recordarme en este dispositivo</span>
                                                </label>
                                            </div>

                                            {/* Botón */}
                                            <Button
                                                type="submit"
                                                className="mt-1 h-11 w-full rounded-full bg-slate-900 text-sm font-semibold tracking-tight text-white shadow-lg shadow-sky-500/20 hover:bg-slate-900/90"
                                                tabIndex={4}
                                                disabled={processing}
                                                data-test="login-button"
                                            >
                                                {processing && (
                                                    <Spinner className="mr-2 h-4 w-4" />
                                                )}
                                                Ingresar
                                            </Button>
                                        </div>

                                        {/* CTA registro */}
                                        {canRegister && (
                                            <div className="text-center text-sm text-slate-500">
                                                ¿Aún no tienes cuenta?{' '}
                                                <TextLink
                                                    href={register()}
                                                    tabIndex={6}
                                                    className="font-semibold text-sky-600 hover:text-sky-700"
                                                >
                                                    Crear cuenta gratis
                                                </TextLink>
                                            </div>
                                        )}

                                        {/* Legal */}
                                        <p className="text-center text-[11px] leading-snug text-slate-400">
                                            Al continuar aceptas los{' '}
                                            <TextLink href="/terminos">
                                                Términos de uso
                                            </TextLink>{' '}
                                            y la{' '}
                                            <TextLink href="/privacidad">
                                                Política de privacidad
                                            </TextLink>{' '}
                                            de Tribio.
                                        </p>
                                    </>
                                )}
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// Layout con header Tribio
Login.layout = (page: ReactNode) => (
    <WebLayout showFooter={false}>{page}</WebLayout>
);

export default Login;
