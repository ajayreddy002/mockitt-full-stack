import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Trash2, BarChart3, Calendar, Play } from 'lucide-react';
import { format } from 'date-fns';
import { useResumes, useUI } from '../../store';
import { SkeletonLoader } from '../common/LoadingStates';

export const ResumeList: React.FC = () => {
  const navigate = useNavigate();
  const {
    resumes,
    resumeLoading,
    resumeError,
    fetchResumes,
    analyzeResume,
    deleteResume,
  } = useResumes();
  
  const { addNotification } = useUI();

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleAnalyze = async (id: string) => {
    try {
      await analyzeResume(id);
      addNotification({
        type: 'success',
        title: 'Analysis Complete',
        message: 'Your resume has been analyzed successfully!',
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Analysis Failed',
        message: 'Failed to analyze resume. Please try again.',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      await deleteResume(id);
      addNotification({
        type: 'success',
        title: 'Resume Deleted',
        message: 'Resume has been successfully deleted.',
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete resume. Please try again.',
      });
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    return <FileText className="h-8 w-8 text-blue-500" />;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  if (resumeLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
            <SkeletonLoader lines={3} />
          </div>
        ))}
      </div>
    );
  }

  if (resumeError) {
    return (
      <div className="text-center py-8 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error: {resumeError}</p>
        <button 
          onClick={() => fetchResumes()} 
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes uploaded</h3>
        <p className="text-gray-600">Upload your first resume to get started with AI analysis!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {resumes.map((resume) => (
        <div key={resume.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {getFileIcon(resume.mimeType)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {resume.originalName}
                </h3>
                <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                  <span>{formatFileSize(resume.fileSize)}</span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(new Date(resume.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
                
                {/* Analysis Status */}
                <div className="mt-3 flex items-center space-x-4">
                  {resume.isAnalyzed ? (
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Analyzed
                      </span>
                      {resume.analysisScore && (
                        <span className="text-sm text-gray-600">
                          Score: {resume.analysisScore.toFixed(1)}/100
                        </span>
                      )}
                      {resume.atsScore && (
                        <span className="text-sm text-gray-600">
                          ATS: {resume.atsScore.toFixed(1)}/100
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Ready to Analyze
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {!resume.isAnalyzed && (
                <button
                  onClick={() => handleAnalyze(resume.id)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Analyze Resume"
                >
                  <Play className="h-5 w-5" />
                </button>
              )}
              
              {resume.isAnalyzed && (
                <button
                  onClick={() => navigate(`/resume/${resume.id}/analysis`)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View Analysis"
                >
                  <BarChart3 className="h-5 w-5" />
                </button>
              )}
              
              <button
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Download"
              >
                <Download className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => handleDelete(resume.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
