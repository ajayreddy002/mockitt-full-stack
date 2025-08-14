// frontend/src/pages/courses/CourseDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  CheckCircle, 
  Lock,
  BookOpen,
  Award,
  ArrowLeft
} from 'lucide-react';
import { mockittAPI } from '../../services/api';

interface CourseDetailData {
  id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  thumbnailUrl?: string;
  isPremium: boolean;
  estimatedHours: number;
  modules: Module[];
  userProgress?: {
    progressPercent: number;
    completedLessons: number;
    totalLessons: number;
    enrolledAt: Date;
    certificateUrl?: string;
  };
  reviews: Review[];
}

interface Module {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  lessons: Lesson[];
  quizzes: Quiz[];
}

interface Lesson {
  id: string;
  title: string;
  duration: number;
  contentType: string;
  orderIndex: number;
}

interface Quiz {
  id: string;
  title: string;
  duration: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  user: {
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
}

export const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<CourseDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  // ✅ Fetch course details using your established API pattern
  useEffect(() => {
    const fetchCourseDetail = async () => {
      if (!courseId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const courseData = await mockittAPI.courses.getById(courseId);
        setCourse(courseData);
      } catch (err) {
        setError('Failed to load course details');
        console.error('Course detail fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId]);

  const handleEnroll = async () => {
    if (!courseId) return;
    
    setEnrolling(true);
    try {
      await mockittAPI.courses.enroll(courseId);
      
      // Refresh course data to show enrollment status
      const updatedCourse = await mockittAPI.courses.getById(courseId);
      setCourse(updatedCourse);
      
      // Navigate to learning interface
      navigate(`/courses/${courseId}/learn`);
    } catch (error) {
      setError('Failed to enroll in course');
      console.error('Enrollment error:', error);
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartLearning = () => {
    navigate(`/courses/${courseId}/learn`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/3"></div>
        <div className="h-64 bg-gray-300 rounded"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error || !course) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {error || 'Course not found'}
        </h3>
        <button
          onClick={() => navigate('/courses')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  const isEnrolled = course.userProgress !== null;
  const totalLessons = course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
  const averageRating = course.reviews.length > 0 
    ? course.reviews.reduce((sum, review) => sum + review.rating, 0) / course.reviews.length 
    : 0;

  return (
    <div className="space-y-8">
      {/* Back Navigation */}
      <button
        onClick={() => navigate('/courses')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Courses</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Course Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <img
              src={course.thumbnailUrl || '/default-course-thumbnail.jpg'}
              alt={course.title}
              className="w-full h-64 object-cover"
            />
            <div className="p-8">
              <div className="flex items-center space-x-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {course?.category?.replace('_', ' ')}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  course.level === 'BEGINNER' ? 'bg-green-100 text-green-800' :
                  course.level === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {course.level}
                </span>
                {course.isPremium && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-bold rounded-full">
                    PREMIUM
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
              <p className="text-lg text-gray-600 mb-6">{course.description}</p>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{totalLessons} lessons</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.estimatedHours} hours</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{course.reviews.length} students</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span>{averageRating > 0 ? averageRating.toFixed(1) : 'New'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Course Modules */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
            
            <div className="space-y-4">
              {course.modules.map((module, moduleIndex) => (
                <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Module {moduleIndex + 1}: {module.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {module.lessons.length} lessons • {module.quizzes.length} quizzes
                    </p>
                    {module.description && (
                      <p className="text-sm text-gray-600 mt-2">{module.description}</p>
                    )}
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {/* Lessons */}
                    {module.lessons.map((lesson) => {
                      const isCompleted = isEnrolled && (course?.userProgress?.completedLessons ?? 0) >= lesson.orderIndex;
                      
                      return (
                        <div key={lesson.id} className="px-6 py-4 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : isEnrolled ? (
                                <Play className="h-5 w-5 text-gray-400" />
                              ) : (
                                <Lock className="h-5 w-5 text-gray-300" />
                              )}
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">
                                {lesson.title}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {lesson.contentType} • {lesson.duration} min
                              </p>
                            </div>
                          </div>
                          
                          {isEnrolled && (
                            <button 
                              onClick={() => navigate(`/courses/${courseId}/learn?lesson=${lesson.id}`)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              {isCompleted ? 'Review' : 'Start'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Quizzes */}
                    {module.quizzes.map((quiz) => (
                      <div key={quiz.id} className="px-6 py-4 flex items-center justify-between bg-blue-50">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">Q</span>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              {quiz.title}
                            </h4>
                            <p className="text-xs text-gray-500">
                              Quiz • {quiz.duration} min
                            </p>
                          </div>
                        </div>
                        
                        {isEnrolled && (
                          <button 
                            onClick={() => navigate(`/courses/${courseId}/quiz/${quiz.id}`)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Take Quiz
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Section */}
          {course.reviews.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Student Reviews</h3>
              <div className="space-y-4">
                {course.reviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        {review.user.profilePicture ? (
                          <img 
                            src={review.user.profilePicture} 
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-medium">
                            {review.user.firstName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">
                            {review.user.firstName} {review.user.lastName}
                          </span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-gray-600 text-sm">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Enrollment Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {isEnrolled ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Enrolled</span>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{Math.round(course.userProgress?.progressPercent || 0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.userProgress?.progressPercent || 0}%` }}
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleStartLearning}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Continue Learning
                </button>
                
                {course.userProgress?.certificateUrl && (
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                    <Award className="h-4 w-4" />
                    <span>Download Certificate</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <span className="text-3xl font-bold text-green-600">Free</span>
                </div>
                
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
                
                {course.isPremium && (
                  <p className="text-xs text-center text-gray-500">
                    Premium subscription required
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Course Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Course Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Level</span>
                <span className="font-medium">{course.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration</span>
                <span className="font-medium">{course.estimatedHours} hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lessons</span>
                <span className="font-medium">{totalLessons}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quizzes</span>
                <span className="font-medium">
                  {course.modules.reduce((sum, module) => sum + module.quizzes.length, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Certificate</span>
                <span className="font-medium text-green-600">Yes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
