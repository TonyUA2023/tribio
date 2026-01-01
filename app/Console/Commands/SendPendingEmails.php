<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\PendingEmail;
use Illuminate\Support\Facades\Mail;
use App\Mail\GenericEmail;

class SendPendingEmails extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'emails:send-pending';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Envía correos electrónicos pendientes de la cola';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Iniciando envío de correos pendientes...');

        // Obtener correos pendientes (máximo 10 por ejecución)
        $pendingEmails = PendingEmail::where('sent', false)
            ->whereNull('error')
            ->orderBy('created_at', 'asc')
            ->limit(10)
            ->get();

        if ($pendingEmails->isEmpty()) {
            $this->info('No hay correos pendientes para enviar.');
            return 0;
        }

        $sent = 0;
        $failed = 0;

        foreach ($pendingEmails as $email) {
            try {
                $this->info("Enviando correo a: {$email->to_email}");

                Mail::to($email->to_email)->send(new GenericEmail(
                    $email->subject,
                    $email->body,
                    json_decode($email->attachments, true) ?? []
                ));

                $email->sent = true;
                $email->sent_at = now();
                $email->save();

                $sent++;
                $this->info("✓ Correo enviado exitosamente");

            } catch (\Exception $e) {
                $email->error = $e->getMessage();
                $email->save();

                $failed++;
                $this->error("✗ Error al enviar correo: " . $e->getMessage());
            }
        }

        $this->info("\n=== Resumen ===");
        $this->info("Enviados: {$sent}");
        $this->info("Fallidos: {$failed}");
        $this->info("Total procesados: " . ($sent + $failed));

        return 0;
    }
}
