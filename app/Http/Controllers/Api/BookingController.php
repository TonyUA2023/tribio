<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Profile;
use App\Models\PendingEmail;
use App\Services\BrevoSmsService;
use App\Services\WhatsAppService;
use App\Services\WhatsAppMessages\BookingMessages;
use App\Services\CustomerService;
use App\Exceptions\Custom\ProfileNotFoundException;
use App\Exceptions\Custom\BookingConflictException;
use App\Exceptions\Custom\ValidationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class BookingController extends Controller
{
    public function __construct(
        protected CustomerService $customerService
    ) {}

    /**
     * Crear una nueva reserva
     */
    public function store(Request $request, BrevoSmsService $smsService, WhatsAppService $whatsappService)
    {
        $validator = Validator::make($request->all(), [
            'profile_id' => 'required|exists:profiles,id',
            'client_name' => 'required|string|max:255',
            'client_phone' => 'required|string|max:20',
            'client_email' => 'nullable|email|max:255',
            'booking_date' => 'required|date|after_or_equal:today',
            'booking_time' => 'required|date_format:H:i',
            'service' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
            // 👇 NUEVO: Validamos el canal de notificación
            'notification_channel' => 'required|in:email,sms,whatsapp',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator->errors()->toArray(), 'Error en los datos de la reserva');
        }

        try {
            // =================================================================
            // 🔒 BLOQUE DE SEGURIDAD (ANTI-DUPLICADOS)
            // =================================================================
            
            $exists = Booking::where('profile_id', $request->profile_id)
                ->where('booking_date', $request->booking_date)
                ->where('booking_time', $request->booking_time)
                ->whereIn('status', ['pending', 'confirmed', 'completed']) 
                ->exists();

            if ($exists) {
                throw new BookingConflictException('Lo sentimos, este horario acaba de ser ocupado por otro cliente.');
            }
            // =================================================================

            $profile = Profile::find($request->profile_id);

            if (!$profile) {
                throw new ProfileNotFoundException('El perfil solicitado no existe o fue eliminado.');
            }

            // 🆕 Buscar o crear customer
            $user = $request->user(); // null si es guest
            $customer = $this->customerService->findOrCreateCustomer(
                $profile->account,
                [
                    'name' => $request->client_name,
                    'phone' => $request->client_phone,
                    'email' => $request->client_email,
                    'preferences' => [
                        'notification_channel' => $request->notification_channel,
                    ],
                ],
                $user
            );

            // Crear la Reserva
            $booking = Booking::create([
                'profile_id' => $request->profile_id,
                'account_id' => $profile->account_id,
                'customer_id' => $customer->id, // 🆕 Vincular customer
                'client_name' => $request->client_name,
                'client_phone' => $request->client_phone,
                'client_email' => $request->client_email,
                'booking_date' => $request->booking_date,
                'booking_time' => $request->booking_time,
                'service' => $request->service,
                'notes' => $request->notes,
                'status' => 'pending',
                'notification_channel' => $request->notification_channel,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            // 🆕 Actualizar timestamp de última actividad
            $customer->touchLastBooking();

            // =================================================================
            // 🚀 SISTEMA DE NOTIFICACIONES MULTICANAL
            // =================================================================
            try {
                // 1. Notificar al CLIENTE (Según su preferencia)
                switch ($booking->notification_channel) {
                    case 'sms':
                        // Enviar SMS usando Brevo
                        $dateFormatted = Carbon::parse($booking->booking_date)->format('d/m');
                        $timeFormatted = Carbon::parse($booking->booking_time)->format('H:i');
                        $businessName = $profile->business_name ?? $profile->name;
                        $msg = "Hola {$booking->client_name}, tu reserva en {$businessName} para el {$dateFormatted} a las {$timeFormatted} está PENDIENTE de confirmación.";
                        $smsService->sendSms($booking->client_phone, $msg);
                        break;

                    case 'whatsapp':
                        // Enviar plantilla booking_confirmation usando Meta API
                        // Variables: {{1}}=nombre, {{2}}=negocio, {{3}}=fecha, {{4}}=hora, {{5}}=servicio
                        $businessName = $profile->business_name ?? $profile->name ?? 'Nuestro negocio';
                        $dateFormatted = Carbon::parse($booking->booking_date)->format('d \d\e F');
                        $timeFormatted = Carbon::parse($booking->booking_time)->format('h:i A');
                        $serviceName = $booking->service ?? 'Servicio';

                        $whatsappService->sendTemplateMessage(
                            $booking->client_phone,
                            'booking_confirmation',
                            [
                                $booking->client_name,
                                $businessName,
                                $dateFormatted,
                                $timeFormatted,
                                $serviceName
                            ],
                            'es_PE'
                        );
                        break;

                    case 'email':
                    default:
                        // Email (lógica con PendingEmail)
                        if ($booking->client_email) {
                            $businessName = $profile->business_name ?? $profile->name;
                            $emailHtml = view('emails.booking-confirmation', ['booking' => $booking])->render();
                            PendingEmail::create([
                                'to_email' => $booking->client_email,
                                'subject' => '✅ Reserva Recibida - ' . $businessName,
                                'body' => $emailHtml
                            ]);
                        }
                        break;
                }

                // 2. Notificar al NEGOCIO/EMPRENDEDOR según el mismo canal
                switch ($booking->notification_channel) {
                    case 'whatsapp':
                        // Notificar al negocio por WhatsApp usando account->whatsapp
                        $account = $profile->account;
                        $businessPhone = $account->whatsapp ?? null;

                        if ($businessPhone && $whatsappService->isConfigured()) {
                            $businessName = $profile->business_name ?? $profile->name ?? 'Emprendedor';
                            $dateFormatted = Carbon::parse($booking->booking_date)->format('d \d\e F');
                            $timeFormatted = Carbon::parse($booking->booking_time)->format('h:i A');
                            $serviceName = $booking->service ?? 'Sin especificar';

                            // Usar plantilla new_booking_business_v2
                            // Parámetros: {{1}}=nombre negocio, {{2}}=fecha, {{3}}=hora, {{4}}=cliente, {{5}}=teléfono, {{6}}=servicio
                            $sent = $whatsappService->sendTemplateMessage(
                                $businessPhone,
                                'new_booking_business_v2',
                                [
                                    $businessName,
                                    $dateFormatted,
                                    $timeFormatted,
                                    $booking->client_name,
                                    $booking->client_phone,
                                    $serviceName
                                ],
                                'es_PE'
                            );

                            if ($sent) {
                                Log::info("✅ WhatsApp Negocio (reserva) enviado a: {$businessPhone}");
                            } else {
                                Log::warning("⚠️ WhatsApp Negocio (reserva) falló");
                            }
                        } else {
                            Log::warning("📱 Negocio sin WhatsApp configurado en Account (ID: {$account->id}) - Campo: " . ($account->whatsapp ?? 'NULL'));
                        }
                        break;

                    case 'email':
                    case 'sms':
                    default:
                        // Notificar al negocio por email
                        if ($profile->notification_email) {
                            $emailHtml = view('emails.new-booking-notification', ['booking' => $booking])->render();
                            PendingEmail::create([
                                'to_email' => $profile->notification_email,
                                'subject' => '📅 Nueva Reserva - ' . $booking->client_name,
                                'body' => $emailHtml
                            ]);
                            Log::info("✅ Email Negocio (reserva) enviado a: {$profile->notification_email}");
                        }
                        break;
                }

            } catch (\Exception $notifyError) {
                // Logueamos error de notificación pero NO fallamos la reserva
                Log::warning('Error en notificaciones de reserva', [
                    'error' => $notifyError->getMessage(),
                    'booking_id' => $booking->id
                ]);
            }

            // Respuesta JSON
            return response()->json([
                'success' => true,
                'message' => '¡Reserva creada exitosamente!',
                'data' => [
                    'booking_id' => $booking->id,
                    'client_name' => $booking->client_name,
                    'booking_date' => Carbon::parse($booking->booking_date)->format('d/m/Y'),
                    'booking_time' => Carbon::parse($booking->booking_time)->format('H:i'),
                    'service' => $booking->service,
                    'status' => $booking->status,
                    'channel' => $booking->notification_channel
                ]
            ], 201);

        } catch (\Exception $e) {
            // Si es una excepción nuestra (Validation, Conflict), dejar que pase
            if ($e instanceof ValidationException || 
                $e instanceof BookingConflictException || 
                $e instanceof ProfileNotFoundException) {
                throw $e;
            }

            Log::error('Error crítico al crear reserva', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error inesperado al crear la reserva. Por favor, contacta con soporte.',
            ], 500);
        }
    }

    /**
     * Obtener reservas de un perfil
     */
    public function index(Request $request)
    {
        $profileId = $request->query('profile_id');
        $status = $request->query('status');

        $query = Booking::with(['profile'])
            ->orderBy('booking_date', 'desc')
            ->orderBy('booking_time', 'desc');

        if ($profileId) {
            $query->where('profile_id', $profileId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        $bookings = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $bookings
        ]);
    }

    /**
     * Actualizar estado de una reserva (Ej: Confirmar/Cancelar desde App)
     */
    public function updateStatus(Request $request, Booking $booking, BrevoSmsService $smsService, WhatsAppService $whatsappService)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,confirmed,cancelled,completed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $oldStatus = $booking->status;
        $newStatus = $request->status;

        $booking->update([
            'status' => $newStatus
        ]);

        // --- NOTIFICAR CAMBIO DE ESTADO AL CLIENTE ---
        // Solo notificamos si el estado cambió a Confirmado o Cancelado
        if ($oldStatus !== $newStatus && in_array($newStatus, ['confirmed', 'cancelled', 'completed'])) {
            try {
                $this->notifyStatusChange($booking, $newStatus, $smsService, $whatsappService);
            } catch (\Exception $e) {
                Log::error("Error notificando cambio de estado booking {$booking->id}: " . $e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Estado actualizado exitosamente',
            'data' => $booking
        ]);
    }

    /**
     * Helper para notificar cambios de estado (Privado)
     */
    private function notifyStatusChange(Booking $booking, $status, BrevoSmsService $smsService, WhatsAppService $whatsappService)
    {
        $message = match($status) {
            'confirmed' => BookingMessages::bookingConfirmed($booking),
            'cancelled' => BookingMessages::bookingCancelled($booking),
            'completed' => BookingMessages::bookingCompleted($booking),
            default => null
        };

        if (!$message) {
            return;
        }

        // Enviar notificación según el canal preferido
        switch ($booking->notification_channel) {
            case 'sms':
                // Para SMS, usar versión corta
                $business = $booking->profile->business_name ?? 'JSTACK';
                $date = Carbon::parse($booking->booking_date)->format('d/m');
                $time = Carbon::parse($booking->booking_time)->format('H:i');

                $shortMsg = match($status) {
                    'confirmed' => "✅ Tu reserva en {$business} para el {$date} a las {$time} ha sido CONFIRMADA. ¡Te esperamos!",
                    'cancelled' => "❌ Tu reserva en {$business} para el {$date} ha sido CANCELADA. Contáctanos para reagendar.",
                    'completed' => "¡Gracias por visitarnos! Tu opinión es importante. - {$business}",
                    default => null
                };

                if ($shortMsg) {
                    $smsService->sendSms($booking->client_phone, $shortMsg);
                }
                break;

            case 'whatsapp':
                // Enviar por WhatsApp (mensaje completo y formateado)
                $whatsappService->sendTextMessage($booking->client_phone, $message);
                break;

            case 'email':
                // Enviar por email (si está configurado)
                if ($booking->client_email) {
                    $emailHtml = view('emails.booking-status-update', [
                        'booking' => $booking,
                        'status' => $status
                    ])->render();

                    PendingEmail::create([
                        'to_email' => $booking->client_email,
                        'subject' => 'Actualización de Reserva - ' . ucfirst($status),
                        'body' => $emailHtml
                    ]);
                }
                break;
        }
    }

    /**
     * Obtener horarios ocupados
     */
    public function getOccupiedSlots(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'profile_id' => 'required|exists:profiles,id',
            'date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $occupiedSlots = Booking::where('profile_id', $request->profile_id)
            ->where('booking_date', $request->date)
            ->whereIn('status', ['pending', 'confirmed', 'completed'])
            ->pluck('booking_time')
            ->map(function ($time) {
                return Carbon::parse($time)->format('H:i');
            })
            ->toArray();

        return response()->json([
            'success' => true,
            'data' => $occupiedSlots
        ]);
    }
}