<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

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
            $product->image_url = $product->image ? url('storage/' . $product->image) : null;
            
            // Asegurar que los tipos de datos sean correctos para JS
            $product->price = (float) $product->price;
            $product->available = (bool) $product->available;
            
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
            ->first();

        if (!$account) {
            return response()->json(['success' => false, 'message' => 'No autorizado.'], 403);
        }

        // 2. Validar datos básicos
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|image|max:5120', // Max 5MB
            'category' => 'nullable|string|max:100',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            // Empezamos con todos los datos del request
            $data = $request->all();
            $data['account_id'] = $accountId;

            // 3. FIX: Convertir "true"/"false" (strings de FormData) a booleanos reales
            if (isset($data['available'])) {
                $data['available'] = filter_var($data['available'], FILTER_VALIDATE_BOOLEAN);
            } else {
                $data['available'] = true; // Por defecto disponible
            }

            if (isset($data['featured'])) {
                $data['featured'] = filter_var($data['featured'], FILTER_VALIDATE_BOOLEAN);
            }

            // 4. FIX: Convertir JSON string a Array (para 'options', 'ingredients', etc)
            if (isset($data['options']) && is_string($data['options'])) {
                $decoded = json_decode($data['options'], true);
                $data['options'] = json_last_error() === JSON_ERROR_NONE ? $decoded : [];
            }

            // 5. Manejar subida de imagen
            if ($request->hasFile('image')) {
                // Guardar en: storage/app/public/products/{accountId}/filename.jpg
                $path = $request->file('image')->store("products/{$accountId}", 'public');
                $data['image'] = $path;
            }

            // 6. Crear en Base de Datos
            $product = Product::create($data);

            // Generar URL completa para la respuesta inmediata
            $product->image_url = $product->image ? url('storage/' . $product->image) : null;

            return response()->json([
                'success' => true,
                'message' => 'Producto creado correctamente.',
                'data' => $product
            ], 201);

        } catch (\Exception $e) {
            Log::error("Error creando producto: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error interno al guardar: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Actualizar un producto existente.
     * POST /api/products/{id} (Usando POST para soportar FormData)
     */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        // 1. Verificar Autorización
        if ($product->account->user_id !== auth()->id()) {
            return response()->json(['success' => false, 'message' => 'No autorizado.'], 403);
        }

        // 2. Validar
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'price' => 'sometimes|numeric|min:0',
            'image' => 'nullable|image|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $data = $request->all();

            // 3. Procesar Booleanos y JSON (Igual que en store)
            if (isset($data['available'])) {
                $data['available'] = filter_var($data['available'], FILTER_VALIDATE_BOOLEAN);
            }
            
            if (isset($data['featured'])) {
                $data['featured'] = filter_var($data['featured'], FILTER_VALIDATE_BOOLEAN);
            }

            if (isset($data['options']) && is_string($data['options'])) {
                $decoded = json_decode($data['options'], true);
                $data['options'] = json_last_error() === JSON_ERROR_NONE ? $decoded : null;
            }

            // 4. Manejar Imagen (Reemplazo)
            if ($request->hasFile('image')) {
                // Borrar anterior si existe
                if ($product->image && Storage::disk('public')->exists($product->image)) {
                    Storage::disk('public')->delete($product->image);
                }
                
                // Subir nueva
                $path = $request->file('image')->store("products/{$product->account_id}", 'public');
                $data['image'] = $path;
            }

            // 5. Actualizar
            $product->update($data);

            // Refrescar URL
            $product->image_url = $product->image ? url('storage/' . $product->image) : null;

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

        $product->delete();

        return response()->json([
            'success' => true, 
            'message' => 'Producto eliminado correctamente.'
        ]);
    }

    /**
     * Alternar disponibilidad rápida.
     * POST /api/products/{id}/toggle-availability
     */
    public function toggleAvailability($id)
    {
        $product = Product::findOrFail($id);

        if ($product->account->user_id !== auth()->id()) {
            return response()->json(['success' => false, 'message' => 'No autorizado.'], 403);
        }

        $product->available = !$product->available;
        $product->save();

        return response()->json([
            'success' => true,
            'data' => $product,
            'message' => $product->available ? 'Producto disponible.' : 'Producto no disponible.'
        ]);
    }
}