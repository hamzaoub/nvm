// Optimized MicroservicesProvider with improved performance and error handling

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import microservicesApi from '@/services/microservicesApi';
import { toast } from 'sonner';

// Define the context type
interface MicroservicesContextType {
  serviceStatus: {
    contentTransformation: 'available' | 'unavailable' | 'maintenance';
    meetingAssistant: 'available' | 'unavailable' | 'maintenance';
    voiceGeneration: 'available' | 'unavailable' | 'maintenance';
    customerJourney: 'available' | 'unavailable' | 'maintenance';
    syntheticData: 'available' | 'unavailable' | 'maintenance';
  };
  userCredits: number;
  isLoading: boolean;
  lastUpdated: Date | null;
  refreshStatus: () => Promise<void>;
  refreshCredits: () => Promise<void>;
}

// Create the context with default values
const MicroservicesContext = createContext<MicroservicesContextType>({
  serviceStatus: {
    contentTransformation: 'available',
    meetingAssistant: 'available',
    voiceGeneration: 'available',
    customerJourney: 'available',
    syntheticData: 'available',
  },
  userCredits: 0,
  isLoading: false,
  lastUpdated: null,
  refreshStatus: async () => {},
  refreshCredits: async () => {},
});

// Create the provider component
export const MicroservicesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [serviceStatus, setServiceStatus] = useState({
    contentTransformation: 'available',
    meetingAssistant: 'available',
    voiceGeneration: 'available',
    customerJourney: 'available',
    syntheticData: 'available',
  } as MicroservicesContextType['serviceStatus']);
  
  const [userCredits, setUserCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Function to refresh service status with debouncing
  const refreshStatus = useCallback(async () => {
    // Don't refresh if we've updated in the last 30 seconds
    if (lastUpdated && (new Date().getTime() - lastUpdated.getTime() < 30000)) {
      return;
    }
    
    try {
      setIsLoading(true);
      const healthData = await microservicesApi.getServiceHealth();
      
      if (healthData.services) {
        setServiceStatus({
          contentTransformation: healthData.services.transform || 'available',
          meetingAssistant: healthData.services.meeting || 'available',
          voiceGeneration: healthData.services.voice || 'available',
          customerJourney: healthData.services.journey || 'available',
          syntheticData: healthData.services.data || 'available',
        });
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error checking service status:', error);
      // Only show toast for network errors, not for regular polling
      if (!lastUpdated) {
        toast.error('Unable to fetch service status. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [lastUpdated]);

  // Function to refresh user credits
  const refreshCredits = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/credits');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch credits: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.credits !== undefined) {
        setUserCredits(data.credits);
      }
    } catch (error) {
      console.error('Error fetching user credits:', error);
      // Only show toast for first load errors
      if (userCredits === 0) {
        toast.error('Unable to fetch credit information. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [userCredits]);

  // Initialize on component mount
  useEffect(() => {
    // Initial fetch
    refreshStatus();
    refreshCredits();
    
    // Set up periodic refresh
    const interval = setInterval(() => {
      refreshStatus();
    }, 60000); // Check every minute
    
    setRefreshInterval(interval);
    
    // Clean up on unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshStatus, refreshCredits]);

  // Create the context value
  const contextValue: MicroservicesContextType = {
    serviceStatus,
    userCredits,
    isLoading,
    lastUpdated,
    refreshStatus,
    refreshCredits,
  };

  return (
    <MicroservicesContext.Provider value={contextValue}>
      {children}
    </MicroservicesContext.Provider>
  );
};

// Create a hook to use the context
export const useMicroservices = () => useContext(MicroservicesContext);

export default MicroservicesContext;
