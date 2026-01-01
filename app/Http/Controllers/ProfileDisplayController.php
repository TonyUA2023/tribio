<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Profile;
use App\Models\ProfileMedia;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfileDisplayController extends Controller
{
    /**
     * Mostrar cuenta con el perfil por defecto (sin profile_slug).
     * Ruta: /{account_slug}
     */
    public function showDefault(string $account_slug)
    {
        $account = $this->findAccountBySlug($account_slug);

        // Intento: perfil marcado como "default" o el primero
        $profile = $this->resolveDefaultProfile($account);

        if (!$profile) {
            abort(404, 'No profile found for this account.');
        }

        return $this->renderProfile($account, $profile);
    }

    /**
     * Mostrar perfil específico.
     * Ruta: /{account_slug}/{profile_slug}
     */
    public function show(string $account_slug, string $profile_slug)
    {
        $account = $this->findAccountBySlug($account_slug);

        // Busca perfil por slug dentro del account
        $profile = Profile::query()
            ->where('account_id', $account->id)
            ->where('slug', $profile_slug)
            ->first();

        if (!$profile) {
            abort(404, 'Profile not found.');
        }

        return $this->renderProfile($account, $profile);
    }

    /* ==========================================================
     |  Helpers
     |==========================================================*/

    protected function findAccountBySlug(string $account_slug): Account
    {
        // Ajusta el campo si tu cuenta usa otro nombre (ej: "slug")
        $account = Account::query()
            ->where('slug', $account_slug)
            ->first();

        if (!$account) {
            abort(404, 'Account not found.');
        }

        return $account;
    }

    protected function resolveDefaultProfile(Account $account): ?Profile
    {
        // Si tienes un flag como is_default, úsalo.
        // Si no, toma el primero.
        $profile = Profile::query()
            ->where('account_id', $account->id)
            ->when(
                \Schema::hasColumn('profiles', 'is_default'),
                fn ($q) => $q->orderByDesc('is_default')
            )
            ->orderBy('id')
            ->first();

        return $profile;
    }

    /**
     * Renderiza la página Inertia del perfil y adjunta la media.
     */
    protected function renderProfile(Account $account, Profile $profile)
    {
        /**
         * 🔥 IMPORTANTÍSIMO:
         * Tu BD actual muestra profile_id = NULL en profile_media.
         * Por eso:
         *  - Primero intentamos por profile_id (si existe)
         *  - Si no hay, caemos a account_id (tu caso actual)
         */

        // 1) Media por profile_id (ideal si luego corriges tu BD)
        $galleryByProfile = ProfileMedia::query()
            ->where('profile_id', $profile->id)
            ->gallery()
            ->get();

        // 2) Si no hay nada, usar por account_id (tu caso actual)
        $gallery = $galleryByProfile->isNotEmpty()
            ? $galleryByProfile
            : ProfileMedia::query()
                ->where('account_id', $account->id)
                ->gallery()
                ->get();

        // Loading screen
        $loadingByProfile = ProfileMedia::query()
            ->where('profile_id', $profile->id)
            ->loadingScreen()
            ->first();

        $loadingScreen = $loadingByProfile
            ?: ProfileMedia::query()
                ->where('account_id', $account->id)
                ->loadingScreen()
                ->first();

        /**
         * Si también guardas cover/logo en profile_media (por type),
         * puedes agregarlos aquí (opcional).
         * Ajusta el "type" si en tu sistema se llama distinto.
         */
        $logo = ProfileMedia::query()
            ->where('profile_id', $profile->id)
            ->where('type', 'profile_logo')
            ->first()
            ?: ProfileMedia::query()
                ->where('account_id', $account->id)
                ->where('type', 'profile_logo')
                ->first();

        $cover = ProfileMedia::query()
            ->where('profile_id', $profile->id)
            ->where('type', 'cover_photo')
            ->first()
            ?: ProfileMedia::query()
                ->where('account_id', $account->id)
                ->where('type', 'cover_photo')
                ->first();

        /**
         * ✅ Enviamos a Inertia:
         * - profile original
         * - profile.gallery: media con url (appends)
         * - profile.loading_screen, profile.logo, profile.cover
         */
        $payloadProfile = array_merge($profile->toArray(), [
            'gallery' => $gallery, // ✅ ahora React debe leer profile.gallery
            'loading_screen' => $loadingScreen,
            'logo' => $logo,
            'cover' => $cover,
        ]);

        // Decide qué componente Inertia renderizar.
        // Si usas plantillas por perfil, aquí puedes mapear.
        $component = $this->resolveInertiaComponent($profile);

        // ✅ SEO Metadata dinámico para cada perfil
        $seoData = $this->buildSeoMetadata($account, $profile, $cover, $logo);

        return Inertia::render($component, [
            'account' => $account,
            'profile' => $payloadProfile,
            'seo' => $seoData,
        ]);
    }

    /**
     * Construye metadata SEO dinámico - SIMPLE Y DIRECTO
     * Todo viene de la base de datos
     */
    protected function buildSeoMetadata(Account $account, Profile $profile, $cover, $logo)
    {
        $data = $profile->data ?? [];

        // Nombre del negocio
        $name = $profile->name ?? $account->name;

        // Descripción (bio o título)
        $description = !empty($data['bio'])
            ? substr($data['bio'], 0, 160)
            : ($profile->title ?? 'Reserva tu cita en TRIBIO');

        // Imagen para compartir (cover o logo desde BD)
        $image = $cover?->url ?? $logo?->url ?? null;

        // URL de la página
        $url = url("/{$account->slug}");

        // Keywords automáticos
        $keywords = $this->generateKeywords($profile, $account, $data['address'] ?? null);

        return [
            'title' => $name,
            'description' => $description,
            'keywords' => $keywords,
            'image' => $image,
            'url' => $url,
            'site_name' => 'TRIBIO',
            'type' => 'business.business',
            // Datos estructurados
            'structured_data' => $this->generateStructuredData(
                $profile,
                $account,
                $data['address'] ?? null,
                $data['phone'] ?? null,
                $data['hours'] ?? null,
                $image
            ),
        ];
    }

    /**
     * Genera keywords dinámicos basados en el perfil y ubicación
     */
    protected function generateKeywords(Profile $profile, Account $account, ?string $address): string
    {
        $keywords = [];

        // Nombre del negocio
        $keywords[] = $profile->name ?? $account->name;

        // Tipo de negocio (extraído del título)
        $title = strtolower($profile->title ?? '');
        if (str_contains($title, 'barber') || str_contains($title, 'barbería')) {
            $keywords[] = 'barbería';
            $keywords[] = 'barber shop';
            $keywords[] = 'cortes de cabello';
            $keywords[] = 'peluquería para hombres';
        }

        // Servicios (si existen en data)
        $services = $profile->data['services'] ?? [];
        if (is_array($services)) {
            $keywords = array_merge($keywords, array_slice($services, 0, 5));
        }

        // Ubicación (extraer ciudad de la dirección)
        if ($address) {
            // Intentar extraer ciudad (simplificado)
            if (str_contains(strtolower($address), 'huancayo')) {
                $keywords[] = 'barbería en Huancayo';
                $keywords[] = 'barber Huancayo';
                $keywords[] = 'cortes Huancayo';
            }
            if (str_contains(strtolower($address), 'lima')) {
                $keywords[] = 'barbería en Lima';
                $keywords[] = 'barber Lima';
            }
        }

        // TRIBIO como plataforma
        $keywords[] = 'TRIBIO';
        $keywords[] = 'reserva online';
        $keywords[] = 'citas online';

        return implode(', ', array_unique($keywords));
    }

    /**
     * Genera datos estructurados JSON-LD para SEO local
     * Ayuda a aparecer en Google Maps y búsquedas locales
     */
    protected function generateStructuredData(Profile $profile, Account $account, ?string $address, ?string $phone, ?string $hours, ?string $image): array
    {
        $businessName = $profile->name ?? $account->name ?? 'TRIBIO Business';
        $description = $profile->data['bio'] ?? '';

        // Determinar el tipo de negocio según el título
        $businessType = 'LocalBusiness';
        $title = strtolower($profile->title ?? '');
        if (str_contains($title, 'barber') || str_contains($title, 'barbería')) {
            $businessType = 'BarberShop';
        } elseif (str_contains($title, 'restaurant') || str_contains($title, 'café')) {
            $businessType = 'Restaurant';
        } elseif (str_contains($title, 'gym') || str_contains($title, 'fitness')) {
            $businessType = 'HealthClub';
        }

        $structuredData = [
            '@context' => 'https://schema.org',
            '@type' => $businessType,
            'name' => $businessName,
            'description' => $description,
            'url' => url("/{$account->slug}"),
        ];

        if ($image) {
            $structuredData['image'] = $image;
        }

        if ($address) {
            $structuredData['address'] = [
                '@type' => 'PostalAddress',
                'streetAddress' => $address,
            ];
        }

        if ($phone) {
            $structuredData['telephone'] = $phone;
        }

        if ($hours) {
            $structuredData['openingHours'] = $hours;
        }

        // Agregar calificación predeterminada (puedes hacerlo dinámico después)
        $structuredData['aggregateRating'] = [
            '@type' => 'AggregateRating',
            'ratingValue' => '5.0',
            'reviewCount' => '1',
        ];

        return $structuredData;
    }

    /**
     * Si tienes múltiples templates, resuélvelo aquí.
     * Si no, deja fijo tu componente.
     */
    protected function resolveInertiaComponent(Profile $profile): string
    {
        // Si el perfil tiene custom_view_path definido, usarlo
        if (isset($profile->custom_view_path) && $profile->custom_view_path) {
            return $profile->custom_view_path;
        }

        // Fallback: si tiene template_id, podrías mapear a componentes
        // Aquí puedes agregar lógica según template_id si lo necesitas

        // Default
        return 'Custom/AntonyBarber';
    }
}