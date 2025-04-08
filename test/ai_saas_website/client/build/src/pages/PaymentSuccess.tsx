import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaHome } from 'react-icons/fa';
import { toast } from 'sonner';
import { OceanSidebar } from '@/components/OceanSidebar';
import LoadingIndicator from '@/components/LoadingIndicator';
import paymentService, { SessionVerificationResponse } from '@/services/payment';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<SessionVerificationResponse['subscription']>();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError('No session ID found. Payment verification failed.');
        setIsLoading(false);
        return;
      }

      try {
        // Verify the checkout session with the backend
        const response = await paymentService.verifyCheckoutSession(sessionId);
        
        if (response.success) {
          setSubscriptionData(response.subscription);
          toast.success('Payment confirmed!');
        } else {
          setError(response.message || 'Verification failed');
          toast.error(response.message || 'Verification failed');
        }
        
        setIsLoading(false);
        
      } catch (err) {
        console.error('Error verifying payment session:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to verify payment session';
        setError(errorMessage);
        toast.error(errorMessage);
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#051e2f] to-[#0c4c74] text-white">
      <OceanSidebar />
      
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[80vh]">
              <LoadingIndicator />
              <p className="mt-4 text-lg text-[#ade8f4]">Verifying your payment...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-[80vh]">
              <div className="mb-6 text-red-400 text-xl">
                <div className="text-center">❌ Payment Verification Failed</div>
                <div className="text-center mt-2 text-lg">{error}</div>
              </div>
              <Link 
                to="/payment" 
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Return to Payment Page
              </Link>
            </div>
          ) : (
            <motion.div 
              className="flex flex-col items-center justify-center h-[80vh]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-[#00b4d8] text-8xl mb-6">
                <FaCheckCircle />
              </div>
              
              <h1 className="text-4xl font-bold mb-4 text-center text-[#ade8f4]">
                Payment Successful!
              </h1>
              
              <p className="text-xl mb-8 text-center text-[#90e0ef] max-w-lg">
                Thank you for your subscription. Your account has been upgraded successfully.
              </p>
              
              <div className="flex gap-4">
                <Link 
                  to="/dashboard" 
                  className="flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <FaHome className="mr-2" />
                  Go to Dashboard
                </Link>
              </div>
              
              {/* Success details */}
              <div className="mt-12 px-8 py-6 bg-[#0a3a5a]/50 backdrop-blur-sm rounded-xl border border-[#0077b6]/30 w-full max-w-md">
                <h3 className="text-xl font-semibold mb-4 text-center text-[#ade8f4]">
                  Transaction Details
                </h3>
                <div className="space-y-3 text-[#90e0ef]">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium text-[#00b4d8]">Completed</span>
                  </div>
                  {subscriptionData && (
                    <div className="flex justify-between">
                      <span>Plan:</span>
                      <span className="font-medium text-[#00b4d8]">{subscriptionData.plan_name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span className="font-mono text-sm truncate max-w-[200px]" title={sessionId || ''}>
                      {sessionId ? sessionId.slice(0, 16) + '...' : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccess;
