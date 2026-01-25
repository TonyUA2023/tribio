<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;

class Review extends Model
{
    protected $fillable = [
        'profile_id',
        'account_id',
        'client_name',
        'client_email',
        'rating',
        'comment',
        'image_path',
        'is_featured',
        'display_order',
        'status',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_featured' => 'boolean',
        'display_order' => 'integer',
    ];

    protected $appends = [
        'image_url',
    ];

    /**
     * Relación con el perfil
     */
    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class);
    }

    /**
     * Relación con la cuenta
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Relación con el customer
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Obtener el nombre del cliente (con fallback)
     */
    public function getCustomerName(): string
    {
        return $this->customer?->name ?? $this->client_name;
    }

    /**
     * Scope para obtener reseñas aprobadas
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope para obtener reseñas pendientes
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope para obtener reseñas destacadas
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope para ordenar por display_order y fecha
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('is_featured', 'desc')
                     ->orderBy('display_order', 'asc')
                     ->orderBy('created_at', 'desc');
    }

    /**
     * Accessor para generar URL completa de la imagen
     */
    protected function imageUrl(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->image_path) {
                    return null;
                }

                // Si ya es una URL completa, retornarla
                if (str_starts_with($this->image_path, 'http')) {
                    return $this->image_path;
                }

                // Generar URL desde storage
                return Storage::disk('public')->url($this->image_path);
            }
        );
    }
}
