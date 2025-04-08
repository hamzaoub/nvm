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
        Schema::table('transactions', function (Blueprint $table) {
            // Add Stripe-related columns
            $table->string('stripe_payment_intent_id')->nullable()->after('amount');
                $table->string('stripe_subscription_id')->nullable()->after('stripe_payment_intent_id');
                $table->string('status')->nullable()->after('stripe_subscription_id');

            // Add indexes for new columns
            $table->index('stripe_payment_intent_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['stripe_payment_intent_id']);
            $table->dropIndex(['status']);

            $table->dropColumn([
                'stripe_payment_intent_id',
                'stripe_subscription_id',
                'status'
            ]);
        });
    }
};
