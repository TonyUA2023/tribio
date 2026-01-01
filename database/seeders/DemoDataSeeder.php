<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Account;
use App\Models\Profile;
use App\Models\Plan;
use App\Models\Template;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // NOTA: No usamos DB::transaction() aquí porque entra en conflicto
        // con Schema::disableForeignKeyConstraints() del DatabaseSeeder.php
        
        // 1. LIMPIEZA DE DATOS DE DEMO
        // Esto es seguro gracias a Schema::disableForeignKeyConstraints()
        Profile::truncate();
        Account::truncate();
        User::whereIn('email', [
            'admin@jstack.com',
            'admin@tractoleo.com',
            'ana@foto.com'
        ])->delete();

        
        // 2. CREACIÓN DEL SUPER ADMIN (JSTACK - Tú, el dueño de la plataforma)
        $adminUser = User::firstOrCreate(['email' => 'admin@jstack.com'], [
            'name' => 'JSTACK Admin',
            'password' => Hash::make('password'), // ¡¡Cambia 'password' por una contraseña segura!!
            'role' => 'super_admin' // Super Admin: dueño de la plataforma
        ]);


        // 3. DATOS B2B (EMPRESA CUSTOM) "TRACTOLEO"

        // Cargar el plan "Custom" o "Service"
        $customPlan = Plan::where('type', 'service')->first();

        // Crear el usuario dueño de la cuenta "Tractoleo" (Empresa)
        $tractoleoUser = User::firstOrCreate(['email' => 'admin@tractoleo.com'], [
            'name' => 'Gerencia Tractoleo',
            'password' => Hash::make('password'), // 'password' de prueba
            'role' => 'admin' // Admin: empresa que gestiona múltiples perfiles de empleados
        ]);

        // Crear la cuenta "Tractoleo"
        $tractoleoAccount = Account::firstOrCreate(['slug' => 'tractoleo'], [
            'user_id' => $tractoleoUser->id,
            'plan_id' => $customPlan ? $customPlan->id : null,
            'name' => 'Tractoleo S.A.C.',
            'type' => 'company',
            'payment_status' => 'active'
        ]);

        // Crear el perfil "custom" para el gerente
        Profile::firstOrCreate(['account_id' => $tractoleoAccount->id, 'slug' => 'gerente1'], [
            'name' => 'Juan Pérez',
            'title' => 'Gerente de Ventas',
            'render_type' => 'custom',
            // Apunta a 'resources/js/Pages/Custom/TonyDev.tsx'
            'custom_view_path' => 'Custom/TonyDev', 
            'data' => [
                'bio' => 'Gerente de ventas en Tractoleo con 10 años de experiencia.',
                'phone' => '+51987654321',
                'email' => 'jperez@tractoleo.com'
            ]
        ]);


        // 4. DATOS B2C (PERSONAL SAAS) "ANA FOTÓGRAFA"

        // Cargar el plan "SaaS" y la plantilla "Standard"
        $saasPlan = Plan::where('type', 'saas')->first();
        $standardTemplate = Template::where('name', 'Plantilla Estándar')->first();

        // Crear la usuaria "Ana" (Emprendedora individual)
        $anaUser = User::firstOrCreate(['email' => 'ana@foto.com'], [
            'name' => 'Ana García',
            'password' => Hash::make('password'),
            'role' => 'client' // Client: emprendedor individual con un solo perfil
        ]);

        // Crear la cuenta "Ana"
        $anaAccount = Account::firstOrCreate(['slug' => 'anagarcia'], [
            'user_id' => $anaUser->id,
            'plan_id' => $saasPlan ? $saasPlan->id : null,
            'name' => 'Ana García Fotografía',
            'type' => 'personal',
            'payment_status' => 'active'
        ]);

        // Crear el perfil "template" para Ana
        Profile::firstOrCreate(['account_id' => $anaAccount->id, 'slug' => 'portafolio'], [
            'name' => 'Ana García',
            'title' => 'Fotógrafa de Bodas',
            'render_type' => 'template',
            'template_id' => $standardTemplate ? $standardTemplate->id : null,
            'data' => [
                'bio' => 'Capturando momentos únicos. Contacta para cotizaciones.',
                'links' => [
                    ['title' => 'Ver mi Portafolio', 'url' => 'https://behance.net/ana'],
                    ['title' => 'Escríbeme por WhatsApp', 'url' => 'https://wa.me/51999888777'],
                    ['title' => 'Sígueme en Instagram', 'url' => 'https://instagram.com/anafoto']
                ]
            ]
        ]);


        // 5. DATOS DE CONTACTO (JSTACK)

        // Crear la cuenta "contact" (usará el $adminUser y $customPlan ya cargados)
        $contactAccount = Account::firstOrCreate(['slug' => 'contact'], [
            'user_id' => $adminUser->id,
            'plan_id' => $customPlan ? $customPlan->id : null,
            'name' => 'JSTACK Contactos',
            'type' => 'company',
            'payment_status' => 'active'
        ]);

        // Perfil "tony_ulloa"
        Profile::firstOrCreate(['account_id' => $contactAccount->id, 'slug' => 'tony_ulloa'], [
            'name' => 'Tony Ulloa',
            'title' => 'Desarrollador Full-Stack en JSTACK',
            'render_type' => 'custom',
            'custom_view_path' => 'Custom/ContactTony', 
            'data' => [
                'bio' => 'Bienvenido a mi perfil de contacto. ¡Hablemos!',
                'email' => 'tony@jstackhub.com',
                'github' => 'https://github.com/tonyulloa'
            ]
        ]);

        // --- ¡NUEVO PERFIL AÑADIDO! ---
        // Perfil "danny_leon"
        Profile::firstOrCreate(['account_id' => $contactAccount->id, 'slug' => 'danny_leon'], [
            'name' => 'Danny Leon',
            'title' => 'Diseñador UI/UX en JSTACK',
            'render_type' => 'custom',
            'custom_view_path' => 'Custom/ContactDanny', // Apunta a un nuevo componente
            'data' => [
                'bio' => 'Creando interfaces intuitivas y atractivas para el usuario.',
                'email' => 'danny@jstackhub.com',
                'linkedin' => 'https://linkedin.com/in/dannyleon'
            ]
        ]);
    }
}