<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Casts\Attribute;

class ProfileMedia extends Model
{
    protected $table = 'profile_media';

    protected $fillable = [
        'account_id',
        'profile_id',
        'type',
        'media_type',
        'file_path',
        'file_name',
        'mime_type',
        'file_size',
        'order',
        'caption',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'order'     => 'integer',
    ];

    /**
     * 🔥 Estos atributos VIAJAN al frontend automáticamente
     */
    protected $appends = [
        'url',
        'formatted_size',
        'is_image',
        'is_video',
        'thumbnail_url',
    ];

    /* ==============================
     |  RELACIONES
     |==============================*/

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class);
    }

    /* ==============================
     |  ACCESSORS
     |==============================*/

    /**
     * URL pública del archivo (storage)
     */
    protected function url(): Attribute
    {
        return Attribute::make(
            get: fn () => Storage::disk('public')->url(
                ltrim($this->file_path, '/')
            )
        );
    }

    /**
     * Tamaño legible (KB, MB, GB)
     */
    protected function formattedSize(): Attribute
    {
        return Attribute::make(
            get: function () {
                $bytes = (int) $this->file_size;
                if ($bytes <= 0) return '0 B';

                $units = ['B', 'KB', 'MB', 'GB'];
                $i = 0;

                while ($bytes >= 1024 && $i < count($units) - 1) {
                    $bytes /= 1024;
                    $i++;
                }

                return round($bytes, 2) . ' ' . $units[$i];
            }
        );
    }

    protected function isImage(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->media_type === 'image'
        );
    }

    protected function isVideo(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->media_type === 'video'
        );
    }

    /**
     * URL del thumbnail para videos
     * Por ahora genera un placeholder, pero puede mejorar para usar thumbnails generados
     */
    protected function thumbnailUrl(): Attribute
    {
        return Attribute::make(
            get: function () {
                // Si es video, intentar buscar un thumbnail generado
                if ($this->media_type === 'video') {
                    // Por ahora retornamos null, el frontend generará el thumbnail desde el video
                    // En el futuro se puede agregar lógica para thumbnails pre-generados
                    return null;
                }

                // Para imágenes, usar la misma URL
                return $this->url;
            }
        );
    }

    /* ==============================
     |  SCOPES
     |==============================*/

    /**
     * Galería general (imagenes + videos)
     */
    public function scopeGallery($query)
    {
        return $query
            ->where('type', 'gallery')
            ->orderBy('order');
    }

    /**
     * 🔥 SOLO imágenes (para carrusel)
     */
    public function scopeGalleryImages($query)
    {
        return $query
            ->where('type', 'gallery')
            ->where('media_type', 'image')
            ->orderBy('order');
    }

    /**
     * Pantalla de carga
     */
    public function scopeLoadingScreen($query)
    {
        return $query->where('type', 'loading_screen');
    }
}
