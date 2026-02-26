<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],
    'brevo' => [
        // Usamos la variable que ya tienes definida en tu .env
        'key' => env('BREVO_KEY'),
        // Definimos el remitente del SMS (máx 11 caracteres)
        'sms_sender' => env('BREVO_SMS_SENDER', 'JSTACK'),
    ],

    'whatsapp' => [
        // WhatsApp Business API (Meta/Facebook)
        // Obtén estos valores desde: https://developers.facebook.com/apps/
        'access_token' => env('WHATSAPP_ACCESS_TOKEN'),
        'phone_number_id' => env('WHATSAPP_PHONE_NUMBER_ID'),
        'business_phone_number' => env('WHATSAPP_BUSINESS_PHONE_NUMBER'),
        'api_version' => env('WHATSAPP_API_VERSION', 'v21.0'),
        // Webhook verification token (para recibir mensajes entrantes)
        'webhook_verify_token' => env('WHATSAPP_WEBHOOK_VERIFY_TOKEN'),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI'),
    ],

    'ml' => [
        'url' => env('ML_API_URL', 'https://tonyua-tribio.hf.space'),
    ],

    'culqi' => [
        // Llave pública (usada en frontend para tokenizar tarjetas)
        'public_key' => env('CULQI_PUBLIC_KEY'),
        // Llave secreta (usada en backend para crear cargos)
        'secret_key' => env('CULQI_SECRET_KEY'),
        // URL base de la API
        'api_url' => 'https://api.culqi.com/v2',
        // URL para crear tokens (usa la llave pública)
        'secure_url' => 'https://secure.culqi.com/v2',
    ],

];
