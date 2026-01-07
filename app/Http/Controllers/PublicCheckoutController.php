<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Order;
use App\Models\Product; // Asegúrate de tener este modelo
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PublicCheckoutController extends Controller
{
    public function store(Request $request, $accountSlug)
    {
        // 1. Validar Cuenta
        $account = Account::where('slug', $accountSlug)->firstOrFail();

        // 2. Validar Datos (Validamos arrays de items y datos del cliente)
        $validated = $request->validate([
            'customer_name'  => 'required|string|max:191',
            'customer_phone' => 'required|string|max:50',
            'items'          => 'required|array|min:1',
            'items.*.id'     => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        try {
            return DB::transaction(function () use ($validated, $account) {
                // 3. Recalcular Total (Seguridad: Usar precios de la BD, no del frontend)
                $total = 0;
                $orderItems = [];

                foreach ($validated['items'] as $itemData) {
                    // Buscar producto asegurando que pertenezca a esta cuenta
                    $product = Product::where('account_id', $account->id)
                                      ->where('id', $itemData['id'])
                                      ->firstOrFail();

                    $subtotal = $product->price * $itemData['quantity'];
                    $total += $subtotal;

                    $orderItems[] = [
                        'product_id'    => $product->id,
                        'product_name'  => $product->name, // Guardamos nombre histórico
                        'product_price' => $product->price,
                        'quantity'      => $itemData['quantity'],
                        'subtotal'      => $subtotal,
                    ];
                }

                // 4. Crear la Orden
                $order = Order::create([
                    'account_id'      => $account->id,
                    'order_number'    => 'ORD-' . strtoupper(Str::random(8)),
                    'customer_name'   => $validated['customer_name'],
                    'customer_phone'  => $validated['customer_phone'],
                    'delivery_address' => 'A coordinar por WhatsApp', 
                    'total'           => $total,
                    'subtotal'        => $total,
                    'delivery_fee'    => 0,
                    'status'          => 'pending',
                    'payment_status'  => 'pending',
                    'payment_method'  => 'whatsapp',
                ]);

                // 5. Insertar Items (Usando la relación definida en tu modelo Order)
                $order->items()->createMany($orderItems);

                return response()->json([
                    'success' => true,
                    'order_number' => $order->order_number
                ]);
            });

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error procesando pedido: ' . $e->getMessage()], 500);
        }
    }
}