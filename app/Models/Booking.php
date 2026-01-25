<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    protected $fillable = [
        'profile_id',
        'account_id',
        'customer_id',
        'client_name',
        'client_phone',
        'client_email',
        'booking_date',
        'booking_time',
        'service',
        'notes',
        'status',
        'notification_channel',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'booking_date' => 'date',
        'booking_time' => 'datetime:H:i',
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
     * Obtener el nombre del cliente (con fallback a campos legacy)
     */
    public function getCustomerName(): string
    {
        return $this->customer?->name ?? $this->client_name;
    }

    /**
     * Obtener el teléfono del cliente (con fallback)
     */
    public function getCustomerPhone(): string
    {
        return $this->customer?->phone ?? $this->client_phone;
    }

    /**
     * Obtener el email del cliente (con fallback)
     */
    public function getCustomerEmail(): ?string
    {
        return $this->customer?->email ?? $this->client_email;
    }

    /**
     * Scope para obtener reservas pendientes
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope para obtener reservas confirmadas
     */
    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    /**
     * Scope para obtener reservas de hoy
     */
    public function scopeToday($query)
    {
        return $query->whereDate('booking_date', today());
    }

    /**
     * Scope para obtener reservas futuras
     */
    public function scopeUpcoming($query)
    {
        return $query->where('booking_date', '>=', today())
                    ->orderBy('booking_date')
                    ->orderBy('booking_time');
    }
}
