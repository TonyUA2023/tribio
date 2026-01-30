<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subscription extends Model
{
    protected $fillable = [
        'account_id',
        'plan_type',
        'billing_cycle',
        'amount',
        'currency',
        'culqi_customer_id',
        'culqi_card_id',
        'culqi_plan_id',
        'culqi_subscription_id',
        'status',
        'trial_ends_at',
        'current_period_start',
        'current_period_end',
        'cancelled_at',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'integer',
        'trial_ends_at' => 'datetime',
        'current_period_start' => 'datetime',
        'current_period_end' => 'datetime',
        'cancelled_at' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * Plan types with their prices (in centimos)
     */
    public const PLANS = [
        'personal' => [
            'name' => 'Personal',
            'monthly' => 0,
            'yearly' => 0,
            'features' => ['Tarjeta digital', 'Link personalizado'],
        ],
        'pro' => [
            'name' => 'Pro',
            'monthly' => 2900, // S/29.00
            'yearly' => 27840, // S/278.40 (20% descuento)
            'features' => [
                'Mini tienda + link-in-bio',
                'Gestion de stock',
                'Notificaciones por WhatsApp',
                'Pasarela de pagos integrada',
                'Pedidos o reservas de citas',
                'Resenas de clientes',
            ],
        ],
        'corporativo' => [
            'name' => 'Corporativo',
            'monthly' => null, // A medida
            'yearly' => null,
            'features' => ['Para equipos y cadenas', 'Precio personalizado'],
        ],
    ];

    /**
     * Get the account that owns the subscription.
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Get the payments for this subscription.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Check if subscription is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active' || $this->status === 'trialing';
    }

    /**
     * Check if subscription is on trial.
     */
    public function onTrial(): bool
    {
        return $this->status === 'trialing' && $this->trial_ends_at && $this->trial_ends_at->isFuture();
    }

    /**
     * Check if subscription is cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Get the plan details.
     */
    public function getPlanDetails(): array
    {
        return self::PLANS[$this->plan_type] ?? [];
    }

    /**
     * Get formatted amount.
     */
    public function getFormattedAmountAttribute(): string
    {
        $amount = $this->amount / 100;
        return 'S/' . number_format($amount, 2);
    }

    /**
     * Scope for active subscriptions.
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['active', 'trialing']);
    }

    /**
     * Calculate price based on plan and billing cycle.
     */
    public static function calculatePrice(string $planType, string $billingCycle): ?int
    {
        $plan = self::PLANS[$planType] ?? null;

        if (!$plan) {
            return null;
        }

        return $plan[$billingCycle] ?? null;
    }
}
