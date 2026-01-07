<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Login del usuario (owner de negocio)
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales inválidas'
            ], 401);
        }

        // 1. Obtener la cuenta
        $account = $user->account()->with(['businessCategory', 'activeModules'])->first();

        if (!$account) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes una cuenta asociada'
            ], 403);
        }

        // =========================================================
        // 🔥 LÓGICA DE MÓDULOS DINÁMICA 🔥
        // =========================================================
        
        // A. Lógica Estándar (Base de Datos)
        $account->category = $account->businessCategory->slug ?? 'personal';
        $categoryModules = $account->businessCategory->default_modules ?? '[]';
        
        if (is_string($categoryModules)) {
            $categoryModules = json_decode($categoryModules, true) ?? [];
        }
        $account->enabled_modules = $categoryModules;

        // B. --- EXCEPCIÓN HARDCODED PARA TONY BARBER ---
        // Si la cuenta es antigua y no tiene categoría en BD, forzamos los módulos aquí.
        if ($user->email === 'tony_barber@tribio.info') {
            $account->category = 'barber';
            $account->enabled_modules = ['bookings', 'gallery', 'reviews'];
        }
        // =========================================================

        // Crear token
        $token = $user->createToken('mobile-app', ['*'], now()->addYear())->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'owner',
                ],
                'account' => $account, 
                'access_token' => $token,
                'token_type' => 'Bearer',
                'expires_in' => 31536000,
            ]
        ]);
    }

    /**
     * Logout del usuario
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada exitosamente'
        ]);
    }

    /**
     * Obtener información del usuario autenticado (Persistencia)
     */
    public function me(Request $request)
    {
        $user = $request->user();
        $account = $user->account()->with(['businessCategory', 'activeModules'])->first();

        if ($account) {
            // A. Lógica Estándar
            $account->category = $account->businessCategory->slug ?? 'personal';
            $categoryModules = $account->businessCategory->default_modules ?? '[]';
            if (is_string($categoryModules)) {
                $categoryModules = json_decode($categoryModules, true) ?? [];
            }
            $account->enabled_modules = $categoryModules;

            // B. --- EXCEPCIÓN HARDCODED PARA TONY BARBER ---
            if ($user->email === 'tony_barber@tribio.info') {
                $account->category = 'barber';
                $account->enabled_modules = ['bookings', 'gallery', 'reviews'];
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'account' => $account,
                'modules' => $account->activeModules ?? [],
            ]
        ]);
    }
}