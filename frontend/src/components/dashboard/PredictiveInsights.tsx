import React, { useState, useEffect } from 'react';
import { 
  
  Award,
  BarChart3,
  Brain,
  ChevronRight,
  Clock,
  Mic,
  Target,
  TrendingDown,
  TrendingUp,
  Zap} from 'lucide-react';
import { mockittAPI } from '../../services/api';
import { useAuth } from '../../store';

interface PredictiveInsights {
  currentPerformance: {
    overallScore: number;
    confidenceLevel: number;
    clarityScore: number;
    speakingPace: number;
  };
  predictions: {
    nextSessionScore: number | null;
    weeklyImprovement: number | null;
    targetAchievementDate: string;
    interviewReadiness: number;
  };
  trends: {
    improvementVelocity: 'accelerating' | 'steady' | 'slowing' | 'declining';
    strongestSkill: string;
    improvementArea: string;
    consistencyScore: number;
  };
  recommendations: {
    focusAreas: string[];
    practiceFrequency: string;
    nextMilestone: string;
    confidenceBooster: string;
  };
  userState: 'new_user' | 'insufficient_data' | 'ready_for_predictions';
}

export const PredictiveInsights: React.FC = () => {
  const [insights, setInsights] = useState<PredictiveInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPredictiveInsights();
  }, []);

  const loadPredictiveInsights = async () => {
    try {
      setLoading(true);
      const response = await mockittAPI.analytics.getPredictiveInsights();
      
      if (response.success) {
        setInsights(response.insights);
      } else {
        setError('Failed to load insights');
      }
    } catch (error) {
      console.error('Failed to load predictive insights:', error);
      setError('Unable to load analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={loadPredictiveInsights} />;
  }

  if (!insights) {
    return <EmptyState />;
  }

  // Render different states based on user's interview history
  switch (insights.userState) {
    case 'new_user':
      return <NewUserDashboard insights={insights} />;
    case 'insufficient_data':
      return <InsufficientDataDashboard insights={insights} />;
    case 'ready_for_predictions':
      return <FullPredictionsDashboard insights={insights} />;
    default:
      return <EmptyState />;
  }
};

// ✅ Loading State
const LoadingState: React.FC = () => (
  <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
      <div className="h-32 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);

// ✅ Error State
const ErrorState: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <BarChart3 className="h-8 w-8 text-red-600" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Analytics</h3>
    <p className="text-gray-600 mb-4">{error}</p>
    <button
      onClick={onRetry}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
    >
      Try Again
    </button>
  </div>
);

// ✅ Empty State
const EmptyState: React.FC = () => (
  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <BarChart3 className="h-8 w-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Coming Soon</h3>
    <p className="text-gray-600">Complete your profile setup to access insights.</p>
  </div>
);

// ✅ New User Experience
const NewUserDashboard: React.FC<{ insights: PredictiveInsights }> = ({ insights }) => {
  const { user } = useAuth();
  return (
    <div className="bg-gradient-to-br p-6">
      {/* Welcome Header */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mic className="h-10 w-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Mockitt! {user?.firstName}</h2>
        <p className="text-gray-600">Ready to ace your interviews? Let's get started with your first practice session.</p>
      </div>

      {/* Getting Started Steps */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 text-center shadow-lg">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-green-600 font-bold text-lg">1</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Take Interview</h4>
          <p className="text-sm text-gray-600">Start with a practice session</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 text-center shadow-lg">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-blue-600 font-bold text-lg">2</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Get Feedback</h4>
          <p className="text-sm text-gray-600">Receive AI-powered insights</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 text-center shadow-lg">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-purple-600 font-bold text-lg">3</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Track Progress</h4>
          <p className="text-sm text-gray-600">Watch your skills improve</p>
        </div>
      </div>

      {/* Action Button */}
      <div className="text-center mb-4">
        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto">
          <Mic className="h-5 w-5 mr-2" />
          Start Your First Interview
          <ChevronRight className="h-5 w-5 ml-2" />
        </button>
      </div>

      {/* Motivation */}
      <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500 shadow-lg">
        <p className="text-sm text-blue-800 font-medium">
          💡 {insights.recommendations.confidenceBooster}
        </p>
      </div>
    </div>
  );
};

// ✅ Building Profile State
const InsufficientDataDashboard: React.FC<{ insights: PredictiveInsights }> = ({ insights }) => {
  const getProgressPercentage = () => {
    // Assume 3 sessions needed for full predictions
    const completed = insights.currentPerformance.overallScore > 0 ? 1 : 0;
    return Math.min((completed / 3) * 100, 33); // Max 33% for insufficient data
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      {/* Header with Progress */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Building Your Profile</h3>
          <p className="text-gray-600">{insights.predictions.targetAchievementDate}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-yellow-600">{getProgressPercentage()}%</div>
          <div className="text-sm text-gray-500">Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full transition-all duration-500"
          style={{ width: `${getProgressPercentage()}%` }}
        ></div>
      </div>

      {/* Current Performance (if available) */}
      {insights.currentPerformance.overallScore > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard 
            icon={<Target className="h-5 w-5" />}
            label="Overall Score"
            value={`${insights.currentPerformance.overallScore}%`}
            color="blue"
          />
          <MetricCard 
            icon={<Brain className="h-5 w-5" />}
            label="Confidence"
            value={`${insights.currentPerformance.confidenceLevel}%`}
            color="purple"
          />
          <MetricCard 
            icon={<Mic className="h-5 w-5" />}
            label="Clarity"
            value={`${insights.currentPerformance.clarityScore}%`}
            color="green"
          />
          <MetricCard 
            icon={<Clock className="h-5 w-5" />}
            label="Pace"
            value={`${insights.currentPerformance.speakingPace} WPM`}
            color="orange"
          />
        </div>
      )}

      {/* Skills Identified */}
      {insights.trends.strongestSkill !== 'Complete more sessions' && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Award className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-semibold text-green-800">Strongest Skill</span>
            </div>
            <p className="text-green-700">{insights.trends.strongestSkill}</p>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Target className="h-5 w-5 text-orange-600 mr-2" />
              <span className="font-semibold text-orange-800">Focus Area</span>
            </div>
            <p className="text-orange-700">{insights.trends.improvementArea}</p>
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
        <div className="flex items-center mb-2">
          <Zap className="h-5 w-5 text-yellow-600 mr-2" />
          <span className="font-semibold text-yellow-800">Keep Going!</span>
        </div>
        <p className="text-yellow-700 mb-3">{insights.recommendations.confidenceBooster}</p>
        
        <button className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
          Continue Practicing
        </button>
      </div>
    </div>
  );
};

// ✅ Reusable Metric Card Component
const MetricCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'purple' | 'green' | 'orange';
}> = ({ icon, label, value, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    purple: 'text-purple-600 bg-purple-50',
    green: 'text-green-600 bg-green-50',
    orange: 'text-orange-600 bg-orange-50'
  };

  return (
    <div className="text-center p-4 bg-gray-50 rounded-lg">
      <div className={`flex items-center justify-center mb-2 ${colorClasses[color]}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
};

// ✅ Complete Analytics Experience
const FullPredictionsDashboard: React.FC<{ insights: PredictiveInsights }> = ({ insights }) => {
  const getTrendIcon = () => {
    switch (insights.trends.improvementVelocity) {
      case 'accelerating': return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'declining': return <TrendingDown className="h-5 w-5 text-red-600" />;
      default: return <Target className="h-5 w-5 text-blue-600" />;
    }
  };

  const getTrendColor = () => {
    switch (insights.trends.improvementVelocity) {
      case 'accelerating': return 'text-green-600 bg-green-50';
      case 'declining': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      {/* Header with Trend */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Performance Insights</h3>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getTrendColor()}`}>
          {getTrendIcon()}
          <span className="capitalize">{insights.trends.improvementVelocity}</span>
        </div>
      </div>

      {/* Current Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard 
          icon={<Target className="h-5 w-5" />}
          label="Overall Score"
          value={`${insights.currentPerformance.overallScore}%`}
          color="blue"
        />
        <MetricCard 
          icon={<Brain className="h-5 w-5" />}
          label="Confidence"
          value={`${insights.currentPerformance.confidenceLevel}%`}
          color="purple"
        />
        <MetricCard 
          icon={<Mic className="h-5 w-5" />}
          label="Clarity"
          value={`${insights.currentPerformance.clarityScore}%`}
          color="green"
        />
        <MetricCard 
          icon={<Clock className="h-5 w-5" />}
          label="Pace"
          value={`${insights.currentPerformance.speakingPace} WPM`}
          color="orange"
        />
      </div>

      {/* Predictions Row */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Next Session Prediction */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-blue-800">Next Session</span>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {insights.predictions.nextSessionScore ? `${insights.predictions.nextSessionScore}%` : 'N/A'}
          </div>
          <div className="text-sm text-blue-700">Predicted Score</div>
        </div>

        {/* Weekly Improvement */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-green-800">This Week</span>
            <BarChart3 className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">
            {insights.predictions.weeklyImprovement ? `+${insights.predictions.weeklyImprovement}%` : 'N/A'}
          </div>
          <div className="text-sm text-green-700">Improvement</div>
        </div>

        {/* Interview Readiness */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-purple-800">Readiness</span>
            <Award className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {insights.predictions.interviewReadiness}%
          </div>
          <div className="text-sm text-purple-700">Job Interview Ready</div>
        </div>
      </div>

      {/* Skills Analysis */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Award className="h-5 w-5 text-green-600 mr-2" />
            <span className="font-semibold text-green-800">Strongest Skill</span>
          </div>
          <p className="text-green-700 text-lg">{insights.trends.strongestSkill}</p>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Target className="h-5 w-5 text-orange-600 mr-2" />
            <span className="font-semibold text-orange-800">Focus Area</span>
          </div>
          <p className="text-orange-700 text-lg">{insights.trends.improvementArea}</p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Personalized Recommendations</h4>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center mb-2">
              <Target className="h-4 w-4 text-blue-600 mr-2" />
              <span className="font-medium text-blue-800">Focus Areas</span>
            </div>
            <div className="space-y-1">
              {insights.recommendations.focusAreas.map((area, index) => (
                <span key={index} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs mr-1">
                  {area}
                </span>
              ))}
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center mb-2">
              <Clock className="h-4 w-4 text-green-600 mr-2" />
              <span className="font-medium text-green-800">Practice Schedule</span>
            </div>
            <p className="text-green-700 text-sm">{insights.recommendations.practiceFrequency}</p>
          </div>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
          <div className="flex items-start">
            <Zap className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-800 mb-1">Next Milestone</p>
              <p className="text-yellow-700 text-sm">{insights.recommendations.nextMilestone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
