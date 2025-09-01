/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Users, 
  Star, 
  BookOpen, 
  Play, 
  CheckCircle, 
  Lock,
  Crown,
  Target,
  Award,
  AlertCircle
} from 'lucide-react';
import { useAuth, useCourses } from '../../store';
import { mockittAPI } from '../../services/api';
import { QuizCard } from '../../components/courses/QuizCard';

interface ModuleQuiz {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  passingScore: number;
  maxAttempts: number;
  difficulty: string;
  type: string;
  isEnrolled: boolean;
  userAttempts: number;
  attemptsRemaining: number;
  canAttempt: boolean;
  attempts: any[];
}

export const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  // Store hooks
  const { user } = useAuth();
  const { 
    currentCourse, 
    coursesLoading, 
    coursesError,
    fetchCourseById, 
    enrollInCourse,
    isEnrolledInCourse 
  } = useCourses();

  // ✅ FIXED: Use store data directly instead of local state
  const course = currentCourse;

  // Local state - ONLY for what's not in store
  const [moduleQuizzes, setModuleQuizzes] = useState<Record<string, ModuleQuiz[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  // ✅ Check enrollment without causing re-renders
  const isEnrolled = useMemo(() => {
    return courseId ? isEnrolledInCourse(courseId) : false;
  }, [courseId, isEnrolledInCourse]);

  // ✅ FIXED: Memoize the quiz loading function to prevent re-creation
  const loadModuleQuizzes = useCallback(async (modules: any[]) => {
    try {
      const quizPromises = modules.map(async (module: any) => {
        try {
          const quizzes = await mockittAPI.quizzes.getModuleQuizzes(module.id);
          return { moduleId: module.id, quizzes };
        } catch (error) {
          console.error(`Failed to load quizzes for module ${module.id}:`, error);
          return { moduleId: module.id, quizzes: [] };
        }
      });

      const quizResults = await Promise.all(quizPromises);
      const quizMap = quizResults.reduce((acc, { moduleId, quizzes }) => {
        acc[moduleId] = quizzes;
        return acc;
      }, {} as Record<string, ModuleQuiz[]>);

      setModuleQuizzes(quizMap);
    } catch (err) {
      console.error('Failed to load module quizzes:', err);
    }
  }, []);

  // ✅ FIXED: Primary useEffect - only depends on courseId
  useEffect(() => {
    if (!courseId) return;

    const loadCourseData = async () => {
      try {
        setError(null);
        await fetchCourseById(courseId);
      } catch (err: any) {
        console.error('Failed to load course:', err);
        setError(err.response?.data?.message || 'Failed to load course details');
      }
    };

    loadCourseData();
  }, [courseId, fetchCourseById]); // ✅ Only courseId and fetchCourseById

  // ✅ FIXED: Separate effect for loading quizzes when course changes
  useEffect(() => {
    if (course?.modules && course.modules.length > 0) {
      loadModuleQuizzes(course.modules);
    } else {
      setModuleQuizzes({}); // Clear quizzes if no modules
    }
  }, [course?.modules, loadModuleQuizzes]); // ✅ Only course.modules

  // ✅ FIXED: Memoize enrollment handler to prevent re-creation
  const handleEnrollment = useCallback(async () => {
    if (!courseId || !course) return;

    // Premium course validation
    if (course.isPremium && !user?.isPremium) {
      alert('This is a premium course. Please upgrade to premium to enroll.');
      return;
    }

    try {
      setEnrolling(true);
      await enrollInCourse(courseId);
      
      // Simple refresh after enrollment
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Enrollment failed:', error);
      alert(error.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  }, [courseId, course, user?.isPremium, enrollInCourse]);

  // ✅ FIXED: Memoize navigation handlers
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleQuizClick = useCallback((quizId: string) => {
    if (!isEnrolled) {
      alert('Please enroll in the course to take quizzes.');
      return;
    }
    navigate(`/courses/${courseId}/quiz/${quizId}`);
  }, [isEnrolled, navigate, courseId]);

  const handleLessonClick = useCallback((lessonId: string) => {
    if (!isEnrolled) {
      alert('Please enroll in the course to access lessons.');
      return;
    }
    navigate(`/learn/lesson/${lessonId}`);
  }, [isEnrolled, navigate]);

  const handleBack = useCallback(() => {
    navigate('/courses');
  }, [navigate]);

  // ✅ Loading state
  if (coursesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ✅ Error state
  if (error || coursesError || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error || coursesError || 'The course you are looking for could not be found.'}
          </p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse All Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="md:col-span-2">
              <div className="flex items-start space-x-4 mb-6">
                {course.thumbnailUrl && (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                    {/* Premium Badge */}
                    {course.isPremium && (
                      <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full text-sm font-medium">
                        <Crown className="h-4 w-4" />
                        <span>Premium</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xl text-gray-600 mb-4">{course.shortDescription || course.description}</p>
                  
                  {/* Course Stats */}
                  <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.estimatedHours}+ hours</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{course.enrollmentCount || 0} students</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span>{(course.averageRating || 0).toFixed(1)} rating</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.level}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="bg-gray-50 rounded-lg p-6">
              {/* Price Display */}
              <div className="mb-6">
                {course.isPremium ? (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {course.price ? `$${course.price}` : 'Premium'}
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-yellow-600">
                      <Crown className="h-5 w-5" />
                      <span className="font-medium">Premium Course</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">Free</div>
                    <div className="text-gray-600">Full access included</div>
                  </div>
                )}
              </div>

              {/* Enrollment Button */}
              {isEnrolled ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-100 text-green-800 rounded-lg">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Enrolled</span>
                  </div>
                  <button
                    onClick={() => navigate(`/courses/${courseId}/learn`)}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Continue Learning
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEnrollment}
                  disabled={enrolling}
                  className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                    course.isPremium && !user?.isPremium
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } ${enrolling ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {enrolling ? (
                    <span>Enrolling...</span>
                  ) : course.isPremium && !user?.isPremium ? (
                    <span className="flex items-center justify-center space-x-2">
                      <Lock className="h-4 w-4" />
                      <span>Upgrade to Access</span>
                    </span>
                  ) : (
                    <span>Enroll Now</span>
                  )}
                </button>
              )}

              {/* Premium Requirement Notice */}
              {course.isPremium && !user?.isPremium && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Crown className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Premium Required</p>
                      <p>This course requires a premium subscription to access.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Course</h2>
              <div className="prose max-w-none text-gray-600">
                {course.description}
              </div>
            </div>

            {/* Course Modules */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
              
              {course.modules && course.modules.length > 0 ? (
                <div className="space-y-4">
                  {course.modules.map((module: any, index: number) => (
                    <div key={module.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Module {index + 1}: {module.title}
                        </h3>
                        <div className="text-sm text-gray-500">
                          {module.lessons?.length || 0} lessons • {(moduleQuizzes[module.id] || []).length} quizzes
                        </div>
                      </div>

                      {module.description && (
                        <p className="text-gray-600 mb-4">{module.description}</p>
                      )}

                      {/* Lessons */}
                      {module.lessons && module.lessons.length > 0 && (
                        <div className="space-y-2 mb-4">
                          <h4 className="font-medium text-gray-900">Lessons:</h4>
                          {module.lessons.map((lesson: any) => (
                            <div key={lesson.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                              <div className="flex items-center space-x-3">
                                <Play className="h-4 w-4 text-blue-600" />
                                <span className="text-gray-900">{lesson.title}</span>
                                {!isEnrolled && course.isPremium && (
                                  <Lock className="h-4 w-4 text-yellow-600" />
                                )}
                              </div>
                              <button
                                onClick={() => handleLessonClick(lesson.id)}
                                disabled={!isEnrolled}
                                className={`text-sm px-3 py-1 rounded ${
                                  isEnrolled
                                    ? 'text-blue-600 hover:bg-blue-50'
                                    : 'text-gray-400 cursor-not-allowed'
                                }`}
                              >
                                {isEnrolled ? 'Start' : 'Locked'}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Quizzes */}
                      {moduleQuizzes[module.id] && moduleQuizzes[module.id].length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                            <Target className="h-4 w-4" />
                            <span>Assessments:</span>
                          </h4>
                          <div className="grid gap-4">
                            {moduleQuizzes[module.id].map((quiz) => (
                              <QuizCard
                                key={quiz.id}
                                quiz={{
                                  ...quiz,
                                  isEnrolled: isEnrolled,
                                }}
                                userAttempts={quiz.attempts || []}
                                courseId={courseId}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Course content is being prepared. Check back soon!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Progress (if enrolled) */}
            {isEnrolled && course.userProgress !== undefined && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Completion</span>
                    <span>{Math.round(course.userProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.userProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Course Features */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What You'll Get</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">{course.estimatedHours}+ hours of content</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Interactive quizzes and assignments</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Certificate of completion</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Lifetime access</span>
                </div>
                {course.isPremium && (
                  <div className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <span className="text-gray-700">Premium support</span>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews */}
            {course.reviews && course.reviews.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h3>
                <div className="space-y-4">
                  {course.reviews.slice(0, 3).map((review: any, index: number) => (
                    <div key={index} className="border-b pb-3 last:border-b-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {review.user?.firstName} {review.user?.lastName}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
