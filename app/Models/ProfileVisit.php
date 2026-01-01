<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProfileVisit extends Model
{
    use HasFactory;

    /**
     * Desactivamos los timestamps (created_at/updated_at)
     * porque ya tenemos nuestra propia columna 'visited_at'.
     */
    public $timestamps = false;

    /**
     * Atributos que se pueden asignar masivamente.
     */
    protected $fillable = [
        'profile_id',
        'ip_address',
        'user_agent',
        'visited_at',
    ];

    /**
     * Define la relación: Una Visita pertenece a un Perfil.
     */
    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class);
    }
}