import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { authService } from "@/services/auth";
import { FaOctopusDeploy } from "react-icons/fa";

export default function OtpVerification() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Focus the first input on component mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    
    // For testing: Get user email from session
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/auth/get-latest-otp');
        if (response.data && response.data.email) {
          setUserEmail(response.data.email);
        }
      } catch (error) {
        console.error('Failed to fetch user data', error);
      }
    };
    
    fetchUserData();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // If pasting multiple digits, distribute them across inputs
      const digits = value.split("").slice(0, 6);
      const newOtp = [...otp];
      
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      
      setOtp(newOtp);
      
      // Focus the next empty input or the last one
      const nextIndex = Math.min(index + digits.length, 5);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
    } else {
      // Handle single digit input
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to clear current input and focus previous
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      if (inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  // Verify OTP mutation
  const { mutate: verifyOtp } = useMutation({
    mutationFn: async (code: string) => {
      setIsLoading(true);
      return authService.verifyOtp(code);
    },
    onSuccess: (data) => {
      toast.success(data.message || "Email verified successfully!");
      
      // If there's a redirect in the response, use it
      if (data.redirect) {
        navigate(data.redirect);
      } else {
        // Default redirect to welcome page
        navigate("/dashboard");
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Verification failed";
      toast.error(message);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  // Get latest OTP (for testing)
  const { mutate: getLatestOtp, data: latestOtpData } = useMutation({
    mutationFn: async () => {
      return axios.get('/api/auth/get-latest-otp');
    },
    onSuccess: (response) => {
      const { code } = response.data;
      if (code) {
        // Fill the OTP inputs with the code digits
        const codeDigits = code.split('');
        setOtp(codeDigits);
        toast.success('Retrieved verification code');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to get code';
      toast.error(message);
    },
  });
  
  // Resend OTP mutation
  const { mutate: resendOtp } = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      return authService.resendOtp();
    },
    onSuccess: (data) => {
      toast.success(data.message || "Verification code resent successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Failed to resend code";
      toast.error(message);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Please enter all 6 digits of the verification code");
      return;
    }
    verifyOtp(code);
  };

  const handleResend = () => {
    resendOtp();
  };

  return (
    <div className="min-h-screen bg-[#051e2f] flex items-center justify-center p-8 relative overflow-hidden">
      {/* Ocean-themed background with animated waves */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#051e2f] via-[#0a3a5a] to-[#0c4c74] opacity-80"></div>
      
      {/* Animated bubbles */}
      
      
      <div className="w-full max-w-md space-y-8 bg-[#051e2f]/50 p-8 rounded-xl shadow-lg backdrop-blur-sm border border-[#0077b6]/30 relative z-10">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <FaOctopusDeploy className="text-5xl text-[#00b4d8] mr-4" />
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00b4d8] via-[#0077b6] to-[#023e8a] mb-2">
            Aquariza Verification
          </h2>
          <p className="text-[#90e0ef] mb-6">
            We've sent a 6-digit verification code to {userEmail ? <span className="font-semibold text-[#00b4d8]">{userEmail}</span> : 'your email address'}. Enter the code below to verify your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <Input
                key={index}
                type="text"
                maxLength={6}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                ref={(el) => (inputRefs.current[index] = el)}
                className="w-12 h-12 text-center text-xl font-bold bg-[#051e2f]/50 border-[#0077b6]/50 text-white focus:border-[#00b4d8] focus:ring-[#00b4d8]/50"
                disabled={isLoading}
              />
            ))}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#0077b6] via-[#0096c7] to-[#00b4d8] text-white hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-[0_0_15px_rgba(0,180,216,0.5)] py-6 rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </Button>

          <div className="text-center">
            <p className="text-[#90e0ef]">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                className="text-[#00b4d8] hover:text-[#0077b6] transition-colors"
                disabled={isLoading}
              >
                Resend Code
              </button>
            </p>
            
            {/* For testing purposes only */}
            <p className="mt-4 text-[#90e0ef]/70">
              <button
                type="button"
                onClick={() => getLatestOtp()}
                className="text-[#00b4d8] hover:text-[#0077b6] transition-colors text-sm"
                disabled={isLoading}
              >
                Get Latest Code (For Testing)
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
