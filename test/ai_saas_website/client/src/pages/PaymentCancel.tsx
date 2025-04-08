import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTimesCircle, FaCreditCard } from 'react-icons/fa';
import { OceanSidebar } from '@/components/OceanSidebar';

const PaymentCancel = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#051e2f] to-[#0c4c74] text-white">
      <OceanSidebar />
      
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="flex flex-col items-center justify-center h-[80vh]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-[#fa755a] text-8xl mb-6">
              <FaTimesCircle />
            </div>
            
            <h1 className="text-4xl font-bold mb-4 text-center text-[#ade8f4]">
              Payment Cancelled
            </h1>
            
            <p className="text-xl mb-8 text-center text-[#90e0ef] max-w-lg">
              Your payment process was cancelled. If you encountered any issues or have questions, please contact our support team.
            </p>
            
            <div className="flex gap-4">
              <Link 
                to="/payment" 
                className="flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <FaCreditCard className="mr-2" />
                Return to Payment
              </Link>
            </div>
            
            {/* Additional help information */}
            <div className="mt-12 px-8 py-6 bg-[#0a3a5a]/50 backdrop-blur-sm rounded-xl border border-[#0077b6]/30 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4 text-center text-[#ade8f4]">
                Need Help?
              </h3>
              <p className="text-[#90e0ef] text-center">
                If you're experiencing any issues with the payment process or have questions about our subscription plans, please reach out to our support team at{' '}
                <a href="mailto:support@aquariza.com" className="text-[#00b4d8] hover:underline">
                  support@aquariza.com
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default PaymentCancel;
