# Configuración de Cron Jobs Externos

Esta guía te muestra cómo configurar el envío automático de correos usando servicios de cron externos gratuitos.

## 1. Configurar Token de Seguridad (Recomendado)

Edita tu archivo `.env` y agrega:

```env
CRON_TOKEN=tu-token-secreto-aleatorio-aqui
```

Puedes generar un token aleatorio ejecutando:
```bash
php artisan tinker
>>> Str::random(32)
```

## 2. URL del Cron Job

La URL que debes configurar en el servicio de cron es:

```
https://tudominio.com/api/cron/send-emails?token=tu-token-secreto-aleatorio-aqui
```

**Importante:** Reemplaza `tudominio.com` con tu dominio real y `tu-token-secreto-aleatorio-aqui` con el token que configuraste.

## 3. Servicios de Cron Externos Gratuitos

### Opción 1: cron-job.org (Recomendado)

**Ventajas:** Gratuito, confiable, fácil de usar, permite 1 minuto de intervalo.

**Pasos:**
1. Ve a https://cron-job.org
2. Crea una cuenta gratuita
3. Haz clic en "Create cronjob"
4. Configura:
   - **Title:** Envío de correos JStack
   - **URL:** `https://tudominio.com/api/cron/send-emails?token=TU_TOKEN`
   - **Schedule:** Cada 5 minutos (*/5 * * * *)
   - **Enabled:** ✓
5. Guarda el cron job

**Expresión de tiempo:**
- Cada 5 minutos: `*/5 * * * *`
- Cada 10 minutos: `*/10 * * * *`
- Cada 30 minutos: `*/30 * * * *`
- Cada hora: `0 * * * *`

---

### Opción 2: EasyCron

**Ventajas:** 100 ejecuciones/día gratis, interfaz simple.

**Pasos:**
1. Ve a https://www.easycron.com
2. Regístrate gratis
3. Haz clic en "Add Cron Job"
4. Configura:
   - **URL:** `https://tudominio.com/api/cron/send-emails?token=TU_TOKEN`
   - **Cron Expression:** `*/5 * * * *` (cada 5 minutos)
5. Guarda

---

### Opción 3: cPanel (Si tu hosting lo tiene)

Si tu hosting tiene cPanel:

**Pasos:**
1. Inicia sesión en cPanel
2. Busca "Cron Jobs"
3. En "Add New Cron Job":
   - **Minuto:** `*/5`
   - **Hora:** `*`
   - **Día:** `*`
   - **Mes:** `*`
   - **Día de la semana:** `*`
   - **Comando:**
     ```bash
     curl -s "https://tudominio.com/api/cron/send-emails?token=TU_TOKEN"
     ```
4. Guarda

---

### Opción 4: SetCronJob

**Ventajas:** Gratis, sin registro para comenzar.

**Pasos:**
1. Ve a https://www.setcronjob.com
2. Regístrate gratis
3. Agrega un nuevo cron job:
   - **URL:** `https://tudominio.com/api/cron/send-emails?token=TU_TOKEN`
   - **Interval:** Cada 5 minutos
4. Activa el cron job

---

### Opción 5: Cronhub.io

**Ventajas:** Monitoreo de ejecución, alertas.

**Pasos:**
1. Ve a https://cronhub.io
2. Crea una cuenta gratuita
3. Crea un nuevo monitor:
   - **Schedule:** `*/5 * * * *`
   - **Webhook URL:** `https://tudominio.com/api/cron/send-emails?token=TU_TOKEN`
4. Activa

---

## 4. Configuración Recomendada

Para un sistema de correos eficiente:

- **Frecuencia:** Cada 5 minutos
- **Timeout:** 60 segundos
- **Método:** GET
- **Notificaciones:** Activar alertas si el cron falla

## 5. Verificar que Funciona

### Prueba Manual

Accede desde tu navegador a:
```
https://tudominio.com/api/cron/send-emails?token=TU_TOKEN
```

Deberías ver una respuesta JSON como:
```json
{
  "success": true,
  "message": "Comando ejecutado correctamente",
  "output": "..."
}
```

### Verificar Logs

Revisa los logs de Laravel:
```bash
tail -f storage/logs/laravel.log
```

### Probar desde Línea de Comandos

También puedes ejecutar el comando manualmente:
```bash
php artisan emails:send-pending
```

## 6. Monitoreo y Solución de Problemas

### Ver correos pendientes:
```bash
php artisan tinker
>>> \App\Models\PendingEmail::where('sent', false)->count()
```

### Ver correos con error:
```bash
php artisan tinker
>>> \App\Models\PendingEmail::whereNotNull('error')->get()
```

### Limpiar correos enviados antiguos:
```bash
php artisan tinker
>>> \App\Models\PendingEmail::where('sent', true)
    ->where('sent_at', '<', now()->subDays(30))
    ->delete()
```

## 7. Seguridad

- **SIEMPRE usa un token seguro** en producción
- No compartas tu token públicamente
- Cambia el token regularmente
- Revisa los logs para detectar accesos no autorizados

## 8. Alternativa: Usar el Scheduler de Laravel (Requiere acceso al servidor)

Si tienes acceso SSH al servidor, puedes usar el scheduler nativo de Laravel:

1. Edita `app/Console/Kernel.php`:
```php
protected function schedule(Schedule $schedule)
{
    $schedule->command('emails:send-pending')
             ->everyFiveMinutes()
             ->withoutOverlapping();
}
```

2. Agrega al crontab del servidor (solo UNA vez):
```bash
crontab -e
```

Agrega:
```
* * * * * cd /ruta/a/tu/proyecto && php artisan schedule:run >> /dev/null 2>&1
```

## 9. Preguntas Frecuentes

**P: ¿Cuántos correos se envían por ejecución?**
R: 10 correos por ejecución para evitar timeouts.

**P: ¿Qué pasa si un correo falla?**
R: Se guarda el error en la base de datos y se puede reintentar manualmente.

**P: ¿Puedo cambiar la cantidad de correos por ejecución?**
R: Sí, edita el valor `limit(10)` en `SendPendingEmails.php`.

**P: ¿Los servicios gratuitos son confiables?**
R: Para aplicaciones pequeñas-medianas sí. Para producción crítica, considera usar el scheduler de Laravel o servicios pagos.
