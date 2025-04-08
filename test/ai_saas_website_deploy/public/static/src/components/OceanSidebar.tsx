import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaOctopusDeploy, FaHome, FaProjectDiagram, FaChartBar, FaUsers } from 'react-icons/fa';
import { MdOutlineScience } from 'react-icons/md';
import { RiWaterFlashFill } from 'react-icons/ri';
import { Menu, X, LogOut, ChevronRight, Clock } from 'lucide-react';
import { NavUser } from '@/components/NavUser';
import { SidebarProvider } from '@/components/SidebarContext';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import coinsService, { CoinData } from '@/services/coins';
import axios from '@/lib/axios';

interface SidebarIconProps {
  icon: React.ReactNode;
  to: string;
  color: string;
  label?: string;
  isActive?: boolean;
  isExpanded?: boolean;
}

const SidebarIcon: React.FC<SidebarIconProps> = ({ icon, to, color, label, isActive, isExpanded }) => {
  return (
    <Link 
      to={to} 
      className={`group flex items-center ${isExpanded ? 'justify-start pl-3' : 'justify-center'} w-full h-12 rounded-xl ${isActive ? `bg-${color}-600/90` : `bg-${color}-500/90`} text-white hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-${color}-500/50 relative overflow-hidden`}
    >
      <div className={cn("flex items-center", isExpanded ? "justify-start" : "justify-center")}>
        {icon}
        <span className={cn("font-medium text-sm transition-all", isExpanded ? "ml-3 opacity-100" : "opacity-0 w-0 overflow-hidden")}>{label}</span>
      </div>
      {isActive && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30"></div>
      )}
    </Link>
  );
};

export const OceanSidebar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [coinData, setCoinData] = useState<CoinData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // Check if current route is active
  const isRouteActive = (route: string) => {
    // Handle special case for dashboard which can be both /dashboard or /
    if (route === '/dashboard' && (location.pathname === '/dashboard' || location.pathname === '/')) {
      return true;
    }
    return location.pathname.startsWith(route);
  };

  // Handle screen resize with tablet-specific behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const isTablet = width >= 640 && width < 1024;
      
      // On tablet, we want a more condensed sidebar by default, but still interactive
      if (isTablet) {
        setIsExpanded(false); // Start collapsed on tablet
        setIsMobile(false); // Don't use mobile mode for tablet, use a special tablet mode
      } else {
        setIsMobile(width < 640); // Only count small screens as mobile
      }
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close mobile menu when route changes, but only if user dropdown is not open
  useEffect(() => {
    if (!isUserDropdownOpen) {
      setMobileMenuOpen(false);
    }
  }, [location.pathname, isUserDropdownOpen]);
  
  // Keep track of dropdown state and prevent sidebar from closing when dropdown is open
  useEffect(() => {
    // If dropdown is open, make sure sidebar stays open on both mobile and desktop
    if (isUserDropdownOpen) {
      if (isMobile) {
        setMobileMenuOpen(true); // Keep mobile menu open
      } else {
        setIsExpanded(true); // Keep desktop sidebar expanded
      }
    }
  }, [isUserDropdownOpen, isMobile]);

  // Additional effect to ensure mobile sidebar stays open when dropdown is active
  useEffect(() => {
    // When user dropdown opens, force mobile menu to stay open
    if (isUserDropdownOpen && isMobile) {
      setMobileMenuOpen(true);
    }
  }, [isUserDropdownOpen, isMobile]);
  
  // Fetch coin data when component mounts
  useEffect(() => {
    const fetchCoinData = async () => {
      if (user) {
        try {
          setIsLoading(true);
          const data = await coinsService.getUserCoins();
          setCoinData(data);
        } catch (error) {
          console.error('Error fetching coin data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchCoinData();
  }, [user]);

  // Mobile menu toggle button with animation that moves with sidebar
  const MobileMenuToggle = () => (
    <button 
      onClick={() => {
        // Never close the mobile menu if the dropdown is open
        if (isUserDropdownOpen) {
          setMobileMenuOpen(true);
          return;
        }
        setMobileMenuOpen(!mobileMenuOpen);
      }}
      className="fixed top-4 left-4 z-50 bg-gradient-to-b from-[#000000] via-[#010f19] to-[#0c1630] opacity-90 p-2 rounded-lg shadow-lg md:hidden overflow-hidden hover:bg-[#0c1630]/80"
      style={{
        width: '40px', 
        height: '40px',
        transform: mobileMenuOpen ? 'translateX(12rem)' : 'translateX(0)',
        transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
      aria-label="Toggle navigation menu"
    >
      <div className="relative w-6 h-6 mx-auto">
        <Menu 
          className={cn(
            "text-[#00b4d8] w-6 h-6 absolute inset-0", 
            mobileMenuOpen ? "-rotate-90 opacity-0 scale-50" : "rotate-0 opacity-100 scale-100",
            "transition-all duration-400 ease-in-out"
          )} 
        />
        <X 
          className={cn(
            "text-[#00b4d8] w-6  h-6 absolute inset-0", 
            mobileMenuOpen ? "rotate-0 opacity-100 scale-100" : "rotate-90 opacity-0 scale-50",
            "transition-all duration-400 ease-in-out"
          )}
        />
      </div>
    </button>
  );

  // Sidebar items to render
  interface SidebarMenuItem {
    icon: React.ReactNode;
    to: string;
    color: string;
    label: string;
    id?: number;
  }

  // State for dynamic menu items from API
  const [menuItems, setMenuItems] = useState<SidebarMenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  
  // Icon mapping for dynamic loading - wrapped in useMemo to prevent recreation on every render
  const iconMap = useMemo<Record<string, React.ComponentType<React.SVGAttributes<SVGElement>>>>(() => ({
    // FA icons
    FaHome: FaHome,
    FaProjectDiagram: FaProjectDiagram,
    FaChartBar: FaChartBar,
    FaUsers: FaUsers,
    FaOctopusDeploy: FaOctopusDeploy,
    FaCog: LogOut, // Temporary fallback
    // Lucide icons are imported directly
    // RI icons
    RiWaterFlashFill: RiWaterFlashFill,
    // MD icons
    MdOutlineScience: MdOutlineScience,
  }), []);
  
  // Fetch menu items from API
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setMenuLoading(true);
        console.log('Fetching menu items...');
        
        // Try the menu endpoint - the URL should match our Laravel route
        let data;
        try {
          // First try with /api prefix
          const response = await axios.get('/api/menu/sidebar_menu');
          console.log('Menu API response with /api prefix:', response.data);
          data = response.data;
        } catch (apiError) {
          console.error('Error with /api prefix:', apiError);
          // Fall back to without /api prefix
          const fallbackResponse = await axios.get('/menu/sidebar_menu');
          console.log('Menu API response without /api prefix:', fallbackResponse.data);
          data = fallbackResponse.data;
        }
        
        // Format the menu items for the sidebar
        if (!data || !data.items || !Array.isArray(data.items)) {
          console.error('Invalid menu data format:', data);
          setMenuItems([]);
          return;
        }
        
        const formattedItems = data.items.map((item: {
          id: number;
          name: string;
          uri: string | null;
          icon_name: string | null;
          color: string | null;
        }) => {
          // Create the icon element based on icon name
          let iconElement;
          if (item.icon_name && iconMap[item.icon_name]) {
            const IconComponent = iconMap[item.icon_name];
            iconElement = <IconComponent className="text-xl" />;
          } else {
            // Fallback icon
            iconElement = <FaOctopusDeploy className="text-xl" />;
          }
          
          return {
            icon: iconElement,
            to: item.uri || '/',
            color: item.color || 'blue',
            label: item.name,
            id: item.id
          };
        });
        
        setMenuItems(formattedItems);
      } catch (error) {
        console.error('Error fetching menu items:', error);
        // Just set an empty array if the API fails - no fallback to hardcoded values
        setMenuItems([]);
      } finally {
        setMenuLoading(false);
      }
    };
    
    fetchMenuItems();
  }, [iconMap]);
  
  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {/* Mobile menu toggle - positioned to move with sidebar */}
      {isMobile && <MobileMenuToggle />}
      
      {/* Main sidebar component */}
      <div 
        className={` rounded-3xl fixed inset-y-0 left-0 z-40 ${isMobile ? ((mobileMenuOpen || isUserDropdownOpen) ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'} ${isMobile ? 'w-48' : (isExpanded ? 'w-48' : 'w-16')} bg-[#0c1630]`}
        style={{ transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        onMouseEnter={() => !isMobile && setIsExpanded(true)}
        onMouseLeave={() => !isMobile && !isUserDropdownOpen && setIsExpanded(false)}
        onTouchStart={() => !isMobile && setIsExpanded(true)} /* Better touch handling for tablets */
      >
        <div className="h-full flex flex-col md:rounded-r-3xl overflow-hidden shadow-2xl border-r border-[#0077b6]/20">
          {/* Header section - updated to be more on-brand */}
          <div className={`bg-gradient-to-r from-[#0077b6] to-[#00b4d8] w-full ${isExpanded ? 'md:w-48' : 'md:w-16'} py-3 md:py-6 flex flex-row md:flex-col items-center justify-between md:justify-center px-4 md:px-0`}>
            <Link to="/" className="w-12 h-12 bg-[#0c1630]/80 rounded-full flex items-center justify-center hover:bg-[#0c1630] transition-all mb-0 md:mb-2">
              <FaOctopusDeploy className="text-[#00b4d8] text-2xl" />
            </Link>
            
            {/* Mobile menu toggle button is now handled separately */}
          </div>
          
          {/* Main sidebar section */}
          <div className={`bg-[#0c1630] flex-1 w-full ${isExpanded ? 'md:w-48 md:items-stretch md:px-3' : 'md:w-16 md:items-center md:px-2'} flex flex-col py-4 px-3 transition-all duration-300`}>
            {/* Navigation section */}
            <div className="flex-1 w-full flex flex-col items-stretch md:items-center space-y-3">
              {menuLoading ? (
                // Show loading placeholders while menu is loading
                Array(3).fill(0).map((_, index) => (
                  <div key={`loading-${index}`} className="w-full h-12 rounded-xl bg-[#051e2f]/40 animate-pulse mb-2"></div>
                ))
              ) : (
                menuItems.map((item, index) => (
                  <SidebarIcon 
                    key={index}
                    icon={item.icon} 
                    to={item.to} 
                    color={item.color}
                    label={item.label}
                    isActive={isRouteActive(item.to)}
                    isExpanded={isMobile || isExpanded}
                  />
                ))
              )}
            </div>
            
            {/* Subscription and Credits section */}
            <div className="mt-4 mb-4 w-full">
              <div className={`${isExpanded || isMobile ? 'p-3' : 'p-2'} bg-[#0a3a5a]/70 rounded-xl backdrop-blur-sm border border-[#0077b6]/30 shadow-lg overflow-hidden relative transition-all duration-300`}>
                {/* Floating bubbles - only visible when expanded */}
                {(isExpanded || isMobile) && (
                  <>
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#90e0ef]/30 animate-float opacity-60"></div>
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#ade8f4]/20 animate-float opacity-40" style={{ animationDelay: '1s' }}></div>
                  </>
                )}
                
                {/* Always visible content */}
                <div className={cn("flex items-center", isExpanded || isMobile ? "justify-start" : "justify-center")}>
                  {/* Subscription icon and status indicator */}
                  <div className="relative">
                    {coinData?.subscription?.icon === 'octopus' ? (
                      <FaOctopusDeploy className="text-xl text-[#00b4d8]" />
                    ) : (
                      <RiWaterFlashFill className="text-xl text-[#00b4d8]" />
                    )}
                    <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#00b4d8] animate-pulse-glow"></div>
                  </div>
                  
                  {/* Expanded content */}
                  {(isExpanded || isMobile) && (
                    <div className="ml-3 flex-1">
                      {/* Subscription info */}
                      <div className="mb-2">
                        {coinData?.subscription?.plan === 'Free Plan' ? (
                          <div className="flex items-center space-x-1">
                            <div className="text-xs text-[#ade8f4] font-medium">
                              {coinData?.subscription?.plan || 'LOADING...'}
                            </div>
                            <Link 
                              to="/payment" 
                              className="inline-flex items-center rounded-sm bg-gradient-to-r from-[#0077b6] to-[#00b4d8] px-2 py-0.5 text-[10px] font-medium text-white hover:from-[#00b4d8] hover:to-[#0077b6] transition-all shadow-sm hover:shadow">
                              <span>Upgrade</span>
                              <ChevronRight className="ml-0.5 h-2 w-2" />
                            </Link>
                          </div>
                        ) : (
                          <div className="text-xs font-medium flex items-center">
                            <div className="mr-1 px-1.5 py-0.5 bg-gradient-to-r from-[#0077b6]/20 to-[#00b4d8]/20 rounded-sm border border-[#00b4d8]/30 backdrop-blur-sm">
                              <span className="text-[#00b4d8] font-semibold">{coinData?.subscription?.plan || 'LOADING...'}</span>
                            </div>
                            {coinData?.subscription?.theme === 'ocean' && (
                              <span className="inline-flex items-center">
                                <div className="h-1.5 w-1.5 rounded-full bg-[#00b4d8] animate-pulse"></div>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Credits display */}
                      <div className="mt-2">
                        <div className="w-full bg-[#051e2f] rounded-lg h-3 overflow-hidden relative">
                          {/* Loading state */}
                          {isLoading ? (
                            <div className="h-full bg-[#0077b6]/30 animate-pulse"></div>
                          ) : (
                            <>
                              {/* Current coins progress */}
                              <div 
                                className={`h-full ${coinData?.subscription?.plan === 'Free Plan' ? 'bg-gradient-to-r from-[#0077b6] to-[#00b4d8]' : 'bg-gradient-to-r from-[#0077b6] via-[#00b4d8] to-[#48cae4] animate-shimmer'}`} 
                                style={{ width: `${coinData ? (coinData.coin_balance / coinData.current_plan_max)*100 : 0}%`, backgroundSize: coinData?.subscription?.plan === 'Free Plan' ? '100%' : '200% 100%', backgroundPosition: coinData?.subscription?.plan === 'Free Plan' ? '0 0' : '0 0' }}
                              ></div>
                              
                            </>
                          )}
                        </div>
                        <div className="grid justify-between mt-1">
                          <span className="text-xs text-[#90e0ef]">
                            {coinData ? (
                              <>
                                {coinData.coin_balance} / <span className={`${coinData?.subscription?.plan === 'Free Plan' ? 'text-[#00b4d8]' : 'text-[#48cae4] font-semibold'}`}>{coinData.current_plan_max}</span>
                              </>
                            ) : '-- / --'}
                            {coinData?.subscription?.theme === 'ocean' && (
                                    <span className="ml-1 text-[#00b4d8] text-[10px]">🌊</span>
                                  )}
                          </span>
                          {coinData?.subscription?.renewal_days ? (
                            <span className="text-xs font-medium flex items-center">
                              {coinData?.subscription?.plan !== 'Free Plan' ? (
                                <span className="flex items-center text-[#90e0ef]">
                                  <Clock className="mr-0.5 h-2.5 w-2.5 text-[#00b4d8]" />
                                  <span>{coinData.subscription.renewal_days} days</span>
                                  
                                </span>
                              ) : (
                                <span className="text-[#90e0ef]">
                                  <span>days {coinData.subscription.renewal_days}</span>
                                </span>
                              )}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Bottom section with settings and user info */}
            <div className="mt-auto pt-6 border-t border-[#0077b6]/20 w-full">
              {/* User Profile Dropdown - now available on both mobile and desktop with oceanic theme */}
              <div 
                className={`w-full mb-2 relative rounded-xl overflow-hidden transition-all duration-200 
                ${isExpanded || isMobile ? 'px-3' : 'px-0'} 
                ${isMobile ? 'py-2' : 'h-12'}`}
              >
                {/* Ocean-themed background with subtle wave animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#051e2f] via-[#0a3a5a] to-[#0c4c74] overflow-hidden">
                  {/* Animated bubbles for oceanic effect */}
                  <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-[#90e0ef]/20 animate-float"></div>
                  <div className="absolute top-3/4 left-3/4 w-1 h-1 rounded-full bg-[#ade8f4]/20 animate-float-slow"></div>
                </div>
                
                {/* Dropdown component */}
                <div className="relative z-10">
                  <SidebarProvider>
                    <NavUser onOpenChange={setIsUserDropdownOpen} />
                  </SidebarProvider>
                </div>
              </div>
              
              {/* Logout button */}
              <button 
                onClick={handleLogout}
                className={`group flex items-center ${isExpanded || isMobile ? 'justify-start pl-3' : 'justify-center'} w-full h-12 rounded-xl bg-red-500/30 text-red-200 hover:text-white hover:bg-red-500/50 hover:scale-105 transition-all duration-200`}
              >
                <LogOut className="text-xl" />
                <span className={cn("font-medium text-sm transition-all", (isExpanded || isMobile) ? "ml-3 opacity-100" : "opacity-0 w-0 overflow-hidden")}>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay for mobile with smooth fade animation */}
      <div 
        className={`fixed inset-0 bg-black/50 z-30 transition-opacity duration-500 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileMenuOpen(false)}
      />
    </>
  );
};

export default OceanSidebar;
