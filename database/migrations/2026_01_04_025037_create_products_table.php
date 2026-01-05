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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->string('image')->nullable();
            $table->string('category')->nullable();
            $table->boolean('available')->default(true);
            $table->boolean('featured')->default(false);
            $table->integer('stock')->nullable();
            $table->integer('sort_order')->default(0);
            $table->json('options')->nullable(); // Para variantes (tamaño, sabor, etc.)
            $table->timestamps();
            $table->softDeletes();

            $table->index(['account_id', 'category']);
            $table->index(['account_id', 'available']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
