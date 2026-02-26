<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Services\MlPredictionService;
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

        // 3. Obtener la cuenta actual desde la sesión (multi-negocio)
        $currentAccountId = session('current_account_id');
        $account = null;

        if ($currentAccountId) {
            // Intentar obtener la cuenta de la sesión
            $account = $user->accounts()->where('id', $currentAccountId)->with(['profiles.template', 'plan'])->first();
        }

        // Si no hay cuenta en sesión o no es válida, usar la primera
        if (!$account) {
            $account = $user->accounts()->with(['profiles.template', 'plan'])->first();
            if ($account) {
                session(['current_account_id' => $account->id]);
            }
        }

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

        // Cargar el tipo de negocio
        $account->load('businessType');

        $businessTypeSlug = $account->businessType?->slug;

        // Preparar datos según el tipo de negocio
        if ($businessTypeSlug === 'store') {
            // Dashboard para TIENDA VIRTUAL
            return $this->renderStoreDashboard($account, $profile, $user);
        }

        // Dashboard para CITAS (default)
        return $this->renderAppointmentsDashboard($account, $profile, $user);
    }

    /**
     * Dashboard para negocios de tipo TIENDA
     */
    private function renderStoreDashboard($account, $profile, $user)
    {
        // Obtener estadísticas de productos
        $productsCount = $account->products()->count();
        $productsAvailable = $account->products()->available()->count();
        $productsFeatured = $account->products()->featured()->count();
        $lowStockCount = $account->products()->whereNotNull('stock')->where('stock', '<=', 5)->count();

        // Obtener pedidos recientes
        $recentOrders = $account->orders()
            ->with('customer')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        // Estadísticas de pedidos
        $ordersStats = [
            'total' => $account->orders()->count(),
            'pending' => $account->orders()->where('status', 'pending')->count(),
            'processing' => $account->orders()->where('status', 'processing')->count(),
            'completed' => $account->orders()->where('status', 'completed')->count(),
            'today_revenue' => $account->orders()
                ->where('payment_status', 'paid')
                ->whereDate('created_at', today())
                ->sum('total'),
            'month_revenue' => $account->orders()
                ->where('payment_status', 'paid')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('total'),
        ];

        // Productos con bajo stock
        $lowStockProducts = $account->products()
            ->whereNotNull('stock')
            ->where('stock', '<=', 5)
            ->where('stock', '>', 0)
            ->orderBy('stock')
            ->take(5)
            ->get();

        // Calcular métricas para predicciones ML
        $totalProducts = max($productsCount, 1);
        $productsWithImage = $account->products()->whereNotNull('image')->count();
        $productsWithDesc = $account->products()->whereNotNull('description')->where('description', '!=', '')->count();
        $productsWithDiscount = $account->products()
            ->whereNotNull('compare_price')
            ->whereColumn('compare_price', '>', 'price')
            ->count();

        // Cargar relaciones para config de tienda
        $account->load(['storeTemplate', 'plan']);

        // M3 + M4 — predicciones ML en paralelo (Http::pool)
        $mlService = new MlPredictionService();

        $mlDesignData = [
            'payment_settings_enabled'       => $account->payment_settings ? 1 : 0,
            'total_products_active'           => $productsAvailable,
            'products_with_image_pct'         => round($productsWithImage / $totalProducts, 2),
            'products_with_description_pct'   => round($productsWithDesc / $totalProducts, 2),
            'products_with_discount_pct'      => round($productsWithDiscount / $totalProducts, 2),
            'has_custom_logo'                 => $account->logo ? 1 : 0,
            'plan_id'                         => $account->plan?->slug ?? 'free',
            'template_slug'                   => $account->storeTemplate?->name ?? 'NikeStyle',
            'business_type_slug'              => 'store',
        ];

        $mlGrowthData = [
            'has_whatsapp'       => $account->whatsapp ? 1 : 0,
            'avg_rating'         => 4.5,
            'business_type_slug' => 'store',
        ];

        $mlDesign = $mlService->predictDesign($mlDesignData);
        $mlGrowth = $mlService->predictGrowth($mlGrowthData);

        // Nota: 'account' viene del middleware HandleInertiaRequests con businessType incluido
        return Inertia::render('Client/StoreDashboard', [
            'profile' => $profile,
            'user' => $user,
            'stats' => [
                'products' => [
                    'total' => $productsCount,
                    'available' => $productsAvailable,
                    'featured' => $productsFeatured,
                    'lowStock' => $lowStockCount,
                ],
                'orders' => $ordersStats,
            ],
            'recentOrders' => $recentOrders,
            'lowStockProducts' => $lowStockProducts,
            'ml_design' => $mlDesign,
            'ml_growth' => $mlGrowth,
        ]);
    }

    /**
     * Dashboard para negocios de tipo CITAS
     */
    private function renderAppointmentsDashboard($account, $profile, $user)
    {
        // Obtener las citas del perfil si existe
        $bookings = $profile
            ? $profile->bookings()
                ->upcoming()
                ->with('profile')
                ->orderBy('booking_date')
                ->orderBy('booking_time')
                ->get()
            : collect([]);

        // Nota: 'account' viene del middleware HandleInertiaRequests con businessType incluido
        return Inertia::render('Client/Dashboard', [
            'profile' => $profile,
            'bookings' => $bookings,
            'user' => $user,
        ]);
    }
}