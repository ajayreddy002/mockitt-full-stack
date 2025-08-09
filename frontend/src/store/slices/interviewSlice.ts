/* eslint-disable @typescript-eslint/no-explicit-any */
import { type StateCreator } from 'zustand';
import { type RootState } from '../index';
import { mockittAPI } from '../../services/api';
import type {
  InterviewSession,
  InterviewQuestion,
  InterviewResponse,
} from '../../types/interview';

export interface InterviewSlice {
  // State
  currentSession: InterviewSession | null;
  sessions: InterviewSession[];
  questions: InterviewQuestion[];
  responses: InterviewResponse[];
  pendingResponses: InterviewResponse[]
  isRecording: boolean;
  isSessionActive: boolean;
  sessionLoading: boolean;
  questionBank: InterviewQuestion[];
  currentTimer: number;
  mediaStream: MediaStream | null;
  questionAnswers: Record<string, {
    transcription: string;
    answerType: 'text' | 'audio';
    duration: number;
    lastUpdated: Date;
  }>;

  // API Actions - All connected to backend
  fetchSessions: () => Promise<void>;
  createSession: (sessionData: {
    title: string;
    type: 'PRACTICE' | 'FULL_MOCK' | 'QUICK_PREP';
    settings: {
      recordVideo: boolean;
      recordAudio: boolean;
      enableHints: boolean;
      timePerQuestion: number;
      industry: string;
      role: string;
    };
  }) => Promise<InterviewSession>;
  getSession: (sessionId: string) => Promise<InterviewSession>;
  startSession: (sessionId: string) => Promise<void>;
  endSession: (sessionId: string) => Promise<void>;
  recordResponse: (responseData: {
    sessionId: string;
    questionId: string;
    question: string;
    transcription?: string;
    audioUrl?: string;
    videoUrl?: string;
    duration: number;
  }) => Promise<void>;
  updateSession: (sessionId: string, updates: Partial<InterviewSession>) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  getSessionResults: (sessionId: string) => Promise<any>;

  // Helper Actions
  nextQuestion: () => void;
  previousQuestion: () => void;
  setCurrentSession: (session: InterviewSession | null) => void;
  resetSession: () => void;
  setMediaStream: (stream: MediaStream | null) => void;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  generateRealTimeAnalysis: (transcription: string, questionId: string) => Promise<any>;
  generateInstantTips: (currentResponse: string) => Promise<string[]>;
  generateFollowUp: (questionId: string, response: string) => Promise<string>;
  generateAdaptiveQuestion: (previousResponses: any[], targetRole: string, weakAreas: string[]) => Promise<any>;
  savePendingResponse: (response: Partial<InterviewResponse>) => void;
  submitAllResponses: (sessionId: string) => Promise<void>;
  saveQuestionAnswer: (questionId: string, answer: any) => void;
  getQuestionAnswer: (questionId: string) => any | null;
  clearQuestionAnswers: () => void;
}

export const interviewSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  InterviewSlice
> = (set, get) => ({
  // Initial State
  currentSession: null,
  sessions: [],
  questions: [],
  responses: [],
  pendingResponses: [],
  isRecording: false,
  isSessionActive: false,
  sessionLoading: false,
  questionBank: [],
  currentTimer: 0,
  mediaStream: null,
  questionAnswers: {},

  // ✅ API Actions - All connected to your NestJS backend
  fetchSessions: async () => {
    set((state) => {
      state.sessionLoading = true;
    });

    try {
      const { sessions } = await mockittAPI.interviews.getSessions();

      set((state) => {
        state.sessions = sessions;
        state.sessionLoading = false;
      });
    } catch (error) {
      set((state) => {
        state.sessionLoading = false;
      });
      get().handleApiError(error, 'fetchSessions');
    }
  },

  createSession: async (sessionData) => {
    set((state) => {
      state.sessionLoading = true;
    });

    try {
      // Backend generates AI questions automatically
      const session = await mockittAPI.interviews.createSession(sessionData);

      set((state) => {
        state.sessions.unshift(session);
        state.currentSession = session;
        state.questions = session.questions; // Questions from backend
        state.sessionLoading = false;
      });

      return session;
    } catch (error) {
      set((state) => {
        state.sessionLoading = false;
      });
      get().handleApiError(error, 'createSession');
      throw error;
    }
  },

  getSession: async (sessionId: string) => {
    try {
      const session = await mockittAPI.interviews.getSession(sessionId);

      set((state) => {
        state.currentSession = session;
        state.questions = session.questions; // Questions from backend
        state.responses = session.responses || [];
      });

      return session;
    } catch (error) {
      get().handleApiError(error, 'getSession');
      throw error;
    }
  },

  startSession: async (sessionId: string) => {
    try {
      const session = await mockittAPI.interviews.startSession(sessionId);

      set((state) => {
        state.currentSession = session;
        state.isSessionActive = true;
        state.currentTimer = session.settings.timePerQuestion;
      });
    } catch (error) {
      get().handleApiError(error, 'startSession');
    }
  },

  endSession: async (sessionId: string) => {
    try {
      const session = await mockittAPI.interviews.endSession(sessionId);

      set((state) => {
        state.currentSession = session;
        state.isSessionActive = false;
        state.currentTimer = 0;
      });
    } catch (error) {
      get().handleApiError(error, 'endSession');
    }
  },

  recordResponse: async (responseData) => {
    try {
      const response = await mockittAPI.interviews.saveResponse(responseData);

      set((state) => {
        state.responses.push(response);
      });
    } catch (error) {
      get().handleApiError(error, 'recordResponse');
    }
  },

  updateSession: async (sessionId: string, updates) => {
    try {
      await mockittAPI.interviews.updateSession(sessionId, updates);

      set((state) => {
        const index = state.sessions.findIndex(s => s.id === sessionId);
        if (index !== -1) {
          state.sessions[index] = { ...state.sessions[index], ...updates };
        }
        if (state.currentSession?.id === sessionId) {
          state.currentSession = { ...state.currentSession, ...updates };
        }
      });
    } catch (error) {
      get().handleApiError(error, 'updateSession');
    }
  },

  deleteSession: async (sessionId: string) => {
    try {
      await mockittAPI.interviews.deleteSession(sessionId);

      set((state) => {
        state.sessions = state.sessions.filter(s => s.id !== sessionId);
        if (state.currentSession?.id === sessionId) {
          state.currentSession = null;
        }
      });
    } catch (error) {
      get().handleApiError(error, 'deleteSession');
    }
  },

  getSessionResults: async (sessionId: string) => {
    try {
      const results = await mockittAPI.interviews.getResults(sessionId);
      return results;
    } catch (error) {
      get().handleApiError(error, 'getSessionResults');
      throw error;
    }
  },

  // Helper Actions (UI State Management)
  nextQuestion: () => {
    set((state) => {
      if (state.currentSession && state.currentSession.currentQuestionIndex < state.questions.length - 1) {
        state.currentSession.currentQuestionIndex += 1;
        state.currentTimer = state.currentSession.settings.timePerQuestion;
      }
    });
  },

  previousQuestion: () => {
    set((state) => {
      if (state.currentSession && state.currentSession.currentQuestionIndex > 0) {
        state.currentSession.currentQuestionIndex -= 1;
        state.currentTimer = state.currentSession.settings.timePerQuestion;
      }
    });
  },

  setCurrentSession: (session: InterviewSession | null) => {
    set((state) => {
      state.currentSession = session;
      if (session) {
        state.questions = session.questions; // Questions from backend
        state.responses = session.responses || [];
      }
    });
  },

  resetSession: () => {
    set((state) => {
      state.currentSession = null;
      state.questions = [];
      state.responses = [];
      state.isSessionActive = false;
      state.currentTimer = 0;
    });
  },

  setMediaStream: (stream: MediaStream | null) => {
    set((state) => {
      state.mediaStream = stream;
    });
  },

  startTimer: () => {
    // Timer implementation using setInterval
    const timer = setInterval(() => {
      set((state) => {
        if (state.currentTimer > 0) {
          state.currentTimer -= 1;
        } else {
          clearInterval(timer);
        }
      });
    }, 1000);
  },

  stopTimer: () => {
    set(() => {
      // Timer stopped, keep current value
    });
  },

  resetTimer: () => {
    set((state) => {
      if (state.currentSession) {
        state.currentTimer = state.currentSession.settings.timePerQuestion;
      }
    });
  },

  generateRealTimeAnalysis: async (transcription: string, questionId: string) => {
    try {
      const currentSession = get().currentSession;
      if (!currentSession) return null;

      const question = currentSession.questions.find(q => q.id === questionId);
      if (!question) return null;

      const analysis = await mockittAPI.ai.analyzeRealTime({
        spokenText: transcription,
        currentQuestion: question.question,
        targetRole: currentSession.settings.role,
        industry: currentSession.settings.industry,
      });

      return analysis;
    } catch (error) {
      get().handleApiError(error, 'generateRealTimeAnalysis');
      return null;
    }
  },
  generateInstantTips: async (currentResponse: string) => {
    try {
      const currentSession = get().currentSession;
      if (!currentSession) return [];

      const tips = await mockittAPI.ai.getInstantTips({
        currentResponse,
        context: {
          targetRole: currentSession.settings.role,
          industry: currentSession.settings.industry,
        }
      });

      return tips.tips || [];
    } catch (error) {
      get().handleApiError(error, 'generateInstantTips');
      return [];
    }
  },

  generateFollowUp: async (questionId: string, response: string) => {
    try {
      const currentSession = get().currentSession;
      if (!currentSession) return '';

      const question = currentSession.questions.find(q => q.id === questionId);
      if (!question) return '';

      const followUp = await mockittAPI.ai.generateFollowUp({
        originalQuestion: question.question,
        userResponse: response,
        context: {
          targetRole: currentSession.settings.role,
          industry: currentSession.settings.industry,
        }
      });

      return followUp.followUpQuestion || '';
    } catch (error) {
      get().handleApiError(error, 'generateFollowUp');
      return '';
    }
  },
  generateAdaptiveQuestion: async (previousResponses: any[], targetRole: string, weakAreas: string[]) => {
    try {
      const currentSession = get().currentSession;
      if (!currentSession) return null;

      const adaptiveQuestionData = await mockittAPI.ai.generateAdaptiveQuestion({
        previousResponses,
        targetRole,
        difficulty: 'medium',
        weakAreas
      });

      return adaptiveQuestionData;
    } catch (error) {
      get().handleApiError(error, 'generateAdaptiveQuestion');
      return null;
    }
  },
  savePendingResponse: (response: Partial<InterviewResponse>) => {
    set((state) => {
      const existingIndex = state.pendingResponses.findIndex(
        r => r.questionId === response.questionId
      );
      
      if (existingIndex >= 0) {
        // Update existing response
        state.pendingResponses[existingIndex] = {
          ...state.pendingResponses[existingIndex],
          ...response
        };
      } else {
        // Add new response
        state.pendingResponses.push({
          id: `temp-${Date.now()}`,
          questionId: response.questionId!,
          question: response.question!,
          transcription: response.transcription || '',
          duration: response.duration || 0,
          recordedAt: new Date(),
          ...response
        } as InterviewResponse);
      }
    });
  },

  submitAllResponses: async (sessionId: string) => {
    const responses = get().pendingResponses;
    
    if (responses.length === 0) return;

    try {
      // Send batch API request
      await mockittAPI.interviews.submitBatchResponses(sessionId, responses);
      
      // Clear pending responses after successful submission
      set((state) => {
        state.pendingResponses = [];
      });
      
      get().addNotification({
        type: 'success',
        title: 'Interview Completed!',
        message: `Successfully submitted ${responses.length} responses.`
      });
    } catch (error) {
      get().handleApiError(error, 'submitAllResponses');
      throw error;
    }
  },
  saveQuestionAnswer: (questionId: string, answer: any) => {
    set((state) => {
      state.questionAnswers[questionId] = {
        transcription: answer.transcription || '',
        answerType: answer.answerType || 'text',
        duration: answer.duration || 0,
        lastUpdated: new Date()
      };
    });
  },

  // ✅ Get specific question answer
  getQuestionAnswer: (questionId: string) => {
    const state = get();
    return state.questionAnswers[questionId] || null;
  },

  // ✅ Clear all answers (for new session)
  clearQuestionAnswers: () => {
    set((state) => {
      state.questionAnswers = {};
    });
  },

});
