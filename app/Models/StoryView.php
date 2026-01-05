<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoryView extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'story_id',
        'viewer_ip',
        'user_agent',
        'viewed_at',
    ];

    protected $casts = [
        'viewed_at' => 'datetime',
    ];

    /**
     * Relaciones
     */
    public function story(): BelongsTo
    {
        return $this->belongsTo(Story::class);
    }
}
