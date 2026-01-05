<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccountModule extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_id',
        'module_slug',
        'is_active',
        'config',
        'installed_at',
    ];

    protected $casts = [
        'config' => 'array',
        'is_active' => 'boolean',
        'installed_at' => 'datetime',
    ];

    /**
     * Relación: Un módulo pertenece a una cuenta
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Scope: Solo módulos activos
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Filtrar por slug de módulo
     */
    public function scopeBySlug($query, string $slug)
    {
        return $query->where('module_slug', $slug);
    }
}
