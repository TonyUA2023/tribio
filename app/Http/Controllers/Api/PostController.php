<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostComment;
use App\Models\PostLike;
use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class PostController extends Controller
{
    /**
     * Obtener posts de una cuenta (negocio)
     */
    public function index(Request $request, $accountSlug)
    {
        $account = Account::where('slug', $accountSlug)->firstOrFail();

        $posts = Post::where('account_id', $account->id)
            ->published()
            ->with(['account', 'comments' => function ($query) {
                $query->approved()->topLevel()->pinnedFirst()->latest()->limit(3);
            }])
            ->latest()
            ->paginate(10);

        // Verificar si el usuario actual ya dio like a cada post
        $userIdentifier = $request->ip();
        foreach ($posts as $post) {
            $post->has_liked = PostLike::hasLiked($post->id, $userIdentifier);
        }

        return response()->json([
            'success' => true,
            'data' => $posts,
        ]);
    }

    /**
     * Obtener posts del usuario autenticado
     */
/**
     * Obtener posts del usuario autenticado (CORREGIDO)
     */
    public function myPosts(Request $request)
    {
        $user = $request->user();

        // 1. Búsqueda segura de la cuenta (Evita error si la relación falla)
        $account = Account::where('user_id', $user->id)->first();

        if (!$account) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes una cuenta asociada.',
                'data' => [] // Devolver array vacío para que el front no explote
            ], 403); // O 200 si prefieres que solo muestre vacío
        }

        // 2. Obtener posts paginados
        $posts = Post::where('account_id', $account->id)
            ->with(['comments']) // Cargar comentarios si los usas
            ->latest() // Ordenar por más reciente
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
            'data' => $posts,
        ]);
    }
    /**
     * Obtener un post específico
     */
    public function show(Request $request, Post $post)
    {
        $post->load(['account', 'comments' => function ($query) {
            $query->approved()->topLevel()->pinnedFirst()->oldest()->with(['replies' => function ($q) {
                $q->approved()->oldest();
            }]);
        }]);

        // Verificar si el usuario actual ya dio like
        $userIdentifier = $request->ip();
        $post->has_liked = PostLike::hasLiked($post->id, $userIdentifier);

        // Incrementar vistas
        $post->incrementViews();

        return response()->json([
            'success' => true,
            'data' => $post,
        ]);
    }

    /**
     * Crear nueva publicación
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user->account) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes una cuenta comercial asociada.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:2000',
            'type' => 'required|in:image,video,carousel',
            'media' => 'required|array|min:1',
            'media.*' => 'file|mimes:jpeg,jpg,png,gif,webp,mp4,mov,avi|max:51200', // 50MB
            'thumbnail' => 'nullable|file|mimes:jpeg,jpg,png,webp|max:5120', // 5MB para thumbnail
            'comments_enabled' => 'boolean',
            'is_published' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $mediaPaths = [];
            $thumbnailPath = null;
            $duration = null;

            // Procesar archivos de media
            foreach ($request->file('media') as $file) {
                $mimeType = $file->getMimeType();
                $isVideo = str_contains($mimeType, 'video');

                if ($isVideo) {
                    // Guardar video
                    $path = $file->store("posts/{$user->account->id}/videos", 'public');
                    $mediaPaths[] = $path;

                    // TODO: Obtener duración del video si es necesario
                } else {
                    // Optimizar y guardar imagen
                    try {
                        $manager = new ImageManager(new Driver());
                        $image = $manager->read($file);

                        if ($image->width() > 1080) {
                            $image->scale(width: 1080);
                        }

                        $fileName = uniqid('post_') . '.webp';
                        $path = "posts/{$user->account->id}/images/{$fileName}";

                        Storage::disk('public')->makeDirectory("posts/{$user->account->id}/images");
                        Storage::disk('public')->put($path, $image->toWebp(85));

                        $mediaPaths[] = $path;
                    } catch (\Exception $e) {
                        Log::error("Error optimizando imagen post: " . $e->getMessage());
                        $path = $file->store("posts/{$user->account->id}/images", 'public');
                        $mediaPaths[] = $path;
                    }
                }
            }

            // Procesar thumbnail si existe
            if ($request->hasFile('thumbnail')) {
                $thumbnailFile = $request->file('thumbnail');
                try {
                    $manager = new ImageManager(new Driver());
                    $image = $manager->read($thumbnailFile);

                    if ($image->width() > 640) {
                        $image->scale(width: 640);
                    }

                    $fileName = uniqid('thumb_') . '.webp';
                    $thumbnailPath = "posts/{$user->account->id}/thumbnails/{$fileName}";

                    Storage::disk('public')->makeDirectory("posts/{$user->account->id}/thumbnails");
                    Storage::disk('public')->put($thumbnailPath, $image->toWebp(80));
                } catch (\Exception $e) {
                    Log::error("Error optimizando thumbnail: " . $e->getMessage());
                    $thumbnailPath = $thumbnailFile->store("posts/{$user->account->id}/thumbnails", 'public');
                }
            }

            // Crear post
            $post = Post::create([
                'account_id' => $user->account->id,
                'title' => $request->title,
                'description' => $request->description,
                'type' => $request->type,
                'media' => $mediaPaths,
                'thumbnail_url' => $thumbnailPath,
                'duration' => $duration,
                'comments_enabled' => $request->comments_enabled ?? true,
                'is_published' => $request->is_published ?? true,
                'published_at' => $request->is_published ?? true ? now() : null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Publicación creada exitosamente',
                'data' => $post,
            ]);
        } catch (\Exception $e) {
            Log::error('Error creando post: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error interno al crear publicación',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Actualizar publicación
     */
    public function update(Request $request, Post $post)
    {
        $user = $request->user();

        if (!$user->account || $post->account_id !== $user->account->id) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para editar esta publicación.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:2000',
            'comments_enabled' => 'boolean',
            'is_published' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos',
                'errors' => $validator->errors(),
            ], 422);
        }

        $post->update($request->only(['title', 'description', 'comments_enabled', 'is_published']));

        return response()->json([
            'success' => true,
            'message' => 'Publicación actualizada exitosamente',
            'data' => $post,
        ]);
    }

    /**
     * Eliminar publicación
     */
    public function destroy(Request $request, Post $post)
    {
        $user = $request->user();

        if (!$user->account || $post->account_id !== $user->account->id) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para eliminar esta publicación.',
            ], 403);
        }

        // Eliminar archivos de media
        if (!empty($post->media)) {
            foreach ($post->media as $mediaPath) {
                Storage::disk('public')->delete($mediaPath);
            }
        }

        if ($post->thumbnail_url) {
            Storage::disk('public')->delete($post->thumbnail_url);
        }

        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Publicación eliminada exitosamente',
        ]);
    }

    /**
     * Toggle like en un post
     */
    public function toggleLike(Request $request, Post $post)
    {
        $userIdentifier = $request->ip();
        $userName = $request->input('user_name');

        $result = PostLike::toggle($post->id, $userIdentifier, $userName);

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    /**
     * Incrementar contador de compartidos
     */
    public function share(Post $post)
    {
        $post->incrementShares();

        return response()->json([
            'success' => true,
            'shares_count' => $post->shares_count,
        ]);
    }

    /**
     * Obtener comentarios de un post
     */
    public function getComments(Post $post)
    {
        $comments = PostComment::where('post_id', $post->id)
            ->approved()
            ->topLevel()
            ->pinnedFirst()
            ->oldest()
            ->with(['replies' => function ($query) {
                $query->approved()->oldest();
            }])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $comments,
        ]);
    }

    /**
     * Crear comentario en un post
     */
    public function addComment(Request $request, Post $post)
    {
        if (!$post->comments_enabled) {
            return response()->json([
                'success' => false,
                'message' => 'Los comentarios están deshabilitados en esta publicación.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'user_name' => 'required|string|max:100',
            'user_email' => 'nullable|email|max:255',
            'comment' => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:post_comments,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos',
                'errors' => $validator->errors(),
            ], 422);
        }

        $comment = PostComment::create([
            'post_id' => $post->id,
            'parent_id' => $request->parent_id,
            'user_name' => $request->user_name,
            'user_email' => $request->user_email,
            'comment' => $request->comment,
        ]);

        // Incrementar contador de comentarios del post
        $post->incrementComments();

        $comment->load('replies');

        return response()->json([
            'success' => true,
            'message' => 'Comentario agregado exitosamente',
            'data' => $comment,
        ]);
    }

    /**
     * Eliminar comentario (solo owner del post puede eliminar)
     */
    public function deleteComment(Request $request, PostComment $comment)
    {
        $user = $request->user();
        $post = $comment->post;

        if (!$user->account || $post->account_id !== $user->account->id) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para eliminar este comentario.',
            ], 403);
        }

        $comment->delete();

        // Decrementar contador de comentarios del post
        $post->decrementComments();

        return response()->json([
            'success' => true,
            'message' => 'Comentario eliminado exitosamente',
        ]);
    }

    /**
     * Moderar comentario (aprobar/rechazar)
     */
    public function moderateComment(Request $request, PostComment $comment)
    {
        $user = $request->user();
        $post = $comment->post;

        if (!$user->account || $post->account_id !== $user->account->id) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permisos para moderar este comentario.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'action' => 'required|in:approve,reject,pin,unpin',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos',
                'errors' => $validator->errors(),
            ], 422);
        }

        switch ($request->action) {
            case 'approve':
                $comment->approve();
                break;
            case 'reject':
                $comment->reject();
                break;
            case 'pin':
                $comment->pin();
                break;
            case 'unpin':
                $comment->unpin();
                break;
        }

        return response()->json([
            'success' => true,
            'message' => 'Comentario moderado exitosamente',
            'data' => $comment->fresh(),
        ]);
    }
}
