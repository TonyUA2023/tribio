import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { resolveMediaUrl } from '@/utils/mediaUrl';
import MlInsightCard, { type MlPrediction } from '@/components/MlInsightCard';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';
import {
    Package,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    Star,
    StarOff,
    ImageIcon,
    AlertTriangle,
    FolderTree,
    Tags,
    X,
    Palette,
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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Productos', href: '/products' },
];

interface Specification {
    label: string;
    value: string;
}

interface VariantAttribute {
    id: string;
    name: string;
    values: VariantAttributeValue[];
}

interface VariantAttributeValue {
    id: string;
    value: string;
    colorHex?: string; // Solo para tipo color
}

interface Variant {
    id: string;
    attributes: Record<string, string>;
    price: string;
    stock: string;
    sku: string;
}

// Paleta de colores predefinida para selector
const COLOR_PALETTE = [
    { name: 'Negro', hex: '#000000' },
    { name: 'Blanco', hex: '#FFFFFF' },
    { name: 'Gris', hex: '#6B7280' },
    { name: 'Gris Claro', hex: '#D1D5DB' },
    { name: 'Rojo', hex: '#EF4444' },
    { name: 'Rojo Oscuro', hex: '#991B1B' },
    { name: 'Naranja', hex: '#F97316' },
    { name: 'Amarillo', hex: '#EAB308' },
    { name: 'Verde', hex: '#22C55E' },
    { name: 'Verde Oscuro', hex: '#15803D' },
    { name: 'Azul', hex: '#3B82F6' },
    { name: 'Azul Oscuro', hex: '#1E40AF' },
    { name: 'Azul Marino', hex: '#1E3A5F' },
    { name: 'Celeste', hex: '#38BDF8' },
    { name: 'Morado', hex: '#A855F7' },
    { name: 'Rosa', hex: '#EC4899' },
    { name: 'Fucsia', hex: '#D946EF' },
    { name: 'Marrón', hex: '#92400E' },
    { name: 'Beige', hex: '#D4C4A8' },
    { name: 'Crema', hex: '#FEF3C7' },
    { name: 'Dorado', hex: '#D4AF37' },
    { name: 'Plateado', hex: '#C0C0C0' },
    { name: 'Turquesa', hex: '#14B8A6' },
    { name: 'Coral', hex: '#FB7185' },
];

// Opciones recomendadas para diferentes tipos de atributos
const RECOMMENDED_OPTIONS: Record<string, string[]> = {
    'Talla': ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    'Talla Calzado': ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
    'Capacidad': ['8GB', '16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB'],
    'Material': ['Algodón', 'Poliéster', 'Cuero', 'Plástico', 'Metal', 'Madera', 'Vidrio'],
    'Peso': ['250g', '500g', '1kg', '2kg', '5kg'],
};

interface Product {
    id: number;
    name: string;
    description: string | null;
    short_description: string | null;
    price: number;
    compare_price: number | null;
    image: string | null;
    product_category_id: number | null;
    brand_id: number | null;
    category: string | null;
    brand: string | null;
    gender: string | null;
    condition: string | null;
    origin_country: string | null;
    sku: string | null;
    available: boolean;
    featured: boolean;
    stock: number | null;
    weight: number | null;
    sort_order: number;
    specifications: Specification[] | null;
    has_variants: boolean;
    variant_attributes: string[] | null;
    variants: Variant[] | null;
    display_settings: Record<string, boolean> | null;
    product_category?: { id: number; name: string; full_path?: string };
    brand_relation?: { id: number; name: string };
    ml_sales_prediction?: MlPrediction | null;
}

interface Category {
    id: number;
    name: string;
    full_path: string;
    depth: number;
    parent_id: number | null;
}

interface Brand {
    id: number;
    name: string;
}

interface Props {
    products: Product[];
    categories: Category[];
    allCategories: Category[];
    brands: Brand[];
    genderOptions: Record<string, string>;
    conditionOptions: Record<string, string>;
    variantAttributes: Record<string, { label: string; type: string; options: string[] }>;
    filters: {
        category_id?: string;
        brand_id?: string;
        gender?: string;
        available?: string;
        search?: string;
    };
}

export default function ProductsIndex({
    products,
    allCategories,
    brands,
    genderOptions,
    conditionOptions,
    filters
}: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category_id || 'all');

    // Form state para especificaciones
    const [createSpecs, setCreateSpecs] = useState<Specification[]>([]);
    const [editSpecs, setEditSpecs] = useState<Specification[]>([]);

    // Form state para variantes (nuevo sistema manual)
    const [createVariantAttrs, setCreateVariantAttrs] = useState<VariantAttribute[]>([]);
    const [editVariantAttrs, setEditVariantAttrs] = useState<VariantAttribute[]>([]);
    const [createVariants, setCreateVariants] = useState<Variant[]>([]);
    const [editVariants, setEditVariants] = useState<Variant[]>([]);


    // Tab activo para cada modal
    const [createActiveTab, setCreateActiveTab] = useState('basic');
    const [editActiveTab, setEditActiveTab] = useState('basic');

    const createForm = useForm({
        name: '',
        description: '',
        short_description: '',
        price: '',
        compare_price: '',
        product_category_id: '',
        brand_id: '',
        category: '',
        brand: '',
        gender: '',
        condition: 'new',
        origin_country: '',
        sku: '',
        stock: '',
        weight: '',
        available: true,
        featured: false,
        has_variants: false,
        image: null as File | null,
        specifications: [] as Specification[],
        variant_attributes: [] as string[],
        variants: [] as Variant[],
        display_settings: {
            show_gender: true,
            show_brand: true,
            show_sku: true,
            show_condition: true,
        },
    });

    const editForm = useForm({
        name: '',
        description: '',
        short_description: '',
        price: '',
        compare_price: '',
        product_category_id: '',
        brand_id: '',
        category: '',
        brand: '',
        gender: '',
        condition: '',
        origin_country: '',
        sku: '',
        stock: '',
        weight: '',
        available: true,
        featured: false,
        has_variants: false,
        image: null as File | null,
        specifications: [] as Specification[],
        variant_attributes: [] as string[],
        variants: [] as Variant[],
        display_settings: {} as Record<string, boolean>,
    });

    const handleSearch = () => {
        router.get('/products', {
            search: searchTerm,
            category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
        }, { preserveState: true });
    };

    const handleCategoryFilter = (categoryId: string) => {
        setSelectedCategory(categoryId);
        router.get('/products', {
            search: searchTerm || undefined,
            category_id: categoryId !== 'all' ? categoryId : undefined,
        }, { preserveState: true });
    };

    // Especificaciones helpers para CREATE
    const addCreateSpecification = () => {
        setCreateSpecs([...createSpecs, { label: '', value: '' }]);
    };

    const updateCreateSpecification = (index: number, field: 'label' | 'value', value: string) => {
        const updated = [...createSpecs];
        updated[index][field] = value;
        setCreateSpecs(updated);
    };

    const removeCreateSpecification = (index: number) => {
        setCreateSpecs(createSpecs.filter((_, i) => i !== index));
    };

    // Especificaciones helpers para EDIT
    const addEditSpecification = () => {
        setEditSpecs([...editSpecs, { label: '', value: '' }]);
    };

    const updateEditSpecification = (index: number, field: 'label' | 'value', value: string) => {
        const updated = [...editSpecs];
        updated[index][field] = value;
        setEditSpecs(updated);
    };

    const removeEditSpecification = (index: number) => {
        setEditSpecs(editSpecs.filter((_, i) => i !== index));
    };

    // ========== HELPERS PARA ATRIBUTOS DE VARIANTES (CREATE) ==========
    const addCreateVariantAttribute = () => {
        setCreateVariantAttrs([...createVariantAttrs, {
            id: Date.now().toString(),
            name: '',
            values: []
        }]);
    };

    const updateCreateVariantAttributeName = (attrId: string, name: string) => {
        setCreateVariantAttrs(createVariantAttrs.map(attr =>
            attr.id === attrId ? { ...attr, name } : attr
        ));
    };

    const removeCreateVariantAttribute = (attrId: string) => {
        setCreateVariantAttrs(createVariantAttrs.filter(attr => attr.id !== attrId));
        // También eliminar las variantes que usan este atributo
        setCreateVariants([]);
    };

    const addCreateAttributeValue = (attrId: string, value: string, colorHex?: string) => {
        if (!value.trim()) return;
        setCreateVariantAttrs(createVariantAttrs.map(attr =>
            attr.id === attrId
                ? {
                    ...attr,
                    values: [...attr.values, { id: Date.now().toString(), value: value.trim(), colorHex }]
                }
                : attr
        ));
    };

    const removeCreateAttributeValue = (attrId: string, valueId: string) => {
        setCreateVariantAttrs(createVariantAttrs.map(attr =>
            attr.id === attrId
                ? { ...attr, values: attr.values.filter(v => v.id !== valueId) }
                : attr
        ));
    };

    // Generar combinaciones de variantes
    const generateCreateVariants = () => {
        const attrsWithValues = createVariantAttrs.filter(attr => attr.name && attr.values.length > 0);
        if (attrsWithValues.length === 0) {
            setCreateVariants([]);
            return;
        }

        // Generar todas las combinaciones
        const combinations: Record<string, string>[] = [{}];
        for (const attr of attrsWithValues) {
            const newCombinations: Record<string, string>[] = [];
            for (const combo of combinations) {
                for (const val of attr.values) {
                    newCombinations.push({ ...combo, [attr.name]: val.value });
                }
            }
            combinations.length = 0;
            combinations.push(...newCombinations);
        }

        // Crear variantes con las combinaciones
        const newVariants: Variant[] = combinations.map((attrs, idx) => ({
            id: Date.now().toString() + idx,
            attributes: attrs,
            price: '',
            stock: '',
            sku: '',
        }));

        setCreateVariants(newVariants);
    };

    const updateCreateVariant = (index: number, field: string, value: string) => {
        const updated = [...createVariants];
        if (field.startsWith('attr_')) {
            const attrName = field.replace('attr_', '');
            updated[index].attributes[attrName] = value;
        } else {
            (updated[index] as any)[field] = value;
        }
        setCreateVariants(updated);
    };

    const removeCreateVariant = (index: number) => {
        setCreateVariants(createVariants.filter((_, i) => i !== index));
    };

    // ========== HELPERS PARA ATRIBUTOS DE VARIANTES (EDIT) ==========
    const addEditVariantAttribute = () => {
        setEditVariantAttrs([...editVariantAttrs, {
            id: Date.now().toString(),
            name: '',
            values: []
        }]);
    };

    const updateEditVariantAttributeName = (attrId: string, name: string) => {
        setEditVariantAttrs(editVariantAttrs.map(attr =>
            attr.id === attrId ? { ...attr, name } : attr
        ));
    };

    const removeEditVariantAttribute = (attrId: string) => {
        setEditVariantAttrs(editVariantAttrs.filter(attr => attr.id !== attrId));
        setEditVariants([]);
    };

    const addEditAttributeValue = (attrId: string, value: string, colorHex?: string) => {
        if (!value.trim()) return;
        setEditVariantAttrs(editVariantAttrs.map(attr =>
            attr.id === attrId
                ? {
                    ...attr,
                    values: [...attr.values, { id: Date.now().toString(), value: value.trim(), colorHex }]
                }
                : attr
        ));
    };

    const removeEditAttributeValue = (attrId: string, valueId: string) => {
        setEditVariantAttrs(editVariantAttrs.map(attr =>
            attr.id === attrId
                ? { ...attr, values: attr.values.filter(v => v.id !== valueId) }
                : attr
        ));
    };

    const generateEditVariants = () => {
        const attrsWithValues = editVariantAttrs.filter(attr => attr.name && attr.values.length > 0);
        if (attrsWithValues.length === 0) {
            setEditVariants([]);
            return;
        }

        const combinations: Record<string, string>[] = [{}];
        for (const attr of attrsWithValues) {
            const newCombinations: Record<string, string>[] = [];
            for (const combo of combinations) {
                for (const val of attr.values) {
                    newCombinations.push({ ...combo, [attr.name]: val.value });
                }
            }
            combinations.length = 0;
            combinations.push(...newCombinations);
        }

        const newVariants: Variant[] = combinations.map((attrs, idx) => ({
            id: Date.now().toString() + idx,
            attributes: attrs,
            price: '',
            stock: '',
            sku: '',
        }));

        setEditVariants(newVariants);
    };

    const updateEditVariant = (index: number, field: string, value: string) => {
        const updated = [...editVariants];
        if (field.startsWith('attr_')) {
            const attrName = field.replace('attr_', '');
            updated[index].attributes[attrName] = value;
        } else {
            (updated[index] as any)[field] = value;
        }
        setEditVariants(updated);
    };

    const removeEditVariant = (index: number) => {
        setEditVariants(editVariants.filter((_, i) => i !== index));
    };

    // Detectar si un atributo es de tipo color
    const isColorAttribute = (name: string) => {
        const lowerName = name.toLowerCase();
        return lowerName.includes('color') || lowerName.includes('colour');
    };

    // Obtener recomendaciones para un atributo
    const getRecommendationsForAttribute = (name: string): string[] => {
        for (const [key, values] of Object.entries(RECOMMENDED_OPTIONS)) {
            if (name.toLowerCase().includes(key.toLowerCase())) {
                return values;
            }
        }
        return [];
    };

    const handleCreateProduct = (e: React.FormEvent) => {
        e.preventDefault();

        // Convertir atributos de variantes al formato para guardar
        const variantAttributeNames = createVariantAttrs
            .filter(attr => attr.name && attr.values.length > 0)
            .map(attr => attr.name);

        createForm.setData({
            ...createForm.data,
            specifications: createSpecs.filter(s => s.label && s.value) as any,
            variant_attributes: variantAttributeNames as any,
            variants: createVariants as any,
        });

        setTimeout(() => {
            createForm.post('/products', {
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    createForm.reset();
                    setCreateSpecs([]);
                    setCreateVariants([]);
                    setCreateVariantAttrs([]);
                    setCreateActiveTab('basic');
                },
            });
        }, 0);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setEditSpecs(product.specifications || []);
        setEditVariants(product.variants || []);

        // Reconstruir atributos de variantes desde los datos guardados
        const reconstructedAttrs: VariantAttribute[] = (product.variant_attributes || []).map((attrName, idx) => {
            // Extraer valores únicos de las variantes existentes
            const uniqueValues = new Set<string>();
            (product.variants || []).forEach(v => {
                if (v.attributes[attrName]) {
                    uniqueValues.add(v.attributes[attrName]);
                }
            });
            return {
                id: `attr-${idx}-${Date.now()}`,
                name: attrName,
                values: Array.from(uniqueValues).map((val, vIdx) => ({
                    id: `val-${idx}-${vIdx}-${Date.now()}`,
                    value: val,
                }))
            };
        });
        setEditVariantAttrs(reconstructedAttrs);

        editForm.setData({
            name: product.name,
            description: product.description || '',
            short_description: product.short_description || '',
            price: product.price.toString(),
            compare_price: product.compare_price?.toString() || '',
            product_category_id: product.product_category_id?.toString() || '',
            brand_id: product.brand_id?.toString() || '',
            category: product.category || '',
            brand: product.brand || '',
            gender: product.gender || '',
            condition: product.condition || 'new',
            origin_country: product.origin_country || '',
            sku: product.sku || '',
            stock: product.stock?.toString() || '',
            weight: product.weight?.toString() || '',
            available: product.available,
            featured: product.featured,
            has_variants: product.has_variants,
            image: null,
            specifications: product.specifications || [],
            variant_attributes: product.variant_attributes || [],
            variants: product.variants || [],
            display_settings: product.display_settings || {},
        });
        setIsEditModalOpen(true);
    };

    const handleEditProduct = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        const variantAttributeNames = editVariantAttrs
            .filter(attr => attr.name && attr.values.length > 0)
            .map(attr => attr.name);

        editForm.setData({
            ...editForm.data,
            specifications: editSpecs.filter(s => s.label && s.value) as any,
            variant_attributes: variantAttributeNames as any,
            variants: editVariants as any,
        });

        setTimeout(() => {
            editForm.post(`/products/${editingProduct.id}?_method=PUT`, {
                onSuccess: () => {
                    setIsEditModalOpen(false);
                    setEditingProduct(null);
                    editForm.reset();
                    setEditSpecs([]);
                    setEditVariants([]);
                    setEditVariantAttrs([]);
                    setEditActiveTab('basic');
                },
            });
        }, 0);
    };

    const handleToggleAvailability = (product: Product) => {
        router.patch(`/products/${product.id}/toggle-availability`);
    };

    const handleToggleFeatured = (product: Product) => {
        router.patch(`/products/${product.id}/toggle-featured`);
    };

    const handleDelete = (product: Product) => {
        if (confirm(`¿Estás seguro de eliminar "${product.name}"?`)) {
            router.delete(`/products/${product.id}`);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(price);
    };

    const lowStockProducts = products.filter(p => p.stock !== null && p.stock <= 5 && p.stock > 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Productos" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
                        <p className="text-muted-foreground">
                            Gestiona el catálogo de productos de tu tienda
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => router.visit('/categories')} className="gap-2">
                            <FolderTree className="h-4 w-4" />
                            Categorías
                        </Button>
                        <Button variant="outline" onClick={() => router.visit('/brands')} className="gap-2">
                            <Tags className="h-4 w-4" />
                            Marcas
                        </Button>
                        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Nuevo Producto
                        </Button>
                    </div>
                </div>

                {/* Alerta de bajo stock */}
                {lowStockProducts.length > 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/50">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                            <div>
                                <p className="font-medium text-amber-800 dark:text-amber-200">
                                    {lowStockProducts.length} producto(s) con bajo stock
                                </p>
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                    {lowStockProducts.map(p => p.name).join(', ')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filtros */}
                <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="pl-10"
                        />
                    </div>
                    <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
                        <SelectTrigger className="w-full sm:w-48">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Categoría" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las categorías</SelectItem>
                            {allCategories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                    {cat.depth > 0 ? `└ ${cat.name}` : cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Lista de productos */}
                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                        <Package className="h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">No hay productos</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Comienza agregando tu primer producto al catálogo
                        </p>
                        <Button onClick={() => setIsCreateModalOpen(true)} className="mt-4 gap-2">
                            <Plus className="h-4 w-4" />
                            Agregar Producto
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className={cn(
                                    "group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md",
                                    !product.available && "opacity-60"
                                )}
                            >
                                {/* Imagen */}
                                <div className="relative aspect-square bg-muted">
                                    {product.image ? (
                                        <img
                                            src={resolveMediaUrl(product.image)}
                                            alt={product.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                                        </div>
                                    )}

                                    {/* Badges */}
                                    <div className="absolute left-2 top-2 flex flex-col gap-1">
                                        {product.featured && (
                                            <Badge className="bg-amber-500 text-white">
                                                <Star className="mr-1 h-3 w-3" />
                                                Destacado
                                            </Badge>
                                        )}
                                        {!product.available && (
                                            <Badge variant="secondary">No disponible</Badge>
                                        )}
                                        {product.stock !== null && product.stock <= 5 && product.stock > 0 && (
                                            <Badge variant="destructive">
                                                Stock: {product.stock}
                                            </Badge>
                                        )}
                                        {product.stock === 0 && (
                                            <Badge variant="destructive">Agotado</Badge>
                                        )}
                                        {product.gender && (
                                            <Badge variant="outline" className="bg-background/80">
                                                {genderOptions[product.gender]}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Descuento */}
                                    {product.compare_price && product.compare_price > product.price && (
                                        <Badge className="absolute right-2 top-2 bg-red-500 text-white">
                                            -{Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%
                                        </Badge>
                                    )}

                                    {/* Menú de acciones */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="absolute right-2 bottom-2 opacity-0 transition-opacity group-hover:opacity-100"
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openEditModal(product)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleToggleAvailability(product)}>
                                                {product.available ? (
                                                    <>
                                                        <EyeOff className="mr-2 h-4 w-4" />
                                                        Ocultar
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Mostrar
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleToggleFeatured(product)}>
                                                {product.featured ? (
                                                    <>
                                                        <StarOff className="mr-2 h-4 w-4" />
                                                        Quitar destacado
                                                    </>
                                                ) : (
                                                    <>
                                                        <Star className="mr-2 h-4 w-4" />
                                                        Destacar
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(product)}
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
                                    {product.product_category && (
                                        <p className="text-xs text-muted-foreground mb-1">
                                            {product.product_category.name}
                                        </p>
                                    )}
                                    <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                                    {product.short_description && (
                                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                            {product.short_description}
                                        </p>
                                    )}
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="text-lg font-bold text-emerald-600">
                                            {formatPrice(product.price)}
                                        </span>
                                        {product.compare_price && product.compare_price > product.price && (
                                            <span className="text-sm text-muted-foreground line-through">
                                                {formatPrice(product.compare_price)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                        {product.brand_relation && (
                                            <span>{product.brand_relation.name}</span>
                                        )}
                                        {product.sku && (
                                            <span>SKU: {product.sku}</span>
                                        )}
                                    </div>

                                    {/* Predicción ML M1 */}
                                    {product.ml_sales_prediction && (
                                        <MlInsightCard
                                            title="Predicción de Ventas"
                                            prediction={product.ml_sales_prediction}
                                            className="mt-3"
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Crear Producto */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Nuevo Producto</DialogTitle>
                        <DialogDescription>
                            Agrega un nuevo producto a tu catálogo
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateProduct}>
                        <Tabs value={createActiveTab} onValueChange={setCreateActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="basic">Básico</TabsTrigger>
                                <TabsTrigger value="details">Detalles</TabsTrigger>
                                <TabsTrigger value="specs">Especificaciones</TabsTrigger>
                                <TabsTrigger value="variants">Variantes</TabsTrigger>
                            </TabsList>

                            <TabsContent value="basic" className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre *</Label>
                                    <Input
                                        id="name"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        placeholder="Nombre del producto"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="short_description">Descripción corta</Label>
                                    <Input
                                        id="short_description"
                                        value={createForm.data.short_description}
                                        onChange={(e) => createForm.setData('short_description', e.target.value)}
                                        placeholder="Breve descripción para listados"
                                        maxLength={500}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Descripción completa</Label>
                                    <Textarea
                                        id="description"
                                        value={createForm.data.description}
                                        onChange={(e) => createForm.setData('description', e.target.value)}
                                        placeholder="Descripción detallada del producto"
                                        rows={4}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Precio *</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            value={createForm.data.price}
                                            onChange={(e) => createForm.setData('price', e.target.value)}
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="compare_price">Precio anterior</Label>
                                        <Input
                                            id="compare_price"
                                            type="number"
                                            step="0.01"
                                            value={createForm.data.compare_price}
                                            onChange={(e) => createForm.setData('compare_price', e.target.value)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="image">Imagen principal</Label>
                                    <Input
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => createForm.setData('image', e.target.files?.[0] || null)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <input
                                            id="available"
                                            type="checkbox"
                                            checked={createForm.data.available}
                                            onChange={(e) => createForm.setData('available', e.target.checked)}
                                            className="rounded"
                                        />
                                        <Label htmlFor="available">Disponible</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            id="featured"
                                            type="checkbox"
                                            checked={createForm.data.featured}
                                            onChange={(e) => createForm.setData('featured', e.target.checked)}
                                            className="rounded"
                                        />
                                        <Label htmlFor="featured">Destacado</Label>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="details" className="space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Categoría</Label>
                                        <Select
                                            value={createForm.data.product_category_id || '_none'}
                                            onValueChange={(value) => createForm.setData('product_category_id', value === '_none' ? '' : value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sin categoría" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="_none">Sin categoría</SelectItem>
                                                {allCategories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                                        {cat.depth > 0 ? `└ ${cat.name}` : cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Marca</Label>
                                        <Select
                                            value={createForm.data.brand_id || '_none'}
                                            onValueChange={(value) => createForm.setData('brand_id', value === '_none' ? '' : value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sin marca" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="_none">Sin marca</SelectItem>
                                                {brands.map((brand) => (
                                                    <SelectItem key={brand.id} value={brand.id.toString()}>
                                                        {brand.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Género</Label>
                                        <Select
                                            value={createForm.data.gender || '_none'}
                                            onValueChange={(value) => createForm.setData('gender', value === '_none' ? '' : value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="No aplica" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="_none">No aplica</SelectItem>
                                                {Object.entries(genderOptions).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Condición</Label>
                                        <Select
                                            value={createForm.data.condition}
                                            onValueChange={(value) => createForm.setData('condition', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Nuevo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(conditionOptions).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="sku">SKU / Código</Label>
                                        <Input
                                            id="sku"
                                            value={createForm.data.sku}
                                            onChange={(e) => createForm.setData('sku', e.target.value)}
                                            placeholder="ABC-123"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="stock">Stock</Label>
                                        <Input
                                            id="stock"
                                            type="number"
                                            value={createForm.data.stock}
                                            onChange={(e) => createForm.setData('stock', e.target.value)}
                                            placeholder="Sin límite"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="weight">Peso (gramos)</Label>
                                        <Input
                                            id="weight"
                                            type="number"
                                            step="0.01"
                                            value={createForm.data.weight}
                                            onChange={(e) => createForm.setData('weight', e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="origin_country">País de origen</Label>
                                        <Input
                                            id="origin_country"
                                            value={createForm.data.origin_country}
                                            onChange={(e) => createForm.setData('origin_country', e.target.value)}
                                            placeholder="Perú, China, etc."
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="specs" className="space-y-4 mt-4">
                                <p className="text-sm text-muted-foreground">
                                    Agrega especificaciones técnicas como en Falabella (Marca, Modelo, etc.)
                                </p>

                                {createSpecs.map((spec, index) => (
                                    <div key={`create-spec-${index}`} className="flex gap-2 items-start">
                                        <div className="flex-1">
                                            <Input
                                                value={spec.label}
                                                onChange={(e) => updateCreateSpecification(index, 'label', e.target.value)}
                                                placeholder="Etiqueta (ej: Marca)"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <Input
                                                value={spec.value}
                                                onChange={(e) => updateCreateSpecification(index, 'value', e.target.value)}
                                                placeholder="Valor (ej: Samsung)"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeCreateSpecification(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addCreateSpecification}
                                    className="w-full"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Agregar Especificación
                                </Button>
                            </TabsContent>

                            <TabsContent value="variants" className="space-y-4 mt-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <input
                                        id="has_variants"
                                        type="checkbox"
                                        checked={createForm.data.has_variants}
                                        onChange={(e) => createForm.setData('has_variants', e.target.checked)}
                                        className="rounded"
                                    />
                                    <Label htmlFor="has_variants">
                                        Este producto tiene variantes (tallas, colores, etc.)
                                    </Label>
                                </div>

                                {createForm.data.has_variants && (
                                    <div className="space-y-6">
                                        {/* Sección de Atributos */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-base font-semibold">Atributos de variantes</Label>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={addCreateVariantAttribute}
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Agregar Atributo
                                                </Button>
                                            </div>

                                            <p className="text-sm text-muted-foreground">
                                                Crea atributos como Talla, Color, Material, etc. y agrega sus valores.
                                            </p>

                                            {createVariantAttrs.map((attr) => (
                                                <div key={attr.id} className="border rounded-lg p-4 space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            value={attr.name}
                                                            onChange={(e) => updateCreateVariantAttributeName(attr.id, e.target.value)}
                                                            placeholder="Nombre del atributo (ej: Talla, Color)"
                                                            className="flex-1"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeCreateVariantAttribute(attr.id)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    {/* Valores del atributo */}
                                                    <div className="flex flex-wrap gap-2">
                                                        {attr.values.map((val) => (
                                                            <div
                                                                key={val.id}
                                                                className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md"
                                                            >
                                                                {val.colorHex && (
                                                                    <span
                                                                        className="w-4 h-4 rounded-full border"
                                                                        style={{ backgroundColor: val.colorHex }}
                                                                    />
                                                                )}
                                                                <span className="text-sm">{val.value}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeCreateAttributeValue(attr.id, val.id)}
                                                                    className="text-muted-foreground hover:text-foreground"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Agregar nuevo valor */}
                                                    {isColorAttribute(attr.name) ? (
                                                        <div className="space-y-2">
                                                            <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Palette className="h-3 w-3" />
                                                                Seleccionar colores de la paleta
                                                            </Label>
                                                            <div className="flex flex-wrap gap-1">
                                                                {COLOR_PALETTE.map((color) => (
                                                                    <button
                                                                        key={color.hex}
                                                                        type="button"
                                                                        onClick={() => addCreateAttributeValue(attr.id, color.name, color.hex)}
                                                                        className={cn(
                                                                            "w-7 h-7 rounded-md border-2 transition-all hover:scale-110",
                                                                            attr.values.some(v => v.value === color.name)
                                                                                ? "border-primary ring-2 ring-primary/30"
                                                                                : "border-transparent"
                                                                        )}
                                                                        style={{ backgroundColor: color.hex }}
                                                                        title={color.name}
                                                                        disabled={attr.values.some(v => v.value === color.name)}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <div className="flex gap-2 mt-2">
                                                                <Input
                                                                    placeholder="O escribe un color personalizado"
                                                                    className="flex-1 h-8 text-sm"
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            addCreateAttributeValue(attr.id, e.currentTarget.value);
                                                                            e.currentTarget.value = '';
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {/* Recomendaciones */}
                                                            {getRecommendationsForAttribute(attr.name).length > 0 && (
                                                                <div className="space-y-1">
                                                                    <Label className="text-xs text-muted-foreground">Opciones recomendadas</Label>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {getRecommendationsForAttribute(attr.name).map((rec) => (
                                                                            <Button
                                                                                key={rec}
                                                                                type="button"
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="h-6 text-xs"
                                                                                onClick={() => addCreateAttributeValue(attr.id, rec)}
                                                                                disabled={attr.values.some(v => v.value === rec)}
                                                                            >
                                                                                {rec}
                                                                            </Button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    placeholder="Escribe un valor y presiona Enter"
                                                                    className="flex-1 h-8 text-sm"
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            addCreateAttributeValue(attr.id, e.currentTarget.value);
                                                                            e.currentTarget.value = '';
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            {createVariantAttrs.length === 0 && (
                                                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                                    <p className="text-muted-foreground">
                                                        No hay atributos definidos. Agrega atributos como "Talla" o "Color".
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Botón para generar variantes */}
                                        {createVariantAttrs.some(attr => attr.name && attr.values.length > 0) && (
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={generateCreateVariants}
                                                className="w-full"
                                            >
                                                Generar Combinaciones de Variantes
                                            </Button>
                                        )}

                                        {/* Tabla de variantes generadas */}
                                        {createVariants.length > 0 && (
                                            <div className="space-y-2">
                                                <Label className="text-base font-semibold">
                                                    Variantes ({createVariants.length})
                                                </Label>
                                                <div className="border rounded-lg overflow-hidden">
                                                    <div className="bg-muted p-2 grid gap-2" style={{
                                                        gridTemplateColumns: `repeat(${Object.keys(createVariants[0]?.attributes || {}).length + 3}, 1fr) auto`
                                                    }}>
                                                        {Object.keys(createVariants[0]?.attributes || {}).map((attrName) => (
                                                            <span key={attrName} className="text-xs font-medium">{attrName}</span>
                                                        ))}
                                                        <span className="text-xs font-medium">Precio</span>
                                                        <span className="text-xs font-medium">Stock</span>
                                                        <span className="text-xs font-medium">SKU</span>
                                                        <span></span>
                                                    </div>

                                                    {createVariants.map((variant, index) => (
                                                        <div key={variant.id} className="p-2 border-t grid gap-2 items-center" style={{
                                                            gridTemplateColumns: `repeat(${Object.keys(variant.attributes).length + 3}, 1fr) auto`
                                                        }}>
                                                            {Object.entries(variant.attributes).map(([attrName, attrValue]) => (
                                                                <span key={attrName} className="text-sm">{attrValue}</span>
                                                            ))}
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                value={variant.price}
                                                                onChange={(e) => updateCreateVariant(index, 'price', e.target.value)}
                                                                placeholder="0.00"
                                                                className="h-8 text-xs"
                                                            />
                                                            <Input
                                                                type="number"
                                                                value={variant.stock}
                                                                onChange={(e) => updateCreateVariant(index, 'stock', e.target.value)}
                                                                placeholder="0"
                                                                className="h-8 text-xs"
                                                            />
                                                            <Input
                                                                value={variant.sku}
                                                                onChange={(e) => updateCreateVariant(index, 'sku', e.target.value)}
                                                                placeholder="SKU"
                                                                className="h-8 text-xs"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() => removeCreateVariant(index)}
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>

                        <DialogFooter className="mt-6">
                            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={createForm.processing}>
                                {createForm.processing ? 'Guardando...' : 'Crear Producto'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Editar Producto */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Editar Producto</DialogTitle>
                        <DialogDescription>
                            Modifica los datos del producto
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditProduct}>
                        <Tabs value={editActiveTab} onValueChange={setEditActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="basic">Básico</TabsTrigger>
                                <TabsTrigger value="details">Detalles</TabsTrigger>
                                <TabsTrigger value="specs">Especificaciones</TabsTrigger>
                                <TabsTrigger value="variants">Variantes</TabsTrigger>
                            </TabsList>

                            <TabsContent value="basic" className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">Nombre *</Label>
                                    <Input
                                        id="edit-name"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        placeholder="Nombre del producto"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-short_description">Descripción corta</Label>
                                    <Input
                                        id="edit-short_description"
                                        value={editForm.data.short_description}
                                        onChange={(e) => editForm.setData('short_description', e.target.value)}
                                        placeholder="Breve descripción para listados"
                                        maxLength={500}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-description">Descripción completa</Label>
                                    <Textarea
                                        id="edit-description"
                                        value={editForm.data.description}
                                        onChange={(e) => editForm.setData('description', e.target.value)}
                                        placeholder="Descripción detallada del producto"
                                        rows={4}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-price">Precio *</Label>
                                        <Input
                                            id="edit-price"
                                            type="number"
                                            step="0.01"
                                            value={editForm.data.price}
                                            onChange={(e) => editForm.setData('price', e.target.value)}
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-compare_price">Precio anterior</Label>
                                        <Input
                                            id="edit-compare_price"
                                            type="number"
                                            step="0.01"
                                            value={editForm.data.compare_price}
                                            onChange={(e) => editForm.setData('compare_price', e.target.value)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-image">Imagen principal</Label>
                                    <Input
                                        id="edit-image"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => editForm.setData('image', e.target.files?.[0] || null)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <input
                                            id="edit-available"
                                            type="checkbox"
                                            checked={editForm.data.available}
                                            onChange={(e) => editForm.setData('available', e.target.checked)}
                                            className="rounded"
                                        />
                                        <Label htmlFor="edit-available">Disponible</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            id="edit-featured"
                                            type="checkbox"
                                            checked={editForm.data.featured}
                                            onChange={(e) => editForm.setData('featured', e.target.checked)}
                                            className="rounded"
                                        />
                                        <Label htmlFor="edit-featured">Destacado</Label>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="details" className="space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Categoría</Label>
                                        <Select
                                            value={editForm.data.product_category_id || '_none'}
                                            onValueChange={(value) => editForm.setData('product_category_id', value === '_none' ? '' : value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sin categoría" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="_none">Sin categoría</SelectItem>
                                                {allCategories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                                        {cat.depth > 0 ? `└ ${cat.name}` : cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Marca</Label>
                                        <Select
                                            value={editForm.data.brand_id || '_none'}
                                            onValueChange={(value) => editForm.setData('brand_id', value === '_none' ? '' : value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sin marca" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="_none">Sin marca</SelectItem>
                                                {brands.map((brand) => (
                                                    <SelectItem key={brand.id} value={brand.id.toString()}>
                                                        {brand.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Género</Label>
                                        <Select
                                            value={editForm.data.gender || '_none'}
                                            onValueChange={(value) => editForm.setData('gender', value === '_none' ? '' : value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="No aplica" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="_none">No aplica</SelectItem>
                                                {Object.entries(genderOptions).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Condición</Label>
                                        <Select
                                            value={editForm.data.condition}
                                            onValueChange={(value) => editForm.setData('condition', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Nuevo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(conditionOptions).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-sku">SKU / Código</Label>
                                        <Input
                                            id="edit-sku"
                                            value={editForm.data.sku}
                                            onChange={(e) => editForm.setData('sku', e.target.value)}
                                            placeholder="ABC-123"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-stock">Stock</Label>
                                        <Input
                                            id="edit-stock"
                                            type="number"
                                            value={editForm.data.stock}
                                            onChange={(e) => editForm.setData('stock', e.target.value)}
                                            placeholder="Sin límite"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-weight">Peso (gramos)</Label>
                                        <Input
                                            id="edit-weight"
                                            type="number"
                                            step="0.01"
                                            value={editForm.data.weight}
                                            onChange={(e) => editForm.setData('weight', e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-origin_country">País de origen</Label>
                                        <Input
                                            id="edit-origin_country"
                                            value={editForm.data.origin_country}
                                            onChange={(e) => editForm.setData('origin_country', e.target.value)}
                                            placeholder="Perú, China, etc."
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="specs" className="space-y-4 mt-4">
                                <p className="text-sm text-muted-foreground">
                                    Agrega especificaciones técnicas como en Falabella (Marca, Modelo, etc.)
                                </p>

                                {editSpecs.map((spec, index) => (
                                    <div key={`edit-spec-${index}`} className="flex gap-2 items-start">
                                        <div className="flex-1">
                                            <Input
                                                value={spec.label}
                                                onChange={(e) => updateEditSpecification(index, 'label', e.target.value)}
                                                placeholder="Etiqueta (ej: Marca)"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <Input
                                                value={spec.value}
                                                onChange={(e) => updateEditSpecification(index, 'value', e.target.value)}
                                                placeholder="Valor (ej: Samsung)"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeEditSpecification(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addEditSpecification}
                                    className="w-full"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Agregar Especificación
                                </Button>
                            </TabsContent>

                            <TabsContent value="variants" className="space-y-4 mt-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <input
                                        id="edit-has_variants"
                                        type="checkbox"
                                        checked={editForm.data.has_variants}
                                        onChange={(e) => editForm.setData('has_variants', e.target.checked)}
                                        className="rounded"
                                    />
                                    <Label htmlFor="edit-has_variants">
                                        Este producto tiene variantes (tallas, colores, etc.)
                                    </Label>
                                </div>

                                {editForm.data.has_variants && (
                                    <div className="space-y-6">
                                        {/* Sección de Atributos */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-base font-semibold">Atributos de variantes</Label>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={addEditVariantAttribute}
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Agregar Atributo
                                                </Button>
                                            </div>

                                            <p className="text-sm text-muted-foreground">
                                                Crea atributos como Talla, Color, Material, etc. y agrega sus valores.
                                            </p>

                                            {editVariantAttrs.map((attr) => (
                                                <div key={attr.id} className="border rounded-lg p-4 space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            value={attr.name}
                                                            onChange={(e) => updateEditVariantAttributeName(attr.id, e.target.value)}
                                                            placeholder="Nombre del atributo (ej: Talla, Color)"
                                                            className="flex-1"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeEditVariantAttribute(attr.id)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    {/* Valores del atributo */}
                                                    <div className="flex flex-wrap gap-2">
                                                        {attr.values.map((val) => (
                                                            <div
                                                                key={val.id}
                                                                className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md"
                                                            >
                                                                {val.colorHex && (
                                                                    <span
                                                                        className="w-4 h-4 rounded-full border"
                                                                        style={{ backgroundColor: val.colorHex }}
                                                                    />
                                                                )}
                                                                <span className="text-sm">{val.value}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeEditAttributeValue(attr.id, val.id)}
                                                                    className="text-muted-foreground hover:text-foreground"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Agregar nuevo valor */}
                                                    {isColorAttribute(attr.name) ? (
                                                        <div className="space-y-2">
                                                            <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Palette className="h-3 w-3" />
                                                                Seleccionar colores de la paleta
                                                            </Label>
                                                            <div className="flex flex-wrap gap-1">
                                                                {COLOR_PALETTE.map((color) => (
                                                                    <button
                                                                        key={color.hex}
                                                                        type="button"
                                                                        onClick={() => addEditAttributeValue(attr.id, color.name, color.hex)}
                                                                        className={cn(
                                                                            "w-7 h-7 rounded-md border-2 transition-all hover:scale-110",
                                                                            attr.values.some(v => v.value === color.name)
                                                                                ? "border-primary ring-2 ring-primary/30"
                                                                                : "border-transparent"
                                                                        )}
                                                                        style={{ backgroundColor: color.hex }}
                                                                        title={color.name}
                                                                        disabled={attr.values.some(v => v.value === color.name)}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <div className="flex gap-2 mt-2">
                                                                <Input
                                                                    placeholder="O escribe un color personalizado"
                                                                    className="flex-1 h-8 text-sm"
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            addEditAttributeValue(attr.id, e.currentTarget.value);
                                                                            e.currentTarget.value = '';
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {/* Recomendaciones */}
                                                            {getRecommendationsForAttribute(attr.name).length > 0 && (
                                                                <div className="space-y-1">
                                                                    <Label className="text-xs text-muted-foreground">Opciones recomendadas</Label>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {getRecommendationsForAttribute(attr.name).map((rec) => (
                                                                            <Button
                                                                                key={rec}
                                                                                type="button"
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="h-6 text-xs"
                                                                                onClick={() => addEditAttributeValue(attr.id, rec)}
                                                                                disabled={attr.values.some(v => v.value === rec)}
                                                                            >
                                                                                {rec}
                                                                            </Button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    placeholder="Escribe un valor y presiona Enter"
                                                                    className="flex-1 h-8 text-sm"
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            addEditAttributeValue(attr.id, e.currentTarget.value);
                                                                            e.currentTarget.value = '';
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            {editVariantAttrs.length === 0 && (
                                                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                                    <p className="text-muted-foreground">
                                                        No hay atributos definidos. Agrega atributos como "Talla" o "Color".
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Botón para generar variantes */}
                                        {editVariantAttrs.some(attr => attr.name && attr.values.length > 0) && (
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={generateEditVariants}
                                                className="w-full"
                                            >
                                                Generar Combinaciones de Variantes
                                            </Button>
                                        )}

                                        {/* Tabla de variantes generadas */}
                                        {editVariants.length > 0 && (
                                            <div className="space-y-2">
                                                <Label className="text-base font-semibold">
                                                    Variantes ({editVariants.length})
                                                </Label>
                                                <div className="border rounded-lg overflow-hidden">
                                                    <div className="bg-muted p-2 grid gap-2" style={{
                                                        gridTemplateColumns: `repeat(${Object.keys(editVariants[0]?.attributes || {}).length + 3}, 1fr) auto`
                                                    }}>
                                                        {Object.keys(editVariants[0]?.attributes || {}).map((attrName) => (
                                                            <span key={attrName} className="text-xs font-medium">{attrName}</span>
                                                        ))}
                                                        <span className="text-xs font-medium">Precio</span>
                                                        <span className="text-xs font-medium">Stock</span>
                                                        <span className="text-xs font-medium">SKU</span>
                                                        <span></span>
                                                    </div>

                                                    {editVariants.map((variant, index) => (
                                                        <div key={variant.id} className="p-2 border-t grid gap-2 items-center" style={{
                                                            gridTemplateColumns: `repeat(${Object.keys(variant.attributes).length + 3}, 1fr) auto`
                                                        }}>
                                                            {Object.entries(variant.attributes).map(([attrName, attrValue]) => (
                                                                <span key={attrName} className="text-sm">{attrValue}</span>
                                                            ))}
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                value={variant.price}
                                                                onChange={(e) => updateEditVariant(index, 'price', e.target.value)}
                                                                placeholder="0.00"
                                                                className="h-8 text-xs"
                                                            />
                                                            <Input
                                                                type="number"
                                                                value={variant.stock}
                                                                onChange={(e) => updateEditVariant(index, 'stock', e.target.value)}
                                                                placeholder="0"
                                                                className="h-8 text-xs"
                                                            />
                                                            <Input
                                                                value={variant.sku}
                                                                onChange={(e) => updateEditVariant(index, 'sku', e.target.value)}
                                                                placeholder="SKU"
                                                                className="h-8 text-xs"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() => removeEditVariant(index)}
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>

                        <DialogFooter className="mt-6">
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
