<?php

namespace App\Exceptions\Custom;

use Exception;

class AccountNotFoundException extends Exception
{
    protected $message = 'La cuenta solicitada no existe.';
    protected $code = 404;

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
                'error' => 'Account Not Found',
                'message' => $this->message,
            ], $this->code);
        }

        return response()->view('errors.404', [
            'message' => $this->message,
        ], $this->code);
    }
}
