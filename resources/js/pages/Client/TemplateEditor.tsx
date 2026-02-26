/**
 * Editor de Plantilla de Tienda - Página Exclusiva
 * Permite configurar todas las secciones del template de forma visual
 */

import React, { useState, useRef, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
  Save,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  Type,
  Palette,
  Settings,
  Layout,
  Navigation,
  ShoppingBag,
  MessageSquare,
  Code,
  Upload,
  Loader2,
  Check,
  AlertCircle,
  CheckCircle,
  Monitor,
  Smartphone,
  ExternalLink,
  Move,
  Copy,
  MoreVertical,
  Edit3,
  Link2,
  Phone,
  Clock,
  MapPin,
  Layers,
  Grid,
  Columns,
  Square,
  Circle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================
interface HeroSlide {
  id: string;
  image: string;
  imageMobile?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  position: 'left' | 'center' | 'right';
  overlayOpacity: number;
}

interface PromoBanner {
  id: string;
  image: string;
  title: string;
  ctaText?: string;
  ctaLink?: string;
}

interface ProductSection {
  id: string;
  type: 'carousel' | 'grid';
  title: string;
  subtitle?: string;
  filter: string;
  limit: number;
  showViewAll: boolean;
}

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface FooterColumn {
  id: string;
  title: string;
  links: { label: string; href: string }[];
}

interface MenuLink {
  id: string;
  label: string;
  href: string;
  badge?: string;
}

interface MenuSection {
  id: string;
  label: string;
  children: MenuLink[];
}

interface MenuItem {
  id: string;
  label: string;
  href?: string;
  badge?: string;
  badgeColor?: string;
  children?: MenuSection[];
  columns?: number;
}

interface TemplateConfig {
  // Branding
  logo?: string;
  logoDark?: string;
  brandName: string;
  slogan?: string;

  // Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;

  // Navigation
  topBarEnabled: boolean;
  topBarText: string;
  topBarLinks: { label: string; href: string }[];
  showSearch: boolean;
  showWishlist: boolean;
  showCart: boolean;
  mainMenu: MenuItem[];

  // Hero
  heroType: 'slider' | 'video' | 'minimal';
  heroAutoplay: boolean;
  heroAutoplaySpeed: number;
  heroShowArrows: boolean;
  heroShowDots: boolean;
  heroHeight: string;
  heroSlides: HeroSlide[];

  // Promo Banners
  promoBanners: PromoBanner[];

  // Product Sections
  productSections: ProductSection[];

  // Features
  features: Feature[];

  // Footer
  footerColumns: FooterColumn[];
  footerShowSocial: boolean;
  footerShowNewsletter: boolean;
  footerBackgroundColor: string;
  footerTextColor: string;
  footerCopyright: string;

  // Contact
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  businessHours?: string;

  // Social
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  twitter?: string;

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;

  // Shipping
  shippingEnabled?: boolean;
  shippingLocalCost?: number;
  shippingNationalCost?: number;
  shippingInternationalCost?: number;
  freeShippingThreshold?: number;
  shippingZones?: Array<{
    id: string;
    name: string;
    districts: string[];
    cost: number;
  }>;
  pickupEnabled?: boolean;
  pickupAddress?: string;
  pickupHours?: string;

  // Payment
  paymentMethods?: {
    cash: boolean;
    transfer: boolean;
    card: boolean;
    yape: boolean;
    plin: boolean;
  };
  bankAccounts?: Array<{
    id: string;
    bank: string;
    accountType: string;
    accountNumber: string;
    cci?: string;
    holder: string;
  }>;
  yapeNumber?: string;
  plinNumber?: string;
}

interface Props {
  templateId: string;
  templateName: string;
  templateSlug: string;
  config: Partial<TemplateConfig>;
  accountSlug: string;
  accountName: string;
  accountId: number;
  previewUrl: string;
}

// ============================================
// DEFAULT CONFIG
// ============================================
const defaultConfig: TemplateConfig = {
  brandName: 'Mi Tienda',
  slogan: '',
  primaryColor: '#111111',
  secondaryColor: '#757575',
  accentColor: '#ff6b35',
  backgroundColor: '#ffffff',
  textColor: '#111111',

  topBarEnabled: true,
  topBarText: 'Envío gratis en compras mayores a S/199',
  topBarLinks: [
    { label: 'Buscar tienda', href: '/tiendas' },
    { label: 'Ayuda', href: '/ayuda' },
  ],
  showSearch: true,
  showWishlist: true,
  showCart: true,
  mainMenu: [
    {
      id: 'nuevo',
      label: 'Lo nuevo',
      href: '/productos?filter=new',
      badge: 'NEW',
      badgeColor: '#ff6b35',
    },
    {
      id: 'catalogo',
      label: 'Catálogo',
      href: '/productos',
    },
    {
      id: 'ofertas',
      label: 'Ofertas',
      href: '/productos?filter=sale',
      badge: '🔥',
    },
  ],

  heroType: 'slider',
  heroAutoplay: true,
  heroAutoplaySpeed: 5000,
  heroShowArrows: true,
  heroShowDots: true,
  heroHeight: '85vh',
  heroSlides: [],

  promoBanners: [],
  productSections: [
    {
      id: 'featured',
      type: 'carousel',
      title: 'Productos Destacados',
      subtitle: 'Lo mejor de nuestra tienda',
      filter: 'featured',
      limit: 8,
      showViewAll: true,
    },
    {
      id: 'new',
      type: 'grid',
      title: 'Lo Nuevo',
      subtitle: 'Recién llegados',
      filter: 'new',
      limit: 8,
      showViewAll: true,
    },
  ],

  features: [
    { id: '1', icon: '🚚', title: 'Envío Gratis', description: 'En compras mayores a S/199' },
    { id: '2', icon: '🔄', title: 'Cambios Gratis', description: 'Hasta 30 días' },
    { id: '3', icon: '💳', title: 'Pago Seguro', description: 'Múltiples métodos' },
    { id: '4', icon: '⭐', title: 'Garantía', description: 'Productos originales' },
  ],

  footerColumns: [
    {
      id: '1',
      title: 'Tienda',
      links: [
        { label: 'Catálogo', href: '/productos' },
        { label: 'Ofertas', href: '/ofertas' },
      ],
    },
    {
      id: '2',
      title: 'Ayuda',
      links: [
        { label: 'Estado del Pedido', href: '/pedidos' },
        { label: 'Envíos', href: '/envio' },
        { label: 'Devoluciones', href: '/devoluciones' },
      ],
    },
    {
      id: '3',
      title: 'Nosotros',
      links: [
        { label: 'Acerca de', href: '/nosotros' },
        { label: 'Contacto', href: '/contacto' },
      ],
    },
  ],
  footerShowSocial: true,
  footerShowNewsletter: true,
  footerBackgroundColor: '#111111',
  footerTextColor: '#ffffff',
  footerCopyright: '© 2024 Mi Tienda. Todos los derechos reservados.',
};

// ============================================
// NOTIFICATION COMPONENT
// ============================================
const Notification: React.FC<{
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}> = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={cn(
      'fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-in slide-in-from-top-2',
      type === 'success'
        ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/50 dark:border-green-800 dark:text-green-200'
        : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/50 dark:border-red-800 dark:text-red-200'
    )}>
      {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70"><X className="w-4 h-4" /></button>
    </div>
  );
};

// ============================================
// SECTION CARD COMPONENT
// ============================================
const SectionCard: React.FC<{
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, description, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
            </div>
          </div>
          <ChevronRight className={cn('w-5 h-5 text-muted-foreground transition-transform', isOpen && 'rotate-90')} />
        </div>
      </CardHeader>
      {isOpen && <CardContent className="pt-0 border-t">{children}</CardContent>}
    </Card>
  );
};

// ============================================
// IMAGE UPLOAD COMPONENT
// ============================================
const ImageUpload: React.FC<{
  value?: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<string>;
  label: string;
  hint?: string;
  aspectRatio?: string;
}> = ({ value, onChange, onUpload, label, hint, aspectRatio = 'aspect-video' }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await onUpload(file);
      onChange(url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        className={cn(
          'relative rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/30 overflow-hidden cursor-pointer transition-colors hover:border-primary/50',
          aspectRatio,
          isUploading && 'pointer-events-none'
        )}
        onClick={() => !isUploading && inputRef.current?.click()}
      >
        {isUploading ? (
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-1" />
            <span className="text-xs text-muted-foreground">Subiendo...</span>
          </div>
        ) : value ? (
          <>
            <img src={value} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
                <Upload className="w-4 h-4 mr-1" /> Cambiar
              </Button>
              <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); onChange(''); }}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center p-4">
            <Upload className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
            <span className="text-sm text-muted-foreground">Click para subir</span>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
};

// ============================================
// HERO SLIDE EDITOR
// ============================================
const HeroSlideEditor: React.FC<{
  slide: HeroSlide;
  onChange: (slide: HeroSlide) => void;
  onDelete: () => void;
  onUpload: (file: File) => Promise<string>;
}> = ({ slide, onChange, onDelete, onUpload }) => {
  return (
    <Card className="relative">
      <Button
        size="sm"
        variant="destructive"
        className="absolute top-2 right-2 z-10"
        onClick={onDelete}
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      <CardContent className="p-4 space-y-4">
        <ImageUpload
          value={slide.image}
          onChange={(url) => onChange({ ...slide, image: url })}
          onUpload={onUpload}
          label="Imagen de fondo"
          hint="Recomendado: 1920x1080px"
          aspectRatio="aspect-[16/9]"
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              value={slide.title || ''}
              onChange={(e) => onChange({ ...slide, title: e.target.value })}
              placeholder="Título del slide"
            />
          </div>
          <div className="space-y-2">
            <Label>Subtítulo</Label>
            <Input
              value={slide.subtitle || ''}
              onChange={(e) => onChange({ ...slide, subtitle: e.target.value })}
              placeholder="Subtítulo opcional"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Texto del botón</Label>
            <Input
              value={slide.ctaText || ''}
              onChange={(e) => onChange({ ...slide, ctaText: e.target.value })}
              placeholder="Ej: Comprar ahora"
            />
          </div>
          <div className="space-y-2">
            <Label>Link del botón</Label>
            <Input
              value={slide.ctaLink || ''}
              onChange={(e) => onChange({ ...slide, ctaLink: e.target.value })}
              placeholder="/productos"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Posición del contenido</Label>
            <div className="flex gap-2">
              {(['left', 'center', 'right'] as const).map((pos) => (
                <Button
                  key={pos}
                  type="button"
                  size="sm"
                  variant={slide.position === pos ? 'default' : 'outline'}
                  onClick={() => onChange({ ...slide, position: pos })}
                  className="flex-1"
                >
                  {pos === 'left' ? 'Izquierda' : pos === 'center' ? 'Centro' : 'Derecha'}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Opacidad del overlay ({slide.overlayOpacity}%)</Label>
            <input
              type="range"
              min="0"
              max="100"
              value={slide.overlayOpacity}
              onChange={(e) => onChange({ ...slide, overlayOpacity: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// PROMO BANNER EDITOR
// ============================================
const PromoBannerEditor: React.FC<{
  banner: PromoBanner;
  onChange: (banner: PromoBanner) => void;
  onDelete: () => void;
  onUpload: (file: File) => Promise<string>;
}> = ({ banner, onChange, onDelete, onUpload }) => {
  return (
    <Card className="relative">
      <Button
        size="sm"
        variant="destructive"
        className="absolute top-2 right-2 z-10"
        onClick={onDelete}
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      <CardContent className="p-4 space-y-4">
        <ImageUpload
          value={banner.image}
          onChange={(url) => onChange({ ...banner, image: url })}
          onUpload={onUpload}
          label="Imagen del banner"
          hint="Recomendado: 800x600px"
          aspectRatio="aspect-[4/3]"
        />

        <div className="space-y-2">
          <Label>Título</Label>
          <Input
            value={banner.title}
            onChange={(e) => onChange({ ...banner, title: e.target.value })}
            placeholder="Título del banner"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Texto del botón</Label>
            <Input
              value={banner.ctaText || ''}
              onChange={(e) => onChange({ ...banner, ctaText: e.target.value })}
              placeholder="Comprar"
            />
          </div>
          <div className="space-y-2">
            <Label>Link</Label>
            <Input
              value={banner.ctaLink || ''}
              onChange={(e) => onChange({ ...banner, ctaLink: e.target.value })}
              placeholder="/coleccion/ejemplo"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// PRODUCT SECTION EDITOR
// ============================================
const ProductSectionEditor: React.FC<{
  section: ProductSection;
  onChange: (section: ProductSection) => void;
  onDelete: () => void;
}> = ({ section, onChange, onDelete }) => {
  return (
    <Card className="relative">
      <Button
        size="sm"
        variant="destructive"
        className="absolute top-2 right-2 z-10"
        onClick={onDelete}
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      <CardContent className="p-4 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              value={section.title}
              onChange={(e) => onChange({ ...section, title: e.target.value })}
              placeholder="Título de la sección"
            />
          </div>
          <div className="space-y-2">
            <Label>Subtítulo</Label>
            <Input
              value={section.subtitle || ''}
              onChange={(e) => onChange({ ...section, subtitle: e.target.value })}
              placeholder="Subtítulo opcional"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Tipo de vista</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={section.type === 'carousel' ? 'default' : 'outline'}
                onClick={() => onChange({ ...section, type: 'carousel' })}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant={section.type === 'grid' ? 'default' : 'outline'}
                onClick={() => onChange({ ...section, type: 'grid' })}
                className="flex-1"
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Filtro</Label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={section.filter}
              onChange={(e) => onChange({ ...section, filter: e.target.value })}
            >
              <option value="featured">Destacados</option>
              <option value="new">Nuevos</option>
              <option value="bestseller">Más vendidos</option>
              <option value="sale">En oferta</option>
              <option value="all">Todos</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Cantidad</Label>
            <Input
              type="number"
              min="4"
              max="20"
              value={section.limit}
              onChange={(e) => onChange({ ...section, limit: parseInt(e.target.value) || 8 })}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={section.showViewAll}
            onCheckedChange={(checked) => onChange({ ...section, showViewAll: !!checked })}
          />
          <span className="text-sm">Mostrar botón "Ver todo"</span>
        </label>
      </CardContent>
    </Card>
  );
};

// ============================================
// FEATURE EDITOR
// ============================================
const FeatureEditor: React.FC<{
  feature: Feature;
  onChange: (feature: Feature) => void;
  onDelete: () => void;
}> = ({ feature, onChange, onDelete }) => {
  const emojiOptions = ['🚚', '🔄', '💳', '⭐', '🎁', '💬', '🔒', '❤️', '🏆', '✨'];

  return (
    <Card className="relative">
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 text-destructive hover:text-destructive"
        onClick={onDelete}
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="space-y-2">
            <Label>Ícono</Label>
            <div className="flex flex-wrap gap-1">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className={cn(
                    'w-8 h-8 rounded text-lg hover:bg-muted transition-colors',
                    feature.icon === emoji && 'bg-primary/10 ring-2 ring-primary'
                  )}
                  onClick={() => onChange({ ...feature, icon: emoji })}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={feature.title}
                onChange={(e) => onChange({ ...feature, title: e.target.value })}
                placeholder="Título"
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input
                value={feature.description}
                onChange={(e) => onChange({ ...feature, description: e.target.value })}
                placeholder="Descripción breve"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function TemplateEditor({
  templateId,
  templateName,
  templateSlug,
  config: initialConfig,
  accountSlug,
  accountName,
  accountId,
  previewUrl,
}: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Plantillas', href: '/settings/templates' },
    { title: `Editar: ${templateName}`, href: '#' },
  ];

  // Merge initial config with defaults
  const [config, setConfig] = useState<TemplateConfig>(() => ({
    ...defaultConfig,
    ...initialConfig,
    heroSlides: initialConfig.heroSlides?.length ? initialConfig.heroSlides : defaultConfig.heroSlides,
    promoBanners: initialConfig.promoBanners?.length ? initialConfig.promoBanners : defaultConfig.promoBanners,
    productSections: initialConfig.productSections?.length ? initialConfig.productSections : defaultConfig.productSections,
    features: initialConfig.features?.length ? initialConfig.features : defaultConfig.features,
    footerColumns: initialConfig.footerColumns?.length ? initialConfig.footerColumns : defaultConfig.footerColumns,
  }));

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('branding');

  // Update config helper
  const updateConfig = <K extends keyof TemplateConfig>(key: K, value: TemplateConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // Upload handler
  const handleUpload = async (file: File, type: 'hero' | 'banner' | 'logo'): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);

    try {
      const response = await fetch('/settings/templates/upload-image', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      const data = await response.json();
      if (data.success) {
        setNotification({ type: 'success', message: 'Imagen subida correctamente' });
        return data.url;
      } else {
        throw new Error(data.message || 'Error al subir');
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Error al subir la imagen' });
      throw error;
    }
  };

  // Save config
  const handleSave = async () => {
    setIsSaving(true);

    router.post('/settings/templates/save-editor', {
      template_id: templateId,
      config: config,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setNotification({ type: 'success', message: 'Configuración guardada correctamente' });
      },
      onError: () => {
        setNotification({ type: 'error', message: 'Error al guardar la configuración' });
      },
      onFinish: () => {
        setIsSaving(false);
      },
    });
  };

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Navigation sections
  const sections = [
    { id: 'branding', label: 'Marca', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'colors', label: 'Colores', icon: <Palette className="w-4 h-4" /> },
    { id: 'navigation', label: 'Navegación', icon: <Navigation className="w-4 h-4" /> },
    { id: 'hero', label: 'Hero / Portada', icon: <Layout className="w-4 h-4" /> },
    { id: 'banners', label: 'Banners', icon: <Columns className="w-4 h-4" /> },
    { id: 'products', label: 'Productos', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'features', label: 'Características', icon: <Check className="w-4 h-4" /> },
    { id: 'shipping', label: 'Envíos', icon: <Move className="w-4 h-4" /> },
    { id: 'payment', label: 'Pagos', icon: <Settings className="w-4 h-4" /> },
    { id: 'footer', label: 'Footer', icon: <Layers className="w-4 h-4" /> },
    { id: 'contact', label: 'Contacto', icon: <Phone className="w-4 h-4" /> },
    { id: 'seo', label: 'SEO', icon: <Code className="w-4 h-4" /> },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Editar ${templateName}`} />

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-64 border-r bg-muted/20 flex flex-col shrink-0">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">{templateName}</h2>
            <p className="text-sm text-muted-foreground">Editor de plantilla</p>
          </div>

          {/* Info de la cuenta que se está editando */}
          <div className="p-3 mx-2 mt-2 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-medium text-blue-800 dark:text-blue-200">Editando tienda:</p>
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 truncate" title={accountName}>
              {accountName}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">ID: {accountId} | Slug: {accountSlug}</p>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-1"
            >
              <ExternalLink className="w-3 h-3" />
              Ver tienda en vivo
            </a>
          </div>

          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  activeSection === section.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {section.icon}
                {section.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t space-y-2">
            <Button
              className="w-full"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar cambios
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(previewUrl, '_blank')}
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver tienda
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Branding Section */}
            {activeSection === 'branding' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-1">Marca e Identidad</h3>
                  <p className="text-muted-foreground">Configura el logo y nombre de tu tienda</p>
                </div>

                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <ImageUpload
                        value={config.logo}
                        onChange={(url) => updateConfig('logo', url)}
                        onUpload={(file) => handleUpload(file, 'logo')}
                        label="Logo principal"
                        hint="200x80px, PNG o SVG"
                        aspectRatio="aspect-[5/2]"
                      />
                      <ImageUpload
                        value={config.logoDark}
                        onChange={(url) => updateConfig('logoDark', url)}
                        onUpload={(file) => handleUpload(file, 'logo')}
                        label="Logo modo oscuro (opcional)"
                        hint="Para fondos oscuros"
                        aspectRatio="aspect-[5/2]"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nombre del negocio</Label>
                        <Input
                          value={config.brandName}
                          onChange={(e) => updateConfig('brandName', e.target.value)}
                          placeholder="Mi Tienda"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Eslogan (opcional)</Label>
                        <Input
                          value={config.slogan || ''}
                          onChange={(e) => updateConfig('slogan', e.target.value)}
                          placeholder="Tu frase característica"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Colors Section */}
            {activeSection === 'colors' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-1">Colores</h3>
                  <p className="text-muted-foreground">Personaliza la paleta de colores de tu tienda</p>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        { key: 'primaryColor', label: 'Color Primario', desc: 'Botones y acentos principales' },
                        { key: 'secondaryColor', label: 'Color Secundario', desc: 'Textos secundarios' },
                        { key: 'accentColor', label: 'Color de Acento', desc: 'Badges y destacados' },
                        { key: 'backgroundColor', label: 'Fondo', desc: 'Color de fondo de la página' },
                        { key: 'textColor', label: 'Texto', desc: 'Color del texto principal' },
                      ].map((color) => (
                        <div key={color.key} className="space-y-2">
                          <Label>{color.label}</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              className="w-12 h-10 p-1 cursor-pointer"
                              value={(config as any)[color.key]}
                              onChange={(e) => updateConfig(color.key as keyof TemplateConfig, e.target.value)}
                            />
                            <Input
                              type="text"
                              value={(config as any)[color.key]}
                              onChange={(e) => updateConfig(color.key as keyof TemplateConfig, e.target.value)}
                              className="flex-1 font-mono text-sm"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">{color.desc}</p>
                        </div>
                      ))}
                    </div>

                    {/* Preview */}
                    <div className="mt-8 p-6 rounded-lg border">
                      <h4 className="font-medium mb-4">Vista previa</h4>
                      <div className="p-4 rounded-lg" style={{ backgroundColor: config.backgroundColor }}>
                        <h5 className="font-bold text-lg mb-2" style={{ color: config.textColor }}>
                          Título de ejemplo
                        </h5>
                        <p className="text-sm mb-4" style={{ color: config.secondaryColor }}>
                          Texto secundario de ejemplo
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <button
                            className="px-4 py-2 rounded text-sm font-medium text-white"
                            style={{ backgroundColor: config.primaryColor }}
                          >
                            Botón Primario
                          </button>
                          <span
                            className="px-3 py-1 rounded text-xs font-medium text-white"
                            style={{ backgroundColor: config.accentColor }}
                          >
                            Badge
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Navigation Section */}
            {activeSection === 'navigation' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-1">Navegación</h3>
                  <p className="text-muted-foreground">Configura la barra superior, menú y opciones de navegación</p>
                </div>

                {/* Barra Superior */}
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted/50">
                        <div>
                          <span className="font-medium">Barra superior</span>
                          <p className="text-sm text-muted-foreground">Muestra un mensaje promocional</p>
                        </div>
                        <Checkbox
                          checked={config.topBarEnabled}
                          onCheckedChange={(checked) => updateConfig('topBarEnabled', !!checked)}
                        />
                      </label>

                      {config.topBarEnabled && (
                        <div className="pl-4 space-y-4">
                          <div className="space-y-2">
                            <Label>Texto de la barra</Label>
                            <Input
                              value={config.topBarText}
                              onChange={(e) => updateConfig('topBarText', e.target.value)}
                              placeholder="Envío gratis en compras mayores a S/199"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="h-px bg-border" />

                    <div className="space-y-3">
                      <h4 className="font-medium">Opciones de navegación</h4>
                      {[
                        { key: 'showSearch', label: 'Mostrar buscador' },
                        { key: 'showWishlist', label: 'Mostrar favoritos' },
                        { key: 'showCart', label: 'Mostrar carrito' },
                      ].map((option) => (
                        <label
                          key={option.key}
                          className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
                        >
                          <span>{option.label}</span>
                          <Checkbox
                            checked={(config as any)[option.key]}
                            onCheckedChange={(checked) => updateConfig(option.key as keyof TemplateConfig, !!checked)}
                          />
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Menú Principal */}
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Menú Principal</h4>
                        <p className="text-sm text-muted-foreground">Configura los enlaces del menú de navegación</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          const newMenu = [...(config.mainMenu || [])];
                          newMenu.push({
                            id: generateId(),
                            label: 'Nuevo enlace',
                            href: '/productos',
                          });
                          updateConfig('mainMenu', newMenu);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Agregar
                      </Button>
                    </div>

                    {/* Lista de items del menú */}
                    <div className="space-y-3">
                      {(config.mainMenu || []).map((item, index) => (
                        <Card key={item.id} className="relative">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2 text-destructive hover:text-destructive h-8 w-8 p-0"
                            onClick={() => {
                              const newMenu = config.mainMenu.filter((_, i) => i !== index);
                              updateConfig('mainMenu', newMenu);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>

                          <CardContent className="p-4 space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Texto del enlace</Label>
                                <Input
                                  value={item.label}
                                  onChange={(e) => {
                                    const newMenu = [...config.mainMenu];
                                    newMenu[index] = { ...newMenu[index], label: e.target.value };
                                    updateConfig('mainMenu', newMenu);
                                  }}
                                  placeholder="Ej: Catálogo"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>URL / Enlace</Label>
                                <Input
                                  value={item.href || ''}
                                  onChange={(e) => {
                                    const newMenu = [...config.mainMenu];
                                    newMenu[index] = { ...newMenu[index], href: e.target.value };
                                    updateConfig('mainMenu', newMenu);
                                  }}
                                  placeholder="/productos"
                                />
                              </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Badge (opcional)</Label>
                                <Input
                                  value={item.badge || ''}
                                  onChange={(e) => {
                                    const newMenu = [...config.mainMenu];
                                    newMenu[index] = { ...newMenu[index], badge: e.target.value };
                                    updateConfig('mainMenu', newMenu);
                                  }}
                                  placeholder="NEW, 🔥, etc."
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Color del badge</Label>
                                <div className="flex gap-2">
                                  <Input
                                    type="color"
                                    className="w-12 h-10 p-1 cursor-pointer"
                                    value={item.badgeColor || '#ff6b35'}
                                    onChange={(e) => {
                                      const newMenu = [...config.mainMenu];
                                      newMenu[index] = { ...newMenu[index], badgeColor: e.target.value };
                                      updateConfig('mainMenu', newMenu);
                                    }}
                                  />
                                  <Input
                                    value={item.badgeColor || '#ff6b35'}
                                    onChange={(e) => {
                                      const newMenu = [...config.mainMenu];
                                      newMenu[index] = { ...newMenu[index], badgeColor: e.target.value };
                                      updateConfig('mainMenu', newMenu);
                                    }}
                                    className="flex-1 font-mono text-sm"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Submenú */}
                            <div className="border-t pt-4 mt-4">
                              <div className="flex items-center justify-between mb-3">
                                <Label className="text-sm">Submenú (opcional)</Label>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const newMenu = [...config.mainMenu];
                                    const children = newMenu[index].children || [];
                                    children.push({
                                      id: generateId(),
                                      label: 'Nueva sección',
                                      children: [
                                        { id: generateId(), label: 'Enlace 1', href: '/productos' },
                                      ],
                                    });
                                    newMenu[index] = { ...newMenu[index], children, columns: Math.min(children.length, 4) };
                                    updateConfig('mainMenu', newMenu);
                                  }}
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Sección
                                </Button>
                              </div>

                              {item.children && item.children.length > 0 && (
                                <div className="space-y-3 pl-4 border-l-2 border-muted">
                                  {item.children.map((section, sectionIndex) => (
                                    <div key={section.id} className="bg-muted/30 p-3 rounded-lg space-y-3">
                                      <div className="flex items-center justify-between">
                                        <Input
                                          value={section.label}
                                          onChange={(e) => {
                                            const newMenu = [...config.mainMenu];
                                            const children = [...(newMenu[index].children || [])];
                                            children[sectionIndex] = { ...children[sectionIndex], label: e.target.value };
                                            newMenu[index] = { ...newMenu[index], children };
                                            updateConfig('mainMenu', newMenu);
                                          }}
                                          className="font-medium h-8 text-sm"
                                          placeholder="Nombre de sección"
                                        />
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="text-destructive h-8 w-8 p-0 ml-2"
                                          onClick={() => {
                                            const newMenu = [...config.mainMenu];
                                            const children = newMenu[index].children?.filter((_, i) => i !== sectionIndex) || [];
                                            newMenu[index] = { ...newMenu[index], children, columns: Math.min(children.length, 4) };
                                            updateConfig('mainMenu', newMenu);
                                          }}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>

                                      {/* Links de la sección */}
                                      <div className="space-y-2">
                                        {section.children?.map((link, linkIndex) => (
                                          <div key={link.id} className="flex items-center gap-2">
                                            <Input
                                              value={link.label}
                                              onChange={(e) => {
                                                const newMenu = [...config.mainMenu];
                                                const children = [...(newMenu[index].children || [])];
                                                const links = [...(children[sectionIndex].children || [])];
                                                links[linkIndex] = { ...links[linkIndex], label: e.target.value };
                                                children[sectionIndex] = { ...children[sectionIndex], children: links };
                                                newMenu[index] = { ...newMenu[index], children };
                                                updateConfig('mainMenu', newMenu);
                                              }}
                                              className="h-8 text-sm flex-1"
                                              placeholder="Texto"
                                            />
                                            <Input
                                              value={link.href}
                                              onChange={(e) => {
                                                const newMenu = [...config.mainMenu];
                                                const children = [...(newMenu[index].children || [])];
                                                const links = [...(children[sectionIndex].children || [])];
                                                links[linkIndex] = { ...links[linkIndex], href: e.target.value };
                                                children[sectionIndex] = { ...children[sectionIndex], children: links };
                                                newMenu[index] = { ...newMenu[index], children };
                                                updateConfig('mainMenu', newMenu);
                                              }}
                                              className="h-8 text-sm w-32"
                                              placeholder="/url"
                                            />
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="text-destructive h-8 w-8 p-0"
                                              onClick={() => {
                                                const newMenu = [...config.mainMenu];
                                                const children = [...(newMenu[index].children || [])];
                                                const links = children[sectionIndex].children?.filter((_, i) => i !== linkIndex) || [];
                                                children[sectionIndex] = { ...children[sectionIndex], children: links };
                                                newMenu[index] = { ...newMenu[index], children };
                                                updateConfig('mainMenu', newMenu);
                                              }}
                                            >
                                              <X className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        ))}
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 text-xs w-full"
                                          onClick={() => {
                                            const newMenu = [...config.mainMenu];
                                            const children = [...(newMenu[index].children || [])];
                                            const links = [...(children[sectionIndex].children || [])];
                                            links.push({ id: generateId(), label: 'Nuevo enlace', href: '/productos' });
                                            children[sectionIndex] = { ...children[sectionIndex], children: links };
                                            newMenu[index] = { ...newMenu[index], children };
                                            updateConfig('mainMenu', newMenu);
                                          }}
                                        >
                                          <Plus className="w-3 h-3 mr-1" />
                                          Agregar enlace
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {(!config.mainMenu || config.mainMenu.length === 0) && (
                        <div className="text-center py-8 border-2 border-dashed rounded-lg">
                          <Navigation className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                          <p className="text-sm text-muted-foreground">No hay elementos en el menú</p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() => {
                              updateConfig('mainMenu', [
                                { id: generateId(), label: 'Catálogo', href: '/productos' },
                              ]);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Crear menú
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Vista previa del menú */}
                    {config.mainMenu && config.mainMenu.length > 0 && (
                      <div className="mt-6 p-4 rounded-lg bg-muted/30 border">
                        <h4 className="font-medium mb-3 text-sm text-muted-foreground">Vista previa</h4>
                        <div className="flex items-center gap-4 flex-wrap">
                          {config.mainMenu.map((item) => (
                            <div key={item.id} className="flex items-center gap-1 text-sm">
                              <span className="font-medium">{item.label}</span>
                              {item.badge && (
                                <span
                                  className="text-xs font-bold"
                                  style={{ color: item.badgeColor || '#ff6b35' }}
                                >
                                  {item.badge}
                                </span>
                              )}
                              {item.children && item.children.length > 0 && (
                                <ChevronRight className="w-3 h-3 text-muted-foreground" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Hero Section */}
            {activeSection === 'hero' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-1">Hero / Portada</h3>
                  <p className="text-muted-foreground">Configura el slider principal de tu tienda</p>
                </div>

                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tipo de hero</Label>
                        <select
                          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                          value={config.heroType}
                          onChange={(e) => updateConfig('heroType', e.target.value as 'slider' | 'video' | 'minimal')}
                        >
                          <option value="slider">Slider de imágenes</option>
                          <option value="minimal">Minimalista</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Altura</Label>
                        <select
                          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                          value={config.heroHeight}
                          onChange={(e) => updateConfig('heroHeight', e.target.value)}
                        >
                          <option value="60vh">Pequeño (60vh)</option>
                          <option value="75vh">Mediano (75vh)</option>
                          <option value="85vh">Grande (85vh)</option>
                          <option value="100vh">Pantalla completa</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        { key: 'heroAutoplay', label: 'Reproducción automática' },
                        { key: 'heroShowArrows', label: 'Mostrar flechas de navegación' },
                        { key: 'heroShowDots', label: 'Mostrar indicadores (dots)' },
                      ].map((option) => (
                        <label
                          key={option.key}
                          className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
                        >
                          <span>{option.label}</span>
                          <Checkbox
                            checked={(config as any)[option.key]}
                            onCheckedChange={(checked) => updateConfig(option.key as keyof TemplateConfig, !!checked)}
                          />
                        </label>
                      ))}
                    </div>

                    {config.heroAutoplay && (
                      <div className="space-y-2">
                        <Label>Velocidad del autoplay (ms)</Label>
                        <Input
                          type="number"
                          min="2000"
                          max="10000"
                          step="500"
                          value={config.heroAutoplaySpeed}
                          onChange={(e) => updateConfig('heroAutoplaySpeed', parseInt(e.target.value) || 5000)}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Slides */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Slides</h4>
                    <Button
                      size="sm"
                      onClick={() => {
                        updateConfig('heroSlides', [
                          ...config.heroSlides,
                          {
                            id: generateId(),
                            image: '',
                            title: '',
                            subtitle: '',
                            ctaText: 'Comprar',
                            ctaLink: '/productos',
                            position: 'center',
                            overlayOpacity: 30,
                          },
                        ]);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar slide
                    </Button>
                  </div>

                  {config.heroSlides.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="p-8 text-center">
                        <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground">No hay slides configurados</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3"
                          onClick={() => {
                            updateConfig('heroSlides', [{
                              id: generateId(),
                              image: '',
                              title: 'Tu Título Aquí',
                              subtitle: 'Subtítulo opcional',
                              ctaText: 'Comprar',
                              ctaLink: '/productos',
                              position: 'center',
                              overlayOpacity: 30,
                            }]);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Crear primer slide
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {config.heroSlides.map((slide, index) => (
                        <HeroSlideEditor
                          key={slide.id}
                          slide={slide}
                          onChange={(updated) => {
                            const newSlides = [...config.heroSlides];
                            newSlides[index] = updated;
                            updateConfig('heroSlides', newSlides);
                          }}
                          onDelete={() => {
                            updateConfig('heroSlides', config.heroSlides.filter((_, i) => i !== index));
                          }}
                          onUpload={(file) => handleUpload(file, 'hero')}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Banners Section */}
            {activeSection === 'banners' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-1">Banners Promocionales</h3>
                  <p className="text-muted-foreground">Agrega banners para destacar colecciones o promociones</p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {config.promoBanners.length} banner{config.promoBanners.length !== 1 && 's'} configurado{config.promoBanners.length !== 1 && 's'}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => {
                      updateConfig('promoBanners', [
                        ...config.promoBanners,
                        {
                          id: generateId(),
                          image: '',
                          title: 'Nuevo Banner',
                          ctaText: 'Comprar',
                          ctaLink: '/productos',
                        },
                      ]);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar banner
                  </Button>
                </div>

                {config.promoBanners.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center">
                      <Columns className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">No hay banners configurados</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Los banners aparecerán entre las secciones de productos
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {config.promoBanners.map((banner, index) => (
                      <PromoBannerEditor
                        key={banner.id}
                        banner={banner}
                        onChange={(updated) => {
                          const newBanners = [...config.promoBanners];
                          newBanners[index] = updated;
                          updateConfig('promoBanners', newBanners);
                        }}
                        onDelete={() => {
                          updateConfig('promoBanners', config.promoBanners.filter((_, i) => i !== index));
                        }}
                        onUpload={(file) => handleUpload(file, 'banner')}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Products Section */}
            {activeSection === 'products' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-1">Secciones de Productos</h3>
                  <p className="text-muted-foreground">Configura las secciones de productos en tu página principal</p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {config.productSections.length} sección{config.productSections.length !== 1 && 'es'}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => {
                      updateConfig('productSections', [
                        ...config.productSections,
                        {
                          id: generateId(),
                          type: 'grid',
                          title: 'Nueva Sección',
                          subtitle: '',
                          filter: 'all',
                          limit: 8,
                          showViewAll: true,
                        },
                      ]);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar sección
                  </Button>
                </div>

                <div className="space-y-4">
                  {config.productSections.map((section, index) => (
                    <ProductSectionEditor
                      key={section.id}
                      section={section}
                      onChange={(updated) => {
                        const newSections = [...config.productSections];
                        newSections[index] = updated;
                        updateConfig('productSections', newSections);
                      }}
                      onDelete={() => {
                        updateConfig('productSections', config.productSections.filter((_, i) => i !== index));
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Features Section */}
            {activeSection === 'features' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-1">Características / USP</h3>
                  <p className="text-muted-foreground">Muestra las ventajas de comprar en tu tienda</p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {config.features.length} característica{config.features.length !== 1 && 's'}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => {
                      updateConfig('features', [
                        ...config.features,
                        {
                          id: generateId(),
                          icon: '✨',
                          title: 'Nueva característica',
                          description: 'Descripción',
                        },
                      ]);
                    }}
                    disabled={config.features.length >= 6}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar
                  </Button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {config.features.map((feature, index) => (
                    <FeatureEditor
                      key={feature.id}
                      feature={feature}
                      onChange={(updated) => {
                        const newFeatures = [...config.features];
                        newFeatures[index] = updated;
                        updateConfig('features', newFeatures);
                      }}
                      onDelete={() => {
                        updateConfig('features', config.features.filter((_, i) => i !== index));
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Footer Section */}
            {activeSection === 'footer' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-1">Footer</h3>
                  <p className="text-muted-foreground">Configura el pie de página de tu tienda</p>
                </div>

                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Color de fondo</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            className="w-12 h-10 p-1 cursor-pointer"
                            value={config.footerBackgroundColor}
                            onChange={(e) => updateConfig('footerBackgroundColor', e.target.value)}
                          />
                          <Input
                            value={config.footerBackgroundColor}
                            onChange={(e) => updateConfig('footerBackgroundColor', e.target.value)}
                            className="flex-1 font-mono text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Color de texto</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            className="w-12 h-10 p-1 cursor-pointer"
                            value={config.footerTextColor}
                            onChange={(e) => updateConfig('footerTextColor', e.target.value)}
                          />
                          <Input
                            value={config.footerTextColor}
                            onChange={(e) => updateConfig('footerTextColor', e.target.value)}
                            className="flex-1 font-mono text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Copyright</Label>
                      <Input
                        value={config.footerCopyright}
                        onChange={(e) => updateConfig('footerCopyright', e.target.value)}
                        placeholder="© 2024 Mi Tienda. Todos los derechos reservados."
                      />
                    </div>

                    <div className="space-y-3">
                      {[
                        { key: 'footerShowSocial', label: 'Mostrar redes sociales' },
                        { key: 'footerShowNewsletter', label: 'Mostrar formulario de newsletter' },
                      ].map((option) => (
                        <label
                          key={option.key}
                          className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
                        >
                          <span>{option.label}</span>
                          <Checkbox
                            checked={(config as any)[option.key]}
                            onCheckedChange={(checked) => updateConfig(option.key as keyof TemplateConfig, !!checked)}
                          />
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Shipping Section */}
            {activeSection === 'shipping' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-1">Configuración de Envíos</h3>
                  <p className="text-muted-foreground">Define costos de envío y zonas de cobertura</p>
                </div>

                {/* General Shipping Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Costos de Envío</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={config.shippingEnabled !== false}
                        onCheckedChange={(checked) => updateConfig('shippingEnabled', !!checked)}
                      />
                      <span>Habilitar envíos a domicilio</span>
                    </label>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Envío local (Lima)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">S/</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            className="pl-9"
                            value={config.shippingLocalCost || ''}
                            onChange={(e) => updateConfig('shippingLocalCost', parseFloat(e.target.value) || 0)}
                            placeholder="10.00"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Envío nacional (Provincias)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">S/</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            className="pl-9"
                            value={config.shippingNationalCost || ''}
                            onChange={(e) => updateConfig('shippingNationalCost', parseFloat(e.target.value) || 0)}
                            placeholder="20.00"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Envío internacional</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            className="pl-9"
                            value={config.shippingInternationalCost || ''}
                            onChange={(e) => updateConfig('shippingInternationalCost', parseFloat(e.target.value) || 0)}
                            placeholder="50.00"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Envío gratis a partir de (S/)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">S/</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          className="pl-9"
                          value={config.freeShippingThreshold || ''}
                          onChange={(e) => updateConfig('freeShippingThreshold', parseFloat(e.target.value) || 0)}
                          placeholder="199.00"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Deja en 0 si no ofreces envío gratis. Este monto aplica solo para envíos locales.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Pickup Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recojo en Tienda</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={config.pickupEnabled !== false}
                        onCheckedChange={(checked) => updateConfig('pickupEnabled', !!checked)}
                      />
                      <span>Permitir recojo en tienda (sin costo de envío)</span>
                    </label>

                    {config.pickupEnabled !== false && (
                      <>
                        <div className="space-y-2">
                          <Label>Dirección de recojo</Label>
                          <Input
                            value={config.pickupAddress || ''}
                            onChange={(e) => updateConfig('pickupAddress', e.target.value)}
                            placeholder="Av. Principal 123, Lima"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Horario de recojo</Label>
                          <Input
                            value={config.pickupHours || ''}
                            onChange={(e) => updateConfig('pickupHours', e.target.value)}
                            placeholder="Lunes a Sábado: 10am - 7pm"
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Shipping Zones */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Zonas de Envío Personalizadas</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newZone = {
                          id: generateId(),
                          name: 'Nueva Zona',
                          districts: [],
                          cost: 15,
                        };
                        updateConfig('shippingZones', [...(config.shippingZones || []), newZone]);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar zona
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {!config.shippingZones?.length ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        No hay zonas personalizadas. Usa los costos generales o agrega zonas específicas.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {config.shippingZones.map((zone, index) => (
                          <div key={zone.id} className="p-4 border rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                              <Input
                                value={zone.name}
                                onChange={(e) => {
                                  const zones = [...(config.shippingZones || [])];
                                  zones[index] = { ...zone, name: e.target.value };
                                  updateConfig('shippingZones', zones);
                                }}
                                placeholder="Nombre de zona (ej: Lima Norte)"
                                className="max-w-xs"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => {
                                  const zones = (config.shippingZones || []).filter((_, i) => i !== index);
                                  updateConfig('shippingZones', zones);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Distritos (separados por coma)</Label>
                                <Input
                                  value={zone.districts.join(', ')}
                                  onChange={(e) => {
                                    const zones = [...(config.shippingZones || [])];
                                    zones[index] = {
                                      ...zone,
                                      districts: e.target.value.split(',').map(d => d.trim()).filter(Boolean)
                                    };
                                    updateConfig('shippingZones', zones);
                                  }}
                                  placeholder="San Isidro, Miraflores, Surco"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Costo de envío</Label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">S/</span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="pl-9"
                                    value={zone.cost}
                                    onChange={(e) => {
                                      const zones = [...(config.shippingZones || [])];
                                      zones[index] = { ...zone, cost: parseFloat(e.target.value) || 0 };
                                      updateConfig('shippingZones', zones);
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Payment Section */}
            {activeSection === 'payment' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-1">Métodos de Pago</h3>
                  <p className="text-muted-foreground">Configura los métodos de pago que aceptas</p>
                </div>

                {/* Payment Methods */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Métodos Habilitados</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { key: 'cash', label: 'Efectivo contra entrega', description: 'El cliente paga al recibir' },
                      { key: 'transfer', label: 'Transferencia bancaria', description: 'Pago por depósito o transferencia' },
                      { key: 'yape', label: 'Yape', description: 'Pago con billetera Yape' },
                      { key: 'plin', label: 'Plin', description: 'Pago con billetera Plin' },
                      { key: 'card', label: 'Tarjeta de crédito/débito', description: 'Visa, Mastercard (requiere integración)' },
                    ].map((method) => (
                      <label key={method.key} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <Checkbox
                          checked={(config.paymentMethods as any)?.[method.key] !== false}
                          onCheckedChange={(checked) => {
                            updateConfig('paymentMethods', {
                              ...config.paymentMethods,
                              [method.key]: !!checked,
                            } as any);
                          }}
                          className="mt-0.5"
                        />
                        <div>
                          <span className="font-medium block">{method.label}</span>
                          <span className="text-sm text-muted-foreground">{method.description}</span>
                        </div>
                      </label>
                    ))}
                  </CardContent>
                </Card>

                {/* Yape/Plin Numbers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Billeteras Digitales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Número Yape</Label>
                        <Input
                          value={config.yapeNumber || ''}
                          onChange={(e) => updateConfig('yapeNumber', e.target.value)}
                          placeholder="999 999 999"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Número Plin</Label>
                        <Input
                          value={config.plinNumber || ''}
                          onChange={(e) => updateConfig('plinNumber', e.target.value)}
                          placeholder="999 999 999"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bank Accounts */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Cuentas Bancarias</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newAccount = {
                          id: generateId(),
                          bank: '',
                          accountType: 'Ahorros',
                          accountNumber: '',
                          cci: '',
                          holder: '',
                        };
                        updateConfig('bankAccounts', [...(config.bankAccounts || []), newAccount]);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar cuenta
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {!config.bankAccounts?.length ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        No hay cuentas bancarias configuradas.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {config.bankAccounts.map((account, index) => (
                          <div key={account.id} className="p-4 border rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{account.bank || 'Nueva cuenta'}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => {
                                  const accounts = (config.bankAccounts || []).filter((_, i) => i !== index);
                                  updateConfig('bankAccounts', accounts);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Banco</Label>
                                <select
                                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                  value={account.bank}
                                  onChange={(e) => {
                                    const accounts = [...(config.bankAccounts || [])];
                                    accounts[index] = { ...account, bank: e.target.value };
                                    updateConfig('bankAccounts', accounts);
                                  }}
                                >
                                  <option value="">Seleccionar banco</option>
                                  <option value="BCP">BCP</option>
                                  <option value="Interbank">Interbank</option>
                                  <option value="BBVA">BBVA</option>
                                  <option value="Scotiabank">Scotiabank</option>
                                  <option value="BanBif">BanBif</option>
                                  <option value="Otro">Otro</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <Label>Tipo de cuenta</Label>
                                <select
                                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                  value={account.accountType}
                                  onChange={(e) => {
                                    const accounts = [...(config.bankAccounts || [])];
                                    accounts[index] = { ...account, accountType: e.target.value };
                                    updateConfig('bankAccounts', accounts);
                                  }}
                                >
                                  <option value="Ahorros">Ahorros</option>
                                  <option value="Corriente">Corriente</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <Label>Número de cuenta</Label>
                                <Input
                                  value={account.accountNumber}
                                  onChange={(e) => {
                                    const accounts = [...(config.bankAccounts || [])];
                                    accounts[index] = { ...account, accountNumber: e.target.value };
                                    updateConfig('bankAccounts', accounts);
                                  }}
                                  placeholder="XXX-XXXXXXX-X-XX"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>CCI (opcional)</Label>
                                <Input
                                  value={account.cci || ''}
                                  onChange={(e) => {
                                    const accounts = [...(config.bankAccounts || [])];
                                    accounts[index] = { ...account, cci: e.target.value };
                                    updateConfig('bankAccounts', accounts);
                                  }}
                                  placeholder="002-XXX-XXXXXXX-X-XX"
                                />
                              </div>
                              <div className="space-y-2 sm:col-span-2">
                                <Label>Titular de la cuenta</Label>
                                <Input
                                  value={account.holder}
                                  onChange={(e) => {
                                    const accounts = [...(config.bankAccounts || [])];
                                    accounts[index] = { ...account, holder: e.target.value };
                                    updateConfig('bankAccounts', accounts);
                                  }}
                                  placeholder="Nombre completo del titular"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Contact Section */}
            {activeSection === 'contact' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-1">Información de Contacto</h3>
                  <p className="text-muted-foreground">Datos de contacto y redes sociales</p>
                </div>

                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Teléfono</Label>
                        <Input
                          value={config.phone || ''}
                          onChange={(e) => updateConfig('phone', e.target.value)}
                          placeholder="+51 999 999 999"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>WhatsApp</Label>
                        <Input
                          value={config.whatsapp || ''}
                          onChange={(e) => updateConfig('whatsapp', e.target.value)}
                          placeholder="+51 999 999 999"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={config.email || ''}
                        onChange={(e) => updateConfig('email', e.target.value)}
                        placeholder="contacto@tienda.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Dirección</Label>
                      <Input
                        value={config.address || ''}
                        onChange={(e) => updateConfig('address', e.target.value)}
                        placeholder="Av. Principal 123, Lima"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Horario de atención</Label>
                      <Input
                        value={config.businessHours || ''}
                        onChange={(e) => updateConfig('businessHours', e.target.value)}
                        placeholder="Lun-Sab: 9am - 8pm"
                      />
                    </div>

                    <div className="h-px bg-border" />

                    <h4 className="font-medium">Redes Sociales</h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { key: 'instagram', label: 'Instagram', placeholder: '@mitienda' },
                        { key: 'facebook', label: 'Facebook', placeholder: 'facebook.com/mitienda' },
                        { key: 'tiktok', label: 'TikTok', placeholder: '@mitienda' },
                        { key: 'youtube', label: 'YouTube', placeholder: 'youtube.com/@mitienda' },
                        { key: 'twitter', label: 'Twitter / X', placeholder: '@mitienda' },
                      ].map((social) => (
                        <div key={social.key} className="space-y-2">
                          <Label>{social.label}</Label>
                          <Input
                            value={(config as any)[social.key] || ''}
                            onChange={(e) => updateConfig(social.key as keyof TemplateConfig, e.target.value)}
                            placeholder={social.placeholder}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* SEO Section */}
            {activeSection === 'seo' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-1">SEO</h3>
                  <p className="text-muted-foreground">Optimiza tu tienda para motores de búsqueda</p>
                </div>

                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Label>Título de la página (Meta Title)</Label>
                      <Input
                        value={config.metaTitle || ''}
                        onChange={(e) => updateConfig('metaTitle', e.target.value)}
                        placeholder="Mi Tienda - Los mejores productos"
                      />
                      <p className="text-xs text-muted-foreground">Recomendado: 50-60 caracteres</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Descripción (Meta Description)</Label>
                      <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={config.metaDescription || ''}
                        onChange={(e) => updateConfig('metaDescription', e.target.value)}
                        placeholder="Descripción de tu tienda para Google..."
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground">Recomendado: 150-160 caracteres</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Palabras clave (Keywords)</Label>
                      <Input
                        value={config.metaKeywords || ''}
                        onChange={(e) => updateConfig('metaKeywords', e.target.value)}
                        placeholder="tienda, productos, ofertas"
                      />
                      <p className="text-xs text-muted-foreground">Separa las palabras clave con comas</p>
                    </div>

                    {/* Google Preview */}
                    <div className="mt-6 p-4 rounded-lg bg-muted/30 border">
                      <h4 className="font-medium mb-3 text-sm text-muted-foreground">Vista previa en Google</h4>
                      <div className="space-y-1">
                        <p className="text-blue-600 text-lg hover:underline cursor-pointer">
                          {config.metaTitle || config.brandName || 'Título de tu tienda'}
                        </p>
                        <p className="text-green-700 text-sm">tribio.info/{accountSlug}/tienda</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {config.metaDescription || 'Descripción de tu tienda...'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
