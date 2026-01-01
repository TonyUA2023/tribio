import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const { account } = usePage<SharedData>().props;

    // Siempre mostrar el nombre del perfil o de la cuenta del usuario autenticado
    const businessName = account?.profile?.name || account?.name || 'Mi Negocio';
    const businessTitle = account?.profile?.title;

    return (
        <>
            <div className="flex aspect-square size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <AppLogoIcon className="size-6 fill-current" />
            </div>
            <div className="ml-2 grid flex-1 text-left leading-tight">
                <span className="truncate text-base font-semibold">
                    {businessName}
                </span>
                {businessTitle && (
                    <span className="truncate text-sm text-muted-foreground">
                        {businessTitle}
                    </span>
                )}
            </div>
        </>
    );
}
