<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Plan;

class PlansSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Plan::firstOrCreate(['name' => 'Plan Empresa Custom'], [
            'price' => 250.00,
            'billing_cycle' => 'onetime',
            'type' => 'service',
            'description' => 'Diseño 100% a medida y desarrollo de micro-sitio.'
        ]);

        Plan::firstOrCreate(['name' => 'Plan Personal SaaS'], [
            'price' => 15.00,
            'billing_cycle' => 'monthly',
            'type' => 'saas',
            'description' => 'Acceso a plantillas estándar.'
        ]);
    }
}