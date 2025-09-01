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
  isEnrolled: boolean;
  userAttempts: number;
  attemptsRemaining: number;
  canAttempt: boolean;
  maxScore: number;
}

interface Question {
  id: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'MULTIPLE_SELECT' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options?: string[];
  points: number;
  orderIndex: number;
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
  quiz: {
    id: string;
    title: string;
    passingScore: number;
    allowReview: boolean;
    showResults: boolean;
  };
  results?: {
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    unansweredQuestions: number;
    detailedResponses?: {
      questionId: string;
      questionText: string;
      userAnswer: any;
      correctAnswer: any;
      isCorrect: boolean;
      pointsEarned: number;
      explanation?: string;
    }[];
  };
}

export interface QuizSlice {
  // State
  currentQuiz: Quiz | null;
  currentAttempt: any | null;
  previousAttempts: QuizAttempt[];
  quizResults: QuizResults | null;
  answers: Record<string, any>;
  quizLoading: boolean;
  quizError: string | null;

  // Actions
  fetchQuiz: (quizId: string) => Promise<void>;
  fetchPreviousAttempts: (quizId: string) => Promise<void>;
  startQuizAttempt: (quizId: string) => Promise<any>;
  updateAnswer: (questionId: string, answer: any) => void;
  submitQuestionAnswer: (attemptId: string, questionId: string, answer: any, timeSpent?: number) => Promise<void>;
  submitQuiz: (attemptId: string) => Promise<any>;
  fetchQuizResults: (attemptId: string) => Promise<void>;
  clearQuizError: () => void;
  resetQuiz: () => void;
  fetchUserAttempts: (quizId: string) => Promise<QuizAttempt[]>;
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

  // ✅ Enhanced fetch quiz with enrollment context
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
    }
  },

  // ✅ Enhanced previous attempts
  fetchPreviousAttempts: async (quizId: string) => {
    try {
      const attempts = await mockittAPI.quizzes.getUserAttempts(quizId);
      set((state) => {
        state.previousAttempts = attempts;
      });
    } catch (error: any) {
      set((state) => {
        state.quizError = error.response?.data?.message || 'Failed to load attempts';
      });
    }
  },

  // ✅ Enhanced start quiz with attempt data
  startQuizAttempt: async (quizId: string) => {
    set((state) => {
      state.quizLoading = true;
      state.quizError = null;
    });

    try {
      const attemptData = await mockittAPI.quizzes.startAttempt(quizId);
      set((state) => {
        state.currentAttempt = attemptData.attempt;
        state.currentQuiz = attemptData.quiz;
        state.answers = {}; // Reset answers for new attempt
        state.quizLoading = false;
      });
      return attemptData;
    } catch (error: any) {
      set((state) => {
        state.quizError = error.response?.data?.message || 'Failed to start quiz';
        state.quizLoading = false;
      });
      throw error;
    }
  },

  // ✅ Local answer storage
  updateAnswer: (questionId: string, answer: any) => {
    set((state) => {
      state.answers[questionId] = answer;
    });
  },

  // ✅ NEW: Submit individual question answer
  submitQuestionAnswer: async (attemptId: string, questionId: string, answer: any, timeSpent?: number) => {
    try {
      await mockittAPI.quizzes.answerQuestion(attemptId, questionId, answer, timeSpent);
      // Update local answer state as well
      set((state) => {
        state.answers[questionId] = answer;
      });
    } catch (error: any) {
      set((state) => {
        state.quizError = error.response?.data?.message || 'Failed to submit answer';
      });
      throw error;
    }
  },

  // ✅ Enhanced submit quiz (bulk or finish)
  submitQuiz: async (attemptId: string) => {
    set((state) => {
      state.quizLoading = true;
      state.quizError = null;
    });

    try {
      const answers = get().answers;
      let result;

      // Check if we have answers to submit in bulk
      if (Object.keys(answers).length > 0) {
        const responses = Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer,
        }));
        result = await mockittAPI.quizzes.submitAttempt(attemptId, responses);
      } else {
        // Just finish the attempt (answers already submitted individually)
        result = await mockittAPI.quizzes.finishAttempt(attemptId);
      }

      set((state) => {
        state.quizLoading = false;
        state.quizResults = result;
      });
      return result;
    } catch (error: any) {
      set((state) => {
        state.quizError = error.response?.data?.message || 'Failed to submit quiz';
        state.quizLoading = false;
      });
      throw error;
    }
  },

  // ✅ Enhanced fetch results
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
    }
  },

  // ✅ Clear errors
  clearQuizError: () => {
    set((state) => {
      state.quizError = null;
    });
  },

  // ✅ Reset quiz state
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

  // ✅ Enhanced user attempts
  fetchUserAttempts: async (quizId: string) => {
    try {
      const attempts = await mockittAPI.quizzes.getUserAttempts(quizId);
      set((state) => {
        state.previousAttempts = attempts;
      });
      return attempts;
    } catch (error: any) {
      set((state) => {
        state.quizError = error.response?.data?.message || 'Failed to load user attempts';
      });
      throw error;
    }
  },
});
