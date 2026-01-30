<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'account_id',
        'subscription_id',
        'amount',
        'currency',
        'description',
        'culqi_charge_id',
        'culqi_token_id',
        'card_brand',
        'card_last_four',
        'status',
        'failure_code',
        'failure_message',
        'amount_refunded',
        'refund_id',
        'refunded_at',
        'customer_email',
        'customer_name',
        'culqi_response',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'integer',
        'amount_refunded' => 'integer',
        'refunded_at' => 'datetime',
        'culqi_response' => 'array',
        'metadata' => 'array',
    ];

    /**
     * Get the account that owns the payment.
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Get the subscription associated with this payment.
     */
    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    /**
     * Check if payment was successful.
     */
    public function isSuccessful(): bool
    {
        return $this->status === 'succeeded';
    }

    /**
     * Check if payment failed.
     */
    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    /**
     * Check if payment was refunded.
     */
    public function isRefunded(): bool
    {
        return in_array($this->status, ['refunded', 'partially_refunded']);
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
     * Get formatted refunded amount.
     */
    public function getFormattedRefundedAmountAttribute(): string
    {
        $amount = $this->amount_refunded / 100;
        return 'S/' . number_format($amount, 2);
    }

    /**
     * Get card display string.
     */
    public function getCardDisplayAttribute(): string
    {
        if ($this->card_brand && $this->card_last_four) {
            return "{$this->card_brand} ****{$this->card_last_four}";
        }
        return 'N/A';
    }

    /**
     * Scope for successful payments.
     */
    public function scopeSuccessful($query)
    {
        return $query->where('status', 'succeeded');
    }

    /**
     * Scope for failed payments.
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Create payment record from Culqi charge response.
     */
    public static function createFromCulqiCharge(array $chargeData, int $accountId, ?int $subscriptionId = null, array $extraData = []): self
    {
        $source = $chargeData['source'] ?? [];
        $iin = $source['iin'] ?? [];

        return self::create([
            'account_id' => $accountId,
            'subscription_id' => $subscriptionId,
            'amount' => $chargeData['amount'] ?? 0,
            'currency' => $chargeData['currency_code'] ?? 'PEN',
            'description' => $chargeData['description'] ?? null,
            'culqi_charge_id' => $chargeData['id'] ?? null,
            'culqi_token_id' => $source['id'] ?? null,
            'card_brand' => $iin['card_brand'] ?? null,
            'card_last_four' => $source['last_four'] ?? null,
            'status' => 'succeeded',
            'customer_email' => $chargeData['email'] ?? ($extraData['email'] ?? null),
            'customer_name' => $extraData['customer_name'] ?? null,
            'culqi_response' => $chargeData,
            'metadata' => $extraData['metadata'] ?? null,
        ]);
    }

    /**
     * Create failed payment record.
     */
    public static function createFailedPayment(array $errorData, int $accountId, int $amount, string $email, ?int $subscriptionId = null): self
    {
        return self::create([
            'account_id' => $accountId,
            'subscription_id' => $subscriptionId,
            'amount' => $amount,
            'currency' => 'PEN',
            'status' => 'failed',
            'failure_code' => $errorData['code'] ?? ($errorData['decline_code'] ?? null),
            'failure_message' => $errorData['user_message'] ?? ($errorData['merchant_message'] ?? 'Error desconocido'),
            'customer_email' => $email,
            'culqi_response' => $errorData,
        ]);
    }
}
