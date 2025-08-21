/* eslint-disable @typescript-eslint/no-explicit-any */
// frontend/src/store/slices/courseSlice.ts
// frontend/src/store/slices/courseSlice.ts
import type { StateCreator } from 'zustand';
import type { RootState } from '../index';
import { mockittAPI } from '../../services/api'; // ✅ Use your existing API service

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  thumbnailUrl?: string;
  isPremium: boolean;
  stats: {
    totalLessons: number;
    totalDuration: number;
    averageRating: number;
    enrollmentCount: number;
  };
  modules: any,
  userProgress: number;
  isEnrolled: boolean;
  reviews: any;
  price: number;
}

export interface CourseSlice {
  // State
  courses: Course[];
  currentCourse: any | null;
  userEnrollments: any[];
  coursesLoading: boolean;
  coursesError: string | null;
  enrolledCoursesData: any[];

  // Actions
  fetchCourses: (filters?: any) => Promise<void>;
  fetchUserEnrollments: () => Promise<void>;
  fetchCourseById: (courseId: string) => Promise<void>;
  enrollInCourse: (courseId: string) => Promise<void>;
  updateCourseProgress: (lessonId: string, timeSpent: number) => Promise<void>;
  clearCoursesError: () => void;
  updateProgress: (lessonId: string, timeSpent: number) => Promise<void>;
  isEnrolledInCourse: (courseId: string) => boolean;
  getEnrolledCourseData: (courseId: string) => any | null
}

export const courseSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  CourseSlice
> = (set, get) => ({
  // Initial state
  courses: [],
  currentCourse: null,
  userEnrollments: [],
  coursesLoading: false,
  coursesError: null,
  enrolledCoursesData: [],

  // ✅ Use your mockittAPI pattern instead of direct fetch calls
  fetchCourses: async (filters = {}) => {
    set((state) => {
      state.coursesLoading = true;
      state.coursesError = null;
    });

    try {
      const data = await mockittAPI.courses.getAll(filters); // ✅ Use your API service

      set((state) => {
        state.courses = data.courses || data; // Handle your API response structure
        state.coursesLoading = false;
      });
    } catch (error) {
      set((state) => {
        state.coursesError = 'Failed to load courses';
        state.coursesLoading = false;
      });

      // Use your existing error handling pattern
      console.error('Course fetch error:', error);
    }
  },

  fetchCourseById: async (courseId: string) => {
    set((state) => {
      state.coursesLoading = true;
      state.coursesError = null;
    });

    try {
      const courseData = await mockittAPI.courses.getById(courseId); // ✅ Use your API service
      console.log(courseData, 'courseData');
      set((state) => {
        state.currentCourse = courseData;
        state.coursesLoading = false;
      });
    } catch (error) {
      set((state) => {
        state.coursesError = 'Failed to load course details';
        state.coursesLoading = false;
      });

      console.error('Course detail fetch error:', error);
    }
  },

  enrollInCourse: async (courseId: string) => {
    try {
      const result = await mockittAPI.courses.enroll(courseId);

      set((state) => {
        // ✅ Add to enrollments immediately
        if (!state.userEnrollments.includes(courseId)) {
          state.userEnrollments.push(courseId);
        }

        // ✅ Update current course if it's the one being enrolled in
        if (state.currentCourse && state.currentCourse.id === courseId) {
          state.currentCourse.isEnrolled = true;
          state.currentCourse.userProgress = 0;
        }

        state.coursesLoading = false;
      });


      // Refresh course data to show enrollment status
      await get().fetchCourseById(courseId);
      return result;
    } catch (error) {
      set((state) => {
        state.coursesError = 'Failed to enroll in course';
      });

      console.error('Course enrollment error:', error);
    }
  },

  updateCourseProgress: async (lessonId: string, timeSpent: number) => {
    try {
      await mockittAPI.courses.updateProgress(lessonId, { timeSpent }); // ✅ Use your API service

      // Optionally update local state or refetch data
    } catch (error) {
      console.error('Progress update failed:', error);
    }
  },

  clearCoursesError: () => {
    set((state) => {
      state.coursesError = null;
    });
  },
  // ✅ Update lesson progress
  updateProgress: async (lessonId: string, timeSpent: number) => {
    try {
      const response = await fetch(`/api/courses/lessons/${lessonId}/progress`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ timeSpent })
      });

      if (!response.ok) {
        throw new Error('Failed to update progress');
      }

      // Update local state if needed
    } catch (error) {
      console.error('Progress update failed:', error);
    }
  },
  fetchUserEnrollments: async () => {
    try {
      const enrollmentsData = await mockittAPI.courses.getMyEnrolledCourses();
      console.log(enrollmentsData, 'enrollmentsDataenrollmentsData')
      set((state) => {
        // ✅ Extract course IDs for quick enrollment checking
        state.userEnrollments = enrollmentsData.map((enrollment: any) => enrollment.courseId);
        
        // ✅ Store full enrollment data for rich information
        state.enrolledCoursesData = enrollmentsData;
      });
    } catch (error) {
      console.error('Failed to fetch user enrollments:', error);
    }
  },
  isEnrolledInCourse: (courseId: string) => {
    const state = get();
    return state.userEnrollments.includes(courseId);
  },
  getEnrolledCourseData: (courseId: string) => {
    const state = get();
    return state.enrolledCoursesData.find((enrollment: any) => enrollment.courseId === courseId) || null;
  },
});
