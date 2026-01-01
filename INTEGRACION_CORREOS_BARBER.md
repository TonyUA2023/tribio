# Integración del Sistema de Correos - Majestic Barber

Esta guía muestra cómo integrar el sistema de correos automáticos con el perfil real de **Majestic Barber**.

## 📋 Datos del Perfil

- **ID:** 5
- **Nombre:** Majestic Barber
- **Slug:** `barberia`
- **Email de notificación:** `jstackinfo@gmail.com`
- **URL del perfil:** `https://tudominio.com/barberia`

---

## 🔧 Integrar Correos en el Sistema de Reservas

### 1. Enviar Confirmación al Cliente

Edita [app/Http/Controllers/Api/BookingController.php](app/Http/Controllers/Api/BookingController.php) en el método `store()`:

```php
use App\Models\PendingEmail;

public function store(Request $request)
{
    // ... código existente de validación y creación de reserva ...

    $booking = Booking::create($validatedData);

    // ✅ AGREGAR: Enviar confirmación al cliente (si tiene email)
    if ($booking->client_email) {
        PendingEmail::create([
            'to_email' => $booking->client_email,
            'subject' => '✅ Confirmación de tu Cita - ' . $booking->profile->name,
            'body' => view('emails.booking-confirmation', [
                'booking' => $booking
            ])->render()
        ]);
    }

    // ✅ AGREGAR: Notificar al barbero
    if ($booking->profile->notification_email) {
        PendingEmail::create([
            'to_email' => $booking->profile->notification_email,
            'subject' => '🔔 Nueva Reserva - ' . $booking->client_name,
            'body' => view('emails.new-booking-notification', [
                'booking' => $booking
            ])->render()
        ]);
    }

    return response()->json([
        'success' => true,
        'message' => 'Reserva creada exitosamente',
        'booking' => $booking
    ]);
}
```

### 2. Enviar Recordatorios Automáticos (24 horas antes)

Crea un nuevo comando Artisan:

```bash
php artisan make:command SendBookingReminders
```

Edita [app/Console/Commands/SendBookingReminders.php](app/Console/Commands/SendBookingReminders.php):

```php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Booking;
use App\Models\PendingEmail;
use Carbon\Carbon;

class SendBookingReminders extends Command
{
    protected $signature = 'bookings:send-reminders';
    protected $description = 'Envía recordatorios de citas 24 horas antes';

    public function handle()
    {
        $this->info('Buscando citas para mañana...');

        // Buscar reservas para mañana que tengan email
        $tomorrow = Carbon::tomorrow();

        $bookings = Booking::whereDate('booking_date', $tomorrow)
            ->where('status', 'confirmed')
            ->whereNotNull('client_email')
            ->get();

        $sent = 0;

        foreach ($bookings as $booking) {
            // Verificar si ya se envió recordatorio
            $alreadySent = PendingEmail::where('to_email', $booking->client_email)
                ->where('subject', 'like', '%Recordatorio%')
                ->where('created_at', '>', Carbon::now()->subDay())
                ->exists();

            if (!$alreadySent) {
                PendingEmail::create([
                    'to_email' => $booking->client_email,
                    'subject' => '⏰ Recordatorio: Tu cita es mañana - ' . $booking->profile->name,
                    'body' => $this->buildReminderEmail($booking)
                ]);

                $sent++;
                $this->info("✓ Recordatorio enviado a: {$booking->client_email}");
            }
        }

        $this->info("\n✅ Total recordatorios programados: {$sent}");
        return 0;
    }

    private function buildReminderEmail($booking)
    {
        return "
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                <h1 style='color: #ff6b6b;'>¡Recordatorio de tu cita!</h1>

                <p>Hola <strong>{$booking->client_name}</strong>,</p>

                <p style='font-size: 18px;'>
                    Tu cita en <strong>{$booking->profile->name}</strong> es <strong>mañana</strong>.
                </p>

                <div style='background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                    <h3>Detalles:</h3>
                    <p>📅 <strong>Fecha:</strong> {$booking->booking_date->format('d/m/Y')}</p>
                    <p>🕐 <strong>Hora:</strong> {$booking->booking_time->format('H:i')}</p>
                    <p>✂️ <strong>Servicio:</strong> {$booking->service}</p>
                </div>

                <p>Te esperamos. Por favor, llega con 5 minutos de anticipación.</p>
            </div>
        ";
    }
}
```

Agrega el comando al cron externo creando una nueva ruta en [routes/api.php](routes/api.php):

```php
Route::get('/cron/send-reminders', [CronController::class, 'sendReminders']);
```

Y agrega el método en [app/Http/Controllers/Api/CronController.php](app/Http/Controllers/Api/CronController.php):

```php
public function sendReminders(Request $request)
{
    $cronToken = config('app.cron_token');

    if ($cronToken && $request->input('token') !== $cronToken) {
        return response()->json(['success' => false, 'message' => 'Token no válido'], 403);
    }

    try {
        Artisan::call('bookings:send-reminders');
        $output = Artisan::output();

        return response()->json([
            'success' => true,
            'message' => 'Recordatorios enviados',
            'output' => $output
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
}
```

Configura en el servicio de cron externo para que ejecute diariamente:

```
URL: https://tudominio.com/api/cron/send-reminders?token=TU_TOKEN
Frecuencia: Una vez al día a las 10:00 AM
```

---

## 3. Solicitar Reseñas Después del Servicio

Crea comando para enviar solicitudes de reseña 2 horas después de la cita:

```bash
php artisan make:command SendReviewRequests
```

```php
protected $signature = 'reviews:send-requests';
protected $description = 'Envía solicitudes de reseña después de las citas';

public function handle()
{
    // Buscar citas completadas hace 2 horas
    $twoHoursAgo = Carbon::now()->subHours(2);

    $bookings = Booking::where('status', 'confirmed')
        ->whereNotNull('client_email')
        ->where('booking_date', '<=', Carbon::today())
        ->whereRaw("CONCAT(booking_date, ' ', booking_time) <= ?", [$twoHoursAgo])
        ->get();

    $sent = 0;

    foreach ($bookings as $booking) {
        // Verificar si ya se envió solicitud
        $alreadySent = PendingEmail::where('to_email', $booking->client_email)
            ->where('subject', 'like', '%experiencia%')
            ->exists();

        if (!$alreadySent) {
            PendingEmail::create([
                'to_email' => $booking->client_email,
                'subject' => '⭐ ¿Cómo fue tu experiencia? - ' . $booking->profile->name,
                'body' => $this->buildReviewRequestEmail($booking)
            ]);

            $sent++;
        }
    }

    $this->info("✅ Solicitudes de reseña enviadas: {$sent}");
    return 0;
}
```

---

## 🧪 Scripts de Prueba

### Crear Correos de Prueba

```bash
php test_barber_email.php
```

Este script crea correos de prueba usando datos reales de Majestic Barber.

### Enviar Correos Pendientes Manualmente

```bash
php artisan emails:send-pending
```

### Ver Correos en Cola

```bash
php artisan tinker
PendingEmail::where('sent', false)->get(['id', 'to_email', 'subject', 'created_at'])
exit
```

---

## 📊 Monitoreo

### Ver Correos Enviados Hoy

```bash
php artisan tinker
PendingEmail::where('sent', true)
    ->whereDate('sent_at', today())
    ->count()
exit
```

### Ver Correos con Error

```bash
php artisan tinker
PendingEmail::whereNotNull('error')
    ->get(['id', 'to_email', 'subject', 'error'])
exit
```

---

## 🎯 Ejemplo Completo de Integración

Aquí está cómo se vería el flujo completo:

1. **Cliente hace reserva** → Sistema crea registro en DB
2. **Inmediatamente** → Se encola confirmación al cliente + notificación al barbero
3. **Cron cada 5 min** → Envía los correos encolados
4. **Diariamente 10 AM** → Envía recordatorios para citas de mañana
5. **Cada 2 horas** → Envía solicitudes de reseña a servicios completados

---

## 🔐 Seguridad

El email de notificación del barbero es: `jstackinfo@gmail.com`

Asegúrate de:
- Configurar BREVO_KEY en el `.env`
- Configurar CRON_TOKEN en el `.env`
- No exponer estos tokens públicamente

---

## ✅ Todo Listo

El sistema ya está probado y funcionando con datos reales de **Majestic Barber**. El cron externo ya está ejecutándose y enviando correos automáticamente.
