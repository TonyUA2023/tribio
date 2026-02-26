import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useInitials } from '@/hooks/use-initials';
import { useIsMobile } from '@/hooks/use-mobile';
import { type SharedData, type UserAccount } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { Building2, Check, ChevronsUpDown, LogOut, Plus, Settings, User, ShoppingBag, Store, ArrowRightLeft } from 'lucide-react';

export function NavBusinessSwitcher() {
    const { auth, account, userAccounts } = usePage<SharedData>().props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();
    const getInitials = useInitials();

    const currentAccount = account;
    const hasMultipleAccounts = userAccounts && userAccounts.length > 1;

    const handleSwitchAccount = (accountId: number) => {
        // Usar Inertia.location para forzar una recarga completa de la página
        router.post('/auth/select-account', { account_id: accountId });
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="group text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent"
                        >
                            {/* Avatar del negocio actual */}
                            <Avatar className="h-8 w-8 rounded-lg">
                                {currentAccount?.logo ? (
                                    <AvatarImage src={currentAccount.logo} alt={currentAccount.name} />
                                ) : null}
                                <AvatarFallback className="rounded-lg bg-gradient-to-br from-cyan-500 to-sky-600 text-white font-semibold">
                                    {currentAccount ? getInitials(currentAccount.name) : 'N'}
                                </AvatarFallback>
                            </Avatar>

                            {/* Info del negocio y usuario */}
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    {auth.user.name}
                                </span>
                                <span className="truncate text-xs text-muted-foreground">
                                    {currentAccount?.name || 'Sin negocio'}
                                </span>
                            </div>

                            <ChevronsUpDown className="ml-auto size-4 opacity-50" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-xl"
                        align="end"
                        side={isMobile ? 'top' : state === 'collapsed' ? 'right' : 'top'}
                        sideOffset={8}
                    >
                        {/* Header con info del usuario */}
                        <div className="px-3 py-3 border-b border-border/50">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 rounded-lg">
                                    {currentAccount?.logo ? (
                                        <AvatarImage src={currentAccount.logo} alt={currentAccount.name} />
                                    ) : null}
                                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-cyan-500 to-sky-600 text-white font-semibold">
                                        {currentAccount ? getInitials(currentAccount.name) : 'N'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate">{auth.user.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{auth.user.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Lista de negocios - Solo si tiene múltiples */}
                        {hasMultipleAccounts && (
                            <>
                                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-3 py-2">
                                    Tus negocios
                                </DropdownMenuLabel>

                                <div className="max-h-48 overflow-y-auto px-1">
                                    {userAccounts.map((acc) => {
                                        const isActive = currentAccount?.id === acc.id;

                                        return (
                                            <DropdownMenuItem
                                                key={acc.id}
                                                onClick={() => !isActive && handleSwitchAccount(acc.id)}
                                                className={`flex items-center gap-3 px-2 py-2.5 rounded-lg cursor-pointer ${
                                                    isActive
                                                        ? 'bg-accent'
                                                        : 'hover:bg-accent/50'
                                                }`}
                                            >
                                                <Avatar className="h-8 w-8 rounded-lg shrink-0">
                                                    {acc.logo ? (
                                                        <AvatarImage src={acc.logo} alt={acc.name} />
                                                    ) : null}
                                                    <AvatarFallback className="rounded-lg bg-muted text-muted-foreground text-xs font-medium">
                                                        {getInitials(acc.name)}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{acc.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        tribio.info/{acc.slug}
                                                    </p>
                                                </div>

                                                {isActive && (
                                                    <Check className="h-4 w-4 text-primary shrink-0" />
                                                )}
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </div>

                                <DropdownMenuSeparator />
                            </>
                        )}

                        {/* Agregar nuevo negocio */}
                        <DropdownMenuItem asChild>
                            <Link
                                href="/registro"
                                className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
                            >
                                <div className="h-8 w-8 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                                    <Plus className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <span className="text-sm">Agregar nuevo negocio</span>
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Ver perfil público */}
                        {currentAccount && (
                            <DropdownMenuItem asChild>
                                <Link
                                    href={`/${currentAccount.slug}`}
                                    target="_blank"
                                    className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                                >
                                    <Building2 className="h-4 w-4" />
                                    <span className="text-sm">Ver perfil público</span>
                                </Link>
                            </DropdownMenuItem>
                        )}

                        {/* Ver tienda - Si tiene tienda configurada */}
                        {currentAccount && (
                            <DropdownMenuItem asChild>
                                <Link
                                    href={`/${currentAccount.slug}/tienda`}
                                    target="_blank"
                                    className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                                >
                                    <Store className="h-4 w-4" />
                                    <span className="text-sm">Ver tienda</span>
                                </Link>
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        {/* Mis compras - Acceso al panel de cliente/comprador */}
                        <DropdownMenuItem asChild>
                            <Link
                                href="/mis-compras"
                                className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                            >
                                <ShoppingBag className="h-4 w-4" />
                                <span className="text-sm">Mis compras</span>
                                <span className="ml-auto text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                    Nuevo
                                </span>
                            </Link>
                        </DropdownMenuItem>

                        {/* Configuración de cuenta */}
                        <DropdownMenuItem asChild>
                            <Link
                                href="/settings/profile"
                                className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                            >
                                <User className="h-4 w-4" />
                                <span className="text-sm">Mi cuenta</span>
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Cerrar sesión */}
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2 cursor-pointer text-destructive focus:text-destructive"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="text-sm">Cerrar sesión</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
