# Tribio - Plataforma Multi-tenant E-commerce con Modelo Predictivo de Machine Learnign

Plataforma SaaS multi-tenant.

Video: https://drive.google.com/file/d/16DrNZ2IOcy8d53iRxF3-1xDVl7WUkTQq/view?usp=sharing

Informe: https://drive.google.com/file/d/168VlgZhy5qZTEbyZYM0huBBLLGm1QqIi/view?usp=drive_link

Modelo ML: https://streamlit.io/cloud

API Modelo ML: https://tonyua-tribio.hf.space/docs

TRIBIO PLATAFORMA: https://tribio.info/

---

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Características](#características)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Modelos de Datos](#modelos-de-datos)
- [Plantillas Disponibles](#plantillas-disponibles)
- [Integraciones](#integraciones)
- [Instalación](#instalación)
- [Variables de Entorno](#variables-de-entorno)
- [Rutas Principales](#rutas-principales)
- [Flujos de Usuario](#flujos-de-usuario)

---

## Descripción General

Tribio permite a negocios crear su presencia digital completa mediante:

- **Tarjetas NFC** vinculadas a un perfil/tienda digital
- **Tiendas en línea** con catálogo, carrito y checkout con pagos en línea
- **Perfiles de negocio** personalizables con múltiples plantillas visuales
- **Sistema de citas** para servicios y consultas
- **Feed de contenido** estilo TikTok/Instagram
- **Directorio de negocios** público

Los usuarios pueden administrar múltiples negocios desde una sola cuenta, y los clientes pueden comprar en cualquier tienda de la plataforma.

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Backend | Laravel | 11.x |
| Frontend | React + TypeScript | 19.x |
| Bridge | Inertia.js | 2.x |
| Estilos | Tailwind CSS | v4 (via @tailwindcss/vite) |
| Build | Vite | 7.x |
| UI Components | Radix UI | latest |
| Animaciones | Framer Motion | latest |
| Base de datos | MySQL / SQLite | - |
| Auth | Laravel Fortify + Sanctum | - |
| OAuth | Laravel Socialite (Google) | - |
| Pagos | Culqi | - |
| Mensajería | Meta WhatsApp Business API | - |
| Email/SMS | Brevo (Sendinblue) | - |
| Imágenes | Intervention Image | - |

### Detalles del Frontend

- **React 19** con el nuevo compilador de React (babel plugin)
- **TypeScript** en todo el frontend
- **Inertia.js** como bridge Laravel ↔ React (sin API REST para el dashboard)
- **Radix UI** para componentes accesibles (Dialog, DropdownMenu, etc.)
- **Tailwind v4** con nueva sintaxis `@theme` y `@tailwindcss/vite`
- **SSR** configurado para SEO en páginas públicas

---

## Arquitectura

### Multi-tenancy

```
User (propietario)
  └── Account[] (negocios/tiendas)
        ├── Profile (perfil público, plantilla, datos)
        ├── Product[] (catálogo de productos)
        ├── Order[] (pedidos recibidos)
        ├── Customer[] (compradores)
        ├── Booking[] (citas)
        ├── Review[] (reseñas)
        └── Post[] / Story[] (contenido)

Customer (comprador)
  └── User (puede tener cuenta en la plataforma)
        ├── Order[] (pedidos realizados)
        └── Booking[] (citas agendadas)
```

### Roles del Sistema

| Rol | Descripción |
|-----|------------|
| `super_admin` | Acceso total, gestión de la plataforma |
| `admin` | Gestión de cuentas y configuración |
| `client` | Dueño de negocio, gestiona su(s) tienda(s) |
| `customer` | Comprador registrado |

**Nota:** Todos los roles pueden realizar compras en cualquier tienda.

### Flujo de Datos (Inertia.js)

```
Controller → Inertia::render('Page', $props)
                ↓
React Component recibe props como tipos TypeScript
                ↓
HandleInertiaRequests middleware inyecta datos globales
(auth.user, account, sidebar, flash messages)
```

### Arquitectura de Plantillas de Tienda

Las tiendas usan plantillas React que reciben un prop `page_type` para renderizar distintas vistas:

```tsx
// NikeStyleTemplate recibe page_type y renderiza el componente apropiado
page_type: 'home'     → StoreHome
page_type: 'catalog'  → StoreCatalog
page_type: 'product'  → StoreProductDetail
page_type: 'checkout' → StoreCheckout
```

Los props fluyen automáticamente por spread `{...props}`, por lo que nuevos props del controller llegan al componente hijo sin modificar la plantilla.

---

## Características

### Para Negocios (Clientes)

- **Dashboard** con métricas, predicciones ML y acceso rápido
- **Tienda en línea** con catálogo, categorías, marcas y filtros avanzados
- **Gestión de productos** con variantes, especificaciones, imágenes, SKU
- **Gestión de pedidos** con estados y notificaciones WhatsApp
- **Sistema de citas** con calendario y gestión de disponibilidad
- **Reseñas** de clientes con moderación
- **Feed de contenido** (posts/stories estilo redes sociales)
- **Plantillas visuales** (10+) con editor en tiempo real
- **Configuración de negocio** (nombre, logo, colores, redes sociales, etc.)
- **Multi-cuenta** para gestionar varios negocios

### Para Compradores (Customers)

- **Perfil de cliente** con historial de pedidos
- **Carrito de compras** persistente (localStorage + context)
- **Checkout** con pagos via Culqi (tarjetas)
- **Seguimiento de pedidos**
- **Gestión de direcciones** de envío
- **Favoritos/Wishlist**
- **Autenticación** por tienda (login/registro por negocio)

### Plataforma / Administración

- **Directorio de negocios** público con búsqueda
- **Admin panel** para gestión de cuentas, plantillas y suscripciones
- **Onboarding** guiado para nuevos negocios
- **SEO** con rutas limpias, sitemaps y meta tags
- **NFC** vinculación de tarjetas físicas a perfiles digitales
- **Predicciones ML** de comportamiento de clientes

---

## Estructura del Proyecto

```
jstackhub/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/          # Panel de administración
│   │   │   ├── Api/            # API REST (auth, pagos, webhooks)
│   │   │   ├── Client/         # Dashboard del cliente
│   │   │   ├── Public/         # Tienda pública + auth de customer
│   │   │   ├── Settings/       # Configuraciones
│   │   │   └── Auth/           # OAuth (Google)
│   │   └── Middleware/
│   ├── Models/                 # Eloquent models
│   └── Services/
│       ├── CulqiService.php    # Pagos (tokenización + cobro)
│       ├── WhatsAppService.php # Meta WhatsApp Business API
│       ├── CustomerService.php # Gestión de clientes
│       ├── MlPredictionService.php  # Predicciones ML
│       └── WhatsAppMessages/   # Templates de mensajes
│           ├── OrderMessages.php
│           └── BookingMessages.php
├── database/
│   ├── migrations/             # 40+ migraciones
│   └── seeders/
├── resources/
│   └── js/
│       ├── app.tsx             # Entry point React
│       ├── ssr.tsx             # SSR entry point
│       ├── pages/
│       │   ├── web/            # Páginas públicas (landing, directorio, NFC)
│       │   ├── auth/           # Autenticación
│       │   ├── Client/         # Dashboard del cliente
│       │   │   ├── Products/   # Gestión de productos
│       │   │   ├── Orders/     # Gestión de pedidos
│       │   │   ├── Categories/ # Categorías
│       │   │   ├── Brands/     # Marcas
│       │   │   └── TemplateEditor.tsx  # Editor de plantilla
│       │   ├── Store/          # Tienda pública
│       │   │   ├── templates/  # NikeStyleTemplate, ValentineTemplate
│       │   │   ├── components/ # Header, Footer, ProductCard, Cart, etc.
│       │   │   └── context/    # StoreProvider + useStore (carrito)
│       │   ├── Templates/      # Plantillas de perfil (Barber, Cafe, etc.)
│       │   ├── settings/       # Configuraciones del usuario
│       │   ├── Admin/          # Panel admin
│       │   └── Onboarding/     # Flujo de onboarding
│       └── components/
│           ├── ui/             # Radix UI + componentes base
│           ├── app-sidebar.tsx # Navegación lateral
│           └── ...             # Componentes específicos
├── routes/
│   ├── web.php                 # Rutas web (dashboard + tienda pública)
│   ├── api.php                 # API REST
│   └── settings.php            # Rutas de configuración
└── config/
    └── services.php            # Culqi, WhatsApp, Brevo, Google OAuth
```

---

## Modelos de Datos

### Modelos Principales

**Account** - Representa un negocio/tienda
```php
id, user_id, name, slug, subscription_id
payment_settings (JSON)      // config Culqi del negocio
store_template_config (JSON) // config visual de la tienda
```

**Product** - Producto del catálogo
```php
id, account_id, category_id, brand_id
name, description, slug, price, stock
image_url, is_available, is_featured
specs (JSON)   // especificaciones técnicas
order_column   // orden de visualización
```

**Order** - Pedido de un cliente
```php
id, account_id, customer_id
status: pending|confirmed|processing|shipped|delivered|cancelled
payment_status: pending|paid|failed|refunded
total, items (JSON), notes
notification_channel: whatsapp|email|none
```

**Customer** - Comprador vinculado a una tienda
```php
id, account_id, user_id (nullable)
name, email, phone (nullable)
addresses (JSON)   // múltiples direcciones guardadas
// Unique: (account_id, user_id)
```

**Profile** - Perfil público del negocio
```php
id, account_id, slug, template_slug
data (JSON)   // accent_color, services[], social_links{}, etc.
```

### Relaciones Clave

```
User → hasMany → Account (es dueño de múltiples negocios)
Account → hasMany → Profile, Product, Order, Customer, Booking
Customer → belongsTo → Account + User (comprador en esa tienda)
Order → hasMany → OrderItem → belongsTo → Product
ProductCategory → belongsTo → ProductCategory (subcategorías)
```

---

## Plantillas Disponibles

### Plantillas de Perfil/NFC (TSX)

| Plantilla | Descripción | Archivo |
|-----------|-------------|---------|
| Barber | Barbería clásica | `BarberTemplate.tsx` |
| Classic Barber | Barbería vintage | `ClassicBarberTemplate.tsx` |
| Natural Cafe | Cafetería/restaurante | `NaturalCafeTemplate.tsx` |
| Car Wash | Lavado de autos | `CarWashTemplate.tsx` |
| Academy | Institución educativa | `AcademyTemplate.tsx` |
| Modern Minimal | Diseño minimalista | `ModernMinimalTemplate.tsx` |
| Personal 3D | Portfolio personal | `PersonalProfile3D.tsx` |
| Product Showcase | Vitrina de productos | `ProductShowcaseTemplate.tsx` |
| Tribio | Plantilla de marca | `TribioTemplate.tsx` |
| Wellness Coach | Salud y bienestar | `WellnessCoachTemplate.tsx` |

### Plantillas de Tienda (Store Templates)

| Plantilla | Descripción | Archivo |
|-----------|-------------|---------|
| Nike Style | E-commerce moderno | `Store/templates/NikeStyleTemplate.tsx` |
| Valentine | Especial/romántico | `Store/templates/ValentineTemplate.tsx` |
| Standard | Básica por defecto | `Templates/Standard.tsx` |

Cada plantilla de tienda maneja múltiples vistas (home, catalog, product, checkout) según el prop `page_type`.

---

## Integraciones

### Culqi (Pagos)

- Frontend: `Culqi.js` cargado via `<script>` tag
- Flujo: `window.culqi()` callback → token → POST `/api/payments/charge`
- Backend: `CulqiService.php` maneja tokenización y cobro
- Webhook: `/api/payments/webhook` para notificaciones de Culqi
- Configuración: `CULQI_PUBLIC_KEY`, `CULQI_SECRET_KEY` en `.env`

### WhatsApp Business API

- Proveedor: Meta WhatsApp Business API
- Triggers: confirmación de pedido, nuevo pedido al negocio
- Templates registrados: `order_confirmation`, `new_order_business`
- Webhook: `/api/whatsapp/webhook`
- Configuración: `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`

### Brevo (Email + SMS)

- Emails transaccionales (confirmaciones, recuperación de contraseña)
- SMS opcionales
- Configuración: `BREVO_API_KEY`, SMTP credentials

### Google OAuth

- Login social con Google
- Ruta: `/auth/google/redirect` → `/auth/google/callback`
- Configuración: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

---

## Instalación

### Prerrequisitos

- PHP 8.2+
- Composer
- Node.js 20+
- MySQL 8.0+ o SQLite
- Git

### Pasos

```bash
# 1. Clonar el repositorio
git clone <repo-url> tribio
cd tribio

# 2. Instalar dependencias PHP
composer install

# 3. Instalar dependencias JavaScript
npm install

# 4. Configurar entorno
cp .env.example .env
php artisan key:generate

# 5. Configurar base de datos en .env
# DB_DATABASE=tribio
# DB_USERNAME=root
# DB_PASSWORD=...

# 6. Ejecutar migraciones y seeders
php artisan migrate --seed

# 7. Crear enlace simbólico para storage
php artisan storage:link

# 8. Compilar assets
npm run build

# 9. Iniciar servidor de desarrollo
php artisan serve
npm run dev   # en otra terminal
```

---

## Variables de Entorno

### Configuración Base

```env
APP_NAME=tribio
APP_URL=https://tribio.pe
APP_ENV=production   # local | production

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tribio
DB_USERNAME=root
DB_PASSWORD=

MAIL_MAILER=smtp
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=...
MAIL_PASSWORD=...
MAIL_FROM_ADDRESS=hola@tribio.pe
```

### Servicios Externos

```env
# Culqi - Pagos
CULQI_PUBLIC_KEY=pk_...
CULQI_SECRET_KEY=sk_...

# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_VERIFY_TOKEN=...
WHATSAPP_BUSINESS_ACCOUNT_ID=...

# Brevo - Email/SMS
BREVO_API_KEY=xkeysib-...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=${APP_URL}/auth/google/callback
```

---

## Rutas Principales

### Rutas Públicas

| Ruta | Descripción |
|------|-------------|
| `GET /` | Landing page |
| `GET /directorio` | Directorio de negocios |
| `GET /precios` | Página de precios |
| `GET /comprar-tarjeta-nfc` | Compra de tarjeta NFC |
| `GET /{slug}` | Perfil público del negocio |
| `GET /{slug}/tienda` | Tienda del negocio |
| `GET /{slug}/productos` | Catálogo de productos |
| `GET /{slug}/producto/{product_slug}` | Detalle de producto |
| `GET /{slug}/checkout` | Checkout de la tienda |

### Rutas del Dashboard (Auth)

| Ruta | Descripción |
|------|-------------|
| `GET /dashboard` | Dashboard del cliente |
| `GET /products` | Gestión de productos |
| `GET /orders` | Gestión de pedidos |
| `GET /clients` | Gestión de clientes |
| `GET /appointments` | Gestión de citas |
| `GET /reviews` | Gestión de reseñas |
| `GET /settings/business` | Config del negocio |
| `GET /settings/page` | Config del perfil/tienda |
| `GET /settings/templates` | Selector de plantilla |

### API

| Ruta | Descripción |
|------|-------------|
| `POST /api/payments/charge` | Cobrar con Culqi |
| `POST /api/whatsapp/webhook` | Webhook WhatsApp |
| `GET /api/directory` | Directorio (público) |
| `GET /api/templates` | Catálogo de plantillas |
| `POST /api/account/products` | CRUD productos (auth) |
| `POST /api/account/orders` | CRUD pedidos (auth) |

---

## Flujos de Usuario

### Flujo: Nuevo Negocio

```
Registro → Onboarding (nombre, tipo de negocio, plantilla)
        → Dashboard → Configurar perfil/tienda
        → Agregar productos → Publicar
```

### Flujo: Compra en Tienda

```
/{slug}/tienda → Navegar catálogo → Agregar al carrito
              → /{slug}/checkout → Ingresar datos
              → Culqi tokeniza tarjeta → POST /api/payments/charge
              → Pedido creado → WhatsApp al comprador + negocio
```

### Flujo: Tarjeta NFC

```
Comprar tarjeta NFC en /comprar-tarjeta-nfc
  → Recibir tarjeta física
  → Programar NFC con URL del perfil (/{slug})
  → Cliente toca tarjeta → Abre perfil del negocio
```

### Flujo: Gestión de Pedido

```
Pedido llega → Notificación WhatsApp al negocio
             → Dashboard → Pedidos → Ver detalle
             → Cambiar estado (pending → confirmed → shipped → delivered)
             → Notificación al cliente en cada cambio
```

---

## Desarrollo

### Comandos Frecuentes

```bash
# Desarrollo
npm run dev          # Vite dev server (hot reload)
php artisan serve    # Laravel dev server

# Build
npm run build        # Producción
npm run build:ssr    # Build con SSR

# Base de datos
php artisan migrate
php artisan migrate:fresh --seed   # Reset completo
php artisan db:seed --class=ValentineTemplateSeeder

# Cache
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Agregar una Nueva Plantilla de Perfil

1. Crear `resources/js/pages/Templates/NuevaPlantilla.tsx`
2. Registrar en la DB via migration/seeder
3. Agregar al `TemplateSelector.tsx`
4. El `ProfileDisplayController` la renderizará automáticamente

### Agregar Campos a Products

1. Crear migración: `php artisan make:migration add_campo_to_products_table`
2. Agregar al `$fillable` de `Product.php`
3. Actualizar `ProductController.php` (validation + store/update)
4. Actualizar tipos TypeScript en `Store/types/`
5. Actualizar UI en `Client/Products/Index.tsx`

---

## Convenciones de Código

- **PHP:** PSR-12, Laravel conventions
- **TypeScript:** Tipos explícitos en props de componentes React
- **Componentes:** PascalCase, un componente por archivo
- **CSS:** Utility-first con Tailwind, sin CSS custom salvo casos excepcionales
- **Props Inertia:** Siempre tipar con interfaces TypeScript en el componente

---

## Licencia

Proyecto privado - JStack. Todos los derechos reservados.
