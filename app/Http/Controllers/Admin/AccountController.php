<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\AccountModule;
use App\Models\BusinessCategory;
use App\Models\Plan;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AccountController extends Controller
{
    /**
     * Obtener datos necesarios para el formulario de creación
     */
    public function getFormData()
    {
        $plans = Plan::all(['id', 'name', 'type', 'price', 'billing_cycle']);

        return response()->json([
            'plans' => $plans
        ]);
    }

    /**
     * Crear una nueva cuenta de cliente
     */
    public function store(Request $request)
    {
        // Validar datos
        $validated = $request->validate([
            'account_name' => 'required|string|max:255',
            'account_slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9-]+$/',
                'unique:accounts,slug'
            ],
            'account_type' => ['required', Rule::in(['company', 'personal', 'business'])],
            'plan_id' => 'required|exists:plans,id',
            'payment_status' => ['required', Rule::in(['active', 'due', 'suspended'])],
            'business_category_id' => 'nullable|exists:business_categories,id',
            'modules' => 'nullable|array',
            'modules.*' => 'string',
            'template_id' => 'nullable|exists:templates,id',

            // Datos del usuario dueño
            'owner_name' => 'required|string|max:255',
            'owner_email' => 'required|email|unique:users,email',
            'owner_password' => 'required|string|min:8|confirmed',
        ]);

        try {
            // Usar transacción para crear usuario y cuenta atómicamente
            DB::beginTransaction();

            // 1. Crear el usuario dueño
            $user = User::create([
                'name' => $validated['owner_name'],
                'email' => $validated['owner_email'],
                'password' => Hash::make($validated['owner_password']),
                'role' => $validated['account_type'] === 'company' ? 'admin' : 'client'
            ]);

            // 2. Crear la cuenta
            $account = Account::create([
                'user_id' => $user->id,
                'plan_id' => $validated['plan_id'],
                'name' => $validated['account_name'],
                'type' => $validated['account_type'],
                'slug' => $validated['account_slug'],
                'payment_status' => $validated['payment_status'],
                'business_category_id' => $validated['business_category_id'] ?? null,
                'next_billing_date' => $this->calculateNextBillingDate($validated['plan_id'])
            ]);

            // 3. Crear perfil por defecto para la cuenta
            $profile = Profile::create([
                'account_id' => $account->id,
                'name' => $validated['account_name'],
                'title' => $validated['account_name'],
                'slug' => $validated['account_slug'],
                'notification_email' => $validated['owner_email'],
                'render_type' => 'custom',
                'custom_view_path' => 'Custom/Standard',
                'data' => [
                    'bio' => '',
                    'phone' => '',
                    'address' => '',
                    'hours' => '',
                    'services' => [],
                    'primaryColor' => '#1e40af',
                    'secondaryColor' => '#3b82f6',
                ]
            ]);

            // 4. Crear módulos si fueron seleccionados
            if (!empty($validated['modules'])) {
                foreach ($validated['modules'] as $moduleSlug) {
                    AccountModule::create([
                        'account_id' => $account->id,
                        'module_slug' => $moduleSlug,
                        'is_active' => true,
                        'config' => null,
                    ]);
                }
            } elseif ($validated['business_category_id']) {
                // Si no se seleccionaron módulos manualmente, usar los por defecto de la categoría
                $category = BusinessCategory::find($validated['business_category_id']);
                if ($category && $category->default_modules) {
                    foreach ($category->default_modules as $moduleSlug) {
                        AccountModule::create([
                            'account_id' => $account->id,
                            'module_slug' => $moduleSlug,
                            'is_active' => true,
                            'config' => $category->default_config[$moduleSlug] ?? null,
                        ]);
                    }
                }
            }

            // 5. Asignar plantilla si fue seleccionada
            if (!empty($validated['template_id'])) {
                // Guardar en la tabla pivot
                $account->templates()->attach($validated['template_id'], [
                    'customizations' => json_encode([
                        'businessName' => $validated['account_name'],
                        'businessTitle' => $validated['account_name'],
                    ])
                ]);

                // ✅ IMPORTANTE: Actualizar active_template_id para que se renderice
                $account->update([
                    'active_template_id' => $validated['template_id']
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cliente creado exitosamente',
                'account' => $account->load(['owner', 'plan', 'businessCategory', 'activeModules'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error al crear el cliente: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar una cuenta existente
     */
    public function update(Request $request, Account $account)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => [
                'sometimes',
                'string',
                'max:255',
                'regex:/^[a-z0-9-]+$/',
                Rule::unique('accounts', 'slug')->ignore($account->id)
            ],
            'type' => ['sometimes', Rule::in(['company', 'personal', 'business'])],
            'plan_id' => 'sometimes|exists:plans,id',
            'payment_status' => ['sometimes', Rule::in(['active', 'due', 'suspended'])],
            'business_category_id' => 'nullable|exists:business_categories,id',
            'modules' => 'nullable|array',
            'modules.*' => 'string',
        ]);

        try {
            DB::beginTransaction();

            // Actualizar datos básicos de la cuenta
            $account->update($validated);

            // Si se enviaron módulos, actualizar la configuración de módulos
            if (isset($validated['modules'])) {
                // Eliminar módulos existentes
                $account->modules()->delete();

                // Crear nuevos módulos
                foreach ($validated['modules'] as $moduleSlug) {
                    AccountModule::create([
                        'account_id' => $account->id,
                        'module_slug' => $moduleSlug,
                        'is_active' => true,
                        'config' => null,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cliente actualizado exitosamente',
                'account' => $account->fresh(['owner', 'plan', 'businessCategory', 'activeModules'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar una cuenta
     */
    public function destroy(Account $account)
    {
        try {
            DB::beginTransaction();

            // Eliminar perfiles asociados (las visitas y clics se eliminan en cascada)
            $account->profiles()->delete();

            // Eliminar la cuenta
            $account->delete();

            // Opcionalmente eliminar el usuario (comentado por seguridad)
            // $account->owner->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cliente eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calcular próxima fecha de facturación según el plan
     */
    private function calculateNextBillingDate($planId)
    {
        $plan = Plan::find($planId);

        if (!$plan || $plan->billing_cycle === 'onetime') {
            return null;
        }

        $now = now();

        return match($plan->billing_cycle) {
            'monthly' => $now->addMonth(),
            'annual' => $now->addYear(),
            default => null
        };
    }

    /**
     * Generar slug único basado en el nombre
     */
    public function generateSlug(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255'
        ]);

        $baseSlug = Str::slug($request->name);
        $slug = $baseSlug;
        $counter = 1;

        // Verificar que el slug sea único
        while (Account::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return response()->json([
            'slug' => $slug
        ]);
    }
}
