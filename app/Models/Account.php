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
        'business_category_id',
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

    /**
     * Define la relación: Una Cuenta pertenece a una Categoría de Negocio.
     */
    public function businessCategory(): BelongsTo
    {
        return $this->belongsTo(BusinessCategory::class);
    }

    /**
     * Define la relación: Una Cuenta tiene muchos módulos instalados.
     */
    public function modules(): HasMany
    {
        return $this->hasMany(AccountModule::class);
    }

    /**
     * Define la relación: Solo módulos activos.
     */
    public function activeModules(): HasMany
    {
        return $this->modules()->where('is_active', true);
    }

    /**
     * Helper: Verificar si un módulo está habilitado
     */
    public function hasModule(string $moduleSlug): bool
    {
        return $this->modules()
            ->where('module_slug', $moduleSlug)
            ->where('is_active', true)
            ->exists();
    }

    /**
     * Helper: Obtener configuración de un módulo específico
     */
    public function getModuleConfig(string $moduleSlug): ?array
    {
        $module = $this->modules()
            ->where('module_slug', $moduleSlug)
            ->where('is_active', true)
            ->first();

        return $module?->config;
    }

    /**
     * Define la relación: Una Cuenta tiene muchas Publicaciones.
     */
    public function posts(): HasMany
    {
        return $this->hasMany(\App\Models\Post::class);
    }
}