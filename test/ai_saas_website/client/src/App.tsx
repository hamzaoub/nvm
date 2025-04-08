import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Home from '@/pages/Home';
import Auth from '@/pages/Auth';
import Welcome from '@/pages/Welcome';
import OtpVerification from '@/pages/OtpVerification';
import Dashboard from '@/pages/Dashboard';
import ProjectCreate from '@/pages/ProjectCreate';
import ProjectDetail from '@/pages/ProjectDetail';
import AiProjects from '@/pages/AiProjects';
import Profile from '@/pages/Profile';
import Payment from '@/pages/Payment';
import PaymentSuccess from '@/pages/PaymentSuccess';
import PaymentCancel from '@/pages/PaymentCancel';
import Analytics from '@/pages/Analytics';
import MicroservicesRoutes from '@/routes/MicroservicesRoutes';
import { useAuth } from '@/hooks/useAuth';
import { AuthProvider } from '@/providers/AuthProvider';
import { MicroservicesProvider } from '@/providers/MicroservicesProvider';
import { OceanFooter } from '@/components/OceanFooter';
import { OceanBubbles } from '@/components/OceanBubbles';
import { useState, useEffect } from 'react';

const queryClient = new QueryClient();

// Component to handle responsive bubble count based on screen size
function ResponsiveBubbles() {
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false
  });

  useEffect(() => {
    // Function to check viewport width and set appropriate flags
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isMobile: width < 640, // Small mobile breakpoint
        isTablet: width >= 640 && width < 1024 // Tablet range
      });
    };
    
    // Check on initial render
    checkScreenSize();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup event listener
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Determine bubble settings based on screen size
  const getBubbleSettings = () => {
    if (screenSize.isMobile) {
      return {
        count: 90,
        maxSize: 35,
        minDuration: 10
      };
    } else if (screenSize.isTablet) {
      return {
        count: 130, // More than mobile, less than desktop
        maxSize: 40, // Intermediate size
        minDuration: 12
      };
    } else {
      return {
        count: 180,
        maxSize: 45,
        minDuration: 10
      };
    }
  };

  const settings = getBubbleSettings();

  return (
    <>
      {/* Ocean-themed background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#051e2f] via-[#00131f] to-[#0c1630] opacity-90"></div>
      
      <OceanBubbles 
        count={settings.count} 
        maxSize={settings.maxSize} 
        minSize={5} 
        randomPlacement={true} 
        maxInitialY={100} 
        maxDuration={25}
        minDuration={settings.minDuration}
        className="absolute inset-0 z-10" 
      />
    </>
  );
}

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  // Wait for auth state to load before deciding to redirect
  if (isLoading) return null;
  
  // Only redirect if we're sure the user isn't authenticated
  if (!user) return <Navigate to="/auth" replace />;
  
  return <>{children}</>;
};

// Admin-only route component - follows RBAC pattern for admin areas
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  // Wait for auth state to load before deciding to redirect
  if (isLoading) return null;
  
  // First check authentication
  if (!user) return <Navigate to="/auth" replace />;
  
  // Then check for admin role
  console.log('AdminRoute check:', user);
  
  // Check if the user has 'admin' role in the roles array
  const hasAdminRole = user.roles && Array.isArray(user.roles) && 
                       user.roles.some(role => role.name === 'admin');
  
  if (!hasAdminRole) {
    console.log('User is not admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log('Admin role verified, showing admin dashboard');
  
  return <>{children}</>;
};

// Guest Route component (for non-authenticated users)
const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  // If still loading auth state, show nothing to prevent flashing
  if (isLoading) return null;
  
  // If user is authenticated, redirect to dashboard
  if (user) return <Navigate to="/dashboard" replace />;
  
  // Otherwise, show the children (guest content)
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ResponsiveBubbles />

      <AuthProvider>
        <MicroservicesProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <Routes>
                <Route path="/" element={<GuestRoute><Home /></GuestRoute>} />
                <Route path="/auth" element={<GuestRoute><Auth /></GuestRoute>} />
                <Route path="/verify" element={<OtpVerification />} />
                <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/projects" element={<ProtectedRoute><AiProjects /></ProtectedRoute>} />
                <Route path="/projects/create" element={<ProtectedRoute><ProjectCreate /></ProtectedRoute>} />
                <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
                <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
                <Route path="/payment/cancel" element={<ProtectedRoute><PaymentCancel /></ProtectedRoute>} />
                <Route path="/admin/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />
                
                {/* New Microservices Routes */}
                <Route path="/microservices/*" element={<ProtectedRoute><MicroservicesRoutes /></ProtectedRoute>} />
              </Routes>
              <OceanFooter />
            </div>
          </Router>
          <Toaster position="top-right" richColors />
        </MicroservicesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
