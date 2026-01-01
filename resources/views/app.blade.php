<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(0.99 0 0); /* TRIBIO Light background */
            }

            html.dark {
                background-color: oklch(0.12 0 0); /* TRIBIO Dark background */
            }
        </style>

        <title inertia></title>

        {{-- Open Graph Meta Tags para compartir en redes sociales --}}
        <meta property="og:site_name" content="TRIBIO">
        <meta property="og:type" content="website">
        <meta property="og:locale" content="es_PE">
        <meta property="og:image" content="/logo/logo.ico">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:image" content="/logo/logo.ico">

        <link rel="icon" href="/logo/logo.ico" sizes="any">
        <link rel="icon" href="/logo/logo.ico" type="image/x-icon">
        <link rel="apple-touch-icon" href="/logo/logo.ico">
        <link rel="manifest" href="/manifest.json">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
