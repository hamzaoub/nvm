import axios from '@/lib/axios';

export interface AnalyticsData {
  overview: {
    totalUsers: number;
    newUsers: number;
    userGrowth: number;
    totalProjects: number;
    newProjects: number;
    projectGrowth: number;
  };
  trends: {
    userRegistrations: Array<{ date: string; count: number }>;
    projectCreations: Array<{ date: string; count: number }>;
  };
  distributions: {
    userRoles: Array<{ name: string; value: number; color: string }>;
    projectTypes: Array<{ name: string; value: number; color: string }>;
  };
  system: {
    cpu: number;
    memory: number;
    dbSize: number;
    uptime: string;
  };
}

const analyticsService = {
  /**
   * Get admin analytics dashboard data
   * @param period Time period for analytics (week, month, quarter, year)
   * @returns Analytics data for admin dashboard
   */
  async getAdminAnalytics(period: string = 'month'): Promise<AnalyticsData> {
    try {
      console.log('Fetching analytics data for period:', period);
      const response = await axios.get(`/api/analytics/dashboard`, {
        params: { period }
      });
      console.log('Analytics API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  }
};

export default analyticsService;
