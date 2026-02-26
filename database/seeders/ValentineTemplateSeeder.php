<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Template;

class ValentineTemplateSeeder extends Seeder
{
    /**
     * Inserta (o actualiza) la plantilla San Valentin sin borrar datos existentes.
     * Ejecutar con: php artisan db:seed --class=ValentineTemplateSeeder
     */
    public function run(): void
    {
        Template::updateOrCreate(
            ['slug' => 'valentine-gifts'],
            [
                'name'          => 'Amor & Regalos - San Valentín',
                'slug'          => 'valentine-gifts',
                'description'   => 'Plantilla elegante y romántica para tiendas de regalos de San Valentín (14 de Febrero). Paleta rosa/rojo/dorado, hero slider romántico, menú para regalos de pareja, countdown al 14 Feb, y secciones "Para Ella" y "Para Él".',
                'preview_image' => null,
                'category'      => 'store',
                'is_active'     => true,
                'is_premium'    => false,
                'config'        => json_encode([
                    // Colores principales
                    'primaryColor'           => '#c0392b',
                    'secondaryColor'         => '#e91e8c',
                    'accentColor'            => '#f4b942',
                    'backgroundColor'        => '#fff5f7',

                    // Top Bar
                    'topBarEnabled'          => true,
                    'topBarText'             => 'Entrega el 14 de Febrero ❤️ | Envío gratis en compras +S/99',

                    // Tipografía
                    'headingFont'            => '"Playfair Display", Georgia, serif',
                    'bodyFont'               => '"Lato", "Helvetica Neue", sans-serif',

                    // Hero
                    'heroType'               => 'slider',
                    'heroAutoplay'           => true,
                    'heroAutoplaySpeed'      => 5000,
                    'heroShowArrows'         => true,
                    'heroShowDots'           => true,
                    'heroHeight'             => '88vh',

                    // Features / USP
                    'features' => [
                        ['icon' => '❤️', 'title' => 'Entrega 14 de Febrero',    'description' => 'Recibe tu regalo a tiempo'],
                        ['icon' => '🎁', 'title' => 'Empaque de Regalo',        'description' => 'Presentación especial incluida'],
                        ['icon' => '💌', 'title' => 'Mensaje Personalizado',    'description' => 'Agrega tu mensaje de amor'],
                        ['icon' => '🔒', 'title' => 'Pago Seguro',              'description' => 'Múltiples métodos de pago'],
                    ],

                    // Footer
                    'footerBackgroundColor'  => '#2d0a0a',
                    'footerTextColor'        => '#fce4ec',
                    'footerShowSocial'       => true,
                    'footerShowNewsletter'   => true,
                    'footerColumns' => [
                        [
                            'title' => 'Regalos',
                            'links' => [
                                ['label' => 'Para Ella',         'href' => '/productos'],
                                ['label' => 'Para Él',           'href' => '/productos'],
                                ['label' => 'Flores & Detalles', 'href' => '/productos'],
                                ['label' => 'Experiencias',      'href' => '/productos'],
                                ['label' => 'Ofertas Especiales','href' => '/ofertas'],
                            ],
                        ],
                        [
                            'title' => 'Ayuda',
                            'links' => [
                                ['label' => 'Estado del Pedido',          'href' => '/mi-cuenta/pedidos'],
                                ['label' => 'Envío y Entrega',            'href' => '/envio'],
                                ['label' => 'Cambios y Devoluciones',     'href' => '/devoluciones'],
                                ['label' => 'Preguntas Frecuentes',       'href' => '/faq'],
                            ],
                        ],
                        [
                            'title' => 'Nosotros',
                            'links' => [
                                ['label' => 'Nuestra Historia',   'href' => '/nosotros'],
                                ['label' => 'Blog de Amor',       'href' => '/blog'],
                                ['label' => 'Trabaja con Nosotros','href' => '/empleos'],
                            ],
                        ],
                    ],

                    // Menú principal
                    'mainMenu' => [
                        [
                            'id'    => 'ella',
                            'label' => 'Para Ella',
                            'columns' => 3,
                            'children' => [
                                [
                                    'id'    => 'ella-joyeria',
                                    'label' => 'Joyería & Accesorios',
                                    'children' => [
                                        ['id' => 'e-collares',  'label' => 'Collares & Cadenas', 'href' => '/productos?categoria=collares'],
                                        ['id' => 'e-pulseras',  'label' => 'Pulseras',           'href' => '/productos?categoria=pulseras'],
                                        ['id' => 'e-aretes',    'label' => 'Aretes & Aros',      'href' => '/productos?categoria=aretes'],
                                        ['id' => 'e-anillos',   'label' => 'Anillos',            'href' => '/productos?categoria=anillos'],
                                    ],
                                ],
                                [
                                    'id'    => 'ella-flores',
                                    'label' => 'Flores & Detalles',
                                    'children' => [
                                        ['id' => 'e-rosas',     'label' => 'Rosas Naturales',    'href' => '/productos?categoria=rosas'],
                                        ['id' => 'e-arreglos',  'label' => 'Arreglos Florales',  'href' => '/productos?categoria=arreglos'],
                                        ['id' => 'e-peluches',  'label' => 'Peluches & Ositos',  'href' => '/productos?categoria=peluches'],
                                        ['id' => 'e-chocolates','label' => 'Chocolates & Dulces','href' => '/productos?categoria=chocolates'],
                                    ],
                                ],
                                [
                                    'id'    => 'ella-fragancias',
                                    'label' => 'Fragancias & Cuidado',
                                    'children' => [
                                        ['id' => 'e-perfumes',  'label' => 'Perfumes',           'href' => '/productos?categoria=perfumes-mujer'],
                                        ['id' => 'e-sets',      'label' => 'Sets de Cuidado',    'href' => '/productos?categoria=sets-cuidado'],
                                        ['id' => 'e-velas',     'label' => 'Velas Aromáticas',   'href' => '/productos?categoria=velas'],
                                    ],
                                ],
                            ],
                        ],
                        [
                            'id'    => 'el',
                            'label' => 'Para Él',
                            'columns' => 3,
                            'children' => [
                                [
                                    'id'    => 'el-relojes',
                                    'label' => 'Relojes & Accesorios',
                                    'children' => [
                                        ['id' => 'h-relojes',   'label' => 'Relojes',                'href' => '/productos?categoria=relojes'],
                                        ['id' => 'h-carteras',  'label' => 'Carteras & Billeteras',  'href' => '/productos?categoria=carteras'],
                                        ['id' => 'h-cinturones','label' => 'Cinturones',             'href' => '/productos?categoria=cinturones'],
                                    ],
                                ],
                                [
                                    'id'    => 'el-fragancias',
                                    'label' => 'Fragancias',
                                    'children' => [
                                        ['id' => 'h-perfumes',  'label' => 'Perfumes para Él',       'href' => '/productos?categoria=perfumes-hombre'],
                                        ['id' => 'h-sets',      'label' => 'Sets de Cuidado',        'href' => '/productos?categoria=sets-hombre'],
                                    ],
                                ],
                                [
                                    'id'    => 'el-experiencias',
                                    'label' => 'Experiencias',
                                    'children' => [
                                        ['id' => 'h-cenas',    'label' => 'Cenas Románticas',        'href' => '/productos?categoria=cenas'],
                                        ['id' => 'h-aventura', 'label' => 'Experiencias Aventura',   'href' => '/productos?categoria=aventura'],
                                        ['id' => 'h-tech',     'label' => 'Hobbies & Tecnología',    'href' => '/productos?categoria=tecnologia'],
                                    ],
                                ],
                            ],
                        ],
                        [
                            'id'    => 'flores',
                            'label' => 'Flores & Detalles',
                            'href'  => '/productos',
                        ],
                        [
                            'id'    => 'experiencias',
                            'label' => 'Experiencias',
                            'href'  => '/productos',
                        ],
                        [
                            'id'         => 'especiales',
                            'label'      => 'Especiales 14 Feb',
                            'href'       => '/ofertas',
                            'badge'      => '❤️',
                            'badgeColor' => '#e91e8c',
                        ],
                    ],
                ]),
            ]
        );

        $this->command->info('✅ Plantilla "Amor & Regalos - San Valentín" insertada/actualizada exitosamente.');
        $this->command->info('   Slug: valentine-gifts | Categoría: store');
        $this->command->info('   Para usarla: ve a Configuración > Plantillas en el dashboard.');
    }
}
