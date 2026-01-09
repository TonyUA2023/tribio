<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuevo Pedido</title>
    <style>
        body { font-family: sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; }
        .card { background: white; padding: 30px; border-radius: 12px; border-left: 6px solid #8BC53F; box-shadow: 0 4px 6px rgba(0,0,0,0.05); max-width: 600px; margin: 0 auto; }
        h2 { color: #111827; margin-top: 0; font-size: 22px; }
        .highlight { color: #005C35; font-weight: bold; }
        .details { margin: 20px 0; background: #f9fafb; padding: 20px; border-radius: 8px; }
        .details p { margin: 8px 0; color: #374151; font-size: 14px; }
        ul { padding-left: 20px; color: #374151; }
        li { margin-bottom: 5px; }
        .total { font-size: 18px; font-weight: bold; color: #111; margin-top: 15px; border-top: 1px dashed #d1d5db; padding-top: 15px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #9ca3af; }
    </style>
</head>
<body>
    <div class="card">
        <h2>💰 ¡Nuevo Pedido Recibido!</h2>
        <p>Hola, has recibido un nuevo pedido de <span class="highlight">{{ $order->customer_name }}</span>.</p>

        <div class="details">
            <p><strong>📞 Teléfono:</strong> {{ $order->customer_phone }}</p>
            <p><strong>📧 Email:</strong> {{ $order->customer_email ?? 'No proporcionado' }}</p>
            <p><strong>🆔 Orden:</strong> #{{ $order->order_number }}</p>
            
            <h3 style="font-size: 14px; text-transform: uppercase; color: #6b7280; margin-top: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Productos:</h3>
            <ul>
                @foreach($order->items as $item)
                    <li><strong>{{ $item->quantity }}x</strong> {{ $item->product_name }}</li>
                @endforeach
            </ul>

            <div class="total">
                Total: S/ {{ number_format($order->total, 2) }}
            </div>
        </div>

        <p style="font-size: 13px; color: #4b5563; text-align: center;">
            El pedido está registrado como "Pendiente".<br>Contacta al cliente para coordinar el pago y entrega.
        </p>

        <div class="footer">
            Sistema de Pedidos - {{ date('Y') }}
        </div>
    </div>
</body>
</html>