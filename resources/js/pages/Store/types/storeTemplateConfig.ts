/**
 * Configuración de Plantilla de Tienda eCommerce Profesional
 * Similar a Nike, Adidas, Zara, etc.
 */

// ============================================
// INTERFACES DE CONFIGURACIÓN
// ============================================

export interface StoreTemplateConfig {
  // Identificación
  templateId: string;
  templateName: string;
  version: string;

  // Branding
  branding: BrandingConfig;

  // Layout
  layout: LayoutConfig;

  // Navegación
  navigation: NavigationConfig;

  // Hero/Banner
  hero: HeroConfig;

  // Secciones de productos
  productSections: ProductSectionConfig[];

  // Banners promocionales
  promoBanners: PromoBannerConfig[];

  // Features/USP
  features: FeatureConfig[];

  // Footer
  footer: FooterConfig;

  // SEO
  seo: SeoConfig;

  // Colores personalizados
  colors: ColorConfig;

  // Tipografía
  typography: TypographyConfig;

  // Configuración de carrito
  cart: CartConfig;

  // Configuración de checkout
  checkout: CheckoutConfig;
}

// ============================================
// BRANDING
// ============================================
export interface BrandingConfig {
  logo: {
    light: string;
    dark: string;
    icon?: string;
    height: number;
  };
  favicon: string;
  brandName: string;
  slogan?: string;
}

// ============================================
// LAYOUT
// ============================================
export interface LayoutConfig {
  headerStyle: 'minimal' | 'standard' | 'mega' | 'transparent';
  headerSticky: boolean;
  headerHeight: number;
  maxWidth: 'full' | 'xl' | '2xl' | '7xl';
  containerPadding: number;
  sidebarPosition?: 'left' | 'right';
  productGridCols: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  showBreadcrumbs: boolean;
  showBackToTop: boolean;
}

// ============================================
// NAVEGACIÓN
// ============================================
export interface NavigationConfig {
  style: 'simple' | 'mega-menu' | 'sidebar';
  showSearch: boolean;
  searchStyle: 'inline' | 'modal' | 'dropdown';
  showCart: boolean;
  showWishlist: boolean;
  showAccount: boolean;
  topBar?: {
    enabled: boolean;
    content: string;
    links?: { label: string; href: string }[];
    backgroundColor?: string;
  };
  mainMenu: MenuItemConfig[];
  mobileMenuStyle: 'slide' | 'fullscreen' | 'drawer';
}

export interface MenuItemConfig {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  badge?: string;
  badgeColor?: string;
  children?: MenuItemConfig[];
  featured?: {
    image: string;
    title: string;
    subtitle?: string;
    link: string;
  }[];
  columns?: number;
}

// ============================================
// HERO SECTION
// ============================================
export interface HeroConfig {
  type: 'slider' | 'video' | 'split' | 'grid' | 'minimal';
  autoplay: boolean;
  autoplaySpeed: number;
  showArrows: boolean;
  showDots: boolean;
  height: {
    mobile: string;
    desktop: string;
  };
  slides: HeroSlideConfig[];
}

export interface HeroSlideConfig {
  id: string;
  type: 'image' | 'video';
  media: string;
  mediaMobile?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  contentPosition: 'left' | 'center' | 'right';
  contentAlign: 'start' | 'center' | 'end';
  title?: string;
  titleSize?: 'sm' | 'md' | 'lg' | 'xl';
  subtitle?: string;
  description?: string;
  cta?: {
    text: string;
    href: string;
    style: 'primary' | 'secondary' | 'outline' | 'ghost';
  };
  secondaryCta?: {
    text: string;
    href: string;
    style: 'primary' | 'secondary' | 'outline' | 'ghost';
  };
}

// ============================================
// PRODUCT SECTIONS
// ============================================
export interface ProductSectionConfig {
  id: string;
  type: 'grid' | 'carousel' | 'featured' | 'masonry';
  title: string;
  subtitle?: string;
  showViewAll: boolean;
  viewAllLink?: string;
  filter?: {
    type: 'category' | 'tag' | 'collection' | 'custom';
    value: string;
  };
  limit: number;
  columns?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  productCardStyle: 'minimal' | 'standard' | 'detailed' | 'hover-info';
  showQuickView: boolean;
  showAddToCart: boolean;
  showWishlist: boolean;
  tabs?: {
    enabled: boolean;
    items: { id: string; label: string; filter: string }[];
  };
}

// ============================================
// PROMO BANNERS
// ============================================
export interface PromoBannerConfig {
  id: string;
  type: 'single' | 'split' | 'triple' | 'grid';
  items: {
    image: string;
    imageMobile?: string;
    title?: string;
    subtitle?: string;
    cta?: {
      text: string;
      href: string;
    };
    position?: 'left' | 'center' | 'right';
    textColor?: string;
  }[];
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: boolean;
}

// ============================================
// FEATURES/USP
// ============================================
export interface FeatureConfig {
  icon: string;
  iconType: 'emoji' | 'lucide' | 'custom';
  title: string;
  description: string;
}

// ============================================
// FOOTER
// ============================================
export interface FooterConfig {
  style: 'minimal' | 'standard' | 'detailed';
  showNewsletter: boolean;
  newsletterTitle?: string;
  newsletterDescription?: string;
  columns: FooterColumnConfig[];
  showSocialLinks: boolean;
  socialLinks?: {
    platform: string;
    url: string;
  }[];
  showPaymentMethods: boolean;
  paymentMethods?: string[];
  bottomBar: {
    copyright: string;
    links?: { label: string; href: string }[];
  };
  backgroundColor?: string;
  textColor?: string;
}

export interface FooterColumnConfig {
  title: string;
  links: {
    label: string;
    href: string;
    external?: boolean;
  }[];
}

// ============================================
// SEO
// ============================================
export interface SeoConfig {
  titleTemplate: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string[];
  defaultImage?: string;
  siteName: string;
  locale: string;
  twitterHandle?: string;
  structuredData: {
    organization: boolean;
    localBusiness: boolean;
    breadcrumbs: boolean;
    products: boolean;
  };
}

// ============================================
// COLORS
// ============================================
export interface ColorConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

// ============================================
// TYPOGRAPHY
// ============================================
export interface TypographyConfig {
  fontFamily: {
    heading: string;
    body: string;
    accent?: string;
  };
  fontSize: {
    base: number;
    scale: number;
  };
  fontWeight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}

// ============================================
// CART
// ============================================
export interface CartConfig {
  style: 'drawer' | 'page' | 'dropdown';
  showProductImages: boolean;
  showQuantityControls: boolean;
  showRemoveButton: boolean;
  showSubtotal: boolean;
  showShippingEstimate: boolean;
  showTaxEstimate: boolean;
  enableCoupons: boolean;
  emptyCartMessage: string;
  emptyCartCta: {
    text: string;
    href: string;
  };
}

// ============================================
// CHECKOUT
// ============================================
export interface CheckoutConfig {
  style: 'single-page' | 'multi-step';
  guestCheckout: boolean;
  showOrderSummary: boolean;
  showTrustBadges: boolean;
  requirePhone: boolean;
  requireAddress: boolean;
  paymentMethods: string[];
  shippingMethods: string[];
}

// ============================================
// PLANTILLA POR DEFECTO - ESTILO NIKE
// ============================================
export const defaultNikeStyleConfig: StoreTemplateConfig = {
  templateId: 'nike-style',
  templateName: 'Sneakers Pro',
  version: '1.0.0',

  branding: {
    logo: {
      light: '/images/logo-light.svg',
      dark: '/images/logo-dark.svg',
      height: 40,
    },
    favicon: '/favicon.ico',
    brandName: 'Mi Tienda',
    slogan: 'Just Do It',
  },

  colors: {
    primary: '#111111',
    secondary: '#757575',
    accent: '#ff6b35',
    background: '#ffffff',
    surface: '#f5f5f5',
    text: {
      primary: '#111111',
      secondary: '#757575',
      muted: '#999999',
    },
    border: '#e5e5e5',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  typography: {
    fontFamily: {
      heading: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      body: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    },
    fontSize: {
      base: 16,
      scale: 1.25,
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  layout: {
    headerStyle: 'mega',
    headerSticky: true,
    headerHeight: 60,
    maxWidth: '7xl',
    containerPadding: 16,
    productGridCols: {
      mobile: 2,
      tablet: 3,
      desktop: 4,
    },
    showBreadcrumbs: true,
    showBackToTop: true,
  },

  navigation: {
    style: 'mega-menu',
    showSearch: true,
    searchStyle: 'modal',
    showCart: true,
    showWishlist: true,
    showAccount: true,
    topBar: {
      enabled: true,
      content: 'Envío gratis en compras mayores a S/199',
      links: [
        { label: 'Buscar tienda', href: '/tiendas' },
        { label: 'Ayuda', href: '/ayuda' },
      ],
      backgroundColor: '#f5f5f5',
    },
    mainMenu: [
      {
        id: 'nuevo',
        label: 'Lo nuevo',
        href: '/nuevo',
        badge: 'NEW',
        badgeColor: '#ff6b35',
      },
      {
        id: 'hombre',
        label: 'Hombre',
        children: [
          {
            id: 'hombre-destacados',
            label: 'Lo Más Visto',
            children: [
              { id: 'h-nuevo', label: 'Lo Nuevo', href: '/hombre/nuevo' },
              { id: 'h-mas-vendido', label: 'Lo Más Vendido', href: '/hombre/mas-vendido' },
              { id: 'h-ofertas', label: 'Ofertas', href: '/hombre/ofertas', badge: '🔥' },
            ],
          },
          {
            id: 'hombre-zapatillas',
            label: 'Zapatillas',
            children: [
              { id: 'h-todas', label: 'Todas las Zapatillas', href: '/hombre/zapatillas' },
              { id: 'h-running', label: 'Running', href: '/hombre/zapatillas/running' },
              { id: 'h-urbano', label: 'Urbano', href: '/hombre/zapatillas/urbano' },
              { id: 'h-futbol', label: 'Fútbol', href: '/hombre/zapatillas/futbol' },
              { id: 'h-basquet', label: 'Básquet', href: '/hombre/zapatillas/basquet' },
            ],
          },
          {
            id: 'hombre-ropa',
            label: 'Ropa',
            children: [
              { id: 'h-polos', label: 'Polos', href: '/hombre/ropa/polos' },
              { id: 'h-casacas', label: 'Casacas', href: '/hombre/ropa/casacas' },
              { id: 'h-shorts', label: 'Shorts', href: '/hombre/ropa/shorts' },
              { id: 'h-pantalones', label: 'Pantalones', href: '/hombre/ropa/pantalones' },
            ],
          },
          {
            id: 'hombre-accesorios',
            label: 'Accesorios',
            children: [
              { id: 'h-gorras', label: 'Gorras', href: '/hombre/accesorios/gorras' },
              { id: 'h-mochilas', label: 'Mochilas', href: '/hombre/accesorios/mochilas' },
              { id: 'h-medias', label: 'Medias', href: '/hombre/accesorios/medias' },
            ],
          },
        ],
        featured: [
          {
            image: '/images/featured-hombre.jpg',
            title: 'Air Max DN',
            subtitle: 'El futuro del Air',
            link: '/hombre/air-max-dn',
          },
        ],
        columns: 4,
      },
      {
        id: 'mujer',
        label: 'Mujer',
        children: [
          {
            id: 'mujer-destacados',
            label: 'Lo Más Visto',
            children: [
              { id: 'm-nuevo', label: 'Lo Nuevo', href: '/mujer/nuevo' },
              { id: 'm-mas-vendido', label: 'Lo Más Vendido', href: '/mujer/mas-vendido' },
            ],
          },
          {
            id: 'mujer-zapatillas',
            label: 'Zapatillas',
            children: [
              { id: 'm-todas', label: 'Todas las Zapatillas', href: '/mujer/zapatillas' },
              { id: 'm-running', label: 'Running', href: '/mujer/zapatillas/running' },
              { id: 'm-urbano', label: 'Urbano', href: '/mujer/zapatillas/urbano' },
            ],
          },
          {
            id: 'mujer-ropa',
            label: 'Ropa',
            children: [
              { id: 'm-tops', label: 'Tops', href: '/mujer/ropa/tops' },
              { id: 'm-leggings', label: 'Leggings', href: '/mujer/ropa/leggings' },
              { id: 'm-shorts', label: 'Shorts', href: '/mujer/ropa/shorts' },
            ],
          },
        ],
        columns: 3,
      },
      {
        id: 'ninos',
        label: 'Niños',
        href: '/ninos',
      },
      {
        id: 'ofertas',
        label: 'Hasta 50% OFF',
        href: '/ofertas',
        badge: '⚡',
        badgeColor: '#ff6b35',
      },
    ],
    mobileMenuStyle: 'fullscreen',
  },

  hero: {
    type: 'slider',
    autoplay: true,
    autoplaySpeed: 5000,
    showArrows: true,
    showDots: true,
    height: {
      mobile: '70vh',
      desktop: '85vh',
    },
    slides: [
      {
        id: 'slide-1',
        type: 'image',
        media: '/images/hero-1.jpg',
        mediaMobile: '/images/hero-1-mobile.jpg',
        overlayColor: '#000000',
        overlayOpacity: 0.3,
        contentPosition: 'center',
        contentAlign: 'center',
        title: 'REGRESO A CLASES',
        titleSize: 'xl',
        subtitle: 'Diseñados para jugar, correr y nunca parar',
        cta: {
          text: 'Comprar',
          href: '/coleccion/regreso-clases',
          style: 'primary',
        },
      },
    ],
  },

  productSections: [
    {
      id: 'hits',
      type: 'carousel',
      title: 'Nike Hits',
      showViewAll: true,
      viewAllLink: '/productos',
      filter: { type: 'tag', value: 'trending' },
      limit: 8,
      productCardStyle: 'standard',
      showQuickView: true,
      showAddToCart: false,
      showWishlist: true,
    },
    {
      id: 'nuevos',
      type: 'grid',
      title: 'Lo Nuevo',
      subtitle: 'Descubre las últimas novedades',
      showViewAll: true,
      viewAllLink: '/nuevo',
      filter: { type: 'collection', value: 'new-arrivals' },
      limit: 8,
      columns: { mobile: 2, tablet: 3, desktop: 4 },
      productCardStyle: 'standard',
      showQuickView: true,
      showAddToCart: false,
      showWishlist: true,
    },
  ],

  promoBanners: [
    {
      id: 'promo-1',
      type: 'split',
      items: [
        {
          image: '/images/promo-1.jpg',
          title: 'Regreso a clases',
          cta: { text: 'Comprar', href: '/coleccion/regreso-clases' },
          position: 'left',
        },
        {
          image: '/images/promo-2.jpg',
          title: 'Tu estilo entra en calor',
          cta: { text: 'Comprar', href: '/coleccion/verano' },
          position: 'left',
        },
      ],
      spacing: 'md',
      rounded: false,
    },
  ],

  features: [
    { icon: '🚚', iconType: 'emoji', title: 'Envío Gratis', description: 'En compras mayores a S/199' },
    { icon: '🔄', iconType: 'emoji', title: 'Cambios Gratis', description: 'Hasta 30 días' },
    { icon: '💳', iconType: 'emoji', title: 'Pago Seguro', description: 'Múltiples métodos' },
    { icon: '⭐', iconType: 'emoji', title: 'Garantía', description: 'Productos originales' },
  ],

  footer: {
    style: 'detailed',
    showNewsletter: true,
    newsletterTitle: 'Regístrate para recibir ofertas',
    newsletterDescription: 'Sé el primero en enterarte de nuestras promociones exclusivas',
    columns: [
      {
        title: 'Buscar Tienda',
        links: [
          { label: 'Regístrate para recibir correos', href: '/newsletter' },
          { label: 'Hazte miembro', href: '/registro' },
          { label: 'Consejos de estilo', href: '/blog' },
        ],
      },
      {
        title: 'Obtener Ayuda',
        links: [
          { label: 'Estado del Pedido', href: '/mi-cuenta/pedidos' },
          { label: 'Envío y entrega', href: '/envio' },
          { label: 'Cambios y devoluciones', href: '/devoluciones' },
          { label: 'Opciones de pago', href: '/pagos' },
          { label: 'Preguntas frecuentes', href: '/faq' },
        ],
      },
      {
        title: 'Acerca de Nosotros',
        links: [
          { label: 'Nuestra Historia', href: '/nosotros' },
          { label: 'Empleo', href: '/empleos' },
        ],
      },
    ],
    showSocialLinks: true,
    socialLinks: [
      { platform: 'twitter', url: 'https://twitter.com' },
      { platform: 'facebook', url: 'https://facebook.com' },
      { platform: 'youtube', url: 'https://youtube.com' },
      { platform: 'instagram', url: 'https://instagram.com' },
    ],
    showPaymentMethods: true,
    paymentMethods: ['visa', 'mastercard', 'amex', 'paypal', 'yape', 'plin'],
    bottomBar: {
      copyright: '© 2024 Mi Tienda. Todos los derechos reservados.',
      links: [
        { label: 'Términos y Condiciones', href: '/terminos' },
        { label: 'Política de Privacidad', href: '/privacidad' },
      ],
    },
    backgroundColor: '#111111',
    textColor: '#ffffff',
  },

  seo: {
    titleTemplate: '%s | Mi Tienda',
    defaultTitle: 'Mi Tienda - Zapatillas y Ropa Deportiva',
    defaultDescription: 'Encuentra las mejores zapatillas y ropa deportiva. Envío gratis en compras mayores a S/199.',
    defaultKeywords: ['zapatillas', 'sneakers', 'ropa deportiva', 'running', 'urbano'],
    siteName: 'Mi Tienda',
    locale: 'es_PE',
    structuredData: {
      organization: true,
      localBusiness: true,
      breadcrumbs: true,
      products: true,
    },
  },

  cart: {
    style: 'drawer',
    showProductImages: true,
    showQuantityControls: true,
    showRemoveButton: true,
    showSubtotal: true,
    showShippingEstimate: false,
    showTaxEstimate: false,
    enableCoupons: true,
    emptyCartMessage: 'Tu carrito está vacío',
    emptyCartCta: {
      text: 'Continuar comprando',
      href: '/productos',
    },
  },

  checkout: {
    style: 'multi-step',
    guestCheckout: true,
    showOrderSummary: true,
    showTrustBadges: true,
    requirePhone: true,
    requireAddress: true,
    paymentMethods: ['card', 'yape', 'plin', 'transferencia'],
    shippingMethods: ['standard', 'express', 'pickup'],
  },
};
