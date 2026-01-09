<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Profile;
use App\Models\ProfileMedia;
use App\Models\Template;
// Asegúrate de importar el modelo Product
use App\Models\Product; 
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class ProfileDisplayController extends Controller
{
    public function showDefault(string $account_slug)
    {
        $account = $this->findAccountBySlug($account_slug);
        $profile = $this->resolveDefaultProfile($account);

        if (!$profile) {
            abort(404, 'No profile found for this account.');
        }

        return $this->renderProfile($account, $profile);
    }

    public function show(string $account_slug, string $profile_slug)
    {
        $account = $this->findAccountBySlug($account_slug);

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
        $account = Account::with(['templates', 'activeModules'])
            ->where('slug', $account_slug)
            ->first();

        if (!$account) {
            abort(404, 'Account not found.');
        }

        return $account;
    }

    protected function resolveDefaultProfile(Account $account): ?Profile
    {
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

    protected function renderProfile(Account $account, Profile $profile)
    {
        // 1. Obtener Media (Lógica intacta)
        $galleryByProfile = ProfileMedia::query()
            ->where('profile_id', $profile->id)
            ->gallery()
            ->get();

        $gallery = $galleryByProfile->isNotEmpty()
            ? $galleryByProfile
            : ProfileMedia::query()
                ->where('account_id', $account->id)
                ->gallery()
                ->get();

        $loadingByProfile = ProfileMedia::query()
            ->where('profile_id', $profile->id)
            ->loadingScreen()
            ->first();

        $loadingScreen = $loadingByProfile
            ?: ProfileMedia::query()
                ->where('account_id', $account->id)
                ->loadingScreen()
                ->first();

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

        // 2. Payload del perfil base
        $payloadProfile = array_merge($profile->toArray(), [
            'gallery' => $gallery,
            'loading_screen' => $loadingScreen,
            'logo' => $logo,
            'cover' => $cover,
        ]);

        // 3. Preparar configuración de la plantilla
        $activeTemplate = null;
        $templateConfig = [];

        // --- LÓGICA CORREGIDA: Determinar el tipo de CTA (Botón de Acción) ---
        
        $categorySlug = 'general';
        
        if (!empty($account->business_category_id)) {
            $category = \App\Models\BusinessCategory::find($account->business_category_id);
            if ($category) {
                $categorySlug = $category->slug;
            }
        }

        $ctaMode = 'none';

        if (in_array($categorySlug, ['barber', 'beauty-salon', 'spa', 'medical', 'dental'])) {
            $ctaMode = 'booking';
        } elseif (in_array($categorySlug, ['restaurant', 'food-beverage', 'retail', 'store'])) {
            $ctaMode = 'ordering';
        } elseif (in_array($categorySlug, ['personal', 'influencer-blog', 'professional-services'])) {
            $ctaMode = 'contact';
        }

        // Variable para almacenar productos si la plantilla lo requiere
        $products = [];

        if (!empty($account->active_template_id)) {
            $activeTemplate = Template::query()->find($account->active_template_id);

            if ($activeTemplate) {
                
                // 🔥 LOGICA NUEVA: Cargar productos si la plantilla es de showcase 🔥
                if (in_array($activeTemplate->slug, ['product-showcase', 'natural-cafe', 'wellness-coach'])) {
                    $products = Product::where('account_id', $account->id)
                        ->where('available', true)
                        ->orderBy('sort_order', 'asc')
                        ->orderBy('created_at', 'desc')
                        ->get()
                        ->map(function ($product) {
                            return [
                                'id' => $product->id,
                                'name' => $product->name,
                                'description' => $product->description,
                                'price' => (float)$product->price,
                                'image' => $product->image,
                                'category' => $product->category ?? 'General',
                                'available' => (bool)$product->available,
                                'featured' => (bool)$product->featured,
                            ];
                        });
                }

                // Configuración por defecto de la plantilla
                $baseConfig = is_array($activeTemplate->config)
                    ? $activeTemplate->config
                    : (json_decode($activeTemplate->config ?? '[]', true) ?? []);

                // Personalizaciones guardadas en la tabla pivote
                $pivotRow = $account->templates()
                    ->where('templates.id', $activeTemplate->id)
                    ->first();

                $customizations = $pivotRow
                    ? (json_decode($pivotRow->pivot->customizations ?? '{}', true) ?? [])
                    : [];

                $profileData = $profile->data ?? [];

                // ============================================================
                // 🔥 CONFIGURACIÓN FINAL DEL TEMPLATE 🔥
                // ============================================================
                $templateConfig = array_merge($baseConfig ?? [], [
                    'businessName' => $customizations['businessName'] ?? $profile->name ?? $account->name,
                    'businessTitle' => $customizations['businessTitle'] ?? $profile->title ?? $account->name,
                    'businessBio' => $profileData['bio'] ?? $account->description ?? '', 
                    'services' => !empty($profileData['services']) ? $profileData['services'] : ($baseConfig['defaultServices'] ?? []),
                    'schedule' => !empty($profileData['hours']) ? $profileData['hours'] : ($baseConfig['defaultSchedule'] ?? ''),
                    
                    'socialLinks' => [
                        'whatsapp'  => $account->whatsapp,
                        'instagram' => $account->instagram,
                        'facebook'  => $account->facebook,
                        'tiktok'    => $account->tiktok,
                    ],

                    'gallery' => $gallery->map(fn($media) => [
                        'url' => $media->url,
                        'type' => $media->file_type ?? 'image',
                    ])->toArray(),
                    'loadingImage' => $loadingScreen?->url,
                    'coverImage' => $cover?->url,
                    'logoImage' => $logo?->url,
                    'profileId' => $profile->id,
                    'accountSlug' => $account->slug,
                    
                    'ctaMode' => $ctaMode,
                    
                    // INYECTAMOS LOS PRODUCTOS AQUÍ
                    'products' => $products,
                    
                ], $customizations ?? []);
            }
        }

        // 4. Resolver Componente y SEO
        $component = $this->resolveInertiaComponent($profile, $activeTemplate);
        $seoData = $this->buildSeoMetadata($account, $profile, $cover, $logo);

        // Preparar módulos activos
        $activeModules = $account->activeModules->pluck('module_slug')->toArray();

        return Inertia::render($component, [
            'account' => $account,
            'profile' => $payloadProfile,
            'seo' => $seoData,
            'config' => $templateConfig,
            'isPreview' => false,
            'activeTemplate' => $activeTemplate,
            'activeModules' => $activeModules,
        ]);
    }


    protected function buildSeoMetadata(Account $account, Profile $profile, $cover, $logo)
    {
        $data = $profile->data ?? [];
        $name = $profile->name ?? $account->name;

        $description = !empty($data['bio'])
            ? substr($data['bio'], 0, 160)
            : ($profile->title ?? 'Reserva tu cita en TRIBIO');

        $image = $cover?->url ?? $logo?->url ?? null;
        $url = url("/{$account->slug}");
        $keywords = $this->generateKeywords($profile, $account, $data['address'] ?? null);

        return [
            'title' => $name,
            'description' => $description,
            'keywords' => $keywords,
            'image' => $image,
            'url' => $url,
            'site_name' => 'TRIBIO',
            'type' => 'business.business',
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

    protected function generateKeywords(Profile $profile, Account $account, ?string $address): string
    {
        $keywords = [];
        $keywords[] = $profile->name ?? $account->name;

        $title = strtolower($profile->title ?? '');
        if (str_contains($title, 'barber') || str_contains($title, 'barbería')) {
            $keywords[] = 'barbería';
            $keywords[] = 'barber shop';
            $keywords[] = 'cortes de cabello';
        }

        $services = $profile->data['services'] ?? [];
        if (is_array($services)) {
            $keywords = array_merge($keywords, array_slice($services, 0, 5));
        }

        if ($address) {
            if (str_contains(strtolower($address), 'huancayo')) $keywords[] = 'Huancayo';
            if (str_contains(strtolower($address), 'lima')) $keywords[] = 'Lima';
        }

        $keywords[] = 'TRIBIO';
        return implode(', ', array_unique($keywords));
    }

    protected function generateStructuredData(Profile $profile, Account $account, ?string $address, ?string $phone, ?string $hours, ?string $image): array
    {
        $businessName = $profile->name ?? $account->name ?? 'TRIBIO Business';
        $description = $profile->data['bio'] ?? '';

        $businessType = 'LocalBusiness';
        $title = strtolower($profile->title ?? '');
        if (str_contains($title, 'barber')) $businessType = 'BarberShop';
        elseif (str_contains($title, 'restaurant')) $businessType = 'Restaurant';

        $structuredData = [
            '@context' => 'https://schema.org',
            '@type' => $businessType,
            'name' => $businessName,
            'description' => $description,
            'url' => url("/{$account->slug}"),
        ];

        if ($image) $structuredData['image'] = $image;
        if ($address) $structuredData['address'] = ['@type' => 'PostalAddress', 'streetAddress' => $address];
        if ($phone) $structuredData['telephone'] = $phone;
        if ($hours) $structuredData['openingHours'] = $hours;

        return $structuredData;
    }

    protected function resolveInertiaComponent(Profile $profile, $activeTemplate = null): string
    {
        if (isset($profile->custom_view_path) && $profile->custom_view_path) {
            return $profile->custom_view_path;
        }

        if ($activeTemplate) {
            return match ($activeTemplate->slug ?? null) {
                'majestic-barber' => 'Templates/BarberTemplate',
                'classic-barber'  => 'Templates/ClassicBarberTemplate',
                'modern-minimal'  => 'Templates/ModernMinimalTemplate',
                'personal-glass' => 'Templates/PersonalProfile3D',
                // 👇 NUEVA RUTA PARA LA PLANTILLA DE PRODUCTOS
                'product-showcase' => 'Templates/ProductShowcaseTemplate',
                'natural-cafe'     => 'Templates/NaturalCafeTemplate',
                'wellness-coach'  => 'Templates/WellnessCoachTemplate',
                'carwash-modern'  => 'Templates/CarWashTemplate',
                default => 'Templates/ModernMinimalTemplate', 
            };
        }

        return 'Templates/ModernMinimalTemplate';
    }
}