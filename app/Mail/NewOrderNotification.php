<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewOrderNotification extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '💰 Nuevo Pedido Recibido - ' . $this->order->customer_name,
        );
    }

    public function content(): Content
    {
        // Debes crear esta vista blade: resources/views/emails/new-order-notification.blade.php
        return new Content(
            view: 'emails.new-order-notification',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}