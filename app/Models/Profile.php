<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Profile extends Model
{
    use HasFactory;

    /**
     * Atributos que se pueden asignar masivamente.
     */
    protected $fillable = [
        'account_id',
        'name',
        'title',
        'slug',
        'notification_email',
        'render_type',
        'template_id',
        'custom_view_path',
        'data',
    ];

    /**
     * Casting de atributos.
     * Esto le dice a Laravel que trate la columna 'data' (JSON)
     * como un array de PHP automáticamente. ¡Muy importante!
     */
    protected $casts = [
        'data' => 'array',
    ];

    /**
     * Define la relación: Un Perfil pertenece a una Cuenta.
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Define la relación: Un Perfil (opcionalmente) pertenece a una Plantilla.
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }

    /**
     * Define la relación: Un Perfil tiene muchas visitas (analíticas).
     */
    public function visits(): HasMany
    {
        return $this->hasMany(ProfileVisit::class);
    }

    /**
     * Define la relación: Un Perfil tiene muchos clics en enlaces (analíticas).
     */
    public function clicks(): HasMany
    {
        return $this->hasMany(LinkClick::class);
    }

    /**
     * Define la relación: Un Perfil tiene muchas reservas.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Define la relación: Un Perfil tiene muchas reseñas.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(ProfileMedia::class, 'account_id', 'account_id');
    }
}