# Guía Rápida: Sistema de Envío de Correos con Cron Jobs Externos

## ¿Qué se ha instalado?

Se ha configurado un sistema completo para enviar correos electrónicos de forma automática usando servicios de cron jobs externos (gratuitos).

## Archivos Creados

1. **Comando Artisan:** [app/Console/Commands/SendPendingEmails.php](app/Console/Commands/SendPendingEmails.php)
2. **Controlador API:** [app/Http/Controllers/Api/CronController.php](app/Http/Controllers/Api/CronController.php)
3. **Modelo:** [app/Models/PendingEmail.php](app/Models/PendingEmail.php)
4. **Migración:** Base de datos con tabla `pending_emails`
5. **Ruta API:** `/api/cron/send-emails`

## Configuración Inicial (IMPORTANTE)

### Paso 1: Agregar Token de Seguridad

Edita tu archivo `.env` y agrega esta línea:

```env
CRON_TOKEN=tu-token-secreto-aqui-12345678
```

**Genera un token seguro:**
```bash
php artisan tinker
Str::random(32)
exit
```

Copia el token generado y ponlo en tu `.env`.

### Paso 2: Obtener la URL de tu Aplicación

Tu URL del cron será:
```
https://TUDOMINIO.com/api/cron/send-emails?token=TU_TOKEN_DEL_ENV
```

Reemplaza:
- `TUDOMINIO.com` → Tu dominio real
- `TU_TOKEN_DEL_ENV` → El token que pusiste en `.env`

## Servicios Recomendados (Gratis)

### 🏆 Opción 1: cron-job.org (Más recomendado)

1. Ve a: https://cron-job.org
2. Regístrate gratis
3. Crear cron job:
   - **URL:** `https://tudominio.com/api/cron/send-emails?token=TU_TOKEN`
   - **Intervalo:** Cada 5 minutos
   - **Expresión:** `*/5 * * * *`

### 🌟 Opción 2: EasyCron

1. Ve a: https://www.easycron.com
2. Regístrate gratis (100 ejecuciones/día)
3. Agregar cron:
   - **URL:** `https://tudominio.com/api/cron/send-emails?token=TU_TOKEN`
   - **Intervalo:** Cada 5 minutos

### 💻 Opción 3: cPanel (Si tu hosting lo tiene)

1. Entra a cPanel
2. Busca "Cron Jobs"
3. Agregar:
   ```
   Minuto: */5
   Hora: *
   Día: *
   Mes: *
   Día semana: *
   Comando: curl -s "https://tudominio.com/api/cron/send-emails?token=TU_TOKEN"
   ```

## Cómo Funciona

### 1. Guardar un Correo en la Cola

Desde cualquier parte de tu código Laravel:

```php
use App\Models\PendingEmail;

PendingEmail::create([
    'to_email' => 'cliente@ejemplo.com',
    'subject' => 'Confirmación de Reserva',
    'body' => '<h1>Hola!</h1><p>Tu reserva ha sido confirmada.</p>',
    'attachments' => null // o un array de adjuntos
]);
```

### 2. El Cron Ejecuta Automáticamente

- Cada 5 minutos (o el intervalo que configures)
- Envía hasta 10 correos por ejecución
- Marca como enviados los exitosos
- Guarda errores para los fallidos

### 3. Verificar que Funciona

**Prueba manual en el navegador:**
```
https://tudominio.com/api/cron/send-emails?token=TU_TOKEN
```

Deberías ver:
```json
{
  "success": true,
  "message": "Comando ejecutado correctamente",
  "output": "..."
}
```

**Prueba desde línea de comandos:**
```bash
php artisan emails:send-pending
```

## Comandos Útiles

### Ver correos pendientes
```bash
php artisan tinker
\App\Models\PendingEmail::where('sent', false)->count()
exit
```

### Ver correos con error
```bash
php artisan tinker
\App\Models\PendingEmail::whereNotNull('error')->get()
exit
```

### Limpiar correos enviados viejos (más de 30 días)
```bash
php artisan tinker
\App\Models\PendingEmail::where('sent', true)
    ->where('sent_at', '<', now()->subDays(30))
    ->delete()
exit
```

### Reintentar correos con error
```bash
php artisan tinker
\App\Models\PendingEmail::whereNotNull('error')
    ->update(['error' => null])
exit
```

## Ejemplo Completo de Uso

```php
// En tu BookingController o donde quieras enviar correos

use App\Models\PendingEmail;

public function enviarConfirmacion($reserva)
{
    $html = view('emails.confirmacion-reserva', [
        'reserva' => $reserva
    ])->render();

    PendingEmail::create([
        'to_email' => $reserva->email,
        'subject' => 'Confirmación de tu Reserva #' . $reserva->id,
        'body' => $html
    ]);

    // El correo se enviará automáticamente en los próximos 5 minutos
    return response()->json(['message' => 'Correo programado']);
}
```

## Entendiendo los Logs

Cuando el cron se ejecuta correctamente, verás en los logs:

```
[2025-12-31 23:10:01] production.INFO: Ejecutando cron de envío de correos
[2025-12-31 23:10:01] production.INFO: Cron de envío de correos completado
```

Si dice **"No hay correos pendientes para enviar"** → ✅ **Esto es NORMAL**, significa que la cola está vacía.

Si dice **"Enviados: 1"** → ✅ **Perfecto**, se envió un correo exitosamente.

## Solución de Problemas

### El cron no se ejecuta
- Verifica que la URL sea accesible desde internet
- Revisa los logs del servicio de cron
- Verifica que el token sea correcto

### Los correos no se envían
- Verifica configuración SMTP en `.env`
- Revisa `storage/logs/laravel.log`
- Ejecuta manualmente: `php artisan emails:send-pending`

### Error de token
- Verifica que `CRON_TOKEN` esté en `.env`
- Asegúrate de usar el mismo token en la URL

### "No hay correos pendientes para enviar"
- Esto NO es un error, es normal cuando la cola está vacía
- El sistema está funcionando correctamente
- Solo enviará correos cuando agregues algunos a la cola

## Seguridad

- ✅ SIEMPRE usa un token seguro en producción
- ✅ NO compartas tu token públicamente
- ✅ Cambia el token periódicamente
- ✅ Revisa logs para detectar accesos no autorizados

## Documentación Completa

Para más detalles, revisa: [CRON_SETUP.md](CRON_SETUP.md)
