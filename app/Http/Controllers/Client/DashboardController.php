<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Muestra el dashboard del cliente según su rol.
     */
    public function index()
    {
        // 1. Obtenemos el usuario autenticado
        $user = Auth::user();

        // 2. Redirigir según el rol del usuario
        if ($user->isSuperAdmin()) {
            // Super Admin: redirigir al dashboard de super admin
            return redirect()->route('admin.dashboard');
        }

        // 3. Verificar que el usuario tenga una cuenta asociada
        $account = $user->account()->with(['profiles.template', 'plan'])->first();

        if (!$account) {
            // Si el usuario no tiene cuenta asociada, mostrar error
            abort(500, 'Tu usuario no está asociado a ninguna cuenta de cliente.');
        }

        // 4. Determinar qué dashboard mostrar según el rol
        if ($user->isAdmin()) {
            // Admin (Empresa): Dashboard para gestionar múltiples perfiles
            return Inertia::render('Admin/CompanyDashboard', [
                'account' => $account,
                'profiles' => $account->profiles,
                'user' => $user
            ]);
        }

        // 5. Client (Emprendedor): Dashboard simple con su único perfil
        $profile = $account->profiles->first();

        // Obtener las citas del perfil si existe
        $bookings = $profile
            ? $profile->bookings()
                ->upcoming()
                ->with('profile')
                ->orderBy('booking_date')
                ->orderBy('booking_time')
                ->get()
            : collect([]);

        return Inertia::render('Client/Dashboard', [
            'account' => $account,
            'profile' => $profile,
            'bookings' => $bookings,
            'user' => $user
        ]);
    }
}