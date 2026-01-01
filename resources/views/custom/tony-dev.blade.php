<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portafolio de {{ $profile->name }}</title>
    <link rel="icon" href="/logo/logo.ico" type="image/x-icon">
    <style>
        body { font-family: monospace; background: #222; color: #0f0; }
        .container { max-width: 800px; margin: auto; padding: 20px; }
        h1 { text-shadow: 0 0 5px #0f0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>DISEÑO 100% PERSONALIZADO (CUSTOM)</h1>
        
        <h2>> {{ $profile->name }}</h2>
        <p>> {{ $profile->title }}</p>
        
        <p>Este archivo (tony-dev.blade.php) es código único solo para este cliente.</p>
    </div>
</body>
</html>