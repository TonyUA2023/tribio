<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use App\Models\Product;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('slug')->nullable()->after('name');
        });

        // Generar slugs para productos existentes
        Product::withTrashed()->whereNull('slug')->get()->each(function ($product) {
            $base = Str::slug($product->name);
            $slug = $base;
            $i = 1;
            while (
                Product::withTrashed()
                    ->where('account_id', $product->account_id)
                    ->where('slug', $slug)
                    ->where('id', '!=', $product->id)
                    ->exists()
            ) {
                $slug = $base . '-' . $i++;
            }
            $product->updateQuietly(['slug' => $slug]);
        });

        // Ahora que todos tienen slug, agregar índice único
        Schema::table('products', function (Blueprint $table) {
            $table->index(['account_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['account_id', 'slug']);
            $table->dropColumn('slug');
        });
    }
};
