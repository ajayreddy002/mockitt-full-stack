/* eslint-disable @typescript-eslint/no-explicit-any */
// frontend/src/pages/admin/AdminDashboard.tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  Trophy, 
  BarChart3, 
  Plus,
  TrendingUp,
  // Clock,
  CheckCircle
} from 'lucide-react';
import { useAdminStore } from '../../store';

export const AdminDashboard: React.FC = () => {
  const {
    dashboardStats,
    loading,
    fetchDashboardStats
  } = useAdminStore();

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-gray-300 h-32 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-300 h-64 rounded-lg"></div>
          <div className="bg-gray-300 h-64 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your Mockitt platform</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/admin/courses/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Course</span>
          </Link>
          <Link
            to="/admin/users"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2 transition-colors"
          >
            <Users className="h-4 w-4" />
            <span>Manage Users</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardStats?.totalUsers || 0}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from last month
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Published Courses</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardStats?.publishedCourses || 0}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +3 this week
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardStats?.totalEnrollments || 0}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +28% from last month
              </p>
            </div>
            <Trophy className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Quiz Completions</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardStats?.quizCompletions || 0}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +15% from last week
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Enrollments</h3>
            <Link to="/admin/users" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {dashboardStats?.recentEnrollments?.map((enrollment: any) => (
              <div key={enrollment.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {enrollment.user.firstName?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{enrollment.user.firstName} {enrollment.user.lastName}</p>
                    <p className="text-sm text-gray-600">{enrollment.course.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">{enrollment.enrolledAt}</span>
                  <p className="text-xs text-green-600 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </p>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No recent enrollments</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Courses</h3>
            <Link to="/admin/courses" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Manage All
            </Link>
          </div>
          <div className="space-y-4">
            {dashboardStats?.topCourses?.map((course: any) => (
              <div key={course.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{course.title}</p>
                  <p className="text-sm text-gray-600">{course.enrollmentCount} students enrolled</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-green-600">{course.completionRate}%</span>
                  <p className="text-xs text-gray-500">completion rate</p>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No courses available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/courses/create"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Plus className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Create Course</p>
              <p className="text-sm text-gray-600">Add new course content</p>
            </div>
          </Link>

          <Link
            to="/admin/users"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Manage Users</p>
              <p className="text-sm text-gray-600">View and edit users</p>
            </div>
          </Link>

          <Link
            to="/admin/quizzes/create"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Trophy className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Create Quiz</p>
              <p className="text-sm text-gray-600">Add assessments</p>
            </div>
          </Link>

          <Link
            to="/admin/analytics"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">View Analytics</p>
              <p className="text-sm text-gray-600">Platform insights</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
