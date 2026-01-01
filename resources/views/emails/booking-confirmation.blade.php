<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Reserva</title>
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
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
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
        .booking-card {
            background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
            border-radius: 10px;
            padding: 25px;
            margin: 30px 0;
            border: 1px solid #c7d2fe;
        }
        .booking-card h2 {
            margin: 0 0 20px 0;
            color: #4f46e5;
            font-size: 18px;
            font-weight: 700;
        }
        .detail-item {
            display: flex;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid rgba(99, 102, 241, 0.1);
        }
        .detail-item:last-child {
            border-bottom: none;
        }
        .detail-icon {
            font-size: 20px;
            margin-right: 12px;
            width: 30px;
            text-align: center;
        }
        .detail-content {
            flex: 1;
        }
        .detail-label {
            font-size: 12px;
            color: #6b7280;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
        }
        .detail-value {
            color: #1f2937;
            font-size: 16px;
            font-weight: 600;
        }
        .info-box {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px 20px;
            border-radius: 6px;
            margin: 25px 0;
        }
        .info-box p {
            margin: 0;
            color: #78350f;
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
            <h1>✅ ¡Reserva Confirmada!</h1>
            <p>Tu cita ha sido registrada exitosamente</p>
        </div>

        <div class="content">
            <div class="greeting">
                Hola {{ $booking->client_name }},
            </div>

            <p class="message">
                ¡Gracias por confiar en <strong>{{ $booking->profile->name }}</strong>!
                Hemos recibido tu solicitud de reserva y está confirmada.
            </p>

            <div class="booking-card">
                <h2>📋 Detalles de tu Cita</h2>

                @if($booking->service)
                <div class="detail-item">
                    <div class="detail-icon">✂️</div>
                    <div class="detail-content">
                        <div class="detail-label">Servicio</div>
                        <div class="detail-value">{{ $booking->service }}</div>
                    </div>
                </div>
                @endif

                <div class="detail-item">
                    <div class="detail-icon">📅</div>
                    <div class="detail-content">
                        <div class="detail-label">Fecha</div>
                        <div class="detail-value">
                            {{ \Carbon\Carbon::parse($booking->booking_date)->locale('es')->isoFormat('dddd, D [de] MMMM [de] YYYY') }}
                        </div>
                    </div>
                </div>

                <div class="detail-item">
                    <div class="detail-icon">🕐</div>
                    <div class="detail-content">
                        <div class="detail-label">Hora</div>
                        <div class="detail-value">{{ \Carbon\Carbon::parse($booking->booking_time)->format('h:i A') }}</div>
                    </div>
                </div>

                @if($booking->notes)
                <div class="detail-item">
                    <div class="detail-icon">📝</div>
                    <div class="detail-content">
                        <div class="detail-label">Notas</div>
                        <div class="detail-value">{{ $booking->notes }}</div>
                    </div>
                </div>
                @endif
            </div>

            <div class="info-box">
                <p><strong>💡 Recuerda:</strong> Te recomendamos llegar con 5 minutos de anticipación. Si necesitas cancelar o reprogramar, por favor contáctanos con tiempo.</p>
            </div>
        </div>

        <div class="footer">
            <p class="footer-title">{{ $booking->profile->name }}</p>
            @if($booking->profile->notification_email)
            <p class="footer-text">📧 {{ $booking->profile->notification_email }}</p>
            @endif

            <div class="footer-disclaimer">
                <p>Este es un correo automático generado por nuestro sistema de reservas.</p>
                <p>Por favor, no respondas directamente a este mensaje.</p>
            </div>
        </div>
    </div>
</body>
</html>
