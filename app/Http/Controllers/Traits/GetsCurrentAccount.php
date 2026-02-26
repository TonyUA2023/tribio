<?php

namespace App\Http\Controllers\Traits;

use App\Models\Account;
use App\Models\User;

trait GetsCurrentAccount
{
    /**
     * Obtiene la cuenta actual del usuario desde la sesión (multi-negocio)
     */
    protected function getCurrentAccount(User $user, array $with = []): ?Account
    {
        $currentAccountId = session('current_account_id');
        $account = null;

        $query = $user->accounts();

        if (!empty($with)) {
            $query->with($with);
        }

        if ($currentAccountId) {
            $account = $query->where('id', $currentAccountId)->first();
        }

        // Si no hay cuenta en sesión o no es válida, usar la primera
        if (!$account) {
            $account = $user->accounts()->when(!empty($with), fn($q) => $q->with($with))->first();
            if ($account) {
                session(['current_account_id' => $account->id]);
            }
        }

        return $account;
    }
}
