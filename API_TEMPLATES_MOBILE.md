# API de Plantillas para App Móvil

Documentación de endpoints para gestionar plantillas de barbería desde la aplicación móvil React Native.

## Base URL
```
https://tu-dominio.com/api
```

## Autenticación

Todas las rutas protegidas requieren autenticación con **Laravel Sanctum**.

Incluye el token en los headers:
```
Authorization: Bearer {token}
```

---

## Endpoints Públicos

### 1. Listar Plantillas Disponibles

Obtiene todas las plantillas activas disponibles para selección.

**Endpoint:** `GET /templates`

**Headers:**
```
Content-Type: application/json
```

**Query Parameters (Opcionales):**
- `category` (string): Filtrar por categoría (ej: "barber", "salon", "spa")
- `premium` (boolean): Filtrar por plantillas premium (true/false)

**Ejemplo Request:**
```javascript
const response = await fetch('https://tu-dominio.com/api/templates?category=barber', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
});

const data = await response.json();
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Majestic Barber",
      "slug": "majestic-barber",
      "description": "Plantilla premium para barberías modernas",
      "preview_image": "https://tu-dominio.com/storage/templates/majestic-preview.jpg",
      "category": "barber",
      "config": {
        "primaryColor": "#fbbf24",
        "backgroundColor": "#0f172a",
        "gradientFrom": "#fbbf24",
        "gradientTo": "#fcd34d",
        "defaultServices": [
          "Corte Clásico",
          "Skin Fade",
          "Barba Premium",
          "Perfilado"
        ]
      },
      "is_active": true,
      "is_premium": false,
      "created_at": "2026-01-05T10:00:00.000000Z",
      "updated_at": "2026-01-05T10:00:00.000000Z"
    }
  ]
}
```

**Respuesta Error (500):**
```json
{
  "success": false,
  "message": "Error al obtener plantillas",
  "error": "Mensaje de error detallado"
}
```

---

### 2. Obtener Detalles de una Plantilla

Obtiene los detalles completos de una plantilla específica.

**Endpoint:** `GET /templates/{id}`

**Headers:**
```
Content-Type: application/json
```

**Ejemplo Request:**
```javascript
const response = await fetch('https://tu-dominio.com/api/templates/1', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
});

const data = await response.json();
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Majestic Barber",
    "slug": "majestic-barber",
    "description": "Plantilla premium para barberías modernas",
    "preview_image": "https://tu-dominio.com/storage/templates/majestic-preview.jpg",
    "category": "barber",
    "config": {
      "primaryColor": "#fbbf24",
      "backgroundColor": "#0f172a",
      "gradientFrom": "#fbbf24",
      "gradientTo": "#fcd34d",
      "defaultServices": [
        "Corte Clásico",
        "Skin Fade",
        "Barba Premium"
      ]
    },
    "is_active": true,
    "is_premium": false
  }
}
```

**Respuesta Error (404):**
```json
{
  "success": false,
  "message": "Plantilla no encontrada",
  "error": "Mensaje de error"
}
```

---

## Endpoints Protegidos (Requieren Autenticación)

### 3. Obtener Plantilla Actual del Usuario

Obtiene la plantilla actualmente asignada a la cuenta del usuario autenticado.

**Endpoint:** `GET /account/template`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Ejemplo Request:**
```javascript
const response = await fetch('https://tu-dominio.com/api/account/template', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});

const data = await response.json();
```

**Respuesta Exitosa (200) - Con Plantilla:**
```json
{
  "success": true,
  "data": {
    "template": {
      "id": 1,
      "name": "Majestic Barber",
      "slug": "majestic-barber",
      "description": "Plantilla premium",
      "config": {
        "primaryColor": "#fbbf24",
        "backgroundColor": "#0f172a"
      }
    },
    "customizations": {
      "primaryColor": "#ef4444",
      "businessName": "Mi Barbería",
      "services": ["Corte", "Barba", "Tinte"]
    }
  }
}
```

**Respuesta Exitosa (200) - Sin Plantilla:**
```json
{
  "success": true,
  "data": null,
  "message": "No hay plantilla asignada"
}
```

**Respuesta Error (404):**
```json
{
  "success": false,
  "message": "No se encontró una cuenta asociada al usuario"
}
```

---

### 4. Aplicar Plantilla a la Cuenta

Asigna una plantilla a la cuenta del usuario autenticado. Si ya tiene una plantilla, se reemplaza.

**Endpoint:** `POST /account/template`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body Parameters:**
- `template_id` (integer, required): ID de la plantilla a aplicar
- `customizations` (object, optional): Personalizaciones sobre la plantilla base

**Ejemplo Request:**
```javascript
const response = await fetch('https://tu-dominio.com/api/account/template', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    template_id: 1,
    customizations: {
      primaryColor: '#ef4444',
      backgroundColor: '#1e293b',
      businessName: 'Tony\'s Barber Shop',
      businessTitle: 'Barbería Premium',
      services: [
        'Corte Clásico',
        'Fade',
        'Barba',
        'Diseño'
      ],
      schedule: 'Lun-Sab 9:00 AM - 8:00 PM',
      socialLinks: {
        whatsapp: 'https://wa.me/1234567890',
        instagram: 'https://instagram.com/tonysbarber',
        tiktok: 'https://tiktok.com/@tonysbarber'
      }
    }
  })
});

const data = await response.json();
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Plantilla aplicada exitosamente",
  "data": {
    "template": {
      "id": 1,
      "name": "Majestic Barber",
      "config": { ... }
    },
    "customizations": {
      "primaryColor": "#ef4444",
      "businessName": "Tony's Barber Shop"
    }
  }
}
```

**Respuesta Error - Validación (422):**
```json
{
  "message": "The template id field is required.",
  "errors": {
    "template_id": [
      "The template id field is required."
    ]
  }
}
```

**Respuesta Error (500):**
```json
{
  "success": false,
  "message": "Error al aplicar plantilla",
  "error": "Mensaje de error detallado"
}
```

---

### 5. Actualizar Personalizaciones

Actualiza las personalizaciones de la plantilla actual sin cambiar la plantilla base.

**Endpoint:** `PUT /account/template/customize`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body Parameters:**
- `customizations` (object, required): Objeto con las personalizaciones

**Ejemplo Request:**
```javascript
const response = await fetch('https://tu-dominio.com/api/account/template/customize', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    customizations: {
      primaryColor: '#22c55e',
      services: [
        'Corte Premium',
        'Barba Deluxe',
        'Tinte Professional'
      ],
      schedule: 'Lun-Dom 10:00 AM - 9:00 PM'
    }
  })
});

const data = await response.json();
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Personalizaciones actualizadas exitosamente",
  "data": {
    "template_id": 1,
    "customizations": {
      "primaryColor": "#22c55e",
      "services": [
        "Corte Premium",
        "Barba Deluxe"
      ]
    }
  }
}
```

**Respuesta Error (404):**
```json
{
  "success": false,
  "message": "No hay plantilla asignada a esta cuenta"
}
```

---

## Estructura del Objeto `config` en Templates

Cada plantilla tiene un objeto `config` con la siguiente estructura:

```typescript
interface TemplateConfig {
  // Colores
  primaryColor: string;          // Color primario (hex)
  backgroundColor: string;        // Color de fondo (hex)
  gradientFrom: string;          // Color inicial del gradiente
  gradientTo: string;            // Color final del gradiente

  // Servicios por defecto
  defaultServices: string[];     // Array de servicios sugeridos

  // Opcionales
  defaultSchedule?: string;      // Horario sugerido
  defaultSocialIcons?: string[]; // Iconos de redes sugeridas
}
```

## Estructura del Objeto `customizations`

Las personalizaciones del usuario pueden incluir:

```typescript
interface Customizations {
  // Colores (sobrescriben config de plantilla)
  primaryColor?: string;
  backgroundColor?: string;
  gradientFrom?: string;
  gradientTo?: string;

  // Información del negocio
  businessName?: string;
  businessTitle?: string;
  businessBio?: string;

  // Imágenes (URLs)
  loadingImage?: string;
  coverImage?: string;
  logoImage?: string;

  // Servicios personalizados
  services?: string[];

  // Horario
  schedule?: string;

  // Redes sociales
  socialLinks?: {
    whatsapp?: string;
    instagram?: string;
    tiktok?: string;
    facebook?: string;
  };
}
```

---

## Flujo Completo en la App Móvil

### 1. Usuario inicia sesión
```javascript
// Login
const loginResponse = await fetch('https://tu-dominio.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'barbero@example.com',
    password: 'password123'
  })
});

const { token } = await loginResponse.json();
```

### 2. Verificar si tiene plantilla actual
```javascript
const currentTemplateResponse = await fetch('https://tu-dominio.com/api/account/template', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { data } = await currentTemplateResponse.json();
// Si data es null, no tiene plantilla
```

### 3. Listar plantillas disponibles
```javascript
const templatesResponse = await fetch('https://tu-dominio.com/api/templates?category=barber', {
  headers: { 'Content-Type': 'application/json' }
});

const { data: templates } = await templatesResponse.json();
// Mostrar lista de plantillas en la UI
```

### 4. Usuario selecciona plantilla y personaliza
```javascript
const applyResponse = await fetch('https://tu-dominio.com/api/account/template', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    template_id: selectedTemplateId,
    customizations: {
      primaryColor: userSelectedColor,
      businessName: userBusinessName,
      services: userServices,
      // ... más personalizaciones
    }
  })
});

const result = await applyResponse.json();
// Plantilla aplicada y publicada
```

### 5. Actualizar personalizaciones después
```javascript
const updateResponse = await fetch('https://tu-dominio.com/api/account/template/customize', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    customizations: {
      schedule: 'Nuevo horario actualizado'
    }
  })
});
```

---

## Códigos de Estado HTTP

- **200**: Éxito
- **401**: No autenticado (token inválido/expirado)
- **404**: Recurso no encontrado
- **422**: Error de validación
- **500**: Error del servidor

---

## Notas Importantes

1. **Autenticación**: Todas las rutas bajo `/account/*` requieren token de Sanctum
2. **Una plantilla por cuenta**: Solo puede haber una plantilla activa por cuenta
3. **Merge de configuración**: Las `customizations` se combinan con el `config` base de la plantilla
4. **Publicación automática**: Al aplicar/actualizar plantilla, los cambios son visibles inmediatamente en la web pública
5. **Imágenes**: Las URLs de imágenes en `customizations` deben ser URLs completas o rutas del storage

---

## Ejemplo de Componente React Native

```tsx
import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text } from 'react-native';

const TemplateSelector = ({ token }) => {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const response = await fetch('https://tu-dominio.com/api/templates', {
      headers: { 'Content-Type': 'application/json' }
    });
    const { data } = await response.json();
    setTemplates(data);
  };

  const applyTemplate = async (templateId) => {
    const response = await fetch('https://tu-dominio.com/api/account/template', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        template_id: templateId,
        customizations: {
          businessName: 'Mi Barbería'
        }
      })
    });

    const result = await response.json();
    if (result.success) {
      alert('Plantilla aplicada exitosamente');
    }
  };

  return (
    <FlatList
      data={templates}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => applyTemplate(item.id)}>
          <Text>{item.name}</Text>
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};

export default TemplateSelector;
```

---

## Soporte

Para dudas o problemas con la integración, contactar al equipo de desarrollo backend.
