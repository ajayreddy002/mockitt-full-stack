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
  ChevronRight
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, description: 'Overview & stats' },
  { name: 'Resume Analyzer', href: '/resume', icon: FileText, description: 'AI-powered analysis' },
  { name: 'Mock Interviews', href: '/interview', icon: Video, description: 'Practice sessions' },
  { name: 'Courses', href: '/courses', icon: BookOpen, description: 'Learning paths' },
  { name: 'Community', href: '/community', icon: Users, description: 'Connect & share' },
  { name: 'Progress', href: '/progress', icon: BarChart3, description: 'Track growth' },
  { name: 'Achievements', href: '/achievements', icon: Trophy, description: 'Your milestones' },
  { name: 'Settings', href: '/settings', icon: Settings, description: 'Account settings' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
      <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200 shadow-sm">
        
        {/* Logo Section */}
        <div className="flex items-center flex-shrink-0 px-6 py-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 rounded-lg p-2 shadow-md">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Mockitt</h1>
              <p className="text-xs text-gray-500 font-medium">AI Career Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col overflow-y-auto pt-4 pb-6 px-3">
          <nav className="flex-1 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              
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
                  {/* Icon */}
                  <div className={`flex-shrink-0 mr-3 p-1 rounded-md transition-colors duration-200 ${
                    isActive ? 'bg-blue-100' : 'group-hover:bg-gray-100'
                  }`}>
                    <item.icon className={`h-4 w-4 ${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{item.name}</div>
                    <div className={`text-xs truncate transition-colors duration-200 ${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`}>
                      {item.description}
                    </div>
                  </div>

                  {/* Active Chevron */}
                  {isActive && (
                    <ChevronRight className="h-4 w-4 text-blue-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Premium CTA */}
          <div className="mt-4">
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
        </div>
      </div>
    </div>
  );
};
