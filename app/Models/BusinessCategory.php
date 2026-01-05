<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BusinessCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'icon',
        'description',
        'parent_id',
        'default_modules',
        'default_config',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'default_modules' => 'array',
        'default_config' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Relación: Una categoría puede tener subcategorías
     */
    public function children(): HasMany
    {
        return $this->hasMany(BusinessCategory::class, 'parent_id');
    }

    /**
     * Relación: Una subcategoría pertenece a una categoría padre
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(BusinessCategory::class, 'parent_id');
    }

    /**
     * Relación: Una categoría tiene muchas cuentas
     */
    public function accounts(): HasMany
    {
        return $this->hasMany(Account::class);
    }

    /**
     * Scope: Solo categorías activas
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Solo categorías principales (sin padre)
     */
    public function scopeMain($query)
    {
        return $query->whereNull('parent_id');
    }
}
