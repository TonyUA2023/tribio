<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'account_id',
        'name',
        'phone',
        'email',
        'avatar',
        'preferences',
        'addresses',
        'ip_address',
        'user_agent',
        'last_order_at',
        'last_booking_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'preferences' => 'array',
        'addresses' => 'array',
        'last_order_at' => 'datetime',
        'last_booking_at' => 'datetime',
    ];

    /**
     * Get the user that owns the customer (if registered).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the account that owns the customer.
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Get all bookings for this customer.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Get all orders for this customer.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get all reviews written by this customer.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * Check if customer is registered (has user account).
     */
    public function isRegistered(): bool
    {
        return !is_null($this->user_id);
    }

    /**
     * Check if customer is a guest (no user account).
     */
    public function isGuest(): bool
    {
        return is_null($this->user_id);
    }

    /**
     * Get the customer's preferred notification channel.
     */
    public function getNotificationChannel(): string
    {
        return $this->preferences['notification_channel'] ?? 'email';
    }

    /**
     * Get the customer's default address.
     */
    public function getDefaultAddress(): ?array
    {
        if (empty($this->addresses)) {
            return null;
        }

        return collect($this->addresses)->firstWhere('is_default', true);
    }

    /**
     * Update customer's last activity timestamp.
     */
    public function touchLastBooking(): void
    {
        $this->update(['last_booking_at' => now()]);
    }

    /**
     * Update customer's last order timestamp.
     */
    public function touchLastOrder(): void
    {
        $this->update(['last_order_at' => now()]);
    }
}
