<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Story;
use App\Models\Profile;
use App\Models\StoryView;
use App\Exceptions\Custom\ProfileNotFoundException;
use App\Exceptions\Custom\UnauthorizedException;
use App\Exceptions\Custom\ValidationException;
use App\Exceptions\Custom\MediaUploadException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class StoryController extends Controller
{
    /**
     * Obtener stories activas de un perfil
     */
    public function index(Profile $profile)
    {
        $stories = Story::forProfile($profile->id)
            ->active()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $stories,
            'has_stories' => $stories->isNotEmpty(),
        ]);
    }

    /**
     * Listar todas las stories del usuario autenticado
     */
    public function myStories(Request $request)
    {
        $user = $request->user();

        if (!$user->account) {
            throw new UnauthorizedException('No tienes una cuenta asociada.');
        }

        $stories = Story::forAccount($user->account->id)
            ->with(['profile'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $stories,
        ]);
    }

    /**
     * Crear nueva story
     */
public function store(Request $request)
    {
        // 1. OBTENER AUTOMÁTICAMENTE EL PERFIL Y CUENTA
        $user = $request->user();
        $account = Account::where('user_id', $user->id)->first();

        if (!$account) {
            return response()->json(['message' => 'No tienes una cuenta comercial asociada.'], 403);
        }

        $profile = Profile::where('account_id', $account->id)->first();

        if (!$profile) {
            return response()->json(['message' => 'No tienes un perfil configurado.'], 403);
        }

        // 2. VALIDAR (Quitamos profile_id de required porque lo calculamos arriba)
        $validator = Validator::make($request->all(), [
            'media' => 'required|file|mimes:jpeg,jpg,png,gif,webp,mp4,mov,avi|max:51200', // 50MB
            'caption' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Datos inválidos', 'errors' => $validator->errors()], 422);
        }

        try {
            $file = $request->file('media');
            $mimeType = $file->getMimeType();
            $mediaType = str_contains($mimeType, 'video') ? 'video' : 'image';
            $path = '';

            // 3. PROCESAR IMAGEN/VIDEO
            if ($mediaType === 'image') {
                try {
                    $manager = new ImageManager(new Driver());
                    $image = $manager->read($file);
                    
                    // Optimizar tamaño
                    if ($image->width() > 1080) {
                        $image->scale(width: 1080);
                    }

                    $fileName = uniqid('story_') . '.webp';
                    $path = "stories/{$account->id}/{$fileName}";
                    
                    // Asegurar que el directorio existe
                    Storage::disk('public')->makeDirectory("stories/{$account->id}");
                    Storage::disk('public')->put($path, $image->toWebp(80)); // Calidad 80
                    
                } catch (\Exception $e) {
                    // Fallback si falla la optimización
                    Log::error("Error optimizando imagen story: " . $e->getMessage());
                    $path = $file->store("stories/{$account->id}", 'public');
                }
            } else {
                // Video
                $path = $file->store("stories/{$account->id}", 'public');
            }

            // 4. CREAR REGISTRO
            $story = Story::create([
                'profile_id' => $profile->id,   // Usamos el ID detectado automáticamente
                'account_id' => $account->id,
                'media_type' => $mediaType,
                'media_path' => $path,
                'caption' => $request->caption ?? '', // Descripción opcional
                'background_color' => '#000000',
                'is_active' => true
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Historia publicada',
                'data' => $story
            ]);

        } catch (\Exception $e) {
            Log::error('Error subiendo story: ' . $e->getMessage());
            return response()->json(['message' => 'Error interno al subir historia', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Eliminar story
     */
    public function destroy(Request $request, Story $story)
    {
        $user = $request->user();

        // Verificar ownership
        if (!$user->account || $story->account_id !== $user->account->id) {
            throw new UnauthorizedException('No tienes permisos para eliminar esta historia.');
        }

        $story->delete();

        return response()->json([
            'success' => true,
            'message' => 'Historia eliminada exitosamente.',
        ]);
    }

    /**
     * Registrar visualización de story
     */
    public function recordView(Request $request, Story $story)
    {
        try {
            StoryView::updateOrCreate(
                [
                    'story_id' => $story->id,
                    'viewer_ip' => $request->ip(),
                ],
                [
                    'user_agent' => $request->userAgent(),
                    'viewed_at' => now(),
                ]
            );

            $story->incrementViews();

            return response()->json([
                'success' => true,
                'views_count' => $story->views_count,
            ]);
        } catch (\Exception $e) {
            Log::warning('Error al registrar view de story', [
                'story_id' => $story->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json(['success' => false], 500);
        }
    }

    /**
     * Obtener analíticas de una story
     */
    public function analytics(Request $request, Story $story)
    {
        $user = $request->user();

        // Verificar ownership
        if (!$user->account || $story->account_id !== $user->account->id) {
            throw new UnauthorizedException();
        }

        $views = StoryView::where('story_id', $story->id)
            ->orderBy('viewed_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_views' => $story->views_count,
                'unique_viewers' => $views->count(),
                'time_remaining' => $story->time_remaining,
                'is_expired' => $story->is_expired,
                'views' => $views,
            ],
        ]);
    }
}
