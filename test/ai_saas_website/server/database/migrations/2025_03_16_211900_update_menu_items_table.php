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
        Schema::table('menu_items', function (Blueprint $table) {
            $table->string('icon_name')->nullable()->after('icon');
            $table->string('icon_library')->nullable()->after('icon_name');
            $table->string('color')->nullable()->after('icon_library');
            $table->string('roles')->nullable()->after('color');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('menu_items', function (Blueprint $table) {
            $table->dropColumn('icon_name');
            $table->dropColumn('icon_library');
            $table->dropColumn('color');
            $table->dropColumn('roles');
        });
    }
};
