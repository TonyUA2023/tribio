@extends('errors::layout')

@section('title', '409 - Conflicto')

@section('content')
    <div class="mb-6">
        <svg class="w-24 h-24 mx-auto text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    </div>

    <h1 class="text-4xl font-bold text-gray-900 mb-4">409</h1>
    <h2 class="text-2xl font-semibold text-gray-700 mb-4">Conflicto Detectado</h2>
    <p class="text-gray-600 mb-6">
        {{ $message ?? 'Ya existe un registro con estos datos. Por favor, verifica e intenta nuevamente.' }}
    </p>
@endsection
