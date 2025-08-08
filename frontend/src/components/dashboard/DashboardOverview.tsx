import React from 'react';
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
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../store';

const stats = [
  { 
    name: 'Resumes Analyzed', 
    value: '0', 
    icon: FileText, 
    change: '+0%', 
    changeType: 'increase',
    color: 'blue'
  },
  { 
    name: 'Mock Interviews', 
    value: '0', 
    icon: Video, 
    change: '+0%', 
    changeType: 'increase',
    color: 'green'
  },
  { 
    name: 'Courses Completed', 
    value: '0', 
    icon: BookOpen, 
    change: '+0%', 
    changeType: 'increase',
    color: 'purple'
  },
  { 
    name: 'Career Readiness', 
    value: '25%', 
    icon: TrendingUp, 
    change: '+5%', 
    changeType: 'increase',
    color: 'orange'
  },
];

const recentActivity = [
  { action: 'Account created', time: 'Just now', icon: CheckCircle, iconColor: 'text-green-500' },
  { action: 'Welcome email sent', time: '1 min ago', icon: Clock, iconColor: 'text-blue-500' },
];

const quickActions = [
  {
    title: 'Upload Your Resume',
    description: 'Get AI-powered analysis and improvement tips',
    icon: FileText,
    href: '/resume',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/10'
  },
  {
    title: 'Start Mock Interview',
    description: 'Practice with AI interviewer',
    icon: Video,
    href: '/interview',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-500/10'
  },
  {
    title: 'Browse Courses',
    description: 'Skill up with curated learning paths',
    icon: BookOpen,
    href: '/courses',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500/10'
  },
];

export const DashboardOverview: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8 bg-gradient-to-r from-white to-blue-50/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Ready to boost your career with AI-powered preparation?
          </p>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              <Target className="h-4 w-4" />
              <span>Career Ready: 25%</span>
            </div>
            <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              <Zap className="h-4 w-4" />
              <span>Premium Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div 
            key={stat.name} 
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
                    style={{ width: `${Math.random() * 60 + 20}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Get Started Card */}
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
              {quickActions.map((action, index) => (
                <a
                  key={action.title}
                  href={action.href}
                  className="group flex items-center p-4 border border-gray-200 rounded-xl hover:border-transparent hover:shadow-lg transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className={`${action.bgColor} p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className={`h-6 w-6 bg-gradient-to-r ${action.color} bg-clip-text text-transparent`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                      {action.title}
                    </p>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Award className="h-5 w-5 text-purple-500 mr-2" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.map((item, itemIdx) => (
              <div key={itemIdx} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${item.iconColor} bg-opacity-10`}>
                  <item.icon className={`h-4 w-4 ${item.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{item.action}</p>
                  <p className="text-xs text-gray-500">{item.time}</p>
                </div>
              </div>
            ))}
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
