import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Target, Users, Play, CheckCircle, XCircle } from 'lucide-react';

interface QuizCardProps {
  quiz: {
    id: string;
    title: string;
    description?: string;
    duration?: number;
    passingScore: number;
    maxAttempts: number;
    difficulty: string;
    type: string;
    isEnrolled: boolean;
    userAttempts: number;
    attemptsRemaining: number;
    canAttempt: boolean;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userAttempts?: any[];
  courseId?: string; // Optional for course context
}

export const QuizCard: React.FC<QuizCardProps> = ({ 
  quiz, 
  userAttempts = [], 
  courseId 
}) => {
  const navigate = useNavigate();
  
  const bestAttempt = userAttempts.reduce((best, current) =>
    current.score > (best?.score || 0) ? current : best, null
  );

  const hasPassed = bestAttempt && bestAttempt.passed;

  const handleStartQuiz = () => {
    if (!quiz.isEnrolled) {
      alert('Please enroll in the course to take this quiz.');
      return;
    }

    if (!quiz.canAttempt) {
      alert('No attempts remaining for this quiz.');
      return;
    }

    // ✅ Use appropriate route based on context
    const quizPath = courseId 
      ? `/courses/${courseId}/quiz/${quiz.id}`
      : `/quiz/${quiz.id}`;
    
    navigate(quizPath);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{quiz.title}</h3>
        {hasPassed && (
          <CheckCircle className="h-6 w-6 text-green-500" />
        )}
      </div>

      {/* Description */}
      {quiz.description && (
        <p className="text-gray-600 mb-4">{quiz.description}</p>
      )}

      {/* Quiz Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4 text-gray-400" />
          <span>{quiz.duration ? `${quiz.duration} min` : 'Untimed'}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Target className="h-4 w-4 text-gray-400" />
          <span>{quiz.passingScore}% to pass</span>
        </div>
        <div className="flex items-center space-x-1">
          <Users className="h-4 w-4 text-gray-400" />
          <span>{quiz.maxAttempts} attempts max</span>
        </div>
      </div>

      {/* Difficulty Badge */}
      <div className="flex items-center space-x-2 mb-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
          {quiz.difficulty}
        </span>
        <span className="text-xs text-gray-500">
          {quiz.type.replace('_', ' ')}
        </span>
      </div>

      {/* Previous Attempts */}
      {userAttempts.length > 0 && (
        <div className="bg-gray-50 rounded p-3 mb-4 text-sm">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-600">Best Score:</span>
            <span className={`font-medium ${hasPassed ? 'text-green-600' : 'text-red-600'}`}>
              {bestAttempt?.score || 0}% {hasPassed ? '(Passed)' : '(Failed)'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Attempts:</span>
            <span className="font-medium">
              {quiz.userAttempts}/{quiz.maxAttempts}
            </span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleStartQuiz}
        disabled={!quiz.isEnrolled || !quiz.canAttempt}
        className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${
          !quiz.isEnrolled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : !quiz.canAttempt
            ? 'bg-red-100 text-red-400 cursor-not-allowed'
            : hasPassed
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {!quiz.isEnrolled ? (
          <>
            <XCircle className="h-4 w-4" />
            <span>Enrollment Required</span>
          </>
        ) : quiz.attemptsRemaining === 0 ? (
          <>
            <XCircle className="h-4 w-4" />
            <span>No Attempts Left</span>
          </>
        ) : hasPassed ? (
          <>
            <Play className="h-4 w-4" />
            <span>Retake Quiz</span>
          </>
        ) : (
          <>
            <Play className="h-4 w-4" />
            <span>{userAttempts.length > 0 ? 'Retake Quiz' : 'Start Quiz'}</span>
          </>
        )}
      </button>
    </div>
  );
};
