import React, { useState } from 'react';
import { ResumeUpload } from '../../components/resume/ResumeUpload';
import { ResumeList } from '../../components/resume/ResumeList';
import { FileText, Upload, List, TrendingUp, Users, Award } from 'lucide-react';

export const ResumePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'list'>('upload');
  const [refreshKey, setRefreshKey] = useState(0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUploadComplete = (resumeData: any) => {
    console.log('Upload completed:', resumeData);
    setRefreshKey(prev => prev + 1);
    setActiveTab('list');
  };

  const tabs = [
    { id: 'upload', name: 'Upload Resume', icon: Upload, description: 'Add new resume for analysis' },
    { id: 'list', name: 'My Resumes', icon: List, description: 'View and manage your resumes' },
  ];

  const stats = [
    { label: 'Resumes Analyzed', value: '3', icon: FileText, color: 'blue' },
    { label: 'Average Score', value: '85%', icon: TrendingUp, color: 'green' },
    { label: 'Improvements Made', value: '12', icon: Award, color: 'purple' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FileText className="h-7 w-7 mr-3 text-blue-500" />
              Resume Analyzer
            </h1>
            <p className="mt-1 text-gray-600">
              Get AI-powered analysis with ATS compatibility scoring and personalized improvement suggestions
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="hidden lg:flex space-x-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-${stat.color}-100 mb-1`}>
                  <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                </div>
                <div className="text-lg font-semibold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'upload' | 'list')}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-200 flex items-center`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div>{tab.name}</div>
                  <div className="text-xs opacity-75">{tab.description}</div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'upload' && (
            <div className="max-w-2xl mx-auto">
              <ResumeUpload onUploadComplete={handleUploadComplete} />
            </div>
          )}
          {activeTab === 'list' && (
            <div key={refreshKey}>
              <ResumeList />
            </div>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="bg-blue-500 rounded-lg p-2">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Resume Optimization Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <ul className="space-y-1">
                <li>• Use a clean, professional format (PDF preferred)</li>
                <li>• Include relevant keywords for your target industry</li>
                <li>• Keep file size under 10MB for faster processing</li>
              </ul>
              <ul className="space-y-1">
                <li>• Ensure your contact information is clearly visible</li>
                <li>• Include quantifiable achievements and results</li>
                <li>• Tailor your resume for each job application</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
