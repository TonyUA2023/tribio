import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
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
import { Link } from '@inertiajs/react';
import {
    CalendarDays,
    LayoutGrid,
    Settings,
    Users,
    Star,
    BookOpen,
} from 'lucide-react';
import AppLogo from './app-logo';
import AppearanceToggleDropdown from './appearance-dropdown';

const mainNavItems: NavItem[] = [
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

export function AppSidebar() {
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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <div className="flex items-center justify-between gap-2 px-2 py-2">
                    <AppearanceToggleDropdown />
                    <div className="flex-1">
                        <NavUser />
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
