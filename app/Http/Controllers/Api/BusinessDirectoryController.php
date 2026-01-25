<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\BusinessCategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BusinessDirectoryController extends Controller
{
    /**
     * Sinónimos y términos relacionados para búsqueda inteligente.
     */
    private array $searchSynonyms = [
        // Barberías
        'barberia' => ['barber', 'barbershop', 'peluqueria', 'corte', 'cabello', 'pelo', 'fade', 'barbero', 'estilista'],
        'barber' => ['barberia', 'barbershop', 'peluqueria', 'corte', 'cabello', 'barbero'],
        'peluqueria' => ['barberia', 'barber', 'salon', 'cabello', 'corte', 'estilista', 'belleza'],

        // Restaurantes / Comida
        'restaurante' => ['restaurant', 'comida', 'food', 'cocina', 'menu', 'gastronomia', 'cena', 'almuerzo'],
        'cafe' => ['cafeteria', 'coffee', 'desayuno', 'brunch', 'pasteleria', 'bakery'],
        'comida' => ['restaurante', 'food', 'cocina', 'delivery', 'menu', 'platos'],

        // Tiendas
        'tienda' => ['shop', 'store', 'venta', 'productos', 'comercio', 'boutique'],
        'ropa' => ['fashion', 'moda', 'clothing', 'vestimenta', 'boutique', 'prendas'],

        // Servicios
        'lavado' => ['carwash', 'car wash', 'autos', 'vehiculos', 'limpieza', 'detailing'],
        'gimnasio' => ['gym', 'fitness', 'ejercicio', 'deporte', 'entrenamiento', 'crossfit'],
        'spa' => ['masajes', 'relajacion', 'wellness', 'bienestar', 'belleza', 'tratamiento'],
        'belleza' => ['beauty', 'salon', 'estetica', 'maquillaje', 'uñas', 'nails', 'spa'],

        // Profesionales
        'coach' => ['entrenador', 'mentor', 'asesor', 'consultor', 'trainer'],
        'doctor' => ['medico', 'salud', 'clinica', 'consultorio', 'medicina'],
        'abogado' => ['lawyer', 'legal', 'juridico', 'derecho', 'estudio'],

        // Educación
        'academia' => ['escuela', 'instituto', 'cursos', 'clases', 'educacion', 'aprendizaje'],
        'universidad' => ['universidad', 'facultad', 'educacion', 'estudios', 'carrera'],
    ];

    /**
     * Lista todos los negocios públicos de Tribio.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = Account::query()
            ->with(['businessCategory', 'profiles' => function ($q) {
                $q->select('id', 'account_id', 'name', 'slug', 'data');
            }])
            ->whereNotNull('slug');

        // Filtro por categoría
        if ($request->has('category') && $request->category && $request->category !== 'all') {
            $query->where('business_category_id', $request->category);
        }

        // Búsqueda inteligente
        if ($request->has('search') && $request->search) {
            $search = strtolower(trim($request->search));
            $searchTerms = $this->expandSearchTerms($search);

            $query->where(function ($q) use ($search, $searchTerms) {
                // Búsqueda exacta (prioridad alta)
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%")
                  ->orWhere('slug', 'LIKE', "%{$search}%");

                // Búsqueda en categoría
                $q->orWhereHas('businessCategory', function ($catQuery) use ($search, $searchTerms) {
                    $catQuery->where(function ($cq) use ($search, $searchTerms) {
                        $cq->where('name', 'LIKE', "%{$search}%");

                        // Buscar por sinónimos en categoría
                        foreach ($searchTerms as $term) {
                            $cq->orWhere('name', 'LIKE', "%{$term}%");
                        }
                    });
                });

                // Búsqueda por sinónimos en nombre y descripción
                foreach ($searchTerms as $term) {
                    $q->orWhere('name', 'LIKE', "%{$term}%")
                      ->orWhere('description', 'LIKE', "%{$term}%");
                }

                // Búsqueda por palabras parciales (para errores de tipeo)
                if (strlen($search) >= 3) {
                    $partialTerms = $this->generatePartialTerms($search);
                    foreach ($partialTerms as $partial) {
                        $q->orWhere('name', 'LIKE', "%{$partial}%");
                    }
                }
            });
        }

        // Ordenamiento con relevancia si hay búsqueda
        $sortBy = $request->get('sort', 'newest');

        if ($request->has('search') && $request->search) {
            $search = strtolower(trim($request->search));
            // Ordenar por relevancia: coincidencia exacta primero
            $query->orderByRaw("
                CASE
                    WHEN LOWER(name) = ? THEN 1
                    WHEN LOWER(name) LIKE ? THEN 2
                    WHEN LOWER(name) LIKE ? THEN 3
                    ELSE 4
                END
            ", [$search, "{$search}%", "%{$search}%"]);
        }

        switch ($sortBy) {
            case 'name':
                $query->orderBy('name', 'asc');
                break;
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        $businesses = $query->paginate($request->get('per_page', 12));

        // Convertir a array de valores para evitar problemas de serialización
        $businessData = collect($businesses->items())->map(function ($account) {
            return [
                'id' => $account->id,
                'name' => $account->name,
                'slug' => $account->slug,
                'description' => $account->description,
                'logo_url' => $account->logo_url,
                'cover_url' => $account->cover_url,
                'phone' => $account->phone,
                'address' => $account->address,
                'whatsapp' => $account->whatsapp,
                'instagram' => $account->instagram,
                'facebook' => $account->facebook,
                'tiktok' => $account->tiktok,
                'business_category' => $account->businessCategory ? [
                    'id' => $account->businessCategory->id,
                    'name' => $account->businessCategory->name,
                    'icon' => $account->businessCategory->icon,
                ] : null,
                'profiles' => $account->profiles->map(function ($profile) {
                    $data = $profile->data ?? [];
                    return [
                        'id' => $profile->id,
                        'name' => $profile->name,
                        'slug' => $profile->slug,
                        'bio' => $data['bio'] ?? null,
                        'profile_picture' => $data['profile_picture'] ?? null,
                    ];
                })->values()->toArray(),
                'created_at' => $account->created_at?->toISOString(),
            ];
        })->values()->toArray();

        return response()->json([
            'success' => true,
            'data' => $businessData,
            'meta' => [
                'current_page' => $businesses->currentPage(),
                'last_page' => $businesses->lastPage(),
                'per_page' => $businesses->perPage(),
                'total' => $businesses->total(),
            ],
        ]);
    }

    /**
     * Lista todas las categorías de negocios.
     *
     * @return JsonResponse
     */
    public function categories(): JsonResponse
    {
        $categories = BusinessCategory::withCount(['accounts' => function ($q) {
            $q->whereNotNull('slug');
        }])
        ->whereNull('parent_id') // Solo categorías padre
        ->orderBy('name')
        ->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    /**
     * Obtiene las estadísticas del directorio.
     *
     * @return JsonResponse
     */
    public function stats(): JsonResponse
    {
        $totalBusinesses = Account::whereNotNull('slug')->count();
        $totalCategories = BusinessCategory::whereNull('parent_id')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_businesses' => $totalBusinesses,
                'total_categories' => $totalCategories,
            ],
        ]);
    }

    /**
     * Verifica si un slug está disponible.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function checkSlug(Request $request): JsonResponse
    {
        $slug = $request->get('slug');

        if (!$slug || strlen($slug) < 3) {
            return response()->json([
                'success' => false,
                'available' => false,
                'message' => 'El slug debe tener al menos 3 caracteres',
            ]);
        }

        // Normalizar el slug (minúsculas, sin espacios, caracteres especiales)
        $normalizedSlug = strtolower(trim($slug));
        $normalizedSlug = preg_replace('/[^a-z0-9\-_]/', '', $normalizedSlug);

        // Verificar si existe en accounts
        $existsInAccounts = Account::where('slug', $normalizedSlug)->exists();

        // Verificar si existe en profiles
        $existsInProfiles = \App\Models\Profile::where('slug', $normalizedSlug)->exists();

        $isAvailable = !$existsInAccounts && !$existsInProfiles;

        return response()->json([
            'success' => true,
            'available' => $isAvailable,
            'normalized_slug' => $normalizedSlug,
            'message' => $isAvailable
                ? 'Este enlace está disponible'
                : 'Este enlace ya está ocupado',
        ]);
    }

    /**
     * Expande los términos de búsqueda con sinónimos.
     *
     * @param string $search
     * @return array
     */
    private function expandSearchTerms(string $search): array
    {
        $terms = [];
        $searchLower = strtolower($search);

        // Remover acentos para comparación
        $searchNormalized = $this->removeAccents($searchLower);

        // Buscar sinónimos directos
        foreach ($this->searchSynonyms as $key => $synonyms) {
            $keyNormalized = $this->removeAccents($key);

            // Si la búsqueda coincide con una clave de sinónimos
            if ($searchNormalized === $keyNormalized || str_contains($searchNormalized, $keyNormalized)) {
                $terms = array_merge($terms, $synonyms);
            }

            // Si la búsqueda coincide con algún sinónimo
            foreach ($synonyms as $synonym) {
                $synonymNormalized = $this->removeAccents($synonym);
                if ($searchNormalized === $synonymNormalized || str_contains($searchNormalized, $synonymNormalized)) {
                    $terms[] = $key;
                    $terms = array_merge($terms, $synonyms);
                }
            }
        }

        return array_unique($terms);
    }

    /**
     * Genera términos parciales para búsqueda difusa (errores de tipeo).
     *
     * @param string $search
     * @return array
     */
    private function generatePartialTerms(string $search): array
    {
        $terms = [];
        $length = strlen($search);

        // Solo para palabras de 3+ caracteres
        if ($length < 3) {
            return $terms;
        }

        // Generar subcadenas (para errores al final)
        // Ejemplo: "barberia" -> "barbe", "barber", "barberi"
        for ($i = 3; $i < $length; $i++) {
            $terms[] = substr($search, 0, $i);
        }

        // Generar versiones sin caracteres repetidos
        // Ejemplo: "barbeeria" -> "barberia"
        $noDoubles = preg_replace('/(.)\1+/', '$1', $search);
        if ($noDoubles !== $search && strlen($noDoubles) >= 3) {
            $terms[] = $noDoubles;
        }

        // Variaciones comunes de caracteres (español)
        $replacements = [
            'v' => 'b', 'b' => 'v',
            's' => 'c', 'c' => 's',
            'z' => 's', 's' => 'z',
            'j' => 'g', 'g' => 'j',
            'y' => 'i', 'i' => 'y',
            'll' => 'y', 'y' => 'll',
        ];

        foreach ($replacements as $from => $to) {
            $variant = str_replace($from, $to, $search);
            if ($variant !== $search && strlen($variant) >= 3) {
                $terms[] = $variant;
            }
        }

        return array_unique($terms);
    }

    /**
     * Remueve acentos de una cadena.
     *
     * @param string $string
     * @return string
     */
    private function removeAccents(string $string): string
    {
        $unwanted = [
            'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u',
            'Á' => 'A', 'É' => 'E', 'Í' => 'I', 'Ó' => 'O', 'Ú' => 'U',
            'ñ' => 'n', 'Ñ' => 'N',
            'ü' => 'u', 'Ü' => 'U',
        ];

        return strtr($string, $unwanted);
    }
}
