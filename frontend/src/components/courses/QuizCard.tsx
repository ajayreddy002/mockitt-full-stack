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
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userAttempts?: any[];
  isEnrolled: boolean;
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz, userAttempts = [], isEnrolled }) => {
  const navigate = useNavigate();
  
  const bestAttempt = userAttempts.reduce((best, current) => 
    current.score > (best?.score || 0) ? current : best, null
  );
  
  const attemptsLeft = quiz.maxAttempts - userAttempts.length;
  const canTakeQuiz = isEnrolled && attemptsLeft > 0;
  const hasPassed = bestAttempt && bestAttempt.passed;

  const handleStartQuiz = () => {
    if (canTakeQuiz) {
      navigate(`/quiz/${quiz.id}`);
    }
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
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {quiz.title}
        </h3>
        {hasPassed && (
          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 ml-2" />
        )}
      </div>

      {/* Description */}
      {quiz.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {quiz.description}
        </p>
      )}

      {/* Quiz Stats */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-1" />
          {quiz.duration ? `${quiz.duration} min` : 'Untimed'}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Target className="w-4 h-4 mr-1" />
          {quiz.passingScore}% to pass
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Users className="w-4 h-4 mr-1" />
          {quiz.maxAttempts} attempts max
        </div>
      </div>

      {/* Difficulty Badge */}
      <div className="flex items-center justify-between mb-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
          {quiz.difficulty}
        </span>
        <span className="text-xs text-gray-500 uppercase">
          {quiz.type.replace('_', ' ')}
        </span>
      </div>

      {/* Previous Attempts */}
      {userAttempts.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Best Score:</span>
            <span className={`font-medium ${hasPassed ? 'text-green-600' : 'text-red-600'}`}>
              {bestAttempt?.score || 0}% {hasPassed ? '(Passed)' : '(Failed)'}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-gray-600">Attempts:</span>
            <span className="text-gray-900">
              {userAttempts.length}/{quiz.maxAttempts}
            </span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleStartQuiz}
        disabled={!canTakeQuiz}
        className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center ${
          !isEnrolled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : !canTakeQuiz && attemptsLeft === 0
            ? 'bg-red-100 text-red-600 cursor-not-allowed'
            : hasPassed
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {!isEnrolled ? (
          <>
            <XCircle className="w-4 h-4 mr-2" />
            Enrollment Required
          </>
        ) : attemptsLeft === 0 ? (
          <>
            <XCircle className="w-4 h-4 mr-2" />
            No Attempts Left
          </>
        ) : hasPassed ? (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Retake Quiz
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" />
            {userAttempts.length > 0 ? 'Retake Quiz' : 'Start Quiz'}
          </>
        )}
      </button>
    </div>
  );
};
