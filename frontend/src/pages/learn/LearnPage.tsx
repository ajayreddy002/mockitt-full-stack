/* eslint-disable @typescript-eslint/no-explicit-any */
// frontend/src/pages/learn/LearnPage.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  // ChevronLeft,
  BookOpen,
  Clock,
  CheckCircle,
  Lock,
  Play,
  Pause,
  Save,
  StickyNote,
  UserCheck,
  ArrowLeft,
  TrendingUp
} from 'lucide-react';
import { useCourses, useAuth, useLesson, useUI } from '../../store';
import { CourseHeader } from '../../components/courses/CourseHeader';

export const LearnPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useUI(); // ✅ Use addNotification
  const { enrollInCourse, isEnrolledInCourse } = useCourses();
  const {
    currentLesson,
    lessonNavigation,
    lessonLoading,
    lessonError,
    fetchLessonById,
    fetchLessonNavigation,
    updateLessonProgress,
    markLessonComplete,
    updateLessonNotes,
    trackTimeSpent,
    clearLessonError
  } = useLesson();

  const lessonId = searchParams.get('lesson');
  const [notes, setNotes] = useState('');
  const [progress, setProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const startTimeRef = useRef<number>(0);
  const [autoProgress, setAutoProgress] = useState(0);
  const scrollProgress = 20

  useEffect(() => {
    if (!lessonId) {
      navigate('/courses');
      return;
    }

    fetchLessonById(lessonId);
    fetchLessonNavigation(lessonId);
  }, [lessonId, fetchLessonById, fetchLessonNavigation, navigate]);

  useEffect(() => {
    if (currentLesson) {
      setNotes(currentLesson.notes || '');
      setProgress(currentLesson.progress?.progressPercentage || 0);
      setTimeSpent(currentLesson.progress?.timeSpent || 0);
    }
  }, [currentLesson]);

  // Time tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying) {
      startTimeRef.current = Date.now();
      interval = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = Math.floor((currentTime - startTimeRef.current) / 1000);
        setTimeSpent(prev => prev + 1);

        // Track time every 30 seconds
        if (elapsed % 30 === 0 && lessonId) {
          trackTimeSpent(lessonId, 30);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, lessonId, trackTimeSpent]);

  // ✅ Check enrollment status
  const isEnrolled = currentLesson ? isEnrolledInCourse(currentLesson.course.id) : false;

  // ✅ Handle enrollment for lesson access
  const handleEnrollment = async () => {
    if (!user) {
      navigate('/login', { state: { redirectTo: `/learn?lesson=${lessonId}` } });
      return;
    }

    if (!currentLesson) return;

    setEnrollmentLoading(true);
    try {
      await enrollInCourse(currentLesson.course.id);
      addNotification({
        type: 'success',
        title: 'Enrolled Successfully',
        message: 'You can now access this lesson!'
      });
      // Refresh lesson data
      if (lessonId) {
        fetchLessonById(lessonId);
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Enrollment Failed',
        message: error.message || 'Failed to enroll in course. Please try again.'
      });
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleProgressUpdate = async (newProgress: number) => {
    if (!lessonId || !isEnrolled) return;

    try {
      setProgress(newProgress);
      await updateLessonProgress(lessonId, {
        progressPercentage: newProgress,
        timeSpent: 1
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update lesson progress'
      });
      setProgress(currentLesson?.progress?.progressPercentage || 0);
    }
  };

  const handleMarkComplete = async () => {
    if (!lessonId || !isEnrolled) return;

    try {
      // ✅ Only allow completion if user has made reasonable progress
      const minimumTimeRequired = currentLesson ? currentLesson?.duration * 0.7 : 0; // 70% of lesson duration
      const minimumProgress = 80; // 80% progress required

      if (timeSpent < minimumTimeRequired * 60) { // Convert to seconds
        addNotification({
          type: 'error',
          title: 'Complete the Lesson',
          message: `Please spend at least ${Math.ceil(minimumTimeRequired)} minutes on this lesson before marking as complete.`
        });
        return;
      }

      if (progress < minimumProgress) {
        addNotification({
          type: 'error',
          title: 'Review the Content',
          message: `Please review at least ${minimumProgress}% of the lesson content before marking as complete.`
        });
        return;
      }

      await markLessonComplete(lessonId);

      // ✅ Reset timer when lesson is completed
      setTimeSpent(0);
      setIsPlaying(false);

      addNotification({
        type: 'success',
        title: 'Lesson Complete',
        message: 'Great job! You completed this lesson.'
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to mark lesson as complete'
      });
    }
  };

  const handleSaveNotes = async () => {
    if (!lessonId || !isEnrolled) return;

    try {
      await updateLessonNotes(lessonId, notes);
      addNotification({
        type: 'success',
        title: 'Notes Saved',
        message: 'Your notes have been saved successfully'
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save notes'
      });
    }
  };

  const handleNavigation = (direction: 'previous' | 'next') => {
    const targetLesson = lessonNavigation?.[direction];
    if (targetLesson) {
      navigate(`/learn?lesson=${targetLesson.id}`);
    }
  };

  useEffect(() => {
    // ✅ Auto-calculate progress based on time spent and content interaction
    const calculateAutoProgress = () => {
      const timeProgress = Math.min((timeSpent / (currentLesson ? currentLesson.duration * 60 : 0)) * 70, 70);
      const interactionProgress = Math.min(scrollProgress * 30, 30); // Based on scroll
      return Math.min(timeProgress + interactionProgress, 100);
    };

    setAutoProgress(calculateAutoProgress());
  }, [timeSpent, scrollProgress, currentLesson]);

  if (lessonLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (lessonError || !currentLesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Lesson Not Found</h2>
          <p className="text-gray-600 mb-6">{lessonError || 'The lesson you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => {
              clearLessonError();
              navigate('/courses');
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  // ✅ Show enrollment prompt if user is not enrolled
  if (!isEnrolled) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* ✅ Use CourseHeader for consistency */}
        <CourseHeader
          course={currentLesson.course}
          isEnrolled={false}
          backUrl={`/courses/${currentLesson.course.id}`}
        >
          <button
            onClick={handleEnrollment}
            disabled={enrollmentLoading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-2 font-semibold mb-4"
          >
            <UserCheck className="h-5 w-5" />
            <span>{enrollmentLoading ? 'Enrolling...' : 'Enroll to Access Lesson'}</span>
          </button>
        </CourseHeader>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Lock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Lesson Access Required</h3>
            <p className="text-gray-600 mb-6">
              Please enroll in this course to access the lesson content.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 shadow-lg sticky top-0 z-20 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate(`/courses/${currentLesson.course.id}`)}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors group"
              >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Course</span>
              </button>

              <div className="h-8 w-px bg-gray-300"></div>

              <div>
                <h1 className="text-xl font-bold text-gray-900">{currentLesson.title}</h1>
                <p className="text-sm text-gray-600">{currentLesson.course.title}</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* Enhanced Timer */}
              <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-xl">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="font-mono text-sm font-semibold text-gray-700">
                  {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
                </span>
              </div>

              {/* Enhanced Progress */}
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${autoProgress}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-700 min-w-[3rem]">
                  {Math.round(autoProgress)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Enhanced Lesson Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className={`p-4 rounded-2xl transition-all duration-300 ${isPlaying
                        ? 'bg-red-500 hover:bg-red-600 shadow-lg hover:shadow-xl hover:scale-105'
                        : 'bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl hover:scale-105'
                        }`}
                    >
                      {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold">{currentLesson.title}</h2>
                      <p className="text-blue-100">Module: {currentLesson.module.title}</p>
                    </div>
                  </div>

                  {!currentLesson.progress?.isCompleted && autoProgress >= 80 && timeSpent >= (currentLesson.duration * 0.7 * 60) && (
                    <div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={(e) => handleProgressUpdate(parseInt(e.target.value))}
                        className="w-32"
                      />
                      <button
                        onClick={handleMarkComplete}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center space-x-2"
                      >
                        <CheckCircle className="h-5 w-5" />
                        <span>Mark Complete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Lesson Content */}
              <div className="p-8">
                <div className="prose prose-lg max-w-none">
                  <div
                    dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                    className="leading-relaxed"
                  />
                </div>
              </div>

              {/* Enhanced Navigation */}
              <div className="border-t border-gray-200 p-8 bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleNavigation('previous')}
                    disabled={!lessonNavigation?.previous}
                    className="flex items-center space-x-3 px-8 py-4 text-gray-600 border-2 border-gray-300 rounded-2xl hover:bg-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group"
                  >
                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-semibold">Previous Lesson</span>
                  </button>

                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-2">Progress</div>
                    <div className="text-lg font-bold text-gray-900">
                      Lesson {lessonNavigation?.currentPosition} of {lessonNavigation?.totalLessons}
                    </div>
                  </div>

                  <button
                    onClick={() => handleNavigation('next')}
                    disabled={!lessonNavigation?.next}
                    className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl group"
                  >
                    <span className="font-semibold">Next Lesson</span>
                    <ArrowLeft className="h-5 w-5 rotate-180 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-8">
            {/* Enhanced Progress Card */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Course Progress
              </h3>

              <div className="space-y-6">
                {currentLesson.course.modules?.map((module: any) => (
                  <div key={module.id} className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center justify-between">
                      <span>{module.title}</span>
                      <span className="text-xs text-gray-500">
                        {module.lessons?.filter((l: any) => l.progress?.isCompleted).length || 0}/{module.lessons?.length || 0}
                      </span>
                    </h4>
                    {module.lessons?.map((lesson: any) => (
                      <div
                        key={lesson.id}
                        className={`flex items-center space-x-3 p-3 rounded-2xl cursor-pointer transition-all duration-300 ${lesson.id === lessonId
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-lg'
                          : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        onClick={() => navigate(`/learn?lesson=${lesson.id}`)}
                      >
                        {lesson.progress?.isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <div className={`h-5 w-5 rounded-full border-2 flex-shrink-0 ${lesson.id === lessonId ? 'border-blue-500' : 'border-gray-300'
                            }`} />
                        )}
                        <span className="text-sm flex-1 font-medium">{lesson.title}</span>
                        <span className="text-xs text-gray-400">{lesson.duration}min</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Notes Card */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <StickyNote className="h-5 w-5 mr-2 text-purple-600" />
                  My Notes
                </h3>
                <button
                  onClick={handleSaveNotes}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Take notes while learning... 📝"
                className="w-full h-48 p-4 border-2 border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
