<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PostLike extends Model
{
    use HasFactory;

    /**
     * Atributos que se pueden asignar masivamente.
     */
    protected $fillable = [
        'post_id',
        'user_identifier',
        'user_name',
    ];

    /**
     * Define la relación: Un Like pertenece a un Post.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Crear o eliminar un like (toggle).
     *
     * @param int $postId
     * @param string $userIdentifier IP o fingerprint del usuario
     * @param string|null $userName Nombre opcional del usuario
     * @return array ['liked' => bool, 'likesCount' => int]
     */
    public static function toggle(int $postId, string $userIdentifier, ?string $userName = null): array
    {
        $post = \App\Models\Post::findOrFail($postId);

        $existingLike = static::where('post_id', $postId)
            ->where('user_identifier', $userIdentifier)
            ->first();

        if ($existingLike) {
            // Eliminar like
            $existingLike->delete();
            $post->decrementLikes();

            return [
                'liked' => false,
                'likesCount' => $post->fresh()->likes_count,
            ];
        } else {
            // Crear like
            static::create([
                'post_id' => $postId,
                'user_identifier' => $userIdentifier,
                'user_name' => $userName,
            ]);
            $post->incrementLikes();

            return [
                'liked' => true,
                'likesCount' => $post->fresh()->likes_count,
            ];
        }
    }

    /**
     * Verificar si un usuario ya dio like a un post.
     *
     * @param int $postId
     * @param string $userIdentifier
     * @return bool
     */
    public static function hasLiked(int $postId, string $userIdentifier): bool
    {
        return static::where('post_id', $postId)
            ->where('user_identifier', $userIdentifier)
            ->exists();
    }
}
