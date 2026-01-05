<?php

namespace Database\Seeders;

use App\Models\BusinessCategory;
use Illuminate\Database\Seeder;

class BusinessCategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            // ========== SALUD Y BELLEZA ==========
            [
                'slug' => 'beauty-health',
                'name' => 'Salud y Belleza',
                'icon' => 'heart-pulse',
                'description' => 'Servicios de salud, belleza y cuidado personal',
                'default_modules' => ['profile', 'bookings', 'gallery', 'reviews', 'stories'],
                'default_config' => [
                    'bookings' => ['slotDuration' => 30, 'bufferTime' => 10],
                    'theme' => ['layout' => 'modern']
                ],
                'sort_order' => 1,
                'children' => [
                    [
                        'slug' => 'barber',
                        'name' => 'Barbería',
                        'icon' => 'scissors',
                        'description' => 'Barberías y salones de caballeros',
                        'default_modules' => ['profile', 'bookings', 'gallery', 'reviews', 'stories', 'services'],
                        'default_config' => [
                            'bookings' => ['slotDuration' => 30],
                            'services' => ['Corte', 'Barba', 'Tinte', 'Diseño'],
                            'theme' => ['primaryColor' => '#fbbf24']
                        ],
                    ],
                    [
                        'slug' => 'beauty-salon',
                        'name' => 'Salón de Belleza',
                        'icon' => 'sparkles',
                        'description' => 'Salones de belleza y estética',
                        'default_modules' => ['profile', 'bookings', 'gallery', 'reviews', 'stories', 'services'],
                        'default_config' => [
                            'bookings' => ['slotDuration' => 60],
                            'theme' => ['primaryColor' => '#ec4899']
                        ],
                    ],
                    [
                        'slug' => 'spa',
                        'name' => 'Spa / Centro de Estética',
                        'icon' => 'spa',
                        'description' => 'Spas y centros de estética',
                        'default_modules' => ['profile', 'bookings', 'gallery', 'reviews', 'services', 'packages'],
                        'default_config' => [
                            'theme' => ['layout' => 'luxury', 'primaryColor' => '#8b5cf6']
                        ],
                    ],
                ]
            ],

            // ========== ALIMENTOS Y BEBIDAS ==========
            [
                'slug' => 'food-beverage',
                'name' => 'Alimentos y Bebidas',
                'icon' => 'utensils',
                'description' => 'Restaurantes, cafeterías y servicios de comida',
                'default_modules' => ['profile', 'menu', 'orders', 'gallery', 'reviews'],
                'default_config' => [
                    'orders' => ['paymentMethods' => ['yape', 'plin', 'cash']],
                    'theme' => ['layout' => 'minimal']
                ],
                'sort_order' => 2,
                'children' => [
                    [
                        'slug' => 'restaurant',
                        'name' => 'Restaurante',
                        'icon' => 'chef-hat',
                        'description' => 'Restaurantes y comida',
                        'default_modules' => ['profile', 'menu', 'orders', 'gallery', 'reviews'],
                    ],
                    [
                        'slug' => 'cafe',
                        'name' => 'Cafetería',
                        'icon' => 'coffee',
                        'description' => 'Cafeterías y cafés',
                        'default_modules' => ['profile', 'menu', 'orders', 'gallery', 'reviews'],
                        'default_config' => [
                            'theme' => ['primaryColor' => '#8B4513']
                        ],
                    ],
                    [
                        'slug' => 'bakery',
                        'name' => 'Panadería / Pastelería',
                        'icon' => 'cake',
                        'description' => 'Panaderías y pastelerías',
                        'default_modules' => ['profile', 'menu', 'orders', 'gallery', 'reviews'],
                    ],
                ]
            ],

            // ========== FITNESS Y DEPORTES ==========
            [
                'slug' => 'fitness-sports',
                'name' => 'Fitness y Deportes',
                'icon' => 'dumbbell',
                'description' => 'Gimnasios, entrenadores y deportes',
                'default_modules' => ['profile', 'bookings', 'services', 'gallery', 'reviews'],
                'default_config' => [
                    'theme' => ['primaryColor' => '#ef4444']
                ],
                'sort_order' => 3,
                'children' => [
                    [
                        'slug' => 'gym',
                        'name' => 'Gimnasio',
                        'icon' => 'gym',
                        'description' => 'Gimnasios y centros fitness',
                        'default_modules' => ['profile', 'services', 'gallery', 'reviews', 'plans'],
                    ],
                    [
                        'slug' => 'personal-trainer',
                        'name' => 'Entrenador Personal',
                        'icon' => 'user-check',
                        'description' => 'Entrenadores personales',
                        'default_modules' => ['profile', 'bookings', 'services', 'gallery', 'reviews', 'plans'],
                    ],
                ]
            ],

            // ========== AUTOMOTRIZ ==========
            [
                'slug' => 'automotive',
                'name' => 'Automotriz',
                'icon' => 'car',
                'description' => 'Servicios automotrices',
                'default_modules' => ['profile', 'bookings', 'services', 'gallery', 'reviews'],
                'sort_order' => 4,
                'children' => [
                    [
                        'slug' => 'car-wash',
                        'name' => 'Lavado de Autos',
                        'icon' => 'spray-can',
                        'description' => 'Lavado y detallado de autos',
                        'default_modules' => ['profile', 'bookings', 'services', 'gallery', 'reviews'],
                        'default_config' => [
                            'bookings' => ['bookingType' => 'half-day']
                        ],
                    ],
                    [
                        'slug' => 'mechanic',
                        'name' => 'Taller Mecánico',
                        'icon' => 'wrench',
                        'description' => 'Talleres mecánicos y mantenimiento',
                        'default_modules' => ['profile', 'bookings', 'services', 'contact'],
                    ],
                ]
            ],

            // ========== PROFESIONALES Y SERVICIOS ==========
            [
                'slug' => 'professional-services',
                'name' => 'Servicios Profesionales',
                'icon' => 'briefcase',
                'description' => 'Servicios profesionales y consultorías',
                'default_modules' => ['profile', 'portfolio', 'contact', 'reviews'],
                'default_config' => [
                    'theme' => ['layout' => 'minimal']
                ],
                'sort_order' => 5,
                'children' => [
                    [
                        'slug' => 'photographer',
                        'name' => 'Fotógrafo / Videógrafo',
                        'icon' => 'camera',
                        'description' => 'Fotógrafos y videógrafos',
                        'default_modules' => ['profile', 'portfolio', 'bookings', 'gallery', 'packages', 'contact'],
                        'default_config' => [
                            'bookings' => ['bookingType' => 'event', 'requireDeposit' => true],
                            'theme' => ['layout' => 'luxury', 'primaryColor' => '#000000']
                        ],
                    ],
                    [
                        'slug' => 'designer',
                        'name' => 'Diseñador Gráfico',
                        'icon' => 'palette',
                        'description' => 'Diseñadores gráficos y creativos',
                        'default_modules' => ['profile', 'portfolio', 'contact', 'reviews'],
                    ],
                    [
                        'slug' => 'developer',
                        'name' => 'Desarrollador',
                        'icon' => 'code',
                        'description' => 'Desarrolladores y programadores',
                        'default_modules' => ['profile', 'portfolio', 'contact', 'skills'],
                    ],
                ]
            ],

            // ========== SALUD ==========
            [
                'slug' => 'healthcare',
                'name' => 'Salud',
                'icon' => 'stethoscope',
                'description' => 'Servicios de salud médica',
                'default_modules' => ['profile', 'bookings', 'services', 'contact'],
                'sort_order' => 6,
                'children' => [
                    [
                        'slug' => 'dentist',
                        'name' => 'Dentista',
                        'icon' => 'tooth',
                        'description' => 'Odontólogos y clínicas dentales',
                        'default_modules' => ['profile', 'bookings', 'services', 'contact'],
                    ],
                    [
                        'slug' => 'veterinary',
                        'name' => 'Veterinaria',
                        'icon' => 'paw',
                        'description' => 'Veterinarias y cuidado animal',
                        'default_modules' => ['profile', 'bookings', 'services', 'products', 'contact'],
                    ],
                ]
            ],

            // ========== RETAIL / COMERCIO ==========
            [
                'slug' => 'retail',
                'name' => 'Comercio y Retail',
                'icon' => 'store',
                'description' => 'Tiendas y comercio',
                'default_modules' => ['profile', 'catalog', 'orders', 'gallery'],
                'sort_order' => 7,
                'children' => [
                    [
                        'slug' => 'clothing-store',
                        'name' => 'Tienda de Ropa',
                        'icon' => 'shirt',
                        'description' => 'Tiendas de ropa y accesorios',
                        'default_modules' => ['profile', 'catalog', 'orders', 'gallery'],
                    ],
                    [
                        'slug' => 'florist',
                        'name' => 'Florería',
                        'icon' => 'flower',
                        'description' => 'Florerías y arreglos florales',
                        'default_modules' => ['profile', 'catalog', 'orders', 'gallery'],
                    ],
                ]
            ],

            // ========== EDUCACIÓN ==========
            [
                'slug' => 'education',
                'name' => 'Educación',
                'icon' => 'graduation-cap',
                'description' => 'Servicios educativos y tutorías',
                'default_modules' => ['profile', 'bookings', 'services', 'contact'],
                'sort_order' => 8,
                'children' => [
                    [
                        'slug' => 'tutor',
                        'name' => 'Tutor / Profesor Particular',
                        'icon' => 'book',
                        'description' => 'Tutorías y clases particulares',
                        'default_modules' => ['profile', 'bookings', 'services', 'contact'],
                    ],
                ]
            ],

            // ========== GENERAL (FALLBACK) ==========
            [
                'slug' => 'general',
                'name' => 'General / Otros',
                'icon' => 'circle',
                'description' => 'Categoría general para otros negocios',
                'default_modules' => ['profile', 'contact', 'gallery'],
                'default_config' => [
                    'theme' => ['layout' => 'minimal']
                ],
                'sort_order' => 99,
            ],
        ];

        foreach ($categories as $category) {
            $children = $category['children'] ?? [];
            unset($category['children']);

            $parent = BusinessCategory::create($category);

            foreach ($children as $child) {
                $child['parent_id'] = $parent->id;
                BusinessCategory::create($child);
            }
        }
    }
}
