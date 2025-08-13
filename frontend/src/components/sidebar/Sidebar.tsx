// frontend/src/components/layout/Sidebar.tsx (Enhanced version)
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  Video,
  BookOpen,
  Users,
  Settings,
  BarChart3,
  Trophy,
  Sparkles,
  ChevronRight,
  LayoutDashboard,
  UserCog,
  Shield,
  Plus
} from 'lucide-react';
import { useAuth } from '../../store';

const baseNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, description: 'Overview & stats', roles: ['STUDENT', 'MENTOR'] },
  { name: 'Resume Analyzer', href: '/resume', icon: FileText, description: 'AI-powered analysis', roles: ['STUDENT', 'MENTOR'] },
  { name: 'Mock Interviews', href: '/interview', icon: Video, description: 'Practice sessions', roles: ['STUDENT', 'MENTOR'] },
  { name: 'Courses', href: '/courses', icon: BookOpen, description: 'Learning paths', roles: ['STUDENT', 'MENTOR'] },
  { name: 'Community', href: '/community', icon: Users, description: 'Connect & share', roles: ['STUDENT', 'MENTOR'] },
  { name: 'Progress', href: '/progress', icon: BarChart3, description: 'Track growth', roles: ['STUDENT', 'MENTOR'] },
  { name: 'Achievements', href: '/achievements', icon: Trophy, description: 'Your milestones', roles: ['STUDENT', 'MENTOR'] },
];

const adminNavigation = [
  { name: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard, description: 'Platform analytics', roles: ['ADMIN'] },
  { name: 'Manage Users', href: '/admin/users', icon: UserCog, description: 'User management', roles: ['ADMIN'] },
  { name: 'Manage Courses', href: '/admin/courses', icon: BookOpen, description: 'Course management', roles: ['ADMIN'] },
  { name: 'Manage Quizzes', href: '/admin/quizzes', icon: Trophy, description: 'Quiz management', roles: ['ADMIN'] },
];

const settingsNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings, description: 'Account settings', roles: ['STUDENT', 'MENTOR'] },
  { name: 'Admin Settings', href: '/admin/settings', icon: Shield, description: 'Platform settings', roles: ['ADMIN'] },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Filter navigation based on user role
  const getFilteredNavigation = () => {
    const userRole = user?.role || 'STUDENT';
    const allNavigation = [...baseNavigation, ...adminNavigation, ...settingsNavigation];
    
    return allNavigation.filter(item => item.roles.includes(userRole));
  };

  const navigation = getFilteredNavigation();

  // Separate admin and regular navigation for better organization
  const regularNav = navigation.filter(item => !item.href.startsWith('/admin'));
  const adminNav = navigation.filter(item => item.href.startsWith('/admin'));

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
      <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200 shadow-sm">
        
        {/* Logo Section */}
        <div className="flex items-center flex-shrink-0 px-6 py-2.5 border-b border-gray-100 bg-white">
          <div className="flex items-center space-x-3">
            <div className={`${user?.role === 'ADMIN' ? 'bg-red-500' : 'bg-blue-500'} rounded-lg p-2 shadow-md`}>
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Mockitt</h1>
              <p className="text-xs text-gray-500 font-medium">
                {user?.role === 'ADMIN' ? 'Admin Panel' : 'AI Career Platform'}
              </p>
            </div>
          </div>
          
          {/* Role Badge */}
          {user?.role === 'ADMIN' && (
            <div className="ml-auto">
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                ADMIN
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col overflow-y-auto pt-4 pb-6 px-3">
          <nav className="flex-1 space-y-1">
            
            {/* Regular Navigation */}
            {regularNav.map((item) => {
              const isActive = 
              location.pathname === item.href || 
              (item.href === '/admin' && location.pathname.startsWith('/admin')) ||
              (item.href !== '/dashboard' && item.href !== '/admin' && location.pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group relative flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className={`flex-shrink-0 mr-3 p-1 rounded-md transition-colors duration-200 ${
                    isActive ? 'bg-blue-100' : 'group-hover:bg-gray-100'
                  }`}>
                    <item.icon className={`h-4 w-4 ${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{item.name}</div>
                    <div className={`text-xs truncate transition-colors duration-200 ${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`}>
                      {item.description}
                    </div>
                  </div>

                  {isActive && (
                    <ChevronRight className="h-4 w-4 text-blue-500" />
                  )}
                </Link>
              );
            })}

            {/* Admin Navigation Section */}
            {adminNav.length > 0 && (
              <>
                <div className="pt-4 pb-2">
                  <div className="px-3 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Administration
                    </h3>
                  </div>
                </div>
                
                {adminNav.map((item) => {
                  const isActive = location.pathname === item.href || 
                    (item.href !== '/admin' && location.pathname.startsWith(item.href));
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group relative flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-red-50 text-red-700 border border-red-200 shadow-sm'
                          : 'text-gray-600 hover:bg-red-50 hover:text-red-700'
                      }`}
                    >
                      <div className={`flex-shrink-0 mr-3 p-1 rounded-md transition-colors duration-200 ${
                        isActive ? 'bg-red-100' : 'group-hover:bg-red-100'
                      }`}>
                        <item.icon className={`h-4 w-4 ${
                          isActive ? 'text-red-600' : 'text-gray-400 group-hover:text-red-500'
                        }`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">{item.name}</div>
                        <div className={`text-xs truncate transition-colors duration-200 ${
                          isActive ? 'text-red-600' : 'text-gray-400 group-hover:text-red-500'
                        }`}>
                          {item.description}
                        </div>
                      </div>

                      {isActive && (
                        <ChevronRight className="h-4 w-4 text-red-500" />
                      )}
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          {/* Quick Actions for Admin */}
          {user?.role === 'ADMIN' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  to="/admin/courses/create"
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Course</span>
                </Link>
                <Link
                  to="/admin/quizzes/create"
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Quiz</span>
                </Link>
              </div>
            </div>
          )}

          {/* Premium CTA for Students */}
          {user?.role !== 'ADMIN' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-4 text-white shadow-lg">
                <div className="flex items-start space-x-3">
                  <div className="bg-white/20 rounded-md p-1.5">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Upgrade to Pro</p>
                    <p className="text-blue-100 text-xs mt-1">Unlock advanced AI features and personalized coaching</p>
                    <button className="mt-2 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1 rounded-md transition-colors">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
