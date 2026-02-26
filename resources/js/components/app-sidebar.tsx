import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavBusinessSwitcher } from '@/components/nav-business-switcher';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { appointments, clients, dashboard } from '@/routes';
import settings from '@/routes/settings';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    LayoutGrid,
    Settings,
    Users,
    Star,
    BookOpen,
    Package,
    ClipboardList,
    FolderTree,
    Tags,
    Palette,
} from 'lucide-react';
import AppLogo from './app-logo';
import AppearanceToggleDropdown from './appearance-dropdown';

// Items compartidos para todos los tipos de negocio
const sharedNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Configuración',
        href: settings.business(),
        icon: Settings,
        items: [
            {
                title: 'Negocio',
                href: settings.business(),
            },
            {
                title: 'Página',
                href: settings.page(),
            },
        ],
    },
    {
        title: 'Historias',
        href: '/stories',
        icon: BookOpen,
    },
    {
        title: 'Plantillas',
        href: '/settings/templates',
        icon: Palette,
    },
];

// Items específicos para CITAS (appointments)
const appointmentsNavItems: NavItem[] = [
    {
        title: 'Citas',
        href: appointments(),
        icon: CalendarDays,
    },
    {
        title: 'Clientes',
        href: clients(),
        icon: Users,
    },
    {
        title: 'Reseñas',
        href: '/reviews/manage',
        icon: Star,
    },
];

// Items específicos para TIENDA (store)
const storeNavItems: NavItem[] = [
    {
        title: 'Productos',
        href: '/products',
        icon: Package,
    },
    {
        title: 'Categorías',
        href: '/categories',
        icon: FolderTree,
    },
    {
        title: 'Marcas',
        href: '/brands',
        icon: Tags,
    },
    {
        title: 'Pedidos',
        href: '/orders',
        icon: ClipboardList,
    },
    {
        title: 'Clientes',
        href: clients(),
        icon: Users,
    },
    {
        title: 'Reseñas',
        href: '/reviews/manage',
        icon: Star,
    },
];

// Función para obtener los items de navegación según el tipo de negocio
function getNavItemsByBusinessType(businessTypeSlug: string | null | undefined): NavItem[] {
    const baseItems = [...sharedNavItems];

    switch (businessTypeSlug) {
        case 'store':
            return [...baseItems, ...storeNavItems];
        case 'appointments':
            return [...baseItems, ...appointmentsNavItems];
        case 'restaurant':
            // Por ahora, restaurantes usan los mismos items que tienda
            return [...baseItems, ...storeNavItems];
        default:
            // Si no hay tipo definido, mostrar items de citas por compatibilidad
            return [...baseItems, ...appointmentsNavItems];
    }
}

interface PageProps {
    account?: {
        businessType?: {
            id: number;
            slug: string;
            name: string;
        } | null;
    } | null;
    [key: string]: any;
}

export function AppSidebar() {
    const { account } = usePage<PageProps>().props;
    const businessTypeSlug = account?.businessType?.slug;
    const navItems = getNavItemsByBusinessType(businessTypeSlug);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="h-14 px-3">
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <div className="flex items-center gap-2 px-2 py-2">
                    <AppearanceToggleDropdown />
                </div>
                <NavBusinessSwitcher />
            </SidebarFooter>
        </Sidebar>
    );
}
