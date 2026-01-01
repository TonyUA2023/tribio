<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PendingEmail extends Model
{
    protected $fillable = [
        'to_email',
        'subject',
        'body',
        'attachments',
        'sent',
        'sent_at',
        'error'
    ];

    protected $casts = [
        'attachments' => 'array',
        'sent' => 'boolean',
        'sent_at' => 'datetime'
    ];
}
