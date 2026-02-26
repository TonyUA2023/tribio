<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CulqiService
{
    protected string $publicKey;
    protected string $secretKey;
    protected string $apiUrl;
    protected string $secureUrl;

    public function __construct(?string $publicKey = null, ?string $secretKey = null)
    {
        $this->publicKey = $publicKey ?? config('services.culqi.public_key') ?? '';
        $this->secretKey = $secretKey ?? config('services.culqi.secret_key') ?? '';
        $this->apiUrl = config('services.culqi.api_url');
        $this->secureUrl = config('services.culqi.secure_url');
    }

    /**
     * Create a CulqiService instance using an Account's payment_settings.
     * Falls back to global config if account has no Culqi credentials.
     */
    public static function forAccount(\App\Models\Account $account): self
    {
        $settings = $account->payment_settings['culqi'] ?? [];
        $publicKey = !empty($settings['public_key']) ? $settings['public_key'] : null;
        $secretKey = !empty($settings['secret_key']) ? $settings['secret_key'] : null;

        return new self($publicKey, $secretKey);
    }

    /**
     * Check if Culqi is configured (has valid keys).
     */
    public function isConfigured(): bool
    {
        return !empty($this->publicKey) && !empty($this->secretKey);
    }

    /**
     * Crear un cargo a una tarjeta usando un token
     *
     * @param string $tokenId Token generado desde el frontend (tkn_xxx)
     * @param int $amount Monto en centimos (ej: 2900 = S/29.00)
     * @param string $currencyCode Codigo de moneda (PEN o USD)
     * @param string $email Email del cliente
     * @param string|null $description Descripcion del cargo
     * @param array $metadata Datos adicionales
     * @param array $antifraudDetails Datos antifraude del cliente
     * @return array
     */
    public function createCharge(
    string $tokenId,
    int $amount,
    string $currencyCode,
    string $email,
    ?string $description = null,
    array $metadata = [],
    array $antifraudDetails = []
    ): array {
        try {
            // Estructura exacta según documentación Culqi v2.0
            $payload = [
                'amount' => $amount, // Debe ser entero
                'currency_code' => $currencyCode,
                'email' => $email,
                'source_id' => $tokenId,
                'capture' => true,
            ];

            if ($description) {
                $payload['description'] = substr($description, 0, 80); // Límite de 80 caracteres
            }

            if (!empty($metadata)) {
                $payload['metadata'] = $metadata;
            }

            // Importante: Culqi v2.0 espera antifraud_details con estos keys
            if (!empty($antifraudDetails)) {
                $payload['antifraud_details'] = $antifraudDetails;
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
                'Content-Type' => 'application/json',
            ])->post($this->apiUrl . '/charges', $payload);

            $data = $response->json();

            if ($response->successful()) {
                return ['success' => true, 'data' => $data];
            }

            // Si falla, registramos el error exacto de Culqi en el log para debuggear
            Log::error('Culqi Denegado:', ['error' => $data]);

            return [
                'success' => false,
                'error' => $data,
                'message' => $data['merchant_message'] ?? $data['user_message'] ?? 'Pago rechazado por el banco',
            ];

        } catch (\Exception $e) {
            Log::error('Error de conexión Culqi: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error de conexión con la pasarela de pagos',
            ];
        }
    }

    /**
     * Crear un cliente en Culqi (para pagos recurrentes)
     *
     * @param string $email Email del cliente
     * @param string $firstName Nombre
     * @param string $lastName Apellido
     * @param string|null $phone Telefono
     * @param string|null $address Direccion
     * @param string $countryCode Codigo de pais (PE)
     * @return array
     */
    public function createCustomer(
        string $email,
        string $firstName,
        string $lastName,
        ?string $phone = null,
        ?string $address = null,
        string $countryCode = 'PE'
    ): array {
        try {
            $payload = [
                'email' => $email,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'country_code' => $countryCode,
            ];

            if ($phone) {
                $payload['phone_number'] = $phone;
            }

            if ($address) {
                $payload['address'] = $address;
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
                'Content-Type' => 'application/json',
            ])->post($this->apiUrl . '/customers', $payload);

            $data = $response->json();

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $data,
                ];
            }

            return [
                'success' => false,
                'error' => $data,
                'message' => $data['merchant_message'] ?? 'Error al crear cliente',
            ];

        } catch (\Exception $e) {
            Log::error('Culqi create customer error', ['message' => $e->getMessage()]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Error de conexion con la pasarela de pagos',
            ];
        }
    }

    /**
     * Guardar una tarjeta para un cliente (para pagos recurrentes)
     *
     * @param string $customerId ID del cliente en Culqi
     * @param string $tokenId Token de la tarjeta
     * @return array
     */
    public function createCard(string $customerId, string $tokenId): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
                'Content-Type' => 'application/json',
            ])->post($this->apiUrl . '/cards', [
                'customer_id' => $customerId,
                'token_id' => $tokenId,
            ]);

            $data = $response->json();

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $data,
                ];
            }

            return [
                'success' => false,
                'error' => $data,
                'message' => $data['merchant_message'] ?? 'Error al guardar tarjeta',
            ];

        } catch (\Exception $e) {
            Log::error('Culqi create card error', ['message' => $e->getMessage()]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Error de conexion con la pasarela de pagos',
            ];
        }
    }

    /**
     * Crear un plan de suscripcion
     *
     * @param string $name Nombre del plan
     * @param int $amount Monto en centimos
     * @param string $currencyCode Moneda (PEN/USD)
     * @param int $intervalCount Cantidad de intervalos
     * @param string $interval Tipo de intervalo (dias, semanas, meses, anios)
     * @return array
     */
    public function createPlan(
        string $name,
        int $amount,
        string $currencyCode = 'PEN',
        int $intervalCount = 1,
        string $interval = 'meses'
    ): array {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
                'Content-Type' => 'application/json',
            ])->post($this->apiUrl . '/plans', [
                'name' => $name,
                'amount' => $amount,
                'currency_code' => $currencyCode,
                'interval_count' => $intervalCount,
                'interval' => $interval,
            ]);

            $data = $response->json();

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $data,
                ];
            }

            return [
                'success' => false,
                'error' => $data,
                'message' => $data['merchant_message'] ?? 'Error al crear plan',
            ];

        } catch (\Exception $e) {
            Log::error('Culqi create plan error', ['message' => $e->getMessage()]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Error de conexion con la pasarela de pagos',
            ];
        }
    }

    /**
     * Crear una suscripcion para un cliente
     *
     * @param string $cardId ID de la tarjeta guardada
     * @param string $planId ID del plan
     * @return array
     */
    public function createSubscription(string $cardId, string $planId): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
                'Content-Type' => 'application/json',
            ])->post($this->apiUrl . '/subscriptions', [
                'card_id' => $cardId,
                'plan_id' => $planId,
            ]);

            $data = $response->json();

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $data,
                ];
            }

            return [
                'success' => false,
                'error' => $data,
                'message' => $data['merchant_message'] ?? 'Error al crear suscripcion',
            ];

        } catch (\Exception $e) {
            Log::error('Culqi create subscription error', ['message' => $e->getMessage()]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Error de conexion con la pasarela de pagos',
            ];
        }
    }

    /**
     * Cancelar una suscripcion
     *
     * @param string $subscriptionId ID de la suscripcion
     * @return array
     */
    public function cancelSubscription(string $subscriptionId): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
                'Content-Type' => 'application/json',
            ])->delete($this->apiUrl . '/subscriptions/' . $subscriptionId);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Suscripcion cancelada exitosamente',
                ];
            }

            $data = $response->json();

            return [
                'success' => false,
                'error' => $data,
                'message' => $data['merchant_message'] ?? 'Error al cancelar suscripcion',
            ];

        } catch (\Exception $e) {
            Log::error('Culqi cancel subscription error', ['message' => $e->getMessage()]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Error de conexion con la pasarela de pagos',
            ];
        }
    }

    /**
     * Consultar un cargo por ID
     *
     * @param string $chargeId ID del cargo
     * @return array
     */
    public function getCharge(string $chargeId): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
            ])->get($this->apiUrl . '/charges/' . $chargeId);

            $data = $response->json();

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $data,
                ];
            }

            return [
                'success' => false,
                'error' => $data,
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Crear un reembolso
     *
     * @param string $chargeId ID del cargo a reembolsar
     * @param int $amount Monto a reembolsar en centimos
     * @param string $reason Razon del reembolso
     * @return array
     */
    public function createRefund(string $chargeId, int $amount, string $reason = 'solicitud_comprador'): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
                'Content-Type' => 'application/json',
            ])->post($this->apiUrl . '/refunds', [
                'charge_id' => $chargeId,
                'amount' => $amount,
                'reason' => $reason,
            ]);

            $data = $response->json();

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $data,
                ];
            }

            return [
                'success' => false,
                'error' => $data,
                'message' => $data['merchant_message'] ?? 'Error al crear reembolso',
            ];

        } catch (\Exception $e) {
            Log::error('Culqi refund error', ['message' => $e->getMessage()]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Error de conexion con la pasarela de pagos',
            ];
        }
    }

    /**
     * Crear una orden en Culqi (requerida para pagos con Yape, PagoEfectivo, etc.)
     *
     * @param int $amount Monto en centimos (ej: 2900 = S/29.00)
     * @param string $currencyCode Codigo de moneda (PEN o USD)
     * @param string $description Descripcion de la compra
     * @param string $orderNumber Numero de orden interno
     * @param array $clientDetails Datos del cliente (first_name, last_name, email, phone_number)
     * @param int|null $expirationDate Timestamp de expiracion (null = 24h por defecto de Culqi)
     * @param array $metadata Datos adicionales
     * @return array
     */
    public function createOrder(
        int $amount,
        string $currencyCode,
        string $description,
        string $orderNumber,
        array $clientDetails = [],
        ?int $expirationDate = null,
        array $metadata = []
    ): array {
        try {
            $payload = [
                'amount' => $amount,
                'currency_code' => $currencyCode,
                'description' => substr($description, 0, 80),
                'order_number' => $orderNumber,
                'client_details' => $clientDetails,
                'confirm' => true,
            ];

            if ($expirationDate) {
                $payload['expiration_date'] = $expirationDate;
            } else {
                // Expirar en 1 hora
                $payload['expiration_date'] = time() + 3600;
            }

            if (!empty($metadata)) {
                $payload['metadata'] = $metadata;
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
                'Content-Type' => 'application/json',
            ])->post($this->apiUrl . '/orders', $payload);

            $data = $response->json();

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $data,
                    'order_id' => $data['id'] ?? null,
                ];
            }

            Log::error('Culqi crear orden error:', ['error' => $data]);

            return [
                'success' => false,
                'error' => $data,
                'message' => $data['merchant_message'] ?? $data['user_message'] ?? 'Error al crear la orden de pago',
            ];

        } catch (\Exception $e) {
            Log::error('Culqi create order error', ['message' => $e->getMessage()]);

            return [
                'success' => false,
                'message' => 'Error de conexion con la pasarela de pagos',
            ];
        }
    }

    /**
     * Obtener la llave publica para usar en el frontend
     *
     * @return string
     */
    public function getPublicKey(): string
    {
        return $this->publicKey;
    }
}
