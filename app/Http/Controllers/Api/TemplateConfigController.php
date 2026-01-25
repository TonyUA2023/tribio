<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TemplateConfigController extends Controller
{
    /**
     * Obtener la configuración del template para un perfil
     *
     * GET /api/{accountSlug}/template-config
     */
    public function show(string $accountSlug): JsonResponse
    {
        $account = Account::where('slug', $accountSlug)->firstOrFail();
        $profile = $account->profiles()->first();

        if (!$profile) {
            return response()->json([
                'success' => false,
                'message' => 'No profile found for this account'
            ], 404);
        }

        // Configuración por defecto
        $defaultConfig = [
            'hide_prices' => false,
            'language' => 'es', // 'es' | 'en'
            'show_description' => true,
            'currency' => 'PEN',
            'currency_symbol' => 'S/',
        ];

        $templateConfig = array_merge($defaultConfig, $profile->template_config ?? []);

        return response()->json([
            'success' => true,
            'data' => $templateConfig
        ]);
    }

    /**
     * Actualizar la configuración del template
     *
     * PUT /api/{accountSlug}/template-config
     */
    public function update(Request $request, string $accountSlug): JsonResponse
    {
        $account = Account::where('slug', $accountSlug)->firstOrFail();
        $profile = $account->profiles()->first();

        if (!$profile) {
            return response()->json([
                'success' => false,
                'message' => 'No profile found for this account'
            ], 404);
        }

        $validated = $request->validate([
            'hide_prices' => 'sometimes|boolean',
            'language' => 'sometimes|in:es,en',
            'show_description' => 'sometimes|boolean',
            'currency' => 'sometimes|string|max:10',
            'currency_symbol' => 'sometimes|string|max:10',
        ]);

        // Merge con configuración existente
        $currentConfig = $profile->template_config ?? [];
        $newConfig = array_merge($currentConfig, $validated);

        $profile->update([
            'template_config' => $newConfig
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Template configuration updated successfully',
            'data' => $newConfig
        ]);
    }

    /**
     * Resetear configuración a valores por defecto
     *
     * DELETE /api/{accountSlug}/template-config
     */
    public function reset(string $accountSlug): JsonResponse
    {
        $account = Account::where('slug', $accountSlug)->firstOrFail();
        $profile = $account->profiles()->first();

        if (!$profile) {
            return response()->json([
                'success' => false,
                'message' => 'No profile found for this account'
            ], 404);
        }

        $profile->update([
            'template_config' => null
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Template configuration reset to defaults'
        ]);
    }
}
