import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface InterviewTimerProps {
  initialTime: number; // in seconds
  isActive: boolean;
  onTimeUp: () => void;
}

export const InterviewTimer: React.FC<InterviewTimerProps> = ({
  initialTime,
  isActive,
  onTimeUp
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        
        // Warning when less than 30 seconds
        if (prev <= 30) {
          setIsWarning(true);
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, onTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft <= 30) return 'text-red-600 bg-red-50 border-red-200';
    if (timeLeft <= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-gray-700 bg-white border-gray-200';
  };

  return (
    <div className={`flex items-center px-3 py-2 rounded-lg border transition-all duration-300 ${getTimeColor()}`}>
      {isWarning ? (
        <AlertTriangle className="h-4 w-4 mr-2 animate-pulse" />
      ) : (
        <Clock className="h-4 w-4 mr-2" />
      )}
      <span className="font-mono text-sm font-medium">
        {formatTime(timeLeft)}
      </span>
    </div>
  );
};
