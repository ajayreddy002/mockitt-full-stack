// frontend/src/components/layout/AdminLayout.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  // LayoutDashboard,
  // BookOpen,
  // Users,
  // Trophy,
  // Settings,
  // LogOut,
  // Bell,
  Plus,
  // BarChart3
} from 'lucide-react';
// import { useAuth } from '../../store';
import { Sidebar } from '../../components/sidebar/Sidebar';
import { UnifiedHeader } from '../../components/common/UnifiedHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  // const location = useLocation();
  // const navigate = useNavigate();
  // const { user, logout } = useAuth();

  // // const navigationItems = [
  // //   { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  // //   { path: '/admin/courses', icon: BookOpen, label: 'Courses' },
  // //   { path: '/admin/users', icon: Users, label: 'Users' },
  // //   { path: '/admin/quizzes', icon: Trophy, label: 'Quizzes' },
  // //   { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  // //   { path: '/admin/settings', icon: Settings, label: 'Settings' },
  // // ];

  // // const handleLogout = async () => {
  // //   await logout();
  // //   navigate('/login');
  // // };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <UnifiedHeader
        showSearch={false}
        title="Admin Panel"
      />

      <div className="flex">
        {/* Admin Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen border-r border-gray-200">
          <Sidebar />

          {/* Quick Actions */}
          <div className="p-4 border-t border-gray-200 mt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to="/admin/courses/create"
                className="flex items-center justify-center space-x-2 w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Create Course</span>
              </Link>
              <Link
                to="/admin/quizzes/create"
                className="flex items-center justify-center space-x-2 w-full px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Create Quiz</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
