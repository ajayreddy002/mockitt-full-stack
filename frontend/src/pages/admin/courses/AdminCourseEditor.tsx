/* eslint-disable @typescript-eslint/no-explicit-any */
// frontend/src/pages/admin/courses/AdminCourseEditor.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  Plus,
  Trash2,
  // Eye,
  ArrowLeft,
  GripVertical,
  BookOpen,
  // Video,
  FileText,
  Image,
  Sparkles,
  Wand2,
  Loader2
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useAdminStore, useUI } from '../../../store';

export const AdminCourseEditor: React.FC = () => {
  const { courseId } = useParams<{ courseId?: string }>();
  const navigate = useNavigate();
  const {
    currentCourse,
    loading,
    createCourse,
    updateCourse,
    fetchCourseForEdit,
    createCourseByAI
  } = useAdminStore();
  const { addNotification } = useUI();

  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    level: 'BEGINNER',
    estimatedHours: 0,
    price: 0,
    isPremium: false,
    thumbnailUrl: '',
    modules: [] as any[]
  });

  const [activeTab, setActiveTab] = useState('basic');
  const isEditing = !!courseId;

  const [showAIModal, setShowAIModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState({
    topic: '',
    level: 'INTERMEDIATE',
    category: '',
    duration: 8,
    targetAudience: '',
    specificRequirements: ''
  });

  useEffect(() => {
    if (isEditing && courseId) {
      fetchCourseForEdit(courseId);
    }
  }, [courseId, isEditing, fetchCourseForEdit]);

  useEffect(() => {
    if (currentCourse && isEditing) {
      setCourseData({
        title: currentCourse.title,
        description: currentCourse.description,
        shortDescription: currentCourse.shortDescription || '',
        category: currentCourse.category,
        level: currentCourse.level,
        estimatedHours: currentCourse.estimatedHours,
        price: Number(currentCourse.price),
        isPremium: currentCourse.isPremium,
        thumbnailUrl: currentCourse.thumbnailUrl || '',
        modules: currentCourse.modules || []
      });
    }
  }, [currentCourse, isEditing]);

  const handleSave = async () => {
    try {
      if (isEditing && courseId) {
        await updateCourse(courseId, courseData);
        addNotification({
          type: 'success',
          title: 'Course Updated',
          message: 'Your course has been successfully updated.'
        });
      } else {
        await createCourse(courseData);
        addNotification({
          type: 'success',
          title: 'Course Created',
          message: 'Your new course has been created successfully.'
        });
      }
      navigate('/admin/courses');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to save course. Please try again.';
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: errorMessage
      });
    }
  };

  const handleAIGeneration = async () => {
    if (!aiPrompt.topic || !aiPrompt.category) {
      addNotification({
        type: 'error',
        title: 'Missing Information',
        message: 'Please provide both topic and category for AI generation.'
      });
      return;
    }

    setAiGenerating(true);
    try {
      const response = await createCourseByAI(JSON.stringify(aiPrompt));
      console.log('AI Response:', response); // Debug log


      // ✅ Populate form with AI-generated content
      setCourseData({
        ...courseData,
        title: response.title,
        description: response.description,
        shortDescription: response.shortDescription,
        category: aiPrompt.category,
        level: aiPrompt.level,
        estimatedHours: response.estimatedHours,
        modules: response.modules
      });

      setShowAIModal(false);
      addNotification({
        type: 'success',
        title: 'AI Course Generated',
        message: 'AI has successfully generated your course content!'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate course content';
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: errorMessage
      });
    } finally {
      setAiGenerating(false);
    }
  };

  // ✅ AI Lesson Content Generation
  const generateLessonContent = async (moduleIndex: number, lessonIndex: number) => {
    const lesson = courseData.modules[moduleIndex].lessons[lessonIndex];
    if (!lesson.title) {
      addNotification({
        type: 'warning',
        title: 'Missing Title',
        message: 'Please provide a lesson title first.'
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/courses/generate-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          topic: lesson.title,
          duration: lesson.duration || 30,
          level: courseData.level
        })
      });

      if (!response.ok) throw new Error('Content generation failed');

      const content = await response.text();

      // Update lesson content
      updateLesson(moduleIndex, lessonIndex, { content });
      addNotification({
        type: 'success',
        title: 'Content Generated',
        message: 'AI has generated lesson content successfully!'
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: 'Failed to generate lesson content. Please try again.'
      });
    }
  };

  const addModule = () => {
    setCourseData(prev => ({
      ...prev,
      modules: [
        ...prev.modules,
        {
          id: `temp_${Date.now()}`,
          title: '',
          description: '',
          orderIndex: prev.modules.length,
          isRequired: true,
          lessons: []
        }
      ]
    }));
  };

  const updateModule = (moduleIndex: number, updates: any) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map((module, index) =>
        index === moduleIndex ? { ...module, ...updates } : module
      )
    }));
  };

  const deleteModule = (moduleIndex: number) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, index) => index !== moduleIndex)
    }));
  };

  const addLesson = (moduleIndex: number) => {
    const newLesson = {
      id: `temp_lesson_${Date.now()}`,
      title: '',
      content: '',
      contentType: 'TEXT',
      contentUrl: '',
      duration: 0,
      orderIndex: courseData.modules[moduleIndex].lessons.length,
      isRequired: true
    };

    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map((module, index) =>
        index === moduleIndex
          ? { ...module, lessons: [...(module.lessons || []), newLesson] }
          : module
      )
    }));
  };

  const updateLesson = (moduleIndex: number, lessonIndex: number, updates: any) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map((module, mIndex) =>
        mIndex === moduleIndex
          ? {
            ...module,
            lessons: module.lessons.map((lesson: any, lIndex: number) =>
              lIndex === lessonIndex ? { ...lesson, ...updates } : lesson
            )
          }
          : module
      )
    }));
  };

  const deleteLesson = (moduleIndex: number, lessonIndex: number) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map((module, mIndex) =>
        mIndex === moduleIndex
          ? {
            ...module,
            lessons: module.lessons.filter((_: any, lIndex: number) => lIndex !== lessonIndex)
          }
          : module
      )
    }));
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (result.type === 'module') {
      const newModules = Array.from(courseData.modules);
      const [reorderedModule] = newModules.splice(source.index, 1);
      newModules.splice(destination.index, 0, reorderedModule);

      setCourseData(prev => ({
        ...prev,
        modules: newModules.map((module, index) => ({
          ...module,
          orderIndex: index
        }))
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/courses')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Courses</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Course' : 'Create New Course'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'Update course content and settings' : 'Build a comprehensive learning experience'}
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          {/* ✅ AI Generation Button */}
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
            <span>{loading ? 'Saving...' : 'Save Course'}</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'basic', label: 'Basic Info', icon: FileText },
            { id: 'modules', label: 'Modules & Lessons', icon: BookOpen },
            { id: 'settings', label: 'Settings', icon: Image }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {activeTab === 'basic' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Information</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    value={courseData.title}
                    onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Complete React Development Bootcamp"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={courseData.shortDescription}
                    onChange={(e) => setCourseData(prev => ({ ...prev, shortDescription: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description for course cards (max 150 characters)"
                    maxLength={150}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {courseData.shortDescription.length}/150 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Description *
                  </label>
                  <textarea
                    value={courseData.description}
                    onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Detailed course description, learning outcomes, prerequisites, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      value={courseData.category}
                      onChange={(e) => setCourseData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Category</option>
                      <option value="FRONTEND_DEVELOPMENT">Frontend Development</option>
                      <option value="BACKEND_DEVELOPMENT">Backend Development</option>
                      <option value="FULLSTACK_DEVELOPMENT">Full Stack Development</option>
                      <option value="DATA_SCIENCE">Data Science</option>
                      <option value="DEVOPS">DevOps</option>
                      <option value="MOBILE_DEVELOPMENT">Mobile Development</option>
                      <option value="SYSTEM_DESIGN">System Design</option>
                      <option value="TECHNICAL_INTERVIEWS">Technical Interviews</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Level *</label>
                    <select
                      value={courseData.level}
                      onChange={(e) => setCourseData(prev => ({ ...prev, level: e.target.value }))}
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
          )}

          {activeTab === 'modules' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Course Modules</h2>
                <button
                  onClick={addModule}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Module</span>
                </button>
              </div>

              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="modules" type="module">
                  {(provided: any) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                      {courseData.modules.map((module, moduleIndex) => (
                        <Draggable key={module.id} draggableId={module.id} index={moduleIndex}>
                          {(provided: any, snapshot: any) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${snapshot.isDragging ? 'shadow-lg' : '' // ✅ Optional: add dragging styles
                                }`}
                            >
                              <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
                                <div className="flex items-center space-x-3">
                                  <div {...provided.dragHandleProps}>
                                    <GripVertical className="h-5 w-5 text-gray-400" />
                                  </div>
                                  <h3 className="text-lg font-medium text-gray-900">
                                    Module {moduleIndex + 1}
                                  </h3>
                                </div>
                                <button
                                  onClick={() => deleteModule(moduleIndex)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="p-6 space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Module Title *
                                  </label>
                                  <input
                                    type="text"
                                    value={module.title}
                                    onChange={(e) => updateModule(moduleIndex, { title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Introduction to React Hooks"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Module Description
                                  </label>
                                  <textarea
                                    value={module.description}
                                    onChange={(e) => updateModule(moduleIndex, { description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Brief description of what students will learn in this module"
                                  />
                                </div>

                                {/* Lessons Section */}
                                <div className="border-t border-gray-200 pt-4">
                                  <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-md font-medium text-gray-900">Lessons</h4>
                                    <button
                                      onClick={() => addLesson(moduleIndex)}
                                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                                    >
                                      <Plus className="h-4 w-4" />
                                      <span>Add Lesson</span>
                                    </button>
                                  </div>

                                  <div className="space-y-3">
                                    {(module.lessons || []).map((lesson: any, lessonIndex: number) => (
                                      <div key={lesson.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <div className="flex justify-between items-start mb-3">
                                          <h5 className="text-sm font-medium text-gray-900">
                                            Lesson {lessonIndex + 1}
                                          </h5>
                                          <button
                                            onClick={() => deleteLesson(moduleIndex, lessonIndex)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                              Lesson Title *
                                            </label>
                                            <input
                                              type="text"
                                              value={lesson.title}
                                              onChange={(e) => updateLesson(moduleIndex, lessonIndex, { title: e.target.value })}
                                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                              placeholder="Lesson title"
                                            />
                                          </div>

                                          <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                              Content Type
                                            </label>
                                            <select
                                              value={lesson.contentType}
                                              onChange={(e) => updateLesson(moduleIndex, lessonIndex, { contentType: e.target.value })}
                                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                            >
                                              <option value="TEXT">Text</option>
                                              <option value="VIDEO">Video</option>
                                              <option value="AUDIO">Audio</option>
                                              <option value="PDF">PDF</option>
                                              <option value="INTERACTIVE">Interactive</option>
                                            </select>
                                          </div>

                                          <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                              Duration (minutes)
                                            </label>
                                            <input
                                              type="number"
                                              value={lesson.duration}
                                              onChange={(e) => updateLesson(moduleIndex, lessonIndex, { duration: parseInt(e.target.value) || 0 })}
                                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                              min="0"
                                            />
                                          </div>

                                          {lesson.contentType !== 'TEXT' && (
                                            <div>
                                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Content URL
                                              </label>
                                              <input
                                                type="url"
                                                value={lesson.contentUrl}
                                                onChange={(e) => updateLesson(moduleIndex, lessonIndex, { contentUrl: e.target.value })}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                placeholder="https://..."
                                              />
                                            </div>
                                          )}
                                        </div>

                                        <div className="mt-3">
                                          <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Lesson Content
                                          </label>
                                          <textarea
                                            value={lesson.content}
                                            onChange={(e) => updateLesson(moduleIndex, lessonIndex, { content: e.target.value })}
                                            rows={4}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                            placeholder="Lesson content, instructions, or description..."
                                          />
                                        </div>
                                        <div className="mt-3 flex items-center justify-between">
                                          <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Lesson Content
                                          </label>
                                          <button
                                            onClick={() => generateLessonContent(moduleIndex, lessonIndex)}
                                            className="flex items-center space-x-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                                            disabled={!lesson.title}
                                          >
                                            <Wand2 className="h-3 w-3" />
                                            <span>Generate with AI</span>
                                          </button>
                                          <textarea
                                            value={lesson.content}
                                            onChange={(e) => updateLesson(moduleIndex, lessonIndex, { content: e.target.value })}
                                            rows={4}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                            placeholder="Lesson content, instructions, or description..."
                                          />
                                        </div>
                                      </div>
                                    ))}

                                    {(!module.lessons || module.lessons.length === 0) && (
                                      <div className="text-center py-8 text-gray-500">
                                        <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                        <p>No lessons yet. Add your first lesson to get started.</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              {courseData.modules.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No modules yet</h3>
                  <p className="text-gray-600 mb-6">Start building your course by adding your first module.</p>
                  <button
                    onClick={addModule}
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add First Module</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Settings</h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      value={courseData.estimatedHours}
                      onChange={(e) => setCourseData(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Total estimated completion time</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      value={courseData.price}
                      onChange={(e) => setCourseData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Set to 0 for free courses</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Thumbnail URL
                  </label>
                  <input
                    type="url"
                    value={courseData.thumbnailUrl}
                    onChange={(e) => setCourseData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                  {courseData.thumbnailUrl && (
                    <div className="mt-3">
                      <img
                        src={courseData.thumbnailUrl}
                        alt="Course thumbnail preview"
                        className="w-32 h-20 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={courseData.isPremium}
                    onChange={(e) => setCourseData(prev => ({ ...prev, isPremium: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label className="ml-3 text-sm font-medium text-gray-700">
                    Premium Course
                  </label>
                  <p className="ml-2 text-xs text-gray-500">
                    Requires premium subscription to access
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Preview</h3>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  {courseData.title || 'Course Title'}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {courseData.shortDescription || 'Course description will appear here...'}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{courseData.level || 'Level'}</span>
                  <span>{courseData.estimatedHours}h</span>
                  <span>{courseData.modules.length} modules</span>
                </div>
              </div>

              <div className="text-sm">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{courseData.category || 'Not set'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium">
                    {courseData.price > 0 ? `₹${courseData.price}` : 'Free'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">
                    {courseData.isPremium ? 'Premium' : 'Standard'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Status</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Basic Info</span>
                <span className={`text-xs px-2 py-1 rounded-full ${courseData.title && courseData.description && courseData.category
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {courseData.title && courseData.description && courseData.category ? 'Complete' : 'Incomplete'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Modules</span>
                <span className={`text-xs px-2 py-1 rounded-full ${courseData.modules.length > 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
                  }`}>
                  {courseData.modules.length} added
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Lessons</span>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                  {courseData.modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0)} total
                </span>
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
                      <h2 className="text-xl font-semibold text-gray-900">Generate Course with AI</h2>
                      <p className="text-gray-600 text-sm">Let AI create a comprehensive course structure for you</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Course Topic *</label>
                      <input
                        type="text"
                        value={aiPrompt.topic}
                        onChange={(e) => setAiPrompt(prev => ({ ...prev, topic: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., React Development, Node.js Backend"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                      <select
                        value={aiPrompt.category}
                        onChange={(e) => setAiPrompt(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select Category</option>
                        <option value="FRONTEND_DEVELOPMENT">Frontend Development</option>
                        <option value="BACKEND_DEVELOPMENT">Backend Development</option>
                        <option value="FULLSTACK_DEVELOPMENT">Full Stack Development</option>
                        <option value="DATA_SCIENCE">Data Science</option>
                        <option value="DEVOPS">DevOps</option>
                        <option value="MOBILE_DEVELOPMENT">Mobile Development</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                      <select
                        value={aiPrompt.level}
                        onChange={(e) => setAiPrompt(prev => ({ ...prev, level: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours)</label>
                      <input
                        type="number"
                        value={aiPrompt.duration}
                        onChange={(e) => setAiPrompt(prev => ({ ...prev, duration: parseInt(e.target.value) || 8 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        min="1"
                        max="100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                    <input
                      type="text"
                      value={aiPrompt.targetAudience}
                      onChange={(e) => setAiPrompt(prev => ({ ...prev, targetAudience: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Junior developers, Career switchers"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specific Requirements</label>
                    <textarea
                      value={aiPrompt.specificRequirements}
                      onChange={(e) => setAiPrompt(prev => ({ ...prev, specificRequirements: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Any specific topics, tools, or technologies to include..."
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
                    disabled={aiGenerating || !aiPrompt.topic || !aiPrompt.category}
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
                        <span>Generate Course</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
