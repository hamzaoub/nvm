import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  FaChartBar, FaUsers, FaProjectDiagram, 
  FaServer
} from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import analyticsService, { AnalyticsData } from '@/services/analytics';

import OceanSidebar from '@/components/OceanSidebar';
// Custom ocean-themed colors for components
const OCEAN_COLORS = {
  primary: '#051e2f',
  secondary: '#0a3a5a',
  tertiary: '#0c4c74',
  accent1: '#00b4d8',
  accent2: '#0077b6',
  light1: '#90e0ef',
  light2: '#ade8f4',
};

// Error message component
const ErrorMessage = ({ message }: { message: string }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
    <strong className="font-bold">Error: </strong>
    <span className="block sm:inline">{message}</span>
  </div>
);

// Loading component with ocean theme
const OceanLoading = () => (
  <div className="w-full h-full flex flex-col items-center justify-center p-8">
    <div className="w-16 h-16 relative">
      <div className="w-16 h-16 rounded-full absolute border-4 border-[#051e2f] border-t-[#00b4d8] animate-spin"></div>
      <div className="w-12 h-12 rounded-full absolute top-2 left-2 border-4 border-[#0a3a5a] border-t-[#0077b6] animate-spin"></div>
    </div>
    <p className="mt-4 text-[#0077b6] font-medium">Loading ocean of data...</p>
  </div>
);

// Analytics card component
const AnalyticsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = OCEAN_COLORS.accent1,
  growth = 0 
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  icon: React.ReactNode;
  color?: string;
  growth?: number;
}) => (
  <div className="bg-[#051e2f]/60 backdrop-blur-sm border border-[#0077b6]/30 rounded-xl p-5 shadow-xl">
    <div className="flex justify-between">
      <div>
        <h3 className="text-[#ade8f4] text-sm font-medium mb-1">{title}</h3>
        <div className="flex items-baseline">
          <h2 className="text-white text-2xl font-bold">{value}</h2>
          {growth !== 0 && (
            <span className={`ml-2 text-sm ${growth > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {growth > 0 ? '↑' : '↓'} {Math.abs(growth)}%
            </span>
          )}
        </div>
        {subtitle && <p className="text-[#90e0ef] text-xs mt-1">{subtitle}</p>}
      </div>
      <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}30` }}>
        <div style={{ color }} className="text-2xl">
          {icon}
        </div>
      </div>
    </div>
  </div>
);

// Gauge chart component for system metrics
const GaugeChart = ({ 
  value, 
  maxValue, 
  title, 
  unit = '%',
  color = OCEAN_COLORS.accent1
}: { 
  value: number; 
  maxValue: number; 
  title: string; 
  unit?: string;
  color?: string;
}) => {
  // Calculate percentage and angle for gauge
  const percentage = Math.min((value / maxValue) * 100, 100);
  const angle = (percentage / 100) * 180;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-12 overflow-hidden">
        {/* Background meter */}
        <div className="absolute w-24 h-24 rounded-full border-8 border-[#051e2f] bottom-0"></div>
        
        {/* Colored meter fill */}
        <div 
          className="absolute w-24 h-24 rounded-full border-8 bottom-0"
          style={{ 
            borderColor: 'transparent', 
            borderTopColor: color,
            transform: `rotate(${angle - 180}deg)`,
            transition: 'transform 1s ease-out'
          }}
        ></div>
        
        {/* Glass cover effect */}
        <div className="absolute w-24 h-24 rounded-full bg-white/5 backdrop-blur-[1px] bottom-0"></div>
      </div>
      
      <div className="text-center mt-2">
        <div className="text-xl font-bold text-white">{value}{unit}</div>
        <div className="text-xs text-[#90e0ef]">{title}</div>
      </div>
    </div>
  );
};

// Main Analytics Dashboard Component
const Analytics: React.FC = () => {
  const [period, setPeriod] = useState<string>('month');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    if (!user) {
      // If user is not authenticated, wait for auth check to complete
      return;
    }
    
    // Log the user object to debug role issues
    console.log('Current user:', user);
    
    // Check if the user has 'admin' role in the roles array
    const hasAdminRole = user.roles && Array.isArray(user.roles) && 
                         user.roles.some(role => role.name === 'admin');
    
    // Only admins can access this page
    if (!hasAdminRole) {
      console.log('User is not an admin, redirecting to dashboard');
      navigate('/dashboard');
    } else {
      console.log('Admin user authenticated, showing analytics dashboard');
    }
  }, [user, navigate]);

  // Fetch analytics data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const analyticsData = await analyticsService.getAdminAnalytics(period);
        setData(analyticsData);
      } catch (err) {
        setError('Failed to load analytics data. Please try again later.');
        console.error('Analytics error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  // Format date for charts
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!user) {
    return <OceanLoading />;
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 text-[#ade8f4]">
      <div className="flex justify-between items-center mb-8">
      <OceanSidebar />
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <FaChartBar className="mr-2 text-[#00b4d8]" /> Analytics Dashboard
          </h1>
          <p className="text-[#90e0ef]">Dive deep into your ocean of data</p>
        </div>
        
        {/* Time period selector with ocean ripple effect on active */}
        <div className="bg-[#0a3a5a]/60 rounded-lg border border-[#0077b6]/30 p-1 flex shadow-lg">
          {['week', 'month', 'quarter', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => {
                console.log(`Changing period to: ${p}`);
                setPeriod(p);
                // Force refresh with animation
                setLoading(true);
                setTimeout(() => {
                  analyticsService.getAdminAnalytics(p)
                    .then(newData => {
                      console.log(`Received new data for period: ${p}`, newData);
                      setData(newData);
                      setLoading(false);
                    })
                    .catch(err => {
                      console.error(`Error fetching data for period: ${p}`, err);
                      setError('Failed to load analytics data. Please try again.');
                      setLoading(false);
                    });
                }, 300); // Small delay for animation
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                period === p 
                  ? 'bg-[#0077b6] text-white shadow-inner' 
                  : 'text-[#90e0ef] hover:bg-[#0c4c74]/50 hover:text-white'
              }`}
            >
              {/* Ocean ripple effect on active button */}
              {period === p && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="absolute w-full h-full opacity-30 animate-ripple rounded-full bg-[#00b4d8]"></span>
                </span>
              )}
              <span className="relative z-10">{p.charAt(0).toUpperCase() + p.slice(1)}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <OceanLoading />
      ) : data ? (
        <div className="space-y-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnalyticsCard 
              title="Total Users" 
              value={data.overview.totalUsers} 
              icon={<FaUsers />} 
              color={OCEAN_COLORS.accent1}
              growth={data.overview.userGrowth}
            />
            <AnalyticsCard 
              title="New Users" 
              value={data.overview.newUsers} 
              subtitle={`Last ${period}`}
              icon={<FaUsers />} 
              color={OCEAN_COLORS.accent2}
            />
            <AnalyticsCard 
              title="Total Projects" 
              value={data.overview.totalProjects} 
              icon={<FaProjectDiagram />} 
              color={OCEAN_COLORS.light1}
              growth={data.overview.projectGrowth}
            />
            <AnalyticsCard 
              title="New Projects" 
              value={data.overview.newProjects}
              subtitle={`Last ${period}`}
              icon={<FaProjectDiagram />} 
              color={OCEAN_COLORS.light2}
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Registration Trend */}
            <div className="bg-[#051e2f]/60 backdrop-blur-sm border border-[#0077b6]/30 rounded-xl p-5 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4">User Registrations</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data.trends.userRegistrations}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="userColorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={OCEAN_COLORS.accent1} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={OCEAN_COLORS.accent1} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#0a3a5a" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate} 
                      stroke="#90e0ef"
                      tick={{ fill: '#90e0ef' }}
                    />
                    <YAxis stroke="#90e0ef" tick={{ fill: '#90e0ef' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#051e2f', 
                        borderColor: '#0077b6',
                        color: '#fff' 
                      }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke={OCEAN_COLORS.accent1} 
                      fillOpacity={1} 
                      fill="url(#userColorGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Project Creation Trend */}
            <div className="bg-[#051e2f]/60 backdrop-blur-sm border border-[#0077b6]/30 rounded-xl p-5 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Project Creations</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.trends.projectCreations}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#0a3a5a" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate} 
                      stroke="#90e0ef"
                      tick={{ fill: '#90e0ef' }}
                    />
                    <YAxis stroke="#90e0ef" tick={{ fill: '#90e0ef' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#051e2f', 
                        borderColor: '#0077b6',
                        color: '#fff' 
                      }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke={OCEAN_COLORS.light1} 
                      strokeWidth={2}
                      dot={{ 
                        fill: OCEAN_COLORS.light1, 
                        stroke: OCEAN_COLORS.light1,
                        r: 4
                      }}
                      activeDot={{ 
                        fill: OCEAN_COLORS.light1, 
                        stroke: '#fff',
                        r: 6,
                        strokeWidth: 2
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Role Distribution */}
            <div className="bg-[#051e2f]/60 backdrop-blur-sm border border-[#0077b6]/30 rounded-xl p-5 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4">User Roles</h3>
              <div className="h-72 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.distributions.userRoles}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.distributions.userRoles.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#051e2f', 
                        borderColor: '#0077b6',
                        color: '#fff' 
                      }}
                      labelStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Project Type Distribution */}
            <div className="bg-[#051e2f]/60 backdrop-blur-sm border border-[#0077b6]/30 rounded-xl p-5 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Project Types</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.distributions.projectTypes}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#0a3a5a" />
                    <XAxis type="number" stroke="#90e0ef" tick={{ fill: '#90e0ef' }} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      stroke="#90e0ef" 
                      tick={{ fill: '#90e0ef' }}
                      width={80}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#051e2f', 
                        borderColor: '#0077b6',
                        color: '#fff' 
                      }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {data.distributions.projectTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-[#051e2f]/60 backdrop-blur-sm border border-[#0077b6]/30 rounded-xl p-5 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
              <div className="grid grid-cols-2 gap-4 mt-5">
                <GaugeChart 
                  value={data.system.cpu} 
                  maxValue={100} 
                  title="CPU" 
                  color={OCEAN_COLORS.accent1}
                />
                <GaugeChart 
                  value={data.system.memory} 
                  maxValue={100} 
                  title="Memory" 
                  color={OCEAN_COLORS.accent2}
                />
                <GaugeChart 
                  value={data.system.dbSize} 
                  maxValue={1000} 
                  title="Database" 
                  unit="MB"
                  color={OCEAN_COLORS.light1}
                />
                <div className="flex flex-col items-center justify-center">
                  <div className="text-2xl text-[#00b4d8]">
                    <FaServer />
                  </div>
                  <div className="text-xl font-bold text-white mt-2">{data.system.uptime}</div>
                  <div className="text-xs text-[#90e0ef]">Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ErrorMessage message="No data available" />
      )}
    </div>
  );
};

export default Analytics;
