/**
 * Configuración de Plantilla San Valentín - "Amor & Regalos"
 * Diseño elegante y romántico para tiendas de regalos de 14 de Febrero
 */

import { StoreTemplateConfig } from './storeTemplateConfig';

export type ValentineTemplateConfig = StoreTemplateConfig;

// ============================================
// CONFIGURACIÓN POR DEFECTO - SAN VALENTÍN
// ============================================
export const defaultValentineConfig: ValentineTemplateConfig = {
  templateId: 'valentine-gifts',
  templateName: 'Amor & Regalos - San Valentín',
  version: '1.0.0',

  branding: {
    logo: {
      light: '/images/valentine-logo-light.svg',
      dark: '/images/valentine-logo-dark.svg',
      height: 44,
    },
    favicon: '/favicon.ico',
    brandName: 'Amor & Regalos',
    slogan: 'El regalo perfecto para el amor de tu vida',
  },

  colors: {
    primary: '#c0392b',       // Rojo pasión
    secondary: '#e91e8c',     // Rosa fuerte
    accent: '#f4b942',        // Dorado cálido
    background: '#fff5f7',    // Rosa muy claro
    surface: '#ffffff',
    text: {
      primary: '#2d1b1b',     // Marrón oscuro cálido
      secondary: '#6b4c52',
      muted: '#9e7982',
    },
    border: '#f0cdd3',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  typography: {
    fontFamily: {
      heading: '"Playfair Display", Georgia, "Times New Roman", serif',
      body: '"Lato", "Helvetica Neue", Helvetica, Arial, sans-serif',
      accent: '"Dancing Script", cursive',
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
    headerHeight: 64,
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
      content: 'Entrega el 14 de Febrero ❤️ | Envio gratis en compras mayores a S/99',
      links: [
        { label: 'Seguir pedido', href: '/mi-cuenta/pedidos' },
        { label: 'Ayuda', href: '/ayuda' },
      ],
      backgroundColor: '#c0392b',
    },
    mainMenu: [
      {
        id: 'ella',
        label: 'Para Ella',
        columns: 3,
        children: [
          {
            id: 'ella-joyeria',
            label: 'Joyeria & Accesorios',
            children: [
              { id: 'e-collares', label: 'Collares & Cadenas', href: '/productos?categoria=collares' },
              { id: 'e-pulseras', label: 'Pulseras', href: '/productos?categoria=pulseras' },
              { id: 'e-aretes', label: 'Aretes & Aros', href: '/productos?categoria=aretes' },
              { id: 'e-anillos', label: 'Anillos', href: '/productos?categoria=anillos' },
            ],
          },
          {
            id: 'ella-flores',
            label: 'Flores & Detalles',
            children: [
              { id: 'e-rosas', label: 'Rosas Naturales', href: '/productos?categoria=rosas' },
              { id: 'e-arreglos', label: 'Arreglos Florales', href: '/productos?categoria=arreglos-florales' },
              { id: 'e-peluches', label: 'Peluches & Ositos', href: '/productos?categoria=peluches' },
              { id: 'e-chocolates', label: 'Chocolates & Dulces', href: '/productos?categoria=chocolates' },
            ],
          },
          {
            id: 'ella-fragancias',
            label: 'Fragancias & Cuidado',
            children: [
              { id: 'e-perfumes', label: 'Perfumes', href: '/productos?categoria=perfumes-mujer' },
              { id: 'e-sets', label: 'Sets de Cuidado', href: '/productos?categoria=sets-cuidado' },
              { id: 'e-velas', label: 'Velas Aromaticas', href: '/productos?categoria=velas' },
              { id: 'e-spa', label: 'Experiencias Spa', href: '/productos?categoria=spa' },
            ],
          },
        ],
      },
      {
        id: 'el',
        label: 'Para El',
        columns: 3,
        children: [
          {
            id: 'el-relojes',
            label: 'Relojes & Accesorios',
            children: [
              { id: 'h-relojes', label: 'Relojes', href: '/productos?categoria=relojes' },
              { id: 'h-carteras', label: 'Carteras & Billeteras', href: '/productos?categoria=carteras' },
              { id: 'h-cinturones', label: 'Cinturones', href: '/productos?categoria=cinturones' },
            ],
          },
          {
            id: 'el-fragancias',
            label: 'Fragancias & Cuidado',
            children: [
              { id: 'h-perfumes', label: 'Perfumes', href: '/productos?categoria=perfumes-hombre' },
              { id: 'h-sets', label: 'Sets de Cuidado', href: '/productos?categoria=sets-hombre' },
            ],
          },
          {
            id: 'el-experiencias',
            label: 'Experiencias',
            children: [
              { id: 'h-cenas', label: 'Cenas Romanticas', href: '/productos?categoria=cenas' },
              { id: 'h-aventura', label: 'Experiencias de Aventura', href: '/productos?categoria=aventura' },
              { id: 'h-hobbies', label: 'Hobbies & Tecnologia', href: '/productos?categoria=tecnologia' },
            ],
          },
        ],
      },
      {
        id: 'flores',
        label: 'Flores & Detalles',
        href: '/productos',
      },
      {
        id: 'experiencias',
        label: 'Experiencias',
        href: '/productos',
      },
      {
        id: 'especiales',
        label: 'Especiales 14 Feb',
        href: '/ofertas',
        badge: '❤️',
        badgeColor: '#e91e8c',
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
      mobile: '75vh',
      desktop: '88vh',
    },
    slides: [
      {
        id: 'slide-1',
        type: 'image',
        media: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1600&q=80',
        overlayColor: '#2d0a0a',
        overlayOpacity: 0.55,
        contentPosition: 'center',
        contentAlign: 'center',
        title: 'El Regalo Perfecto\npara el Amor de tu Vida',
        titleSize: 'xl',
        subtitle: 'Sorprende a esa persona especial este 14 de Febrero',
        cta: {
          text: 'Explorar Regalos',
          href: '/productos',
          style: 'primary',
        },
        secondaryCta: {
          text: 'Ver Ofertas',
          href: '/ofertas',
          style: 'outline',
        },
      },
      {
        id: 'slide-2',
        type: 'image',
        media: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80',
        overlayColor: '#4a0a2e',
        overlayOpacity: 0.5,
        contentPosition: 'left',
        contentAlign: 'center',
        title: 'Flores & Detalles\nque Enamoran',
        titleSize: 'xl',
        subtitle: 'Rosas naturales, arreglos y mucho mas para ella',
        cta: {
          text: 'Ver Flores',
          href: '/productos',
          style: 'primary',
        },
      },
      {
        id: 'slide-3',
        type: 'image',
        media: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=80',
        overlayColor: '#1a0a00',
        overlayOpacity: 0.6,
        contentPosition: 'right',
        contentAlign: 'center',
        title: 'Sorprendelo\neste 14 de Febrero',
        titleSize: 'xl',
        subtitle: 'Relojes, perfumes y experiencias unicas para el',
        cta: {
          text: 'Regalos para El',
          href: '/productos',
          style: 'primary',
        },
      },
    ],
  },

  productSections: [
    {
      id: 'populares',
      type: 'carousel',
      title: 'Regalos Mas Populares',
      subtitle: 'Los favoritos de San Valentin',
      showViewAll: true,
      viewAllLink: '/productos',
      limit: 8,
      productCardStyle: 'standard',
      showQuickView: true,
      showAddToCart: true,
      showWishlist: true,
    },
    {
      id: 'nuevos',
      type: 'grid',
      title: 'Novedades San Valentin',
      subtitle: 'Recien llegados para esta temporada',
      showViewAll: true,
      viewAllLink: '/productos',
      limit: 8,
      columns: { mobile: 2, tablet: 3, desktop: 4 },
      productCardStyle: 'standard',
      showQuickView: true,
      showAddToCart: true,
      showWishlist: true,
    },
    {
      id: 'experiencias',
      type: 'grid',
      title: 'Experiencias & Detalles',
      subtitle: 'Momentos que se recuerdan para siempre',
      showViewAll: true,
      viewAllLink: '/productos',
      limit: 6,
      columns: { mobile: 2, tablet: 3, desktop: 3 },
      productCardStyle: 'detailed',
      showQuickView: false,
      showAddToCart: true,
      showWishlist: true,
    },
  ],

  promoBanners: [
    {
      id: 'banner-pareja',
      type: 'split',
      items: [
        {
          image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80',
          title: 'Para Ella',
          subtitle: 'Joyeria, flores y fragancias',
          cta: { text: 'Ver Regalos', href: '/productos' },
          position: 'left',
          textColor: '#ffffff',
        },
        {
          image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b6380?w=800&q=80',
          title: 'Para El',
          subtitle: 'Relojes, perfumes y experiencias',
          cta: { text: 'Ver Regalos', href: '/productos' },
          position: 'left',
          textColor: '#ffffff',
        },
      ],
      spacing: 'md',
      rounded: true,
    },
  ],

  features: [
    { icon: '❤️', iconType: 'emoji', title: 'Entrega 14 de Febrero', description: 'Recibe tu regalo a tiempo' },
    { icon: '🎁', iconType: 'emoji', title: 'Empaque de Regalo', description: 'Presentacion especial incluida' },
    { icon: '💌', iconType: 'emoji', title: 'Mensaje Personalizado', description: 'Agrega tu mensaje de amor' },
    { icon: '🔒', iconType: 'emoji', title: 'Pago Seguro', description: 'Multiples metodos de pago' },
  ],

  footer: {
    style: 'detailed',
    showNewsletter: true,
    newsletterTitle: 'Recibe Inspiracion Romantica',
    newsletterDescription: 'Suscribete y recibe ideas de regalos y ofertas exclusivas de San Valentin',
    columns: [
      {
        title: 'Regalos',
        links: [
          { label: 'Para Ella', href: '/productos' },
          { label: 'Para El', href: '/productos' },
          { label: 'Flores & Detalles', href: '/productos' },
          { label: 'Experiencias', href: '/productos' },
          { label: 'Ofertas Especiales', href: '/ofertas' },
        ],
      },
      {
        title: 'Ayuda',
        links: [
          { label: 'Estado del Pedido', href: '/mi-cuenta/pedidos' },
          { label: 'Envio y Entrega', href: '/envio' },
          { label: 'Cambios y Devoluciones', href: '/devoluciones' },
          { label: 'Preguntas Frecuentes', href: '/faq' },
          { label: 'Contactanos', href: '/contacto' },
        ],
      },
      {
        title: 'Nosotros',
        links: [
          { label: 'Nuestra Historia', href: '/nosotros' },
          { label: 'Blog de Amor', href: '/blog' },
          { label: 'Trabaja con Nosotros', href: '/empleos' },
        ],
      },
    ],
    showSocialLinks: true,
    socialLinks: [
      { platform: 'instagram', url: 'https://instagram.com' },
      { platform: 'facebook', url: 'https://facebook.com' },
      { platform: 'tiktok', url: 'https://tiktok.com' },
      { platform: 'twitter', url: 'https://twitter.com' },
    ],
    showPaymentMethods: true,
    paymentMethods: ['visa', 'mastercard', 'yape', 'plin'],
    bottomBar: {
      copyright: '© 2025 Amor & Regalos. Hecho con ❤️ para el amor.',
      links: [
        { label: 'Terminos y Condiciones', href: '/terminos' },
        { label: 'Politica de Privacidad', href: '/privacidad' },
      ],
    },
    backgroundColor: '#2d0a0a',
    textColor: '#fce4ec',
  },

  seo: {
    titleTemplate: '%s | Amor & Regalos - San Valentin',
    defaultTitle: 'Amor & Regalos - Regalos Perfectos para San Valentin',
    defaultDescription: 'Encuentra el regalo perfecto para el 14 de Febrero. Joyeria, flores, perfumes y experiencias romanticas. Entrega garantizada el 14 de Febrero.',
    defaultKeywords: ['regalos san valentin', 'regalos 14 de febrero', 'flores san valentin', 'joyeria', 'perfumes', 'regalos romanticos', 'sorpresa para ella', 'sorpresa para el'],
    siteName: 'Amor & Regalos',
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
    emptyCartMessage: 'Tu carrito de amor esta vacio 💔',
    emptyCartCta: {
      text: 'Explorar Regalos',
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
    paymentMethods: ['card', 'yape', 'plin'],
    shippingMethods: ['standard', 'express', 'pickup'],
  },
};
