# 📱 Configuración de WhatsApp Business API (Meta)

## 🎯 Descripción

Este documento describe cómo configurar e integrar la **WhatsApp Business API** oficial de Meta para enviar notificaciones automáticas a tus clientes en JStackHub.

## 📋 Requisitos Previos

1. Una cuenta de **Meta for Developers** (Facebook Developers)
2. Acceso a **WhatsApp Business API** (Cloud API)
3. Un número de teléfono verificado para WhatsApp Business
4. PHP 8.2+ con extensión cURL habilitada

## 🚀 Paso 1: Crear App en Meta for Developers

### 1.1 Crear una Nueva App

1. Ve a [https://developers.facebook.com/apps/](https://developers.facebook.com/apps/)
2. Haz clic en **"Create App"** (Crear aplicación)
3. Selecciona **"Business"** como tipo de app
4. Completa la información:
   - **App Name**: JStackHub Notifications
   - **App Contact Email**: tu@email.com
   - **Business Account**: Selecciona o crea una cuenta de negocio

### 1.2 Agregar Producto WhatsApp

1. En el dashboard de tu app, haz clic en **"Add Product"**
2. Busca **"WhatsApp"** y haz clic en **"Set Up"**
3. Selecciona **"WhatsApp Business API"** (Cloud API)

## 🔑 Paso 2: Obtener Credenciales

### 2.1 Obtener Access Token (Token de Acceso)

**Opción A: Token Temporal (Para Testing - 24 horas)**
1. Ve a **WhatsApp > Getting Started** en tu app
2. Copia el **"Temporary access token"**
3. Úsalo para pruebas inmediatas

**Opción B: Token Permanente (Para Producción)**
1. Ve a **WhatsApp > Configuration**
2. Crea un **System User** en tu Business Account
3. Genera un **Permanent Token** con permisos:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
4. Guarda este token de forma segura

### 2.2 Obtener Phone Number ID

1. Ve a **WhatsApp > Getting Started**
2. En la sección **"Send and receive messages"**, encontrarás:
   - **Phone Number ID**: Un ID numérico largo (ej: `109876543210987`)
   - **WhatsApp Business Phone Number**: Tu número registrado (ej: `+51987654321`)
3. Copia ambos valores

### 2.3 Configurar Webhook (Opcional - Para recibir mensajes)

1. Ve a **WhatsApp > Configuration > Webhook**
2. Configura:
   - **Callback URL**: `https://tudominio.com/api/whatsapp/webhook`
   - **Verify Token**: Genera uno con `php artisan tinker` → `Str::random(32)`
3. Suscríbete a los eventos:
   - `messages` (para recibir mensajes)
   - `message_status` (para estado de entrega)

## ⚙️ Paso 3: Configurar Variables de Entorno

Edita tu archivo `.env` y agrega:

```env
# WhatsApp Business API (Meta)
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=109876543210987
WHATSAPP_BUSINESS_PHONE_NUMBER=+51987654321
WHATSAPP_API_VERSION=v21.0
WHATSAPP_WEBHOOK_VERIFY_TOKEN=tu_token_secreto_aqui
```

### Valores a Reemplazar:

- `WHATSAPP_ACCESS_TOKEN`: Token permanente o temporal de Meta
- `WHATSAPP_PHONE_NUMBER_ID`: ID del número de WhatsApp Business
- `WHATSAPP_BUSINESS_PHONE_NUMBER`: Tu número en formato internacional (+código país)
- `WHATSAPP_API_VERSION`: Versión de la API (recomendado: v21.0 o superior)
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`: Token de seguridad para verificar webhooks

## 🧪 Paso 4: Probar la Integración

### 4.1 Verificar Configuración

Ejecuta en tu terminal:

```bash
php artisan tinker
```

Luego ejecuta:

```php
$whatsapp = app(\App\Services\WhatsAppService::class);

// Verificar si está configurado
if ($whatsapp->isConfigured()) {
    echo "✅ WhatsApp API configurada correctamente\n";
} else {
    echo "❌ Falta configuración de WhatsApp API\n";
}

// Obtener info del perfil de negocio
$profile = $whatsapp->getBusinessProfile();
print_r($profile);
```

### 4.2 Enviar Mensaje de Prueba

```php
$whatsapp = app(\App\Services\WhatsAppService::class);

// Enviar mensaje de prueba a tu número
$resultado = $whatsapp->sendTextMessage(
    '+51987654321', // Tu número de WhatsApp
    '¡Hola! Este es un mensaje de prueba desde JStackHub 🚀'
);

if ($resultado) {
    echo "✅ Mensaje enviado correctamente\n";
} else {
    echo "❌ Error al enviar mensaje\n";
}
```

### 4.3 Probar desde la App

1. Crea una reserva o pedido desde tu perfil público
2. Selecciona **WhatsApp** como canal de notificación
3. Ingresa tu número de teléfono
4. Completa el proceso
5. Verifica que recibiste el mensaje en WhatsApp

## 📝 Paso 5: Crear Plantillas de Mensajes (Opcional)

WhatsApp requiere **plantillas aprobadas** para ciertos casos de uso (marketing, notificaciones proactivas).

### 5.1 Crear Plantilla en Meta

1. Ve a **WhatsApp > Message Templates**
2. Haz clic en **"Create Template"**
3. Completa:
   - **Template Name**: `nueva_reserva`
   - **Category**: `TRANSACTIONAL`
   - **Language**: Spanish (ES)
   - **Content**:
     ```
     Hola {{1}}, tu reserva en {{2}} para el {{3}} a las {{4}} ha sido confirmada. ¡Te esperamos! 😊
     ```
4. Envía para aprobación (usualmente aprobado en minutos)

### 5.2 Usar Plantilla en el Código

```php
$whatsapp = app(\App\Services\WhatsAppService::class);

$whatsapp->sendTemplateMessage(
    '+51987654321',
    'nueva_reserva', // Nombre de la plantilla
    [
        'Juan Pérez',           // {{1}} - Nombre del cliente
        'Barbería Moderna',     // {{2}} - Nombre del negocio
        '15 de enero',          // {{3}} - Fecha
        '15:00'                 // {{4}} - Hora
    ],
    'es' // Código de idioma
);
```

## 🎨 Funcionalidades Implementadas

### ✅ Bookings (Reservas)

- ✅ Confirmación de reserva creada
- ✅ Notificación de reserva confirmada
- ✅ Notificación de reserva cancelada
- ✅ Notificación de reserva completada
- ✅ Recordatorio 24h antes (implementar en cron job)

### ✅ Orders (Pedidos)

- ✅ Confirmación de pedido creado
- ✅ Notificación: Pedido en preparación
- ✅ Notificación: Pedido listo
- ✅ Notificación: Pedido entregado
- ✅ Notificación: Pedido cancelado

### 📍 Ubicación de los Mensajes

**Plantillas de Mensajes:**
- `app/Services/WhatsAppMessages/BookingMessages.php`
- `app/Services/WhatsAppMessages/OrderMessages.php`

**Servicio Principal:**
- `app/Services/WhatsAppService.php`

**Controladores Integrados:**
- `app/Http/Controllers/Api/BookingController.php`
- `app/Http/Controllers/Api/OrderController.php`
- `app/Http/Controllers/PublicCheckoutController.php`

## 🔒 Seguridad y Mejores Prácticas

### 1. Proteger Access Token

```php
// ❌ MAL - Nunca hagas esto
$token = 'EAAxxxxxxxxxxxxx';

// ✅ BIEN - Siempre usa config()
$token = config('services.whatsapp.access_token');
```

### 2. Validar Números de Teléfono

El servicio WhatsApp automáticamente:
- Limpia caracteres no numéricos
- Agrega código de país (51 para Perú) si falta
- Valida formato antes de enviar

### 3. Manejo de Errores

Todos los métodos retornan `true/false` y loguean errores:

```php
if ($whatsapp->sendTextMessage($phone, $message)) {
    // Éxito
} else {
    // Revisar logs: storage/logs/laravel.log
}
```

### 4. Rate Limits

WhatsApp tiene límites de mensajes:
- **Tier 1**: 1,000 conversaciones únicas/día
- **Tier 2**: 10,000 conversaciones únicas/día
- **Tier 3**: 100,000 conversaciones únicas/día

## 📊 Monitoreo y Logs

### Ver Logs de WhatsApp

```bash
# Ver logs en tiempo real
tail -f storage/logs/laravel.log | grep WhatsApp

# Filtrar solo errores
tail -f storage/logs/laravel.log | grep "❌.*WhatsApp"

# Ver logs de éxito
tail -f storage/logs/laravel.log | grep "✅.*WhatsApp"
```

### Logs Generados

- `✅ Mensaje WhatsApp enviado` - Mensaje enviado correctamente
- `❌ Error enviando mensaje WhatsApp` - Error en envío
- `⚠️ WhatsApp API no configurada` - Faltan credenciales

## 🐛 Solución de Problemas

### Problema 1: "WhatsApp API no configurada correctamente"

**Solución:**
```bash
# Verificar variables de entorno
php artisan config:cache
php artisan config:clear

# Verificar que existen en .env
grep WHATSAPP .env
```

### Problema 2: "Error 190 - Invalid OAuth access token"

**Solución:**
- Token expirado (si es temporal)
- Genera un token permanente desde Meta Business Settings
- Actualiza `WHATSAPP_ACCESS_TOKEN` en `.env`

### Problema 3: "Error 100 - Invalid phone number"

**Solución:**
- Verifica formato: `+51987654321` (con código de país)
- Asegúrate que el número tiene WhatsApp activo
- Durante pruebas, solo puedes enviar a números registrados en Meta

### Problema 4: No llegan los mensajes

**Checklist:**
1. ✅ Verificar que `WHATSAPP_ACCESS_TOKEN` está configurado
2. ✅ Verificar que `WHATSAPP_PHONE_NUMBER_ID` es correcto
3. ✅ Revisar `storage/logs/laravel.log` para errores
4. ✅ Verificar límites de mensajes en Meta Dashboard
5. ✅ Confirmar que el número destino tiene WhatsApp

## 📚 Recursos Adicionales

- [Documentación Oficial WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Message Templates Guidelines](https://developers.facebook.com/docs/whatsapp/message-templates)
- [WhatsApp Business Platform](https://business.whatsapp.com/)
- [Meta for Developers](https://developers.facebook.com/)

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs: `storage/logs/laravel.log`
2. Verifica la configuración: `php artisan config:cache`
3. Consulta el dashboard de Meta para ver el estado de la API
4. Contacta al equipo de desarrollo

---

**Última actualización:** 2026-01-08
**Versión:** 1.0.0
**Desarrollado para:** JStackHub - Sistema NFC Digital
