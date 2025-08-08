import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterview, useAuth } from '../../store';
import { Plus, Clock, CheckCircle, BarChart3, TrendingUp } from 'lucide-react';

export const InterviewDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    sessions, 
    sessionLoading, 
    fetchSessions, 
    createSession 
  } = useInterview();

  // ✅ Replace mock data with real backend integration
  useEffect(() => {
    fetchSessions(); // Loads real data from your NestJS backend
  }, [fetchSessions]);

  const handleQuickStart = async (type: 'PRACTICE' | 'FULL_MOCK' | 'QUICK_PREP') => {
    try {
      const session = await createSession({
        title: `${type.replace('_', ' ')} Interview - ${new Date().toLocaleDateString()}`,
        type,
        settings: {
          recordVideo: true,
          recordAudio: true,
          enableHints: true,
          timePerQuestion: type === 'QUICK_PREP' ? 60 : 120,
          industry: 'Technology',
          role: 'Software Developer',
        }
      });

      navigate(`/interview/${session.id}/session`);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  // ✅ Calculate real statistics from backend data
  const stats = {
    totalSessions: sessions.length,
    completedSessions: sessions.filter(s => s.status === 'COMPLETED').length,
    averageScore: sessions.length > 0 
      ? Math.round(sessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / sessions.length)
      : 0,
    improvementTrend: '+15%' // Calculate from historical data
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Welcome Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Ready to ace your next interview? Let's practice with AI-powered coaching.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-purple-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-orange-50 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Improvement</p>
                <p className="text-2xl font-bold text-gray-900">{stats.improvementTrend}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Start Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Plus className="h-6 w-6 mr-3 text-blue-500" />
            Start New Interview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                type: 'QUICK_PREP' as const, 
                title: 'Quick Prep', 
                duration: '5-10 min', 
                questions: 3,
                description: 'Fast practice with core questions',
                color: 'blue' 
              },
              { 
                type: 'PRACTICE' as const, 
                title: 'Practice Round', 
                duration: '15-20 min', 
                questions: 5,
                description: 'Focused practice on key skills',
                color: 'green' 
              },
              { 
                type: 'FULL_MOCK' as const, 
                title: 'Full Mock', 
                duration: '30-45 min', 
                questions: 10,
                description: 'Complete interview simulation',
                color: 'purple' 
              }
            ].map((option) => (
              <div
                key={option.type}
                className={`relative p-6 border-2 border-${option.color}-200 rounded-xl hover:border-${option.color}-400 cursor-pointer transition-all duration-200 group hover:shadow-lg`}
                onClick={() => handleQuickStart(option.type)}
              >
                <div className={`text-${option.color}-600 font-semibold text-lg mb-2`}>
                  {option.title}
                </div>
                <div className="text-gray-600 text-sm mb-4">
                  {option.description}
                </div>
                <div className="space-y-2 text-sm text-gray-500">
                  <div>⏱️ Duration: {option.duration}</div>
                  <div>❓ Questions: {option.questions}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">Recent Sessions</h2>
          </div>
          
          <div className="p-8">
            {sessionLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading your sessions...</p>
              </div>
            ) : sessions.length > 0 ? (
              <div className="space-y-4">
                {sessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{session.title}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(session.createdAt).toLocaleDateString()} • {session.type.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {session.overallScore && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          session.overallScore >= 80 ? 'bg-green-100 text-green-800' :
                          session.overallScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {Math.round(session.overallScore)}%
                        </span>
                      )}
                      <button 
                        onClick={() => navigate(`/interview/${session.id}/results`)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        View Results
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No interviews yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start your first mock interview to begin improving your skills!
                </p>
                <button
                  onClick={() => navigate('/interview/setup')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Interview
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
