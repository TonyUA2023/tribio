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
        // Agregar parent_id a categorías para subcategorías
        if (!Schema::hasColumn('product_categories', 'parent_id')) {
            Schema::table('product_categories', function (Blueprint $table) {
                $table->foreignId('parent_id')
                    ->nullable()
                    ->after('account_id')
                    ->constrained('product_categories')
                    ->onDelete('cascade');

                // Nivel de profundidad (0 = raíz, 1 = subcategoría, etc.)
                $table->integer('depth')->default(0)->after('parent_id');
            });
        }

        // Agregar campos adicionales a productos
        Schema::table('products', function (Blueprint $table) {
            // Descripción corta (para listados)
            if (!Schema::hasColumn('products', 'short_description')) {
                $table->string('short_description', 500)->nullable()->after('description');
            }

            // Especificaciones técnicas en formato JSON
            // Formato: [{"label": "Marca", "value": "Samsung"}, {"label": "Modelo", "value": "SM-R390"}]
            if (!Schema::hasColumn('products', 'specifications')) {
                $table->json('specifications')->nullable()->after('short_description');
            }

            // Atributos de variantes disponibles para este producto
            // Formato: ["size", "color"] o ["capacity", "color"]
            if (!Schema::hasColumn('products', 'variant_attributes')) {
                $table->json('variant_attributes')->nullable()->after('variants');
            }

            // Configuración de visualización
            // Formato: {"show_gender": true, "show_brand": true, "show_sku": false}
            if (!Schema::hasColumn('products', 'display_settings')) {
                $table->json('display_settings')->nullable()->after('variant_attributes');
            }

            // Condición del producto (nuevo, usado, reacondicionado)
            if (!Schema::hasColumn('products', 'condition')) {
                $table->string('condition')->nullable()->default('new')->after('gender');
            }

            // País de origen
            if (!Schema::hasColumn('products', 'origin_country')) {
                $table->string('origin_country')->nullable()->after('condition');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $columns = ['short_description', 'specifications', 'variant_attributes', 'display_settings', 'condition', 'origin_country'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('products', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        if (Schema::hasColumn('product_categories', 'parent_id')) {
            Schema::table('product_categories', function (Blueprint $table) {
                $table->dropForeign(['parent_id']);
                $table->dropColumn(['parent_id', 'depth']);
            });
        }
    }
};
