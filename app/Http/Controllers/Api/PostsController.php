<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

/**
 * Controller para gestión de Posts desde la App Móvil
 * (Owner/Admin crea, edita y elimina sus publicaciones)
 */
class PostsController extends Controller
{
    /**
     * Obtener todas las publicaciones (CORREGIDO CON PAGINACIÓN Y URLs PÚBLICAS)
     * Ruta: GET /account/posts
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // 1. Obtener cuenta de forma segura
        $account = Account::where('user_id', $user->id)->first();

        if (!$account) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes una cuenta comercial.',
                'data' => []
            ], 403);
        }

        // 2. Obtener posts paginados (Importante para el Infinite Scroll de la app)
        $posts = Post::where('account_id', $account->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        // 3. TRANSFORMACIÓN CRÍTICA: Convertir rutas relativas a URLs completas
        $posts->getCollection()->transform(function ($post) {
            // Transformar array de media (fotos/videos)
            if (is_array($post->media)) {
                $post->media = array_map(function ($path) {
                    // Si ya es http, dejarlo, si no, generar URL pública
                    return str_starts_with($path, 'http') 
                        ? $path 
                        : Storage::disk('public')->url($path);
                }, $post->media);
            }

            // Transformar thumbnail
            if ($post->thumbnail_url && !str_starts_with($post->thumbnail_url, 'http')) {
                $post->thumbnail_url = Storage::disk('public')->url($post->thumbnail_url);
            }

            return $post;
        });

        return response()->json([
            'success' => true,
            'data' => $posts
        ]);
    }

    /**
     * Crear nueva publicación
     * Ruta: POST /account/posts
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $account = Account::where('user_id', $user->id)->first();

        if (!$account) {
            return response()->json(['success' => false, 'message' => 'No account'], 403);
        }

        $validator = Validator::make($request->all(), [
            'type' => 'required|in:image,video,carousel',
            'media' => 'required|array|min:1',
            'description' => 'nullable|string',
            'title' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $mediaPaths = [];
            $files = $request->file('media');

            // Asegurar que sea array aunque venga uno solo
            if (!is_array($files)) {
                $files = [$files];
            }

            foreach ($files as $file) {
                // Lógica simplificada de guardado
                $mime = $file->getMimeType();
                $typeFolder = str_contains($mime, 'video') ? 'videos' : 'images';
                $extension = $file->getClientOriginalExtension();
                $fileName = uniqid('post_') . '.' . $extension;
                
                $path = "posts/{$account->id}/{$typeFolder}/{$fileName}";
                
                // Guardar archivo
                Storage::disk('public')->putFileAs(
                    "posts/{$account->id}/{$typeFolder}", 
                    $file, 
                    $fileName
                );
                
                $mediaPaths[] = $path;
            }

            $post = Post::create([
                'account_id' => $account->id,
                'title' => $request->title ?? 'Nueva Publicación',
                'description' => $request->description,
                'type' => $request->type,
                'media' => $mediaPaths,
                'is_published' => true,
                'published_at' => now(),
            ]);

            return response()->json(['success' => true, 'data' => $post], 201);

        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error server'], 500);
        }
    }

    /**
     * Eliminar Post
     * Ruta: DELETE /account/posts/{id}
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $account = Account::where('user_id', $user->id)->first();
        
        $post = Post::where('id', $id)->where('account_id', $account->id)->first();

        if (!$post) return response()->json(['message' => 'Not found'], 404);

        // Borrar archivos
        if ($post->media) {
            foreach ($post->media as $path) {
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }
        }

        $post->delete();
        return response()->json(['success' => true]);
    }
    
    // ... Puedes mantener los otros métodos stats, togglePublish, overview si los usas
    // pero asegúrate de que usen Storage::url() si devuelven imágenes.
}