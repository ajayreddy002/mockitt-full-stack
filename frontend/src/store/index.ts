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

// Combined store interface
export interface RootState extends AuthSlice, UISlice, ResumeSlice, ErrorSlice, InterviewSlice { }

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

// Initialize store on app startup
export const initializeStore = () => {
  const store = useStore.getState();
  store.initializeAuth();
};