<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{
    /**
     * Listar productos de una cuenta específica.
     * GET /api/accounts/{accountId}/products
     */
    public function index($accountId)
    {
        // 1. Validar que la cuenta pertenezca al usuario autenticado
        $account = Account::where('id', $accountId)
            ->where('user_id', auth()->id())
            ->first();

        if (!$account) {
            return response()->json(['success' => false, 'message' => 'Cuenta no encontrada o acceso denegado.'], 403);
        }

        // 2. Obtener productos ordenados
        $products = Product::where('account_id', $accountId)
            ->orderBy('sort_order', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();

        // 3. Procesar URLs de imágenes para el frontend
        $products->transform(function ($product) {
            if ($product->image) {
                $product->image_url = url('storage/' . $product->image);
            } else {
                $product->image_url = null;
            }
            return $product;
        });

        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }

    /**
     * Crear un nuevo producto.
     * POST /api/accounts/{accountId}/products
     */
    public function store(Request $request, $accountId)
    {
        // 1. Validar propiedad de la cuenta
        $account = Account::where('id', $accountId)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        // 2. Validar datos
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|image|max:2048', // Max 2MB
            'category' => 'nullable|string|max:100',
        ]);

        try {
            $data = $request->all();
            $data['account_id'] = $accountId;

            // 3. Manejar la subida de imagen
            if ($request->hasFile('image')) {
                // Guardar en storage/app/public/products/{accountId}
                $path = $request->file('image')->store("products/{$accountId}", 'public');
                $data['image'] = $path;
            }

            // 4. Procesar campos que vienen como String desde React Native FormData
            // 'available' y 'featured' suelen llegar como "true"/"false" o "1"/"0"
            if (isset($data['available'])) {
                $data['available'] = filter_var($data['available'], FILTER_VALIDATE_BOOLEAN);
            }
            if (isset($data['featured'])) {
                $data['featured'] = filter_var($data['featured'], FILTER_VALIDATE_BOOLEAN);
            }
            
            // 'options' llega como string JSON desde la App: '[{"name":"Talla","values":["S","M"]}]'
            if (isset($data['options']) && is_string($data['options'])) {
                $data['options'] = json_decode($data['options'], true);
            }

            // 5. Crear producto
            $product = Product::create($data);

            // Devolver URL completa
            if ($product->image) {
                $product->image_url = url('storage/' . $product->image);
            }

            return response()->json([
                'success' => true,
                'message' => 'Producto creado correctamente.',
                'data' => $product
            ], 201);

        } catch (\Exception $e) {
            Log::error("Error creando producto: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error al guardar el producto.'], 500);
        }
    }

    /**
     * Actualizar un producto existente.
     * POST /api/products/{id} (Usando POST para soportar FormData con imágenes)
     */
    public function update(Request $request, $id)
    {
        // 1. Buscar producto y verificar permisos
        $product = Product::findOrFail($id);

        // Verificar que la cuenta del producto pertenece al usuario actual
        if ($product->account->user_id !== auth()->id()) {
            return response()->json(['success' => false, 'message' => 'No autorizado.'], 403);
        }

        // 2. Validar
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'price' => 'sometimes|numeric|min:0',
            'image' => 'nullable|image|max:2048',
        ]);

        try {
            $data = $request->all();

            // 3. Manejar Imagen (Reemplazo)
            if ($request->hasFile('image')) {
                // Eliminar imagen anterior si existe
                if ($product->image && Storage::disk('public')->exists($product->image)) {
                    Storage::disk('public')->delete($product->image);
                }
                
                // Subir nueva
                $path = $request->file('image')->store("products/{$product->account_id}", 'public');
                $data['image'] = $path;
            }

            // 4. Procesar booleanos y JSON (Fix para FormData)
            if (isset($data['available'])) {
                $data['available'] = filter_var($data['available'], FILTER_VALIDATE_BOOLEAN);
            }
            if (isset($data['featured'])) {
                $data['featured'] = filter_var($data['featured'], FILTER_VALIDATE_BOOLEAN);
            }
            if (isset($data['options']) && is_string($data['options'])) {
                $decoded = json_decode($data['options'], true);
                // Solo asignar si es un JSON válido, sino usar el valor original o null
                $data['options'] = json_last_error() === JSON_ERROR_NONE ? $decoded : null;
            }

            // 5. Actualizar
            $product->update($data);

            // Refrescar URL
            if ($product->image) {
                $product->image_url = url('storage/' . $product->image);
            } else {
                $product->image_url = null;
            }

            return response()->json([
                'success' => true,
                'message' => 'Producto actualizado.',
                'data' => $product
            ]);

        } catch (\Exception $e) {
            Log::error("Error actualizando producto: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error al actualizar.'], 500);
        }
    }

    /**
     * Eliminar (Soft Delete) un producto.
     * DELETE /api/products/{id}
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        if ($product->account->user_id !== auth()->id()) {
            return response()->json(['success' => false, 'message' => 'No autorizado.'], 403);
        }

        // Opcional: Eliminar la imagen física si se desea borrar permanentemente, 
        // pero como usamos SoftDeletes en el modelo, mejor mantenemos la imagen por si se restaura.
        
        $product->delete();

        return response()->json([
            'success' => true, 
            'message' => 'Producto eliminado correctamente.'
        ]);
    }

    /**
     * Alternar disponibilidad rápida (Switch ON/OFF).
     * POST /api/products/{id}/toggle-availability
     */
    public function toggleAvailability($id)
    {
        $product = Product::findOrFail($id);

        if ($product->account->user_id !== auth()->id()) {
            return response()->json(['success' => false, 'message' => 'No autorizado.'], 403);
        }

        // Invertir valor
        $product->available = !$product->available;
        $product->save();

        return response()->json([
            'success' => true,
            'data' => $product,
            'message' => $product->available ? 'Producto disponible.' : 'Producto no disponible.'
        ]);
    }
}