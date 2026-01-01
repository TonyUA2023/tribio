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
        // Limpiamos la tabla
        Template::truncate();

        Template::firstOrCreate(['name' => 'Plantilla Estándar'], [
            // Apunta a 'resources/js/Pages/Templates/Standard.tsx'
            'blade_view_path' => 'Templates/Standard', 
            'description' => 'Un diseño limpio y simple de lista de enlaces.',
            'preview_image_url' => '/images/previews/standard.png'
        ]);
    }
}