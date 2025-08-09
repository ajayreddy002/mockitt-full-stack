/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInterview, useUI } from '../../store';

export const InterviewResultsPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { getSessionResults } = useInterview();
  const { addNotification } = useUI();

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (sessionId) {
        setLoading(true);
        try {
          // ✅ Fetch real results from your backend
          const sessionResults = await getSessionResults(sessionId);
          setResults(sessionResults);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          addNotification({
            type: 'error',
            title: 'Failed to Load Results',
            message: 'Could not fetch interview results.'
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchResults();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, getSessionResults]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Your Performance</h3>
          <p className="text-gray-600">Our AI is processing your interview responses...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Results Not Found</h3>
          <p className="text-gray-600 mb-6">We couldn't find the results for this interview session.</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Results Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Complete! 🎉</h1>
                <p className="text-lg text-gray-600">{results.title}</p>
                <p className="text-sm text-gray-500">
                  Completed on {new Date(results.completedAt).toLocaleDateString()} • 
                  Duration: {Math.floor(results.totalDuration / 60)}m {results.totalDuration % 60}s
                </p>
              </div>
              
              <div className="text-center">
                <div className={`text-4xl font-bold rounded-2xl px-6 py-4 ${
                  results.overallScore >= 85 ? 'text-green-600 bg-green-50' :
                  results.overallScore >= 70 ? 'text-blue-600 bg-blue-50' :
                  results.overallScore >= 55 ? 'text-yellow-600 bg-yellow-50' :
                  'text-red-600 bg-red-50'
                }`}>
                  {Math.round(results.overallScore)}%
                </div>
                <p className="text-sm text-gray-600 mt-2">Overall Score</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{results.questionsCompleted}</div>
                <p className="text-sm text-gray-600">Questions Completed</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.floor(results.totalDuration / 60)}m {results.totalDuration % 60}s
                </div>
                <p className="text-sm text-gray-600">Total Duration</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(results.questionResults.reduce((sum: number, q: any) => sum + (q.analysis.confidence || 0), 0) / results.questionResults.length)}%
                </div>
                <p className="text-sm text-gray-600">Avg Confidence</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Question Analysis</h2>
          
          <div className="space-y-6">
            {results.questionResults.map((result: any, index: number) => (
              <div key={result.questionId} className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">Question {index + 1}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        result.score >= 85 ? 'text-green-600 bg-green-50' :
                        result.score >= 70 ? 'text-blue-600 bg-blue-50' :
                        result.score >= 55 ? 'text-yellow-600 bg-yellow-50' :
                        'text-red-600 bg-red-50'
                      }`}>
                        {Math.round(result.score)}% Score
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {Math.floor(result.duration / 60)}m {result.duration % 60}s
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4">{result.question}</p>
                  </div>
                </div>

                {/* AI Analysis */}
                {result.analysis && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold text-green-700 mb-3">✅ Strengths</h5>
                      <ul className="space-y-2">
                        {(result.analysis.strengths || []).map((strength: string, i: number) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start">
                            <span className="text-green-500 mr-2 flex-shrink-0">•</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold text-orange-700 mb-3">⚠️ Areas for Improvement</h5>
                      <ul className="space-y-2">
                        {(result.analysis.improvements || []).map((improvement: string, i: number) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start">
                            <span className="text-orange-500 mr-2 flex-shrink-0">•</span>
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">AI-Powered Insights & Recommendations</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
              <h4 className="font-semibold text-green-900 mb-4">🏆 Top Strengths</h4>
              <ul className="space-y-2">
                {results.insights.topStrengths.map((strength: string, index: number) => (
                  <li key={index} className="text-sm text-green-800 flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 bg-orange-50 border border-orange-200 rounded-xl">
              <h4 className="font-semibold text-orange-900 mb-4">🎯 Key Improvements</h4>
              <ul className="space-y-2">
                {results.insights.keyImprovements.map((improvement: string, index: number) => (
                  <li key={index} className="text-sm text-orange-800 flex items-start">
                    <span className="text-orange-600 mr-2">•</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
              <h4 className="font-semibold text-blue-900 mb-4">📈 Next Steps</h4>
              <ul className="space-y-2">
                {results.insights.nextSteps.map((step: string, index: number) => (
                  <li key={index} className="text-sm text-blue-800 flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => navigate('/interview/setup')}
            className="flex items-center px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            Practice Again
          </button>
          
          <button
            onClick={() => navigate('/interview')}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            View All Sessions
          </button>
        </div>
      </div>
    </div>
  );
};
