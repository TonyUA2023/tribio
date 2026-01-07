<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Account;
use App\Models\ProfileMedia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class AccountProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();
        
        // Buscar cuenta
        $account = Account::where('user_id', $user->id)->first();

        if (!$account) {
            return response()->json(['message' => 'Cuenta no encontrada'], 404);
        }

        // Buscar imágenes
        $logo = ProfileMedia::where('account_id', $account->id)->where('type', 'profile_logo')->first();
        $cover = ProfileMedia::where('account_id', $account->id)->where('type', 'cover_photo')->first();

        return response()->json([
            'id' => $account->id,
            'business_name' => $account->name,
            'slug' => $account->slug,
            'category' => $account->businessCategory?->name ?? 'General',
            'logo_url' => $logo ? $logo->url : null,
            'cover_url' => $cover ? $cover->url : null,
            'phone' => '999 999 999', 
            'address' => 'Dirección...', 
            'rating_average' => 5.0,
            'rating_count' => 10,
            'is_active' => true,
        ]);
    }

    // ... (El resto de tus métodos uploadLogo y uploadCover que ya tenías están bien)
    
    public function uploadLogo(Request $request) { return $this->handleUpload($request, 'profile_logo'); }
    public function uploadCover(Request $request) { return $this->handleUpload($request, 'cover_photo'); }

    private function handleUpload(Request $request, $type)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
        ]);

        if ($validator->fails()) return response()->json(['errors' => $validator->errors()], 422);

        $user = $request->user();
        $account = Account::where('user_id', $user->id)->first();

        if (!$account) return response()->json(['error' => 'No account'], 404);

        // Limpiar anterior
        ProfileMedia::where('account_id', $account->id)->where('type', $type)->each(function ($media) {
            if (Storage::disk('public')->exists($media->file_path)) Storage::disk('public')->delete($media->file_path);
            $media->delete();
        });

        // Guardar nuevo
        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension();
        $newFileName = uniqid($type . '_') . '.' . $extension;
        $path = "media/{$account->id}/{$type}/{$newFileName}";
        
        Storage::disk('public')->putFileAs("media/{$account->id}/{$type}", $file, $newFileName);

        $media = ProfileMedia::create([
            'account_id' => $account->id,
            'type' => $type,
            'media_type' => 'image',
            'file_path' => $path,
            'file_name' => $newFileName,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'order' => 0,
        ]);

        return response()->json([
            'success' => true,
            'url' => $media->url,
            'message' => 'Subida exitosa'
        ]);
    }
    /**
     * Actualizar perfil (Incluyendo Redes Sociales)
     * ESTE ES EL MÉTODO QUE FALTA
     */
    public function update(Request $request)
    {
        $user = \Illuminate\Support\Facades\Auth::user();
        $account = \App\Models\Account::where('user_id', $user->id)->first();

        if (!$account) {
            return response()->json(['success' => false, 'message' => 'Cuenta no encontrada'], 404);
        }

        // 1. Validar los datos entrantes
        $validator = Validator::make($request->all(), [
            'business_name' => 'sometimes|string|max:255',
            'category'      => 'sometimes|string|max:100',
            'description'   => 'nullable|string',
            'phone'         => 'nullable|string|max:50',
            'address'       => 'nullable|string|max:255',
            'social_links'  => 'nullable|array', // Validamos que llegue como array
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // 2. Actualizar campos básicos
        // Usamos fill para actualizar solo lo que llega, excepto social_links
        $account->fill($request->except(['social_links', 'logo', 'cover']));

        // 3. Actualizar Redes Sociales
        // La App envía: { social_links: { whatsapp: "...", instagram: "..." } }
        if ($request->has('social_links')) {
            $social = $request->input('social_links');
            
            // Asignamos cada red social a su columna en la BD
            if (isset($social['whatsapp']))  $account->whatsapp = $social['whatsapp'];
            if (isset($social['instagram'])) $account->instagram = $social['instagram'];
            if (isset($social['tiktok']))    $account->tiktok = $social['tiktok'];
            if (isset($social['facebook']))  $account->facebook = $social['facebook'];
        }

        // 4. Guardar cambios en la BD
        $account->save();

        return response()->json([
            'success' => true,
            'message' => 'Perfil actualizado correctamente',
            'data' => $account
        ]);
    }
}