<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProfileMedia;
use App\Models\Account;
use Illuminate\Support\Facades\Storage;

class GalleryController extends Controller
{
    /**
     * Obtener todas las imágenes de la galería
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // 1. Obtener la cuenta (Igual que en PageSettingsController)
        $account = Account::where('user_id', $user->id)->first();

        if (!$account) {
            return response()->json([]); // Retornar array vacío si no hay cuenta
        }
        
        // 2. Usar el Scope 'gallery()' y filtrar por account_id
        // Esto asegura que traemos lo mismo que el panel web
        $media = ProfileMedia::where('account_id', $account->id)
                             ->gallery() // <--- ESTO ES CLAVE (filtra type='gallery')
                             ->orderBy('order', 'asc')
                             ->orderBy('created_at', 'desc')
                             ->get()
                             ->map(function($item) {
                                 return [
                                     'id' => $item->id,
                                     'media_url' => $item->url, // Usamos el accessor 'url' del modelo
                                     'media_type' => $item->media_type, // 'image' o 'video'
                                     'caption' => $item->caption,
                                     'file_size' => $item->formatted_size
                                 ];
                             });

        return response()->json($media);
    }

    /**
     * Subir nueva imagen/video
     */
    public function store(Request $request)
    {
        $request->validate([
            'media' => 'required|file|mimes:jpg,jpeg,png,mp4,mov|max:20480', // Max 20MB
        ]);

        $user = $request->user();
        $account = Account::where('user_id', $user->id)->first();

        if (!$account) {
            return response()->json(['message' => 'Cuenta no encontrada'], 400);
        }
        
        if ($request->hasFile('media')) {
            $file = $request->file('media');
            
            // 1. Preparar nombres (Lógica de PageSettingsController)
            $fileName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = $file->getClientOriginalExtension();
            $newFileName = $fileName . '_' . time() . '.' . $extension;
            
            // 2. Determinar tipo
            $mimeType = $file->getMimeType();
            $mediaType = str_contains($mimeType, 'video') ? 'video' : 'image';
            
            // 3. Guardar en la carpeta correcta: media/{accountId}/gallery
            $path = 'media/' . $account->id . '/gallery/' . $newFileName;
            
            Storage::disk('public')->putFileAs(
                'media/' . $account->id . '/gallery',
                $file,
                $newFileName
            );

            // 4. Obtener último orden
            $lastOrder = ProfileMedia::where('account_id', $account->id)
                ->where('type', 'gallery')
                ->max('order') ?? 0;

            // 5. Crear registro en BD
            $media = ProfileMedia::create([
                'account_id' => $account->id,
                // Si el perfil existe, lo vinculamos, si no, lo dejamos null (la cuenta es lo importante)
                'profile_id' => $account->profiles()->first()?->id, 
                'type' => 'gallery', // <--- IMPORTANTE: Debe coincidir con el scope
                'media_type' => $mediaType,
                'file_path' => $path,
                'file_name' => $newFileName,
                'mime_type' => $mimeType,
                'file_size' => $file->getSize(),
                'order' => $lastOrder + 1,
                'caption' => ''
            ]);

            return response()->json([
                'id' => $media->id,
                'media_url' => $media->url,
                'media_type' => $media->media_type,
                'caption' => $media->caption
            ]);
        }

        return response()->json(['message' => 'No se recibió archivo'], 400);
    }

    /**
     * Eliminar archivo
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $account = Account::where('user_id', $user->id)->first();

        // Buscar asegurando que pertenezca a la cuenta del usuario
        $media = ProfileMedia::where('id', $id)
                             ->where('account_id', $account->id)
                             ->firstOrFail();

        // Borrar archivo físico
        if (Storage::disk('public')->exists($media->file_path)) {
            Storage::disk('public')->delete($media->file_path);
        }

        $media->delete();

        return response()->json(['success' => true, 'message' => 'Eliminado']);
    }
    
    /**
     * Reordenar (Opcional, útil para Drag&Drop futuro)
     */
    public function reorder(Request $request)
    {
        $user = $request->user();
        $account = Account::where('user_id', $user->id)->first();
        
        $request->validate(['order' => 'required|array']);

        foreach ($request->order as $index => $id) {
            ProfileMedia::where('id', $id)
                ->where('account_id', $account->id)
                ->update(['order' => $index]);
        }

        return response()->json(['success' => true]);
    }
}