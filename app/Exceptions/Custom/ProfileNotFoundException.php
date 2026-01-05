<?php

namespace App\Exceptions\Custom;

use Exception;

class ProfileNotFoundException extends Exception
{
    protected $message = 'El perfil solicitado no existe.';
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
                'error' => 'Profile Not Found',
                'message' => $this->message,
            ], $this->code);
        }

        return response()->view('errors.404', [
            'message' => $this->message,
        ], $this->code);
    }
}
