<?php

namespace App\Exceptions\Custom;

use Exception;

class BookingConflictException extends Exception
{
    protected $message = 'Ya existe una reserva para este horario.';
    protected $code = 409;

    public function __construct(?string $message = null)
    {
        if ($message) {
            $this->message = $message;
        }
        parent::__construct($this->message, $this->code);
    }

    public function render()
    {
        if (request()->expectsJson()) {
            return response()->json([
                'error' => 'Booking Conflict',
                'message' => $this->message,
            ], $this->code);
        }

        return response()->view('errors.conflict', [
            'message' => $this->message,
        ], $this->code);
    }
}
