import React from 'react';
import { BounceLoader, ClipLoader, PulseLoader } from 'react-spinners';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  type?: 'bounce' | 'clip' | 'pulse';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = '#3B82F6',
  type = 'clip'
}) => {
  const sizeMap = {
    small: 20,
    medium: 35,
    large: 50
  };

  const LoaderComponent = {
    bounce: BounceLoader,
    clip: ClipLoader,
    pulse: PulseLoader
  }[type];

  return (
    <div className="flex justify-center items-center">
      <LoaderComponent color={color} size={sizeMap[size]} />
    </div>
  );
};

// Page-level loading overlay
export const PageLoader: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => (
  <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="large" />
      <p className="mt-4 text-gray-600 font-medium">{message}</p>
    </div>
  </div>
);

// Skeleton loading for content
export const SkeletonLoader: React.FC<{ 
  lines?: number; 
  className?: string;
}> = ({ lines = 3, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {[...Array(lines)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>
    ))}
  </div>
);

// Button loading state
export const LoadingButton: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}> = ({ loading, children, onClick, className = '', disabled = false }) => (
  <button
    onClick={onClick}
    disabled={loading || disabled}
    className={`relative ${className} ${loading || disabled ? 'cursor-not-allowed opacity-70' : ''}`}
  >
    {loading && (
      <div className="absolute inset-0 flex items-center justify-center">
        <LoadingSpinner size="small" color="currentColor" />
      </div>
    )}
    <span className={loading ? 'invisible' : ''}>{children}</span>
  </button>
);
