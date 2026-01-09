<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Pedido</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f7f8fa;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%); /* Verde esmeralda para pedidos */
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 20px;
            margin-bottom: 20px;
            color: #1f2937;
            font-weight: 600;
        }
        .message {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        .order-card {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border-radius: 10px;
            padding: 25px;
            margin: 30px 0;
            border: 1px solid #bbf7d0;
        }
        .order-card h2 {
            margin: 0 0 20px 0;
            color: #059669;
            font-size: 18px;
            font-weight: 700;
            border-bottom: 1px solid rgba(5, 150, 105, 0.2);
            padding-bottom: 10px;
        }
        .order-detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
            color: #374151;
        }
        .order-item-list {
            margin-bottom: 15px;
            border-bottom: 1px dashed rgba(5, 150, 105, 0.3);
            padding-bottom: 15px;
        }
        .item-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        .item-name {
            font-weight: 500;
        }
        .item-qty {
            color: #6b7280;
            font-size: 12px;
            margin-right: 5px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 2px solid rgba(5, 150, 105, 0.2);
            font-weight: 700;
            font-size: 18px;
            color: #065f46;
        }
        .info-box {
            background-color: #ecfdf5;
            border-left: 4px solid #10b981;
            padding: 16px 20px;
            border-radius: 6px;
            margin: 25px 0;
        }
        .info-box p {
            margin: 0;
            color: #064e3b;
            font-size: 14px;
        }
        .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer-title {
            font-size: 16px;
            font-weight: 700;
            color: #1f2937;
            margin: 0 0 8px 0;
        }
        .footer-text {
            margin: 5px 0;
            color: #6b7280;
            font-size: 14px;
        }
        .footer-disclaimer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #9ca3af;
            font-size: 12px;
        }
        .btn-whatsapp {
            display: inline-block;
            background-color: #25D366;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 50px;
            font-weight: bold;
            margin-top: 20px;
            box-shadow: 0 4px 6px rgba(37, 211, 102, 0.2);
        }
        @media only screen and (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            .content {
                padding: 30px 20px;
            }
            .header {
                padding: 30px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ ¡Pedido Recibido!</h1>
            <p>Orden #{{ $order->order_number }} registrada exitosamente</p>
        </div>

        <div class="content">
            <div class="greeting">
                Hola {{ $order->customer_name }},
            </div>

            <p class="message">
                ¡Gracias por tu compra en <strong>{{ $order->account->name }}</strong>!
                Hemos recibido tu pedido y estamos procesándolo. Aquí tienes el resumen:
            </p>

            <div class="order-card">
                <h2>🛒 Resumen del Pedido</h2>

                <div class="order-item-list">
                    @foreach($order->items as $item)
                    <div class="item-row">
                        <div>
                            <span class="item-qty">{{ $item->quantity }}x</span>
                            <span class="item-name">{{ $item->product_name }}</span>
                        </div>
                        <div>S/ {{ number_format($item->subtotal, 2) }}</div>
                    </div>
                    @endforeach
                </div>

                <div class="order-detail-row">
                    <span>Subtotal</span>
                    <span>S/ {{ number_format($order->subtotal, 2) }}</span>
                </div>
                
                @if($order->delivery_fee > 0)
                <div class="order-detail-row">
                    <span>Delivery</span>
                    <span>S/ {{ number_format($order->delivery_fee, 2) }}</span>
                </div>
                @endif

                <div class="total-row">
                    <span>Total a Pagar</span>
                    <span>S/ {{ number_format($order->total, 2) }}</span>
                </div>
            </div>

            <div class="info-box">
                <p><strong>💡 Importante:</strong> El pago se coordina directamente por WhatsApp. Si aún no lo has hecho, por favor contáctanos para finalizar tu compra.</p>
            </div>

            <div style="text-align: center;">
                <a href="https://wa.me/{{ preg_replace('/[^0-9]/', '', $order->account->whatsapp_number ?? '') }}" class="btn-whatsapp">
                    Contactar por WhatsApp
                </a>
            </div>
        </div>

        <div class="footer">
            <p class="footer-title">{{ $order->account->name }}</p>
            @if($order->account->email)
            <p class="footer-text">📧 {{ $order->account->email }}</p>
            @endif

            <div class="footer-disclaimer">
                <p>Este es un correo automático generado por nuestro sistema de pedidos.</p>
                <p>Por favor, no respondas directamente a este mensaje.</p>
            </div>
        </div>
    </div>
</body>
</html>