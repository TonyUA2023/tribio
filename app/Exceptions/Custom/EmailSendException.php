<?php

namespace App\Exceptions\Custom;

use Exception;

class EmailSendException extends Exception
{
    protected $message = 'Error al enviar el correo electrónico.';
    protected $code = 500;

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
                'error' => 'Email Send Error',
                'message' => $this->message,
            ], $this->code);
        }

        return redirect()->back()
            ->with('warning', $this->message);
    }
}
