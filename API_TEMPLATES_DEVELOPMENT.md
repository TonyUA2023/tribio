# API de Gestión de Plantillas - Documentación para Desarrollo

Este documento describe el flujo completo para desarrollar, probar y desplegar plantillas en el sistema TRIBIO NFC.

## 🎯 Flujo de Trabajo

### 1. Desarrollo Local
- Crear archivo de plantilla React/TypeScript en `resources/js/pages/Templates/`
- Diseñar usando componentes reutilizables
- Probar visualmente con datos fake

### 2. Previsualización
- Usar endpoint `/api/templates/preview/{slug}` para ver con datos de prueba
- Iterar y ajustar el diseño

### 3. Deployment (Subir a la Nube)
- Usar endpoint `/api/templates/create` para registrar en la base de datos
- La plantilla queda disponible para todas las cuentas

### 4. Uso por Clientes
- Los clientes seleccionan la plantilla desde la app móvil
- El sistema aplica automáticamente sus datos reales

---

## 📡 Endpoints de API

### 1. Crear Nueva Plantilla (Subir a la Nube)

**Endpoint:** `POST /api/templates/create`

**Requiere:** Autenticación (Bearer Token)

**Body:**
```json
{
  "name": "Urban Minimal Barber",
  "slug": "urban-minimal-barber",
  "description": "Plantilla minimalista con diseño urbano y moderno. Ideal para barberías premium.",
  "category": "barber",
  "is_premium": false,
  "config": {
    "primaryColor": "#06b6d4",
    "backgroundColor": "#18181b",
    "accentColor": "#38bdf8",
    "style": "minimal-urban",
    "pattern": "grid-subtle",
    "fontFamily": "sans-serif",
    "defaultServices": [
      "Corte Fade",
      "Barba Styling",
      "Diseño en Cabello",
      "Color Premium"
    ],
    "defaultSchedule": "Lun-Sáb 9:00 AM - 8:00 PM"
  }
}
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "message": "Plantilla creada y subida a la nube exitosamente",
  "data": {
    "id": 5,
    "name": "Urban Minimal Barber",
    "slug": "urban-minimal-barber",
    "description": "Plantilla minimalista con diseño urbano y moderno...",
    "category": "barber",
    "is_active": true,
    "is_premium": false,
    "config": { ... },
    "created_at": "2026-01-06T12:00:00.000000Z"
  }
}
```

---

### 2. Previsualizar Plantilla con Datos Fake

**Endpoint:** `GET /api/templates/preview/{slug}`

**Ejemplo:** `GET /api/templates/preview/urban-minimal-barber`

**Respuesta:**
```json
{
  "success": true,
  "message": "Vista previa con datos fake",
  "data": {
    "template": {
      "id": 5,
      "name": "Urban Minimal Barber",
      "slug": "urban-minimal-barber",
      "config": { ... }
    },
    "config": {
      "primaryColor": "#06b6d4",
      "backgroundColor": "#18181b",
      "accentColor": "#38bdf8",
      "businessName": "Demo Barber",
      "businessTitle": "Barbería Premium",
      "businessBio": "Esta es una previsualización con datos de prueba...",
      "businessCategory": "BARBER",
      "showRating": true,
      "rating": 5.0,
      "showVIP": true,
      "isPremium": false,
      "services": [
        "Corte Clásico",
        "Fade Moderno",
        "Barba Premium",
        "Diseño en Cabello",
        "Afeitado Tradicional",
        "Color & Tinte"
      ],
      "schedule": "Lun-Sáb 9:00 AM - 8:00 PM",
      "socialLinks": {
        "whatsapp": "https://wa.me/51987654321",
        "instagram": "https://instagram.com/demo_business",
        "facebook": "https://facebook.com/demo.business",
        "tiktok": "https://tiktok.com/@demo_business"
      },
      "gallery": [],
      "profileId": 0,
      "accountSlug": "preview-urban-minimal-barber"
    },
    "isPreview": true
  }
}
```

---

### 3. Actualizar Plantilla Existente

**Endpoint:** `PUT /api/templates/{id}`

**Body (todos los campos opcionales):**
```json
{
  "name": "Urban Minimal Barber v2",
  "description": "Versión actualizada con nuevas funcionalidades",
  "config": {
    "primaryColor": "#0ea5e9",
    "accentColor": "#38bdf8"
  }
}
```

---

### 4. Eliminar Plantilla

**Endpoint:** `DELETE /api/templates/{id}`

**Nota:** Solo se puede eliminar si ninguna cuenta la está usando.

**Respuesta si hay cuentas usándola (400):**
```json
{
  "success": false,
  "message": "No se puede eliminar. 15 cuenta(s) están usando esta plantilla"
}
```

---

### 5. Listar Plantillas (Catálogo Público)

**Endpoint:** `GET /api/templates?category=barber&premium=0`

**Query Parameters:**
- `category`: `barber`, `restaurant`, `salon`, `spa`, `gym`, `other`, `all`
- `premium`: `1` (solo premium), `0` (solo gratuitas), omitir (todas)

---

## 🏗️ Estructura de Configuración

Toda plantilla debe incluir estos campos en `config`:

### Colores (Requeridos)
```json
{
  "primaryColor": "#06b6d4",      // Color principal
  "backgroundColor": "#18181b",   // Fondo
  "accentColor": "#38bdf8"        // Color de acento
}
```

### Datos por Defecto (Recomendados)
```json
{
  "defaultServices": ["Servicio 1", "Servicio 2"],
  "defaultSchedule": "Lun-Vie 9AM-6PM",
  "style": "modern|classic|minimal|elegant",
  "pattern": "grid|dots|lines|none",
  "fontFamily": "sans-serif|serif|monospace"
}
```

### Opcionales
```json
{
  "gradientFrom": "#color",
  "gradientTo": "#color",
  "showRating": true,
  "showVIP": true,
  "isPremium": false
}
```

---

## 🎨 Categorías Disponibles

| Categoría | Descripción | Servicios Fake |
|-----------|-------------|----------------|
| `barber` | Barberías | Corte, Barba, Fade, Diseño |
| `restaurant` | Restaurantes | Desayunos, Almuerzos, Menú |
| `salon` | Salones de belleza | Corte, Tinte, Tratamientos |
| `spa` | Spas | Masajes, Facial, Aromaterapia |
| `gym` | Gimnasios | Membresías, Clases, Entrenamiento |
| `other` | Otros negocios | Servicios generales |

---

## 🔐 Autenticación

Todos los endpoints de gestión (crear, actualizar, eliminar) requieren autenticación:

```bash
curl -X POST https://api.tribio.com/api/templates/create \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Crear plantilla "Elegant Salon"

```bash
curl -X POST http://localhost:8000/api/templates/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Elegant Salon",
    "slug": "elegant-salon",
    "description": "Diseño elegante para salones de belleza premium",
    "category": "salon",
    "is_premium": true,
    "config": {
      "primaryColor": "#ec4899",
      "backgroundColor": "#18181b",
      "accentColor": "#f472b6",
      "style": "elegant",
      "fontFamily": "serif",
      "defaultServices": [
        "Corte & Peinado",
        "Tinte Premium",
        "Keratina Brasileña",
        "Tratamiento Capilar"
      ],
      "defaultSchedule": "Lun-Dom 10:00 AM - 8:00 PM"
    }
  }'
```

### Ejemplo 2: Previsualizar antes de crear

```bash
# 1. Primero crear la plantilla
curl -X POST http://localhost:8000/api/templates/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ ... }'

# 2. Luego previsualizar con datos fake
curl http://localhost:8000/api/templates/preview/elegant-salon
```

### Ejemplo 3: Actualizar colores

```bash
curl -X PUT http://localhost:8000/api/templates/5 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "primaryColor": "#db2777",
      "accentColor": "#ec4899"
    }
  }'
```

---

## 🚀 Workflow Recomendado

### Desarrollo Local

1. **Crear componente de plantilla:**
   ```bash
   # Crear archivo en resources/js/pages/Templates/ElegantSalon.tsx
   ```

2. **Probar localmente con datos fake:**
   - Acceder a `/preview/elegant-salon` (ruta especial de desarrollo)
   - Ajustar diseño iterativamente

3. **Registrar en base de datos:**
   ```bash
   curl -X POST /api/templates/create ...
   ```

4. **Verificar en catálogo:**
   ```bash
   curl /api/templates?category=salon
   ```

### Deploy a Producción

1. **Build de assets:**
   ```bash
   npm run build
   ```

2. **Subir plantilla a la nube:**
   - API crea registro en BD
   - Archivos TSX ya compilados en build

3. **Clientes pueden usar:**
   - App móvil lista plantillas
   - Cliente selecciona y aplica
   - Sistema merge datos reales del cliente

---

## 📝 Notas Importantes

1. **Slug único:** El slug debe ser único en toda la base de datos
2. **Immutabilidad:** Evita cambiar el slug de plantillas en producción
3. **Versionado:** Usa nombres descriptivos (v1, v2) para nuevas versiones
4. **Testing:** Siempre prueba con datos fake antes de publicar
5. **Compatibilidad:** Mantén retrocompatibilidad en el config

---

## 🐛 Errores Comunes

### Error: Slug duplicado
```json
{
  "success": false,
  "message": "Errores de validación",
  "errors": {
    "slug": ["The slug has already been taken."]
  }
}
```
**Solución:** Usar un slug diferente

### Error: Plantilla no encontrada en preview
```json
{
  "success": false,
  "message": "Plantilla no encontrada"
}
```
**Solución:** Verificar que la plantilla exista en la BD y el slug sea correcto

---

## 📞 Soporte

Para dudas o problemas con el sistema de plantillas:
- Email: dev@tribio.com
- Slack: #plantillas-desarrollo
