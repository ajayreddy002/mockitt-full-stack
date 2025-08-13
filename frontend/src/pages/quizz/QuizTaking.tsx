/* eslint-disable @typescript-eslint/no-explicit-any */
// frontend/src/components/courses/QuizTaking.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useQuiz } from '../../store';

interface QuizAttempt {
  id: string;
  score: number;
  maxScore: number;
  passed: boolean;
  startedAt: string;
  completedAt?: string;
  timeSpent?: number;
  attemptNumber: number;
}

export const QuizTaking: React.FC = () => {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const navigate = useNavigate();

  // ✅ Using your slice pattern instead of direct API calls
  const {
    currentQuiz,
    currentAttempt,
    previousAttempts,
    answers,
    quizLoading,
    quizError,
    fetchQuiz,
    fetchPreviousAttempts,
    startQuizAttempt,
    updateAnswer,
    submitQuiz,
    clearQuizError,
  } = useQuiz();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    if (!quizId) return;

    // ✅ Using slice methods
    fetchQuiz(quizId);
    fetchPreviousAttempts(quizId);
  }, [quizId, fetchQuiz, fetchPreviousAttempts]);

  const handleStartQuiz = async () => {
    if (!quizId) return;

    try {
      // ✅ Using slice method
      await startQuizAttempt(quizId);
      setQuizStarted(true);

      // Set timer if needed
      if (currentQuiz?.timeLimit && currentQuiz?.duration) {
        setTimeRemaining(currentQuiz.duration * 60);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Error already handled in slice
    }
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    // ✅ Using slice method
    updateAnswer(questionId, answer);
  };

  const handleSubmitQuiz = async () => {
    if (!currentAttempt) return;

    try {
      // ✅ Using slice method
      await submitQuiz(currentAttempt.id);

      if (currentQuiz?.showResults) {
        navigate(`/courses/${courseId}/quiz/${quizId}/results?attempt=${currentAttempt.id}`);
      } else {
        navigate(`/courses/${courseId}/learn`);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Error already handled in slice
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (quizLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (quizError || !currentQuiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{quizError || 'Quiz not found'}</h3>
          <button
            onClick={() => {
              clearQuizError(); // ✅ Use clearQuizError
              fetchQuiz(quizId!);
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate(`/courses/${courseId}/learn`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  // Quiz Start Screen
  if (!quizStarted) {
    const canTakeQuiz = previousAttempts.length < currentQuiz.maxAttempts;
    const bestAttempt = previousAttempts.reduce((best, attempt) =>
      attempt.score > (best?.score || 0) ? attempt : best, null as QuizAttempt | null);

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{currentQuiz.title}</h1>
              {currentQuiz.description && (
                <p className="text-lg text-gray-600">{currentQuiz.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{currentQuiz.questions.length}</div>
                <div className="text-sm text-blue-600">Questions</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{currentQuiz.passingScore}%</div>
                <div className="text-sm text-green-600">Passing Score</div>
              </div>
              {currentQuiz.timeLimit && currentQuiz.duration && (
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{currentQuiz.duration}</div>
                  <div className="text-sm text-yellow-600">Minutes</div>
                </div>
              )}
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{currentQuiz.maxAttempts}</div>
                <div className="text-sm text-purple-600">Max Attempts</div>
              </div>
            </div>

            {previousAttempts.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Attempts</h3>
                <div className="space-y-2">
                  {previousAttempts.map((attempt) => (
                    <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Attempt {attempt.attemptNumber}</span>
                      <div className="flex items-center space-x-4">
                        <span className={`text-sm font-medium ${attempt.passed ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {attempt.score}/{attempt.maxScore} ({Math.round((attempt.score / attempt.maxScore) * 100)}%)
                        </span>
                        {attempt.passed && <CheckCircle className="h-4 w-4 text-green-600" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center">
              {canTakeQuiz ? (
                <button
                  onClick={handleStartQuiz}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Start Quiz
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-red-600 mb-4">
                    You have reached the maximum number of attempts ({currentQuiz.maxAttempts})
                  </p>
                  {bestAttempt && (
                    <p className="text-gray-600 mb-4">
                      Best Score: {Math.round((bestAttempt.score / bestAttempt.maxScore) * 100)}%
                    </p>
                  )}
                  <button
                    onClick={() => navigate(`/courses/${courseId}/learn`)}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Back to Course
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = currentQuiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === currentQuiz.questions.length - 1;
  const currentAnswer = answers[currentQuestion.id];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{currentQuiz.title}</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {timeRemaining !== null && (
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${timeRemaining < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                  <Clock className="h-4 w-4 inline mr-1" />
                  {formatTime(timeRemaining)}
                </div>
              )}

              <div className="text-sm text-gray-600">
                {Object.keys(answers).length} / {currentQuiz.questions.length} answered
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${currentQuestion.difficulty === 'BEGINNER' ? 'bg-green-100 text-green-800' :
                  currentQuestion.difficulty === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                }`}>
                {currentQuestion.difficulty}
              </span>
              <span className="text-sm text-gray-500">{currentQuestion.points} points</span>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQuestion.text}
            </h2>

            {/* Question Options */}
            <div className="space-y-3">
              {currentQuestion.type === 'MULTIPLE_CHOICE' && currentQuestion.options && (
                <>
                  {currentQuestion.options.map((option, index) => (
                    <label key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name={currentQuestion.id}
                        value={option}
                        checked={currentAnswer === option}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="flex-1">{option}</span>
                    </label>
                  ))}
                </>
              )}

              {currentQuestion.type === 'MULTIPLE_SELECT' && currentQuestion.options && (
                <>
                  {currentQuestion.options.map((option, index) => (
                    <label key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        value={option}
                        checked={(currentAnswer || []).includes(option)}
                        onChange={(e) => {
                          const current = currentAnswer || [];
                          const newAnswer = e.target.checked
                            ? [...current, option]
                            : current.filter((item: string) => item !== option);
                          handleAnswerChange(currentQuestion.id, newAnswer);
                        }}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="flex-1">{option}</span>
                    </label>
                  ))}
                </>
              )}

              {currentQuestion.type === 'TRUE_FALSE' && (
                <>
                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value="true"
                      checked={currentAnswer === 'true'}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="flex-1">True</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value="false"
                      checked={currentAnswer === 'false'}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="flex-1">False</span>
                  </label>
                </>
              )}

              {currentQuestion.type === 'SHORT_ANSWER' && (
                <textarea
                  value={currentAnswer || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Type your answer here..."
                />
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <div className="flex space-x-3">
              {isLastQuestion ? (
                <button
                  onClick={handleSubmitQuiz}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.min(currentQuiz.questions.length - 1, prev + 1))}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
