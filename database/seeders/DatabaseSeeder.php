<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema; // <-- Asegúrate de tener este import

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Desactivamos la revisión de llaves foráneas
        Schema::disableForeignKeyConstraints();

        // \App\Models\User::factory(10)->create();

        // Llamamos a nuestros seeders en el orden correcto
        $this->call([
            PlansSeeder::class,
            TemplatesSeeder::class,
            DemoDataSeeder::class,
        ]);

        // Reactivamos la revisión de llaves foráneas
        Schema::enableForeignKeyConstraints();
    }
}