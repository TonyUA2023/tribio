<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Servicio para consumir el motor ML de Tribio.
 * Todos los métodos retornan null silenciosamente si la API no responde.
 */
class MlPredictionService
{
    protected string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.ml.url', 'https://tonyua-tribio.hf.space'), '/');
    }

    /**
     * Verifica disponibilidad del motor ML.
     */
    public function health(): bool
    {
        try {
            $response = Http::timeout(4)->get("{$this->baseUrl}/health");
            return $response->successful() && ($response->json('status') === 'ok');
        } catch (\Throwable $e) {
            return false;
        }
    }

    /**
     * M1 — Predicción de ventas de un producto (próximos 7 días).
     *
     * @param array $data  price (required), discount_pct, stock, images_count,
     *                     description_length, featured, payment_settings_enabled,
     *                     has_whatsapp, plan_id, business_type_slug, business_category_slug
     */
    public function predictSales(array $data): ?array
    {
        return $this->post('/predict/sales', $data);
    }

    /**
     * M2 — Riesgo de churn de un cliente (próximos 30 días).
     *
     * @param array $data  days_since_last_order (required), total_orders_paid (required),
     *                     avg_order_value (required), cancellation_rate,
     *                     profile_visits_count, link_click_to_order_ratio,
     *                     preferred_payment_method, preferred_notification
     */
    public function predictChurn(array $data): ?array
    {
        return $this->post('/predict/churn', $data);
    }

    /**
     * M3 — Conversión según diseño/config de tienda (próximos 30 días).
     *
     * @param array $data  payment_settings_enabled, hero_has_cta, hero_slides_count,
     *                     navigation_menu_items_count, has_custom_logo, has_cover_image,
     *                     products_with_image_pct, products_with_description_pct,
     *                     total_products_active, products_with_discount_pct,
     *                     avg_images_per_product, plan_id, template_slug, business_type_slug
     */
    public function predictDesign(array $data): ?array
    {
        return $this->post('/predict/design', $data);
    }

    /**
     * M4 — Crecimiento por contenido/engagement (próxima semana).
     *
     * @param array $data  posts_count_30d, stories_count_30d, pct_posts_with_video,
     *                     days_between_posts, avg_views_per_post, avg_likes_per_post,
     *                     avg_comments_per_post, avg_rating, pct_1_2_star,
     *                     reviews_with_photo_pct, post_engagement_rate, business_type_slug,
     *                     has_instagram, has_tiktok, has_facebook, has_whatsapp
     */
    public function predictGrowth(array $data): ?array
    {
        return $this->post('/predict/growth', $data);
    }

    /**
     * Realiza llamadas POST en paralelo para múltiples items.
     * Retorna un array indexado con los resultados (null donde falle).
     *
     * @param  array  $items       Lista de payloads
     * @param  string $endpoint    '/predict/sales', etc.
     * @return array<int, array|null>
     */
    public function batchPredict(array $items, string $endpoint): array
    {
        if (empty($items)) {
            return [];
        }

        try {
            $responses = Http::pool(function ($pool) use ($items, $endpoint) {
                foreach ($items as $item) {
                    $pool->timeout(5)
                         ->withHeaders(['Content-Type' => 'application/json'])
                         ->post("{$this->baseUrl}{$endpoint}", $item);
                }
            });

            return array_map(function ($response) {
                if ($response instanceof \Throwable) {
                    return null;
                }
                if ($response->successful()) {
                    return $response->json();
                }
                return null;
            }, $responses);
        } catch (\Throwable $e) {
            Log::warning('ML batch predict failed', ['endpoint' => $endpoint, 'error' => $e->getMessage()]);
            return array_fill(0, count($items), null);
        }
    }

    /**
     * Helper interno para POST individual.
     */
    protected function post(string $endpoint, array $data): ?array
    {
        try {
            $response = Http::timeout(5)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post("{$this->baseUrl}{$endpoint}", $data);

            if ($response->successful()) {
                return $response->json();
            }

            Log::warning('ML prediction non-200', [
                'endpoint' => $endpoint,
                'status'   => $response->status(),
            ]);
            return null;
        } catch (\Throwable $e) {
            Log::warning('ML prediction failed', [
                'endpoint' => $endpoint,
                'error'    => $e->getMessage(),
            ]);
            return null;
        }
    }
}
