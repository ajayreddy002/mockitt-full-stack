/* eslint-disable @typescript-eslint/no-explicit-any */
import type { StateCreator } from 'zustand';
import type { RootState } from '../index';
import { mockittAPI } from '../../services/api';

interface Quiz {
  id: string;
  title: string;
  description?: string;
  type: string;
  difficulty: string;
  duration?: number;
  passingScore: number;
  maxAttempts: number;
  timeLimit: boolean;
  showResults: boolean;
  allowReview: boolean;
  questions: Question[];
}

interface Question {
  id: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'MULTIPLE_SELECT' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options?: string[];
  points: number;
  orderIndex: number;
  difficulty: string;
}

interface QuizAttempt {
  id: string;
  score: number;
  maxScore: number;
  passed: boolean;
  startedAt: string;
  completedAt?: string;
  timeSpent?: number;
  attemptNumber: number;
}

interface QuizResults {
  attempt: QuizAttempt;
  responses: {
    questionId: string;
    question: string;
    userAnswer: any;
    correctAnswer: any;
    isCorrect: boolean;
    pointsEarned: number;
    explanation?: string;
  }[];
  quiz: {
    id: string;
    title: string;
    passingScore: number;
    allowReview: boolean;
  };
}

export interface QuizSlice {
  // State
  currentQuiz: Quiz | null;
  currentAttempt: QuizAttempt | null;
  previousAttempts: QuizAttempt[];
  quizResults: QuizResults | null;
  answers: Record<string, any>;
  quizLoading: boolean;
  quizError: string | null;

  // Actions
  fetchQuiz: (quizId: string) => Promise<void>;
  fetchPreviousAttempts: (quizId: string) => Promise<void>;
  startQuizAttempt: (quizId: string) => Promise<void>;
  updateAnswer: (questionId: string, answer: any) => void;
  submitQuiz: (attemptId: string) => Promise<void>;
  fetchQuizResults: (attemptId: string) => Promise<void>;
  clearQuizError: () => void;
  resetQuiz: () => void;
}

export const quizSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  QuizSlice
> = (set, get) => ({
  // Initial state
  currentQuiz: null,
  currentAttempt: null,
  previousAttempts: [],
  quizResults: null,
  answers: {},
  quizLoading: false,
  quizError: null,

  // Actions
  fetchQuiz: async (quizId: string) => {
    set((state) => {
      state.quizLoading = true;
      state.quizError = null;
    });

    try {
      const quiz = await mockittAPI.quizzes.getById(quizId);
      
      set((state) => {
        state.currentQuiz = quiz;
        state.quizLoading = false;
      });
    } catch (error: any) {
      set((state) => {
        state.quizError = error.response?.data?.message || 'Failed to load quiz';
        state.quizLoading = false;
      });
      
      console.error('Quiz fetch error:', error);
    }
  },

  fetchPreviousAttempts: async (quizId: string) => {
    try {
      const attempts = await mockittAPI.quizzes.getAttempts(quizId);
      
      set((state) => {
        state.previousAttempts = attempts;
      });
    } catch (error: any) {
      set((state) => {
        state.quizError = error.response?.data?.message || 'Failed to load attempts';
      });
      
      console.error('Attempts fetch error:', error);
    }
  },

  startQuizAttempt: async (quizId: string) => {
    set((state) => {
      state.quizLoading = true;
      state.quizError = null;
    });

    try {
      const attempt = await mockittAPI.quizzes.startAttempt(quizId);
      
      set((state) => {
        state.currentAttempt = attempt;
        state.answers = {}; // Reset answers for new attempt
        state.quizLoading = false;
      });
    } catch (error: any) {
      set((state) => {
        state.quizError = error.response?.data?.message || 'Failed to start quiz';
        state.quizLoading = false;
      });
      
      console.error('Start attempt error:', error);
      throw error; // Re-throw to handle in component
    }
  },

  updateAnswer: (questionId: string, answer: any) => {
    set((state) => {
      state.answers[questionId] = answer;
    });
  },

  submitQuiz: async (attemptId: string) => {
    set((state) => {
      state.quizLoading = true;
      state.quizError = null;
    });

    try {
      const responses = Object.entries(get().answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));

      const result = await mockittAPI.quizzes.submitAttempt(attemptId, responses);
      
      set((state) => {
        state.quizLoading = false;
      });

      return result;
    } catch (error: any) {
      set((state) => {
        state.quizError = error.response?.data?.message || 'Failed to submit quiz';
        state.quizLoading = false;
      });
      
      console.error('Submit quiz error:', error);
      throw error; // Re-throw to handle in component
    }
  },

  fetchQuizResults: async (attemptId: string) => {
    set((state) => {
      state.quizLoading = true;
      state.quizError = null;
    });

    try {
      const results = await mockittAPI.quizzes.getResults(attemptId);
      
      set((state) => {
        state.quizResults = results;
        state.quizLoading = false;
      });
    } catch (error: any) {
      set((state) => {
        state.quizError = error.response?.data?.message || 'Failed to load results';
        state.quizLoading = false;
      });
      
      console.error('Results fetch error:', error);
    }
  },

  clearQuizError: () => {
    set((state) => {
      state.quizError = null;
    });
  },

  resetQuiz: () => {
    set((state) => {
      state.currentQuiz = null;
      state.currentAttempt = null;
      state.previousAttempts = [];
      state.quizResults = null;
      state.answers = {};
      state.quizError = null;
    });
  },
});
