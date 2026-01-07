<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Template extends Model
{
    use HasFactory;

    /**
     * Aseguramos que apunte a la tabla correcta
     */
    protected $table = 'templates';

    /**
     * Campos que se pueden llenar (Mass Assignment)
     * He agregado los campos que usa tu App (config, active, premium, slug)
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'preview_image', // Usamos 'preview_image' para coincidir con tu Frontend y BD
        'category',      // barber, restaurant, etc.
        'config',        // El JSON con los colores y estructura
        'is_active',
        'is_premium',
    ];

    /**
     * Conversiones automáticas (Casting)
     * IMPORTANTE: Esto convierte el JSON de la BD en Array automáticamente en Laravel.
     */
    protected $casts = [
        'is_active' => 'boolean',
        'is_premium' => 'boolean',
        'config' => 'array', // <--- ¡Crucial para que applyTemplate funcione!
    ];

    /**
     * Scope para filtrar solo activas
     * Uso: Template::active()->get();
     */
    public function scopeActive(Builder $query)
    {
        return $query->where('is_active', 1);
    }

    /**
     * Relación con Cuentas (Muchos a Muchos)
     * Usada en TemplateController para $account->templates()
     */
    public function accounts()
    {
        return $this->belongsToMany(Account::class, 'account_template')
                    ->withPivot('customizations')
                    ->withTimestamps();
    }
}