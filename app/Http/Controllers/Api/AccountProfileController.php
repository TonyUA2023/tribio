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
}