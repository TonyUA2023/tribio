<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Account;
use App\Models\Product;

class AmateProductsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Buscar la cuenta de Ámate
        $account = Account::where('slug', 'amate')->first();

        if (!$account) {
            $this->command->error('No se encontró la cuenta de Ámate. Asegúrate de que exista primero.');
            return;
        }

        $this->command->info('Creando productos para Ámate...');

        // Productos de ejemplo para Ámate (cafetería saludable)
        $products = [
            // Bebidas
            [
                'name' => 'Café Americano',
                'description' => 'Café orgánico de origen colombiano',
                'price' => 25.00,
                'category' => 'Bebidas',
                'available' => true,
                'featured' => true,
                'stock' => null,
                'sort_order' => 1,
                'options' => [
                    ['name' => 'Tamaño', 'values' => ['Pequeño', 'Mediano', 'Grande']],
                ],
            ],
            [
                'name' => 'Latte con Leche de Almendra',
                'description' => 'Espresso con leche de almendra artesanal',
                'price' => 38.00,
                'category' => 'Bebidas',
                'available' => true,
                'featured' => true,
                'stock' => null,
                'sort_order' => 2,
                'options' => [
                    ['name' => 'Tamaño', 'values' => ['Mediano', 'Grande']],
                ],
            ],
            [
                'name' => 'Smoothie Verde',
                'description' => 'Espinaca, manzana verde, plátano y jengibre',
                'price' => 45.00,
                'category' => 'Bebidas',
                'available' => true,
                'featured' => true,
                'stock' => null,
                'sort_order' => 3,
            ],
            [
                'name' => 'Jugo Natural de Naranja',
                'description' => 'Jugo recién exprimido de naranjas orgánicas',
                'price' => 30.00,
                'category' => 'Bebidas',
                'available' => true,
                'featured' => false,
                'stock' => null,
                'sort_order' => 4,
            ],
            [
                'name' => 'Té Verde Matcha',
                'description' => 'Matcha premium japonés',
                'price' => 40.00,
                'category' => 'Bebidas',
                'available' => true,
                'featured' => false,
                'stock' => null,
                'sort_order' => 5,
            ],

            // Pasteles y Postres
            [
                'name' => 'Brownie Vegano',
                'description' => 'Brownie de chocolate sin lácteos ni huevos',
                'price' => 35.00,
                'category' => 'Postres',
                'available' => true,
                'featured' => true,
                'stock' => 12,
                'sort_order' => 6,
            ],
            [
                'name' => 'Cheesecake de Frutos Rojos',
                'description' => 'Base de galleta integral con queso crema y mermelada casera',
                'price' => 50.00,
                'category' => 'Postres',
                'available' => true,
                'featured' => true,
                'stock' => 8,
                'sort_order' => 7,
            ],
            [
                'name' => 'Muffin de Arándanos',
                'description' => 'Muffin integral con arándanos frescos',
                'price' => 28.00,
                'category' => 'Postres',
                'available' => true,
                'featured' => false,
                'stock' => 15,
                'sort_order' => 8,
            ],
            [
                'name' => 'Galletas de Avena',
                'description' => 'Paquete de 4 galletas de avena con chispas de chocolate oscuro',
                'price' => 32.00,
                'category' => 'Postres',
                'available' => true,
                'featured' => false,
                'stock' => 20,
                'sort_order' => 9,
            ],

            // Snacks Saludables
            [
                'name' => 'Bowl de Açaí',
                'description' => 'Açaí con granola casera, plátano, fresas y miel',
                'price' => 65.00,
                'category' => 'Snacks',
                'available' => true,
                'featured' => true,
                'stock' => null,
                'sort_order' => 10,
            ],
            [
                'name' => 'Tostada de Aguacate',
                'description' => 'Pan integral tostado con aguacate, tomate cherry y semillas',
                'price' => 55.00,
                'category' => 'Snacks',
                'available' => true,
                'featured' => true,
                'stock' => null,
                'sort_order' => 11,
            ],
            [
                'name' => 'Energy Balls',
                'description' => 'Bolitas energéticas de dátil, cacao y almendras (4 piezas)',
                'price' => 38.00,
                'category' => 'Snacks',
                'available' => true,
                'featured' => false,
                'stock' => 25,
                'sort_order' => 12,
            ],
            [
                'name' => 'Wrap de Pollo y Vegetales',
                'description' => 'Tortilla integral con pollo, lechuga, tomate y aderezo de yogurt',
                'price' => 70.00,
                'category' => 'Snacks',
                'available' => true,
                'featured' => false,
                'stock' => null,
                'sort_order' => 13,
            ],

            // Desayunos
            [
                'name' => 'Yogurt Bowl',
                'description' => 'Yogurt griego con granola, frutas de temporada y miel',
                'price' => 48.00,
                'category' => 'Desayunos',
                'available' => true,
                'featured' => false,
                'stock' => null,
                'sort_order' => 14,
            ],
            [
                'name' => 'Avena con Frutas',
                'description' => 'Avena cocida con leche de almendra, plátano y nueces',
                'price' => 42.00,
                'category' => 'Desayunos',
                'available' => true,
                'featured' => false,
                'stock' => null,
                'sort_order' => 15,
            ],
        ];

        foreach ($products as $productData) {
            Product::create([
                'account_id' => $account->id,
                'name' => $productData['name'],
                'description' => $productData['description'],
                'price' => $productData['price'],
                'category' => $productData['category'],
                'available' => $productData['available'],
                'featured' => $productData['featured'],
                'stock' => $productData['stock'],
                'sort_order' => $productData['sort_order'],
                'options' => $productData['options'] ?? null,
            ]);
        }

        $this->command->info('✓ Se crearon ' . count($products) . ' productos para Ámate');
    }
}
