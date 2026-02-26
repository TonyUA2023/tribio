<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BusinessType extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'description',
        'icon',
        'color',
        'default_modules',
        'default_config',
        'features',
        'is_active',
        'coming_soon',
        'sort_order',
    ];

    protected $casts = [
        'default_modules' => 'array',
        'default_config' => 'array',
        'features' => 'array',
        'is_active' => 'boolean',
        'coming_soon' => 'boolean',
    ];

    /**
     * Relación: Un tipo tiene muchas cuentas
     */
    public function accounts(): HasMany
    {
        return $this->hasMany(Account::class);
    }

    /**
     * Scope: Solo tipos activos
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Solo tipos disponibles (no "coming_soon")
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_active', true)->where('coming_soon', false);
    }

    /**
     * Verifica si es un tipo de tienda
     */
    public function isStore(): bool
    {
        return $this->slug === 'store';
    }

    /**
     * Verifica si es un tipo de citas
     */
    public function isAppointments(): bool
    {
        return $this->slug === 'appointments';
    }

    /**
     * Verifica si es un tipo de restaurante
     */
    public function isRestaurant(): bool
    {
        return $this->slug === 'restaurant';
    }
}
