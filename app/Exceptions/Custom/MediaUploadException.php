<?php

namespace App\Exceptions\Custom;

use Exception;

class MediaUploadException extends Exception
{
    protected $message = 'Error al subir el archivo.';
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
                'error' => 'Media Upload Error',
                'message' => $this->message,
            ], $this->code);
        }

        return redirect()->back()
            ->with('error', $this->message);
    }
}
