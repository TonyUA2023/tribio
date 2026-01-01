<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class CronController extends Controller
{
    /**
     * Ejecuta el comando de envío de correos pendientes
     * Esta ruta debe ser llamada por servicios de cron externos
     */
    public function sendEmails(Request $request)
    {
        // Validar token de seguridad (opcional pero recomendado)
        $cronToken = config('app.cron_token');

        if ($cronToken && $request->input('token') !== $cronToken) {
            Log::warning('Intento de acceso no autorizado al cron de emails', [
                'ip' => $request->ip(),
                'token' => $request->input('token')
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Token no válido'
            ], 403);
        }

        try {
            Log::info('Ejecutando cron de envío de correos', [
                'triggered_by' => 'external_cron',
                'ip' => $request->ip()
            ]);

            // Ejecutar el comando artisan
            Artisan::call('emails:send-pending');
            $output = Artisan::output();

            Log::info('Cron de envío de correos completado', [
                'output' => $output
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Comando ejecutado correctamente',
                'output' => $output
            ]);

        } catch (\Exception $e) {
            Log::error('Error al ejecutar cron de emails', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al ejecutar el comando',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
