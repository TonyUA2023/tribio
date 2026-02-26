<?php $__env->startSection('title', '404 - No Encontrado'); ?>

<?php $__env->startSection('content'); ?>
    <div class="mb-6">
        <svg class="w-24 h-24 mx-auto text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    </div>

    <h1 class="text-4xl font-bold text-gray-900 mb-4">404</h1>
    <h2 class="text-2xl font-semibold text-gray-700 mb-4">Página No Encontrada</h2>
    <p class="text-gray-600 mb-6">
        <?php echo e($message ?? 'Lo sentimos, la página que buscas no existe.'); ?>

    </p>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('errors::layout', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH D:\JSTACK CLIENTES\DESARROLLO SISTEMA NFC\jstackhub\resources\views/errors/404.blade.php ENDPATH**/ ?>