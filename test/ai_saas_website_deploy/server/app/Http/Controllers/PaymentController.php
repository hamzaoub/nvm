<?php

namespace App\Http\Controllers;

use App\Models\Coin;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Models\Transaction;
use Carbon\Carbon;
use Exception;
use Illuminate\Routing\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\ApiErrorException;
use Stripe\StripeClient;
use Stripe\Webhook;

class PaymentController extends Controller
{
    protected $stripe;

    /**
     * Create a new controller instance.
     */
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['handleWebhook']);
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }

    /**
     * Handle Stripe webhooks for payment processing
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = config('services.stripe.webhook_secret');

        try {
            if ($endpointSecret) {
                $event = Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
            } else {
                // For local testing without a webhook signature
                $event = json_decode($payload, true);
                $event = json_decode(json_encode($event));
            }
        } catch (\UnexpectedValueException $e) {
            // Invalid payload
            Log::error('Webhook Error: Invalid payload - ' . $e->getMessage());
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            // Invalid signature
            Log::error('Webhook Error: Invalid signature - ' . $e->getMessage());
            return response()->json(['error' => 'Invalid signature'], 400);
        } catch (\Exception $e) {
            Log::error('Webhook error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        }

        if (isset($event->type)) {
            // Log the event type for debugging
            Log::info('Received webhook event', [
                'event_type' => $event->type,
                'event_id' => $event->id ?? 'unknown'
            ]);

            // Handle the event
            switch ($event->type) {
                case 'checkout.session.completed':
                    $this->handleCheckoutSessionCompleted($event->data->object);
                    break;
                case 'payment_intent.succeeded':
                    $this->handlePaymentIntentSucceeded($event->data->object);
                    break;
                case 'payment_intent.payment_failed':
                    $this->handlePaymentIntentFailed($event->data->object);
                    break;
                case 'invoice.payment_succeeded':
                case 'invoice.paid':
                    $this->handleInvoicePaymentSucceeded($event->data->object);
                    break;
                case 'invoice.payment_failed':
                    $this->handleInvoicePaymentFailed($event->data->object);
                    break;
                case 'customer.subscription.deleted':
                    $this->handleSubscriptionCanceled($event->data->object);
                    break;
                case 'customer.subscription.updated':
                    $this->handleSubscriptionUpdated($event->data->object);
                    break;
                default:
                    Log::info('Unhandled event type', [
                        'type' => $event->type,
                        'event_id' => $event->id ?? 'unknown',
                        'data_available' => isset($event->data) ? 'yes' : 'no'
                    ]);
            }
        }

        return response()->json([
            'status' => 'success',
            'received_at' => now()->toIso8601String(),
            'message' => 'Webhook received and processed successfully'
        ]);
    }

    /**
     * Handle payment intent succeeded event
     *
     * @param object $paymentIntent
     * @return void
     */
    /**
     * Record a transaction in the database
     *
     * @param int $userId
     * @param int|null $planId
     * @param string $transactionType
     * @param int $amount
     * @param string $stripeId
     * @param string $status
     * @param int|null $serviceId
     * @return Transaction
     */
    protected function recordTransaction($userId, $planId, $transactionType, $amount, $stripeId,$stripeSubscription, $status = 'completed', $serviceId = null, $paymentIntent = null)
    {
        // Log attempt to create transaction
        Log::info('Attempting to create transaction record', [
            'user_id' => $userId,
            'plan_id' => $planId,
            'service_id' => $serviceId,
            'transaction_type' => $transactionType,
            'amount' => $amount,
            'stripe_id' => $stripeId,
            'status' => $status
        ]);

        try {
            // Create transaction record with all available fields
            $transaction = Transaction::create([
                'user_id' => $userId,
                'plan_id' => $planId,
                'service_id' => $serviceId,
                'transaction_type' => $transactionType,
                'amount' => $amount,
                'stripe_payment_intent_id' => $stripeId,
                'stripe_subscription_id' => $stripeSubscription,
                'status' => $status,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            Log::info('Transaction record created successfully', ['transaction_id' => $transaction->id]);
            return $transaction;
        } catch (\Exception $e) {
            Log::error('Error creating transaction record: ' . $e->getMessage(), [
                'error' => $e->getMessage(),
                'transaction_type' => $transactionType
            ]);
            return null;
        }
    }



    /**
     * Find or update subscription for a user
     *
     * @param int $userId
     * @param int $planId
     * @param string $endDate
     * @param string $stripeId
     * @param array $additionalData
     * @return Subscription
     */
    protected function updateUserSubscription($userId, $planId, $endDate, $stripeId, $additionalData = [])
    {
        // First, check if a subscription with the specific stripe_id already exists
        $subscription = Subscription::where('stripe_id', $stripeId)->first();

        // If no subscription with this stripe_id exists, look for any subscription for this user
        if (!$subscription) {
            $subscription = Subscription::where('user_id', $userId)->first();
        }

        $data = array_merge([
            'plan_id' => $planId,
            'ends_at' => $endDate,
            'stripe_id' => $stripeId,
            'stripe_status' => 'active',
            'status' => 'active'
        ], $additionalData);

        if ($subscription) {
            // Update existing subscription
            $subscription->update($data);
            Log::info("Updated existing subscription", ['id' => $subscription->id, 'stripe_id' => $stripeId]);
        } else {
            // Create new subscription
            $data['user_id'] = $userId;
            $subscription = Subscription::create($data);
            Log::info("Created new subscription", ['id' => $subscription->id, 'stripe_id' => $stripeId]);
        }

        return $subscription;
    }

    /**
     * Update user's coin balance
     *
     * @param int $userId
     * @param int $coinAmount
     * @param bool $addToExisting
     * @return Coin
     */
    protected function updateUserCoins($userId, $coinAmount, $addToExisting = true)
    {
        $coinAccount = Coin::firstOrNew(['user_id' => $userId]);

        if ($addToExisting) {
            $coinAccount->coin_balance += $coinAmount;
        } else {
            $coinAccount->coin_balance = $coinAmount;
        }

        $coinAccount->last_refresh_at = now();
        $coinAccount->save();

        return $coinAccount;
    }

    /**
     * Calculate subscription end date based on duration
     *
     * @param string $duration
     * @return Carbon
     */
    protected function calculateEndDate($duration)
    {
        return ($duration === 'yearly' || $duration === 'year')
            ? now()->addYear()
            : now()->addMonth();
    }

    /**
     * Handle payment intent succeeded event
     *
     * @param object $paymentIntent
     * @return void
     */
    protected function handlePaymentIntentSucceeded($paymentIntent)
    {
        // Log the received payment intent details
        Log::info('Payment intent succeeded:', [
            'id' => $paymentIntent->id,
            'metadata' => $paymentIntent->metadata ?? 'No metadata'
        ]);

        // Extract metadata safely
        $userId = $paymentIntent->metadata->user_id ?? null;
        $planId = $paymentIntent->metadata->plan_id ?? null;
        $transactionType = $paymentIntent->metadata->transaction_type ?? 'plan_purchase';
        $duration = $paymentIntent->metadata->duration ?? null;

        // If metadata is missing, log an error and return
        if (!$userId || !$planId) {
            Log::error("Webhook error: Missing metadata in payment intent {$paymentIntent->id}. Metadata received:", [
                'metadata' => $paymentIntent->metadata
            ]);
            return;
        }

        Log::info("Processing payment for user ID: {$userId}, Plan ID: {$planId}");

        // Start a database transaction
        DB::beginTransaction();

        try {
            // Fetch user and plan
            $user = User::find($userId);
            $plan = Plan::find($planId);

            // Validate user and plan existence
            if (!$user || !$plan) {
                throw new \Exception("User or plan not found. User ID: {$userId}, Plan ID: {$planId}");
            }

            // Record the successful transaction
            $serviceId = $paymentIntent->metadata->service_id ?? null;

            $this->recordTransaction(
                $userId,
                $planId,
                $transactionType,
                $paymentIntent->amount,
                $paymentIntent->id,
                $paymentIntent->subscription,
                'completed',
                $serviceId,
                $paymentIntent
            );

            // Calculate end date and update subscription
            $endDate = $this->calculateEndDate($duration);
            $this->updateUserSubscription($userId, $planId, $endDate, $paymentIntent->id);

            // Update user's coins
            $this->updateUserCoins($userId, $plan->coin_balance);

            // Commit the transaction
            DB::commit();

            Log::info("✅ Payment processed successfully for user ID: {$userId}, Plan: {$plan->name}");

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("❌ Error processing payment for PaymentIntent {$paymentIntent->id}: " . $e->getMessage());
        }
    }


    /**
     * Handle payment intent failed event
     *
     * @param object $paymentIntent
     * @return void
     */
    /**
     * Handle payment intent failed event
     *
     * @param object $paymentIntent
     * @return void
     */
    protected function handlePaymentIntentFailed($paymentIntent)
    {
        Log::info('Payment intent failed: ' . $paymentIntent->id);

        $userId = $paymentIntent->metadata->user_id ?? null;
        $planId = $paymentIntent->metadata->plan_id ?? null;
        $transactionType = $paymentIntent->metadata->transaction_type ?? 'plan_purchase';

        if ($userId) {
            // Record the failed transaction
            $paymentMethodId = $this->getPaymentMethodId($paymentIntent);
            $serviceId = $paymentIntent->metadata->service_id ?? null;

            Log::info('Recording failed payment transaction', [
                'payment_intent_id' => $paymentIntent->id,
                'user_id' => $userId,
                'plan_id' => $planId,
                'payment_method_id' => $paymentMethodId
            ]);

            $this->recordTransaction(
                $userId,
                $planId,
                $transactionType,
                $paymentIntent->amount,
                $paymentIntent->id,
                $paymentIntent->subscription,
                'failed',
                $serviceId,
                $paymentIntent
            );
        }
    }

    /**
     * Handle invoice payment succeeded event
     *
     * @param object $invoice
     * @return void
     */
    protected function handleInvoicePaymentSucceeded($invoice)
    {
        Log::info('Invoice payment succeeded: ' . $invoice->id);

        // Get the subscription from the invoice
        $subscriptionId = $invoice->subscription ?? null;

        if ($subscriptionId) {
            try {
                $stripeSubscription = $this->stripe->subscriptions->retrieve($subscriptionId);
                $userId = $stripeSubscription->metadata->user_id ?? null;
                $planId = $stripeSubscription->metadata->plan_id ?? null;

                if ($userId && $planId) {
                    // Record the invoice payment transaction directly
                    $paymentMethodId = $invoice->payment_intent ? $this->getPaymentMethodId($invoice->payment_intent) : null;
                    $serviceId = $invoice->metadata->service_id ?? null;

                    $this->recordTransaction(
                        $userId,
                        $planId,
                        'invoice_payment_succeeded',
                        $invoice->amount_paid,
                        $invoice->id,
                        $invoice->subscription,
                        'completed',
                        $serviceId,
                        $invoice->payment_intent
                    );

                    // Then process the subscription renewal
                    $this->processSubscriptionRenewal($userId, $planId, $stripeSubscription);
                }
            } catch (\Exception $e) {
                Log::error('Error processing invoice payment: ' . $e->getMessage());
            }
        }
    }

    /**
     * Handle invoice payment failed event
     *
     * @param object $invoice
     * @return void
     */
    protected function handleInvoicePaymentFailed($invoice)
    {
        Log::info('Invoice payment failed: ' . $invoice->id);

        // Get the subscription from the invoice
        $subscriptionId = $invoice->subscription ?? null;

        if ($subscriptionId) {
            try {
                $stripeSubscription = $this->stripe->subscriptions->retrieve($subscriptionId);
                $userId = $stripeSubscription->metadata->user_id ?? null;
                $planId = $stripeSubscription->metadata->plan_id ?? null;

                if ($userId) {
                    // Update subscription status to reflect the payment failure
                    $subscription = Subscription::where('user_id', $userId)
                        ->where('stripe_id', $subscriptionId)
                        ->first();

                    if ($subscription) {
                        $subscription->stripe_status = 'past_due';
                        $subscription->save();

                        // Record the failed payment transaction
                        $paymentMethodId = $invoice->payment_intent ? $this->getPaymentMethodId($invoice->payment_intent) : null;
                        $serviceId = $invoice->metadata->service_id ?? null;

                        $this->recordTransaction(
                            $userId,
                            $planId ?? $subscription->plan_id,
                            'invoice_payment_failed',
                            $invoice->amount_due,
                            $invoice->id,
                            $invoice->subscription,
                            'failed',
                            $serviceId,
                            $paymentMethodId
                        );
                    }
                }
            } catch (\Exception $e) {
                Log::error('Error processing invoice payment failure: ' . $e->getMessage());
            }
        }
    }

    /**
     * Process subscription renewal
     *
     * @param int $userId
     * @param int $planId
     * @param object $stripeSubscription
     * @return void
     */
    /**
     * Process subscription renewal
     *
     * @param int $userId
     * @param int $planId
     * @param object $stripeSubscription
     * @return void
     */
    protected function processSubscriptionRenewal($userId, $planId, $stripeSubscription)
    {
        DB::beginTransaction();

        try {
            $user = User::findOrFail($userId);
            $plan = Plan::findOrFail($planId);



            // Record the transaction
            $this->recordTransaction(
                $userId,
                $planId,
                'plan_renewal',
                $stripeSubscription->items->data[0]->price->unit_amount,
                $stripeSubscription->latest_invoice,
                $stripeSubscription->id,
                'completed',
                null,
                null
            );

            // Update subscription end date
            $interval = $stripeSubscription->items->data[0]->price->recurring->interval;
            $endDate = $this->calculateEndDate($interval);

            // Find subscription by both user_id and stripe_id for better accuracy during renewal
            $subscription = Subscription::where('user_id', $userId)
                ->where('stripe_id', $stripeSubscription->id)
                ->first();

            if ($subscription) {
                $subscription->update([
                    'ends_at' => $endDate,
                    'stripe_status' => 'active'
                ]);
            } else {
                // Create new subscription record if it doesn't exist
                $this->updateUserSubscription($userId, $planId, $endDate, $stripeSubscription->id);
            }

            // Refresh user's coins (set directly, don't add to existing)
            $this->updateUserCoins($userId, $plan->coin_balance, false);

            DB::commit();

            Log::info("Subscription renewed successfully for user ID: {$userId}, Plan: {$plan->name}");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error processing subscription renewal: ' . $e->getMessage());
        }
    }

    /**
     * Get current user's active subscription
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSubscription()
    {
        $user = Auth::user();
        $subscription = $user->subscription;

        if (!$subscription) {
            return response()->json([
                'status' => 'not_subscribed',
                'message' => 'No active subscription found.'
            ]);
        }

        return response()->json([
            'status' => 'active',
            'plan_id' => $subscription->plan_id,
            'plan_name' => $subscription->plan->name,
            'start_date' => $subscription->created_at,
            'end_date' => $subscription->ends_at,
            'stripe_id' => $subscription->stripe_id,
            'stripe_status' => $subscription->stripe_status
        ]);
    }

    /**
     * Create a payment intent for Stripe checkout
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createPaymentIntent(Request $request)
{
    try {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
        ]);

        $user = Auth::user();
        $plan = Plan::findOrFail($request->plan_id);

        // 🛑 Debugging Log: Check if user_id and plan_id are set
        Log::info('Creating PaymentIntent', [
            'user_id' => $user->id ?? 'MISSING',
            'plan_id' => $plan->id ?? 'MISSING'
        ]);

        // Create PaymentIntent with metadata
        $paymentIntent = $this->stripe->paymentIntents->create([
            'amount' => (int)($plan->price * 100), // Convert to cents
            'currency' => 'usd',
            'metadata' => [
                'user_id' => strval($user->id),   // Convert to string
                'plan_id' => strval($plan->id),
                'duration' => strval($plan->duration),
                'transaction_type' => 'plan_purchase'
            ],
            'receipt_email' => $user->email,
            'description' => "Subscription to {$plan->name} ({$plan->duration})"
        ]);

        // 🛑 Debugging Log: Confirm metadata in PaymentIntent
        Log::info('Created PaymentIntent', [
            'id' => $paymentIntent->id,
            'metadata' => $paymentIntent->metadata
        ]);

        return response()->json([
            'clientSecret' => $paymentIntent->client_secret,
            'amount' => $plan->price,
            'currency' => 'usd',
            'plan' => $plan->name
        ]);

    } catch (ApiErrorException $e) {
        Log::error('Stripe API Error: ' . $e->getMessage());
        return response()->json(['error' => 'Payment processing failed. Please try again.'], 500);
    } catch (Exception $e) {
        Log::error('Subscription Error: ' . $e->getMessage());
        return response()->json(['error' => 'There was an error processing your request.'], 500);
    }
}




    /**
     * Create a subscription for the user
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createSubscription(Request $request)
    {
        try {
            $request->validate([
                'plan_id' => 'required|exists:plans,id',
            ]);

            $user = Auth::user();
            $plan = Plan::findOrFail($request->plan_id);

            // Start a database transaction for atomicity
            DB::beginTransaction();

            try {
                // Check if user already has a subscription
                $existingSubscription = $user->subscription;
                if ($existingSubscription) {
                    // Cancel existing subscription in Stripe if it exists
                    if ($existingSubscription->stripe_id) {
                        try {
                            $this->stripe->subscriptions->cancel($existingSubscription->stripe_id);
                        } catch (ApiErrorException $e) {
                            Log::warning('Failed to cancel existing Stripe subscription: ' . $e->getMessage());
                        }
                    }

                    // We don't mark it as ended anymore since we'll be updating it
                    // Instead, we keep the subscription record but update its status later
                }

                // Create a Stripe customer or retrieve existing one
                if (!$user->stripe_id) {
                    $customer = $this->stripe->customers->create([
                        'email' => $user->email,
                        'name' => $user->name,
                        'metadata' => [
                            'user_id' => $user->id
                        ]
                    ]);

                    // Store Stripe customer ID with user
                    $user->stripe_id = $customer->id;
                    $user->save();
                } else {
                    $customer = $this->stripe->customers->retrieve($user->stripe_id);
                }



                // Calculate subscription end date based on duration
                $endDate = $plan->duration === 'yearly' ? now()->addYear() : now()->addMonth();

                // Create subscription in Stripe
                $stripeSubscription = $this->stripe->subscriptions->create([
                    'customer' => $user->stripe_id,
                    'items' => [[
                        'price_data' => [
                            'unit_amount' => (int)($plan->price * 100), // Convert to cents
                            'currency' => 'usd',
                            'product_data' => [
                                'name' => $plan->name . ' (' . $plan->duration . ')',
                            ],
                            'recurring' => [
                                'interval' => $plan->duration === 'yearly' ? 'year' : 'month',
                            ],
                        ],
                    ]],
                    'metadata' => [
                        'user_id' => $user->id,
                        'plan_id' => $plan->id,
                    ],
                ]);

                // Update or create subscription
                $subscription = $this->updateUserSubscription(
                    $user->id,
                    $plan->id,
                    $endDate,
                    $stripeSubscription->id,
                    [
                        'stripe_status' => $stripeSubscription->status,
                        'stripe_price' => $plan->price,
                        'starts_at' => now()
                    ]
                );

                // Update user's coin balance based on the plan
                $coin = $this->updateUserCoins($user->id, $plan->coin_balance);

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Subscription created successfully',
                    'subscription_id' => $subscription->id,
                    'stripe_subscription_id' => $stripeSubscription->id,
                    'coins_added' => $plan->coin_balance,
                    'total_coins' => $coin->coin_balance,
                ]);

            } catch (Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (ApiErrorException $e) {
            Log::error('Stripe API Error: ' . $e->getMessage());
            return response()->json(['error' => 'Payment processing failed: ' . $e->getMessage()], 500);
        } catch (Exception $e) {
            Log::error('Subscription Error: ' . $e->getMessage());
            return response()->json(['error' => 'There was an error processing your subscription: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Cancel the user's subscription
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function cancelSubscription()
    {
        try {
            $user = Auth::user();
            $subscription = $user->subscription;

            if (!$subscription) {
                return response()->json(['error' => 'No active subscription found.'], 404);
            }

            // Cancel the subscription in Stripe
            if ($subscription->stripe_id) {
                try {
                    $this->stripe->subscriptions->cancel($subscription->stripe_id);
                } catch (ApiErrorException $e) {
                    Log::warning('Failed to cancel Stripe subscription: ' . $e->getMessage());
                }
            }

            // Update the subscription in the database
            $subscription->update([
                'stripe_status' => 'canceled',
                'ends_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Subscription canceled successfully.',
                'ends_at' => $subscription->ends_at
            ]);

        } catch (Exception $e) {
            Log::error('Cancel Subscription Error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to cancel subscription: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Create a Stripe checkout session for a plan
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createCheckoutSession(Request $request)
    {
        try {
            $request->validate([
                'plan_id' => 'required|integer|exists:plans,id',
                'billing_cycle' => 'nullable|in:monthly,yearly',
            ]);

            $user = Auth::user();
            $plan = Plan::findOrFail($request->plan_id);
            $billingCycle = $request->billing_cycle ?? 'monthly';

            // Determine price based on billing cycle
            $unitAmount = $billingCycle === 'yearly' && isset($plan->price_yearly)
                ? $plan->price_yearly * 100  // Convert to cents
                : $plan->price * 100; // Convert to cents

            // Create line items for the checkout session
            $lineItems = [[
                'price_data' => [
                    'currency' => 'usd',
                    'product_data' => [
                        'name' => $plan->name . ' (' . ucfirst($billingCycle) . ')',
                        'description' => $plan->description,
                    ],
                    'unit_amount' => (int)$unitAmount,
                    'recurring' => [
                        'interval' => $billingCycle === 'yearly' ? 'year' : 'month',
                    ],
                ],
                'quantity' => 1,
            ]];

            // Create checkout session
            // For local development, use port 5173, otherwise use the app.url from config
            $baseUrl = app()->environment('local') ? 'http://localhost:5173' : config('app.url');

            $session = $this->stripe->checkout->sessions->create([
                'payment_method_types' => ['card'],
                'line_items' => $lineItems,
                'mode' => 'subscription',
                'success_url' => $baseUrl . '/payment/success?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => $baseUrl . '/payment/cancel',
                'client_reference_id' => $user->id,
                'customer_email' => $user->email,
                'metadata' => [
                    'user_id' => $user->id,
                    'plan_id' => $plan->id,
                    'billing_cycle' => $billingCycle,
                ],
            ]);

            Log::info('Checkout session created', [
                'session_id' => $session->id,
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'billing_cycle' => $billingCycle
            ]);

            return response()->json([
                'id' => $session->id,
                'url' => $session->url,
            ]);

        } catch (\Exception $e) {
            Log::error('Error creating checkout session: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to create checkout session: ' . $e->getMessage()
            ], 500);
        }
    }

    // This is a placeholder to prevent duplication errors.
    // The actual handleWebhook method is defined at the top of the class.

    /**
     * Handle checkout.session.completed event
     *
     * @param \Stripe\Checkout\Session $session
     * @return void
     */
    protected function handleCheckoutSessionCompleted($session)
    {
        try {
            Log::info('Checkout session completed', ['session_id' => $session->id]);

            // Get metadata from the session
            $userId = $session->metadata->user_id ?? null;
            $planId = $session->metadata->plan_id ?? null;
            $billingCycle = $session->metadata->billing_cycle ?? 'monthly';

            if (!$userId || !$planId) {
                Log::error('Missing metadata in checkout session', ['session_id' => $session->id]);
                return;
            }

            // Get the user and plan
            $user = User::findOrFail($userId);
            $plan = Plan::findOrFail($planId);

            // Retrieve the subscription from Stripe
            $subscriptionId = $session->subscription;
            $stripeSubscription = $this->stripe->subscriptions->retrieve($subscriptionId);

            // Calculate end date based on billing cycle
            $endDate = $this->calculateEndDate($billingCycle);

            // Create/update subscription in our database
            $subscription = $this->updateUserSubscription(
                $user->id,
                $plan->id,
                $endDate,
                $stripeSubscription->id,
                [
                    'stripe_status' => $stripeSubscription->status,
                    'stripe_price' => $billingCycle === 'yearly' && isset($plan->price_yearly) ? $plan->price_yearly : $plan->price,
                    'starts_at' => now()
                ]
            );

            // Update user's coin balance based on the plan
            $this->updateUserCoins($user->id, $plan->coin_balance);

            // Record the transaction
            $amount = $stripeSubscription->items->data[0]->price->unit_amount ?? 0;
            $serviceId = $session->metadata->service_id ?? null;

            $this->recordTransaction(
                $user->id,
                $plan->id,
                'subscription_purchase',
                $amount,
                $session->id,
                $stripeSubscription->id,
                'completed',
                $serviceId,
                $session->payment_intent
            );

            Log::info('Subscription created successfully', [
                'user_id' => $user->id,
                'subscription_id' => $subscription->id,
                'stripe_subscription_id' => $stripeSubscription->id
            ]);

        } catch (\Exception $e) {
            Log::error('Error handling checkout session completed: ' . $e->getMessage(), [
                'session_id' => $session->id ?? 'unknown'
            ]);
        }
    }

    /**
     * Verify a checkout session (used by the frontend after redirect)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function verifyCheckoutSession(Request $request)
    {
        try {
            $sessionId = $request->query('session_id');

            if (!$sessionId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Session ID is required'
                ], 400);
            }

            // Retrieve the session from Stripe
            $session = $this->stripe->checkout->sessions->retrieve($sessionId);

            if (!$session) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid session ID'
                ], 404);
            }

            // Check if payment was successful
            if ($session->payment_status !== 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment has not been completed for this session'
                ], 400);
            }

            // Check if we have a subscription in our database
            if (isset($session->subscription)) {
                $stripeSubscriptionId = $session->subscription;
                $subscription = Subscription::where('stripe_id', $stripeSubscriptionId)->first();

                if ($subscription) {
                    $plan = Plan::find($subscription->plan_id);

                    return response()->json([
                        'success' => true,
                        'subscription' => [
                            'id' => $subscription->id,
                            'status' => $subscription->stripe_status,
                            'plan_name' => $plan ? $plan->name : 'Unknown Plan'
                        ]
                    ]);
                }
            }

            // If we get here, something went wrong with subscription creation (webhook might not have processed yet)
            return response()->json([
                'success' => true,
                'message' => 'Payment succeeded but subscription details are still being processed. Please check back in a moment.'
            ]);

        } catch (\Exception $e) {
            Log::error('Error verifying checkout session: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to verify checkout session: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle the invoice.paid webhook event
     *
     * @param \Stripe\Invoice $invoice
     */
    protected function handleInvoicePaid($invoice)
    {
        try {
            $subscriptionId = $invoice->subscription;
            if (!$subscriptionId) {
                Log::info('No subscription ID found in invoice', ['invoice_id' => $invoice->id]);
                return;
            }

            // Find the subscription in the database
            $subscription = Subscription::where('stripe_id', $subscriptionId)->first();
            if (!$subscription) {
                Log::warning('Subscription not found for ID: ' . $subscriptionId);
                return;
            }

            // Get necessary data
            $plan = $subscription->plan;
            $userId = $subscription->user_id;

            // Calculate new end date based on plan duration
            $currentEndDate = $subscription->ends_at ?? now();
            $newEndDate = $plan->duration === 'yearly'
                ? Carbon::parse($currentEndDate)->addYear()
                : Carbon::parse($currentEndDate)->addMonth();

            // Update subscription
            $subscription = $this->updateUserSubscription(
                $userId,
                $plan->id,
                $newEndDate,
                $subscriptionId,
                [
                    'stripe_status' => 'active'
                ]
            );

            // Add coins to user's balance
            $this->updateUserCoins($userId, $plan->coin_balance);

            // Record the transaction
            $paymentMethodId = $invoice->payment_intent ? $this->getPaymentMethodId($invoice->payment_intent) : null;
            $serviceId = $invoice->metadata->service_id ?? null;

            $this->recordTransaction(
                $userId,
                $plan->id,
                'plan_renewal',
                $invoice->amount_paid,
                $invoice->id,
                $subscriptionId,
                'completed',
                $serviceId,
                $invoice->payment_intent
            );

            Log::info('Invoice paid processed for subscription ID: ' . $subscriptionId);
        } catch (Exception $e) {
            Log::error('Error processing invoice.paid webhook: ' . $e->getMessage());
        }
    }

    /**
     * Handle the subscription canceled webhook event
     *
     * @param \Stripe\Subscription $stripeSubscription
     */
    protected function handleSubscriptionCanceled($stripeSubscription)
    {
        try {
            $subscriptionId = $stripeSubscription->id;

            // Find the subscription in the database
            $subscription = Subscription::where('stripe_id', $subscriptionId)->first();
            if (!$subscription) {
                Log::warning('Subscription not found for cancellation: ' . $subscriptionId);
                return;
            }

            $userId = $subscription->user_id;
            $planId = $subscription->plan_id;

            // Update subscription status
            $this->updateUserSubscription(
                $userId,
                $planId,
                now(), // Set end date to now
                $subscriptionId,
                ['stripe_status' => 'canceled']
            );

            // Record the cancellation transaction
            $latestInvoice = $stripeSubscription->latest_invoice;
            $amount = isset($stripeSubscription->plan) ? $stripeSubscription->plan->amount : 0;
            $paymentMethodId = null;

            if ($latestInvoice) {
                try {
                    $invoice = $this->stripe->invoices->retrieve($latestInvoice);
                    if (isset($invoice->payment_intent)) {
                        $paymentMethodId = $this->getPaymentMethodId($invoice->payment_intent);
                    }
                } catch (\Exception $e) {
                    Log::warning('Error retrieving invoice for canceled subscription: ' . $e->getMessage());
                }
            }

            $this->recordTransaction(
                $userId,
                $planId,
                'subscription_canceled',
                $amount,
                $subscriptionId,
                
                'completed',
                null,
                null
            );

            Log::info('Subscription canceled processed for ID: ' . $subscriptionId);
        } catch (Exception $e) {
            Log::error('Error processing subscription.deleted webhook: ' . $e->getMessage());
        }
    }

    /**
     * Handle the subscription updated webhook event
     *
     * @param \Stripe\Subscription $stripeSubscription
     */
    protected function handleSubscriptionUpdated($stripeSubscription)
    {
        try {
            $subscriptionId = $stripeSubscription->id;

            // Find the subscription in the database
            $subscription = Subscription::where('stripe_id', $subscriptionId)->first();
            if (!$subscription) {
                Log::warning('Subscription not found for update: ' . $subscriptionId);
                return;
            }

            $userId = $subscription->user_id;
            $planId = $subscription->plan_id;

            // Only record transaction if status changed
            $statusChanged = $subscription->stripe_status !== $stripeSubscription->status;

            // Update subscription status
            $this->updateUserSubscription(
                $userId,
                $planId,
                $subscription->ends_at, // Keep the same end date
                $subscriptionId,
                ['stripe_status' => $stripeSubscription->status]
            );

            // If status changed, record a transaction
            if ($statusChanged) {
                $amount = isset($stripeSubscription->plan) ? $stripeSubscription->plan->amount : 0;
                $paymentMethodId = null;

                // Try to get payment method from latest invoice
                if ($stripeSubscription->latest_invoice) {
                    try {
                        $invoice = $this->stripe->invoices->retrieve($stripeSubscription->latest_invoice);
                        if (isset($invoice->payment_intent)) {
                            $paymentMethodId = $this->getPaymentMethodId($invoice->payment_intent);
                        }
                    } catch (\Exception $e) {
                        Log::warning('Error retrieving invoice for updated subscription: ' . $e->getMessage());
                    }
                }

                $this->recordTransaction(
                    $userId,
                    $planId,
                    'subscription_updated',
                    $amount,
                    $subscriptionId,
                    'completed',
                    null,
                    null
                );
            }

            Log::info('Subscription updated processed for ID: ' . $subscriptionId);
        } catch (Exception $e) {
            Log::error('Error processing subscription.updated webhook: ' . $e->getMessage());
        }
    }
}
