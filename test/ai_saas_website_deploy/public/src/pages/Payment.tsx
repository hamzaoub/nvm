import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCreditCard, FaCheck } from 'react-icons/fa';
import { BsLightningChargeFill } from 'react-icons/bs';
import { RiWaterFlashFill } from 'react-icons/ri';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import plansService, { Plan } from '@/services/plans';
import { OceanSidebar } from '@/components/OceanSidebar';
import LoadingIndicator from '@/components/LoadingIndicator';
import userService, { SubscriptionDetails } from '@/services/user';
import paymentService from '@/services/payment';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// No mock plans - we'll use the backend API to get plans

const PaymentForm = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get plans from the database through API
        const fetchedPlans = await plansService.getAllPlans();
        
        // If no plans are returned, show an error
        if (fetchedPlans.length === 0) {
          toast.error('No subscription plans available');
        }
        setPlans(fetchedPlans);

        // Get user's current subscription
        try {
          const subscription = await userService.getSubscription();
          setCurrentSubscription(subscription);
        } catch (error) {
          console.error('Error fetching subscription:', error);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
        toast.error('Failed to load subscription plans. Please try again later.');
        // Set plans to empty array to handle the error state in UI
        setPlans([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    // Cleanup function to reset any pending states when component unmounts
    return () => {
      if (processingPayment) {
        setProcessingPayment(false);
      }
    };
  }, [processingPayment]);

  const handleSelectPlan = async (plan: Plan) => {
    setSelectedPlan(plan);
    setError(null);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlan) {
      toast.error('Please select a plan to subscribe');
      return;
    }

    // Set processing payment state
    setProcessingPayment(true);
    setError(null);
    
    try {
      // Create a checkout session
      const session = await paymentService.createCheckoutSession(selectedPlan.id, billingCycle);
      
      // Redirect to Stripe Checkout
      window.location.href = session.url;
      
    } catch (err) {
      console.error('Error creating checkout session:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to redirect to payment page';
      setError(errorMessage);
      toast.error(errorMessage || 'Payment processing failed. Please try again.');
      setProcessingPayment(false); // Make sure to reset processing state on error
    } finally {
      // Ensure processing state is reset if the try/catch block doesn't handle all cases
      if (processingPayment) {
        setProcessingPayment(false);
      }
    }
  };


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price % 1 === 0 ? 0 : 2
    }).format(price);
  };

  const getDiscount = (monthlyPrice: number, yearlyPrice: number) => {
    if (!yearlyPrice) return 0;
    const annualMonthly = monthlyPrice * 12;
    const discount = ((annualMonthly - yearlyPrice) / annualMonthly) * 100;
    return Math.round(discount);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <OceanSidebar />
        <div className="flex-1 flex items-center justify-center p-6">
          <LoadingIndicator />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#051e2f]">
      <OceanSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          {/* Header with ocean-themed design */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Dive Deeper with Premium Plans</h1>
            <p className="text-xl text-[#90e0ef] max-w-3xl mx-auto">
              Explore the depths of AI creation with our subscription plans. More credits, more features, more possibilities.
            </p>
            
            {/* Current Subscription Alert */}
            {currentSubscription && (
              <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-[#0a3a5a] to-[#0c4c74] border border-[#0077b6]/50 max-w-2xl mx-auto">
                <div className="flex items-center text-white">
                  <RiWaterFlashFill className="text-[#00b4d8] text-xl mr-2" />
                  <span>
                    You're currently on the <span className="font-semibold text-[#00b4d8]">{currentSubscription.planName}</span> plan.
                    {currentSubscription.daysUntilRenewal > 0 && (
                      <span className="ml-1">Renews in {currentSubscription.daysUntilRenewal} days.</span>
                    )}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
          
          {/* Billing cycle toggle */}
          <div className="flex justify-center mb-10">
            <div className="bg-[#0a3a5a]/50 backdrop-blur-sm p-1 rounded-lg border border-[#0077b6]/30">
              <div className="flex">
                <button 
                  className={`px-5 py-2 rounded-md font-medium transition-all duration-300 ${
                    billingCycle === 'monthly' 
                      ? 'bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white shadow-lg' 
                      : 'text-[#ade8f4] hover:text-white'
                  }`}
                  onClick={() => setBillingCycle('monthly')}
                >
                  Monthly
                </button>
                <button 
                  className={`px-5 py-2 rounded-md font-medium transition-all duration-300 ${
                    billingCycle === 'yearly' 
                      ? 'bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white shadow-lg' 
                      : 'text-[#ade8f4] hover:text-white'
                  }`}
                  onClick={() => setBillingCycle('yearly')}
                >
                  Yearly
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-[#00b4d8]/20 text-[#00b4d8]">
                    Save up to 20%
                  </span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {plans.map((plan) => {
              const isSelected = selectedPlan?.id === plan.id;
              const price = billingCycle === 'yearly' && plan.pricePerYear ? plan.pricePerYear / 12 : plan.pricePerMonth;
              const totalPrice = billingCycle === 'yearly' && plan.pricePerYear ? plan.pricePerYear : plan.pricePerMonth * 12;
              const discount = plan.pricePerYear ? getDiscount(plan.pricePerMonth, plan.pricePerYear) : 0;
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: plan.id * 0.1 }}
                  className={`relative overflow-hidden rounded-xl backdrop-blur-sm border transition-all duration-300 ${
                    isSelected 
                      ? 'border-[#00b4d8] bg-[#0c4c74]/80 shadow-lg shadow-[#00b4d8]/20 transform scale-105 z-10' 
                      : 'border-[#0077b6]/30 bg-[#0a3a5a]/30 hover:border-[#0077b6] hover:bg-[#0a3a5a]/50'
                  }`}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white text-xs font-semibold px-3 py-1 rounded-bl-lg shadow-md">
                        Most Popular
                      </div>
                    </div>
                  )}
                  
                  {/* Plan header */}
                  <div className={`p-6 border-b ${
                    isSelected ? 'border-[#00b4d8]/30' : 'border-[#0077b6]/20'
                  }`}>
                    <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-[#ade8f4] mb-4">{plan.description}</p>
                    
                    <div className="mt-4">
                      <div className="flex items-baseline">
                        <span className="text-white text-3xl font-bold">{formatPrice(price)}</span>
                        <span className="text-[#90e0ef] ml-1">/month</span>
                      </div>
                      
                      {billingCycle === 'yearly' && plan.pricePerYear && (
                        <div className="mt-1 flex items-center">
                          <span className="text-[#ade8f4] text-sm">
                            {formatPrice(totalPrice)} billed annually
                          </span>
                          {discount > 0 && (
                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-[#00b4d8]/20 text-[#00b4d8]">
                              Save {discount}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Plan features */}
                  <div className="p-6">
                    <div className="mb-4 flex items-center">
                      <BsLightningChargeFill className="text-[#00b4d8] mr-2" />
                      <span className="text-white font-semibold">{plan.credits.toLocaleString()} AI Credits</span>
                    </div>
                    
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <FaCheck className="text-[#00b4d8] mt-1 mr-2 flex-shrink-0" />
                          <span className="text-[#ade8f4]">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0077b6] to-[#00b4d8]"></div>
                  )}
                </motion.div>
              );
            })}
          </div>
          
          {/* Payment Submit Section */}
          {selectedPlan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-8 max-w-2xl mx-auto bg-[#0a3a5a]/50 backdrop-blur-sm rounded-xl border border-[#0077b6]/30 p-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Review Your Plan</h3>
              <div className="mb-6 text-center">
                <div className="text-[#ade8f4] text-lg mb-2">{selectedPlan.name}</div>
                <div className="text-[#90e0ef] mb-4">{selectedPlan.description}</div>
                <div className="text-[#ade8f4] text-2xl font-semibold">
                  {formatPrice(billingCycle === 'yearly' && selectedPlan.pricePerYear ? selectedPlan.pricePerYear : selectedPlan.pricePerMonth * (billingCycle === 'yearly' ? 12 : 1))}
                  <span className="text-sm text-[#90e0ef] ml-1">{billingCycle === 'yearly' ? '/year' : '/month'}</span>
                </div>
              </div>
              
              {error && (
                <div className="mb-4 text-red-400 text-sm text-center">{error}</div>
              )}
              
              <div className="mt-6 flex justify-center">
                <motion.button
                  onClick={handleSubscribe}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="flex items-center px-8 py-4 rounded-lg bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white font-medium shadow-lg shadow-[#00b4d8]/20 hover:shadow-xl hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300"
                  disabled={processingPayment || !selectedPlan}
                >
                  {processingPayment ? (
                    <>
                      <div className="mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Redirecting to payment...
                    </>
                  ) : (
                    <>
                      <FaCreditCard className="mr-2" />
                      Proceed to Payment
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
          
          {/* Action section - Only show if no plan is selected */}
          {!selectedPlan && (
            <div className="flex justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-center text-[#ade8f4] p-4"
              >
                Please select a plan to proceed with payment
              </motion.div>
            </div>
          )}
          
          {/* Additional information */}
          <div className="mt-12 bg-[#0a3a5a]/30 backdrop-blur-sm rounded-xl border border-[#0077b6]/30 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">About AI Credits</h3>
            <p className="text-[#ade8f4] mb-4">
              AI Credits power all operations in the platform. Different operations consume different amounts of credits based on complexity.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#051e2f]/80 p-4 rounded-lg border border-[#0077b6]/20">
                <h4 className="text-white font-medium mb-2">Text Operations</h4>
                <p className="text-[#90e0ef] text-sm">1-5 credits per operation depending on length and complexity.</p>
              </div>
              <div className="bg-[#051e2f]/80 p-4 rounded-lg border border-[#0077b6]/20">
                <h4 className="text-white font-medium mb-2">Image Generation</h4>
                <p className="text-[#90e0ef] text-sm">10-30 credits per image depending on size and quality.</p>
              </div>
              <div className="bg-[#051e2f]/80 p-4 rounded-lg border border-[#0077b6]/20">
                <h4 className="text-white font-medium mb-2">Model Training</h4>
                <p className="text-[#90e0ef] text-sm">50-200 credits depending on dataset size and complexity.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Payment = () => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm />
    </Elements>
  );
};

export default Payment;
