<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AuthService
{
    public function __construct(
        protected CustomerService $customerService
    ) {}

    /**
     * Buscar o crear un usuario desde Google OAuth.
     *
     * @param array $googleData Datos del usuario desde Google
     * @return User
     */
    public function findOrCreateGoogleUser(array $googleData): User
    {
        return DB::transaction(function () use ($googleData) {
            // 1. Buscar usuario por google_id
            $user = User::where('google_id', $googleData['google_id'])->first();

            if ($user) {
                // Actualizar avatar si cambió
                if ($user->avatar !== $googleData['avatar']) {
                    $user->update(['avatar' => $googleData['avatar']]);
                }
                return $user;
            }

            // 2. Buscar usuario por email (caso: usuario existe con email/password)
            $user = User::where('email', $googleData['email'])->first();

            if ($user) {
                // Vincular cuenta de Google a usuario existente
                $user->update([
                    'google_id' => $googleData['google_id'],
                    'avatar' => $googleData['avatar'],
                ]);
                return $user;
            }

            // 3. Crear nuevo usuario
            $user = User::create([
                'name' => $googleData['name'],
                'email' => $googleData['email'],
                'google_id' => $googleData['google_id'],
                'avatar' => $googleData['avatar'],
                'role' => 'customer',
                'password' => null, // No password para OAuth users
                'email_verified_at' => now(), // Google ya verificó el email
            ]);

            // 4. Buscar customers existentes con este email y vincularlos
            $this->linkExistingCustomersToUser($user);

            return $user;
        });
    }

    /**
     * Buscar o crear un usuario con email/password.
     *
     * @param array $data Datos del usuario (name, email, password)
     * @return User
     */
    public function createEmailPasswordUser(array $data): User
    {
        return DB::transaction(function () use ($data) {
            // Verificar que el email no esté en uso
            if (User::where('email', $data['email'])->exists()) {
                throw new \Exception('Email already registered');
            }

            // Crear usuario
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => bcrypt($data['password']),
                'role' => 'customer',
            ]);

            // Vincular customers existentes con este email
            $this->linkExistingCustomersToUser($user);

            return $user;
        });
    }

    /**
     * Busca customers existentes (guests) que usaron este email
     * y los vincula al usuario recién creado/autenticado.
     *
     * Esto permite que un usuario que hizo bookings/orders como guest
     * pueda ver su historial después de registrarse.
     *
     * @param User $user
     * @return int Cantidad de customers vinculados
     */
    protected function linkExistingCustomersToUser(User $user): int
    {
        if (empty($user->email)) {
            return 0;
        }

        // Buscar customers que tienen este email pero no tienen user_id
        $customers = \App\Models\Customer::where('email', $user->email)
            ->whereNull('user_id')
            ->get();

        $linkedCount = 0;

        foreach ($customers as $customer) {
            // Verificar si ya existe un customer registrado para este user en esta cuenta
            $existingCustomer = \App\Models\Customer::where('user_id', $user->id)
                ->where('account_id', $customer->account_id)
                ->first();

            if ($existingCustomer) {
                // Ya existe, fusionar los datos
                $this->customerService->mergeCustomers($customer, $existingCustomer);
            } else {
                // No existe, solo vincular
                $customer->update(['user_id' => $user->id]);
                $linkedCount++;
            }
        }

        return $linkedCount;
    }

    /**
     * Verifica las credenciales de un usuario (email/password).
     *
     * @param string $email
     * @param string $password
     * @return User|null
     */
    public function attemptEmailPasswordLogin(string $email, string $password): ?User
    {
        $user = User::where('email', $email)->first();

        if (!$user || !$user->password) {
            return null;
        }

        if (!\Hash::check($password, $user->password)) {
            return null;
        }

        return $user;
    }

    /**
     * Generar token de verificación de email.
     *
     * @param User $user
     * @return string Token generado
     */
    public function generateEmailVerificationToken(User $user): string
    {
        $token = Str::random(64);

        // Guardar token en la base de datos (puedes crear una tabla para esto)
        // Por ahora lo retornamos para enviarlo por email

        return $token;
    }

    /**
     * Verificar email con token.
     *
     * @param string $token
     * @return bool
     */
    public function verifyEmailWithToken(string $token): bool
    {
        // Implementar verificación de token
        // Por ahora retornamos true para simplificar

        return true;
    }

    /**
     * Generar token de recuperación de contraseña.
     *
     * @param User $user
     * @return string
     */
    public function generatePasswordResetToken(User $user): string
    {
        $token = Str::random(64);

        // Guardar token en password_reset_tokens table
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => \Hash::make($token),
                'created_at' => now(),
            ]
        );

        return $token;
    }

    /**
     * Resetear contraseña con token.
     *
     * @param string $email
     * @param string $token
     * @param string $newPassword
     * @return bool
     */
    public function resetPasswordWithToken(string $email, string $token, string $newPassword): bool
    {
        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->first();

        if (!$resetRecord) {
            return false;
        }

        // Verificar que el token no haya expirado (1 hora)
        if (now()->diffInHours($resetRecord->created_at) > 1) {
            return false;
        }

        // Verificar token
        if (!\Hash::check($token, $resetRecord->token)) {
            return false;
        }

        // Actualizar contraseña
        $user = User::where('email', $email)->first();
        if (!$user) {
            return false;
        }

        $user->update(['password' => bcrypt($newPassword)]);

        // Eliminar token usado
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        return true;
    }
}
