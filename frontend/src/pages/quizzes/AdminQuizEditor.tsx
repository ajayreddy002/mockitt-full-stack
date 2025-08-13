/* eslint-disable @typescript-eslint/no-explicit-any */
// frontend/src/pages/admin/quizzes/AdminQuizEditor.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Save, 
  Plus, 
  Trash2, 
  ArrowLeft,
  Sparkles, // ✅ AI icon
  Wand2,    // ✅ Magic wand icon
  Loader2   // ✅ Loading icon
} from 'lucide-react';
import { useAdminStore, useUI } from '../../store';

export const AdminQuizEditor: React.FC = () => {
  const { quizId } = useParams<{ quizId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    loading,
    createQuiz,
    createQuizByAI,
    updateQuiz,
    // fetchQuizById,
  } = useAdminStore();
  
  const { addNotification } = useUI();

  const [showAIModal, setShowAIModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState({
    topic: '',
    difficulty: 'INTERMEDIATE',
    numberOfQuestions: 10,
    questionTypes: ['MULTIPLE_CHOICE', 'TRUE_FALSE'],
    focus: ''
  });

  const [quizData, setQuizData] = useState({
    moduleId: '',
    title: '',
    description: '',
    type: 'MODULE_ASSESSMENT',
    difficulty: 'INTERMEDIATE',
    duration: 30,
    passingScore: 70,
    maxAttempts: 3,
    isRandomized: false,
    showResults: true,
    allowReview: true,
    timeLimit: true,
    questions: [] as any[]
  });

  const isEditing = !!quizId;

  // ✅ Check for AI-generated quiz data from navigation state
  useEffect(() => {
    if (location.state?.generatedQuiz) {
      const generatedQuiz = location.state.generatedQuiz;
      setQuizData({
        ...quizData,
        title: generatedQuiz.title,
        description: generatedQuiz.description,
        type: generatedQuiz.type,
        difficulty: generatedQuiz.difficulty,
        duration: generatedQuiz.duration,
        passingScore: generatedQuiz.passingScore,
        maxAttempts: generatedQuiz.maxAttempts,
        isRandomized: generatedQuiz.isRandomized,
        showResults: generatedQuiz.showResults,
        allowReview: generatedQuiz.allowReview,
        timeLimit: generatedQuiz.timeLimit,
        questions: generatedQuiz.questions || []
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // ✅ AI Quiz Generation Handler
  const handleAIGeneration = async () => {
    if (!aiPrompt.topic) {
      addNotification({
        type: 'error',
        title: 'Missing Information',
        message: 'Please provide a topic for AI generation.'
      });
      return;
    }

    setAiGenerating(true);
    try {
      const response = await createQuizByAI(JSON.stringify(aiPrompt))

      if (!response.ok) throw new Error('AI generation failed');

      const generatedQuiz = await response.json();
      
      // ✅ Populate form with AI-generated content
      setQuizData({
        ...quizData,
        title: generatedQuiz.title,
        description: generatedQuiz.description,
        type: generatedQuiz.type,
        difficulty: generatedQuiz.difficulty,
        duration: generatedQuiz.duration,
        passingScore: generatedQuiz.passingScore,
        maxAttempts: generatedQuiz.maxAttempts,
        isRandomized: generatedQuiz.isRandomized,
        showResults: generatedQuiz.showResults,
        allowReview: generatedQuiz.allowReview,
        timeLimit: generatedQuiz.timeLimit,
        questions: generatedQuiz.questions || []
      });

      setShowAIModal(false);
      addNotification({
        type: 'success',
        title: 'Quiz Generated',
        message: 'AI has successfully generated your quiz content!'
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to generate quiz content';
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: errorMessage
      });
    } finally {
      setAiGenerating(false);
    }
  };

  // ✅ Generate individual questions with AI
  const generateQuestionWithAI = async () => {
    if (!quizData.title) {
      addNotification({
        type: 'error',
        title: 'Missing Information',
        message: 'Please provide a quiz title first.'
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/quizzes/generate-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          topic: quizData.title,
          difficulty: quizData.difficulty,
          questionType: 'MULTIPLE_CHOICE'
        })
      });

      if (!response.ok) throw new Error('Question generation failed');

      const newQuestion = await response.json();
      
      setQuizData(prev => ({
        ...prev,
        questions: [...prev.questions, { 
          ...newQuestion, 
          id: `temp_${Date.now()}`,
          orderIndex: prev.questions.length 
        }]
      }));
      addNotification({
        type: 'success',
        title: 'Question Generated',
        message: 'AI has successfully generated a new question!'
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to generate question';
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: errorMessage
      });
    }
  };

  const handleSave = async () => {
    try {
      if (isEditing && quizId) {
        await updateQuiz(quizId, quizData);
        addNotification({
          type: 'success',
          title: 'Quiz Updated',
          message: 'Quiz has been successfully updated.'
        });
      } else {
        await createQuiz(quizData);
        addNotification({
          type: 'success',
          title: 'Quiz Created',
          message: 'Quiz has been successfully created.'
        });
      }
      navigate('/admin/quizzes');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to save quiz';
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: errorMessage
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with AI Generation Option */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/quizzes')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Quizzes</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Quiz' : 'Create New Quiz'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'Update quiz content and settings' : 'Build a comprehensive assessment'}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          {/* ✅ AI Generation Button for New Quizzes */}
          {!isEditing && (
            <button
              onClick={() => setShowAIModal(true)}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate with AI</span>
            </button>
          )}
          
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Saving...' : 'Save Quiz'}</span>
          </button>
        </div>
      </div>

      {/* Quiz Form with Manual + AI Options */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {/* Basic Info Tab */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quiz Information</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  value={quizData.title}
                  onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., React Fundamentals Assessment"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={quizData.description}
                  onChange={(e) => setQuizData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the quiz content and objectives"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Type</label>
                  <select
                    value={quizData.type}
                    onChange={(e) => setQuizData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MODULE_ASSESSMENT">Module Assessment</option>
                    <option value="PRACTICE_QUIZ">Practice Quiz</option>
                    <option value="FINAL_ASSESSMENT">Final Assessment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={quizData.difficulty}
                    onChange={(e) => setQuizData(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Quiz Questions</h2>
              <div className="flex space-x-2">
                <button
                  onClick={generateQuestionWithAI}
                  className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
                >
                  <Wand2 className="h-4 w-4" />
                  <span>Generate Question</span>
                </button>
                <button
                  onClick={() => setQuizData(prev => ({
                    ...prev,
                    questions: [...prev.questions, {
                      id: `temp_${Date.now()}`,
                      text: '',
                      type: 'MULTIPLE_CHOICE',
                      options: ['', '', '', ''],
                      correctAnswer: '',
                      explanation: '',
                      points: 1,
                      difficulty: 'INTERMEDIATE',
                      orderIndex: prev.questions.length
                    }]
                  }))}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Manually</span>
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {quizData.questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      Question {index + 1}
                    </h3>
                    <button
                      onClick={() => setQuizData(prev => ({
                        ...prev,
                        questions: prev.questions.filter((_, i) => i !== index)
                      }))}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Text *
                      </label>
                      <textarea
                        value={question.text}
                        onChange={(e) => {
                          const newQuestions = [...quizData.questions];
                          newQuestions[index] = { ...question, text: e.target.value };
                          setQuizData(prev => ({ ...prev, questions: newQuestions }));
                        }}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your question here..."
                      />
                    </div>

                    {/* Question Options */}
                    {question.type === 'MULTIPLE_CHOICE' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Answer Options
                        </label>
                        <div className="space-y-2">
                          {question.options.map((option: string, optionIndex: number) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name={`question-${index}-correct`}
                                checked={question.correctAnswer === option}
                                onChange={() => {
                                  const newQuestions = [...quizData.questions];
                                  newQuestions[index] = { ...question, correctAnswer: option };
                                  setQuizData(prev => ({ ...prev, questions: newQuestions }));
                                }}
                                className="h-4 w-4 text-blue-600"
                              />
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newQuestions = [...quizData.questions];
                                  const newOptions = [...question.options];
                                  newOptions[optionIndex] = e.target.value;
                                  newQuestions[index] = { ...question, options: newOptions };
                                  setQuizData(prev => ({ ...prev, questions: newQuestions }));
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                placeholder={`Option ${optionIndex + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {quizData.questions.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-3 bg-gray-100 rounded-full">
                      <Sparkles className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
                      <p className="text-gray-600 mb-6">Start building your quiz by adding questions manually or generate them with AI.</p>
                      <div className="flex justify-center space-x-3">
                        <button
                          onClick={generateQuestionWithAI}
                          className="inline-flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
                        >
                          <Wand2 className="h-4 w-4" />
                          <span>Generate with AI</span>
                        </button>
                        <button
                          onClick={() => setQuizData(prev => ({
                            ...prev,
                            questions: [...prev.questions, {
                              id: `temp_${Date.now()}`,
                              text: '',
                              type: 'MULTIPLE_CHOICE',
                              options: ['', '', '', ''],
                              correctAnswer: '',
                              explanation: '',
                              points: 1,
                              difficulty: 'INTERMEDIATE',
                              orderIndex: 0
                            }]
                          }))}
                          className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Manually</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Preview</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  {quizData.title || 'Quiz Title'}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {quizData.description || 'Quiz description will appear here...'}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{quizData.difficulty}</span>
                  <span>{quizData.duration}min</span>
                  <span>{quizData.questions.length} questions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ AI Generation Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Generate Quiz with AI</h2>
                  <p className="text-gray-600 text-sm">Let AI create a comprehensive quiz for you</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Topic *</label>
                <input
                  type="text"
                  value={aiPrompt.topic}
                  onChange={(e) => setAiPrompt(prev => ({ ...prev, topic: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., JavaScript ES6, React Hooks, Database Design"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={aiPrompt.difficulty}
                    onChange={(e) => setAiPrompt(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
                  <input
                    type="number"
                    value={aiPrompt.numberOfQuestions}
                    onChange={(e) => setAiPrompt(prev => ({ ...prev, numberOfQuestions: parseInt(e.target.value) || 10 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    min="5"
                    max="50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Focus Areas (optional)</label>
                <textarea
                  value={aiPrompt.focus}
                  onChange={(e) => setAiPrompt(prev => ({ ...prev, focus: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Any specific areas or concepts to focus on..."
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setShowAIModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={aiGenerating}
              >
                Cancel
              </button>
              <button
                onClick={handleAIGeneration}
                disabled={aiGenerating || !aiPrompt.topic}
                className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {aiGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Quiz</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
