<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Story;
use App\Models\Account;
use App\Models\Profile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class StoriesController extends Controller
{
    /**
     * Obtener todas las stories de la cuenta del usuario
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // 1. Buscamos la cuenta
        $account = Account::where('user_id', $user->id)->first();
        
        if (!$account) {
            return response()->json([]);
        }

        // 2. Traemos las stories de esa cuenta
        $stories = Story::where('account_id', $account->id)
                        ->orderBy('created_at', 'desc')
                        ->get()
                        ->map(function($story) {
                            return [
                                'id' => $story->id,
                                'media_url' => $story->media_url, // Asegúrate de tener este accessor en tu modelo
                                'media_type' => $story->media_type,
                                'caption' => $story->caption,
                                'views' => $story->views_count,
                                'created_at' => $story->created_at,
                                'is_active' => $story->is_active
                            ];
                        });

        return response()->json($stories);
    }

    /**
     * Crear una nueva story (Subida desde la App Móvil)
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // 1. DETECCIÓN AUTOMÁTICA DE CUENTA Y PERFIL
        // Esto evita el error 500 si la app no envía IDs
        $account = Account::where('user_id', $user->id)->first();
        
        if (!$account) {
            return response()->json(['message' => 'No tienes una cuenta comercial.'], 403);
        }

        $profile = Profile::where('account_id', $account->id)->first();

        if (!$profile) {
            // Si no hay perfil, intentamos crear uno o fallamos
            return response()->json(['message' => 'Tu cuenta no tiene un perfil configurado.'], 403);
        }

        // 2. VALIDACIÓN
        $validator = Validator::make($request->all(), [
            'media' => 'required|file|mimes:jpeg,jpg,png,mp4,mov,avi|max:51200', // 50MB Max
            'caption' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Error en validación', 'errors' => $validator->errors()], 422);
        }

        try {
            $file = $request->file('media');
            $mimeType = $file->getMimeType();
            $mediaType = str_contains($mimeType, 'video') ? 'video' : 'image';
            $path = '';

            // 3. PROCESAMIENTO DE IMAGEN/VIDEO
            if ($mediaType === 'image') {
                try {
                    // Intentamos optimizar la imagen con Intervention Image
                    $manager = new ImageManager(new Driver());
                    $image = $manager->read($file);

                    // Redimensionar si es muy grande (ancho máx 1080px para stories)
                    if ($image->width() > 1080) {
                        $image->scale(width: 1080);
                    }

                    // Guardar como WEBP optimizado
                    $fileName = uniqid('story_') . '.webp';
                    $path = "stories/{$account->id}/{$fileName}";
                    
                    Storage::disk('public')->put($path, $image->toWebp(80));

                } catch (\Exception $e) {
                    // Si falla la optimización, guardamos el original
                    Log::warning("Fallo optimización imagen: " . $e->getMessage());
                    $path = $file->store("stories/{$account->id}", 'public');
                }
            } else {
                // Si es video, guardamos directo
                $path = $file->store("stories/{$account->id}", 'public');
            }

            // 4. GUARDAR EN BASE DE DATOS
            $story = Story::create([
                'account_id' => $account->id,
                'profile_id' => $profile->id, // ¡Aquí usamos el ID detectado automáticamente!
                'media_type' => $mediaType,
                'media_path' => $path,
                'caption' => $request->caption ?? '',
                'background_color' => '#000000',
                'is_active' => true,
                // expires_at se llena solo en el boot del Modelo Story, o puedes ponerlo aquí:
                'expires_at' => now()->addHours(24)
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Historia publicada correctamente',
                'data' => $story
            ]);

        } catch (\Exception $e) {
            Log::error("Error subiendo story: " . $e->getMessage());
            return response()->json(['message' => 'Error del servidor al guardar', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Eliminar una story
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $account = Account::where('user_id', $user->id)->first();

        $story = Story::where('id', $id)
                      ->where('account_id', $account->id)
                      ->first();

        if (!$story) {
            return response()->json(['message' => 'Historia no encontrada'], 404);
        }

        // Eliminar archivo físico
        if (Storage::disk('public')->exists($story->media_path)) {
            Storage::disk('public')->delete($story->media_path);
        }

        $story->delete();

        return response()->json(['success' => true, 'message' => 'Historia eliminada']);
    }
}