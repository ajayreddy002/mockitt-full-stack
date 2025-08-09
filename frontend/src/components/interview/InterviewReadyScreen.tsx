import React from 'react';
import { Play, Clock, Target, Mic } from 'lucide-react';
import type { InterviewSession } from '../../types/interview';

interface InterviewReadyScreenProps {
  session: InterviewSession;
  onStartInterview: () => void;
  loading?: boolean;
}

export const InterviewReadyScreen: React.FC<InterviewReadyScreenProps> = ({
  session,
  onStartInterview,
  loading = false
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Target className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Start Your AI Interview?
          </h1>
          <p className="text-lg text-gray-600 max-w-lg mx-auto">
            Get ready for an intelligent mock interview experience with real-time AI coaching and personalized feedback.
          </p>
        </div>

        {/* Session Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">{session.title}</h2>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                {session.type.replace('_', ' ')}
              </span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {session.questions.length} Questions
              </span>
            </div>
          </div>

          {/* Session Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {Math.floor((session.settings.timePerQuestion * session.questions.length) / 60)}
              </div>
              <div className="text-sm text-gray-600">Estimated Duration (min)</div>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600 mb-2">AI</div>
              <div className="text-sm text-gray-600">Real-time Coaching</div>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Mic className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-gray-700">Live speech analysis and coaching tips</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Target className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-gray-700">AI-generated questions for {session.settings.role}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-gray-700">Detailed performance analysis after completion</span>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={onStartInterview}
            disabled={loading}
            className={`w-full py-4 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3 ${
              loading ? 'animate-pulse' : ''
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Starting Interview...</span>
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                <span>Start AI Interview</span>
              </>
            )}
          </button>
        </div>

        {/* Tips Section */}
        <div className="text-center text-gray-500 text-sm">
          <p>💡 <strong>Pro Tip:</strong> Ensure good lighting and a quiet environment for the best AI analysis results</p>
        </div>
      </div>
    </div>
  );
};
