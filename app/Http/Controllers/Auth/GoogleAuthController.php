<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function __construct(
        protected AuthService $authService
    ) {}

    /**
     * Redirige al usuario a Google para autenticación.
     */
    public function redirectToGoogle(): RedirectResponse
    {
        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }

    /**
     * Maneja el callback de Google después de la autenticación.
     *
     * Este método:
     * 1. Obtiene los datos del usuario desde Google
     * 2. Busca o crea el usuario en nuestra base de datos
     * 3. Autentica al usuario
     * 4. Genera un token de Sanctum
     * 5. Redirige al dashboard o frontend
     */
    public function handleGoogleCallback(): JsonResponse|RedirectResponse
    {
        try {
            // Obtener datos del usuario desde Google
            $googleUser = Socialite::driver('google')->stateless()->user();

            // Buscar o crear usuario
            $user = $this->authService->findOrCreateGoogleUser([
                'google_id' => $googleUser->getId(),
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'avatar' => $googleUser->getAvatar(),
            ]);

            // Autenticar al usuario
            Auth::login($user, true);

            // Si es una solicitud de API, retornar token
            if (request()->expectsJson() || request()->is('api/*')) {
                $token = $user->createToken('google-auth-token')->plainTextToken;

                return response()->json([
                    'success' => true,
                    'message' => 'Authenticated successfully',
                    'user' => $user->load('customer'),
                    'token' => $token,
                ]);
            }

            // Para web, redirigir al dashboard del cliente
            return redirect()->intended('/customer/dashboard')->with('success', 'Welcome back!');

        } catch (\Exception $e) {
            \Log::error('Google OAuth Error: ' . $e->getMessage());

            if (request()->expectsJson() || request()->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication failed',
                    'error' => config('app.debug') ? $e->getMessage() : 'Unable to authenticate with Google',
                ], 500);
            }

            return redirect('/login')->with('error', 'Unable to authenticate with Google. Please try again.');
        }
    }

    /**
     * Cerrar sesión del usuario.
     */
    public function logout(): JsonResponse|RedirectResponse
    {
        $user = Auth::user();

        // Revocar todos los tokens de Sanctum
        if ($user) {
            $user->tokens()->delete();
        }

        Auth::logout();

        if (request()->expectsJson() || request()->is('api/*')) {
            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully',
            ]);
        }

        return redirect('/')->with('success', 'Logged out successfully');
    }
}
