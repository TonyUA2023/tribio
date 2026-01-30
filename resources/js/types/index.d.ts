import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    items?: NavSubItem[];
}

export interface NavSubItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
}

export interface Account {
    id: number;
    name: string;
    slug: string;
    type: 'company' | 'personal';
    logo?: string | null;
    profile?: {
        id: number;
        name: string;
        title: string;
        slug: string;
        notification_email?: string;
    } | null;
}

export interface UserAccount {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    account: Account | null;
    userAccounts: UserAccount[];
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
