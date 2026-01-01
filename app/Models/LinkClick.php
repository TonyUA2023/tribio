<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LinkClick extends Model
{
    use HasFactory;

    /**
     * Desactivamos los timestamps (created_at/updated_at)
     * porque ya tenemos nuestra propia columna 'clicked_at'.
     */
    public $timestamps = false;

    /**
     * Atributos que se pueden asignar masivamente.
     */
    protected $fillable = [
        'profile_id',
        'link_url',
        'link_title',
        'ip_address',
        'clicked_at',
    ];

    /**
     * Define la relación: Un Clic pertenece a un Perfil.
     */
    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class);
    }
}