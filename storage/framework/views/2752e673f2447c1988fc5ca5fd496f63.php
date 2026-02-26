<!DOCTYPE html>
<html lang="<?php echo e(str_replace('_', '-', app()->getLocale())); ?>" class="<?php echo \Illuminate\Support\Arr::toCssClasses(['dark' => ($appearance ?? 'system') == 'dark']); ?>">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">

        
        <script>
            // Global configuration from Laravel
            window.appConfig = {
                filesystemPublicPath: '<?php echo e(env('FILESYSTEM_PUBLIC_PATH', 'storage')); ?>'
            };

            (function() {
                const appearance = '<?php echo e($appearance ?? "system"); ?>';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        
        <style>
            html {
                background-color: oklch(0.99 0 0); /* TRIBIO Light background */
            }

            html.dark {
                background-color: oklch(0.12 0 0); /* TRIBIO Dark background */
            }
        </style>

        <title inertia></title>

        
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
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600|fraunces:400,500,600,700,800,900" rel="stylesheet" />

        <?php echo app('Illuminate\Foundation\Vite')->reactRefresh(); ?>
        <?php echo app('Illuminate\Foundation\Vite')(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"]); ?>
        <?php if (!isset($__inertiaSsrDispatched)) { $__inertiaSsrDispatched = true; $__inertiaSsrResponse = app(\Inertia\Ssr\Gateway::class)->dispatch($page); }  if ($__inertiaSsrResponse) { echo $__inertiaSsrResponse->head; } ?>
    </head>
    <body class="font-sans antialiased">
        <?php if (!isset($__inertiaSsrDispatched)) { $__inertiaSsrDispatched = true; $__inertiaSsrResponse = app(\Inertia\Ssr\Gateway::class)->dispatch($page); }  if ($__inertiaSsrResponse) { echo $__inertiaSsrResponse->body; } else { ?><div id="app" data-page="<?php echo e(json_encode($page)); ?>"></div><?php } ?>
    </body>
</html>
<?php /**PATH D:\JSTACK CLIENTES\DESARROLLO SISTEMA NFC\jstackhub\resources\views/app.blade.php ENDPATH**/ ?>