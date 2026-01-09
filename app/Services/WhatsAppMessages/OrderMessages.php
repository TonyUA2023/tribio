<?php

namespace App\Services\WhatsAppMessages;

use App\Models\Order;
use Carbon\Carbon;

/**
 * Plantillas de mensajes de WhatsApp para Orders
 */
class OrderMessages
{
    /**
     * Mensaje de confirmación de pedido para el cliente
     */
    public static function orderCreated(Order $order): string
    {
        $businessName = $order->account->name ?? 'nuestro negocio';
        $orderNumber = $order->order_number ?? "#{$order->id}";
        $total = number_format($order->total, 2);
        $itemsCount = $order->items->count();

        $itemsList = '';
        foreach ($order->items as $item) {
            $itemsList .= "\n• {$item->quantity}x {$item->product_name}";
        }

        $deliveryInfo = '';
        if ($order->delivery_fee > 0) {
            $deliveryInfo = "\n🚚 *Delivery:* S/ " . number_format($order->delivery_fee, 2);
        }

        return "✅ *PEDIDO CONFIRMADO*

Hola {$order->customer_name}! 👋

Tu pedido en *{$businessName}* ha sido recibido exitosamente.

🛒 *Pedido:* {$orderNumber}
💰 *Total:* S/ {$total}
📦 *Productos:* {$itemsCount} item(s){$itemsList}{$deliveryInfo}

📍 *Dirección:* {$order->delivery_address}
💳 *Método de pago:* " . ucfirst($order->payment_method) . "

Estamos preparando tu pedido. ¡Te mantendremos informado! 😊";
    }

    /**
     * Mensaje cuando el pedido está en preparación
     */
    public static function orderPreparing(Order $order): string
    {
        $businessName = $order->account->name ?? 'nuestro negocio';
        $orderNumber = $order->order_number ?? "#{$order->id}";

        return "👨‍🍳 *PREPARANDO TU PEDIDO*

Hola {$order->customer_name},

Tu pedido *{$orderNumber}* en *{$businessName}* ya está en preparación.

📦 Estamos empaquetando tus productos con todo el cuidado.

⏱️ Te avisaremos cuando esté listo.

¡Gracias por tu paciencia! 😊";
    }

    /**
     * Mensaje cuando el pedido está listo
     */
    public static function orderReady(Order $order): string
    {
        $businessName = $order->account->name ?? 'nuestro negocio';
        $orderNumber = $order->order_number ?? "#{$order->id}";

        if ($order->delivery_fee > 0) {
            // Con delivery
            return "🚚 *PEDIDO LISTO - EN CAMINO*

Hola {$order->customer_name},

¡Buenas noticias! Tu pedido *{$orderNumber}* ya está listo y salió en reparto.

📍 *Dirección:* {$order->delivery_address}

⏱️ Llegará pronto a tu ubicación.

¡Prepárate para recibirlo! 🎉";
        } else {
            // Para recoger
            $address = $order->account->address ?? 'nuestra tienda';

            return "✅ *PEDIDO LISTO PARA RECOGER*

Hola {$order->customer_name},

¡Tu pedido *{$orderNumber}* ya está listo!

📍 *Recoge en:* {$address}

Puedes pasar cuando gustes. ¡Te esperamos! 😊";
        }
    }

    /**
     * Mensaje cuando el pedido fue entregado
     */
    public static function orderDelivered(Order $order): string
    {
        $businessName = $order->account->name ?? 'nuestro negocio';
        $orderNumber = $order->order_number ?? "#{$order->id}";

        return "🎉 *PEDIDO ENTREGADO*

Hola {$order->customer_name},

Tu pedido *{$orderNumber}* ha sido entregado exitosamente.

✨ Esperamos que disfrutes de tus productos.

⭐ *¿Nos ayudas con una reseña?*
Tu opinión es muy importante para *{$businessName}*.

¡Gracias por tu compra! 🙏";
    }

    /**
     * Mensaje cuando el pedido fue cancelado
     */
    public static function orderCancelled(Order $order): string
    {
        $businessName = $order->account->name ?? 'nuestro negocio';
        $orderNumber = $order->order_number ?? "#{$order->id}";

        return "❌ *PEDIDO CANCELADO*

Hola {$order->customer_name},

Tu pedido *{$orderNumber}* en *{$businessName}* ha sido cancelado.

Si tienes alguna pregunta o deseas realizar un nuevo pedido, estamos a tu disposición.

¡Esperamos servirte pronto! 🙏";
    }

    /**
     * Notificación para el negocio de nuevo pedido
     */
    public static function newOrderForBusiness(Order $order): string
    {
        $orderNumber = $order->order_number ?? "#{$order->id}";
        $total = number_format($order->total, 2);
        $itemsCount = $order->items->count();

        $itemsList = '';
        foreach ($order->items as $item) {
            $itemsList .= "\n• {$item->quantity}x {$item->product_name} - S/ " . number_format($item->subtotal, 2);
        }

        $deliveryInfo = $order->delivery_fee > 0 ? '🚚 CON DELIVERY' : '📦 PARA RECOGER';
        $notes = $order->notes ? "\n\n📝 *Notas:* {$order->notes}" : '';

        return "🔔 *NUEVO PEDIDO RECIBIDO*

📋 *Pedido:* {$orderNumber}
👤 *Cliente:* {$order->customer_name}
📞 *Teléfono:* {$order->customer_phone}
📍 *Dirección:* {$order->delivery_address}

*Productos:* {$itemsCount} item(s){$itemsList}

💰 *Total:* S/ {$total}
💳 *Pago:* " . ucfirst($order->payment_method) . "
{$deliveryInfo}{$notes}

⚡ *Acción requerida:* Confirma y prepara el pedido.";
    }

    /**
     * Mensaje de seguimiento con link de rastreo
     */
    public static function orderTracking(Order $order, string $trackingUrl = null): string
    {
        $businessName = $order->account->name ?? 'nuestro negocio';
        $orderNumber = $order->order_number ?? "#{$order->id}";

        $trackingInfo = $trackingUrl
            ? "\n\n🔗 *Rastrea tu pedido:*\n{$trackingUrl}"
            : '';

        return "📦 *ACTUALIZACIÓN DE PEDIDO*

Hola {$order->customer_name},

Tu pedido *{$orderNumber}* en *{$businessName}* está en proceso.

*Estado actual:* " . ucfirst($order->status) . "{$trackingInfo}

Si tienes alguna pregunta, no dudes en contactarnos. 😊";
    }

    /**
     * Mensaje de agradecimiento post-venta
     */
    public static function thankYouMessage(Order $order): string
    {
        $businessName = $order->account->name ?? 'nuestro negocio';

        return "💙 *¡GRACIAS POR TU COMPRA!*

Hola {$order->customer_name},

En *{$businessName}* valoramos mucho tu confianza.

🎁 Como agradecimiento, te compartiremos próximamente promociones exclusivas.

⭐ Tu opinión nos importa. ¿Cómo fue tu experiencia?

¡Hasta pronto! 🙌";
    }

    /**
     * Resumen del pedido (formato corto)
     */
    public static function orderSummary(Order $order): string
    {
        $orderNumber = $order->order_number ?? "#{$order->id}";
        $total = number_format($order->total, 2);
        $status = match ($order->status) {
            'pending' => '⏳ Pendiente',
            'preparing' => '👨‍🍳 En preparación',
            'ready' => '✅ Listo',
            'delivered' => '🎉 Entregado',
            'cancelled' => '❌ Cancelado',
            default => ucfirst($order->status)
        };

        return "*Pedido:* {$orderNumber}
*Estado:* {$status}
*Total:* S/ {$total}
*Cliente:* {$order->customer_name}";
    }
}
