<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'account_id',
        'name',
        'description',
        'price',
        'image',
        'category',
        'available',
        'featured',
        'stock',
        'sort_order',
        'options',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'available' => 'boolean',
        'featured' => 'boolean',
        'stock' => 'integer',
        'sort_order' => 'integer',
        'options' => 'array',
    ];

    /**
     * Obtener la cuenta a la que pertenece el producto
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Scope para productos disponibles
     */
    public function scopeAvailable($query)
    {
        return $query->where('available', true);
    }

    /**
     * Scope para productos destacados
     */
    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    /**
     * Scope para productos por categoría
     */
    public function scopeOfCategory($query, $category)
    {
        return $query->where('category', $category);
    }
}
