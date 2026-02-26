import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';
import { resolveMediaUrl } from '@/utils/mediaUrl';
import {
    Tags,
    Plus,
    MoreVertical,
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    ImageIcon,
    Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Marcas', href: '/brands' },
];

interface Brand {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    logo: string | null;
    is_active: boolean;
    sort_order: number;
    products_count: number;
}

interface Props {
    brands: Brand[];
}

export default function BrandsIndex({ brands }: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

    const createForm = useForm({
        name: '',
        description: '',
        is_active: true,
        logo: null as File | null,
    });

    const editForm = useForm({
        name: '',
        description: '',
        is_active: true,
        logo: null as File | null,
    });

    const handleCreateBrand = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/brands', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const openEditModal = (brand: Brand) => {
        setEditingBrand(brand);
        editForm.setData({
            name: brand.name,
            description: brand.description || '',
            is_active: brand.is_active,
            logo: null,
        });
        setIsEditModalOpen(true);
    };

    const handleEditBrand = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBrand) return;

        editForm.post(`/brands/${editingBrand.id}?_method=PUT`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingBrand(null);
                editForm.reset();
            },
        });
    };

    const handleToggleActive = (brand: Brand) => {
        router.patch(`/brands/${brand.id}/toggle-active`);
    };

    const handleDelete = (brand: Brand) => {
        if (brand.products_count > 0) {
            alert(`No puedes eliminar "${brand.name}" porque tiene ${brand.products_count} producto(s) asociado(s).`);
            return;
        }
        if (confirm(`¿Estás seguro de eliminar "${brand.name}"?`)) {
            router.delete(`/brands/${brand.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Marcas" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Marcas</h1>
                        <p className="text-muted-foreground">
                            Gestiona las marcas de tus productos
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Nueva Marca
                    </Button>
                </div>

                {/* Lista de marcas */}
                {brands.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                        <Tags className="h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">No hay marcas</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Comienza creando tu primera marca para tus productos
                        </p>
                        <Button onClick={() => setIsCreateModalOpen(true)} className="mt-4 gap-2">
                            <Plus className="h-4 w-4" />
                            Crear Marca
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {brands.map((brand) => (
                            <div
                                key={brand.id}
                                className={cn(
                                    "group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md",
                                    !brand.is_active && "opacity-60"
                                )}
                            >
                                {/* Logo */}
                                <div className="relative aspect-video bg-muted">
                                    {brand.logo ? (
                                        <img
                                            src={resolveMediaUrl(brand.logo)}
                                            alt={brand.name}
                                            className="h-full w-full object-contain p-4"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <Tags className="h-12 w-12 text-muted-foreground/30" />
                                        </div>
                                    )}

                                    {/* Badge estado */}
                                    {!brand.is_active && (
                                        <Badge variant="secondary" className="absolute left-2 top-2">
                                            Inactiva
                                        </Badge>
                                    )}

                                    {/* Menú de acciones */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openEditModal(brand)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleToggleActive(brand)}>
                                                {brand.is_active ? (
                                                    <>
                                                        <EyeOff className="mr-2 h-4 w-4" />
                                                        Desactivar
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Activar
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(brand)}
                                                className="text-destructive focus:text-destructive"
                                                disabled={brand.products_count > 0}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <h3 className="font-semibold line-clamp-1">{brand.name}</h3>
                                    {brand.description && (
                                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                            {brand.description}
                                        </p>
                                    )}
                                    <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                                        <Package className="h-4 w-4" />
                                        <span>{brand.products_count} producto(s)</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Crear Marca */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nueva Marca</DialogTitle>
                        <DialogDescription>
                            Crea una nueva marca para tus productos
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateBrand} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre *</Label>
                            <Input
                                id="name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                placeholder="Nombre de la marca"
                                required
                            />
                            {createForm.errors.name && (
                                <p className="text-sm text-destructive">{createForm.errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="description"
                                value={createForm.data.description}
                                onChange={(e) => createForm.setData('description', e.target.value)}
                                placeholder="Descripción de la marca"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="logo">Logo</Label>
                            <Input
                                id="logo"
                                type="file"
                                accept="image/*"
                                onChange={(e) => createForm.setData('logo', e.target.files?.[0] || null)}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                id="is_active"
                                type="checkbox"
                                checked={createForm.data.is_active}
                                onChange={(e) => createForm.setData('is_active', e.target.checked)}
                                className="rounded"
                            />
                            <Label htmlFor="is_active">Activa</Label>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={createForm.processing}>
                                {createForm.processing ? 'Guardando...' : 'Crear Marca'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Editar Marca */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar Marca</DialogTitle>
                        <DialogDescription>
                            Modifica los datos de la marca
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditBrand} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nombre *</Label>
                            <Input
                                id="edit-name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                placeholder="Nombre de la marca"
                                required
                            />
                            {editForm.errors.name && (
                                <p className="text-sm text-destructive">{editForm.errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Descripción</Label>
                            <Textarea
                                id="edit-description"
                                value={editForm.data.description}
                                onChange={(e) => editForm.setData('description', e.target.value)}
                                placeholder="Descripción de la marca"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-logo">Logo</Label>
                            <Input
                                id="edit-logo"
                                type="file"
                                accept="image/*"
                                onChange={(e) => editForm.setData('logo', e.target.files?.[0] || null)}
                            />
                            {editingBrand?.logo && (
                                <p className="text-xs text-muted-foreground">
                                    Logo actual: {editingBrand.logo.split('/').pop()}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                id="edit-is_active"
                                type="checkbox"
                                checked={editForm.data.is_active}
                                onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                className="rounded"
                            />
                            <Label htmlFor="edit-is_active">Activa</Label>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                {editForm.processing ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
