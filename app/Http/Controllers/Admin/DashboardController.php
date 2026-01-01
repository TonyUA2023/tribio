<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Account;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Muestra el dashboard principal del Super Admin.
     */
    public function index(): Response
    {
        // 1. Obtenemos todas las cuentas de clientes
        // 2. Usamos 'with' para cargar las relaciones (Plan y Dueño)
        //    y así evitar problemas de N+1 (consultas lentas).
        $accounts = Account::with(['plan', 'owner'])
            ->orderBy('name')
            ->get();

        // 3. Renderizamos la página de React y le pasamos los datos
        return Inertia::render('Admin/Dashboard', [
            'accounts' => $accounts
        ]);
    }
}