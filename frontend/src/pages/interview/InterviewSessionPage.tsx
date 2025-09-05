/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, useInterview, useUI } from '../../store';
import { InterviewAnswerRecorder } from '../../components/interview/InterviewAnswerRecorder';
import { RealTimeSpeechAnalyzer } from '../../components/interview/RealTimeSpeechAnalyzer';
import { InterviewSessionHeader } from '../../components/interview/InterviewSessionHeader';
import { InterviewReadyScreen } from '../../components/interview/InterviewReadyScreen';
import { ProfessionalButton } from '../../components/common/ProfessionalButton';
import { ChevronLeft, ChevronRight, Square } from 'lucide-react';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { SmartCoachingPanel } from '../../components/interview/SmartCoachingPanel';

export const InterviewSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const {
    getSession, startSession, endSession, currentSession, questions,
    nextQuestion, previousQuestion, savePendingResponse, submitAllResponses
  } = useInterview();
  const { addNotification } = useUI();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [startingInterview, setStartingInterview] = useState(false);
  const [endingInterview, setEndingInterview] = useState(false);
  const [endingProgress, setEndingProgress] = useState(0);
  const [speechMetrics, setSpeechMetrics] = useState<any | null>(null);

  useEffect(() => {
    const initializeSession = async () => {
      if (sessionId) {
        try {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, getSession]);

  const handleStartInterview = async () => {
    if (sessionId) {
      setStartingInterview(true);
      try {
        await startSession(sessionId);
        addNotification({
          type: 'success',
          title: 'Interview Started!',
          message: 'Your AI-powered mock interview has begun. Good luck!'
        });
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Start Failed',
          message: 'Could not start the interview session.'
        });
      } finally {
        setStartingInterview(false);
      }
    }
  };

  const handleEndInterview = async () => {
    if (sessionId) {
      setEndingInterview(true);
      setEndingProgress(0);

      try {
        // Simulate progress steps
        setEndingProgress(25);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Submit all pending responses
        setEndingProgress(50);
        await submitAllResponses(sessionId);
        await new Promise(resolve => setTimeout(resolve, 1000));

        setEndingProgress(75);
        await endSession(sessionId);
        await new Promise(resolve => setTimeout(resolve, 1000));

        setEndingProgress(100);
        await new Promise(resolve => setTimeout(resolve, 500));

        // Navigate to results
        navigate(`/interview/${sessionId}/results`);
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Submission Failed',
          message: 'Could not save all responses. Please try again.'
        });
        setEndingInterview(false);
        setEndingProgress(0);
      }
    }
  };


  const handleAnswerSaved = (responseData: any) => {
    // ✅ Save to pending responses instead of immediate API call
    savePendingResponse({
      sessionId: responseData.sessionId,
      questionId: responseData.questionId,
      question: responseData.question,
      transcription: responseData.transcription,
      duration: responseData.duration,
    });

    addNotification({
      type: 'success',
      title: 'Answer Saved!',
      message: 'Your response has been saved locally.'
    });

    // Auto-advance to next question
    nextQuestion();
  };

  const handleSpeechMetricsUpdate = (metrics: any) => {
    setSpeechMetrics(metrics);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Interview Session</h3>
          <p className="text-gray-600">Preparing your AI-generated questions...</p>
        </div>
      </div>
    );
  }

  if (!currentSession || !questions.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Session Not Found</h3>
          <p className="text-gray-600 mb-6">Could not load the interview session.</p>
          <ProfessionalButton variant="primary" onClick={() => navigate('/interview')}>
            Back to Dashboard
          </ProfessionalButton>
        </div>
      </div>
    );
  }

  // ✅ Show ready screen before starting interview
  if (currentSession.status === 'SCHEDULED') {
    return (
      <InterviewReadyScreen
        session={currentSession}
        onStartInterview={handleStartInterview}
        loading={startingInterview}
      />
    );
  }

  const currentQuestion = questions[currentSession.currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <LoadingOverlay
        isVisible={endingInterview}
        title="Finalizing Your Interview"
        message="Our AI is processing your responses and generating detailed insights..."
        progress={endingProgress}
      />
      {/* ✅ Professional header shown only during active interview */}
      <InterviewSessionHeader session={currentSession} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Main Interview Area */}
          <div className="lg:col-span-3 space-y-6">

            {/* ✅ Real-time speech analysis - no toast notifications */}
            <RealTimeSpeechAnalyzer onSpeechMetricsUpdate={handleSpeechMetricsUpdate} />

            <SmartCoachingPanel
              sessionId={currentSession?.id || ''}
              currentQuestion={currentQuestion.question}
              isRecording={speechMetrics ? true : false} // Based on metrics availability
              speechMetrics={speechMetrics}
              userProfile={user}
              onCoachingReceived={(insights) => {
                console.log('Smart coaching insights:', insights);
              }}
            />

            {/* Enhanced Question Display */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Question {currentSession.currentQuestionIndex + 1}
                  </span>
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    {currentQuestion.difficulty}
                  </span>
                  <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {currentQuestion.type}
                  </span>
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mb-6 leading-relaxed">
                {currentQuestion.question}
              </h2>

              {/* AI-Generated Hints */}
              {currentSession.settings.enableHints && currentQuestion.hints.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                    💡 AI Hints
                  </h4>
                  <ul className="space-y-2">
                    {currentQuestion.hints.map((hint: any, index: number) => (
                      <li key={index} className="text-blue-800 text-sm flex items-start">
                        <span className="text-blue-500 mr-3 flex-shrink-0">•</span>
                        <span>{hint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* ✅ Answer recorder with Save Answer button visible */}
            <InterviewAnswerRecorder
              sessionId={sessionId!}
              questionId={currentQuestion.id}
              question={currentQuestion.question}
              settings={currentSession.settings}
              onAnswerSaved={handleAnswerSaved}
            />

            {/* ✅ Professional Navigation Controls */}
            <div className="flex items-center justify-between pt-6">
              <ProfessionalButton
                variant="secondary"
                icon={ChevronLeft}
                disabled={currentSession.currentQuestionIndex === 0}
                onClick={previousQuestion}
              >
                Previous
              </ProfessionalButton>

              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Recommended Time</div>
                <div className="text-lg font-semibold text-gray-900">
                  {Math.floor(currentSession.settings.timePerQuestion / 60)}:
                  {String(currentSession.settings.timePerQuestion % 60).padStart(2, '0')}
                </div>
              </div>

              <ProfessionalButton
                variant="primary"
                icon={ChevronRight}
                disabled={currentSession.currentQuestionIndex === questions.length - 1}
                onClick={nextQuestion}
              >
                Next
              </ProfessionalButton>
            </div>
          </div>

          {/* Professional Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Session Progress */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Interview Progress</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-medium text-gray-900">
                    {currentSession.currentQuestionIndex} / {questions.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">In Progress</span>
                </div>
              </div>
            </div>

            {/* Question Topics */}
            {currentQuestion.tags.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.tags.map((tag: any, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ✅ End Interview Button */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Session Control</h3>
              <ProfessionalButton
                variant="danger"
                size="lg"
                icon={Square}
                loading={endingInterview}
                onClick={handleEndInterview}
                className="w-full"
              >
                {endingInterview ? 'Ending Interview...' : 'End Interview'}
              </ProfessionalButton>
              <p className="text-xs text-gray-500 mt-2 text-center">
                This will submit all your responses and generate results
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
