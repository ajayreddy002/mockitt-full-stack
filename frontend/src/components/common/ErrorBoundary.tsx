import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Oops! Something went wrong
        </h1>
        
        <p className="text-gray-600 mb-6">
          We encountered an unexpected error. Don't worry, it's not your fault!
        </p>

        <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-gray-700 font-mono">
            {error.message}
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={resetErrorBoundary}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
          
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  children,
  fallback: Fallback = ErrorFallback,
  onError,
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log error to monitoring service (e.g., Sentry)
    console.error('Error caught by boundary:', error, errorInfo);
    
    if (onError) {
      onError(error, errorInfo);
    }
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={Fallback}
      onError={handleError}
      onReset={() => window.location.reload()}
    >
      {children}
    </ReactErrorBoundary>
  );
};
