/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Flag,
  ArrowRight,
  ArrowLeftIcon
} from 'lucide-react';
import { useQuiz } from '../../store';
import { QuestionRenderer } from '../../components/courses/QuestionRenderer';

interface Question {
  id: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'MULTIPLE_SELECT' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options?: string[];
  points: number;
  orderIndex?: number;
}

interface QuizData {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  passingScore: number;
  timeLimit: boolean;
  allowReview: boolean;
  showResults: boolean;
  isEnrolled: boolean;
  canAttempt: boolean;
  attemptsRemaining: number;
  maxAttempts: number;
}

interface AttemptData {
  id: string;
  attemptNumber: number;
  maxScore: number;
  startedAt: string;
}

export const QuizTaking: React.FC = () => {
  // Route params
  const { quizId, courseId } = useParams<{ quizId: string; courseId?: string }>();
  const navigate = useNavigate();

  // Store hooks
  const {
    currentQuiz,
    answers,
    quizLoading,
    quizError,
    fetchQuiz,
    startQuizAttempt,
    updateAnswer,
    submitQuestionAnswer,
    submitQuiz,
    resetQuiz,
    clearQuizError,
  } = useQuiz();

  // Local state
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Auto-save individual answers flag
  const [autoSaveEnabled] = useState(true);

  // Initialize quiz
  useEffect(() => {
    if (!quizId) {
      navigate('/dashboard');
      return;
    }

    const initializeQuiz = async () => {
      try {
        await fetchQuiz(quizId);
      } catch (error) {
        console.error('Failed to load quiz:', error);
      }
    };

    initializeQuiz();

    return () => {
      resetQuiz();
    };
  }, [quizId, fetchQuiz, resetQuiz, navigate]);

  // Process quiz data when loaded
  useEffect(() => {
    if (currentQuiz) {
      setQuiz(currentQuiz);
    }
  }, [currentQuiz]);

  // Handle quiz start
  const handleStartQuiz = useCallback(async () => {
    if (!quizId || !quiz) return;

    if (!quiz.isEnrolled) {
      alert('You must be enrolled in the course to take this quiz.');
      return;
    }

    if (!quiz.canAttempt) {
      alert(`You have reached the maximum number of attempts (${quiz.maxAttempts}) for this quiz.`);
      return;
    }

    try {
      const attemptData = await startQuizAttempt(quizId);
      
      if (attemptData) {
        setAttempt(attemptData.attempt);
        setQuestions(attemptData.questions || []);

        // Initialize timer if time limit is set
        if (quiz.timeLimit && quiz.duration) {
          setTimeRemaining(quiz.duration * 60); // Convert minutes to seconds
        }
      }
    } catch (error: any) {
      console.error('Failed to start quiz:', error);
      alert(error.message || 'Failed to start quiz. Please try again.');
    }
  }, [quizId, quiz, startQuizAttempt]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || !attempt) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, attempt]);

  // Auto-submit when time runs out
  const handleAutoSubmit = useCallback(async () => {
    if (!attempt) return;
    
    try {
      setIsSubmitting(true);
      await submitQuiz(attempt.id);
      
      const resultsPath = courseId 
        ? `/courses/${courseId}/quiz/${quizId}/results?attempt=${attempt.id}`
        : `/quiz/${quizId}/results?attempt=${attempt.id}`;
      
      navigate(resultsPath);
    } catch (error) {
      console.error('Auto-submit failed:', error);
    }
  }, [attempt, submitQuiz, navigate, courseId, quizId]);

  // Handle answer change
  const handleAnswerChange = useCallback(async (questionId: string, answer: any) => {
    // Update local state
    updateAnswer(questionId, answer);

    // Auto-save individual answer if enabled
    if (autoSaveEnabled && attempt) {
      try {
        await submitQuestionAnswer(attempt.id, questionId, answer);
      } catch (error) {
        console.error('Failed to auto-save answer:', error);
        // Don't show error to user for auto-save failures
      }
    }
  }, [updateAnswer, submitQuestionAnswer, attempt, autoSaveEnabled]);

  // Navigate questions
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Submit quiz
  const handleSubmitQuiz = async () => {
    if (!attempt) return;

    try {
      setIsSubmitting(true);
      const result = await submitQuiz(attempt.id);
      
      const resultsPath = courseId 
        ? `/courses/${courseId}/quiz/${quizId}/results?attempt=${result.attempt.id}`
        : `/quiz/${quizId}/results?attempt=${result.attempt.id}`;
      
      navigate(resultsPath);
    } catch (error: any) {
      console.error('Failed to submit quiz:', error);
      alert(error.message || 'Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  // Format time
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle back navigation
  const handleBack = () => {
    if (courseId) {
      navigate(`/courses/${courseId}`);
    } else {
      navigate('/dashboard');
    }
  };

  // Calculate progress
  const answeredQuestions = Object.keys(answers).length;
  const progressPercentage = questions.length > 0 ? (answeredQuestions / questions.length) * 100 : 0;

  // Loading state
  if (quizLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (quizError && !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Quiz</h2>
          <p className="text-gray-600 mb-4">{quizError}</p>
          <button
            onClick={() => clearQuizError()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-3"
          >
            Try Again
          </button>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Quiz not loaded
  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Not Found</h2>
          <p className="text-gray-600 mb-4">The quiz you are looking for could not be found.</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Quiz intro/start screen
  if (!attempt) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
          </div>

          {/* Quiz Info Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-lg text-gray-600">{quiz.description}</p>
              )}
            </div>

            {/* Quiz Details */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Duration</div>
                    <div className="text-gray-600">
                      {quiz.duration ? `${quiz.duration} minutes` : 'Unlimited'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Flag className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">Passing Score</div>
                    <div className="text-gray-600">{quiz.passingScore}%</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="font-medium">Attempts</div>
                    <div className="text-gray-600">
                      {quiz.attemptsRemaining} of {quiz.maxAttempts} remaining
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="font-medium">Results</div>
                    <div className="text-gray-600">
                      {quiz.showResults ? 'Shown immediately' : 'Available later'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enrollment Check */}
            {!quiz.isEnrolled ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div className="text-yellow-800">
                    <p className="font-medium">Enrollment Required</p>
                    <p className="text-sm">You must be enrolled in the course to take this quiz.</p>
                  </div>
                </div>
              </div>
            ) : !quiz.canAttempt ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div className="text-red-800">
                    <p className="font-medium">No Attempts Remaining</p>
                    <p className="text-sm">You have used all {quiz.maxAttempts} attempts for this quiz.</p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Start Button */}
            <div className="text-center">
              <button
                onClick={handleStartQuiz}
                disabled={!quiz.isEnrolled || !quiz.canAttempt}
                className={`px-8 py-3 rounded-lg font-medium text-lg ${
                  quiz.isEnrolled && quiz.canAttempt
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {!quiz.isEnrolled ? 'Enrollment Required' : !quiz.canAttempt ? 'No Attempts Left' : 'Start Quiz'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz taking interface
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">{quiz.title}</h1>
              <span className="text-gray-500">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Timer */}
              {timeRemaining !== null && (
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                  timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  <Clock className="h-4 w-4" />
                  <span className="font-mono">{formatTime(timeRemaining)}</span>
                </div>
              )}

              {/* Progress */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Progress:</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{Math.round(progressPercentage)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {currentQuestion && (
            <>
              {/* Question */}
              <div className="mb-8">
                <QuestionRenderer
                  question={currentQuestion}
                  answer={answers[currentQuestion.id]}
                  onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
                />
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    currentQuestionIndex === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-3">
                  {/* Question indicators */}
                  <div className="flex space-x-2">
                    {questions.slice(0, 10).map((_, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-full cursor-pointer ${
                          index === currentQuestionIndex
                            ? 'bg-blue-600'
                            : answers[questions[index]?.id]
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                        }`}
                        onClick={() => setCurrentQuestionIndex(index)}
                      />
                    ))}
                    {questions.length > 10 && (
                      <span className="text-gray-500 text-sm">...</span>
                    )}
                  </div>

                  {currentQuestionIndex === questions.length - 1 ? (
                    <button
                      onClick={() => setShowConfirmSubmit(true)}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
                    >
                      Submit Quiz
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      <span>Next</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Quiz?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to submit your quiz? You have answered {answeredQuestions} out of {questions.length} questions.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
