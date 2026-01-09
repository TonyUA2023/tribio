<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BrevoSmsService
{
    protected $apiKey;
    protected $sender;

    public function __construct()
    {
        // Asegúrate de haber agregado esto en config/services.php como vimos antes
        $this->apiKey = config('services.brevo.key');
        $this->sender = config('services.brevo.sms_sender', 'JSTACK'); 
    }

    public function sendSms($to, $content)
    {
        // 1. Limpieza del número telefónico
        // Quitamos espacios, guiones, paréntesis
        $phone = preg_replace('/[^0-9]/', '', $to);

        // 2. Validación de seguridad para la API de Brevo
        // Brevo requiere código de país. Si el número tiene 9 dígitos (ej. Perú), agregamos 51.
        if (strlen($phone) === 9) {
            $phone = '51' . $phone; 
        }

        // 3. Petición a Brevo
        $response = Http::withHeaders([
            'api-key' => $this->apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ])->post('https://api.brevo.com/v3/transactionalSMS/sms', [
            'sender' => substr($this->sender, 0, 11), // Máximo 11 caracteres permitido por SMS
            'recipient' => $phone,
            'content' => $content,
            'type' => 'transactional',
            'tag' => 'order-update'
        ]);

        if ($response->successful()) {
            Log::info("✅ SMS enviado a {$phone}: {$content}");
            return true;
        } else {
            Log::error("❌ Error enviando SMS a {$phone}: " . $response->body());
            return false;
        }
    }
}