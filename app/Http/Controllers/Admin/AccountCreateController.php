<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BusinessCategory;
use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountCreateController extends Controller
{
    /**
     * Mostrar formulario para crear nuevo cliente
     */
    public function __invoke(Request $request): Response
    {
        $plans = Plan::all(['id', 'name', 'type', 'price', 'billing_cycle']);

        $categories = BusinessCategory::with('children')
            ->where('is_active', true)
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Admin/AccountCreate', [
            'plans' => $plans,
            'categories' => $categories
        ]);
    }
}
