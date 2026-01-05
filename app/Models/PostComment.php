<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PostComment extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Atributos que se pueden asignar masivamente.
     */
    protected $fillable = [
        'post_id',
        'parent_id',
        'user_name',
        'user_email',
        'user_avatar',
        'comment',
        'likes_count',
        'is_approved',
        'is_pinned',
    ];

    /**
     * Atributos que deben ser convertidos a tipos nativos.
     */
    protected $casts = [
        'likes_count' => 'integer',
        'is_approved' => 'boolean',
        'is_pinned' => 'boolean',
    ];

    /**
     * Define la relación: Un Comentario pertenece a un Post.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Define la relación: Un Comentario puede tener un comentario padre (para respuestas).
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(PostComment::class, 'parent_id');
    }

    /**
     * Define la relación: Un Comentario puede tener muchas respuestas.
     */
    public function replies(): HasMany
    {
        return $this->hasMany(PostComment::class, 'parent_id');
    }

    /**
     * Scope: Solo comentarios aprobados.
     */
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    /**
     * Scope: Solo comentarios de nivel superior (sin padre).
     */
    public function scopeTopLevel($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope: Comentarios fijados primero.
     */
    public function scopePinnedFirst($query)
    {
        return $query->orderBy('is_pinned', 'desc');
    }

    /**
     * Scope: Ordenar por más recientes.
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    /**
     * Scope: Ordenar por más antiguos.
     */
    public function scopeOldest($query)
    {
        return $query->orderBy('created_at', 'asc');
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
     * Aprobar comentario.
     */
    public function approve(): void
    {
        $this->update(['is_approved' => true]);
    }

    /**
     * Rechazar comentario.
     */
    public function reject(): void
    {
        $this->update(['is_approved' => false]);
    }

    /**
     * Fijar comentario.
     */
    public function pin(): void
    {
        $this->update(['is_pinned' => true]);
    }

    /**
     * Desfijar comentario.
     */
    public function unpin(): void
    {
        $this->update(['is_pinned' => false]);
    }

    /**
     * Verificar si es una respuesta.
     */
    public function isReply(): bool
    {
        return !is_null($this->parent_id);
    }

    /**
     * Verificar si es un comentario de nivel superior.
     */
    public function isTopLevel(): bool
    {
        return is_null($this->parent_id);
    }

    /**
     * Obtener avatar del usuario o avatar por defecto.
     */
    public function getAvatarUrlAttribute(): string
    {
        return $this->user_avatar ?? 'https://ui-avatars.com/api/?name=' . urlencode($this->user_name) . '&background=9dc74a&color=1a5c3a';
    }
}
