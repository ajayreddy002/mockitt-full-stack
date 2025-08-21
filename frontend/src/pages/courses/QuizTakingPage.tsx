import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ArrowLeft, ArrowRight, Flag } from 'lucide-react';
import { useQuiz } from '../../store';
import { QuestionRenderer } from '../../components/courses/QuestionRenderer';

export const QuizTakingPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const {
    currentQuiz,
    currentAttempt,
    answers,
    quizLoading,
    quizError,
    fetchQuiz,
    startQuizAttempt,
    updateAnswer,
    submitQuiz,
  } = useQuiz();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize quiz
  useEffect(() => {
    if (quizId) {
      fetchQuiz(quizId);
    }
  }, [quizId, fetchQuiz]);

  // Start attempt when quiz is loaded
  useEffect(() => {
    if (currentQuiz && !currentAttempt && quizId) {
      startQuizAttempt(quizId);
    }
  }, [currentQuiz, currentAttempt, quizId, startQuizAttempt]);

  // Timer setup
  useEffect(() => {
    if (currentQuiz?.timeLimit && currentQuiz.duration && currentAttempt) {
      const startTime = new Date(currentAttempt.startedAt).getTime();
      const duration = currentQuiz.duration * 60 * 1000; // Convert to milliseconds
      
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const elapsed = now - startTime;
        const remaining = Math.max(0, duration - elapsed);
        
        setTimeRemaining(Math.floor(remaining / 1000));
        
        if (remaining <= 0) {
          handleSubmitQuiz();
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuiz, currentAttempt]);

  const currentQuestion = currentQuiz?.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === (currentQuiz?.questions.length || 0) - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAnswerChange = (answer: any) => {
    if (currentQuestion) {
      updateAnswer(currentQuestion.id, answer);
    }
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!currentAttempt || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await submitQuiz(currentAttempt.id);
      navigate(`/quiz/${quizId}/results/${currentAttempt.id}`);
    } catch (error) {
      console.error('Submit failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (quizLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (quizError || !currentQuiz || !currentAttempt || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{quizError || 'Quiz not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{currentQuiz.title}</h1>
                <p className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
                </p>
              </div>
            </div>
            
            {/* Timer */}
            {timeRemaining !== null && (
              <div className="flex items-center bg-red-50 text-red-700 px-3 py-2 rounded-lg">
                <Clock className="w-4 h-4 mr-2" />
                <span className="font-mono font-medium">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <QuestionRenderer
            question={currentQuestion}
            answer={answers[currentQuestion.id]}
            onAnswerChange={handleAnswerChange}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handlePrevious}
            disabled={isFirstQuestion}
            className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </button>

          <div className="flex gap-3">
            {isLastQuestion ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Flag className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
