/* eslint-disable @typescript-eslint/no-explicit-any */
// frontend/src/components/courses/QuizResults.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Award, RotateCcw, ArrowLeft } from 'lucide-react';
import { mockittAPI } from '../../services/api';

interface QuizResult {
  attempt: {
    id: string;
    score: number;
    maxScore: number;
    passed: boolean;
    timeSpent: number;
    attemptNumber: number;
    completedAt: string;
  };
  responses: {
    questionId: string;
    question: string;
    userAnswer: any;
    correctAnswer: any;
    isCorrect: boolean;
    pointsEarned: number;
    explanation?: string;
  }[];
  quiz: {
    id: string;
    title: string;
    passingScore: number;
    allowReview: boolean;
  };
}

export const QuizResults: React.FC = () => {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const attemptId = searchParams.get('attempt');
  const [results, setResults] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!attemptId) return;

    const fetchResults = async () => {
      try {
        setLoading(true);
        const resultData = await mockittAPI.quizzes.getResults(attemptId);
        setResults(resultData);
      } catch (err) {
        setError('Failed to load quiz results');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [attemptId]);

  const handleRetakeQuiz = () => {
    navigate(`/courses/${courseId}/quiz/${quizId}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{error || 'Results not found'}</h3>
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

  const { attempt, responses, quiz } = results;
  const percentage = Math.round((attempt.score / attempt.maxScore) * 100);
  const correctAnswers = responses.filter(r => r.isCorrect).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/courses/${courseId}/learn`)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Course</span>
        </button>

        {/* Results Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              attempt.passed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {attempt.passed ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600" />
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {attempt.passed ? 'Congratulations!' : 'Keep Learning!'}
            </h1>
            
            <p className={`text-lg mb-6 ${
              attempt.passed ? 'text-green-600' : 'text-red-600'
            }`}>
              {attempt.passed 
                ? `You passed ${quiz.title}!` 
                : `You scored ${percentage}%. You need ${quiz.passingScore}% to pass.`
              }
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{percentage}%</div>
                <div className="text-sm text-gray-600">Your Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{correctAnswers}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="text-3xl font-bold text-red-600">{responses.length - correctAnswers}</div>
                <div className="text-sm text-gray-600">Incorrect</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{formatTime(attempt.timeSpent)}</div>
                <div className="text-sm text-gray-600">Time Spent</div>
              </div>
            </div>
          </div>
        </div>

        {/* Review Questions */}
        {quiz.allowReview && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Question Review</h2>
            
            <div className="space-y-6">
              {responses.map((response, index) => (
                <div key={response.questionId} className={`p-6 rounded-lg border-2 ${
                  response.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Question {index + 1}
                    </h3>
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                      response.isCorrect 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {response.isCorrect ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <span>{response.isCorrect ? 'Correct' : 'Incorrect'}</span>
                    </div>
                  </div>

                  <p className="text-gray-800 mb-4">{response.question}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm font-medium text-gray-600 mb-2">Your Answer:</div>
                      <div className={`p-3 rounded-lg ${
                        response.isCorrect ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {Array.isArray(response.userAnswer) 
                          ? response.userAnswer.join(', ') 
                          : response.userAnswer || 'No answer provided'
                        }
                      </div>
                    </div>
                    
                    {!response.isCorrect && (
                      <div>
                        <div className="text-sm font-medium text-gray-600 mb-2">Correct Answer:</div>
                        <div className="p-3 bg-green-100 rounded-lg">
                          {Array.isArray(response.correctAnswer) 
                            ? response.correctAnswer.join(', ') 
                            : response.correctAnswer
                          }
                        </div>
                      </div>
                    )}
                  </div>

                  {response.explanation && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-blue-800 mb-2">Explanation:</div>
                      <div className="text-blue-700">{response.explanation}</div>
                    </div>
                  )}

                  <div className="text-right mt-4">
                    <span className="text-sm text-gray-600">
                      Points: {response.pointsEarned} / {response.pointsEarned + (response.isCorrect ? 0 : 1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="text-center space-x-4">
          {!attempt.passed && (
            <button
              onClick={handleRetakeQuiz}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Retake Quiz</span>
            </button>
          )}
          
          {attempt.passed && (
            <button
              onClick={() => navigate(`/courses/${courseId}/learn`)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Award className="h-4 w-4" />
              <span>Continue Learning</span>
            </button>
          )}
        </div>
      </div>
  );
};
