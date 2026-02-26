<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class ProductCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_id',
        'parent_id',
        'name',
        'slug',
        'description',
        'image',
        'sort_order',
        'depth',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'depth' => 'integer',
    ];

    /**
     * Boot del modelo
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
            // Calcular profundidad basada en el padre
            if ($category->parent_id) {
                $parent = static::find($category->parent_id);
                $category->depth = $parent ? $parent->depth + 1 : 0;
            } else {
                $category->depth = 0;
            }
        });

        static::updating(function ($category) {
            // Recalcular profundidad si cambió el padre
            if ($category->isDirty('parent_id')) {
                if ($category->parent_id) {
                    $parent = static::find($category->parent_id);
                    $category->depth = $parent ? $parent->depth + 1 : 0;
                } else {
                    $category->depth = 0;
                }
            }
        });
    }

    /**
     * Relación: La categoría pertenece a una cuenta
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Relación: Categoría padre
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'parent_id');
    }

    /**
     * Relación: Subcategorías (hijos)
     */
    public function children(): HasMany
    {
        return $this->hasMany(ProductCategory::class, 'parent_id')->ordered();
    }

    /**
     * Relación recursiva: Todos los descendientes
     */
    public function descendants(): HasMany
    {
        return $this->hasMany(ProductCategory::class, 'parent_id')->with('descendants');
    }

    /**
     * Relación: Una categoría tiene muchos productos
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Verificar si es categoría raíz
     */
    public function isRoot(): bool
    {
        return $this->parent_id === null;
    }

    /**
     * Verificar si tiene subcategorías
     */
    public function hasChildren(): bool
    {
        return $this->children()->count() > 0;
    }

    /**
     * Obtener la ruta completa de la categoría (breadcrumb)
     */
    public function getFullPathAttribute(): string
    {
        $path = [$this->name];
        $parent = $this->parent;

        while ($parent) {
            array_unshift($path, $parent->name);
            $parent = $parent->parent;
        }

        return implode(' > ', $path);
    }

    /**
     * Scope: Solo categorías activas
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Ordenadas
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    /**
     * Scope: Solo categorías raíz (sin padre)
     */
    public function scopeRoots($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope: Solo subcategorías
     */
    public function scopeChildren($query)
    {
        return $query->whereNotNull('parent_id');
    }
}
