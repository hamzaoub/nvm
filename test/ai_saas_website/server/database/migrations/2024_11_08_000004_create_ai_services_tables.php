<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('ai_service_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
            $table->index('id');
        });

        Schema::create('ai_services', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description');
            $table->string('endpoint');
            $table->integer('cost');
            $table->foreignId('category_id')->constrained('ai_service_categories')->onDelete('cascade');
            $table->timestamps();
            $table->index('name');
            $table->index('category_id');
        });

        Schema::create('ai_service_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('service_id')->nullable()->constrained('ai_services')->onDelete('set null');
            $table->text('request_parameters');
            $table->text('response_data');
            $table->timestamps();
            $table->index('user_id');
            $table->index('service_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('ai_service_logs');
        Schema::dropIfExists('ai_services');
        Schema::dropIfExists('ai_service_categories');
    }
}; 