<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class CustomerAuthController extends Controller
{
    /**
     * Show the customer login page for a specific store.
     */
    public function showLogin(string $account_slug)
    {
        $account = Account::where('slug', $account_slug)->firstOrFail();

        // Get store config
        $storeConfig = $this->getStoreConfig($account);

        return Inertia::render('Store/Auth/CustomerLogin', [
            'data' => [
                'config' => $storeConfig,
                'account_slug' => $account_slug,
            ],
        ]);
    }

    /**
     * Show the customer registration page for a specific store.
     */
    public function showRegister(string $account_slug)
    {
        $account = Account::where('slug', $account_slug)->firstOrFail();

        // Get store config
        $storeConfig = $this->getStoreConfig($account);

        return Inertia::render('Store/Auth/CustomerRegister', [
            'data' => [
                'config' => $storeConfig,
                'account_slug' => $account_slug,
            ],
        ]);
    }

    /**
     * Handle customer login.
     */
    public function login(Request $request, string $account_slug)
    {
        $account = Account::where('slug', $account_slug)->firstOrFail();

        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ], [
            'email.required' => 'El email es requerido',
            'email.email' => 'El email no es válido',
            'password.required' => 'La contraseña es requerida',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Try to authenticate - any registered Tribio user can buy
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return back()->withErrors([
                'email' => 'Las credenciales no coinciden con nuestros registros.',
            ])->withInput();
        }

        // Log in the user
        Auth::login($user, $request->boolean('remember'));

        // Ensure a Customer record exists for this user in this store
        Customer::firstOrCreate(
            ['user_id' => $user->id, 'account_id' => $account->id],
            [
                'name' => $user->name,
                'email' => $user->email,
            ]
        );

        // Redirect to checkout or customer dashboard
        $intendedUrl = session('customer_intended_url');
        if ($intendedUrl) {
            session()->forget('customer_intended_url');
            return redirect($intendedUrl);
        }

        return redirect("/{$account_slug}/checkout");
    }

    /**
     * Handle customer registration.
     */
    public function register(Request $request, string $account_slug)
    {
        $account = Account::where('slug', $account_slug)->firstOrFail();

        // Check if user already exists (may have a different role like client/admin)
        $existingUser = User::where('email', $request->email)->first();

        if ($existingUser) {
            // User already exists - try to log them in with the provided password
            if (Hash::check($request->password, $existingUser->password)) {
                Auth::login($existingUser);

                // Ensure Customer record exists for this store
                Customer::firstOrCreate(
                    ['user_id' => $existingUser->id, 'account_id' => $account->id],
                    [
                        'name' => $existingUser->name,
                        'email' => $existingUser->email,
                        'phone' => $request->phone,
                    ]
                );

                return redirect("/{$account_slug}/checkout");
            }

            return back()->withErrors([
                'email' => 'Este email ya está registrado. Intenta iniciar sesión.',
            ])->withInput();
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:6|confirmed',
        ], [
            'name.required' => 'El nombre es requerido',
            'email.required' => 'El email es requerido',
            'email.email' => 'El email no es válido',
            'phone.required' => 'El teléfono es requerido',
            'password.required' => 'La contraseña es requerida',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres',
            'password.confirmed' => 'Las contraseñas no coinciden',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Create new user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'customer',
        ]);

        // Create customer record linked to this store
        Customer::create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
        ]);

        // Log in the user
        Auth::login($user);

        return redirect("/{$account_slug}/checkout");
    }

    /**
     * Log out the customer.
     */
    public function logout(Request $request, string $account_slug)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('store.home', ['account_slug' => $account_slug]);
    }

    /**
     * Show customer dashboard.
     */
    public function dashboard(string $account_slug)
    {
        $account = Account::where('slug', $account_slug)->firstOrFail();
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('store.customer.login', ['account_slug' => $account_slug]);
        }

        // Get all customer records for this user (across all stores)
        $customers = Customer::where('user_id', $user->id)->get();

        // Get orders for all customer records
        $orders = collect();
        $bookings = collect();
        $favorites = collect();

        foreach ($customers as $customer) {
            $orders = $orders->merge($customer->orders()->with(['account', 'items.product'])->get());
            $bookings = $bookings->merge($customer->bookings()->with('account')->get());
        }

        // Sort by date
        $orders = $orders->sortByDesc('created_at')->values();
        $bookings = $bookings->sortByDesc('created_at')->values();

        $storeConfig = $this->getStoreConfig($account);

        return Inertia::render('Store/CustomerDashboard', [
            'data' => [
                'config' => $storeConfig,
                'account_slug' => $account_slug,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->profile_photo_url ?? null,
                ],
                'orders' => $orders,
                'bookings' => $bookings,
                'favorites' => $favorites,
                'stats' => [
                    'total_orders' => $orders->count(),
                    'total_spent' => $orders->sum('total'),
                    'pending_orders' => $orders->where('status', 'pending')->count(),
                    'total_bookings' => $bookings->count(),
                ],
            ],
        ]);
    }

    /**
     * Show customer orders.
     */
    public function orders(string $account_slug)
    {
        $account = Account::where('slug', $account_slug)->firstOrFail();
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('store.customer.login', ['account_slug' => $account_slug]);
        }

        $customers = Customer::where('user_id', $user->id)->get();

        $orders = collect();
        foreach ($customers as $customer) {
            $orders = $orders->merge(
                $customer->orders()
                    ->with(['account', 'items.product'])
                    ->orderBy('created_at', 'desc')
                    ->get()
            );
        }

        $storeConfig = $this->getStoreConfig($account);

        return Inertia::render('Store/CustomerOrders', [
            'data' => [
                'config' => $storeConfig,
                'account_slug' => $account_slug,
                'orders' => $orders->sortByDesc('created_at')->values(),
            ],
        ]);
    }

    /**
     * Show customer settings.
     */
    public function settings(string $account_slug)
    {
        $account = Account::where('slug', $account_slug)->firstOrFail();
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('store.customer.login', ['account_slug' => $account_slug]);
        }

        // Get customer for this account
        $customer = Customer::where('user_id', $user->id)
            ->where('account_id', $account->id)
            ->first();

        $storeConfig = $this->getStoreConfig($account);

        return Inertia::render('Store/CustomerSettings', [
            'data' => [
                'config' => $storeConfig,
                'account_slug' => $account_slug,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
                'customer' => $customer,
            ],
        ]);
    }

    /**
     * Update customer settings.
     */
    public function updateSettings(Request $request, string $account_slug)
    {
        $account = Account::where('slug', $account_slug)->firstOrFail();
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('store.customer.login', ['account_slug' => $account_slug]);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'addresses' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Update user
        $user->update([
            'name' => $request->name,
        ]);

        // Update or create customer for this account
        Customer::updateOrCreate(
            ['user_id' => $user->id, 'account_id' => $account->id],
            [
                'name' => $request->name,
                'phone' => $request->phone,
                'addresses' => $request->addresses,
            ]
        );

        return back()->with('success', 'Configuración actualizada correctamente');
    }

    /**
     * Get store configuration for a given account.
     */
    private function getStoreConfig(Account $account): array
    {
        $profile = $account->profiles()->first();
        $profileData = $profile?->data ?? [];

        $storeTemplateConfig = $account->store_template_config ?? [];

        return [
            'id' => $account->id,
            'name' => $account->name,
            'slug' => $account->slug,
            'logo' => $storeTemplateConfig['logo'] ?? $profileData['profile_photo'] ?? null,
            'cover' => $storeTemplateConfig['cover'] ?? $profileData['cover_photo'] ?? null,
            'description' => $storeTemplateConfig['description'] ?? $account->description ?? '',
            'phone' => $profileData['whatsapp'] ?? $profileData['phone'] ?? '',
            'email' => $account->email ?? '',
            'address' => $profileData['address'] ?? '',
            'currency_symbol' => $storeTemplateConfig['currency_symbol'] ?? 'S/',
            'free_shipping_threshold' => $storeTemplateConfig['free_shipping_threshold'] ?? null,
            'colors' => [
                'primary' => $storeTemplateConfig['primary_color'] ?? $profileData['accent_color'] ?? '#000000',
                'secondary' => $storeTemplateConfig['secondary_color'] ?? '#ffffff',
            ],
            'social_links' => [
                'instagram' => $profileData['instagram'] ?? null,
                'facebook' => $profileData['facebook'] ?? null,
                'tiktok' => $profileData['tiktok'] ?? null,
                'whatsapp' => $profileData['whatsapp'] ?? null,
            ],
            'template' => $account->store_template ?? 'default',
        ];
    }
}
