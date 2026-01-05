<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\BookingConfirmation;
use App\Mail\NewBookingNotification;
use App\Models\Booking;
use App\Models\Profile;
use App\Models\PendingEmail;
use App\Exceptions\Custom\ProfileNotFoundException;
use App\Exceptions\Custom\BookingConflictException;
use App\Exceptions\Custom\ValidationException;
use App\Exceptions\Custom\EmailSendException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon; // Importante para manejar formatos de hora con precisión

class BookingController extends Controller
{
    /**
     * Crear una nueva reserva
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'profile_id' => 'required|exists:profiles,id',
            'client_name' => 'required|string|max:255',
            'client_phone' => 'required|string|max:20',
            'client_email' => 'nullable|email|max:255',
            'booking_date' => 'required|date|after_or_equal:today',
            'booking_time' => 'required|date_format:H:i', // Valida formato HH:MM
            'service' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator->errors()->toArray(), 'Error en los datos de la reserva');
        }

        try {
            // =================================================================
            // 🔒 BLOQUE DE SEGURIDAD (ANTI-DUPLICADOS)
            // =================================================================
            
            // Verificamos si YA existe una reserva activa para ese perfil, fecha y hora.
            // Ignoramos las que están canceladas ('cancelled').
            $exists = Booking::where('profile_id', $request->profile_id)
                ->where('booking_date', $request->booking_date)
                ->where('booking_time', $request->booking_time) // La DB suele guardar HH:MM:SS
                ->whereIn('status', ['pending', 'confirmed', 'completed']) 
                ->exists();

            // Si existe, lanzamos excepción personalizada
            if ($exists) {
                throw new BookingConflictException('Lo sentimos, este horario acaba de ser ocupado por otro cliente.');
            }
            // =================================================================

            // Obtener el profile y su account_id
            $profile = Profile::find($request->profile_id);

            if (!$profile) {
                throw new ProfileNotFoundException('El perfil solicitado no existe o fue eliminado.');
            }

            $booking = Booking::create([
                'profile_id' => $request->profile_id,
                'account_id' => $profile->account_id,
                'client_name' => $request->client_name,
                'client_phone' => $request->client_phone,
                'client_email' => $request->client_email,
                'booking_date' => $request->booking_date,
                'booking_time' => $request->booking_time,
                'service' => $request->service,
                'notes' => $request->notes,
                'status' => 'pending',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            // 📧 Encolar notificaciones por email (sistema de cola automático)
            try {
                // Cargar la relación profile para los emails
                $booking->load('profile');

                // 1. Encolar confirmación al cliente (si tiene email)
                if ($booking->client_email) {
                    $emailHtml = view('emails.booking-confirmation', ['booking' => $booking])->render();

                    PendingEmail::create([
                        'to_email' => $booking->client_email,
                        'subject' => '✅ Confirmación de Reserva - ' . $booking->profile->name,
                        'body' => $emailHtml
                    ]);
                }

                // 2. Encolar notificación al dueño del negocio (si tiene notification_email configurado)
                if ($booking->profile->notification_email) {
                    $emailHtml = view('emails.new-booking-notification', ['booking' => $booking])->render();

                    PendingEmail::create([
                        'to_email' => $booking->profile->notification_email,
                        'subject' => '🔔 Nueva Reserva - ' . $booking->client_name,
                        'body' => $emailHtml
                    ]);
                }
            } catch (\Exception $emailError) {
                // Si falla encolar emails, lo registramos pero no detenemos la reserva
                Log::warning('Error al encolar emails de reserva', [
                    'error' => $emailError->getMessage(),
                    'booking_id' => $booking->id ?? null,
                ]);
            }

            // Formatear la respuesta para asegurar consistencia
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
                ]
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error crítico al crear reserva', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error inesperado al crear la reserva. Por favor, contacta con soporte.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Obtener reservas de un perfil (para el dashboard del cliente)
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
     * Actualizar estado de una reserva
     */
    public function updateStatus(Request $request, Booking $booking)
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

        $booking->update([
            'status' => $request->status
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Estado actualizado exitosamente',
            'data' => $booking
        ]);
    }

    /**
     * Obtener horarios ocupados para una fecha y perfil específico
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

        // Obtener todas las reservas confirmadas, pendientes O COMPLETADAS para esa fecha
        $occupiedSlots = Booking::where('profile_id', $request->profile_id)
            ->where('booking_date', $request->date)
            ->whereIn('status', ['pending', 'confirmed', 'completed']) // Agregué 'completed' por seguridad
            ->pluck('booking_time')
            ->map(function ($time) {
                // Usar Carbon es más seguro que substr para parsear horas de la BD
                return Carbon::parse($time)->format('H:i');
            })
            ->toArray();

        return response()->json([
            'success' => true,
            'data' => $occupiedSlots
        ]);
    }
}