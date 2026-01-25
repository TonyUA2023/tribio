<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Servicio para integración con WhatsApp Business API (Meta)
 *
 * Documentación oficial:
 * https://developers.facebook.com/docs/whatsapp/cloud-api
 */
class WhatsAppService
{
    protected $accessToken;
    protected $phoneNumberId;
    protected $businessPhoneNumber;
    protected $apiVersion;

    public function __construct()
    {
        $this->accessToken = config('services.whatsapp.access_token');
        $this->phoneNumberId = config('services.whatsapp.phone_number_id');
        $this->businessPhoneNumber = config('services.whatsapp.business_phone_number');
        $this->apiVersion = config('services.whatsapp.api_version', 'v21.0');
    }

    /**
     * Enviar mensaje de texto simple
     */
    public function sendTextMessage(string $to, string $message): bool
    {
        try {
            // Validar configuración
            if (!$this->accessToken || !$this->phoneNumberId) {
                Log::warning('WhatsApp API no configurada correctamente');
                return false;
            }

            // Limpiar número telefónico (debe incluir código de país)
            $phone = $this->cleanPhoneNumber($to);

            // Endpoint de WhatsApp Cloud API
            $url = "https://graph.facebook.com/{$this->apiVersion}/{$this->phoneNumberId}/messages";

            $response = Http::withToken($this->accessToken)
                ->post($url, [
                    'messaging_product' => 'whatsapp',
                    'to' => $phone,
                    'type' => 'text',
                    'text' => [
                        'preview_url' => false,
                        'body' => $message
                    ]
                ]);

            if ($response->successful()) {
                $data = $response->json();
                Log::info("✅ Mensaje WhatsApp enviado", [
                    'to' => $phone,
                    'message_id' => $data['messages'][0]['id'] ?? null
                ]);
                return true;
            }

            Log::error("❌ Error enviando mensaje WhatsApp", [
                'to' => $phone,
                'status' => $response->status(),
                'response' => $response->json()
            ]);

            return false;

        } catch (\Exception $e) {
            Log::error("❌ Excepción en WhatsApp Service: " . $e->getMessage(), [
                'to' => $to,
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }

    /**
     * Enviar mensaje usando plantilla aprobada
     *
     * @param string $to Número de teléfono del destinatario
     * @param string $templateName Nombre de la plantilla aprobada en Meta
     * @param array $parameters Parámetros de la plantilla
     * @param string $languageCode Código de idioma (ej: es, es_MX, en_US)
     */
    public function sendTemplateMessage(
        string $to,
        string $templateName,
        array $parameters = [],
        string $languageCode = 'es'
    ): bool {
        try {
            if (!$this->accessToken || !$this->phoneNumberId) {
                Log::warning('WhatsApp API no configurada correctamente');
                return false;
            }

            $phone = $this->cleanPhoneNumber($to);
            $url = "https://graph.facebook.com/{$this->apiVersion}/{$this->phoneNumberId}/messages";

            // Construir componentes de la plantilla
            $components = [];

            if (!empty($parameters)) {
                $bodyParameters = [];
                foreach ($parameters as $param) {
                    $bodyParameters[] = [
                        'type' => 'text',
                        'text' => $param
                    ];
                }

                $components[] = [
                    'type' => 'body',
                    'parameters' => $bodyParameters
                ];
            }

            $response = Http::withToken($this->accessToken)
                ->post($url, [
                    'messaging_product' => 'whatsapp',
                    'to' => $phone,
                    'type' => 'template',
                    'template' => [
                        'name' => $templateName,
                        'language' => [
                            'code' => $languageCode
                        ],
                        'components' => $components
                    ]
                ]);

            if ($response->successful()) {
                $data = $response->json();
                Log::info("✅ Plantilla WhatsApp enviada", [
                    'to' => $phone,
                    'template' => $templateName,
                    'message_id' => $data['messages'][0]['id'] ?? null
                ]);
                return true;
            }

            Log::error("❌ Error enviando plantilla WhatsApp", [
                'to' => $phone,
                'template' => $templateName,
                'status' => $response->status(),
                'response' => $response->json()
            ]);

            return false;

        } catch (\Exception $e) {
            Log::error("❌ Excepción en WhatsApp Template: " . $e->getMessage(), [
                'to' => $to,
                'template' => $templateName
            ]);
            return false;
        }
    }

    /**
     * Enviar mensaje con botones interactivos
     */
    public function sendButtonMessage(string $to, string $bodyText, array $buttons): bool
    {
        try {
            if (!$this->accessToken || !$this->phoneNumberId) {
                Log::warning('WhatsApp API no configurada correctamente');
                return false;
            }

            $phone = $this->cleanPhoneNumber($to);
            $url = "https://graph.facebook.com/{$this->apiVersion}/{$this->phoneNumberId}/messages";

            // Máximo 3 botones permitidos
            $buttons = array_slice($buttons, 0, 3);
            $formattedButtons = [];

            foreach ($buttons as $button) {
                $formattedButtons[] = [
                    'type' => 'reply',
                    'reply' => [
                        'id' => $button['id'] ?? uniqid(),
                        'title' => substr($button['title'], 0, 20) // Máx 20 caracteres
                    ]
                ];
            }

            $response = Http::withToken($this->accessToken)
                ->post($url, [
                    'messaging_product' => 'whatsapp',
                    'to' => $phone,
                    'type' => 'interactive',
                    'interactive' => [
                        'type' => 'button',
                        'body' => [
                            'text' => $bodyText
                        ],
                        'action' => [
                            'buttons' => $formattedButtons
                        ]
                    ]
                ]);

            if ($response->successful()) {
                Log::info("✅ Mensaje con botones WhatsApp enviado", [
                    'to' => $phone
                ]);
                return true;
            }

            Log::error("❌ Error enviando mensaje con botones", [
                'to' => $phone,
                'status' => $response->status(),
                'response' => $response->json()
            ]);

            return false;

        } catch (\Exception $e) {
            Log::error("❌ Excepción en WhatsApp Buttons: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Limpiar y formatear número de teléfono
     * WhatsApp requiere formato internacional sin '+' ni espacios
     * El número ya debe venir con código de país desde el frontend
     */
    private function cleanPhoneNumber(string $phone): string
    {
        // Remover todo excepto números (eliminar +, espacios, guiones, etc.)
        $clean = preg_replace('/[^0-9]/', '', $phone);

        return $clean;
    }

    /**
     * Generar link de WhatsApp para abrir conversación
     * Útil como fallback o para UI web
     */
    public function generateWhatsAppLink(string $phone, string $message = ''): string
    {
        $cleanPhone = $this->cleanPhoneNumber($phone);
        $url = "https://wa.me/{$cleanPhone}";

        if ($message) {
            $url .= "?text=" . urlencode($message);
        }

        return $url;
    }

    /**
     * Verificar si la API está configurada correctamente
     */
    public function isConfigured(): bool
    {
        return !empty($this->accessToken) && !empty($this->phoneNumberId);
    }

    /**
     * Obtener información del número de negocio (testing)
     */
    public function getBusinessProfile(): ?array
    {
        try {
            if (!$this->isConfigured()) {
                return null;
            }

            $url = "https://graph.facebook.com/{$this->apiVersion}/{$this->phoneNumberId}";

            $response = Http::withToken($this->accessToken)
                ->get($url, [
                    'fields' => 'verified_name,display_phone_number,quality_rating'
                ]);

            if ($response->successful()) {
                return $response->json();
            }

            return null;

        } catch (\Exception $e) {
            Log::error("Error obteniendo perfil WhatsApp: " . $e->getMessage());
            return null;
        }
    }
}
