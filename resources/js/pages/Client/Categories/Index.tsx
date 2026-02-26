import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';
import { resolveMediaUrl } from '@/utils/mediaUrl';
import {
    FolderTree,
    Plus,
    MoreVertical,
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    Package,
    ChevronRight,
    FolderPlus,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Categorías', href: '/categories' },
];

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    is_active: boolean;
    sort_order: number;
    depth: number;
    parent_id: number | null;
    products_count: number;
    children?: Category[];
}

interface FlatCategory {
    id: number;
    name: string;
    full_path: string;
    depth: number;
    parent_id: number | null;
}

interface Props {
    categories: Category[];
    allCategories: FlatCategory[];
}

export default function CategoriesIndex({ categories, allCategories }: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

    const createForm = useForm({
        name: '',
        description: '',
        parent_id: '',
        is_active: true,
        image: null as File | null,
    });

    const editForm = useForm({
        name: '',
        description: '',
        parent_id: '',
        is_active: true,
        image: null as File | null,
    });

    const toggleExpanded = (id: number) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedCategories(newExpanded);
    };

    const handleCreateCategory = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = {
            ...createForm.data,
            parent_id: createForm.data.parent_id || null,
        };
        createForm.post('/categories', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
            },
        });
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        editForm.setData({
            name: category.name,
            description: category.description || '',
            parent_id: category.parent_id?.toString() || '',
            is_active: category.is_active,
            image: null,
        });
        setIsEditModalOpen(true);
    };

    const handleEditCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;

        editForm.post(`/categories/${editingCategory.id}?_method=PUT`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingCategory(null);
                editForm.reset();
            },
        });
    };

    const handleToggleActive = (category: Category) => {
        router.patch(`/categories/${category.id}/toggle-active`);
    };

    const handleDelete = (category: Category) => {
        if (category.products_count > 0) {
            alert(`No puedes eliminar "${category.name}" porque tiene ${category.products_count} producto(s) asociado(s).`);
            return;
        }
        if (category.children && category.children.length > 0) {
            alert(`No puedes eliminar "${category.name}" porque tiene subcategorías. Elimina primero las subcategorías.`);
            return;
        }
        if (confirm(`¿Estás seguro de eliminar "${category.name}"?`)) {
            router.delete(`/categories/${category.id}`);
        }
    };

    const openCreateSubcategory = (parentId: number) => {
        createForm.setData({
            name: '',
            description: '',
            parent_id: parentId.toString(),
            is_active: true,
            image: null,
        });
        setIsCreateModalOpen(true);
    };

    // Filtrar categorías raíz para el select (excluir la categoría que se está editando y sus descendientes)
    const getAvailableParents = (excludeId?: number) => {
        return allCategories.filter(cat => {
            // Solo mostrar categorías raíz (depth 0) como posibles padres
            if (cat.depth > 0) return false;
            // Excluir la categoría que se está editando
            if (excludeId && cat.id === excludeId) return false;
            return true;
        });
    };

    const renderCategoryCard = (category: Category, isChild = false) => (
        <div
            key={category.id}
            className={cn(
                "group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md",
                !category.is_active && "opacity-60",
                isChild && "ml-8 border-l-4 border-l-primary/30"
            )}
        >
            {/* Imagen */}
            <div className="relative aspect-video bg-muted">
                {category.image ? (
                    <img
                        src={resolveMediaUrl(category.image)}
                        alt={category.name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <FolderTree className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                )}

                {/* Badges */}
                <div className="absolute left-2 top-2 flex flex-col gap-1">
                    {!category.is_active && (
                        <Badge variant="secondary">Inactiva</Badge>
                    )}
                    {isChild && (
                        <Badge variant="outline" className="bg-background/80">Subcategoría</Badge>
                    )}
                </div>

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
                        <DropdownMenuItem onClick={() => openEditModal(category)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                        </DropdownMenuItem>
                        {!isChild && (
                            <DropdownMenuItem onClick={() => openCreateSubcategory(category.id)}>
                                <FolderPlus className="mr-2 h-4 w-4" />
                                Agregar Subcategoría
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleToggleActive(category)}>
                            {category.is_active ? (
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
                            onClick={() => handleDelete(category)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Info */}
            <div className="p-4">
                <div className="flex items-center gap-2">
                    {category.children && category.children.length > 0 && (
                        <button
                            onClick={() => toggleExpanded(category.id)}
                            className="p-1 hover:bg-muted rounded"
                        >
                            <ChevronRight
                                className={cn(
                                    "h-4 w-4 transition-transform",
                                    expandedCategories.has(category.id) && "rotate-90"
                                )}
                            />
                        </button>
                    )}
                    <h3 className="font-semibold line-clamp-1">{category.name}</h3>
                </div>
                {category.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {category.description}
                    </p>
                )}
                <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span>{category.products_count} producto(s)</span>
                    </div>
                    {category.children && category.children.length > 0 && (
                        <span className="text-xs">
                            {category.children.length} subcategoría(s)
                        </span>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categorías" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Categorías</h1>
                        <p className="text-muted-foreground">
                            Organiza tus productos en categorías y subcategorías
                        </p>
                    </div>
                    <Button onClick={() => {
                        createForm.reset();
                        setIsCreateModalOpen(true);
                    }} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Nueva Categoría
                    </Button>
                </div>

                {/* Lista de categorías */}
                {categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                        <FolderTree className="h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">No hay categorías</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Comienza creando tu primera categoría para organizar tus productos
                        </p>
                        <Button onClick={() => setIsCreateModalOpen(true)} className="mt-4 gap-2">
                            <Plus className="h-4 w-4" />
                            Crear Categoría
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {categories.map((category) => (
                            <div key={category.id}>
                                {/* Categoría principal */}
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {renderCategoryCard(category)}
                                </div>

                                {/* Subcategorías */}
                                {category.children && category.children.length > 0 && expandedCategories.has(category.id) && (
                                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {category.children.map((child) => renderCategoryCard(child, true))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Crear Categoría */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {createForm.data.parent_id ? 'Nueva Subcategoría' : 'Nueva Categoría'}
                        </DialogTitle>
                        <DialogDescription>
                            {createForm.data.parent_id
                                ? 'Crea una subcategoría dentro de la categoría seleccionada'
                                : 'Crea una nueva categoría para organizar tus productos'
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateCategory} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre *</Label>
                            <Input
                                id="name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                placeholder="Nombre de la categoría"
                                required
                            />
                            {createForm.errors.name && (
                                <p className="text-sm text-destructive">{createForm.errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="parent_id">Categoría Padre (opcional)</Label>
                            <Select
                                value={createForm.data.parent_id || '_none'}
                                onValueChange={(value) => createForm.setData('parent_id', value === '_none' ? '' : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sin categoría padre (raíz)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="_none">Sin categoría padre (raíz)</SelectItem>
                                    {getAvailableParents().map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {createForm.errors.parent_id && (
                                <p className="text-sm text-destructive">{createForm.errors.parent_id}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="description"
                                value={createForm.data.description}
                                onChange={(e) => createForm.setData('description', e.target.value)}
                                placeholder="Descripción de la categoría"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">Imagen</Label>
                            <Input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={(e) => createForm.setData('image', e.target.files?.[0] || null)}
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
                                {createForm.processing ? 'Guardando...' : 'Crear'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Editar Categoría */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar Categoría</DialogTitle>
                        <DialogDescription>
                            Modifica los datos de la categoría
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditCategory} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nombre *</Label>
                            <Input
                                id="edit-name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                placeholder="Nombre de la categoría"
                                required
                            />
                            {editForm.errors.name && (
                                <p className="text-sm text-destructive">{editForm.errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-parent_id">Categoría Padre</Label>
                            <Select
                                value={editForm.data.parent_id || '_none'}
                                onValueChange={(value) => editForm.setData('parent_id', value === '_none' ? '' : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sin categoría padre (raíz)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="_none">Sin categoría padre (raíz)</SelectItem>
                                    {getAvailableParents(editingCategory?.id).map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {editForm.errors.parent_id && (
                                <p className="text-sm text-destructive">{editForm.errors.parent_id}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Descripción</Label>
                            <Textarea
                                id="edit-description"
                                value={editForm.data.description}
                                onChange={(e) => editForm.setData('description', e.target.value)}
                                placeholder="Descripción de la categoría"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-image">Imagen</Label>
                            <Input
                                id="edit-image"
                                type="file"
                                accept="image/*"
                                onChange={(e) => editForm.setData('image', e.target.files?.[0] || null)}
                            />
                            {editingCategory?.image && (
                                <p className="text-xs text-muted-foreground">
                                    Imagen actual: {editingCategory.image.split('/').pop()}
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
