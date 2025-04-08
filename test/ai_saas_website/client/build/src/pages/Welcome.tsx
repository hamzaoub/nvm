import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Loader2, Waves, Calendar, MessageSquare } from 'lucide-react';
import { FaOctopusDeploy } from 'react-icons/fa';

interface WelcomeData {
  user: {
    name: string;
    lastName: string;
    email: string;
  };
  quickLinks: Array<{
    title: string;
    url: string;
    icon: string;
  }>;
  gettingStarted: Array<{
    title: string;
    description: string;
    url: string;
  }>;
}

const Welcome: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const { data: welcomeData, isLoading } = useQuery<WelcomeData>({
    queryKey: ['welcome'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/welcome');
      return response.data;
    },
  });

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#051e2f] relative overflow-hidden">
      {/* Ocean-themed background with animated waves */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#051e2f] via-[#0a3a5a] to-[#0c4c74] opacity-80"></div>

      {/* Animated bubbles */}
      

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-3xl mx-auto bg-[#0c2e44]/80 rounded-2xl shadow-xl p-8 border border-[#0077b6]/30 backdrop-blur-sm relative z-10">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <FaOctopusDeploy className="text-6xl text-[#00b4d8] animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00b4d8] via-[#0077b6] to-[#023e8a] mb-4">
              Welcome to Aquariza Platform!
            </h1>
            <p className="text-xl text-[#90e0ef]">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </span>
              ) : (
                <>Hello, {welcomeData?.user.name || 'User'}! Dive into your ocean of possibilities at Aquariza.com.</>
              )}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#051e2f]/70 p-6 rounded-xl border border-[#0077b6]/30 hover:border-[#00b4d8]/50 transition-colors backdrop-blur-sm">
              <div className="flex items-center mb-3">
                <Waves className="w-6 h-6 text-[#00b4d8] mr-2" />
                <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#00b4d8] to-[#0077b6]">
                  Dive In
                </h2>
              </div>
              <ul className="space-y-3 text-[#ade8f4]">
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-[#00b4d8]" />
                  </div>
                ) : (
                  welcomeData?.gettingStarted.map((item, index) => (
                    <li key={index} className="cursor-pointer hover:text-[#00b4d8] transition-colors" onClick={() => navigate(item.url)}>
                      {item.title}
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="bg-[#051e2f]/70 p-6 rounded-xl border border-[#0077b6]/30 hover:border-[#00b4d8]/50 transition-colors backdrop-blur-sm">
              <div className="flex items-center mb-3">
                <Calendar className="w-6 h-6 text-[#00b4d8] mr-2" />
                <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#00b4d8] to-[#0077b6]">
                  Navigation
                </h2>
              </div>
              <ul className="space-y-3 text-[#ade8f4]">
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-[#00b4d8]" />
                  </div>
                ) : (
                  welcomeData?.quickLinks.map((link, index) => (
                    <li key={index} className="cursor-pointer hover:text-[#00b4d8] transition-colors" onClick={() => navigate(link.url)}>
                      {link.title}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-[#0077b6] via-[#0096c7] to-[#00b4d8] text-white rounded-lg hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-[0_0_15px_rgba(0,180,216,0.5)]"
            >
              Go to Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-[#051e2f] text-[#90e0ef] rounded-lg hover:text-white hover:bg-[#0a3a5a] transition-all duration-300 border border-[#0077b6]/50 hover:border-[#00b4d8]"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
