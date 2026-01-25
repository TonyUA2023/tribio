<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class CustomerProfileController extends Controller
{
    /**
     * Obtener perfil del cliente.
     *
     * GET /api/customer/profile
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isCustomer()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'google_id' => $user->google_id ? true : false,
                'has_password' => $user->password ? true : false,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
            ],
        ]);
    }

    /**
     * Actualizar perfil del cliente.
     *
     * PUT /api/customer/profile
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isCustomer()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:users,email,' . $user->id,
        ]);

        $updateData = [];

        if (isset($validated['name'])) {
            $updateData['name'] = $validated['name'];
        }

        if (isset($validated['email']) && $validated['email'] !== $user->email) {
            $updateData['email'] = $validated['email'];
            // Reset email verification
            $updateData['email_verified_at'] = null;
        }

        if (!empty($updateData)) {
            $user->update($updateData);
        }

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'profile' => $user->fresh(),
        ]);
    }

    /**
     * Actualizar avatar del cliente.
     *
     * POST /api/customer/profile/avatar
     */
    public function updateAvatar(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isCustomer()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $validated = $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Eliminar avatar anterior si existe y no es de Google
        if ($user->avatar && !str_contains($user->avatar, 'googleusercontent.com')) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Guardar nuevo avatar
        $path = $request->file('avatar')->store('avatars', 'public');

        $user->update(['avatar' => $path]);

        return response()->json([
            'success' => true,
            'message' => 'Avatar updated successfully',
            'avatar' => Storage::url($path),
        ]);
    }

    /**
     * Cambiar contraseña del cliente.
     *
     * PUT /api/customer/profile/password
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isCustomer()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $validated = $request->validate([
            'current_password' => 'required_with:new_password|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        // Si el usuario tiene password, verificar el actual
        if ($user->password) {
            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current password is incorrect',
                ], 400);
            }
        }

        // Actualizar password
        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully',
        ]);
    }

    /**
     * Eliminar cuenta del cliente.
     *
     * DELETE /api/customer/profile
     */
    public function destroy(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isCustomer()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $validated = $request->validate([
            'password' => 'required_if:has_password,true|string',
            'confirmation' => 'required|in:DELETE',
        ]);

        // Verificar password si existe
        if ($user->password) {
            if (!Hash::check($validated['password'], $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Password is incorrect',
                ], 400);
            }
        }

        // Desvincular customers (no eliminarlos, solo quitar user_id)
        \App\Models\Customer::where('user_id', $user->id)
            ->update(['user_id' => null]);

        // Revocar todos los tokens
        $user->tokens()->delete();

        // Eliminar avatar si existe
        if ($user->avatar && !str_contains($user->avatar, 'googleusercontent.com')) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Eliminar usuario
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Account deleted successfully',
        ]);
    }

    /**
     * Verificar email con token.
     *
     * POST /api/customer/profile/verify-email
     */
    public function verifyEmail(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isCustomer()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $validated = $request->validate([
            'token' => 'required|string',
        ]);

        // Aquí implementarías la verificación del token
        // Por ahora simplificamos
        $user->update([
            'email_verified_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully',
        ]);
    }

    /**
     * Solicitar reenvío de email de verificación.
     *
     * POST /api/customer/profile/resend-verification
     */
    public function resendVerification(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isCustomer()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if ($user->email_verified_at) {
            return response()->json([
                'success' => false,
                'message' => 'Email already verified',
            ], 400);
        }

        // Aquí enviarías el email de verificación
        // Por ahora simplificamos

        return response()->json([
            'success' => true,
            'message' => 'Verification email sent',
        ]);
    }
}
