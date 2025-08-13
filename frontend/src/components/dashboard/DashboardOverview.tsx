/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import {
  FileText,
  Video,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle,
  Zap,
  Target,
  Award,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useAuth, useDashboard } from '../../store';

export const DashboardOverview: React.FC = () => {
  const { user } = useAuth();

  // ✅ Use store instead of direct API calls
  const {
    dashboardData,
    isLoading,
    error,
    lastUpdated,
    fetchDashboardData,
    refreshDashboard,
    clearDashboardError,
    markActivityAsRead
  } = useDashboard();

  // ✅ Fetch data through store on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Loading state with professional skeleton
  if (isLoading && !dashboardData) {
    return <DashboardSkeleton />;
  }

  // Error state with retry option
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Dashboard Loading Failed
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              clearDashboardError();
              fetchDashboardData();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats;
  const recentActivity = dashboardData?.recentActivity || [];
  const quickActions = dashboardData?.quickActions || [];

  return (
    <div className="space-y-8">
      {/* Enhanced Welcome Header with Real Data */}
      <div className="bg-white rounded-2xl shadow-xl p-8 bg-gradient-to-r from-white to-blue-50/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Ready to boost your career with AI-powered preparation?
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  <Target className="h-4 w-4" />
                  <span>Career Ready: {stats?.careerReadiness || 0}%</span>
                </div>
                <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  <Zap className="h-4 w-4" />
                  <span>Premium Active</span>
                </div>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={refreshDashboard}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="text-xs">
                {lastUpdated ? `Updated ${new Date(lastUpdated).toLocaleTimeString()}` : 'Never'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Real Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            name: 'Resumes Analyzed',
            value: stats?.resumesAnalyzed || 0,
            icon: FileText,
            change: stats?.resumeAnalysisChange || '+0%',
            changeType: 'increase',
            color: 'blue'
          },
          {
            name: 'Mock Interviews',
            value: stats?.mockInterviews || 0,
            icon: Video,
            change: stats?.interviewChange || '+0%',
            changeType: 'increase',
            color: 'green'
          },
          {
            name: 'Courses Completed',
            value: stats?.coursesCompleted || 0,
            icon: BookOpen,
            change: stats?.coursesChange || '+0%',
            changeType: 'increase',
            color: 'purple'
          },
          {
            name: 'Career Readiness',
            value: `${stats?.careerReadiness || 0}%`,
            icon: TrendingUp,
            change: stats?.readinessChange || '+0%',
            changeType: 'increase',
            color: 'orange'
          },
        ].map((stat, index) => (
          <ProfessionalStatCard key={stat.name} stat={stat} index={index} />
        ))}
      </div>

      {/* Enhanced Quick Actions & Activity Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Quick Actions with Real Data */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                <Zap className="h-6 w-6 text-yellow-500 mr-2" />
                Quick Actions
              </h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="space-y-4">
              {quickActions.map((action: any, index: number) => (
                <QuickActionCard key={action.title} action={action} index={index} />
              ))}
            </div>
          </div>
        </div>

        {/* Real Recent Activity */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Award className="h-5 w-5 text-purple-500 mr-2" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((item: any) => (
                <ActivityItem
                  key={item.id}
                  item={item}
                  onMarkAsRead={markActivityAsRead}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">No recent activity</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
              View All Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Professional Stat Card Component
const ProfessionalStatCard: React.FC<{
  stat: any;
  index: number;
}> = ({ stat, index }) => (
  <div
    className="group bg-white overflow-hidden shadow-lg hover:shadow-xl rounded-2xl transition-all duration-300 hover:-translate-y-1"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 rounded-xl p-2 shadow-lg`}>
          <stat.icon className="h-6 w-6 text-white" />
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          <div className="text-xs text-green-600 font-medium">{stat.change}</div>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-1">{stat.name}</h3>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`bg-gradient-to-r from-${stat.color}-400 to-${stat.color}-500 h-2 rounded-full transition-all duration-1000`}
            style={{ width: `${Math.min((typeof stat.value === 'string' ? parseInt(stat.value) : stat.value) / 10 * 100, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  </div>
);

// Quick Action Card Component
const QuickActionCard: React.FC<{
  action: any;
  index: number;
}> = ({ action, index }) => (
  <a
    href={action.href}
    className="group flex items-center p-4 border border-gray-200 rounded-xl hover:border-transparent hover:shadow-lg transition-all duration-300 hover:scale-105"
    style={{ animationDelay: `${index * 150}ms` }}
  >
    <div className={`${action.bgColor} p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300`}>
      {action.icon === 'FileText' && <FileText className="h-6 w-6 text-blue-600" />}
      {action.icon === 'Video' && <Video className="h-6 w-6 text-green-600" />}
      {action.icon === 'BookOpen' && <BookOpen className="h-6 w-6 text-purple-600" />}
    </div>
    <div className="flex-1">
      <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
        {action.title}
      </p>
      <p className="text-sm text-gray-500">{action.description}</p>
    </div>
    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
  </a>
);

// Activity Item Component
const ActivityItem: React.FC<{
  item: any;
  onMarkAsRead: (id: string) => void;
}> = ({ item, onMarkAsRead }) => (
  <div className="flex items-start space-x-3 group">
    <div className={`p-2 rounded-lg ${item.iconColor} bg-opacity-10`}>
      {item.icon === 'CheckCircle' && <CheckCircle className={`h-4 w-4 ${item.iconColor}`} />}
      {item.icon === 'Clock' && <Clock className={`h-4 w-4 ${item.iconColor}`} />}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900">{item.action}</p>
      <p className="text-xs text-gray-500">{item.time}</p>
    </div>
    <button
      onClick={() => onMarkAsRead(item.id)}
      className="opacity-0 group-hover:opacity-100 text-xs text-blue-600 hover:text-blue-800 transition-opacity"
    >
      Mark Read
    </button>
  </div>
);

// Dashboard Skeleton Component
const DashboardSkeleton: React.FC = () => (
  <div className="space-y-8 animate-pulse">
    {/* Header Skeleton */}
    <div className="bg-gray-200 rounded-2xl h-48"></div>

    {/* Stats Grid Skeleton */}
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-gray-200 rounded-2xl h-32"></div>
      ))}
    </div>

    {/* Content Skeleton */}
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 bg-gray-200 rounded-2xl h-96"></div>
      <div className="bg-gray-200 rounded-2xl h-96"></div>
    </div>
  </div>
);
