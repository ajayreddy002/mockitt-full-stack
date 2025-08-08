/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInterview, useUI } from '../../store';
import { InterviewAnswerRecorder } from '../../components/interview/InterviewAnswerRecorder';

export const InterviewSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const {
    getSession,
    startSession,
    endSession,
    currentSession,
    questions, // ✅ These come from your backend now
    nextQuestion,
    previousQuestion,
    recordResponse
  } = useInterview();
  const { addNotification } = useUI();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeSession = async () => {
      if (sessionId) {
        try {
          // ✅ Load session with AI-generated questions from backend
          await getSession(sessionId);
          setIsLoading(false);
        } catch (error) {
          addNotification({
            type: 'error',
            title: 'Session Load Failed',
            message: 'Could not load the interview session.'
          });
          navigate('/interview');
        }
      }
    };

    initializeSession();
  }, [sessionId, getSession]);

  const handleStartSession = async () => {
    if (sessionId) {
      try {
        await startSession(sessionId);
        addNotification({
          type: 'success',
          title: 'Interview Started!',
          message: 'Your mock interview has begun. Good luck!'
        });
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Start Failed',
          message: 'Could not start the interview session.'
        });
      }
    }
  };

  const handleEndSession = async () => {
    if (sessionId) {
      try {
        await endSession(sessionId);
        navigate(`/interview/${sessionId}/results`);
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'End Session Failed',
          message: 'Could not end the interview session properly.'
        });
      }
    }
  };

  const handleAnswerSaved = async (responseData: any) => {
    try {
      // Save the response to your backend
      await recordResponse({
        sessionId: responseData.sessionId,
        questionId: responseData.questionId,
        question: responseData.question,
        transcription: responseData.transcription,
        audioUrl: responseData.audioUrl, // Would be set after uploading audio
        duration: responseData.duration,
      });

      addNotification({
        type: 'success',
        title: 'Answer Recorded!',
        message: 'Your response has been saved and analyzed by AI.'
      });

      // Optional: Auto-advance to next question
      nextQuestion();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Could not save your response. Please try again.'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Interview Session</h3>
          <p className="text-gray-600">Preparing your AI-generated questions...</p>
        </div>
      </div>
    );
  }

  if (!currentSession || !questions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Session Not Found</h3>
          <p className="text-gray-600 mb-4">Could not load the interview session.</p>
          <button
            onClick={() => navigate('/interview')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentSession.currentQuestionIndex];
  const progress = ((currentSession.currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentSession.title}</h1>
            <p className="text-gray-600">
              Question {currentSession.currentQuestionIndex + 1} of {questions.length} •
              {currentSession.settings.role} in {currentSession.settings.industry}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {currentSession.status === 'SCHEDULED' && (
              <button
                onClick={handleStartSession}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Start Interview
              </button>
            )}

            {currentSession.status === 'IN_PROGRESS' && (
              <button
                onClick={handleEndSession}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                End Interview
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Interview Area */}
          <div className="lg:col-span-2 space-y-6">

            {/* Current Question */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {currentQuestion.type.charAt(0).toUpperCase() + currentQuestion.type.slice(1)}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium ml-2">
                      {currentQuestion.difficulty}
                    </span>
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {currentQuestion.question}
                  </h2>

                  {/* AI-Generated Hints */}
                  {currentSession.settings.enableHints && currentQuestion.hints.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-blue-900 mb-2">💡 AI Hints:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        {currentQuestion.hints.map((qHint: any, qIndex: number) => (
                          <li key={qIndex} className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            {qHint}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <InterviewAnswerRecorder
                sessionId={sessionId!}
                questionId={currentQuestion.id}
                question={currentQuestion.question}
                settings={currentSession.settings}
                onAnswerSaved={handleAnswerSaved}
              />

              {/* Interview Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  onClick={previousQuestion}
                  disabled={currentSession.currentQuestionIndex === 0}
                  className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>

                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.floor(currentSession.settings.timePerQuestion / 60)}:
                    {String(currentSession.settings.timePerQuestion % 60).padStart(2, '0')}
                  </div>
                  <p className="text-sm text-gray-600">Recommended Time</p>
                </div>

                <button
                  onClick={nextQuestion}
                  disabled={currentSession.currentQuestionIndex === questions.length - 1}
                  className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Session Info */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Session Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${currentSession.status === 'IN_PROGRESS' ? 'text-green-600' : 'text-gray-900'
                    }`}>
                    {currentSession.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium text-gray-900">
                    {currentSession.type.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Questions:</span>
                  <span className="font-medium text-gray-900">
                    {currentSession.currentQuestionIndex + 1} / {questions.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Question Tags */}
            {currentQuestion.tags.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.tags.map((cqTag: any, cqIndex: number) => (
                    <span
                      key={cqIndex}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    >
                      {cqTag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
