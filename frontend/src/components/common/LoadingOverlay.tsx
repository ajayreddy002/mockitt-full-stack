import React from 'react';
import { CheckCircle, Brain } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  title?: string;
  message?: string;
  progress?: number;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  title = "Ending Interview Session",
  message = "Processing your responses with AI analysis...",
  progress = 0
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
        
        {/* Animated Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <Brain className="h-10 w-10 text-white animate-pulse" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-white" />
          </div>
        </div>

        {/* Title and Message */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>

        {/* Progress Steps */}
        <div className="space-y-3 mb-6">
          <ProgressStep
            label="Saving responses"
            isComplete={progress > 25}
            isActive={progress <= 25}
          />
          <ProgressStep
            label="AI analysis in progress"
            isComplete={progress > 50}
            isActive={progress > 25 && progress <= 50}
          />
          <ProgressStep
            label="Generating insights"
            isComplete={progress > 75}
            isActive={progress > 50 && progress <= 75}
          />
          <ProgressStep
            label="Preparing results"
            isComplete={progress > 95}
            isActive={progress > 75}
          />
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <p className="text-sm text-gray-500">
          Please don't close this window. This may take a few moments.
        </p>
      </div>
    </div>
  );
};

const ProgressStep: React.FC<{
  label: string;
  isComplete: boolean;
  isActive: boolean;
}> = ({ label, isComplete, isActive }) => (
  <div className="flex items-center space-x-3">
    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
      isComplete 
        ? 'bg-green-500' 
        : isActive 
          ? 'bg-blue-500 animate-pulse' 
          : 'bg-gray-300'
    }`}>
      {isComplete && <CheckCircle className="h-3 w-3 text-white" />}
    </div>
    <span className={`text-sm ${
      isComplete 
        ? 'text-green-700 font-medium' 
        : isActive 
          ? 'text-blue-700 font-medium' 
          : 'text-gray-500'
    }`}>
      {label}
    </span>
  </div>
);
