<?php

namespace App\Exceptions\Custom;

use Exception;

class ValidationException extends Exception
{
    protected $errors;
    protected $message = 'Error de validación.';
    protected $code = 422;

    public function __construct(array $errors, ?string $message = null)
    {
        $this->errors = $errors;
        if ($message) {
            $this->message = $message;
        }
        parent::__construct($this->message, $this->code);
    }

    public function render()
    {
        if (request()->expectsJson()) {
            return response()->json([
                'error' => 'Validation Error',
                'message' => $this->message,
                'errors' => $this->errors,
            ], $this->code);
        }

        return redirect()->back()
            ->withErrors($this->errors)
            ->withInput();
    }

    public function getErrors(): array
    {
        return $this->errors;
    }
}
