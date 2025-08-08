import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterview, useUI } from '../../store';

export const InterviewSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { createSession, sessionLoading } = useInterview();
  const { addNotification } = useUI();

  const [settings, setSettings] = useState({
    title: `Mock Interview - ${new Date().toLocaleDateString()}`,
    type: 'PRACTICE' as const,
    role: 'Software Developer',
    industry: 'Technology',
    recordVideo: true,
    recordAudio: true,
    enableHints: true,
    timePerQuestion: 120,
  });

  const handleCreateSession = async () => {
    try {
      // ✅ Create session with AI-generated questions from backend
      const session = await createSession({
        title: settings.title,
        type: settings.type,
        settings: {
          recordVideo: settings.recordVideo,
          recordAudio: settings.recordAudio,
          enableHints: settings.enableHints,
          timePerQuestion: settings.timePerQuestion,
          industry: settings.industry,
          role: settings.role,
        }
      });

      addNotification({
        type: 'success',
        title: 'Interview Created!',
        message: `Your ${session.type.replace('_', ' ')} interview is ready with AI-generated questions.`
      });

      // Navigate to the session
      navigate(`/interview/${session.id}/session`);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: 'Failed to create interview session. Please try again.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Set Up Your Mock Interview 🎯
          </h1>
          <p className="text-lg text-gray-600">
            Configure your interview settings and let our AI generate personalized questions
          </p>
        </div>

        {/* Setup Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          
          {/* Basic Settings */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Basic Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interview Title
              </label>
              <input
                type="text"
                value={settings.title}
                onChange={(e) => setSettings(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter interview title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interview Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { value: 'QUICK_PREP', label: 'Quick Prep', desc: '3 questions, 5-10 min' },
                  { value: 'PRACTICE', label: 'Practice', desc: '5 questions, 15-20 min' },
                  { value: 'FULL_MOCK', label: 'Full Mock', desc: '10 questions, 30-45 min' }
                ].map((type) => (
                  <label
                    key={type.value}
                    className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      settings.type === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={settings.type === type.value}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      onChange={(e) => setSettings(prev => ({ ...prev, type: e.target.value as any }))}
                      className="sr-only"
                    />
                    <span className="font-medium text-gray-900">{type.label}</span>
                    <span className="text-sm text-gray-500 mt-1">{type.desc}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Role & Industry */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Target Role</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Role
                </label>
                <select
                  value={settings.role}
                  onChange={(e) => setSettings(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Software Developer">Software Developer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  value={settings.industry}
                  onChange={(e) => setSettings(prev => ({ ...prev, industry: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Education">Education</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Consulting">Consulting</option>
                </select>
              </div>
            </div>
          </div>

          {/* Recording Settings */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Recording Preferences</h3>
            
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.recordVideo}
                  onChange={(e) => setSettings(prev => ({ ...prev, recordVideo: e.target.checked }))}
                  className="h-5 w-5 text-blue-600 rounded"
                />
                <span className="ml-3 text-gray-700">Record video for body language analysis</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.recordAudio}
                  onChange={(e) => setSettings(prev => ({ ...prev, recordAudio: e.target.checked }))}
                  className="h-5 w-5 text-blue-600 rounded"
                />
                <span className="ml-3 text-gray-700">Record audio for speech analysis</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.enableHints}
                  onChange={(e) => setSettings(prev => ({ ...prev, enableHints: e.target.checked }))}
                  className="h-5 w-5 text-blue-600 rounded"
                />
                <span className="ml-3 text-gray-700">Enable AI hints during interview</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/interview')}
              className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleCreateSession}
              disabled={sessionLoading}
              className={`px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold transition-all duration-200 ${
                sessionLoading 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {sessionLoading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Interview...
                </span>
              ) : (
                'Start AI Interview'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
