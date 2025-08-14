// frontend/src/components/courses/CourseHeader.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Star, 
  BookOpen, 
  Crown, 
  CheckCircle 
} from 'lucide-react';
import { getCourseDefaultThumbnail } from '../../utils/courseUtils';

interface CourseHeaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  course: any;
  isEnrolled: boolean;
  showBackButton?: boolean;
  backUrl?: string;
  children?: React.ReactNode; // For action buttons
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({ 
  course, 
  isEnrolled, 
  showBackButton = true, 
  backUrl = '/courses',
  children 
}) => {
  const navigate = useNavigate();
  const thumbnailUrl = course.thumbnailUrl || getCourseDefaultThumbnail(course?.category, course?.level);
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Course Info */}
          <div className="lg:col-span-2">
            {showBackButton && (
              <button
                onClick={() => navigate(backUrl)}
                className="flex items-center space-x-2 text-blue-100 hover:text-white mb-4 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Courses</span>
              </button>
            )}

            <div className="flex items-center space-x-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                course.level === 'BEGINNER' 
                  ? 'bg-green-100 text-green-800'
                  : course.level === 'INTERMEDIATE'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {course.level}
              </span>
              {course.isPremium && (
                <span className="flex items-center space-x-1 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                  <Crown className="h-3 w-3" />
                  <span>PREMIUM</span>
                </span>
              )}
              {isEnrolled && (
                <span className="flex items-center space-x-1 bg-green-400 text-green-900 px-3 py-1 rounded-full text-sm font-bold">
                  <CheckCircle className="h-3 w-3" />
                  <span>ENROLLED</span>
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-lg text-blue-100 mb-6 leading-relaxed">
              {course.description}
            </p>

            {/* Course Stats */}
            <div className="flex flex-wrap items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{course.estimatedHours || 0}h total</span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>{course?.totalLessons || 0} lessons</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{course?.enrollmentCount || 0} students</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>{course?.averageRating || 'New'}</span>
              </div>
            </div>
          </div>

          {/* Action Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-xl p-6 text-gray-900 sticky top-8">
              <img
                src={thumbnailUrl || '/default-course-thumbnail.jpg'}
                alt={course.title}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
              
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {course.isPremium ? `$${course.price || 0}` : 'Free'}
                </div>
                <p className="text-sm text-gray-600">
                  {course.isPremium ? 'Premium Course' : 'Free Course'}
                </p>
              </div>

              {/* Action Buttons - Passed as children */}
              {children}

              {/* Course Progress */}
              {isEnrolled && course.userProgress !== undefined && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{course.userProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.userProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
