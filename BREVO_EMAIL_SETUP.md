# 📧 Configuración de Emails con Brevo (Sendinblue)

## Paso 1: Crear Cuenta en Brevo

1. Ve a https://www.brevo.com/
2. Haz clic en "Sign up free"
3. Completa el registro con tu email
4. Verifica tu email
5. Completa el onboarding básico

## Paso 2: Obtener tu API Key

1. Inicia sesión en Brevo
2. Ve a tu perfil (esquina superior derecha)
3. Click en **"SMTP & API"**
4. En la pestaña **"API Keys"**, haz clic en "Create a new API key"
5. Dale un nombre (ej: "TRIBIO Production")
6. **COPIA LA API KEY** (solo se muestra una vez)

## Paso 3: Configurar el .env

Abre tu archivo `.env` y agrega estas líneas:

```env
MAIL_MAILER=brevo
MAIL_FROM_ADDRESS="noreply@tribio.info"
MAIL_FROM_NAME="${APP_NAME}"

# Brevo API Key (reemplaza con tu API key real)
BREVO_KEY=xkeysib-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**IMPORTANTE**: Reemplaza `xkeysib-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` con tu API key real de Brevo.

## Paso 4: Verificar el Remitente en Brevo

Para que Brevo permita enviar emails, debes verificar tu dominio o email:

### Opción A: Verificar un Email Individual (Más Rápido)
1. En Brevo, ve a **Senders & IP**
2. Click en **Add a sender**
3. Ingresa el email que usarás (ej: `noreply@tribio.info`)
4. Brevo te enviará un email de verificación
5. Haz clic en el enlace de verificación

### Opción B: Verificar tu Dominio Completo (Recomendado para Producción)
1. En Brevo, ve a **Senders & IP**
2. Click en **Domains**
3. Agrega tu dominio (`tribio.info`)
4. Agrega los registros DNS que Brevo te proporcione:
   - TXT para verificación
   - SPF
   - DKIM
   - DMARC (opcional pero recomendado)
5. Espera a que se verifiquen (puede tomar hasta 48 horas)

## Paso 5: Limpiar la Caché de Configuración

Después de modificar el .env, limpia la caché de Laravel:

```bash
php artisan config:clear
php artisan cache:clear
```

## Paso 6: Iniciar el Worker de Colas (Queue)

Los emails se envían de forma asíncrona usando colas. Debes iniciar el queue worker:

```bash
php artisan queue:work
```

**Para producción**, configura un supervisor o usa `php artisan queue:listen` en background.

## Paso 7: Probar el Envío

### Opción A: Prueba Rápida con Tinker

```bash
php artisan tinker
```

Luego ejecuta:

```php
Mail::raw('Test email from TRIBIO', function ($message) {
    $message->to('tu@email.com')->subject('Test');
});
```

### Opción B: Crear una Reserva de Prueba

1. Ve a tu perfil público (ej: `https://tribio.info/anthony`)
2. Completa el formulario de reserva con tu email
3. Verifica que lleguen 2 emails:
   - Confirmación al cliente
   - Notificación al negocio

## Límites del Plan Gratuito de Brevo

- ✅ **300 emails/día**
- ✅ **9,000 emails/mes**
- ✅ Sin tarjeta de crédito requerida
- ✅ API completa disponible
- ✅ Plantillas de email
- ✅ Estadísticas de apertura y clics

## Características Implementadas

### 1. Email de Confirmación al Cliente
Cuando un cliente hace una reserva, recibe automáticamente un email con:
- ✅ Detalles de la cita (fecha, hora, servicio)
- ✅ Información del negocio (dirección, teléfono)
- ✅ Diseño profesional y responsive
- ✅ Botón para contactar al negocio

**Archivo**: `app/Mail/BookingConfirmation.php`
**Vista**: `resources/views/emails/booking-confirmation.blade.php`

### 2. Notificación al Dueño del Negocio
El dueño del negocio recibe un email de notificación con:
- ✅ Datos completos del cliente (nombre, email, teléfono)
- ✅ Detalles de la reserva (servicio, fecha, hora)
- ✅ Estado de la reserva
- ✅ Botón directo al panel de control
- ✅ Diseño profesional y responsive

**Archivo**: `app/Mail/NewBookingNotification.php`
**Vista**: `resources/views/emails/new-booking-notification.blade.php`

### 3. Envío Asíncrono
- Los emails se envían usando **Laravel Queues** para no bloquear la respuesta HTTP
- Si falla el envío de emails, la reserva se crea igualmente
- Los errores se registran en logs para debugging

## Troubleshooting

### Error: "Sender email not verified"
**Solución**: Ve a Brevo > Senders & IP y verifica tu email o dominio.

### Error: "Daily limit exceeded"
**Solución**: Has alcanzado el límite de 300 emails/día. Espera hasta mañana o actualiza tu plan.

### Los emails no llegan
**Solución**:
1. Verifica que la API key sea correcta
2. Revisa la carpeta de SPAM
3. Ve a Brevo > Logs para ver el estado de los envíos

## Monitoreo

Puedes ver todas las estadísticas en Brevo:
- Emails enviados
- Emails abiertos
- Clics en enlaces
- Rebotes
- Spam reports

Dashboard: https://app.brevo.com/

## Soporte

- Documentación: https://developers.brevo.com/
- API Reference: https://developers.brevo.com/reference
- Soporte: support@brevo.com
