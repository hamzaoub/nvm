<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop and recreate the enum with updated values
        DB::statement("ALTER TABLE transactions MODIFY COLUMN transaction_type ENUM(
            'spending', 
            'plan_purchase', 
            'plan_upgrade', 
            'subscription_purchase', 
            'plan_renewal', 
            'subscription_canceled', 
            'subscription_updated', 
            'invoice_payment_succeeded', 
            'invoice_payment_failed'
        ) NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to original enum values
        DB::statement("ALTER TABLE transactions MODIFY COLUMN transaction_type ENUM(
            'spending', 
            'plan_purchase', 
            'plan_upgrade'
        ) NOT NULL");
    }
};
