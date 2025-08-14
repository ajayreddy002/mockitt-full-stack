// frontend/src/components/courses/CourseAccessHandler.tsx
import React from 'react';
import { useAuth, useCourses } from '../../store';
import { CourseEnrollmentPrompt } from './CourseEnrollmentPrompt';

interface CourseAccessProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  course: any;
  children: React.ReactNode;
}

export const CourseAccessHandler: React.FC<CourseAccessProps> = ({ course, children }) => {
  const { user } = useAuth();
  const { isEnrolledInCourse } = useCourses();
  
  // ✅ Check enrollment for ALL courses (free and premium)
  const isEnrolled = isEnrolledInCourse(course.id);
  
  // ✅ For premium courses, also check premium status
  const hasAccess = course.isPremium 
    ? (isEnrolled && (user?.isPremium || course.userHasPurchased))
    : isEnrolled; // Free courses only need enrollment

  if (!hasAccess) {
    return <CourseEnrollmentPrompt course={course} />;
  }

  return <>{children}</>;
};
