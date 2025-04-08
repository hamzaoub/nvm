<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('external_service_credentials', function (Blueprint $table) {
            $table->id();
            $table->string('service_name');
            $table->string('api_key')->nullable();
            $table->string('api_secret')->nullable();
            $table->string('base_url')->nullable();
            $table->string('oauth_token')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('external_service_logs', function (Blueprint $table) {
            $table->id();
            $table->string('service_name');
            $table->text('request_parameters')->nullable();
            $table->text('response_data')->nullable();
            $table->timestamps();
        });

        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('price', 10, 2);
            $table->string('description')->nullable();
            $table->string('duration')->nullable();
            $table->integer('coin_balance')->default(0);
            $table->timestamps();
        });

        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('plan_id')->constrained()->onDelete('cascade');
            $table->timestamp('start_date')->nullable();
            $table->timestamp('end_date')->nullable();
            $table->timestamps();
        });

        Schema::create('coins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('coin_balance')->default(200);
            $table->timestamps();
            $table->index('user_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('coins');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('plans');
        Schema::dropIfExists('external_service_logs');
        Schema::dropIfExists('external_service_credentials');
    }
}; 