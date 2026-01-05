<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Atributos que se pueden asignar masivamente.
     */
    protected $fillable = [
        'account_id',
        'title',
        'description',
        'type',
        'media',
        'thumbnail_url',
        'duration',
        'likes_count',
        'comments_count',
        'shares_count',
        'views_count',
        'comments_enabled',
        'is_published',
        'published_at',
    ];

    /**
     * Atributos que deben ser convertidos a tipos nativos.
     */
    protected $casts = [
        'media' => 'array',
        'duration' => 'integer',
        'likes_count' => 'integer',
        'comments_count' => 'integer',
        'shares_count' => 'integer',
        'views_count' => 'integer',
        'comments_enabled' => 'boolean',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];

    /**
     * Define la relación: Un Post pertenece a una Cuenta (negocio).
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Define la relación: Un Post tiene muchos Comentarios.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(PostComment::class);
    }

    /**
     * Define la relación: Un Post tiene muchos Likes.
     */
    public function likes(): HasMany
    {
        return $this->hasMany(PostLike::class);
    }

    /**
     * Scope: Solo posts publicados.
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    /**
     * Scope: Ordenar por más recientes.
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('published_at', 'desc');
    }

    /**
     * Scope: Ordenar por más populares (más likes).
     */
    public function scopePopular($query)
    {
        return $query->orderBy('likes_count', 'desc');
    }

    /**
     * Incrementar contador de vistas.
     */
    public function incrementViews(): void
    {
        $this->increment('views_count');
    }

    /**
     * Incrementar contador de likes.
     */
    public function incrementLikes(): void
    {
        $this->increment('likes_count');
    }

    /**
     * Decrementar contador de likes.
     */
    public function decrementLikes(): void
    {
        $this->decrement('likes_count');
    }

    /**
     * Incrementar contador de comentarios.
     */
    public function incrementComments(): void
    {
        $this->increment('comments_count');
    }

    /**
     * Decrementar contador de comentarios.
     */
    public function decrementComments(): void
    {
        $this->decrement('comments_count');
    }

    /**
     * Incrementar contador de compartidos.
     */
    public function incrementShares(): void
    {
        $this->increment('shares_count');
    }

    /**
     * Verificar si un usuario (identificado por IP/fingerprint) ya dio like.
     */
    public function hasLikedBy(string $userIdentifier): bool
    {
        return $this->likes()
            ->where('user_identifier', $userIdentifier)
            ->exists();
    }

    /**
     * Obtener el primer medio (imagen/video principal).
     */
    public function getFirstMediaAttribute(): ?string
    {
        if (empty($this->media)) {
            return null;
        }

        return is_array($this->media) ? $this->media[0] : null;
    }

    /**
     * Verificar si es un post de video.
     */
    public function isVideo(): bool
    {
        return $this->type === 'video';
    }

    /**
     * Verificar si es un post de carrusel.
     */
    public function isCarousel(): bool
    {
        return $this->type === 'carousel';
    }

    /**
     * Verificar si es un post de imagen.
     */
    public function isImage(): bool
    {
        return $this->type === 'image';
    }
}
