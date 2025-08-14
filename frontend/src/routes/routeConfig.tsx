/* eslint-disable react-refresh/only-export-components */
import type { ComponentType } from 'react';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { ResumePage } from '../pages/resume/ResumePage';
import { ResumeAnalysisPage } from '../pages/resume/ResumeAnalysisPage';
import { InterviewSessionPage } from '../pages/interview/InterviewSessionPage';
import { InterviewSetupPage } from '../pages/interview/InterviewSetupPage';
import { InterviewDashboard } from '../pages/interview/InterviewDashboard';
import { InterviewResultsPage } from '../pages/interview/InterviewResultsPage';
import { CourseDetailPage } from '../pages/courses/CourseDetail';
import { CoursesCatalog } from '../pages/courses/CoursesCatalog';
import { QuizTaking } from '../pages/quizz/QuizTaking';
import { QuizResults } from '../pages/quizz/QuizResults';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminCourseList } from '../pages/admin/courses/AdminCourseList';
import { AdminUserList } from '../pages/admin/users/UserList';
import { AdminCourseEditor } from '../pages/admin/courses/AdminCourseEditor';
import { AdminQuizEditor } from '../pages/quizzes/AdminQuizEditor';
import { LearnPage } from '../pages/learn/LearnPage';

// Placeholder components

const CommunityPage = () => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">👥 Community</h2>
    <p className="text-gray-600">Community forum coming soon!</p>
  </div>
);

const ProgressPage = () => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Progress</h2>
    <p className="text-gray-600">Progress tracking coming soon!</p>
  </div>
);

const AchievementsPage = () => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">🏆 Achievements</h2>
    <p className="text-gray-600">Achievement system coming soon!</p>
  </div>
);

const SettingsPage = () => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">⚙️ Settings</h2>
    <p className="text-gray-600">User settings coming soon!</p>
  </div>
);

export interface RouteConfig {
  path: string;
  component: ComponentType;
  isProtected: boolean;
  requiresDashboardLayout: boolean;
  requiredRole?: 'ADMIN' | 'MENTOR' | 'STUDENT'; // ✅ Add role requirement
  adminOnly?: boolean; // ✅ Add admin-only flag
  title?: string;
  description?: string;
}

export const routes: RouteConfig[] = [
  // Public Routes
  {
    path: '/login',
    component: LoginPage,
    isProtected: false,
    requiresDashboardLayout: false,
    title: 'Login',
    description: 'Sign in to your Mockitt account'
  },
  {
    path: '/register',
    component: RegisterPage,
    isProtected: false,
    requiresDashboardLayout: false,
    title: 'Register',
    description: 'Create your Mockitt account'
  },
  
  // Protected Dashboard Routes
  {
    path: '/dashboard',
    component: DashboardPage,
    isProtected: true,
    requiresDashboardLayout: true,
    title: 'Dashboard',
    description: 'Your career preparation overview'
  },
  {
    path: '/resume',
    component: ResumePage,
    isProtected: true,
    requiresDashboardLayout: true,
    title: 'Resume Analyzer',
    description: 'AI-powered resume analysis and optimization'
  },
  {
    path: '/resume/:id/analysis',
    component: ResumeAnalysisPage,
    isProtected: true,
    requiresDashboardLayout: true,
    title: 'Resume Analysis',
    description: 'Detailed resume analysis results'
  },
  {
    path: '/interview',
    component: InterviewDashboard,
    isProtected: true,
    requiresDashboardLayout: true,
    title: 'Interview Dashboard',
    description: 'AI-powered mock interview preparation'
  },
  {
    path: '/interview/setup',
    component: InterviewSetupPage,
    isProtected: true,
    requiresDashboardLayout: true,
    title: 'Setup Interview',
    description: 'Configure your mock interview session'
  },
  {
    path: '/interview/:sessionId/session',
    component: InterviewSessionPage,
    isProtected: true,
    requiresDashboardLayout: true,
    title: 'Mock Interview Session',
    description: 'AI-powered mock interview practice'
  },
  {
    path: '/interview/:sessionId/results',
    component: InterviewResultsPage,
    isProtected: true,
    requiresDashboardLayout: true,
    title: 'Interview Results',
    description: 'Detailed analysis of your mock interview performance'
  },
  {
    path: '/courses',
    component: CoursesCatalog,
    isProtected: true,
    requiresDashboardLayout: true,
    title: 'Courses',
    description: 'Industry-focused skill development courses and learning paths'
  },
  {
    path: '/courses/:courseId',
    component: CourseDetailPage,
    isProtected: true,
    requiresDashboardLayout: true,
    title: 'Course Details',
    description: 'View course information and enroll'
  },
  {
    path: '/courses/:courseId/quiz/:quizId',
    component: QuizTaking,
    isProtected: true,
    requiresDashboardLayout: true,
    title: 'Course Details',
    description: 'View course information and enroll'
  },
  {
    path: '/courses/:courseId/quiz/:quizId/results',
    component: QuizResults,
    isProtected: true,
    requiresDashboardLayout: true,
    title: 'Course Details',
    description: 'View course information and enroll'
  },
  {
    path: '/learn',
    component: LearnPage,
    isProtected: true,
    requiresDashboardLayout: true, // Since it has its own layout
    title: 'Learn',
    description: 'Course lesson learning page'
  },
  {
    path: '/community',
    component: CommunityPage,
    isProtected: true,
    requiresDashboardLayout: true,
    title: 'Community',
    description: 'Connect with peers and mentors'
  },
  {
    path: '/progress',
    component: ProgressPage,
    isProtected: true,
    requiresDashboardLayout: true,
    title: 'Progress',
    description: 'Track your career preparation journey'
  },
  {
    path: '/achievements',
    component: AchievementsPage,
    isProtected: true,
    requiresDashboardLayout: true,
    title: 'Achievements',
    description: 'Your accomplishments and milestones'
  },
  {
    path: '/settings',
    component: SettingsPage,
    isProtected: true,
    requiresDashboardLayout: true,
    title: 'Settings',
    description: 'Manage your account and preferences'
  },
  {
    path: '/admin',
    component: AdminDashboard,
    isProtected: true,
    requiresDashboardLayout: true, // Admin has its own layout
    adminOnly: true,
    requiredRole: 'ADMIN',
    title: 'Admin Dashboard',
    description: 'Administrative dashboard and analytics'
  },
  {
    path: '/admin/courses',
    component: AdminCourseList,
    isProtected: true,
    requiresDashboardLayout: true,
    adminOnly: true,
    requiredRole: 'ADMIN',
    title: 'Manage Courses',
    description: 'Course management and administration'
  },
  {
    path: '/admin/courses/create',
    component: AdminCourseEditor,
    isProtected: true,
    requiresDashboardLayout: true,
    adminOnly: true,
    requiredRole: 'ADMIN',
    title: 'Create Course',
    description: 'Create new course content'
  },
  {
    path: '/admin/courses/:courseId/edit',
    component: AdminCourseEditor,
    isProtected: true,
    requiresDashboardLayout: true,
    adminOnly: true,
    requiredRole: 'ADMIN',
    title: 'Edit Course',
    description: 'Edit existing course content'
  },
  {
    path: '/admin/users',
    component: AdminUserList,
    isProtected: true,
    requiresDashboardLayout: true,
    adminOnly: true,
    requiredRole: 'ADMIN',
    title: 'Manage Users',
    description: 'User management and administration'
  },
  {
    path: '/admin/quizzes',
    component: AdminQuizEditor,
    isProtected: true,
    requiresDashboardLayout: true,
    adminOnly: true,
    requiredRole: 'ADMIN',
    title: 'Manage Quizzes',
    description: 'Quiz creation and management'
  },
];

// Helper functions
export const getRouteByPath = (path: string): RouteConfig | undefined => {
  return routes.find(route => route.path === path);
};

export const getProtectedRoutes = (): RouteConfig[] => {
  return routes.filter(route => route.isProtected);
};

export const getPublicRoutes = (): RouteConfig[] => {
  return routes.filter(route => !route.isProtected);
};

export const getDashboardRoutes = (): RouteConfig[] => {
  return routes.filter(route => route.requiresDashboardLayout);
};
export const getAdminRoutes = (): RouteConfig[] => {
  return routes.filter(route => route.adminOnly);
};

export const getRoutesByRole = (role: string): RouteConfig[] => {
  return routes.filter(route => 
    !route.requiredRole || route.requiredRole === role || role === 'ADMIN'
  );
};
