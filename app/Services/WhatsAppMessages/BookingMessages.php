<?php

namespace App\Services\WhatsAppMessages;

use App\Models\Booking;
use Carbon\Carbon;

/**
 * Plantillas de mensajes de WhatsApp para Bookings
 */
class BookingMessages
{
    /**
     * Mensaje de confirmación de reserva para el cliente
     */
    public static function bookingCreated(Booking $booking): string
    {
        $businessName = $booking->profile->business_name ?? $booking->profile->name ?? 'nuestro negocio';
        $date = Carbon::parse($booking->booking_date)->locale('es')->isoFormat('D [de] MMMM');
        $time = Carbon::parse($booking->booking_time)->format('H:i');
        $service = $booking->service ? " para *{$booking->service}*" : '';

        return "¡Hola {$booking->client_name}! 👋

Tu reserva en *{$businessName}*{$service} ha sido recibida.

📅 *Fecha:* {$date}
🕐 *Hora:* {$time}

Tu reserva está *pendiente de confirmación*. Te contactaremos pronto para confirmar tu cita.

¡Gracias por elegirnos! 🙌";
    }

    /**
     * Mensaje de reserva confirmada
     */
    public static function bookingConfirmed(Booking $booking): string
    {
        $businessName = $booking->profile->business_name ?? $booking->profile->name ?? 'nuestro negocio';
        $date = Carbon::parse($booking->booking_date)->locale('es')->isoFormat('D [de] MMMM');
        $time = Carbon::parse($booking->booking_time)->format('H:i');
        $service = $booking->service ? " - {$booking->service}" : '';

        return "✅ *RESERVA CONFIRMADA*

Hola {$booking->client_name},

Tu cita en *{$businessName}* ha sido confirmada.

📅 {$date}
🕐 {$time}
{$service}

*¡Te esperamos!* 😊

Si necesitas reagendar o cancelar, contáctanos lo antes posible.";
    }

    /**
     * Mensaje de reserva cancelada
     */
    public static function bookingCancelled(Booking $booking): string
    {
        $businessName = $booking->profile->business_name ?? $booking->profile->name ?? 'nuestro negocio';
        $date = Carbon::parse($booking->booking_date)->locale('es')->isoFormat('D [de] MMMM');
        $time = Carbon::parse($booking->booking_time)->format('H:i');

        return "❌ *RESERVA CANCELADA*

Hola {$booking->client_name},

Tu reserva en *{$businessName}* para el {$date} a las {$time} ha sido cancelada.

Si deseas reagendar, estamos a tu disposición.

¡Esperamos verte pronto! 🙏";
    }

    /**
     * Recordatorio de cita (para enviar 24h antes)
     */
    public static function bookingReminder(Booking $booking): string
    {
        $businessName = $booking->profile->business_name ?? $booking->profile->name ?? 'nuestro negocio';
        $time = Carbon::parse($booking->booking_time)->format('H:i');
        $service = $booking->service ? " para *{$booking->service}*" : '';

        $address = '';
        if (!empty($booking->profile->address)) {
            $address = "\n📍 *Dirección:* {$booking->profile->address}";
        }

        return "⏰ *RECORDATORIO DE CITA*

Hola {$booking->client_name},

Te recordamos que mañana tienes tu cita en *{$businessName}*{$service}.

🕐 *Hora:* {$time}{$address}

¡Te esperamos! 😊";
    }

    /**
     * Notificación para el negocio de nueva reserva
     */
    public static function newBookingForBusiness(Booking $booking): string
    {
        $date = Carbon::parse($booking->booking_date)->locale('es')->isoFormat('D [de] MMMM');
        $time = Carbon::parse($booking->booking_time)->format('H:i');
        $service = $booking->service ? "\n🛎️ *Servicio:* {$booking->service}" : '';
        $notes = $booking->notes ? "\n📝 *Notas:* {$booking->notes}" : '';

        return "🔔 *NUEVA RESERVA RECIBIDA*

👤 *Cliente:* {$booking->client_name}
📞 *Teléfono:* {$booking->client_phone}
📅 *Fecha:* {$date}
🕐 *Hora:* {$time}{$service}{$notes}

*Estado:* Pendiente de confirmación

⚡ Responde lo antes posible para confirmar la cita.";
    }

    /**
     * Mensaje de reserva completada (para seguimiento)
     */
    public static function bookingCompleted(Booking $booking): string
    {
        $businessName = $booking->profile->business_name ?? $booking->profile->name ?? 'nuestro negocio';

        return "✅ *¡GRACIAS POR TU VISITA!*

Hola {$booking->client_name},

Esperamos que hayas disfrutado tu experiencia en *{$businessName}*.

⭐ Tu opinión es muy importante para nosotros. ¿Te gustaría dejarnos una reseña?

¡Esperamos verte pronto! 🙌";
    }
}
