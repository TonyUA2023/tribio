<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Account extends Model
{
    use HasFactory;

    /**
     * Atributos que se pueden asignar masivamente.
     */
    protected $fillable = [
        'user_id',
        'plan_id',
        'name',
        'type',
        'slug',
        'payment_status',
        'next_billing_date',
    ];

    /**
     * Define la relación: Una Cuenta pertenece a un Usuario (el dueño).
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Define la relación: Una Cuenta pertenece a un Plan.
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    /**
     * Define la relación: Una Cuenta (Empresa) puede tener muchos Perfiles (empleados).
     */
    public function profiles(): HasMany
    {
        return $this->hasMany(Profile::class);
    }

    /**
     * Define la relación: Una Cuenta puede tener muchos medios (fotos/videos).
     */
    public function media(): HasMany
    {
        return $this->hasMany(ProfileMedia::class);
    }
}