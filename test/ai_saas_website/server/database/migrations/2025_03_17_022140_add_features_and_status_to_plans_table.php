<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Using DB facade to run SQL directly to ensure it works with the existing schema
        // This is necessary because Schema::table sometimes has issues with constraints
        DB::statement('ALTER TABLE plans ADD COLUMN features JSON NULL AFTER coin_balance');
        DB::statement('ALTER TABLE plans ADD COLUMN status BOOLEAN DEFAULT 1 AFTER features');
        
        // No need to add unique constraint - will handle this in the seeder with updateOrCreate
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop columns if they exist
        if (Schema::hasColumn('plans', 'features')) {
            DB::statement('ALTER TABLE plans DROP COLUMN features');
        }
        
        if (Schema::hasColumn('plans', 'status')) {
            DB::statement('ALTER TABLE plans DROP COLUMN status');
        }
    }
};
