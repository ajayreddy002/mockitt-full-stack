import React, { useEffect, useState } from 'react';
import type { InterviewSession } from '../../types/interview';
import { Clock, Users, Target } from 'lucide-react';

interface InterviewSessionHeaderProps {
  session: InterviewSession;
}

export const InterviewSessionHeader: React.FC<InterviewSessionHeaderProps> = ({ session }) => {
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (session.startTime) {
        const elapsed = Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000);
        setTimeElapsed(elapsed);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [session.startTime]);

  const progress = ((session.currentQuestionIndex + 1) / session.questions.length) * 100;

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          {/* Top Row - Status & Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700 uppercase tracking-wider">
                  Live Interview
                </span>
              </div>
              <div className="h-4 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {Math.floor(timeElapsed / 60)}:{String(timeElapsed % 60).padStart(2, '0')}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-sm text-gray-500">Progress</div>
                <div className="text-lg font-semibold text-gray-900">
                  {session.currentQuestionIndex + 1} of {session.questions.length}
                </div>
              </div>
            </div>
          </div>

          {/* Session Info */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{session.title}</h1>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Target className="h-4 w-4" />
                <span>{session.settings.role}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{session.settings.industry}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {session.type.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Started</span>
              <span>{Math.round(progress)}% Complete</span>
              <span>Finish</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
