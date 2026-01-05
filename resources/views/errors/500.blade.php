@extends('errors::layout')

@section('title', '500 - Error del Servidor')

@section('content')
    <div class="mb-6">
        <svg class="w-24 h-24 mx-auto text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    </div>

    <h1 class="text-4xl font-bold text-gray-900 mb-4">500</h1>
    <h2 class="text-2xl font-semibold text-gray-700 mb-4">Error del Servidor</h2>
    <p class="text-gray-600 mb-6">
        {{ $message ?? 'Algo salió mal en nuestro servidor. Por favor, intenta de nuevo más tarde.' }}
    </p>
@endsection
