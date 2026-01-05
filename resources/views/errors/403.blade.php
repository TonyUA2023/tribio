@extends('errors::layout')

@section('title', '403 - Acceso Denegado')

@section('content')
    <div class="mb-6">
        <svg class="w-24 h-24 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
    </div>

    <h1 class="text-4xl font-bold text-gray-900 mb-4">403</h1>
    <h2 class="text-2xl font-semibold text-gray-700 mb-4">Acceso Denegado</h2>
    <p class="text-gray-600 mb-6">
        {{ $message ?? 'No tienes permisos para acceder a este recurso.' }}
    </p>
@endsection
