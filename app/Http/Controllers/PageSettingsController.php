<?php

namespace App\Http\Controllers;

use App\Models\ProfileMedia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PageSettingsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $account = $user->account()->first();

        if (!$account) {
            return redirect()->route('dashboard');
        }

        // Obtener medios de galería
        $galleryMedia = ProfileMedia::where('account_id', $account->id)
            ->gallery()
            ->get()
            ->map(function ($media) {
                return [
                    'id' => $media->id,
                    'type' => $media->media_type,
                    'url' => $media->url,
                    'file_name' => $media->file_name,
                    'file_size' => $media->formatted_size,
                    'caption' => $media->caption,
                    'order' => $media->order,
                ];
            });

        // Obtener logo de pantalla de carga
        $loadingScreenMedia = ProfileMedia::where('account_id', $account->id)
            ->loadingScreen()
            ->first();

        $loadingScreen = $loadingScreenMedia ? [
            'id' => $loadingScreenMedia->id,
            'type' => $loadingScreenMedia->media_type,
            'url' => $loadingScreenMedia->url,
            'file_name' => $loadingScreenMedia->file_name,
        ] : null;

        // Obtener logo de la página (el círculo con ML BARBER)
        $profileLogoMedia = ProfileMedia::where('account_id', $account->id)
            ->where('type', 'profile_logo')
            ->first();

        $profileLogo = $profileLogoMedia ? [
            'id' => $profileLogoMedia->id,
            'type' => $profileLogoMedia->media_type,
            'url' => $profileLogoMedia->url,
            'file_name' => $profileLogoMedia->file_name,
        ] : null;

        // Obtener foto de portada/header
        $coverPhotoMedia = ProfileMedia::where('account_id', $account->id)
            ->where('type', 'cover_photo')
            ->first();

        $coverPhoto = $coverPhotoMedia ? [
            'id' => $coverPhotoMedia->id,
            'type' => $coverPhotoMedia->media_type,
            'url' => $coverPhotoMedia->url,
            'file_name' => $coverPhotoMedia->file_name,
        ] : null;

        return Inertia::render('settings/page', [
            'galleryMedia' => $galleryMedia,
            'loadingScreen' => $loadingScreen,
            'profileLogo' => $profileLogo,
            'coverPhoto' => $coverPhoto,
        ]);
    }

    public function uploadGalleryMedia(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,gif,webp,heic,mp4,mov,avi,wmv|max:102400', // 100MB
        ]);

        $user = $request->user();
        $account = $user->account()->first();

        if (!$account) {
            return response()->json(['error' => 'Account not found'], 404);
        }

        $file = $request->file('file');
        $isImage = str_starts_with($file->getMimeType(), 'image/');
        $isVideo = str_starts_with($file->getMimeType(), 'video/');

        // Procesar el archivo
        if ($isImage) {
            return $this->processImage($file, $account, 'gallery');
        } elseif ($isVideo) {
            return $this->processVideo($file, $account, 'gallery');
        }

        return response()->json(['error' => 'Formato no soportado'], 400);
    }

    public function uploadLoadingScreen(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,gif,webp,heic|max:10240', // 10MB
        ]);

        $user = $request->user();
        $account = $user->account()->first();

        if (!$account) {
            return response()->json(['error' => 'Account not found'], 404);
        }

        // Eliminar el logo anterior si existe
        ProfileMedia::where('account_id', $account->id)
            ->loadingScreen()
            ->each(function ($media) {
                Storage::disk('public')->delete($media->file_path);
                $media->delete();
            });

        $file = $request->file('file');
        return $this->processImage($file, $account, 'loading_screen');
    }

    public function uploadProfileLogo(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,gif,webp,heic|max:10240', // 10MB
        ]);

        $user = $request->user();
        $account = $user->account()->first();

        if (!$account) {
            return response()->json(['error' => 'Account not found'], 404);
        }

        // Eliminar el logo anterior si existe
        ProfileMedia::where('account_id', $account->id)
            ->where('type', 'profile_logo')
            ->each(function ($media) {
                Storage::disk('public')->delete($media->file_path);
                $media->delete();
            });

        $file = $request->file('file');
        return $this->processImage($file, $account, 'profile_logo');
    }

    public function uploadCoverPhoto(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,gif,webp,heic|max:20480', // 20MB
        ]);

        $user = $request->user();
        $account = $user->account()->first();

        if (!$account) {
            return response()->json(['error' => 'Account not found'], 404);
        }

        // Eliminar la foto de portada anterior si existe
        ProfileMedia::where('account_id', $account->id)
            ->where('type', 'cover_photo')
            ->each(function ($media) {
                Storage::disk('public')->delete($media->file_path);
                $media->delete();
            });

        $file = $request->file('file');
        return $this->processImage($file, $account, 'cover_photo');
    }

    public function deleteMedia(Request $request, ProfileMedia $media)
    {
        $user = $request->user();
        $account = $user->account()->first();

        if ($media->account_id !== $account->id) {
            abort(403, 'No autorizado');
        }

        Storage::disk('public')->delete($media->file_path);
        $media->delete();

        return back()->with('success', 'Medio eliminado correctamente');
    }

    public function reorderGallery(Request $request)
    {
        $request->validate([
            'order' => 'required|array',
            'order.*' => 'required|integer|exists:profile_media,id',
        ]);

        $user = $request->user();
        $account = $user->account()->first();

        // Actualizar el orden basado en el array de IDs
        foreach ($request->order as $index => $mediaId) {
            ProfileMedia::where('id', $mediaId)
                ->where('account_id', $account->id)
                ->update(['order' => $index]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Orden actualizado correctamente',
        ]);
    }

    private function processImage($file, $account, $type)
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $fileName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $newFileName = $fileName . '_' . time() . '.' . $extension;

        // Guardar imagen directamente sin procesamiento
        $path = 'media/' . $account->id . '/' . $type . '/' . $newFileName;
        Storage::disk('public')->putFileAs(
            'media/' . $account->id . '/' . $type,
            $file,
            $newFileName
        );

        // Obtener el último orden
        $lastOrder = ProfileMedia::where('account_id', $account->id)
            ->where('type', $type)
            ->max('order') ?? 0;

        // Crear registro en la base de datos
        $media = ProfileMedia::create([
            'account_id' => $account->id,
            'type' => $type,
            'media_type' => 'image',
            'file_path' => $path,
            'file_name' => $newFileName,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'order' => $lastOrder + 1,
        ]);

        return response()->json([
            'success' => true,
            'media' => [
                'id' => $media->id,
                'type' => $media->media_type,
                'url' => $media->url,
                'file_name' => $media->file_name,
                'file_size' => $media->formatted_size,
                'order' => $media->order,
            ],
        ]);
    }

    private function processVideo($file, $account, $type)
    {
        $fileName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $extension = $file->getClientOriginalExtension();
        $newFileName = $fileName . '_' . time() . '.' . $extension;

        // Guardar video directamente sin compresión
        $path = 'media/' . $account->id . '/' . $type . '/' . $newFileName;
        Storage::disk('public')->putFileAs(
            'media/' . $account->id . '/' . $type,
            $file,
            $newFileName
        );

        // Obtener el último orden
        $lastOrder = ProfileMedia::where('account_id', $account->id)
            ->where('type', $type)
            ->max('order') ?? 0;

        // Crear registro en la base de datos
        $media = ProfileMedia::create([
            'account_id' => $account->id,
            'type' => $type,
            'media_type' => 'video',
            'file_path' => $path,
            'file_name' => $newFileName,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'order' => $lastOrder + 1,
        ]);

        return response()->json([
            'success' => true,
            'media' => [
                'id' => $media->id,
                'type' => $media->media_type,
                'url' => $media->url,
                'file_name' => $media->file_name,
                'file_size' => $media->formatted_size,
                'order' => $media->order,
            ],
        ]);
    }
}
