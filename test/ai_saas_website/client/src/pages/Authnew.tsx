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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  
  // Check if there's a token in localStorage to determine authentication status
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);
  
  // Force redirect to dashboard if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
        // Mark as authenticated to trigger redirect effect
        setIsAuthenticated(true);
      }
      
      toast.success(data.message || 'Logged in successfully');
      // Try multiple navigation approaches to ensure redirect happens
      navigate('/dashboard', { replace: true });
      
      // As a fallback, use direct window location change
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
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
        // Mark as authenticated to trigger redirect effect
        setIsAuthenticated(true);
      }
      
      toast.success(data.message || 'Logged in with Google successfully');
      // Try multiple navigation approaches to ensure redirect happens
      navigate('/dashboard', { replace: true });
      
      // As a fallback, use direct window location change
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);