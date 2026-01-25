<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Controlador para manejar webhooks de WhatsApp Business API (Meta)
 *
 * Este webhook es necesario para:
 * 1. Verificar el token y habilitar webhooks en Meta
 * 2. Recibir confirmaciones de mensajes (enviado, entregado, leído)
 * 3. Recibir mensajes entrantes de clientes
 */
class WhatsAppWebhookController extends Controller
{
    /**
     * Verificación del webhook (GET)
     *
     * Meta envía una solicitud GET para verificar que el webhook es válido.
     * Debes configurar el mismo WHATSAPP_WEBHOOK_VERIFY_TOKEN en tu .env
     * y en la configuración de webhooks de Meta.
     */
    public function verify(Request $request)
    {
        $verifyToken = config('services.whatsapp.webhook_verify_token');

        // Parámetros que envía Meta
        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');

        Log::info('🔐 WhatsApp Webhook Verification Request', [
            'mode' => $mode,
            'token_received' => $token ? 'yes' : 'no',
            'challenge' => $challenge,
        ]);

        // Verificar que el token coincida
        if ($mode === 'subscribe' && $token === $verifyToken) {
            Log::info('✅ WhatsApp Webhook verificado correctamente');

            // Meta espera que devolvamos el challenge como respuesta
            return response($challenge, 200)->header('Content-Type', 'text/plain');
        }

        Log::warning('❌ WhatsApp Webhook verification failed', [
            'expected_token' => $verifyToken ? 'configured' : 'not configured',
            'received_token' => $token,
        ]);

        return response('Forbidden', 403);
    }

    /**
     * Recibir notificaciones del webhook (POST)
     *
     * Meta envía notificaciones sobre:
     * - Mensajes entrantes de usuarios
     * - Estados de mensajes (enviado, entregado, leído)
     * - Errores de entrega
     */
    public function handle(Request $request)
    {
        $payload = $request->all();

        Log::info('📥 WhatsApp Webhook Received', [
            'payload' => $payload
        ]);

        // Siempre responder 200 OK rápidamente (Meta requiere respuesta en <20s)
        // Procesar de forma asíncrona si hay lógica pesada

        try {
            // Verificar que sea un evento de WhatsApp Business
            if (($payload['object'] ?? '') !== 'whatsapp_business_account') {
                return response()->json(['status' => 'ignored']);
            }

            $entries = $payload['entry'] ?? [];

            foreach ($entries as $entry) {
                $changes = $entry['changes'] ?? [];

                foreach ($changes as $change) {
                    $value = $change['value'] ?? [];
                    $field = $change['field'] ?? '';

                    if ($field === 'messages') {
                        $this->processMessagesEvent($value);
                    }
                }
            }

            return response()->json(['status' => 'processed']);

        } catch (\Exception $e) {
            Log::error('❌ Error procesando webhook de WhatsApp', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Siempre devolver 200 para evitar reintentos de Meta
            return response()->json(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    /**
     * Procesar eventos de mensajes
     */
    private function processMessagesEvent(array $value): void
    {
        $metadata = $value['metadata'] ?? [];
        $phoneNumberId = $metadata['phone_number_id'] ?? null;
        $displayPhoneNumber = $metadata['display_phone_number'] ?? null;

        // Procesar mensajes entrantes
        $messages = $value['messages'] ?? [];
        foreach ($messages as $message) {
            $this->handleIncomingMessage($message, $phoneNumberId);
        }

        // Procesar estados de mensajes (enviado, entregado, leído)
        $statuses = $value['statuses'] ?? [];
        foreach ($statuses as $status) {
            $this->handleMessageStatus($status);
        }
    }

    /**
     * Manejar mensaje entrante de un usuario
     */
    private function handleIncomingMessage(array $message, ?string $phoneNumberId): void
    {
        $from = $message['from'] ?? null;
        $messageId = $message['id'] ?? null;
        $timestamp = $message['timestamp'] ?? null;
        $type = $message['type'] ?? 'unknown';

        Log::info('💬 Mensaje entrante de WhatsApp', [
            'from' => $from,
            'message_id' => $messageId,
            'type' => $type,
            'timestamp' => $timestamp,
        ]);

        // Extraer contenido según el tipo
        $content = match($type) {
            'text' => $message['text']['body'] ?? '',
            'image' => $message['image']['id'] ?? '[imagen]',
            'document' => $message['document']['filename'] ?? '[documento]',
            'audio' => '[audio]',
            'video' => '[video]',
            'location' => json_encode($message['location'] ?? []),
            'contacts' => json_encode($message['contacts'] ?? []),
            'button' => $message['button']['text'] ?? '',
            'interactive' => $message['interactive']['button_reply']['title'] ??
                            $message['interactive']['list_reply']['title'] ?? '',
            default => '[tipo no soportado: ' . $type . ']'
        };

        Log::info('📝 Contenido del mensaje', [
            'from' => $from,
            'content' => $content,
            'type' => $type,
        ]);

        // TODO: Aquí puedes agregar lógica adicional como:
        // - Guardar el mensaje en la base de datos
        // - Enviar respuesta automática
        // - Notificar al negocio correspondiente
        // - Crear un ticket de soporte
    }

    /**
     * Manejar actualización de estado de mensaje
     */
    private function handleMessageStatus(array $status): void
    {
        $messageId = $status['id'] ?? null;
        $statusType = $status['status'] ?? null;
        $timestamp = $status['timestamp'] ?? null;
        $recipientId = $status['recipient_id'] ?? null;

        Log::info('📊 Estado de mensaje WhatsApp', [
            'message_id' => $messageId,
            'status' => $statusType, // sent, delivered, read, failed
            'recipient' => $recipientId,
            'timestamp' => $timestamp,
        ]);

        // Manejar errores de entrega
        if ($statusType === 'failed') {
            $errors = $status['errors'] ?? [];
            foreach ($errors as $error) {
                Log::error('❌ Error de entrega WhatsApp', [
                    'message_id' => $messageId,
                    'error_code' => $error['code'] ?? null,
                    'error_title' => $error['title'] ?? null,
                    'error_message' => $error['message'] ?? null,
                ]);
            }
        }

        // TODO: Aquí puedes agregar lógica adicional como:
        // - Actualizar estado del mensaje en la base de datos
        // - Mostrar indicadores de "leído" en la UI
        // - Reintentar envío en caso de error
    }
}
