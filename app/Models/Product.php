<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    // Géneros disponibles
    public const GENDER_MALE = 'male';
    public const GENDER_FEMALE = 'female';
    public const GENDER_UNISEX = 'unisex';
    public const GENDER_KIDS = 'kids';

    // Condiciones del producto
    public const CONDITION_NEW = 'new';
    public const CONDITION_USED = 'used';
    public const CONDITION_REFURBISHED = 'refurbished';

    protected $fillable = [
        'account_id',
        'product_category_id',
        'brand_id',
        'name',
        'slug',
        'description',
        'short_description',
        'specifications',
        'price',
        'compare_price',
        'image',
        'images',
        'category',
        'brand',
        'gender',
        'condition',
        'origin_country',
        'sku',
        'available',
        'featured',
        'stock',
        'weight',
        'sort_order',
        'options',
        'has_variants',
        'variants',
        'variant_attributes',
        'display_settings',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'compare_price' => 'decimal:2',
        'weight' => 'decimal:2',
        'available' => 'boolean',
        'featured' => 'boolean',
        'has_variants' => 'boolean',
        'stock' => 'integer',
        'sort_order' => 'integer',
        'options' => 'array',
        'images' => 'array',
        'variants' => 'array',
        'specifications' => 'array',
        'variant_attributes' => 'array',
        'display_settings' => 'array',
    ];

    /**
     * Obtener la cuenta a la que pertenece el producto
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Obtener la categoría del producto
     */
    public function productCategory(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class);
    }

    /**
     * Obtener la marca del producto
     */
    public function brandRelation(): BelongsTo
    {
        return $this->belongsTo(Brand::class, 'brand_id');
    }

    /**
     * Verificar si tiene descuento
     */
    public function hasDiscount(): bool
    {
        return $this->compare_price && $this->compare_price > $this->price;
    }

    /**
     * Obtener porcentaje de descuento
     */
    public function getDiscountPercentageAttribute(): ?int
    {
        if (!$this->hasDiscount()) {
            return null;
        }
        return (int) round((($this->compare_price - $this->price) / $this->compare_price) * 100);
    }

    /**
     * Verificar si tiene stock disponible
     */
    public function hasStock(): bool
    {
        if ($this->stock === null) {
            return true; // Sin control de stock
        }
        return $this->stock > 0;
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

    /**
     * Scope para productos por género
     */
    public function scopeOfGender($query, $gender)
    {
        return $query->where('gender', $gender);
    }

    /**
     * Obtener etiqueta legible del género
     */
    public function getGenderLabelAttribute(): ?string
    {
        return match($this->gender) {
            self::GENDER_MALE => 'Hombre',
            self::GENDER_FEMALE => 'Mujer',
            self::GENDER_UNISEX => 'Unisex',
            self::GENDER_KIDS => 'Niños',
            default => null,
        };
    }

    /**
     * Obtener etiqueta legible de la condición
     */
    public function getConditionLabelAttribute(): ?string
    {
        return match($this->condition) {
            self::CONDITION_NEW => 'Nuevo',
            self::CONDITION_USED => 'Usado',
            self::CONDITION_REFURBISHED => 'Reacondicionado',
            default => null,
        };
    }

    /**
     * Verificar si debe mostrar cierto campo según display_settings
     */
    public function shouldShow(string $field): bool
    {
        $settings = $this->display_settings ?? [];
        return $settings["show_{$field}"] ?? true;
    }

    /**
     * Obtener lista de géneros disponibles
     */
    public static function getGenderOptions(): array
    {
        return [
            self::GENDER_UNISEX => 'Unisex',
            self::GENDER_MALE => 'Hombre',
            self::GENDER_FEMALE => 'Mujer',
            self::GENDER_KIDS => 'Niños',
        ];
    }

    /**
     * Obtener lista de condiciones disponibles
     */
    public static function getConditionOptions(): array
    {
        return [
            self::CONDITION_NEW => 'Nuevo',
            self::CONDITION_USED => 'Usado',
            self::CONDITION_REFURBISHED => 'Reacondicionado',
        ];
    }

    /**
     * Obtener atributos de variantes comunes
     */
    public static function getCommonVariantAttributes(): array
    {
        return [
            'size' => [
                'label' => 'Talla',
                'type' => 'select',
                'options' => ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            ],
            'color' => [
                'label' => 'Color',
                'type' => 'color',
                'options' => [],
            ],
            'capacity' => [
                'label' => 'Capacidad',
                'type' => 'select',
                'options' => ['64GB', '128GB', '256GB', '512GB', '1TB'],
            ],
            'material' => [
                'label' => 'Material',
                'type' => 'select',
                'options' => [],
            ],
            'weight' => [
                'label' => 'Peso',
                'type' => 'select',
                'options' => ['250g', '500g', '1kg', '2kg', '5kg'],
            ],
        ];
    }
}
