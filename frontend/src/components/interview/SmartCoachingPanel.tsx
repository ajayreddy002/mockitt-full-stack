/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { 
  Brain, Target, Clock, Zap, AlertTriangle, 
  CheckCircle, TrendingUp, MessageSquare, Lightbulb 
} from 'lucide-react';
import { mockittAPI } from '../../services/api';

interface CoachingInsight {
  type: 'structure' | 'content' | 'delivery' | 'timing' | 'confidence';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  actionableAdvice: string;
  example?: string;
  framework?: string;
}

interface SmartCoachingPanelProps {
  sessionId: string;
  currentQuestion: string;
  isRecording: boolean;
  speechMetrics?: any;
  userProfile?: any;
  onCoachingReceived?: (insights: CoachingInsight[]) => void;
}

export const SmartCoachingPanel: React.FC<SmartCoachingPanelProps> = ({
  sessionId,
  currentQuestion,
  isRecording,
  speechMetrics,
  userProfile,
  onCoachingReceived
}) => {
  const [insights, setInsights] = useState<CoachingInsight[]>([]);
  const [liveInsights, setLiveInsights] = useState<CoachingInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Get initial coaching when question changes
  useEffect(() => {
    if (currentQuestion) {
      loadSmartCoaching();
    }
  }, [currentQuestion]);

  // Get live coaching updates during recording
  useEffect(() => {
    if (isRecording && speechMetrics) {
      getLiveCoaching();
    }
  }, [isRecording, speechMetrics]);

  const loadSmartCoaching = async () => {
    try {
      setLoading(true);
      const response = await mockittAPI.interviews.getSmartCoaching(sessionId, {
        question: currentQuestion,
        userProfile,
        speechMetrics,
      });

      if (response.success) {
        setInsights(response.coaching.insights);
        if (onCoachingReceived) {
          onCoachingReceived(response.coaching.insights);
        }
      }
    } catch (error) {
      console.error('Failed to load smart coaching:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLiveCoaching = async () => {
    try {
      const response = await mockittAPI.interviews.getLiveCoaching(sessionId, {
        speechMetrics,
        questionContext: { type: 'behavioral' }, // This would come from question analysis
        speakingDuration: 60 // This would be tracked
      });

      if (response.success) {
        setLiveInsights(response.insights);
      }
    } catch (error) {
      console.error('Failed to get live coaching:', error);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'structure': return <Target className="h-4 w-4" />;
      case 'content': return <MessageSquare className="h-4 w-4" />;
      case 'delivery': return <TrendingUp className="h-4 w-4" />;
      case 'timing': return <Clock className="h-4 w-4" />;
      case 'confidence': return <Zap className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50 text-red-800';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50 text-yellow-800';
      default: return 'border-l-blue-500 bg-blue-50 text-blue-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <CheckCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  const allInsights = [...liveInsights, ...insights];

  if (loading) {
    return <CoachingPanelSkeleton />;
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg transition-all duration-300 ${
      isExpanded ? 'w-80' : 'w-12'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {isExpanded && (
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Smart Coach</h3>
            {isRecording && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-red-600">Live</span>
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          {isExpanded ? '→' : '←'}
        </button>
      </div>

      {/* Coaching Content */}
      {isExpanded && (
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {allInsights.length === 0 ? (
            <EmptyCoachingState />
          ) : (
            allInsights.map((insight, index) => (
              <CoachingInsightCard 
                key={index} 
                insight={insight} 
                isLive={index < liveInsights.length}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ✅ Individual coaching insight card
const CoachingInsightCard: React.FC<{
  insight: CoachingInsight;
  isLive?: boolean;
}> = ({ insight, isLive }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`border-l-4 pl-3 pr-2 py-2 rounded-r-lg transition-all ${
      isLive ? 'bg-green-50 border-l-green-500' : 
      insight.priority === 'high' ? 'border-l-red-500 bg-red-50' :
      insight.priority === 'medium' ? 'border-l-yellow-500 bg-yellow-50' :
      'border-l-blue-500 bg-blue-50'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2 flex-1">
          <div className={`mt-0.5 ${
            isLive ? 'text-green-600' :
            insight.priority === 'high' ? 'text-red-600' :
            insight.priority === 'medium' ? 'text-yellow-600' :
            'text-blue-600'
          }`}>
            {isLive ? <CheckCircle className="h-4 w-4" /> : 
             insight.type === 'structure' ? <Target className="h-4 w-4" /> :
             insight.type === 'content' ? <MessageSquare className="h-4 w-4" /> :
             insight.type === 'delivery' ? <TrendingUp className="h-4 w-4" /> :
             insight.type === 'timing' ? <Clock className="h-4 w-4" /> :
             <Zap className="h-4 w-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1 mb-1">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {insight.title}
              </h4>
              {isLive && (
                <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                  LIVE
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 mb-2">{insight.message}</p>
            
            <div className="text-xs font-medium text-gray-800 mb-1">
              💡 Quick Tip:
            </div>
            <p className="text-xs text-gray-700">{insight.actionableAdvice}</p>
            
            {insight.framework && (
              <div className="mt-2 p-2 bg-white bg-opacity-70 rounded border-l-2 border-gray-300">
                <div className="text-xs font-medium text-gray-600 mb-1">
                  Framework: {insight.framework}
                </div>
              </div>
            )}
            
            {insight.example && (
              <details className="mt-2">
                <summary className="text-xs cursor-pointer font-medium text-gray-600 hover:text-gray-800">
                  Show Example
                </summary>
                <div className="mt-1 p-2 bg-white bg-opacity-70 rounded border-l-2 border-gray-300">
                  <p className="text-xs text-gray-700 italic">{insight.example}</p>
                </div>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Empty state
const EmptyCoachingState: React.FC = () => (
  <div className="text-center py-6 text-gray-500">
    <Brain className="h-12 w-12 mx-auto mb-3 opacity-40" />
    <p className="text-sm">Smart coaching will appear here</p>
    <p className="text-xs mt-1">Ask a question to get started</p>
  </div>
);

// ✅ Loading skeleton
const CoachingPanelSkeleton: React.FC = () => (
  <div className="w-80 bg-white rounded-lg shadow-lg p-4">
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="space-y-2">
        <div className="h-16 bg-gray-200 rounded"></div>
        <div className="h-16 bg-gray-200 rounded"></div>
        <div className="h-16 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);
