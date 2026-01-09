<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    // --- 1. CONSTANTES DE ESTADO (Para evitar errores de escritura) ---
    const STATUS_PENDING = 'pending';
    const STATUS_PREPARING = 'preparing';
    const STATUS_READY = 'ready';       // Reemplaza a 'in_delivery' o cocina
    const STATUS_DELIVERED = 'delivered';
    const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'account_id',
        'order_number',
        'customer_name',
        'customer_phone',
        'customer_email',
        'delivery_address',
        'notes',
        'subtotal',
        'delivery_fee',
        'total',
        'status',
        'payment_method',
        'payment_status',
        'confirmed_at',
        'delivered_at',
        // 'ready_at', // Sugerencia: Podrías agregar esto en una futura migración para medir tiempos de cocina
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'delivery_fee' => 'decimal:2',
        'total' => 'decimal:2',
        'confirmed_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    /**
     * Boot del modelo para generar número de orden automáticamente
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->order_number)) {
                // Usamos time() + random para asegurar unicidad y que sea corto
                $order->order_number = 'ORD-' . strtoupper(substr(uniqid(), -6));
            }
        });
    }

    /**
     * RELACIONES
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * ACCESSOR: Resumen de items para mostrar en la lista de la App
     * Esto permite usar $order->items_summary automáticamente
     */
    public function getItemsSummaryAttribute()
    {
        // Si ya cargaste la relación items...
        if ($this->relationLoaded('items')) {
            $count = $this->items->count();
            if ($count === 0) return 'Sin productos';
            
            $firstItem = $this->items->first();
            $text = "{$firstItem->quantity}x {$firstItem->product_name}"; // Asumiendo que OrderItem tiene quantity y product_name
            
            if ($count > 1) {
                $rest = $count - 1;
                $text .= " y $rest más...";
            }
            return $text;
        }
        return 'Ver detalles...';
    }

    /**
     * SCOPES ACTUALIZADOS (Según tu nuevo estándar)
     */
    
    // 1. PENDIENTE
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    // 2. EN PREPARACIÓN (Quitamos 'confirmed' ya que ahora pasamos directo aquí)
    public function scopePreparing($query)
    {
        return $query->where('status', self::STATUS_PREPARING);
    }

    // 3. LISTO (NUEVO - Reemplaza 'in_delivery' para ser agnóstico)
    public function scopeReady($query)
    {
        return $query->where('status', self::STATUS_READY);
    }

    // 4. ENTREGADO
    public function scopeDelivered($query)
    {
        return $query->where('status', self::STATUS_DELIVERED);
    }

    // 5. CANCELADO (Faltaba este scope)
    public function scopeCancelled($query)
    {
        return $query->where('status', self::STATUS_CANCELLED);
    }

    // SCOPE ÚTIL: Activos (Todo lo que no sea historial)
    public function scopeActive($query)
    {
        return $query->whereIn('status', [
            self::STATUS_PENDING, 
            self::STATUS_PREPARING, 
            self::STATUS_READY
        ]);
    }
}