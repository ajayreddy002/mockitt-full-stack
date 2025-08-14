import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { authSlice, type AuthSlice } from './slices/authSlice';
import { uiSlice, type UISlice } from './slices/uiSlice';
import { resumeSlice, type ResumeSlice } from './slices/resumeSlice';
import { errorSlice, type ErrorSlice } from './slices/errorSlice';
import { interviewSlice, type InterviewSlice } from './slices/interviewSlice';
import { useShallow } from 'zustand/shallow';
import { dashboardSlice, type DashboardSlice } from './slices/dashboardSlice';
import { courseSlice, type CourseSlice } from './slices/courseSlice';
import { quizSlice, type QuizSlice } from './slices/quizzesSlice';
import { adminSlice, type AdminSlice } from './slices/adminSlice';
import { lessonSlice, type LessonSlice } from './slices/lessonSlice';

// Combined store interface
export interface RootState extends AuthSlice, UISlice, ResumeSlice, ErrorSlice, InterviewSlice, DashboardSlice, CourseSlice, QuizSlice, AdminSlice, LessonSlice { }

// Create the main store with all slices
export const useStore = create<RootState>()(
  devtools(
    subscribeWithSelector(
      immer((set, get, api) => ({
        // Combine all slices
        ...authSlice(set, get, api),
        ...uiSlice(set, get, api),
        ...resumeSlice(set, get, api),
        ...errorSlice(set, get, api),
        ...interviewSlice(set, get, api),
        ...dashboardSlice(set, get, api),
        ...courseSlice(set, get, api),
        ...quizSlice(set, get, api),
        ...adminSlice(set, get, api),
        ...lessonSlice(set, get, api),
      }))
    ),
    {
      name: 'mockitt-store', // Redux DevTools name
    }
  )
);

export const useAuth = () => useStore(
  useShallow((state) => ({
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isAuthLoading: state.isAuthLoading,
    authError: state.authError,
    signup: state.signup,
    login: state.login,
    logout: state.logout,
    setUser: state.setUser,
    setToken: state.setToken,
    setAuthLoading: state.setAuthLoading,
    setAuthError: state.setAuthError,
    initializeAuth: state.initializeAuth,
  }))
);

export const useUI = () => useStore(
  useShallow((state) => ({
    sidebarOpen: state.sidebarOpen,
    theme: state.theme,
    notifications: state.notifications,
    globalLoading: state.globalLoading,
    loadingStates: state.loadingStates,
    toggleSidebar: state.toggleSidebar,
    setSidebarOpen: state.setSidebarOpen,
    setTheme: state.setTheme,
    addNotification: state.addNotification,
    removeNotification: state.removeNotification,
    setGlobalLoading: state.setGlobalLoading,
    setLoadingState: state.setLoadingState,
    isLoading: state.isLoading,
  }))
);

export const useResumes = () => useStore(
  useShallow((state) => ({
    resumes: state.resumes,
    currentResume: state.currentResume,
    analysisResults: state.analysisResults,
    resumeLoading: state.resumeLoading,
    resumeError: state.resumeError,
    uploadProgress: state.uploadProgress,
    setResumes: state.setResumes,
    addResume: state.addResume,
    updateResume: state.updateResume,
    removeResume: state.removeResume,
    setCurrentResume: state.setCurrentResume,
    setAnalysisResult: state.setAnalysisResult,
    fetchResumes: state.fetchResumes,
    uploadResume: state.uploadResume,
    analyzeResume: state.analyzeResume,
    deleteResume: state.deleteResume,
  }))
);

export const useErrors = () => useStore(
  useShallow((state) => ({
    errors: state.errors,
    globalError: state.globalError,
    addError: state.addError,
    removeError: state.removeError,
    clearErrors: state.clearErrors,
    setGlobalError: state.setGlobalError,
    handleApiError: state.handleApiError,
  }))
);

export const useInterview = () => useStore(
  useShallow((state) => ({
    currentSession: state.currentSession,
    sessions: state.sessions,
    questions: state.questions,
    isRecording: state.isRecording,
    isSessionActive: state.isSessionActive,
    sessionLoading: state.sessionLoading,
    currentTimer: state.currentTimer,
    mediaStream: state.mediaStream,
    questionAnswers: state.questionAnswers,
    createSession: state.createSession,
    startSession: state.startSession,
    endSession: state.endSession,
    nextQuestion: state.nextQuestion,
    previousQuestion: state.previousQuestion,
    recordResponse: state.recordResponse,
    // generateQuestions: state.generateQuestions,
    setCurrentSession: state.setCurrentSession,
    // updateSessionSettings: state.updateSessionSettings,
    startTimer: state.startTimer,
    stopTimer: state.stopTimer,
    resetTimer: state.resetTimer,
    setMediaStream: state.setMediaStream,
    fetchSessions: state.fetchSessions,
    generateRealTimeAnalysis: state.generateRealTimeAnalysis,
    generateInstantTips: state.generateInstantTips,
    generateFollowUp: state.generateFollowUp,
    getSessionResults: state.getSessionResults,
    updateSession: state.updateSession,
    deleteSession: state.deleteSession,
    getSession: state.getSession,
    savePendingResponse: state.savePendingResponse,
    submitAllResponses: state.submitAllResponses,
    saveQuestionAnswer: state.saveQuestionAnswer,
    getQuestionAnswer: state.getQuestionAnswer,
    clearQuestionAnswers: state.clearQuestionAnswers,
  }))
);

export const useDashboard = () => useStore(
  useShallow((state) => ({
    // State - ✅ Use updated property names
    dashboardData: state.dashboardData,
    isLoading: state.dashboardLoading,  // ✅ Map to familiar name for component
    error: state.dashboardError,        // ✅ Map to familiar name for component
    lastUpdated: state.lastUpdated,

    // Actions
    fetchDashboardData: state.fetchDashboardData,
    fetchStats: state.fetchStats,
    fetchRecentActivity: state.fetchRecentActivity,
    refreshDashboard: state.refreshDashboard,
    clearDashboardError: state.clearDashboardError,
    markActivityAsRead: state.markActivityAsRead,
  }))
);

export const useCourses = () => useStore(
  useShallow((state) => ({
    courses: state.courses,
    userEnrollments: state.userEnrollments,
    currentCourse: state.currentCourse,
    coursesLoading: state.coursesLoading,
    coursesError: state.coursesError,
    enrolledCoursesData: state.enrolledCoursesData,
    fetchCourses: state.fetchCourses,
    fetchCourseById: state.fetchCourseById,
    enrollInCourse: state.enrollInCourse,
    updateProgress: state.updateProgress,
    clearCoursesError: state.clearCoursesError,
    updateCourseProgress: state.updateCourseProgress,
    fetchUserEnrollments: state.fetchUserEnrollments,
    isEnrolledInCourse: state.isEnrolledInCourse,
    getEnrolledCourseData: state.getEnrolledCourseData,
  }))
);

export const useQuiz = () => {
  return useStore(
    useShallow((state) => ({
      currentQuiz: state.currentQuiz,
      currentAttempt: state.currentAttempt,
      previousAttempts: state.previousAttempts,
      quizResults: state.quizResults,
      answers: state.answers,
      quizLoading: state.quizLoading,
      quizError: state.quizError,

      // Actions
      fetchQuiz: state.fetchQuiz,
      fetchPreviousAttempts: state.fetchPreviousAttempts,
      startQuizAttempt: state.startQuizAttempt,
      updateAnswer: state.updateAnswer,
      submitQuiz: state.submitQuiz,
      fetchQuizResults: state.fetchQuizResults,
      clearQuizError: state.clearQuizError,
      resetQuiz: state.resetQuiz,
    })));
};

export const useAdminStore = () => {
  return useStore(
    useShallow((state) => ({
      // Dashboard State
      dashboardStats: state.dashboardStats,
      
      // Course Management State
      courses: state.adminCourses, // ✅ Fixed property reference
      currentCourse: state.adminCurrentCourse, // ✅ Fixed property reference
      
      // User Management State - ✅ Missing properties added
      users: state.users,
      currentUser: state.currentUser,
      
      // Quiz Management State - ✅ Missing properties added
      quizzes: state.quizzes,
      adminCurrentQuiz: state.adminCurrentQuiz,
      
      // Loading & Error States
      loading: state.loading,
      error: state.error,

      // Dashboard Actions
      fetchDashboardStats: state.fetchDashboardStats,
      getAnalytics: state.getAnalytics, // ✅ Missing action added
      
      // Course Actions
      fetchCoursesForAdmin: state.fetchCoursesForAdmin,
      fetchCourseForEdit: state.fetchCourseForEdit,
      createCourse: state.createCourse,
      updateCourse: state.updateCourse,
      deleteCourse: state.deleteCourse,
      publishCourse: state.publishCourse,
      createCourseByAI: state.createCourseByAI,
      
      // Module & Lesson Management Actions - ✅ Missing actions added
      createModule: state.createModule,
      updateModule: state.updateModule,
      deleteModule: state.deleteModule,
      createLesson: state.createLesson,
      updateLesson: state.updateLesson,
      deleteLesson: state.deleteLesson,
      
      // User Management Actions - ✅ Missing actions added
      fetchUsers: state.fetchUsers,
      fetchUserById: state.fetchUserById,
      updateUser: state.updateUser,
      deleteUser: state.deleteUser,
      toggleUserPremium: state.toggleUserPremium,
      
      // Quiz Management Actions - ✅ Missing actions added
      fetchQuizzes: state.fetchQuizzes,
      fetchQuizById: state.fetchQuizById,
      createQuiz: state.createQuiz,
      updateQuiz: state.updateQuiz,
      deleteQuiz: state.deleteQuiz,
      addQuestion: state.addQuestion,
      updateQuestion: state.updateQuestion,
      deleteQuestion: state.deleteQuestion,
      createQuizByAI: state.createQuizByAI,
      
      // Utility Actions
      clearError: state.clearError,
    }))
  );
};

export const useLesson = () => {
  return useStore(
    useShallow((state) => ({
      currentLesson: state.currentLesson,
      lessonNavigation: state.lessonNavigation,
      lessonLoading: state.lessonLoading,
      lessonError: state.lessonError,
      
      // Actions
      fetchLessonById: state.fetchLessonById,
      fetchLessonNavigation: state.fetchLessonNavigation,
      updateLessonProgress: state.updateLessonProgress,
      markLessonComplete: state.markLessonComplete,
      updateLessonNotes: state.updateLessonNotes,
      trackTimeSpent: state.trackTimeSpent,
      clearLessonError: state.clearLessonError,
    }))
  );
};

// Initialize store on app startup
export const initializeStore = () => {
  const store = useStore.getState();
  store.initializeAuth();
};