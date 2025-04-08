import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Calendar, MessageSquare, Loader2 } from "lucide-react";
import { auth } from "@/services/auth";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { mutate: login, isPending } = useMutation({
    mutationFn: async () => {
      return auth.login(email, password);
    },
    onSuccess: (data) => {
      toast.success(data.serverData.message || 'Logged in successfully');
      navigate('/');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      if (error.response?.data?.errors?.email) {
        toast.error(error.response.data.errors.email[0]);
      }
    },
  });

  const { mutate: googleLogin, isPending: isGooglePending } = useMutation({
    mutationFn: async () => {
      return auth.googleLogin();
    },
    onSuccess: (data) => {
      toast.success(data.serverData.message || 'Logged in with Google successfully');
      navigate('/');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Google login failed';
      toast.error(message);
      if (error.response?.data?.errors?.email) {
        toast.error(error.response.data.errors.email[0]);
      }
    },
  });

  const handleGoogleLogin = () => {
    googleLogin();
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login();
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#F9F9F9] px-4 py-12 lg:py-0">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight">
              Your ideas,
              <br />
              amplified
            </h1>
            <p className="text-gray-600">
              Privacy-first AI that helps you create in confidence.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <Button 
              variant="outline"
              className="w-full flex items-center justify-center gap-3 py-6 border border-gray-300 hover:bg-gray-50"
              onClick={handleGoogleLogin}
              disabled={isGooglePending}
            >
              {isGooglePending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Connecting to Google...
                </>
              ) : (
                <>
                  <FcGoogle className="w-5 h-5" />
                  Continue with Google
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#F9F9F9] text-gray-500">OR</span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your personal or work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <Button 
                type="submit"
                className="w-full py-6 bg-[#B85C38] hover:bg-[#A34E2E] text-white"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Continue with email'
                )}
              </Button>
            </form>
          </div>

          <div className="text-center">
            <button 
              onClick={() => {/* Handle learn more */}}
              className="text-gray-600 hover:text-gray-800 text-sm flex items-center justify-center gap-1 mx-auto"
            >
              Learn more
              <span className="inline-block rotate-90">›</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right side - Project Showcase */}
      <div className="hidden lg:flex w-1/2 bg-gray-50 items-center justify-center p-8">
        <div className="max-w-2xl w-full space-y-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-gray-600" />
              </div>
              <h2 className="text-lg font-medium">Claude, make a content calendar for my marketing campaign.</h2>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <img 
                src="/calendar-preview.png" 
                alt="AI Generated Calendar"
                className="w-full rounded-lg shadow-sm"
              />
            </div>
            <div className="flex items-start gap-3 mt-4">
              <div className="w-8 h-8 rounded-full bg-[#F9F9F9] flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-gray-600 text-sm">
                Of course. Here's the calendar! I've organized your content into a clear schedule with different types of posts spread throughout the month.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
