# WellnessCoach Template - Configuración Dinámica

## 📋 Resumen

Se implementó un sistema de configuración dinámica para el template `WellnessCoachTemplate` que permite:
- ✅ Ocultar/mostrar precios de productos
- ✅ Cambiar idioma entre Español/Inglés
- ✅ Mostrar descripción de productos
- ✅ Personalizar símbolo de moneda
- ✅ API para apps móviles

---

## 🗄️ Cambios en Base de Datos

### Nueva Columna: `template_config`

```sql
ALTER TABLE profiles ADD COLUMN template_config JSON NULL;
```

**Estructura JSON:**
```json
{
  "hide_prices": false,
  "language": "es",
  "show_description": true,
  "currency": "PEN",
  "currency_symbol": "S/"
}
```

---

## 🔌 API Endpoints

### 1. Obtener Configuración
```http
GET /api/{accountSlug}/template-config
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "hide_prices": false,
    "language": "es",
    "show_description": true,
    "currency": "PEN",
    "currency_symbol": "S/"
  }
}
```

### 2. Actualizar Configuración
```http
PUT /api/{accountSlug}/template-config
Content-Type: application/json

{
  "hide_prices": true,
  "language": "en",
  "show_description": true
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Template configuration updated successfully",
  "data": {
    "hide_prices": true,
    "language": "en",
    "show_description": true,
    "currency": "PEN",
    "currency_symbol": "S/"
  }
}
```

### 3. Resetear Configuración
```http
DELETE /api/{accountSlug}/template-config
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Template configuration reset to defaults"
}
```

---

## 💻 Uso en Frontend

### Configuración por Defecto

El template incluye valores por defecto si no hay configuración:

```typescript
const defaultConfig = {
  hide_prices: false,
  language: 'es',
  show_description: true,
  currency: 'PEN',
  currency_symbol: 'S/'
};
```

### Idiomas Soportados

**Español (es):**
- Buscar suplementos...
- Todos
- Destacados
- Catálogo Completo
- No se encontraron productos
- Galería
- Blog & Tips
- Testimonios
- Total a pagar
- Ver Pedido

**Inglés (en):**
- Search supplements...
- All
- Featured
- Full Catalog
- No products found
- Gallery
- Blog & Tips
- Testimonials
- Total to pay
- View Order

---

## 📱 Ejemplo de Uso para App Móvil

### Obtener configuración actual

```dart
// Flutter/Dart example
Future<TemplateConfig> getTemplateConfig(String accountSlug) async {
  final response = await http.get(
    Uri.parse('https://api.ejemplo.com/api/$accountSlug/template-config'),
  );
  
  if (response.statusCode == 200) {
    final data = json.decode(response.body);
    return TemplateConfig.fromJson(data['data']);
  }
  throw Exception('Failed to load config');
}
```

### Actualizar configuración

```dart
Future<void> updateTemplateConfig(
  String accountSlug,
  bool hidePrices,
  String language,
) async {
  final response = await http.put(
    Uri.parse('https://api.ejemplo.com/api/$accountSlug/template-config'),
    headers: {'Content-Type': 'application/json'},
    body: json.encode({
      'hide_prices': hidePrices,
      'language': language,
    }),
  );
  
  if (response.statusCode != 200) {
    throw Exception('Failed to update config');
  }
}
```

---

## 🎨 Comportamiento Visual

### Cuando `hide_prices = true`

- ❌ No se muestran precios en productos
- ✅ Se muestra descripción del producto (si existe)
- ✅ Botón "Agregar" sigue visible
- ✅ Carrito NO muestra total (si se desea implementar)

### Cuando `show_description = true`

- ✅ Se muestra descripción debajo del nombre del producto
- ✅ Máximo 2 líneas (line-clamp-2)
- ✅ Color gris claro para mejor contraste

### Cambio de Idioma

- ✅ Todos los textos del template cambian automáticamente
- ✅ Búsqueda, categorías, botones, títulos
- ✅ No afecta contenido de productos (nombre/descripción)

---

## 🔐 Seguridad

- ✅ Validación de datos en el backend
- ✅ Solo acepta valores permitidos para `language` ('es' | 'en')
- ✅ Tipos de datos validados (boolean, string)
- ✅ Sin autenticación requerida (público)

---

## 📝 Notas Técnicas

1. **Campo `description` en productos**: Asegúrate de que los productos tengan el campo `description` completado si quieres usar `show_description: true`

2. **Compatibilidad**: Solo aplica a `WellnessCoachTemplate`. Otros templates pueden implementar su propia lógica.

3. **Cache**: La configuración se lee directamente de la BD en cada request. Considera implementar cache si es necesario.

4. **Moneda**: El campo `currency` es informativo. El símbolo real usado es `currency_symbol`.

---

## 🚀 Próximas Mejoras

- [ ] Panel de administración web para cambiar configuración
- [ ] Más idiomas (Portugués, Francés, etc.)
- [ ] Configuración de colores dinámicos
- [ ] Ocultar carrito completo cuando hide_prices = true
- [ ] Modo catálogo (sin compras, solo visualización)

---

**Fecha de implementación:** 2026-01-09
**Versión:** 1.0.0
**Desarrollado por:** Sistema JStack NFC
