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
        Schema::create('ai_projects', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->enum('status', ['active', 'completed', 'pending'])->default('pending');
            $table->string('type');
            $table->integer('progress')->nullable();
            $table->string('image_url')->nullable();
            $table->json('tags')->nullable(); // Store tags as JSON array
            $table->string('role')->nullable(); // Role associated with the project instead of user_id
            $table->timestamps();
            
            $table->index('role');
            $table->index('status');
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_projects');
    }
};
