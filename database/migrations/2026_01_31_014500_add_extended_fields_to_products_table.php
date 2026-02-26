<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Crear tabla de categorías de productos
        Schema::create('product_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['account_id', 'slug']);
            $table->index(['account_id', 'is_active']);
        });

        // Agregar campos adicionales a productos
        Schema::table('products', function (Blueprint $table) {
            // Relación con categoría de productos
            $table->foreignId('product_category_id')
                ->nullable()
                ->after('account_id')
                ->constrained('product_categories')
                ->onDelete('set null');

            // Campos para ropa/moda
            $table->string('brand')->nullable()->after('category'); // Marca
            $table->string('gender')->nullable()->after('brand'); // Género: unisex, male, female, kids
            $table->string('sku')->nullable()->after('gender'); // Código de producto

            // Imágenes múltiples
            $table->json('images')->nullable()->after('image'); // Array de URLs de imágenes

            // Campos de variantes específicas (tallas, colores)
            $table->boolean('has_variants')->default(false)->after('options');
            $table->json('variants')->nullable()->after('has_variants'); // [{size: 'M', color: 'Rojo', stock: 5, price: null}]

            // Precio con descuento
            $table->decimal('compare_price', 10, 2)->nullable()->after('price'); // Precio "antes"

            // Peso para envío
            $table->decimal('weight', 8, 2)->nullable()->after('stock'); // en gramos

            // Índices
            $table->index('brand');
            $table->index('gender');
            $table->index('sku');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['product_category_id']);
            $table->dropColumn([
                'product_category_id',
                'brand',
                'gender',
                'sku',
                'images',
                'has_variants',
                'variants',
                'compare_price',
                'weight',
            ]);
        });

        Schema::dropIfExists('product_categories');
    }
};
