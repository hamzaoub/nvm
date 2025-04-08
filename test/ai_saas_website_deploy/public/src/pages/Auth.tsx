import { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { Calendar, MessageSquare, Loader2, Waves } from "lucide-react";
import { FaOctopusDeploy } from "react-icons/fa";
import { authService } from "@/services/auth";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'register');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setname] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();



  // Check for token and redirect on component mount (only runs once)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Use window.location for a hard redirect to break any potential React update cycles
      window.location.href = '/dashboard';
    }
  }, []);

  // Login mutation
  const { mutate: login, isPending: isLoginPending } = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      return authService.login(email, password);
    },
    onSuccess: (data) => {
      console.log('Login success data:', data);
      // Make sure token is set in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
        // Also set the Authorization header for axios
        authService.setAuthHeader(data.token);
      }
      
      toast.success(data.message || 'Logged in successfully');
      // Use the redirect from the server or default to dashboard
      // Use window.location for a full page reload to reset any React state issues
      window.location.href = data.redirect || '/dashboard';
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      if (error.response?.data?.errors?.email) {
        toast.error(error.response.data.errors.email[0]);
      }
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  // Register mutation
  const { mutate: register, isPending: isRegisterPending } = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      return authService.register(email, password, name, lastName, confirmPassword);
    },
    onSuccess: (data) => {
      console.log('Register success data:', data);
      toast.success(data.message || 'Registered successfully');
      // Always navigate to verification page after registration
      navigate('/verify');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(message);
      if (error.response?.data?.errors?.email) {
        toast.error(error.response.data.errors.email[0]);
      }
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  // Google login mutation
  const { mutate: googleLogin, isPending: isGoogleLoginPending } = useMutation({
    mutationFn: async (registerMode: boolean) => {
      setIsLoading(true);
      return authService.signInWithGoogle(registerMode);
    },
    onSuccess: ({ data, redirect }) => {
      console.log('Google login success data:', data, 'redirect:', redirect);
      // Make sure token is set in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
        // Also set the Authorization header for axios
        authService.setAuthHeader(data.token);
      }
      
      toast.success(data.message || 'Logged in with Google successfully');
      // Use window.location for a full page reload to reset any React state issues
      window.location.href = redirect || '/dashboard';
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Google login failed';
      toast.error(message);
      if (error.response?.data?.errors?.email) {
        toast.error(error.response.data.errors.email[0]);
      }
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      login();
    } else {
      register();
    }
  };

  const handleGoogleLogin = () => {
    // Pass true to indicate this is for registration when not in login mode
    googleLogin(!isLogin);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000000] via-[#010f19] to-[#0c1630] opacity-90 flex relative overflow-hidden">
      {/* Ocean-themed background with animated waves */}
      <div className="absolute inset-0 "></div>
      
      {/* Animated bubbles */}

      
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? "login" : "register"}
            initial={{ x: isLogin ? -100 : 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isLogin ? 100 : -100, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full max-w-md space-y-8 animate-sectionFadeIn"
          >
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <FaOctopusDeploy className="text-6xl text-[#00b4d8] animate-pulse" />
              </div>
              <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00b4d8] via-[#0077b6] to-[#023e8a] mb-2">
                {isLogin ? "Welcome back" : "Create account"}
              </h2>
              <p className="text-[#90e0ef]">
                {isLogin
                  ? "Dive back into your account"
                  : "Join the depths of innovation"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <>
                  <div>
                    <Input
                      type="text"
                      placeholder="First Name"
                      value={name}
                      onChange={(e) => setname(e.target.value)}
                      required
                      className="w-full px-4 py-6 bg-[#0c2e44] border-[#0077b6] text-white placeholder:text-[#90e0ef]/60 focus:border-[#00b4d8] focus:ring-[#00b4d8]/50 rounded-lg"
                    />
                  </div>
                  <div>
                    <Input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full px-4 py-6 bg-[#0c2e44] border-[#0077b6] text-white placeholder:text-[#90e0ef]/60 focus:border-[#00b4d8] focus:ring-[#00b4d8]/50 rounded-lg"
                    />
                  </div>
                </>
              )}
              <div>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-6 bg-[#0c2e44] border-[#0077b6] text-white placeholder:text-[#90e0ef]/60 focus:border-[#00b4d8] focus:ring-[#00b4d8]/50 rounded-lg transition-all duration-300 hover:border-[#00b4d8]/70"
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-6 bg-[#0c2e44] border-[#0077b6] text-white placeholder:text-[#90e0ef]/60 focus:border-[#00b4d8] focus:ring-[#00b4d8]/50 rounded-lg transition-all duration-300 hover:border-[#00b4d8]/70"
                />
              </div>
              {!isLogin && (
                <div>
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-6 bg-[#0c2e44] border-[#0077b6] text-white placeholder:text-[#90e0ef]/60 focus:border-[#00b4d8] focus:ring-[#00b4d8]/50 rounded-lg transition-all duration-300 hover:border-[#00b4d8]/70"
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#0077b6] via-[#0096c7] to-[#00b4d8] text-white hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-[0_0_15px_rgba(0,180,216,0.5)] py-6 rounded-lg"
                disabled={isLoginPending || isRegisterPending || isLoading}
              >
                {(isLoginPending || isRegisterPending || isLoading) ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  isLogin ? "Sign in" : "Create account"
                )}
              </Button>
            </form>

            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#051e2f] text-[#90e0ef]">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-3 py-6 border border-[#0077b6] hover:border-[#00b4d8] bg-[#0c2e44] hover:bg-[#0a3a5a] text-white transition-all duration-300 mt-6 rounded-lg"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoginPending || isLoading}
            >
              {(isGoogleLoginPending || isLoading) ? (
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

            <div className="text-center mt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={toggleMode}
                className="text-[#90e0ef] hover:text-[#00b4d8] transition-colors"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right side - Image/Info */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-b from-[#000000] via-[#010f19] to-[#0c1630] opacity-90 items-center justify-center p-12 relative animate-sectionSlideUp">
        {/* Animated octopus tentacles */}
        <div className="absolute bottom-0 left-0 w-full h-2/3 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i}
              className="absolute bottom-0 bg-gradient-to-t from-[#023e8a] to-transparent rounded-full animate-tentacle"
              style={{
                width: `${Math.random() * 40 + 20}px`,
                height: `${Math.random() * 300 + 200}px`,
                left: `${(i * 12) + Math.random() * 5}%`,
                transformOrigin: 'bottom',
                animationDuration: `${Math.random() * 8 + 4}s`,
                animationDelay: `${Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
        
        <div className="max-w-md text-white relative z-10">
          <div className="flex items-center mb-6">
            <FaOctopusDeploy className="text-5xl text-[#00b4d8] mr-4" />
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00b4d8] via-[#0077b6] to-[#023e8a]">
              Aquariza Platform
            </h1>
          </div>
          <div className="space-y-6 bg-[#051e2f]/50 p-6 rounded-xl backdrop-blur-sm border border-[#0077b6]/30">
            <div className="flex items-center space-x-4">
              <Calendar className="w-8 h-8 text-[#00b4d8]" />
              <div>
                <h3 className="font-semibold text-[#ade8f4]">Smart Scheduling</h3>
                <p className="text-[#90e0ef]">AI-powered calendar management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <MessageSquare className="w-8 h-8 text-[#00b4d8]" />
              <div>
                <h3 className="font-semibold text-[#ade8f4]">Intelligent Chat</h3>
                <p className="text-[#90e0ef]">Context-aware conversations</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Waves className="w-8 h-8 text-[#00b4d8]" />
              <div>
                <h3 className="font-semibold text-[#ade8f4]">Deep Learning</h3>
                <p className="text-[#90e0ef]">Dive into the depths of AI innovation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
