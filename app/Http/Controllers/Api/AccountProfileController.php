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
    // =========================================================================
    // 1. MOSTRAR PERFIL (Carga de datos completa)
    // =========================================================================
    public function show(Request $request)
    {
        $user = $request->user();
        
        // Cargar cuenta con sus relaciones necesarias:
        // - profiles: para sacar el notification_email
        // - activeModules: para listar los módulos activos
        $account = Account::with(['profiles', 'activeModules'])
                    ->where('user_id', $user->id)
                    ->first();

        if (!$account) {
            return response()->json(['message' => 'Cuenta no encontrada'], 404);
        }

        // Obtener el perfil principal (asumimos el primero)
        $profile = $account->profiles->first();

        // Imágenes
        $logo = ProfileMedia::where('account_id', $account->id)->where('type', 'profile_logo')->first();
        $cover = ProfileMedia::where('account_id', $account->id)->where('type', 'cover_photo')->first();

        // Formatear Módulos para el Frontend
        $modules = $account->activeModules->map(function($module) {
            return [
                'slug' => $module->module_slug,
                'is_active' => $module->is_active,
                // Puedes agregar nombres amigables aquí o en el frontend
                'installed_at' => $module->installed_at
            ];
        });

        return response()->json([
            'id'             => $account->id,
            'business_name'  => $account->name,
            'slug'           => $account->slug,
            'category'       => $account->businessCategory?->name ?? 'General',
            'description'    => $account->description,
            
            'logo_url'       => $logo ? $logo->url : $account->logo_url,
            'cover_url'      => $cover ? $cover->url : $account->cover_url,
            
            'phone'          => $account->phone, 
            'address'        => $account->address, 
            
            // ✅ NUEVO: Email de notificaciones (Desde la tabla PROFILES)
            'notification_email' => $profile ? $profile->notification_email : null,

            // ✅ NUEVO: Módulos Activos (Desde la tabla ACCOUNT_MODULES)
            'active_modules' => $modules,

            'social_links'   => [
                'whatsapp'  => $account->whatsapp,
                'instagram' => $account->instagram,
                'tiktok'    => $account->tiktok,
                'facebook'  => $account->facebook,
            ],

            'rating_average' => 5.0,
            'rating_count'   => 10,
            'is_active'      => true,
        ]);
    }

    // =========================================================================
    // 2. ACTUALIZAR PERFIL
    // =========================================================================
    public function update(Request $request)
    {
        $user = $request->user();
        
        // Eager load profiles para poder editarlo
        $account = Account::with('profiles')->where('user_id', $user->id)->firstOrFail();

        // 1. Validar
        $validator = Validator::make($request->all(), [
            'name'               => 'nullable|string|max:255',
            'description'        => 'nullable|string',
            'phone'              => 'nullable|string|max:50',
            'address'            => 'nullable|string|max:255',
            'social_links'       => 'nullable',
            // Validamos el email de notificaciones
            'notification_email' => 'nullable|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // 2. Actualizar campos de ACCOUNT
        if ($request->has('name')) $account->name = $request->name;
        if ($request->has('description')) $account->description = $request->description;
        if ($request->has('phone')) $account->phone = $request->phone;
        if ($request->has('address')) $account->address = $request->address;

        // 3. Actualizar campos de PROFILE (notification_email)
        if ($request->has('notification_email')) {
            $profile = $account->profiles->first();
            if ($profile) {
                $profile->notification_email = $request->notification_email;
                $profile->save();
            }
        }

        // 4. Actualizar REDES SOCIALES
        if ($request->has('social_links')) {
            $social = $request->input('social_links');
            if (is_string($social)) $social = json_decode($social, true);

            if (is_array($social)) {
                if (array_key_exists('whatsapp', $social))  $account->whatsapp  = $social['whatsapp'];
                if (array_key_exists('instagram', $social)) $account->instagram = $social['instagram'];
                if (array_key_exists('tiktok', $social))    $account->tiktok    = $social['tiktok'];
                if (array_key_exists('facebook', $social))  $account->facebook  = $social['facebook'];
            }
        }

        $account->save();

        return $this->show($request);
    }

    // --- MÉTODOS DE UPLOAD SIN CAMBIOS ---
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

        ProfileMedia::where('account_id', $account->id)->where('type', $type)->each(function ($media) {
            if (Storage::disk('public')->exists($media->file_path)) Storage::disk('public')->delete($media->file_path);
            $media->delete();
        });

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
        
        if ($type === 'profile_logo') $account->logo_url = $media->url;
        if ($type === 'cover_photo') $account->cover_url = $media->url;
        $account->save();

        return response()->json(['success' => true, 'url' => $media->url]);
    }
}