<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user();

        // Obtener la cuenta actual desde la sesión o usar la primera
        $currentAccountId = session('current_account_id');
        $account = null;

        if ($user) {
            if ($currentAccountId) {
                // Intentar obtener la cuenta de la sesión
                $account = $user->accounts()->where('id', $currentAccountId)->first();
            }

            // Si no hay cuenta en sesión o no es válida, usar la primera
            if (!$account) {
                $account = $user->accounts()->first();
                if ($account) {
                    session(['current_account_id' => $account->id]);
                }
            }
        }

        $profile = $account?->profiles()->first();

        // Obtener el logo del perfil si existe
        $profileLogo = null;
        if ($profile) {
            $profileData = $profile->data ?? [];
            $profileLogo = $profileData['profile_logo'] ?? $profileData['logo'] ?? null;
        }

        // Obtener todas las cuentas/negocios del usuario
        $userAccounts = [];
        if ($user) {
            $userAccounts = $user->accounts()->get()->map(function ($acc) {
                $accProfile = $acc->profiles()->first();
                $accProfileData = $accProfile?->data ?? [];
                $accLogo = $accProfileData['profile_logo'] ?? $accProfileData['logo'] ?? $acc->logo_url ?? null;

                return [
                    'id' => $acc->id,
                    'name' => $acc->name,
                    'slug' => $acc->slug,
                    'logo' => $accLogo,
                ];
            })->toArray();
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ] : null,
            ],
            'account' => $account ? [
                'id' => $account->id,
                'name' => $account->name,
                'slug' => $account->slug,
                'type' => $account->type,
                'logo' => $profileLogo,
                'profile' => $profile ? [
                    'id' => $profile->id,
                    'name' => $profile->name,
                    'title' => $profile->title,
                    'slug' => $profile->slug,
                ] : null,
            ] : null,
            'userAccounts' => $userAccounts,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
