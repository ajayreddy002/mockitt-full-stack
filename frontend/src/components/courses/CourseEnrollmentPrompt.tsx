/* eslint-disable @typescript-eslint/no-explicit-any */
// frontend/src/components/courses/CourseEnrollmentPrompt.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Play, CreditCard, UserCheck, CheckCircle } from 'lucide-react';
import { useCourses, useAuth } from '../../store';
import { useUI } from '../../store';

interface CourseEnrollmentPromptProps {
  course: any;
}

export const CourseEnrollmentPrompt: React.FC<CourseEnrollmentPromptProps> = ({ course }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enrollInCourse, isEnrolledInCourse } = useCourses();
  const { addNotification } = useUI();
  const [enrolling, setEnrolling] = useState(false);
  const [localIsEnrolled, setLocalIsEnrolled] = useState(false);

  const isEnrolled = isEnrolledInCourse(course.id);
  const needsPayment = course.isPremium && !user?.isPremium && !course.userHasPurchased;
  const needsEnrollment = !isEnrolled;

  useEffect(() => {
    setLocalIsEnrolled(isEnrolled);
  }, [isEnrolled]);

  const handleFreeEnrollment = async () => {
    if (!user) {
      navigate('/login', { state: { redirectTo: `/courses/${course.id}` } });
      return;
    }

    setEnrolling(true);
    try {
      await enrollInCourse(course.id);
      setLocalIsEnrolled(true);
      addNotification({
        type: 'success',
        title: 'Enrolled Successfully',
        message: 'You can now access this course!'
      });
    } catch (error: Error | any) {
      addNotification({
        type: 'error',
        title: 'Enrollment Error',
        message: error?.response?.message || 'Failed to enroll in course. Please try again.'
      });

    } finally {
      setEnrolling(false);
    }
  };

  const handlePremiumUpgrade = () => {
    navigate('/pricing', { state: { selectedCourse: course.id } });
  };

  const handlePurchaseCourse = () => {
    navigate(`/courses/${course.id}/purchase`);
  };

  if (localIsEnrolled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Successfully Enrolled!</h2>
          <p className="text-gray-600 mb-6">You now have access to this course.</p>
          <button
            onClick={() => navigate(`/courses/${course.id}`)}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700"
          >
            Start Learning
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center">
        {/* Course Info */}
        <div className="mb-6">
          <img
            src={course.thumbnailUrl || '/default-course-thumbnail.jpg'}
            alt={course.title}
            className="w-20 h-20 rounded-lg mx-auto mb-4 object-cover"
          />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h2>
          <p className="text-gray-600 text-sm">{course.shortDescription}</p>
        </div>

        {/* Access Status */}
        {needsPayment ? (
          <>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
              <Lock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <h3 className="font-semibold text-yellow-800 mb-1">Premium Course</h3>
              <p className="text-yellow-700 text-sm">
                This course requires a premium subscription or individual purchase.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handlePremiumUpgrade}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
              >
                <CreditCard className="h-4 w-4" />
                <span>Upgrade to Premium</span>
              </button>
              
              <button
                onClick={handlePurchaseCourse}
                className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-all flex items-center justify-center space-x-2"
              >
                <span>Purchase This Course - ${course.price}</span>
              </button>
            </div>
          </>
        ) : needsEnrollment ? (
          <>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
              <Play className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-green-800 mb-1">Free Course</h3>
              <p className="text-green-700 text-sm">
                Enroll now to start learning and track your progress.
              </p>
            </div>

            <button
              onClick={handleFreeEnrollment}
              disabled={enrolling}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
            >
              <UserCheck className="h-4 w-4" />
              <span>{enrolling ? 'Enrolling...' : 'Enroll for Free'}</span>
            </button>
          </>
        ) : (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-800 mb-1">Access Required</h3>
            <p className="text-blue-700 text-sm">
              You need premium access to view this course content.
            </p>
          </div>
        )}

        {/* Course Details */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">{course.level}</span>
              <div>Level</div>
            </div>
            <div>
              <span className="font-medium">{course.estimatedHours}h</span>
              <div>Duration</div>
            </div>
            <div>
              <span className="font-medium">{course.stats?.enrollmentCount || 0}</span>
              <div>Students</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
