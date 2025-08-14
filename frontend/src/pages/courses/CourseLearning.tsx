/* eslint-disable @typescript-eslint/no-explicit-any */
// frontend/src/pages/courses/CourseLearning.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Play,
  BookOpen,
  Clock,
  ArrowLeft,
  List
} from 'lucide-react';
import { useCourses } from '../../store';

interface Module {
  id: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  contentType: 'TEXT' | 'VIDEO' | 'AUDIO' | 'PDF' | 'INTERACTIVE';
  contentUrl?: string;
  duration: number;
  orderIndex: number;
}

export const CourseLearning: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { 
    currentCourse,
    userEnrollments,
    coursesLoading,
    fetchCourseById,
    fetchUserEnrollments,
    // updateLessonProgress 
  } = useCourses();

  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [lessonCompleted, setLessonCompleted] = useState(false);

  const lessonId = searchParams.get('lesson');

  useEffect(() => {
    if (courseId) {
      fetchCourseById(courseId);
      fetchUserEnrollments();
    }
  }, [courseId, fetchCourseById, fetchUserEnrollments]);

  useEffect(() => {
    if (currentCourse && lessonId) {
      const lesson = findLessonById(currentCourse.modules || [], lessonId);
      setCurrentLesson(lesson);
      
      // Check if lesson is completed
      const enrollment = userEnrollments.find((e: any) => e.courseId === courseId);
      setLessonCompleted(!!enrollment?.lessonProgress?.some((p: any) => 
        p.lessonId === lessonId && p.isCompleted
      ));
    } else if (currentCourse?.modules && currentCourse.modules.length > 0) {
      // Set first lesson as default
      const firstModule = currentCourse.modules[0];
      if (firstModule.lessons && firstModule.lessons.length > 0) {
        const firstLesson = firstModule.lessons[0];
        setSearchParams({ lesson: firstLesson.id });
      }
    }
  }, [currentCourse, lessonId, userEnrollments, courseId, setSearchParams]);

  const findLessonById = (modules: Module[], id: string): Lesson | null => {
    for (const module of modules) {
      const lesson = module.lessons?.find(l => l.id === id);
      if (lesson) return lesson;
    }
    return null;
  };

  const getAllLessons = (): Lesson[] => {
    if (!currentCourse?.modules) return [];
    return currentCourse.modules
      .sort((a: { orderIndex: number; }, b: { orderIndex: number; }) => a.orderIndex - b.orderIndex)
      .flatMap((module: any) => 
        (module.lessons || []).sort((a: { orderIndex: number; }, b: { orderIndex: number; }) => a.orderIndex - b.orderIndex)
      );
  };

  const getCurrentLessonIndex = (): number => {
    if (!currentLesson) return -1;
    const allLessons = getAllLessons();
    return allLessons.findIndex(lesson => lesson.id === currentLesson.id);
  };

  const navigateToLesson = (direction: 'prev' | 'next') => {
    const allLessons = getAllLessons();
    const currentIndex = getCurrentLessonIndex();
    
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (newIndex >= 0 && newIndex < allLessons.length) {
      const newLesson = allLessons[newIndex];
      setSearchParams({ lesson: newLesson.id });
    }
  };

  const markLessonComplete = async () => {
    if (!currentLesson || !courseId) return;

    try {
      // await updateLessonProgress(currentLesson.id, currentLesson.duration * 60);
      
      setLessonCompleted(true);
      
      // Auto-navigate to next lesson after 1 second
      setTimeout(() => {
        navigateToLesson('next');
      }, 1000);
    } catch (error) {
      console.error('Failed to mark lesson complete:', error);
    }
  };

  if (coursesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Course not found</h3>
          <button
            onClick={() => navigate(`/courses`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const allLessons = getAllLessons();
  const currentIndex = getCurrentLessonIndex();
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < allLessons.length - 1;
  const enrollment = userEnrollments.find((e: any) => e.courseId === courseId);
  const progressPercent = enrollment?.progressPercent || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/courses/${courseId}`)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Course</span>
              </button>
              <div className="text-sm text-gray-500 truncate">
                {currentCourse.title}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                <List className="h-5 w-5" />
              </button>
              <div className="text-sm text-gray-600">
                Lesson {currentIndex + 1} of {allLessons.length}
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`grid gap-8 ${showSidebar ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1'}`}>
          
          {/* Sidebar - Course Navigation */}
          {showSidebar && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Course Content</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {currentCourse.modules?.map((module: any) => (
                    <div key={module.id}>
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                        <h4 className="text-sm font-medium text-gray-900">{module.title}</h4>
                      </div>
                      {module.lessons
                        ?.sort((a: { orderIndex: number; }, b: { orderIndex: number; }) => a.orderIndex - b.orderIndex)
                        .map((lesson: any) => {
                          const isCompleted = enrollment?.lessonProgress?.some((p: any) => 
                            p.lessonId === lesson.id && p.isCompleted
                          );
                          const isCurrent = currentLesson?.id === lesson.id;
                          
                          return (
                            <button
                              key={lesson.id}
                              onClick={() => setSearchParams({ lesson: lesson.id })}
                              className={`w-full px-4 py-3 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                isCurrent ? 'bg-blue-50 border-blue-200' : ''
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  {isCompleted ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : isCurrent ? (
                                    <Play className="h-4 w-4 text-blue-600" />
                                  ) : (
                                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium truncate ${
                                    isCurrent ? 'text-blue-900' : 'text-gray-900'
                                  }`}>
                                    {lesson.title}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Clock className="h-3 w-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">{lesson.duration} min</span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  )) || (
                    <div className="p-4 text-center text-gray-500">
                      No lessons available
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className={showSidebar ? 'lg:col-span-3' : 'col-span-1'}>
            {currentLesson ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Lesson Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{currentLesson.title}</h1>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{currentLesson.contentType}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{currentLesson.duration} minutes</span>
                        </div>
                      </div>
                    </div>
                    
                    {!lessonCompleted && (
                      <button
                        onClick={markLessonComplete}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Mark Complete
                      </button>
                    )}
                    
                    {lessonCompleted && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Completed</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lesson Content */}
                <div className="p-6">
                  {currentLesson.contentType === 'VIDEO' && currentLesson.contentUrl ? (
                    <div className="aspect-video mb-6">
                      <video
                        controls
                        className="w-full h-full rounded-lg"
                        src={currentLesson.contentUrl}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ) : currentLesson.contentType === 'PDF' && currentLesson.contentUrl ? (
                    <div className="mb-6">
                      <iframe
                        src={currentLesson.contentUrl}
                        className="w-full h-96 border border-gray-300 rounded-lg"
                        title={currentLesson.title}
                      />
                    </div>
                  ) : null}
                  
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                  />
                </div>

                {/* Navigation */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => navigateToLesson('prev')}
                      disabled={!canGoPrev}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </button>
                    
                    <span className="text-sm text-gray-600">
                      {currentIndex + 1} / {allLessons.length}
                    </span>
                    
                    <button
                      onClick={() => navigateToLesson('next')}
                      disabled={!canGoNext}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No lesson selected</h3>
                <p className="text-gray-600">Select a lesson from the sidebar to start learning.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
