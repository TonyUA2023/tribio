<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nueva Reserva</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .badge {
            display: inline-block;
            background-color: rgba(255,255,255,0.2);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            margin-top: 10px;
        }
        .content {
            padding: 30px 20px;
        }
        .alert {
            background-color: #fff7ed;
            border-left: 4px solid #f97316;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .alert-text {
            color: #9a3412;
            margin: 0;
        }
        .booking-details {
            background-color: #f8f9fa;
            border-left: 4px solid #22c55e;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }
        .detail-row {
            display: flex;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: 600;
            color: #495057;
            width: 140px;
            flex-shrink: 0;
        }
        .detail-value {
            color: #212529;
        }
        .client-info {
            background-color: #e0f2fe;
            padding: 20px;
            border-radius: 4px;
            margin: 20px 0;
        }
        .client-info h3 {
            margin-top: 0;
            color: #0369a1;
            font-size: 16px;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #6c757d;
            border-top: 1px solid #dee2e6;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: 600;
        }
        .status-badge {
            display: inline-block;
            padding: 5px 12px;
            background-color: #fef3c7;
            color: #92400e;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        @media only screen and (max-width: 600px) {
            .detail-row {
                flex-direction: column;
            }
            .detail-label {
                width: 100%;
                margin-bottom: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📅 Nueva Reserva Recibida</h1>
            <div class="badge">{{ now()->locale('es')->isoFormat('D [de] MMMM, h:mm A') }}</div>
        </div>

        <div class="content">
            <div class="alert">
                <p class="alert-text">
                    <strong>¡Tienes una nueva reserva!</strong> Un cliente acaba de reservar un servicio.
                </p>
            </div>

            <div class="client-info">
                <h3>Información del Cliente</h3>
                <div class="detail-row">
                    <div class="detail-label">Nombre:</div>
                    <div class="detail-value"><strong>{{ $booking->client_name }}</strong></div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Teléfono:</div>
                    <div class="detail-value">
                        <a href="tel:{{ $booking->client_phone }}" style="color: #2563eb; text-decoration: none;">
                            {{ $booking->client_phone }}
                        </a>
                    </div>
                </div>
                @if($booking->client_email)
                <div class="detail-row">
                    <div class="detail-label">Email:</div>
                    <div class="detail-value">
                        <a href="mailto:{{ $booking->client_email }}" style="color: #2563eb; text-decoration: none;">
                            {{ $booking->client_email }}
                        </a>
                    </div>
                </div>
                @else
                <div class="detail-row">
                    <div class="detail-label">Email:</div>
                    <div class="detail-value" style="color: #9ca3af;">No proporcionado</div>
                </div>
                @endif
            </div>

            <div class="booking-details">
                <h2 style="margin-top: 0; color: #22c55e; font-size: 18px;">Detalles de la Reserva</h2>

                <div class="detail-row">
                    <div class="detail-label">Servicio:</div>
                    <div class="detail-value"><strong>{{ $booking->service }}</strong></div>
                </div>

                <div class="detail-row">
                    <div class="detail-label">Fecha:</div>
                    <div class="detail-value">{{ $booking->booking_date->locale('es')->isoFormat('dddd, D [de] MMMM [de] YYYY') }}</div>
                </div>

                <div class="detail-row">
                    <div class="detail-label">Hora:</div>
                    <div class="detail-value">{{ $booking->booking_time->format('h:i A') }}</div>
                </div>

                <div class="detail-row">
                    <div class="detail-label">Estado:</div>
                    <div class="detail-value">
                        <span class="status-badge">{{ ucfirst($booking->status) }}</span>
                    </div>
                </div>

                @if($booking->notes)
                <div class="detail-row">
                    <div class="detail-label">Notas:</div>
                    <div class="detail-value">{{ $booking->notes }}</div>
                </div>
                @endif
            </div>

            <div style="background-color: #f0fdf4; padding: 15px; border-radius: 4px; border-left: 4px solid #22c55e;">
                <p style="margin: 0; color: #166534;">
                    <strong>💡 Próximos pasos:</strong><br>
                    • Revisa los detalles de la reserva<br>
                    • Confirma la disponibilidad<br>
                    • Contacta al cliente si es necesario
                </p>
            </div>


            <p style="color: #6c757d; font-size: 14px; text-align: center; margin-top: 30px;">
                Este correo se envió automáticamente cuando se creó una nueva reserva en tu sistema.
            </p>
        </div>

        <div class="footer">
            <p style="margin: 5px 0; font-weight: 600;">{{ config('app.name') }}</p>
            <p style="margin: 5px 0; color: #adb5bd; font-size: 12px;">
                Sistema de Gestión de Reservas
            </p>
        </div>
    </div>
</body>
</html>
