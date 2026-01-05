<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class Story extends Model
{
    protected $fillable = [
        'profile_id',
        'account_id',
        'media_type',
        'media_path',
        'caption',
        'background_color',
        'views_count',
        'is_active',
        'expires_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'views_count' => 'integer',
        'expires_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    protected $appends = ['media_url', 'is_expired', 'time_remaining'];

    /**
     * Relaciones
     */
    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function views(): HasMany
    {
        return $this->hasMany(StoryView::class);
    }

    /**
     * Accessors
     */
    protected function mediaUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => Storage::disk('public')->url(
                ltrim($this->media_path, '/')
            )
        );
    }

    protected function isExpired(): Attribute
    {
        return Attribute::make(
            get: fn () => Carbon::now()->isAfter($this->expires_at)
        );
    }

    protected function timeRemaining(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->is_expired) {
                    return 'Expirada';
                }
                return $this->expires_at->diffForHumans();
            }
        );
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                     ->where('expires_at', '>', Carbon::now());
    }

    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<=', Carbon::now());
    }

    public function scopeForProfile($query, $profileId)
    {
        return $query->where('profile_id', $profileId);
    }

    public function scopeForAccount($query, $accountId)
    {
        return $query->where('account_id', $accountId);
    }

    /**
     * Métodos de utilidad
     */
    public static function boot()
    {
        parent::boot();

        // Auto-set expires_at a 24 horas
        static::creating(function ($story) {
            if (!$story->expires_at) {
                $story->expires_at = Carbon::now()->addHours(24);
            }
        });

        // Eliminar archivo al borrar story
        static::deleting(function ($story) {
            if (Storage::disk('public')->exists($story->media_path)) {
                Storage::disk('public')->delete($story->media_path);
            }
        });
    }

    public function incrementViews(): void
    {
        $this->increment('views_count');
    }

    public function markAsInactive(): void
    {
        $this->update(['is_active' => false]);
    }
}
