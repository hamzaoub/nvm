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
        Schema::table('subscriptions', function (Blueprint $table) {
            // Drop existing columns we'll be replacing
            $table->dropColumn('start_date');
            $table->dropColumn('end_date');
            
            // Add new columns
            $table->string('status')->default('inactive')->after('plan_id');
            $table->timestamp('trial_ends_at')->nullable()->after('status');
            $table->timestamp('ends_at')->nullable()->after('trial_ends_at');
            $table->string('stripe_id')->nullable()->unique()->after('ends_at');
            $table->string('stripe_status')->nullable()->after('stripe_id');
            $table->string('stripe_price')->nullable()->after('stripe_status');
            $table->integer('quantity')->default(1)->after('stripe_price');
            
            // Add index
            $table->index(['user_id', 'stripe_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            // Remove new columns
            $table->dropColumn([
                'status',
                'trial_ends_at',
                'ends_at',
                'stripe_id',
                'stripe_status',
                'stripe_price',
                'quantity'
            ]);
            
            // Drop index
            $table->dropIndex(['user_id', 'stripe_status']);
            
            // Restore original columns
            $table->timestamp('start_date')->nullable();
            $table->timestamp('end_date')->nullable();
        });
    }
};
