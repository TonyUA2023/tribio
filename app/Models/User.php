<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'google_id',
        'avatar',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Define la relación: Un Usuario (dueño) tiene una Cuenta.
     */
    public function account(): HasOne
    {
        return $this->hasOne(Account::class);
    }

    /**
     * Define la relación: Un Usuario puede tener un Customer (si es customer).
     */
    public function customer(): HasOne
    {
        return $this->hasOne(Customer::class);
    }

    /**
     * Verifica si el usuario es super admin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    /**
     * Verifica si el usuario es admin (empresa).
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Verifica si el usuario es cliente (emprendedor).
     */
    public function isClient(): bool
    {
        return $this->role === 'client';
    }

    /**
     * Verifica si el usuario es customer (usuario normal).
     */
    public function isCustomer(): bool
    {
        return $this->role === 'customer';
    }

    /**
     * Verifica si el usuario puede gestionar múltiples perfiles.
     * Solo super_admin y admin pueden hacerlo.
     */
    public function canManageMultipleProfiles(): bool
    {
        return in_array($this->role, ['super_admin', 'admin']);
    }
}