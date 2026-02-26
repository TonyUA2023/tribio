<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MyPurchasesController extends Controller
{
    /**
     * Show user's purchases across all Tribio stores.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Get all customer records for this user (across all stores)
        $customers = Customer::where('user_id', $user->id)->get();
        $customerIds = $customers->pluck('id');

        // Get orders for all customer records
        $orders = Order::whereIn('customer_id', $customerIds)
            ->with(['account', 'items.product'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                $profile = $order->account?->profiles()->first();
                $profileData = $profile?->data ?? [];
                $logo = $profileData['profile_logo'] ?? $profileData['logo'] ?? null;

                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                    'total' => (float) $order->total,
                    'created_at' => $order->created_at->toISOString(),
                    'store' => [
                        'id' => $order->account->id,
                        'name' => $order->account->name,
                        'slug' => $order->account->slug,
                        'logo' => $logo,
                    ],
                    'items' => $order->items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'product_name' => $item->product?->name ?? $item->product_name ?? 'Producto',
                            'product_image' => $item->product?->image ?? null,
                            'quantity' => $item->quantity,
                            'price' => (float) $item->price,
                        ];
                    }),
                ];
            });

        // Get bookings for all customer records
        $bookings = collect();
        foreach ($customers as $customer) {
            if (method_exists($customer, 'bookings')) {
                $customerBookings = $customer->bookings()
                    ->with('account')
                    ->orderBy('created_at', 'desc')
                    ->get()
                    ->map(function ($booking) {
                        return [
                            'id' => $booking->id,
                            'service_name' => $booking->service_name ?? $booking->service ?? 'Servicio',
                            'date' => $booking->date ?? $booking->booking_date ?? '',
                            'time' => $booking->time ?? $booking->booking_time ?? '',
                            'status' => $booking->status,
                            'store' => [
                                'id' => $booking->account->id,
                                'name' => $booking->account->name,
                                'slug' => $booking->account->slug,
                            ],
                        ];
                    });
                $bookings = $bookings->merge($customerBookings);
            }
        }

        // Calculate stats
        $stats = [
            'total_orders' => $orders->count(),
            'total_spent' => $orders->sum('total'),
            'pending_orders' => $orders->where('status', 'pending')->count(),
            'total_bookings' => $bookings->count(),
            'stores_shopped' => $orders->pluck('store.id')->unique()->count(),
        ];

        return Inertia::render('Client/MyPurchases', [
            'orders' => $orders->values(),
            'bookings' => $bookings->sortByDesc('created_at')->values(),
            'favorites' => [],
            'stats' => $stats,
        ]);
    }
}
