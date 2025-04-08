<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->text('bio')->nullable();
            $table->string('phone_number')->nullable();
            $table->string('location')->nullable();
            $table->string('website')->nullable();
            $table->json('social_media_links')->nullable();
            $table->date('birth_date')->nullable();  // Added this line

            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::create('user_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('theme_preference')->nullable();
            $table->json('notification_settings')->nullable();
            $table->string('language_preference')->nullable();
            $table->timestamps();
        });

       
    }

    public function down()
    {
        Schema::dropIfExists('user_preferences');
        Schema::dropIfExists('user_profiles');
        Schema::dropIfExists('users');
    }
}; 