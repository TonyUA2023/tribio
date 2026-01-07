<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Template;

class TemplatesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Limpiar plantillas existentes (usando delete en lugar de truncate por foreign keys)
        \DB::table('account_template')->delete();
        \DB::table('templates')->delete();

        // 1. MAJESTIC BARBER - Plantilla Premium con gradientes dorados
        Template::create([
            'name' => 'Majestic Barber',
            'slug' => 'majestic-barber',
            'description' => 'Plantilla premium con diseño moderno y elegante. Gradientes dorados sobre fondo oscuro, ideal para barberías de alto nivel.',
            'preview_image' => null,
            'category' => 'barber',
            'is_active' => true,
            'is_premium' => false,
            'config' => json_encode([
                'primaryColor' => '#fbbf24',
                'backgroundColor' => '#0f172a',
                'gradientFrom' => '#fbbf24',
                'gradientTo' => '#fcd34d',
                'defaultServices' => [
                    'Corte Clásico',
                    'Skin Fade',
                    'Barba Premium',
                    'Perfilado',
                    'Black Mask',
                    'Tinte'
                ],
                'defaultSchedule' => 'Lun-Sab 9:00 AM - 8:00 PM',
                'style' => 'modern-premium',
                'fontFamily' => 'sans-serif',
            ])
        ]);

        // 2. CLASSIC BARBER - Plantilla Vintage con rayas clásicas
        Template::create([
            'name' => 'Classic Barber',
            'slug' => 'classic-barber',
            'description' => 'Plantilla vintage con estilo retro clásico de barbería tradicional. Colores rojo y dorado sobre fondo negro.',
            'preview_image' => null,
            'category' => 'barber',
            'is_active' => true,
            'is_premium' => false,
            'config' => json_encode([
                'primaryColor' => '#dc2626',
                'backgroundColor' => '#0a0a0a',
                'secondaryColor' => '#d4af37',
                'defaultServices' => [
                    'Corte Clásico',
                    'Afeitado Tradicional',
                    'Arreglo de Barba',
                    'Perfilado',
                    'Masaje Capilar',
                    'Hot Towel'
                ],
                'defaultSchedule' => 'Lun-Vie 8:00 AM - 7:00 PM, Sáb 9:00 AM - 6:00 PM',
                'style' => 'vintage-classic',
                'fontFamily' => 'serif',
                'pattern' => 'barber-stripes',
            ])
        ]);

        // 3. MODERN MINIMAL - Plantilla Minimalista ultramoderna
        Template::create([
            'name' => 'Modern Minimal',
            'slug' => 'modern-minimal',
            'description' => 'Plantilla minimalista con diseño limpio y espacioso. Tonos azules cyan sobre gris oscuro.',
            'preview_image' => null,
            'category' => 'barber',
            'is_active' => true,
            'is_premium' => false,
            'config' => json_encode([
                'primaryColor' => '#06b6d4',
                'backgroundColor' => '#18181b',
                'accentColor' => '#38bdf8',
                'defaultServices' => [
                    'Fade Moderno',
                    'Diseño Creativo',
                    'Color & Tinte',
                    'Estilizado',
                    'Barba Contemporánea',
                    'Cejas'
                ],
                'defaultSchedule' => 'Lun-Dom 10:00 AM - 9:00 PM',
                'style' => 'minimal-modern',
                'fontFamily' => 'sans-serif',
                'pattern' => 'grid-subtle',
            ])
        ]);

        $this->command->info('✅ 3 plantillas creadas exitosamente:');
        $this->command->info('   1. Majestic Barber (Premium Dorado)');
        $this->command->info('   2. Classic Barber (Vintage Rojo)');
        $this->command->info('   3. Modern Minimal (Minimalista Azul)');
    }
}