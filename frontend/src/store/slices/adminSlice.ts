/* eslint-disable @typescript-eslint/no-explicit-any */
// frontend/src/store/slices/adminSlice.ts
import type { StateCreator } from 'zustand';
import type { RootState } from '../index';
import { mockittAPI } from '../../services/api';

export interface AdminSlice {
  // Dashboard State
  dashboardStats: any;
  
  // Course Management
  adminCourses: any[]; // ✅ Consistent naming
  adminCurrentCourse: any; // ✅ Consistent naming
  
  // User Management - ✅ Missing section added
  users: any[];
  currentUser: any;
  
  // Quiz Management - ✅ Missing section added
  quizzes: any[];
  adminCurrentQuiz: any;
  
  // Loading & Error States
  loading: boolean;
  error: string | null;

  // Dashboard Actions
  fetchDashboardStats: () => Promise<void>;
  getAnalytics: (filters?: any) => Promise<void>; // ✅ Missing method
  
  // Course Actions
  fetchCoursesForAdmin: (filters?: any) => Promise<void>;
  fetchCourseForEdit: (courseId: string) => Promise<void>;
  createCourse: (courseData: any) => Promise<void>;
  updateCourse: (courseId: string, courseData: any) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  publishCourse: (courseId: string) => Promise<void>;
  createCourseByAI: (prompt: any) => Promise<any>; // ✅ Missing method
  
  // Module & Lesson Management - ✅ Missing section added
  createModule: (courseId: string, moduleData: any) => Promise<void>;
  updateModule: (moduleId: string, moduleData: any) => Promise<void>;
  deleteModule: (moduleId: string) => Promise<void>;
  createLesson: (moduleId: string, lessonData: any) => Promise<void>;
  updateLesson: (lessonId: string, lessonData: any) => Promise<void>;
  deleteLesson: (lessonId: string) => Promise<void>;
  
  // User Management Actions - ✅ Missing section added
  fetchUsers: (filters?: any) => Promise<void>;
  fetchUserById: (userId: string) => Promise<void>;
  updateUser: (userId: string, userData: any) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  toggleUserPremium: (userId: string) => Promise<void>;
  
  // Quiz Management Actions - ✅ Missing section added
  fetchQuizzes: (filters?: any) => Promise<void>;
  fetchQuizById: (quizId: string) => Promise<void>;
  createQuiz: (quizData: any) => Promise<void>;
  updateQuiz: (quizId: string, quizData: any) => Promise<void>;
  deleteQuiz: (quizId: string) => Promise<void>;
  addQuestion: (quizId: string, questionData: any) => Promise<void>;
  updateQuestion: (questionId: string, questionData: any) => Promise<void>;
  deleteQuestion: (questionId: string) => Promise<void>;
  createQuizByAI: (prompt: any) => Promise<any>; // ✅ Missing method
  
  // Utility Actions
  clearError: () => void;
}

export const adminSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  AdminSlice
// eslint-disable-next-line @typescript-eslint/no-unused-vars
> = (set, _get) => ({
  // Initial State
  dashboardStats: null,
  adminCourses: [], // ✅ Fixed naming
  adminCurrentCourse: null, // ✅ Fixed naming
  users: [],
  currentUser: null,
  quizzes: [],
  adminCurrentQuiz: null,
  loading: false,
  error: null,

  // Dashboard Actions
  fetchDashboardStats: async () => {
    set((state) => {
      state.loading = true;
      state.error = null;
    });

    try {
      const stats = await mockittAPI.admin.getDashboardStats();
      set((state) => {
        state.dashboardStats = stats;
        state.loading = false;
      });
    } catch (error: any) {
      set((state) => {
        state.error = error.response?.data?.message || 'Failed to load dashboard stats';
        state.loading = false;
      });
    }
  },

  // ✅ Missing analytics method
  getAnalytics: async (filters = {}) => {
    set((state) => {
      state.loading = true;
      state.error = null;
    });

    try {
      const analytics = await mockittAPI.admin.getAnalytics(filters);
      set((state) => {
        state.dashboardStats = { ...state.dashboardStats, ...analytics };
        state.loading = false;
      });
    } catch (error: any) {
      set((state) => {
        state.error = error.response?.data?.message || 'Failed to load analytics';
        state.loading = false;
      });
    }
  },

  // Course Actions
  fetchCoursesForAdmin: async (filters = {}) => {
    set((state) => {
      state.loading = true;
      state.error = null;
    });

    try {
      const response = await mockittAPI.admin.getCourses(filters);
      set((state) => {
        // ✅ Fixed property reference
        state.adminCourses = response.courses || response;
        state.loading = false;
      });
    } catch (error: any) {
      set((state) => {
        state.error = error.response?.data?.message || 'Failed to load courses';
        state.loading = false;
      });
    }
  },

  createCourse: async (courseData: any) => {
    set((state) => {
      state.loading = true;
      state.error = null;
    });

    try {
      const newCourse = await mockittAPI.admin.createCourse(courseData);
      set((state) => {
        // ✅ Fixed property reference
        state.adminCourses.unshift(newCourse);
        state.loading = false;
      });
    } catch (error: any) {
      set((state) => {
        state.error = error.response?.data?.message || 'Failed to create course';
        state.loading = false;
      });
      throw error;
    }
  },

  updateCourse: async (courseId: string, courseData: any) => {
    set((state) => {
      state.loading = true;
      state.error = null;
    });

    try {
      const updatedCourse = await mockittAPI.admin.updateCourse(courseId, courseData);
      set((state) => {
        // ✅ Fixed property references
        const index = state.adminCourses.findIndex(c => c.id === courseId);
        if (index !== -1) {
          state.adminCourses[index] = updatedCourse;
        }
        state.adminCurrentCourse = updatedCourse;
        state.loading = false;
      });
    } catch (error: any) {
      set((state) => {
        // state.error = error.response?.data?.message || 'Failed to update course';
        state.loading = false;
      });
      throw error;
    }
  },

  deleteCourse: async (courseId: string) => {
    set((state) => {
      state.loading = true;
      state.error = null;
    });

    try {
      await mockittAPI.admin.deleteCourse(courseId);
      set((state) => {
        // ✅ Fixed property reference
        state.adminCourses = state.adminCourses.filter(c => c.id !== courseId);
        state.loading = false;
      });
    } catch (error: any) {
      set((state) => {
        // state.error = error.response?.data?.message || 'Failed to delete course';
        state.loading = false;
      });
      throw error;
    }
  },

  publishCourse: async (courseId: string) => {
    try {
      const updatedCourse = await mockittAPI.admin.publishCourse(courseId);
      set((state) => {
        // ✅ Fixed property reference
        const index = state.adminCourses.findIndex(c => c.id === courseId);
        if (index !== -1) {
          state.adminCourses[index] = updatedCourse;
        }
      });
    } catch (error: any) {
      set((state) => {
        state.error = error.response?.data?.message || 'Failed to publish course';
      });
      throw error;
    }
  },

  fetchCourseForEdit: async (courseId: string) => {
    set((state) => {
      state.loading = true;
      state.error = null;
    });

    try {
      const course = await mockittAPI.admin.getCourseForEdit(courseId);
      set((state) => {
        // ✅ Fixed property reference
        state.adminCurrentCourse = course;
        state.loading = false;
      });
    } catch (error: any) {
      set((state) => {
        state.error = error.response?.data?.message || 'Failed to load course';
        state.loading = false;
      });
    }
  },

  // ✅ Module & Lesson Management (Missing implementations)
  createModule: async (courseId: string, moduleData: any) => {
    try {
      const newModule = await mockittAPI.admin.createModule(courseId, moduleData);
      set((state) => {
        if (state.adminCurrentCourse && state.adminCurrentCourse.id === courseId) {
          state.adminCurrentCourse.modules = state.adminCurrentCourse.modules || [];
          state.adminCurrentCourse.modules.push(newModule);
        }
      });
    } catch (error: any) {
      set((state) => {
        state.error = error.response?.data?.message || 'Failed to create module';
      });
      throw error;
    }
  },

  updateModule: async (moduleId: string, moduleData: any) => {
    try {
      const updatedModule = await mockittAPI.admin.updateModule(moduleId, moduleData);
      set((state) => {
        if (state.adminCurrentCourse?.modules) {
          const index = state.adminCurrentCourse.modules.findIndex((m: any) => m.id === moduleId);
          if (index !== -1) {
            state.adminCurrentCourse.modules[index] = updatedModule;
          }
        }
      });
    } catch (error: any) {
      set((state) => {
        state.error = error.response?.data?.message || 'Failed to update module';
      });
      throw error;
    }
  },

  deleteModule: async (moduleId: string) => {
    try {
      await mockittAPI.admin.deleteModule(moduleId);
      set((state) => {
        if (state.adminCurrentCourse?.modules) {
          state.adminCurrentCourse.modules = state.adminCurrentCourse.modules.filter((m: any) => m.id !== moduleId);
        }
      });
    } catch (error: any) {
      set((state) => {
        state.error = error.response?.data?.message || 'Failed to delete module';
      });
      throw error;
    }
  },

  createLesson: async (moduleId: string, lessonData: any) => {
    try {
      const newLesson = await mockittAPI.admin.createLesson(moduleId, lessonData);
      set((state) => {
        if (state.adminCurrentCourse?.modules) {
          const moduleIndex = state.adminCurrentCourse.modules.findIndex((m: any) => m.id === moduleId);
          if (moduleIndex !== -1) {
            state.adminCurrentCourse.modules[moduleIndex].lessons = state.adminCurrentCourse.modules[moduleIndex].lessons || [];
            state.adminCurrentCourse.modules[moduleIndex].lessons.push(newLesson);
          }
        }
      });
    } catch (error: any) {
      set((state) => {
        state.error = error.response?.data?.message || 'Failed to create lesson';
      });
      throw error;
    }
  },

  updateLesson: async (lessonId: string, lessonData: any) => {
    try {
      const updatedLesson = await mockittAPI.admin.updateLesson(lessonId, lessonData);
      set((state) => {
        if (state.adminCurrentCourse?.modules) {
          state.adminCurrentCourse.modules.forEach((module: any) => {
            if (module.lessons) {
              const lessonIndex = module.lessons.findIndex((l: any) => l.id === lessonId);
              if (lessonIndex !== -1) {
                module.lessons[lessonIndex] = updatedLesson;
              }
            }
          });
        }
      });
    } catch (error: any) {
      set((state) => {
        state.error = error.response?.data?.message || 'Failed to update lesson';
      });
      throw error;
    }
  },

  deleteLesson: async (lessonId: string) => {
    try {
      await mockittAPI.admin.deleteLesson(lessonId);
      set((state) => {
        if (state.adminCurrentCourse?.modules) {
          state.adminCurrentCourse.modules.forEach((module: any) => {
            if (module.lessons) {
              module.lessons = module.lessons.filter((l: any) => l.id !== lessonId);
            }
          });
        }
      });
    } catch (error: any) {
      set((state) => {
        state.error = error.response?.data?.message || 'Failed to delete lesson';
      });
      throw error;
    }
  },

  // ✅ User Management Actions (Missing implementations)
  fetchUsers: async (filters = {}) => {
    set((state) => {
      state.loading = true;
      state.error = null;
    });

    try {
      const response = await mockittAPI.admin.getUsers(filters);
      set((state) => {
        state.users = response.users || response;
        state.loading = false;
      });
    } catch (error: any) {
      set((state) => {
        state.error = error.response?.data?.message || 'Failed to load users';
        state.loading = false;
      });
    }
  },

  fetchUserById: async (userId: string) => {
    set((state) => {
      state.loading = true;
      state.error = null;
    });

    try {
      const user = await mockittAPI.admin.getUserById(userId);
      set((state) => {
        state.currentUser = user;
        state.loading = false;
      });
    } catch (error: any) {
      set((state) => {
        state.error = error.response?.data?.message || 'Failed to load user';
        state.loading = false;
      });
    }
  },

  updateUser: async (userId: string, userData: any) => {
    try {
      const updatedUser = await mockittAPI.admin.updateUser(userId, userData);
      set((state) => {
        const index = state.users.findIndex(u => u.id === userId);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
        if (state.currentUser?.id === userId) {
          state.currentUser = updatedUser;
        }
      });
    } catch (error: any) {
      set((state) => {
        state.error = error.response?.data?.message || 'Failed to update user';
      });
      throw error;
    }
  },

  deleteUser: async (userId: string) => {
    try {
      await mockittAPI.admin.deleteUser(userId);
      set((state) => {
        state.users = state.users.filter(u => u.id !== userId);
      });
    } catch (error: any) {
      set((state) => {
        state.error = error.response?.data?.message || 'Failed to delete user';
      });
      throw error;
    }
  },

  toggleUserPremium: async (userId: string) => {
    try {
      const updatedUser = await mockittAPI.admin.toggleUserPremium(userId);
      set((state) => {
        const index = state.users.findIndex(u => u.id === userId);
        if (index !== -1) {
          state.users[index] = { ...state.users[index], ...updatedUser };
        }
      });
    } catch (error: any) {
      set((state) => {
        state.error = error.response?.data?.message || 'Failed to toggle premium status';
      });
      throw error;
    }
  },

  // ✅ Quiz Management Actions (Missing implementations)
  fetchQuizzes: async (filters = {}) => {
    set((state) => {
      state.loading = true;
      state.error = null;
    });

    try {
      const response = await mockittAPI.admin.getQuizzes(filters);
      set((state) => {
        state.quizzes = response.quizzes || response;
        state.loading = false;
      });
    } catch (error: any) {
      set((state) => {
        state.error = error.response?.data?.message || 'Failed to load quizzes';
        state.loading = false;
      });
    }
  },

  fetchQuizById: async (quizId: string) => {
    set((state) => {
      state.loading = true;
      state.error = null;
    });

    try {
      const quiz = await mockittAPI.admin.getQuizById(quizId);
      set((state) => {
        state.currentQuiz = quiz;
        state.loading = false;
      });
    } catch (error: any) {
      set((state) => {
        state.error = error.response?.data?.message || 'Failed to load quiz';
        state.loading = false;
      });
    }
  },

  createQuiz: async (quizData: any) => {
    try {
      const newQuiz = await mockittAPI.admin.createQuiz(quizData);
      set((state) => {
        state.quizzes.unshift(newQuiz);
      });
    } catch (error: any) {
      set((state) => {
        state.error = error.response?.data?.message || 'Failed to create quiz';
      });
      throw error;
    }
  },

  updateQuiz: async (quizId: string, quizData: any) => {
    try {
      const updatedQuiz = await mockittAPI.admin.updateQuiz(quizId, quizData);
      set((state) => {
        const index = state.quizzes.findIndex(q => q.id === quizId);
        if (index !== -1) {
          state.quizzes[index] = updatedQuiz;
        }
        if (state.currentQuiz?.id === quizId) {
          state.currentQuiz = updatedQuiz;
        }
      });
    } catch (error: any) {
      set((state) => {
        state.error = error.response?.data?.message || 'Failed to update quiz';
      });
      throw error;
    }
  },

  deleteQuiz: async (quizId: string) => {
    try {
      await mockittAPI.admin.deleteQuiz(quizId);
      set((state) => {
        state.quizzes = state.quizzes.filter(q => q.id !== quizId);
      });
    } catch (error: any) {
      set((state) => {
        state.error = error.response?.data?.message || 'Failed to delete quiz';
      });
      throw error;
    }
  },

  addQuestion: async (quizId: string, questionData: any) => {
    try {
      const newQuestion = await mockittAPI.admin.addQuestion(quizId, questionData);
      set((state) => {
        if (state.currentQuiz?.id === quizId) {
          state.currentQuiz.questions = state.currentQuiz.questions || [];
          state.currentQuiz.questions.push(newQuestion);
        }
      });
    } catch (error: any) {
      set((state) => {
        state.error = error.response?.data?.message || 'Failed to add question';
      });
      throw error;
    }
  },

  updateQuestion: async (questionId: string, questionData: any) => {
    try {
      const updatedQuestion = await mockittAPI.admin.updateQuestion(questionId, questionData);
      set((state) => {
        if (state.currentQuiz?.questions) {
          const index = state.currentQuiz.questions.findIndex((q: any) => q.id === questionId);
          if (index !== -1) {
            state.currentQuiz.questions[index] = updatedQuestion;
          }
        }
      });
    } catch (error: any) {
      set((state) => {
        state.error = error.response?.data?.message || 'Failed to update question';
      });
      throw error;
    }
  },

  deleteQuestion: async (questionId: string) => {
    try {
      await mockittAPI.admin.deleteQuestion(questionId);
      set((state) => {
        if (state.currentQuiz?.questions) {
          state.currentQuiz.questions = state.currentQuiz.questions.filter((q: any) => q.id !== questionId);
        }
      });
    } catch (error: any) {
      set((state) => {
        state.error = error.response?.data?.message || 'Failed to delete question';
      });
      throw error;
    }
  },

  clearError: () => {
    set((state) => {
      state.error = null;
    });
  },
  createQuizByAI: async (prompt: any) => {
    set((state) => {
      state.loading = true;
      state.error = null;
    });

    try {
      const quizData = await mockittAPI.admin.createQuizFromAI(prompt);
      set((state) => {
        state.quizzes.unshift(quizData);
        state.loading = false;
      });
      return quizData
    } catch (error: any) {
      set((state) => {
        state.error = error.response?.data?.message || 'Failed to generate quiz content';
        state.loading = false;
      });
      throw error;
    }
  },
  createCourseByAI: async (prompt: any) => {
    set((state) => {
      state.loading = true;
      state.error = null;
    });

    try {
      const courseData = await mockittAPI.admin.createCourseFromAI(prompt);
      set((state) => {
        state.adminCourses.unshift(courseData);
        state.loading = false;
      });
      return courseData;
    } catch (error: any) {
      set((state) => {
        state.error = error.response?.data?.message || 'Failed to generate course content';
        state.loading = false;
      });
      throw error;
    }
  }
});
