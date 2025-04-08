import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import axiosInstance from '@/lib/axios';
const firebaseConfig = {
    apiKey: "AIzaSyDumE777oAjcHSeDRCyMaTC6tjF1YxZ2D4",
    authDomain: "ai-platform-26f45.firebaseapp.com",
    projectId: "ai-platform-26f45",
    storageBucket: "ai-platform-26f45.firebasestorage.app",
    messagingSenderId: "466147930422",
    appId: "1:466147930422:web:5f1b1baa989bf0f19b0397",
    measurementId: "G-2CSL344M9W"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

interface GoogleUserData {
  provider_id: string;
  email: string | null;
  name: string;
  lastName: string;
  photo_url: string | null;
  idToken?: string;
}


export const authService = {
  
  // Set auth header for axios
  setAuthHeader: (token: string) => {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },
  // Register with email and password
  register: async (email: string, password: string, name: string, lastName: string, confirmPassword: string) => {
    const response = await axiosInstance.post('/api/auth/register', {
      name,
      lastName,
      email,
      password,
      confirmPassword
    });

    // Store token in localStorage and set in axios headers
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }

    return response.data;
  },

  // Sign in with Google
  signInWithGoogle: async (isRegistration = false) => {
    
    try {
      
      // Authenticate with Firebase
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      // Extract user data from Google result
      const fullName = result.user.displayName || '';
      const nameParts = fullName.split(' ');
      const name = nameParts[0] || 'User';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Account';
      
      const userData: GoogleUserData = {
        provider_id: result.user.uid,
        email: result.user.email,
        name: name,
        lastName: lastName,
        photo_url: result.user.photoURL,
        idToken
      };

      try {
        // If explicitly requesting registration, skip login attempt
        if (isRegistration) {
          // Register new user with Google
          const response = await axiosInstance.post('/api/auth/register', {
            email: userData.email,
            name: userData.name,
            lastName: userData.lastName,
            provider: 'google',
            provider_id: userData.provider_id,
            idToken: userData.idToken
          });
          return { data: response.data, redirect: '/dashboard' };
        }
        
        // Try login first (default flow)
        try {
          // Directly create a user with the Google credentials
          const response = await axiosInstance.post('/api/auth/login', {
            email: userData.email,
            provider: 'google',
            idToken: userData.idToken
          });
          
          // Set the token in localStorage and axios headers
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            
          }
          
          return { data: response.data, redirect: response.data.redirect };
        } catch (loginError: any) {
          // If user doesn't exist (422), proceed with registration
          if (loginError.response?.status !== 422) {
            throw loginError;
          }
          
          // Fallback to registration if login fails with 422
          const response = await axiosInstance.post('/api/auth/register', {
            email: userData.email,
            name: userData.name,
            lastName: userData.lastName,
            provider: 'google',
            provider_id: userData.provider_id,
            idToken: userData.idToken
          });
          
          // Set the token in localStorage and axios headers
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
          }
          
          return { data: response.data, redirect: response.data.redirect };
        }
      } catch (error: any) {
        // Handle specific API errors
        if (error.response) {
          switch (error.response.status) {
            case 400:
              throw new Error('Invalid Google account data');
            case 401:
              throw new Error('Unauthorized. Please try again');
            case 409:
              throw new Error('This email is already registered with a different method');
            default:
              throw new Error(error.response.data.message || 'Failed to authenticate with Google');
          }
        }
        throw error;
      }
    } catch (error: any) {
      // Handle Firebase-specific errors
      if (error.code) {
        switch (error.code) {
          case 'auth/popup-closed-by-user':
            throw new Error('Google sign-in was cancelled');
          case 'auth/popup-blocked':
            throw new Error('Google sign-in popup was blocked. Please enable popups');
          default:
            throw new Error('Failed to connect to Google. Please try again');
        }
      }
      throw error;
    }
  },

  // Login with email and password
  login: async (email: string, password: string) => {
    const response = await axiosInstance.post('/api/auth/login', {
      email,
      password
    });

    console.log('Login API response:', response.data);
    
    // Set the token in localStorage and axios headers
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    
    // Return the result with the redirect from the server or default to welcome page
    const result = {
      ...response.data,
      redirect: response.data.redirect || '/welcome'
    };
    
    console.log('Returning login result:', result);
    return result;
  },

  // Get current user with roles
  getCurrentUser: async () => {
    try {
      const response = await axiosInstance.get('/api/auth/user');
      return {
        ...response.data.user,
        roles: response.data.roles
      };
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  },
  
  // Check if current user has a specific role
  hasRole: async (role: string) => {
    try {
      const userData = await authService.getCurrentUser();
      return userData?.roles?.includes(role) || false;
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  },

  // Sign out
  logout: async () => {
    try {
      await axiosInstance.post('/api/auth/logout');
      // Clear Firebase auth
      await auth.signOut();
      // Clear token from localStorage
      localStorage.removeItem('token');
      // Remove Authorization header
      delete axiosInstance.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local auth state even if API call fails
      localStorage.removeItem('token');
      delete axiosInstance.defaults.headers.common['Authorization'];
      
    }
  },

  // Verify OTP code
  verifyOtp: async (code: string) => {
    const response = await axiosInstance.post('/api/auth/verify-otp', { code });
    
    // Update the token with the new permanent token
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    
    return response.data;
  },

  // Resend OTP code
  resendOtp: async () => {
    const response = await axiosInstance.post('/api/auth/resend-otp');
    return response.data;
  }
};
