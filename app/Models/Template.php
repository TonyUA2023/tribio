<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Template extends Model
{
    use HasFactory;

    /**
     * Atributos que se pueden asignar masivamente.
     */
    protected $fillable = [
        'name',
        'blade_view_path',
        'description',
        'preview_image_url',
    ];

    /**
     * Define la relación: Una Plantilla puede ser usada por muchos Perfiles.
     */
    public function profiles(): HasMany
    {
        return $this->hasMany(Profile::class);
    }
}