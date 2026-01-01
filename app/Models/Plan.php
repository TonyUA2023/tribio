<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    use HasFactory;

    /**
     * Atributos que se pueden asignar masivamente.
     */
    protected $fillable = [
        'name',
        'price',
        'billing_cycle',
        'type',
        'description',
    ];

    /**
     * Define la relación: Un Plan puede tener muchas Cuentas suscritas.
     */
    public function accounts(): HasMany
    {
        return $this->hasMany(Account::class);
    }
}