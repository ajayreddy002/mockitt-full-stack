/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}`;

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  // timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ✅ API Service Methods for Your Mockitt Platform
export const mockittAPI = {
  // Authentication endpoints
  auth: {
    login: async (email: string, password: string) => {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    },
    register: async (userData: any) => {
      const response = await api.post('/auth/register', userData);
      return response.data;
    },
    logout: async () => {
      const response = await api.post('/auth/logout');
      return response.data;
    },
    getProfile: async () => {
      const response = await api.get('/auth/me');
      return response.data;
    },
  },

  // Resume endpoints
  resumes: {
    getAll: async () => {
      const response = await api.get('/resumes');
      return response.data;
    },
    upload: async (file: File, autoAnalyze = true) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('autoAnalyze', autoAnalyze.toString());

      const response = await api.post('/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    analyze: async (resumeId: string) => {
      const response = await api.post(`/resumes/${resumeId}/analyze`);
      return response.data;
    },
    getAnalysis: async (resumeId: string) => {
      const response = await api.get(`/resumes/${resumeId}/analysis`);
      return response.data;
    },
    delete: async (resumeId: string) => {
      const response = await api.delete(`/resumes/${resumeId}`);
      return response.data;
    },
  },

  // Interview endpoints
  interviews: {
    getSessions: async () => {
      const response = await api.get('/interviews/sessions');
      return response.data;
    },
    createSession: async (sessionData: any) => {
      const response = await api.post('/interviews/sessions', sessionData);
      return response.data;
    },
    getSession: async (sessionId: string) => {
      const response = await api.get(`/interviews/sessions/${sessionId}`);
      return response.data;
    },
    updateSession: async (sessionId: string, updates: any) => {
      const response = await api.put(`/interviews/sessions/${sessionId}`, updates);
      return response.data;
    },
    deleteSession: async (sessionId: string) => {
      const response = await api.delete(`/interviews/sessions/${sessionId}`);
      return response.data;
    },
    startSession: async (sessionId: string) => {
      const response = await api.post(`/interviews/sessions/${sessionId}/start`);
      return response.data;
    },
    endSession: async (sessionId: string) => {
      const response = await api.post(`/interviews/sessions/${sessionId}/end`);
      return response.data;
    },
    generateQuestions: async (context: any) => {
      const response = await api.post('/interviews/questions/generate', context);
      return response.data;
    },
    saveResponse: async (responseData: any) => {
      const response = await api.post('/interviews/responses', responseData);
      return response.data;
    },
    getResults: async (sessionId: string) => {
      const response = await api.get(`/interviews/sessions/${sessionId}/results`);
      return response.data;
    },
    submitBatchResponses: async (sessionId: string, responses: any[]) => {
      const response = await api.post(`/interviews/sessions/${sessionId}/responses/batch`, {
        responses
      });
      return response.data;
    },
  },

  // AI services
  ai: {
    analyzeResume: async (resumeData: any) => {
      const response = await api.post('/ai/analyze/resume', resumeData);
      return response.data;
    },
    analyzeRealTime: async (analysisData: {
      spokenText: string;
      currentQuestion: string;
      targetRole: string;
      industry: string;
    }) => {
      const response = await api.post('/ai/analyze/real-time', analysisData);
      return response.data;
    },

    getInstantTips: async (coachingData: {
      currentResponse: string;
      context: {
        targetRole?: string;
        industry?: string;
        currentQuestion?: string;
      };
    }) => {
      const response = await api.post('/ai/coaching/instant-tips', coachingData);
      return response.data;
    },

    generateFollowUp: async (followUpData: {
      originalQuestion: string;
      userResponse: string;
      context: {
        targetRole?: string;
        industry?: string;
      };
    }) => {
      const response = await api.post('/ai/questions/follow-up', followUpData);
      return response.data;
    },

    generateQuestions: async (questionData: {
      targetRole: string;
      targetIndustry: string;
      difficulty: string;
      questionTypes: string[];
      count: number;
    }) => {
      const response = await api.post('/ai/questions/generate', questionData);
      return response.data;
    },

    analyzeSpeech: async (speechData: {
      transcription: string;
      duration: number;
      audioUrl?: string;
    }) => {
      const response = await api.post('/ai/speech/analyze', speechData);
      return response.data;
    },
    generateAdaptiveQuestion: async (questionData: {
      previousResponses: any[];
      targetRole: string;
      difficulty: string;
      weakAreas: string[];
    }) => {
      const response = await api.post('/ai/questions/adaptive', questionData);
      return response.data;
    },
  },
  dashboard: {
    getStats: async () => {
      const response = await api.get('/dashboard/stats');
      return response.data;
    },

    getRecentActivity: async () => {
      const response = await api.get('/dashboard/recent-activity');
      return response.data;
    },

    getUserProgress: async () => {
      const response = await api.get('/dashboard/user-progress');
      return response.data;
    }
  },
  courses: {
    getAll: async (filters = {} as any) => {
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.level) queryParams.append('level', filters.level);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.isPremium !== undefined) {
        queryParams.append('isPremium', filters.isPremium.toString());
      }

      const response = await api.get(`/courses?${queryParams}`);
      return response.data;
    },

    getById: async (courseId: string) => {
      const response = await api.get(`/courses/${courseId}`);
      return response.data;
    },

    enroll: async (courseId: string) => {
      const response = await api.post(`/courses/${courseId}/enroll`);
      return response.data;
    },

    updateProgress: async (lessonId: string, progressData: { timeSpent: number }) => {
      const response = await api.patch(`/courses/lessons/${lessonId}/progress`, progressData);
      return response.data;
    },

    getUserEnrollments: async () => {
      const response = await api.get('/courses/enrollments');
      return response.data;
    },
  
    getMyEnrolledCourses: async () => {
      const response = await api.get('/courses/my-courses');
      return response.data;
    },

    getCourseProgress: async (courseId: string) => {
      const response = await api.get(`/courses/${courseId}/progress`);
      return response.data;
    },

    submitQuiz: async (quizId: string, answers: any[]) => {
      const response = await api.post(`/courses/quizzes/${quizId}/submit`, { answers });
      return response.data;
    },

    getQuizResults: async (quizId: string) => {
      const response = await api.get(`/courses/quizzes/${quizId}/results`);
      return response.data;
    }
  },
  quizzes: {
    getById: async (quizId: string) => {
      const response = await api.get(`/quizzes/${quizId}`);
      return response.data;
    },

    getAttempts: async (quizId: string) => {
      const response = await api.get(`/quizzes/${quizId}/attempts`);
      return response.data;
    },

    startAttempt: async (quizId: string) => {
      const response = await api.post(`/courses/quizzes/${quizId}/start`);
      return response.data;
    },

    submitAttempt: async (attemptId: string, responses: any[]) => {
      const response = await api.post(`/quizzes/attempts/${attemptId}/submit`, { responses });
      return response.data;
    },

    getResults: async (attemptId: string) => {
      const response = await api.get(`/quizzes/attempts/${attemptId}/results`);
      return response.data;
    },
    getModuleQuizzes: async (moduleId: string) => {
      const response = await api.get(`/courses/quizzes/${moduleId}`);
      return response.data;
    },

    // Submit answer for a specific question
    answerQuestion: async (attemptId: string, questionId: string, answer: any) => {
      const response = await api.patch(
        `/courses/quizzes/attempts/${attemptId}/questions/${questionId}`,
        { answer }
      );
      return response.data;
    },

    // Submit/finish the entire quiz attempt
    finishAttempt: async (attemptId: string) => {
      const response = await api.post(`/courses/quizzes/attempts/${attemptId}/submit`);
      return response.data;
    },

    // Get quiz attempt results
    getAttemptResults: async (attemptId: string) => {
      const response = await api.get(`/courses/quizzes/attempts/${attemptId}/results`);
      return response.data;
    },

    // Get user's attempt history for a quiz
    getUserAttempts: async (quizId: string) => {
      const response = await api.get(`/quizzes/${quizId}/attempts`);
      return response.data;
    },
  },
  admin: {
    // Dashboard methods
    getDashboardStats: async () => {
      const response = await api.get('/admin/dashboard');
      return response.data;
    },

    // Course management methods
    getCourses: async (filters = {}) => {
      const response = await api.get('/admin/courses', { params: filters });
      return response.data;
    },

    getCourseForEdit: async (courseId: string) => {
      const response = await api.get(`/admin/courses/${courseId}`);
      return response.data;
    },

    createCourse: async (courseData: any) => {
      const response = await api.post('/admin/courses', courseData);
      return response.data;
    },

    updateCourse: async (courseId: string, courseData: any) => {
      const response = await api.put(`/admin/courses/${courseId}`, courseData);
      return response.data;
    },

    deleteCourse: async (courseId: string) => {
      const response = await api.delete(`/admin/courses/${courseId}`);
      return response.data;
    },

    publishCourse: async (courseId: string) => {
      const response = await api.put(`/admin/courses/${courseId}/publish`);
      return response.data;
    },

    // User management methods
    getUsers: async (filters = {}) => {
      const response = await api.get('/admin/users', { params: filters });
      return response.data;
    },

    updateUser: async (userId: string, userData: any) => {
      const response = await api.put(`/admin/users/${userId}`, userData);
      return response.data;
    },

    deleteUser: async (userId: string) => {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    },

    // Quiz management methods
    getQuizzes: async (filters = {}) => {
      const response = await api.get('/admin/quizzes', { params: filters });
      return response.data;
    },

    getQuizForEdit: async (quizId: string) => {
      const response = await api.get(`/admin/quizzes/${quizId}`);
      return response.data;
    },

    createQuiz: async (quizData: any) => {
      const response = await api.post('/admin/quizzes', quizData);
      return response.data;
    },

    updateQuiz: async (quizId: string, quizData: any) => {
      const response = await api.put(`/admin/quizzes/${quizId}`, quizData);
      return response.data;
    },

    deleteQuiz: async (quizId: string) => {
      const response = await api.delete(`/admin/quizzes/${quizId}`);
      return response.data;
    },

    // Analytics methods
    getAnalytics: async (filters = {}) => {
      const response = await api.get('/admin/analytics', { params: filters });
      return response.data;
    },

    getUserById: async (userId: string) => {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    },

    toggleUserPremium: async (userId: string) => {
      const response = await api.put(`/admin/users/${userId}/premium`);
      return response.data;
    },

    // Module and lesson management
    createModule: async (courseId: string, moduleData: any) => {
      const response = await api.post(`/admin/courses/${courseId}/modules`, moduleData);
      return response.data;
    },

    updateModule: async (moduleId: string, moduleData: any) => {
      const response = await api.put(`/admin/modules/${moduleId}`, moduleData);
      return response.data;
    },

    deleteModule: async (moduleId: string) => {
      const response = await api.delete(`/admin/modules/${moduleId}`);
      return response.data;
    },

    createLesson: async (moduleId: string, lessonData: any) => {
      const response = await api.post(`/admin/modules/${moduleId}/lessons`, lessonData);
      return response.data;
    },

    updateLesson: async (lessonId: string, lessonData: any) => {
      const response = await api.put(`/admin/lessons/${lessonId}`, lessonData);
      return response.data;
    },

    deleteLesson: async (lessonId: string) => {
      const response = await api.delete(`/admin/lessons/${lessonId}`);
      return response.data;
    },

    getQuizById: async (quizId: string) => {
      const response = await api.get(`/admin/quizzes/${quizId}`);
      return response.data;
    },

    // ✅ Missing Question Management Methods
    addQuestion: async (quizId: string, questionData: any) => {
      const response = await api.post(`/admin/quizzes/${quizId}/questions`, questionData);
      return response.data;
    },

    updateQuestion: async (questionId: string, questionData: any) => {
      const response = await api.put(`/admin/questions/${questionId}`, questionData);
      return response.data;
    },

    deleteQuestion: async (questionId: string) => {
      const response = await api.delete(`/admin/questions/${questionId}`);
      return response.data;
    },
    createCourseFromAI: async (prompt: any) => {
      const response = await api.post('/admin/courses/ai/generate', prompt);
      return response.data;
    },
    createQuizFromAI: async (prompt: any) => {
      const response = await api.post('/admin/quizzes/ai/generate', prompt);
      return response.data;
    },
  },
  lessons: {
    getLessonById: async (lessonId: string) => {
      const response = await api.get(`/lessons/${lessonId}`);
      return response.data;
    },

    getLessonNavigation: async (lessonId: string) => {
      const response = await api.get(`/lessons/${lessonId}/navigation`);
      return response.data;
    },

    updateProgress: async (lessonId: string, progressData: { progressPercentage: number; timeSpent?: number }) => {
      const response = await api.put(`/lessons/${lessonId}/progress`, progressData);
      return response.data;
    },

    markComplete: async (lessonId: string) => {
      const response = await api.post(`/lessons/${lessonId}/complete`);
      return response.data;
    },

    trackTimeSpent: async (lessonId: string, timeSpent: number) => {
      const response = await api.post(`/lessons/${lessonId}/time-spent`, { timeSpent });
      return response.data;
    },

    getUserNotes: async (lessonId: string) => {
      const response = await api.get(`/lessons/${lessonId}/notes`);
      return response.data;
    },

    updateUserNotes: async (lessonId: string, notes: string) => {
      const response = await api.put(`/lessons/${lessonId}/notes`, { notes });
      return response.data;
    },
  },
};

export default api;
