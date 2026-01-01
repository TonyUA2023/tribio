<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $profile->name }}</title>
    <link rel="icon" href="/logo/logo.ico" type="image/x-icon">
</head>
<body style="font-family: sans-serif; text-align: center;">

    <h1>Plantilla SaaS Estándar</h1>
    
    <h2>{{ $profile->name }}</h2>
    <p>{{ $profile->title }}</p>

    <hr>
    
    <h3>Datos (desde JSON):</h3>
    <p>Bio: {{ $profile->data['bio'] ?? 'Sin biografía' }}</p>

    <h3>Enlaces:</h3>
    <ul>
        @foreach ($profile->data['links'] ?? [] as $link)
            <li><a href="{{ $link['url'] }}">{{ $link['title'] }}</a></li>
        @endforeach
    </ul>

</body>
</html>