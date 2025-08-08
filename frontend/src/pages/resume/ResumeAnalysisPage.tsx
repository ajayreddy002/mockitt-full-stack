import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Target,
  Lightbulb,
  Award,
  Download,
  Share2,
  RefreshCw,
  Sparkles,
  Zap,
  Eye
} from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { exportResumeAnalysisToPDF } from '../../utils/pdfExport';
import { useUI } from '../../store';
import { ScoreProgress } from '../../components/resume/ScoreProgress';

interface ResumeAnalysis {
  id: string;
  originalName: string;
  analysisScore: number;
  atsScore: number;
  skillsFound: string[];
  skillsGaps: string[];
  strengths: string[];
  improvements: string[];
  suggestions: {
    formatting: string[];
    content: string[];
    keywords: string[];
  };
  analyzedAt: string;
  provider: string;
}

export const ResumeAnalysisPage: React.FC = () => {
  const { addNotification } = useUI();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'suggestions'>('overview');

  useEffect(() => {
    if (id) {
      fetchAnalysis(id);
    }
  }, [id]);

  useEffect(() => {
    // Show confetti for excellent scores
    if (analysis && analysis.analysisScore >= 85) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [analysis]);

  const fetchAnalysis = async (resumeId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3000/resumes/${resumeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch resume analysis');
      }

      const data = await response.json();
      setAnalysis(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return { primary: '#10B981', secondary: '#065F46', gradient: 'from-emerald-500 to-green-600' };
    if (score >= 70) return { primary: '#3B82F6', secondary: '#1E40AF', gradient: 'from-blue-500 to-indigo-600' };
    if (score >= 50) return { primary: '#F59E0B', secondary: '#D97706', gradient: 'from-yellow-500 to-orange-600' };
    return { primary: '#EF4444', secondary: '#DC2626', gradient: 'from-red-500 to-red-600' };
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return '🚀';
    if (score >= 80) return '⭐';
    if (score >= 70) return '👍';
    if (score >= 50) return '📈';
    return '💪';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Outstanding';
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Very Good';
    if (score >= 50) return 'Good';
    return 'Improving';
  };

  const handleExportPDF = async () => {
    try {
      if (analysis) {
        await exportResumeAnalysisToPDF({
          id: analysis.id,
          originalName: analysis.originalName,
          analysisScore: analysis.analysisScore,
          atsScore: analysis.atsScore,
          skillsFound: analysis.skillsFound,
          skillsGaps: analysis.skillsGaps,
          strengths: analysis.strengths,
          improvements: analysis.improvements,
          suggestions: analysis.suggestions,
          analyzedAt: analysis.analyzedAt,
          provider: analysis.provider,
        });
        addNotification({
          type: 'success',
          title: 'PDF Exported',
          message: 'Your analysis report has been downloaded successfully!',
        });
      }
      return;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export PDF. Please try again.',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <Sparkles className="h-6 w-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-lg text-gray-600 mt-4 animate-pulse">Preparing your analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md mx-auto">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-600 mb-6">{error || 'Resume analysis data not available'}</p>
          <button
            onClick={() => navigate('/resume')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Back to Resumes
          </button>
        </div>
      </div>
    );
  }

  const scoreColors = getScoreColor(analysis.analysisScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full animate-pulse delay-1000"></div>
      </div>

      {/* Confetti Effect for High Scores */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                fontSize: '20px',
              }}
            >
              🎉
            </div>
          ))}
        </div>
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Fancy Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/resume')}
              className="group flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <div className="bg-white rounded-full p-2 shadow-md group-hover:shadow-lg transition-shadow duration-200">
                <ArrowLeft className="h-5 w-5" />
              </div>
              <span className="font-medium">Back to Resumes</span>
            </button>

            <div className="flex space-x-3">
              <button className="bg-white text-gray-700 px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
              <button className="bg-white text-gray-700 px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                onClick={() => handleExportPDF()}>
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 bg-gradient-to-r from-white to-blue-50/30">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-3 shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Resume Analysis Results
                </h1>
                <p className="text-lg text-gray-600">{analysis.originalName}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span className="bg-gray-100 px-3 py-1 rounded-full">
                  📅 {new Date(analysis.analyzedAt).toLocaleDateString()}
                </span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  🤖 {analysis.provider}
                </span>
              </div>
              <div className="text-2xl">{getScoreEmoji(analysis.analysisScore)}</div>
            </div>
          </div>
        </div>

        {/* Hero Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Overall Score - Enhanced */}
          <div className="group">
            <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Overall Score</h3>
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-2 shadow-lg">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 relative">
                    <CircularProgressbar
                      value={analysis.analysisScore}
                      text={`${analysis.analysisScore}%`}
                      styles={buildStyles({
                        textSize: '16px',
                        pathColor: scoreColors.primary,
                        textColor: scoreColors.primary,
                        trailColor: '#F3F4F6',
                        pathTransition: 'stroke-dasharray 1.5s ease-in-out',
                      })}
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent to-white/10"></div>
                  </div>

                  <div>
                    <p className={`text-3xl font-bold bg-gradient-to-r ${scoreColors.gradient} bg-clip-text text-transparent`}>
                      {getScoreLabel(analysis.analysisScore)}
                    </p>
                    <p className="text-gray-600 mt-1">
                      Your resume is performing well across key metrics
                    </p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span>Above average performance</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ATS Score - Enhanced */}
          <div className="group">
            <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-green-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">ATS Compatibility</h3>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-2 shadow-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 relative">
                    <CircularProgressbar
                      value={analysis.atsScore}
                      text={`${analysis.atsScore}%`}
                      styles={buildStyles({
                        textSize: '16px',
                        pathColor: getScoreColor(analysis.atsScore).primary,
                        textColor: getScoreColor(analysis.atsScore).primary,
                        trailColor: '#F3F4F6',
                        pathTransition: 'stroke-dasharray 1.5s ease-in-out',
                      })}
                    />
                  </div>

                  <div>
                    <p className={`text-3xl font-bold bg-gradient-to-r ${getScoreColor(analysis.atsScore).gradient} bg-clip-text text-transparent`}>
                      {getScoreLabel(analysis.atsScore)}
                    </p>
                    <p className="text-gray-600 mt-1">
                      Applicant tracking system readiness
                    </p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <Eye className="h-4 w-4 mr-1" />
                      <span>Recruiter visibility score</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {analysis && (
          <ScoreProgress
            currentScore={analysis.analysisScore}
            previousScore={75} // This would come from previous version
            currentAtsScore={analysis.atsScore}
            previousAtsScore={65} // This would come from previous version
          />
        )}

        {/* Fancy Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 p-2">
          <div className="flex space-x-2">
            {[
              { id: 'overview', label: 'Overview', icon: Award },
              { id: 'skills', label: 'Skills Analysis', icon: Zap },
              { id: 'suggestions', label: 'Improvements', icon: Lightbulb },
            ].map(tab => (
              <button
                key={tab.id}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Strengths */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-2 shadow-lg mr-3">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Your Strengths</h3>
                </div>
                <div className="space-y-4">
                  {analysis.strengths.map((strength, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors duration-200"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="bg-green-500 rounded-full p-1 mt-1">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-gray-800 font-medium">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Areas for Improvement */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-2 shadow-lg mr-3">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Growth Opportunities</h3>
                </div>
                <div className="space-y-4">
                  {analysis.improvements.map((improvement, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors duration-200"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="bg-orange-500 rounded-full p-1 mt-1">
                        <AlertTriangle className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-gray-800 font-medium">{improvement}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-8">
            {/* Skills Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Skills Found */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-2 shadow-lg mr-3">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Skills Found</h3>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {analysis.skillsFound.length} skills
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {analysis.skillsFound.map((skill, index) => (
                    <span
                      key={index}
                      className="group relative inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <Sparkles className="h-3 w-3 mr-2" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills to Add */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-2 shadow-lg mr-3">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Skills to Add</h3>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {analysis.skillsGaps.length} missing
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {analysis.skillsGaps.map((skill, index) => (
                    <span
                      key={index}
                      className="group relative inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <Zap className="h-3 w-3 mr-2" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-8">
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-2 shadow-lg mr-3">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Actionable Suggestions</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Formatting Suggestions */}
              <div className="group">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 h-full hover:from-blue-100 hover:to-blue-200 transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-2 shadow-lg mr-3">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900">Formatting</h4>
                  </div>
                  <div className="space-y-3">
                    {analysis.suggestions.formatting.map((suggestion, index) => (
                      <div key={index} className="flex items-start space-x-2 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                        <span className="text-blue-500 font-bold text-lg">•</span>
                        <span className="text-gray-700 text-sm">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Suggestions */}
              <div className="group">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 h-full hover:from-green-100 hover:to-green-200 transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-2 shadow-lg mr-3">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900">Content</h4>
                  </div>
                  <div className="space-y-3">
                    {analysis.suggestions.content.map((suggestion, index) => (
                      <div key={index} className="flex items-start space-x-2 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                        <span className="text-green-500 font-bold text-lg">•</span>
                        <span className="text-gray-700 text-sm">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Keywords Suggestions */}
              <div className="group">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 h-full hover:from-purple-100 hover:to-purple-200 transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-2 shadow-lg mr-3">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900">Keywords</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.suggestions.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fancy Action Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-8">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/resume')}
              className="text-gray-600 hover:text-gray-900 font-medium flex items-center space-x-2 group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
              <span>Back to Resume List</span>
            </button>

            <div className="flex space-x-4">
              <button className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:from-gray-200 hover:to-gray-300 transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg">
                <RefreshCw className="h-4 w-4" />
                <span>Re-analyze</span>
              </button>

              <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105">
                <Sparkles className="h-4 w-4" />
                <span>Improve Resume</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
