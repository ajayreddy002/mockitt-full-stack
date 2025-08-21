/* eslint-disable @typescript-eslint/no-explicit-any */
// frontend/src/pages/courses/CourseDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  UserCheck,
  BookOpen,
  CheckCircle,
  Lock,
  Clock,
  ArrowLeft,
  Award,
  Calendar,
  Crown,
  Download,
  Star,
  Target,
  TrendingUp,
  Users
} from 'lucide-react';
import { useCourses, useAuth, useUI, useQuiz } from '../../store';
// import { CourseHeader } from '../../components/courses/CourseHeader';
import { getCourseDefaultThumbnail } from '../../utils/courseUtils';
import { QuizCard } from '../../components/courses/QuizCard';

export const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useUI(); // ✅ Use addNotification instead of showSuccess
  const {
    currentCourse,
    coursesError,
    fetchCourseById,
    enrollInCourse,
    isEnrolledInCourse,
    fetchUserEnrollments,
    getEnrolledCourseData,
    coursesLoading
  } = useCourses();
  const { fetchUserAttempts } = useQuiz();

  const [localEnrollmentStatus, setLocalEnrollmentStatus] = useState<boolean | null>(null);
  const [enrollmentData, setEnrollmentData] = useState<any>(null);
  const [userAttempts, setUserAttempts] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (courseId) {
      fetchCourseById(courseId);
      if (user) {
        fetchUserEnrollments();
      }
    }
  }, [courseId, user, fetchCourseById, fetchUserEnrollments]);

  useEffect(() => {
    if (currentCourse && user) {
      const enrolled = isEnrolledInCourse(currentCourse.id);
      setLocalEnrollmentStatus(enrolled);

      // ✅ Get rich enrollment data if enrolled
      if (enrolled) {
        const enrolledData = getEnrolledCourseData(currentCourse.id);
        setEnrollmentData(enrolledData);
      }
    }
  }, [currentCourse, user, isEnrolledInCourse, getEnrolledCourseData]);

  useEffect(() => {
    const fetchUserQuizAttempts = async () => {
      if (currentCourse && localEnrollmentStatus) {
        console.log(`Fetching quiz attempts for course ${currentCourse.modules}...`);
        const attemptPromises = currentCourse.modules?.flatMap((module: any) =>
          module.quizzes?.map(async (quiz: any) => {
            try {
              console.log(`Fetching attempts for quiz ${quiz.id}...`);
              const attempts = await fetchUserAttempts(quiz.id);
              return { quizId: quiz.id, attempts };
            } catch (error) {
              console.error(`Failed to fetch attempts for quiz ${quiz.id}:`, error);
              return { quizId: quiz.id, attempts: [] };
            }
          }) || []
        ) || [];

        const results = await Promise.all(attemptPromises);
        const attemptsMap = results.reduce((acc, { quizId, attempts }) => {
          acc[quizId] = attempts;
          return acc;
        }, {} as Record<string, any[]>);

        setUserAttempts(attemptsMap);
      }
    };

    fetchUserQuizAttempts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCourse, localEnrollmentStatus]);

  const handleStartCourse = () => {
    if (!currentCourse) return;

    const isEnrolled = localEnrollmentStatus;

    if (!isEnrolled) {
      handleEnrollment();
      return;
    }

    // ✅ Use enrollment data to find first lesson
    const enrolledCourse = enrollmentData?.course || currentCourse;
    if (enrolledCourse.modules && enrolledCourse.modules[0]?.lessons && enrolledCourse.modules[0].lessons[0]) {
      const firstLesson = enrolledCourse.modules[0].lessons[0];
      navigate(`/learn?lesson=${firstLesson.id}`);
    } else {
      addNotification({
        type: 'error',
        title: 'No Content',
        message: 'This course doesn\'t have any lessons yet.'
      });
    }
  };

  const handleEnrollment = async () => {
    if (!user) {
      navigate('/login', { state: { redirectTo: `/courses/${courseId}` } });
      return;
    }

    if (!currentCourse) return;

    if (currentCourse.isPremium && !user.isPremium) {
      addNotification({
        type: 'error',
        title: 'Premium Required',
        message: 'This course requires a premium subscription.'
      });
      navigate('/pricing');
      return;
    }

    try {
      await enrollInCourse(currentCourse.id);
      setLocalEnrollmentStatus(true);

      // ✅ Refresh enrollment data after successful enrollment
      await fetchUserEnrollments();
      const newEnrollmentData = getEnrolledCourseData(currentCourse.id);
      setEnrollmentData(newEnrollmentData);

      addNotification({
        type: 'success',
        title: 'Enrolled Successfully',
        message: 'You can now access this course!'
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Enrollment Failed',
        message: error.message || 'Failed to enroll in course. Please try again.'
      });
    }
  };

  const handleLessonClick = (lessonId: string) => {
    const isEnrolled = localEnrollmentStatus;

    if (!isEnrolled) {
      handleEnrollment();
      return;
    }

    navigate(`/learn?lesson=${lessonId}`);
  };


  if (coursesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (coursesError || !currentCourse) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/courses')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const isEnrolled = localEnrollmentStatus;
  // ✅ Use enrollment data for enhanced course information
  const courseToDisplay = enrollmentData?.course || currentCourse;
  const userProgress = enrollmentData?.progressPercent || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Hero Section with Parallax Effect */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-yellow-300 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-300 rounded-full animate-ping"></div>
        </div>

        {/* Gradient Mesh Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 via-transparent to-blue-600/30"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            {/* Enhanced Course Info */}
            <div className="lg:col-span-3">
              <button
                onClick={() => navigate('/courses')}
                className="flex items-center space-x-2 text-blue-100 hover:text-white mb-8 transition-all duration-300 group"
              >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Courses</span>
              </button>

              {/* Enhanced Badges */}
              <div className="flex items-center space-x-4 mb-8">
                <span className={`px-6 py-3 rounded-2xl text-sm font-bold shadow-lg ${currentCourse.level === 'BEGINNER'
                  ? 'bg-gradient-to-r from-green-400 to-green-500 text-white'
                  : currentCourse.level === 'INTERMEDIATE'
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                    : 'bg-gradient-to-r from-red-400 to-red-500 text-white'
                  }`}>
                  {currentCourse.level}
                </span>

                {currentCourse.isPremium && (
                  <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center shadow-lg">
                    <Crown className="h-4 w-4 mr-2" />
                    PREMIUM COURSE
                  </span>
                )}

                {isEnrolled && (
                  <span className="bg-gradient-to-r from-emerald-400 to-green-500 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center shadow-lg">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    ENROLLED
                  </span>
                )}
              </div>

              <h1 className="text-6xl font-bold text-white mb-8 leading-tight">
                {currentCourse.title}
              </h1>

              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-white/20">
                <p className="text-xl text-blue-100 leading-relaxed">
                  {currentCourse.description}
                </p>
              </div>

              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {[
                  { icon: Clock, label: "Total Hours", value: `${currentCourse?.estimatedHours || 0}h`, color: "from-blue-500 to-blue-600" },
                  { icon: BookOpen, label: "Lessons", value: courseToDisplay?.totalLessons || 0, color: "from-green-500 to-green-600" },
                  { icon: Users, label: "Students", value: `${currentCourse.enrollmentCount || 0}+`, color: "from-purple-500 to-purple-600" },
                  { icon: Star, label: "Rating", value: currentCourse.stats?.averageRating || 'New', color: "from-yellow-500 to-orange-500" }
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group"
                  >
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${stat.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                    <div className="text-blue-200 text-sm font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Course Instructor & What You'll Learn */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-yellow-300" />
                    What You'll Learn
                  </h3>
                  <ul className="space-y-3 text-blue-100">
                    <li className="flex items-start">
                      <Target className="h-4 w-4 mr-2 mt-1 text-green-300 flex-shrink-0" />
                      Master modern development practices
                    </li>
                    <li className="flex items-start">
                      <Target className="h-4 w-4 mr-2 mt-1 text-green-300 flex-shrink-0" />
                      Build real-world projects
                    </li>
                    <li className="flex items-start">
                      <Target className="h-4 w-4 mr-2 mt-1 text-green-300 flex-shrink-0" />
                      Industry best practices
                    </li>
                    <li className="flex items-start">
                      <Target className="h-4 w-4 mr-2 mt-1 text-green-300 flex-shrink-0" />
                      Career-ready skills
                    </li>
                  </ul>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-300" />
                    Course Highlights
                  </h3>
                  <ul className="space-y-3 text-blue-100">
                    <li className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-blue-300" />
                      Self-paced learning
                    </li>
                    <li className="flex items-center">
                      <Download className="h-4 w-4 mr-2 text-blue-300" />
                      Downloadable resources
                    </li>
                    <li className="flex items-center">
                      <Award className="h-4 w-4 mr-2 text-yellow-300" />
                      Certificate of completion
                    </li>
                    <li className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-purple-300" />
                      Community access
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Enhanced Action Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden sticky top-8">
                {/* Course Preview */}
                <div className="relative">
                  <img
                    src={courseToDisplay.thumbnailUrl || getCourseDefaultThumbnail(courseToDisplay.category)}
                    alt={courseToDisplay.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                  {/* Play Preview Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="bg-white rounded-full p-6 shadow-2xl hover:scale-110 transition-transform duration-300">
                      <Play className="h-8 w-8 text-blue-600" />
                    </button>
                  </div>

                  {/* Price Badge */}
                  <div className="absolute top-6 right-6">
                    <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-3 rounded-2xl font-bold text-xl shadow-lg">
                      {courseToDisplay.isPremium ? `$${courseToDisplay.price || 0}` : 'FREE'}
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  {/* Enhanced Action Buttons */}
                  {isEnrolled ? (
                    <div className="space-y-4 mb-8">
                      <button
                        onClick={handleStartCourse}
                        className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white py-4 px-8 rounded-2xl hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 transition-all duration-300 flex items-center justify-center space-x-3 font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105"
                      >
                        <Play className="h-6 w-6" />
                        <span>{userProgress > 0 ? 'Continue Learning' : 'Start Course'}</span>
                      </button>

                      <div className="text-center">
                        <span className="text-sm text-gray-600">Your progress</span>
                        <div className="mt-2">
                          <div className="flex justify-between text-sm font-semibold text-gray-700 mb-1">
                            <span>Completed</span>
                            <span>{userProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${userProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleEnrollment}
                      disabled={coursesLoading}
                      className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-4 px-8 rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-300 flex items-center justify-center space-x-3 font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 mb-8"
                    >
                      <UserCheck className="h-6 w-6" />
                      {courseToDisplay.isPremium && !user?.isPremium ? (
                        <span>Purchase - ${courseToDisplay.price || 29}</span>
                      ) : (
                        <span>{coursesLoading ? 'Enrolling...' : 'Enroll Now - Free'}</span>
                      )}
                    </button>
                  )}

                  {/* Course Features */}
                  <div className="space-y-4 border-t border-gray-200 pt-8">
                    <h4 className="font-bold text-gray-900 text-lg">This course includes:</h4>
                    <div className="space-y-3">
                      {[
                        { icon: Clock, text: `${courseToDisplay.estimatedHours || 0} hours of content` },
                        { icon: BookOpen, text: `${courseToDisplay?.totalLessons || 0} lessons` },
                        { icon: Download, text: "Downloadable resources" },
                        { icon: Award, text: "Certificate of completion" },
                        { icon: Users, text: "Community access" }
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <feature.icon className="h-5 w-5 text-blue-600" />
                          <span className="text-gray-700">{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Course Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-12">
          {/* Section Header */}
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Course Curriculum</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive modules designed to take you from beginner to professional
            </p>
          </div>

          {/* Enhanced Modules Display */}
          <div className="space-y-8">
            {(enrollmentData?.course?.modules || currentCourse?.modules)?.map((module: any, moduleIndex: number) => (
              <div
                key={module.id}
                className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500"
              >
                {/* Enhanced Module Header */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-8 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-6">
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg">
                        {moduleIndex + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{module.title}</h3>
                        {module.description && (
                          <p className="text-gray-600 leading-relaxed">{module.description}</p>
                        )}

                        {/* Module Stats */}
                        <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-1" />
                            {module.lessons?.length || 0} lessons
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {module.lessons?.reduce((acc: number, lesson: any) => acc + (lesson.duration || 0), 0)} min
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Module Progress */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {Math.round((module.lessons?.filter((l: any) => l.progress?.isCompleted).length || 0) / (module.lessons?.length || 1) * 100)}%
                      </div>
                      <div className="text-sm text-gray-500">Complete</div>
                    </div>
                  </div>
                  {module.quizzes?.map((quiz: any) => (
                    <QuizCard
                      key={quiz.id}
                      quiz={quiz}
                      userAttempts={userAttempts[quiz.id] || []}
                      isEnrolled={isEnrolled as boolean}
                    />
                  ))}
                </div>

                {/* Enhanced Module Lessons */}
                <div className="divide-y divide-gray-100">
                  {module.lessons?.map((lesson: any, lessonIndex: number) => {
                    const isLessonLocked = !isEnrolled;
                    const lessonProgress = enrollmentData?.lessonProgress?.find(
                      (progress: any) => progress.lessonId === lesson.id
                    );
                    const isCompleted = lessonProgress?.isCompleted || false;

                    return (
                      <div
                        key={lesson.id}
                        className={`p-6 transition-all duration-300 ${isLessonLocked
                          ? 'opacity-60'
                          : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer group'
                          }`}
                        onClick={() => !isLessonLocked && handleLessonClick(lesson.id)}
                      >
                        <div className="flex items-center space-x-6">
                          {/* Enhanced Lesson Icon */}
                          <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${isLessonLocked
                            ? 'bg-gray-200'
                            : isCompleted
                              ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white'
                              : 'bg-gradient-to-br from-blue-500 to-purple-500 text-white group-hover:scale-110 transition-transform duration-300'
                            }`}>
                            {isLessonLocked ? (
                              <Lock className="h-6 w-6 text-gray-400" />
                            ) : isCompleted ? (
                              <CheckCircle className="h-6 w-6" />
                            ) : (
                              <Play className="h-6 w-6" />
                            )}
                          </div>

                          {/* Lesson Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className={`text-lg font-semibold ${isLessonLocked ? 'text-gray-500' : 'text-gray-900 group-hover:text-blue-600'
                                }`}>
                                {lessonIndex + 1}. {lesson.title}
                              </h4>

                              <div className="flex items-center space-x-4 text-sm">
                                <div className="flex items-center text-gray-500">
                                  <Clock className="h-4 w-4 mr-1" />
                                  <span>{lesson.duration} min</span>
                                </div>

                                {lesson.isRequired && (
                                  <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                                    Required
                                  </span>
                                )}

                                {lessonProgress && lessonProgress.progressPercentage > 0 && (
                                  <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                                    {lessonProgress.progressPercentage}% complete
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Lesson Description */}
                            {lesson.description && (
                              <p className={`text-sm ${isLessonLocked ? 'text-gray-400' : 'text-gray-600'
                                } mb-2`}>
                                {lesson.description}
                              </p>
                            )}

                            {/* Progress Bar */}
                            {lessonProgress && lessonProgress.progressPercentage > 0 && (
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${lessonProgress.progressPercentage}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* No Content State */}
          {(!courseToDisplay.modules || courseToDisplay.modules.length === 0) && (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Course Content Coming Soon</h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                Our expert instructors are preparing high-quality content for this course. Check back soon!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
