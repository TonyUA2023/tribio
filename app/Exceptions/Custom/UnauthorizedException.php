<?php

namespace App\Exceptions\Custom;

use Exception;

class UnauthorizedException extends Exception
{
    protected $message = 'No tienes permisos para realizar esta acción.';
    protected $code = 403;

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
                'error' => 'Unauthorized',
                'message' => $this->message,
            ], $this->code);
        }

        return response()->view('errors.403', [
            'message' => $this->message,
        ], $this->code);
    }
}
