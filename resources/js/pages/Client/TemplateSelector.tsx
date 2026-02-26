/**
 * Selector de Plantillas - Dashboard del Cliente
 * Permite elegir entre plantillas de perfil personal y plantillas de tienda eCommerce
 */

import React, { useState, useEffect, useRef } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
  User,
  ShoppingBag,
  Sparkles,
  Check,
  Eye,
  ArrowRight,
  Crown,
  Zap,
  Store,
  Palette,
  Settings,
  Save,
  X,
  Code,
  Image,
  Type,
  Link2,
  Phone,
  MapPin,
  Clock,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Plantillas', href: '/settings/templates' },
];

// Tipos
interface Template {
  id: number | string;
  name: string;
  slug: string;
  description: string;
  preview_image: string | null;
  category: string;
  is_premium: boolean;
  features: string[];
  best_for?: string[];
  config?: Record<string, any>;
  type?: 'personal' | 'store';
}

interface TemplateConfig {
  logo?: string;
  coverImage?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  businessName?: string;
  tagline?: string;
  description?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  businessHours?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  showWhatsappButton?: boolean;
  showSocialLinks?: boolean;
  showReviews?: boolean;
  showGallery?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

interface Props {
  personalTemplates?: Template[];
  storeTemplates?: Template[];
  activeTemplateId?: number | null;
  activeStoreTemplateId?: number | null;
  customizations?: Record<string, any> | null;
  accountSlug?: string;
  account?: {
    id: number;
    name: string;
    slug: string;
    business_type?: {
      slug: string;
    };
  };
}

// Plantillas de perfil personal predefinidas (fallback)
const defaultPersonalTemplates: Template[] = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    slug: 'modern-minimal',
    description: 'Diseño limpio y minimalista con animaciones sutiles',
    preview_image: null,
    category: 'personal',
    is_premium: false,
    features: ['Animaciones suaves', 'Modo oscuro', 'Stories integrados', 'Galería de posts'],
    best_for: ['Profesionales', 'Freelancers', 'Consultores'],
  },
  {
    id: 'tribio',
    name: 'TRIBIO Tech',
    slug: 'tribio',
    description: 'Perfil moderno con estilo tecnológico y profesional',
    preview_image: null,
    category: 'personal',
    is_premium: false,
    features: ['Diseño futurista', 'Efectos de partículas', 'Sección de portafolio', 'Formulario de contacto'],
    best_for: ['Tech', 'Startups', 'Desarrolladores'],
  },
  {
    id: 'classic-barber',
    name: 'Classic Barber',
    slug: 'classic-barber',
    description: 'Estilo clásico y elegante perfecto para barberías',
    preview_image: null,
    category: 'personal',
    is_premium: false,
    features: ['Sistema de citas', 'Lista de servicios', 'Galería de trabajos', 'Horarios'],
    best_for: ['Barberías', 'Salones de belleza', 'Spas'],
  },
  {
    id: 'wellness-coach',
    name: 'Wellness Coach',
    slug: 'wellness-coach',
    description: 'Diseño tranquilo y profesional para coaches y terapeutas',
    preview_image: null,
    category: 'personal',
    is_premium: true,
    features: ['Agenda de sesiones', 'Testimonios', 'Blog integrado', 'Paquetes de servicios'],
    best_for: ['Coaches', 'Terapeutas', 'Nutricionistas'],
  },
  {
    id: 'natural-cafe',
    name: 'Natural Café',
    slug: 'natural-cafe',
    description: 'Estilo cálido y natural ideal para cafeterías y restaurantes',
    preview_image: null,
    category: 'personal',
    is_premium: false,
    features: ['Menú digital', 'Galería de productos', 'Ubicación con mapa', 'Reservaciones'],
    best_for: ['Cafeterías', 'Restaurantes', 'Food trucks'],
  },
  {
    id: 'personal-3d',
    name: 'Personal 3D',
    slug: 'personal-3d',
    description: 'Perfil con efectos 3D y diseño premium',
    preview_image: null,
    category: 'personal',
    is_premium: true,
    features: ['Efecto tilt 3D', 'Animaciones avanzadas', 'Badge verificado', 'Galería premium'],
    best_for: ['Influencers', 'Artistas', 'Creadores de contenido'],
  },
];


// Configuración por defecto
const defaultConfig: TemplateConfig = {
  primaryColor: '#f97316',
  secondaryColor: '#1f2937',
  accentColor: '#10b981',
  backgroundColor: '#ffffff',
  textColor: '#111827',
  showWhatsappButton: true,
  showSocialLinks: true,
  showReviews: true,
  showGallery: true,
};

// Componente de notificación simple
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
      {type === 'success' ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <AlertCircle className="w-5 h-5" />
      )}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Componente de tarjeta de plantilla
const TemplateCard: React.FC<{
  template: Template;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onEditPage?: () => void; // Para ir a la página de edición (tiendas)
}> = ({ template, isSelected, onSelect, onEdit, onEditPage }) => {
  const isStoreTemplate = template.category === 'store';

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300 cursor-pointer group border-2',
        isSelected ? 'border-primary shadow-lg shadow-primary/20' : 'border-transparent hover:border-muted-foreground/20 hover:shadow-md'
      )}
      onClick={onSelect}
    >
      {/* Preview Image */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {template.preview_image ? (
          <img
            src={template.preview_image}
            alt={template.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            {template.category !== 'store' ? (
              <User className="w-16 h-16 text-muted-foreground/50" />
            ) : (
              <Store className="w-16 h-16 text-muted-foreground/50" />
            )}
          </div>
        )}

        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Button
            size="sm"
            variant="default"
            className="bg-primary hover:bg-primary/90"
            onClick={(e) => {
              e.stopPropagation();
              // Para tiendas, ir a la página de edición completa
              if (isStoreTemplate && onEditPage) {
                onEditPage();
              } else {
                onEdit();
              }
            }}
          >
            <Settings className="w-4 h-4 mr-2" />
            Editar Diseño
          </Button>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {template.is_premium && (
            <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 shadow-md">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute top-3 right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
            <Check className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {template.description}
        </p>

        {/* Features preview */}
        <div className="flex flex-wrap gap-1.5">
          {template.features.slice(0, 3).map((feature, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs font-normal">
              {feature}
            </Badge>
          ))}
          {template.features.length > 3 && (
            <Badge variant="outline" className="text-xs font-normal">
              +{template.features.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Modal de edición de plantilla con configuraciones generales
const TemplateEditModal: React.FC<{
  template: Template | null;
  config: TemplateConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: TemplateConfig) => void;
  onSelect: () => void;
  isSelected: boolean;
  onNotify: (type: 'success' | 'error', message: string) => void;
}> = ({ template, config, isOpen, onClose, onSave, onSelect, isSelected, onNotify }) => {
  const [localConfig, setLocalConfig] = useState<TemplateConfig>(config);
  const [activeConfigTab, setActiveConfigTab] = useState<'general' | 'colors' | 'contact' | 'features' | 'seo'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const updateConfig = (key: keyof TemplateConfig, value: any) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setIsSaving(true);
    onSave(localConfig);
    setIsSaving(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (2MB)
    if (file.size > 2 * 1024 * 1024) {
      onNotify('error', 'El logo no debe superar 2MB');
      return;
    }

    setIsUploadingLogo(true);
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await fetch('/settings/templates/upload-logo', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      const data = await response.json();
      if (data.success) {
        updateConfig('logo', data.url);
        onNotify('success', 'Logo subido correctamente');
      } else {
        onNotify('error', 'Error al subir el logo');
      }
    } catch (error) {
      onNotify('error', 'Error al subir el logo');
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      onNotify('error', 'La imagen de portada no debe superar 5MB');
      return;
    }

    setIsUploadingCover(true);
    const formData = new FormData();
    formData.append('cover', file);

    try {
      const response = await fetch('/settings/templates/upload-cover', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      const data = await response.json();
      if (data.success) {
        updateConfig('coverImage', data.url);
        onNotify('success', 'Imagen de portada subida correctamente');
      } else {
        onNotify('error', 'Error al subir la imagen de portada');
      }
    } catch (error) {
      onNotify('error', 'Error al subir la imagen de portada');
    } finally {
      setIsUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  if (!template) return null;

  const configTabs = [
    { id: 'general', label: 'General', icon: Image },
    { id: 'colors', label: 'Colores', icon: Palette },
    { id: 'contact', label: 'Contacto', icon: Phone },
    { id: 'features', label: 'Funciones', icon: Settings },
    { id: 'seo', label: 'SEO', icon: Code },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                {template.name}
                {template.is_premium && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="mt-1">{template.description}</DialogDescription>
            </div>
            {!isSelected && (
              <Button onClick={onSelect} variant="outline">
                Seleccionar plantilla
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {/* Sidebar de configuración */}
          <div className="w-56 border-r bg-muted/20 flex flex-col shrink-0">
            <div className="p-3 space-y-1">
              {configTabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeConfigTab === tab.id ? 'secondary' : 'ghost'}
                  className="w-full justify-start text-sm"
                  onClick={() => setActiveConfigTab(tab.id as any)}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Info de características */}
            <div className="mt-auto p-3 border-t">
              <h4 className="text-xs font-medium mb-2 text-muted-foreground">Características</h4>
              <div className="space-y-1">
                {template.features.slice(0, 4).map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="w-3 h-3 text-green-500 shrink-0" />
                    <span className="truncate">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* General */}
            {activeConfigTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    Imágenes y Branding
                  </h3>

                  <div className="space-y-6">
                    {/* Logo */}
                    <div className="space-y-2">
                      <Label>Logo de tu negocio</Label>
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/30 overflow-hidden shrink-0 cursor-pointer transition-colors",
                            isUploadingLogo ? "border-primary/50" : "border-muted-foreground/30 hover:border-primary/50"
                          )}
                          onClick={() => !isUploadingLogo && logoInputRef.current?.click()}
                        >
                          {isUploadingLogo ? (
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                          ) : localConfig.logo ? (
                            <img src={localConfig.logo} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            <Upload className="w-6 h-6 text-muted-foreground/50" />
                          )}
                        </div>
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/gif,image/svg+xml,image/webp"
                          className="hidden"
                          onChange={handleLogoUpload}
                        />
                        <div className="flex-1 space-y-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => logoInputRef.current?.click()}
                            disabled={isUploadingLogo}
                          >
                            {isUploadingLogo ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Subiendo...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Subir logo
                              </>
                            )}
                          </Button>
                          {localConfig.logo && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => updateConfig('logo', '')}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </Button>
                          )}
                          <p className="text-xs text-muted-foreground">200x200px, PNG, JPG o SVG. Máx 2MB</p>
                        </div>
                      </div>
                    </div>

                    {/* Cover Image */}
                    <div className="space-y-2">
                      <Label>Imagen de portada</Label>
                      <div
                        className={cn(
                          "w-full h-32 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/30 overflow-hidden mb-2 cursor-pointer transition-colors",
                          isUploadingCover ? "border-primary/50" : "border-muted-foreground/30 hover:border-primary/50"
                        )}
                        onClick={() => !isUploadingCover && coverInputRef.current?.click()}
                      >
                        {isUploadingCover ? (
                          <div className="text-center">
                            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-1" />
                            <span className="text-xs text-muted-foreground">Subiendo...</span>
                          </div>
                        ) : localConfig.coverImage ? (
                          <img src={localConfig.coverImage} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center">
                            <Upload className="w-8 h-8 text-muted-foreground/50 mx-auto mb-1" />
                            <span className="text-xs text-muted-foreground">Click para subir (1920x600px)</span>
                          </div>
                        )}
                      </div>
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                        className="hidden"
                        onChange={handleCoverUpload}
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => coverInputRef.current?.click()}
                          disabled={isUploadingCover}
                        >
                          {isUploadingCover ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Subiendo...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Subir portada
                            </>
                          )}
                        </Button>
                        {localConfig.coverImage && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => updateConfig('coverImage', '')}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Recomendado: 1920x600px. Máx 5MB</p>
                    </div>

                    <div className="h-px bg-border my-4" />

                    {/* Textos principales */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        Textos principales
                      </h4>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Nombre del negocio</Label>
                          <Input
                            placeholder="Mi Negocio"
                            value={localConfig.businessName || ''}
                            onChange={(e) => updateConfig('businessName', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Eslogan / Tagline</Label>
                          <Input
                            placeholder="Tu frase característica"
                            value={localConfig.tagline || ''}
                            onChange={(e) => updateConfig('tagline', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Descripción breve</Label>
                          <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Describe tu negocio..."
                            value={localConfig.description || ''}
                            onChange={(e) => updateConfig('description', e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Colores */}
            {activeConfigTab === 'colors' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Esquema de colores
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { key: 'primaryColor', label: 'Color Primario', desc: 'Botones y acentos', default: '#f97316' },
                    { key: 'secondaryColor', label: 'Color Secundario', desc: 'Headers y footers', default: '#1f2937' },
                    { key: 'accentColor', label: 'Color de Acento', desc: 'Badges y destacados', default: '#10b981' },
                    { key: 'backgroundColor', label: 'Color de Fondo', desc: 'Fondo de la página', default: '#ffffff' },
                    { key: 'textColor', label: 'Color de Texto', desc: 'Textos y párrafos', default: '#111827' },
                  ].map((color) => (
                    <div key={color.key} className="space-y-2">
                      <Label>{color.label}</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          className="w-12 h-10 p-1 cursor-pointer"
                          value={(localConfig as any)[color.key] || color.default}
                          onChange={(e) => updateConfig(color.key as keyof TemplateConfig, e.target.value)}
                        />
                        <Input
                          type="text"
                          value={(localConfig as any)[color.key] || color.default}
                          onChange={(e) => updateConfig(color.key as keyof TemplateConfig, e.target.value)}
                          className="flex-1 font-mono text-sm"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{color.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Preview de colores */}
                <div className="mt-6 p-4 rounded-lg border">
                  <h4 className="font-medium mb-3 text-sm">Vista previa</h4>
                  <div
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: localConfig.backgroundColor || '#ffffff' }}
                  >
                    <h5
                      className="font-bold text-lg mb-2"
                      style={{ color: localConfig.textColor || '#111827' }}
                    >
                      Título de ejemplo
                    </h5>
                    <p
                      className="text-sm mb-3"
                      style={{ color: localConfig.textColor || '#111827', opacity: 0.7 }}
                    >
                      Texto de ejemplo para ver los colores.
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        className="px-3 py-1.5 rounded text-sm font-medium text-white"
                        style={{ backgroundColor: localConfig.primaryColor || '#f97316' }}
                      >
                        Primario
                      </button>
                      <button
                        className="px-3 py-1.5 rounded text-sm font-medium text-white"
                        style={{ backgroundColor: localConfig.secondaryColor || '#1f2937' }}
                      >
                        Secundario
                      </button>
                      <span
                        className="px-2 py-1 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: localConfig.accentColor || '#10b981' }}
                      >
                        Acento
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contacto */}
            {activeConfigTab === 'contact' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Información de contacto
                </h3>

                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Teléfono</Label>
                      <Input
                        placeholder="+51 999 999 999"
                        value={localConfig.phone || ''}
                        onChange={(e) => updateConfig('phone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>WhatsApp</Label>
                      <Input
                        placeholder="+51 999 999 999"
                        value={localConfig.whatsapp || ''}
                        onChange={(e) => updateConfig('whatsapp', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="contacto@tunegocio.com"
                      value={localConfig.email || ''}
                      onChange={(e) => updateConfig('email', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Dirección
                    </Label>
                    <Input
                      placeholder="Av. Principal 123, Lima, Perú"
                      value={localConfig.address || ''}
                      onChange={(e) => updateConfig('address', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Horario de atención
                    </Label>
                    <Input
                      placeholder="Lun-Sab: 9am - 8pm"
                      value={localConfig.businessHours || ''}
                      onChange={(e) => updateConfig('businessHours', e.target.value)}
                    />
                  </div>

                  <div className="h-px bg-border my-4" />

                  <h4 className="font-medium flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    Redes Sociales
                  </h4>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Instagram</Label>
                      <Input
                        placeholder="@tunegocio"
                        value={localConfig.instagram || ''}
                        onChange={(e) => updateConfig('instagram', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Facebook</Label>
                      <Input
                        placeholder="facebook.com/tunegocio"
                        value={localConfig.facebook || ''}
                        onChange={(e) => updateConfig('facebook', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>TikTok</Label>
                      <Input
                        placeholder="@tunegocio"
                        value={localConfig.tiktok || ''}
                        onChange={(e) => updateConfig('tiktok', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>YouTube</Label>
                      <Input
                        placeholder="youtube.com/@tunegocio"
                        value={localConfig.youtube || ''}
                        onChange={(e) => updateConfig('youtube', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Funciones */}
            {activeConfigTab === 'features' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Funciones y componentes
                </h3>

                <div className="space-y-3">
                  {[
                    { key: 'showWhatsappButton', label: 'Botón de WhatsApp flotante', desc: 'Muestra un botón de WhatsApp fijo en la esquina' },
                    { key: 'showSocialLinks', label: 'Enlaces a redes sociales', desc: 'Mostrar íconos de redes sociales en el perfil' },
                    { key: 'showReviews', label: 'Sección de reseñas', desc: 'Mostrar reseñas de clientes en tu página' },
                    { key: 'showGallery', label: 'Galería de imágenes', desc: 'Mostrar galería de fotos/trabajos' },
                  ].map((feature) => (
                    <label
                      key={feature.key}
                      className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <span className="font-medium">{feature.label}</span>
                        <p className="text-sm text-muted-foreground">{feature.desc}</p>
                      </div>
                      <Checkbox
                        checked={(localConfig as any)[feature.key] ?? true}
                        onCheckedChange={(checked) => updateConfig(feature.key as keyof TemplateConfig, checked)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* SEO */}
            {activeConfigTab === 'seo' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Optimización SEO
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título de la página (Meta Title)</Label>
                    <Input
                      placeholder="Mi Negocio - Servicios profesionales en Lima"
                      value={localConfig.metaTitle || ''}
                      onChange={(e) => updateConfig('metaTitle', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Recomendado: 50-60 caracteres
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Descripción (Meta Description)</Label>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Describe tu negocio para los motores de búsqueda..."
                      value={localConfig.metaDescription || ''}
                      onChange={(e) => updateConfig('metaDescription', e.target.value)}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Recomendado: 150-160 caracteres
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Palabras clave (Keywords)</Label>
                    <Input
                      placeholder="barbería, cortes de cabello, lima"
                      value={localConfig.metaKeywords || ''}
                      onChange={(e) => updateConfig('metaKeywords', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Separa las palabras clave con comas
                    </p>
                  </div>

                  {/* Preview de Google */}
                  <div className="mt-6 p-4 rounded-lg bg-muted/30 border">
                    <h4 className="font-medium mb-3 text-sm text-muted-foreground">Vista previa en Google</h4>
                    <div className="space-y-1">
                      <p className="text-blue-600 text-lg hover:underline cursor-pointer">
                        {localConfig.metaTitle || localConfig.businessName || 'Título de tu negocio'}
                      </p>
                      <p className="text-green-700 text-sm">tribio.info/tu-negocio</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {localConfig.metaDescription || localConfig.description || 'Descripción de tu negocio...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="px-6 py-4 border-t bg-muted/30 flex justify-between items-center">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <div className="flex gap-3">
            {!isSelected && (
              <Button variant="outline" onClick={onSelect}>
                Seleccionar plantilla
              </Button>
            )}
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Componente principal
export default function TemplateSelector({
  personalTemplates,
  storeTemplates,
  activeTemplateId,
  activeStoreTemplateId,
  customizations,
  accountSlug,
  account,
}: Props) {
  const pageProps = usePage().props as any;
  const accountData = account || pageProps.account;
  const slug = accountSlug || accountData?.slug || '';

  // Usar plantillas del backend (solo las que existen en la base de datos)
  const personal = personalTemplates?.length ? personalTemplates : defaultPersonalTemplates;
  const store = storeTemplates || []; // Solo usar plantillas de la base de datos

  const [activeTab, setActiveTab] = useState<'personal' | 'store'>(
    accountData?.business_type?.slug === 'store' ? 'store' : 'personal'
  );

  // Estados de selección
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | string | null>(
    activeTemplateId || personal[0]?.id || null
  );
  const [selectedStoreTemplateId, setSelectedStoreTemplateId] = useState<number | string | null>(
    activeStoreTemplateId || null
  );

  // Estado para el modal de edición
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [currentConfig, setCurrentConfig] = useState<TemplateConfig>(
    (customizations as TemplateConfig) || defaultConfig
  );
  const [isSaving, setIsSaving] = useState(false);

  // Estado para notificaciones
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Guardar selección de plantilla
  const handleSaveTemplate = async () => {
    const templateId = activeTab === 'personal' ? selectedTemplateId : selectedStoreTemplateId;
    if (!templateId) return;

    setIsSaving(true);
    router.post('/settings/templates', {
      template_id: templateId,
      type: activeTab,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setNotification({ type: 'success', message: 'Plantilla guardada correctamente' });
      },
      onError: () => {
        setNotification({ type: 'error', message: 'No se pudo guardar la plantilla' });
      },
      onFinish: () => {
        setIsSaving(false);
      },
    });
  };

  // Guardar configuración personalizada
  const handleSaveConfig = (config: TemplateConfig) => {
    router.post('/settings/templates/config', {
      config,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setCurrentConfig(config);
        setEditingTemplate(null);
        setNotification({ type: 'success', message: 'Configuración guardada correctamente' });
      },
      onError: () => {
        setNotification({ type: 'error', message: 'No se pudo guardar la configuración' });
      },
    });
  };

  // Seleccionar plantilla desde el modal
  const handleSelectFromModal = () => {
    if (editingTemplate) {
      if (editingTemplate.category !== 'store') {
        setSelectedTemplateId(editingTemplate.id);
      } else {
        setSelectedStoreTemplateId(editingTemplate.id);
      }
      setNotification({ type: 'success', message: `Plantilla "${editingTemplate.name}" seleccionada` });
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Seleccionar Plantilla" />

      {/* Notificación */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Personaliza tu Presencia Online</h1>
            <p className="text-muted-foreground">
              Elige la plantilla perfecta para tu negocio y personalízala
            </p>
          </div>

          <Button onClick={handleSaveTemplate} disabled={isSaving} size="lg">
            {isSaving ? 'Guardando...' : 'Guardar Plantilla'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Template Type Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'personal' | 'store')}
          className="w-full"
        >
          <TabsList className="w-full max-w-md grid grid-cols-2 h-12">
            <TabsTrigger value="personal" className="gap-2 text-sm">
              <User className="w-4 h-4" />
              Perfil Personal
            </TabsTrigger>
            <TabsTrigger value="store" className="gap-2 text-sm">
              <ShoppingBag className="w-4 h-4" />
              Tienda eCommerce
            </TabsTrigger>
          </TabsList>

          {/* Personal Templates */}
          <TabsContent value="personal" className="mt-6">
            <Card className="mb-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Plantillas de Perfil Personal</h3>
                  <p className="text-sm text-muted-foreground">
                    Ideal para mostrar tus servicios, portfolio y agendar citas. URL:{' '}
                    <code className="bg-primary/10 px-2 py-0.5 rounded text-primary font-medium">
                      tribio.info/{slug}
                    </code>
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {personal.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplateId === template.id}
                  onSelect={() => setSelectedTemplateId(template.id)}
                  onEdit={() => setEditingTemplate(template)}
                />
              ))}
            </div>
          </TabsContent>

          {/* Store Templates */}
          <TabsContent value="store" className="mt-6">
            <Card className="mb-6 bg-gradient-to-r from-orange-500/5 to-orange-500/10 border-orange-500/20">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Plantillas de Tienda eCommerce</h3>
                  <p className="text-sm text-muted-foreground">
                    Tiendas profesionales con catálogo, filtros y checkout. URL:{' '}
                    <code className="bg-orange-500/10 px-2 py-0.5 rounded text-orange-600 font-medium">
                      tribio.info/{slug}/tienda
                    </code>
                  </p>
                </div>
              </CardContent>
            </Card>

            {store.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {store.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedStoreTemplateId === template.id}
                    onSelect={() => setSelectedStoreTemplateId(template.id)}
                    onEdit={() => setEditingTemplate(template)}
                    onEditPage={() => {
                      // Navegar a la página de edición completa para tiendas
                      router.visit(`/settings/templates/${template.id}/edit`);
                    }}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <Store className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No hay plantillas de tienda disponibles</h3>
                  <p className="text-sm text-muted-foreground">
                    Contacta al administrador para habilitar plantillas de eCommerce.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* URL Preview */}
        <Card className="border-dashed">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Tus URLs públicas
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <Badge variant="secondary" className="shrink-0">Perfil</Badge>
                <code className="flex-1 text-foreground">
                  tribio.info/{slug}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(`/${slug}`, '_blank')}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <Badge variant="secondary" className="shrink-0">Tienda</Badge>
                <code className="flex-1 text-foreground">
                  tribio.info/{slug}/tienda
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(`/${slug}/tienda`, '_blank')}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de edición */}
      <TemplateEditModal
        template={editingTemplate}
        config={currentConfig}
        isOpen={!!editingTemplate}
        onClose={() => setEditingTemplate(null)}
        onSave={handleSaveConfig}
        onSelect={handleSelectFromModal}
        isSelected={
          editingTemplate?.category !== 'store'
            ? selectedTemplateId === editingTemplate?.id
            : selectedStoreTemplateId === editingTemplate?.id
        }
        onNotify={(type, message) => setNotification({ type, message })}
      />
    </AppLayout>
  );
}
