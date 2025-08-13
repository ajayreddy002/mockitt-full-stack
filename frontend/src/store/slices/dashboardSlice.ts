import { type StateCreator } from 'zustand';
import type { RootState } from '../index';
import { mockittAPI } from '../../services/api';

export interface DashboardStats {
  resumesAnalyzed: number;
  mockInterviews: number;
  coursesCompleted: number;
  careerReadiness: number;
  resumeAnalysisChange: string;
  interviewChange: string;
  coursesChange: string;
  readinessChange: string;
}

export interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: string;
  color: string;
  bgColor: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  time: string;
  icon: string;
  iconColor: string;
  type: 'session' | 'resume' | 'course' | 'achievement' | 'system';
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivity: ActivityItem[];
  quickActions: QuickAction[];
  userProgress: {
    completedTasks: number;
    totalTasks: number;
    weeklyGoal: number;
    currentStreak: number;
  };
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    earnedAt: Date;
    icon: string;
  }>;
}

export interface DashboardSlice {
  // State - ✅ Use unique property names to avoid conflicts
  dashboardData: DashboardData | null;
  dashboardLoading: boolean;  // ✅ Changed from isLoading to dashboardLoading
  dashboardError: string | null;  // ✅ Changed from error to dashboardError
  lastUpdated: Date | null;
  
  // Actions
  fetchDashboardData: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchRecentActivity: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  clearDashboardError: () => void;
  markActivityAsRead: (activityId: string) => void;
}

export const dashboardSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  DashboardSlice
> = (set, get) => ({
  // Initial state - ✅ Use renamed properties
  dashboardData: null,
  dashboardLoading: false,  // ✅ Renamed
  dashboardError: null,     // ✅ Renamed
  lastUpdated: null,

  // ✅ Update all references to use new property names
  fetchDashboardData: async () => {
    set((state) => {
      state.dashboardLoading = true;  // ✅ Updated reference
      state.dashboardError = null;   // ✅ Updated reference
    });

    try {
      const [statsResponse, activityResponse, progressResponse] = await Promise.all([
        mockittAPI.dashboard.getStats(),
        mockittAPI.dashboard.getRecentActivity(),
        mockittAPI.dashboard.getUserProgress()
      ]);

      set((state) => {
        state.dashboardData = {
          stats: statsResponse.data,
          recentActivity: activityResponse.data,
          quickActions: [
            {
              title: 'Upload Your Resume',
              description: 'Get AI-powered analysis and improvement tips',
              href: '/resume',
              icon: 'FileText',
              color: 'from-blue-500 to-blue-600',
              bgColor: 'bg-blue-500/10'
            },
            {
              title: 'Start Mock Interview',
              description: 'Practice with AI interviewer',
              href: '/interview',
              icon: 'Video',
              color: 'from-green-500 to-green-600',
              bgColor: 'bg-green-500/10'
            },
            {
              title: 'Browse Courses',
              description: 'Skill up with curated learning paths',
              href: '/courses',
              icon: 'BookOpen',
              color: 'from-purple-500 to-purple-600',
              bgColor: 'bg-purple-500/10'
            }
          ],
          userProgress: progressResponse.data,
          achievements: progressResponse.data.achievements || []
        };
        state.dashboardLoading = false;  // ✅ Updated reference
        state.lastUpdated = new Date();
      });
    } catch (error) {
      set((state) => {
        state.dashboardError = 'Failed to load dashboard data';  // ✅ Updated reference
        state.dashboardLoading = false;  // ✅ Updated reference
      });
      
      get().handleApiError?.(error, 'fetchDashboardData');
    }
  },

  fetchStats: async () => {
    try {
      const response = await mockittAPI.dashboard.getStats();
      set((state) => {
        if (state.dashboardData) {
          state.dashboardData.stats = response.data;
          state.lastUpdated = new Date();
        }
      });
    } catch (error) {
      get().handleApiError?.(error, 'fetchStats');
    }
  },

  fetchRecentActivity: async () => {
    try {
      const response = await mockittAPI.dashboard.getRecentActivity();
      set((state) => {
        if (state.dashboardData) {
          state.dashboardData.recentActivity = response.data;
          state.lastUpdated = new Date();
        }
      });
    } catch (error) {
      get().handleApiError?.(error, 'fetchRecentActivity');
    }
  },

  refreshDashboard: async () => {
    await get().fetchDashboardData();
  },

  clearDashboardError: () => {
    set((state) => {
      state.dashboardError = null;  // ✅ Updated reference
    });
  },

  markActivityAsRead: (activityId: string) => {
    set((state) => {
      if (state.dashboardData?.recentActivity) {
        state.dashboardData.recentActivity = state.dashboardData.recentActivity.filter(
          a => a.id !== activityId
        );
      }
    });
  }
});