/* eslint-disable @typescript-eslint/no-explicit-any */
// frontend/src/store/slices/lessonSlice.ts
import type { StateCreator } from 'zustand';
import type { RootState } from '../index';
import { mockittAPI } from '../../services/api';

export interface Lesson {
  id: string;
  title: string;
  content: string;
  contentType: string;
  contentUrl?: string;
  duration: number;
  orderIndex: number;
  isRequired: boolean;
  course: {
    id: string;
    title: string;
    modules: any[];
  };
  module: {
    id: string;
    title: string;
    description?: string;
  };
  progress?: {
    id: string;
    isCompleted: boolean;
    timeSpent: number;
    lastAccessedAt: string;
    progressPercentage: number;
  };
  notes: string;
  enrollment: {
    enrolledAt: string;
    overallProgress: number;
  };
}

export interface LessonNavigation {
  previous: any | null;
  next: any | null;
  current: any;
  totalLessons: number;
  currentPosition: number;
}

export interface LessonSlice {
  currentLesson: Lesson | null;
  lessonNavigation: LessonNavigation | null;
  lessonLoading: boolean;
  lessonError: string | null;

  // Actions
  fetchLessonById: (lessonId: string) => Promise<void>;
  fetchLessonNavigation: (lessonId: string) => Promise<void>;
  updateLessonProgress: (lessonId: string, progressData: { progressPercentage: number; timeSpent?: number }) => Promise<void>;
  markLessonComplete: (lessonId: string) => Promise<void>;
  updateLessonNotes: (lessonId: string, notes: string) => Promise<void>;
  trackTimeSpent: (lessonId: string, timeSpent: number) => Promise<void>;
  clearLessonError: () => void;
}

export const lessonSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  LessonSlice
// eslint-disable-next-line @typescript-eslint/no-unused-vars
> = (set, _get) => ({
  currentLesson: null,
  lessonNavigation: null,
  lessonLoading: false,
  lessonError: null,

  fetchLessonById: async (lessonId: string) => {
    set((state) => {
      state.lessonLoading = true;
      state.lessonError = null;
    });

    try {
      const lesson = await mockittAPI.lessons.getLessonById(lessonId);

      set((state) => {
        state.currentLesson = lesson;
        state.lessonLoading = false;
      });
    } catch (error: any) {
      set((state) => {
        state.lessonLoading = false;
        state.lessonError = error.response?.data?.message || 'Failed to fetch lesson';
      });
      throw error;
    }
  },

  fetchLessonNavigation: async (lessonId: string) => {
    try {
      const navigation = await mockittAPI.lessons.getLessonNavigation(lessonId);
      set((state) => {
        state.lessonNavigation = navigation;
      });
    } catch (error: any) {
      console.error('Failed to fetch lesson navigation:', error);
      throw error
    }
  },

  updateLessonProgress: async (lessonId: string, progressData: { progressPercentage: number; timeSpent?: number }) => {
    await mockittAPI.lessons.updateProgress(lessonId, progressData);
    // Update current lesson progress
    set((state) => {
      if (state.currentLesson && state.currentLesson.id === lessonId) {
        // ✅ Ensure all required properties are present
        state.currentLesson.progress = {
          id: state.currentLesson.progress?.id || '', // ✅ Provide fallback for required id
          isCompleted: progressData.progressPercentage >= 100,
          progressPercentage: progressData.progressPercentage,
          lastAccessedAt: new Date().toISOString(),
          timeSpent: progressData.timeSpent
            ? (state.currentLesson.progress?.timeSpent || 0) + progressData.timeSpent
            : (state.currentLesson.progress?.timeSpent || 0)
        };
      }
    });
  },

  markLessonComplete: async (lessonId: string) => {
    try {

      await mockittAPI.lessons.markComplete(lessonId);
      set((state) => {
        if (state.currentLesson && state.currentLesson.id === lessonId) {
          state.currentLesson.progress = {
            id: state.currentLesson.progress?.id || '', // ✅ Provide fallback for required id
            isCompleted: true,
            progressPercentage: 100,
            lastAccessedAt: new Date().toISOString(),
            timeSpent: state.currentLesson.progress?.timeSpent || 0 // ✅ Preserve existing time
          };
        }
      });
    } catch (error) {
      console.error('Failed to track time spent:', error);
      throw error
    }
  },

  updateLessonNotes: async (lessonId: string, notes: string) => {
    await mockittAPI.lessons.updateUserNotes(lessonId, notes);
    set((state) => {
      if (state.currentLesson && state.currentLesson.id === lessonId) {
        state.currentLesson.notes = notes;
      }
    });
  },

  trackTimeSpent: async (lessonId: string, timeSpent: number) => {
    try {
      await mockittAPI.lessons.trackTimeSpent(lessonId, timeSpent);
    } catch (error: any) {
      console.error('Failed to track time spent:', error);
      throw error;
    }
  },

  clearLessonError: () => {
    set((state) => {
      state.lessonError = null;
    });
  },
});
