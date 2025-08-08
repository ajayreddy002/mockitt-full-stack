/* eslint-disable @typescript-eslint/no-explicit-any */
import type { StateCreator } from 'zustand';
import type { RootState } from '../index';

export interface AppError {
  id: string;
  type: 'validation' | 'network' | 'authentication' | 'server' | 'unknown';
  message: string;
  details?: string;
  timestamp: Date;
  component?: string;
}

export interface ErrorSlice {
  // State
  errors: AppError[];
  globalError: AppError | null;

  // Actions
  addError: (error: Omit<AppError, 'id' | 'timestamp'>) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
  setGlobalError: (error: AppError | null) => void;
  handleApiError: (error: any, component?: string) => void;
}

export const errorSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  ErrorSlice
> = (set, get) => ({
  // Initial state
  errors: [],
  globalError: null,

  // Actions
  addError: (error: Omit<AppError, 'id' | 'timestamp'>) => {
    const newError: AppError = {
      ...error,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };

    set((state) => {
      state.errors.push(newError);
    });

    // Auto-remove error after 5 seconds (unless it's a critical error)
    if (error.type !== 'authentication' && error.type !== 'server') {
      setTimeout(() => {
        get().removeError(newError.id);
      }, 5000);
    }
  },

  removeError: (id: string) => {
    set((state) => {
      state.errors = state.errors.filter((error) => error.id !== id);
    });
  },

  clearErrors: () => {
    set((state) => {
      state.errors = [];
      state.globalError = null;
    });
  },

  setGlobalError: (error: AppError | null) => {
    set((state) => {
      state.globalError = error;
    });
  },

  handleApiError: (error: any, component?: string) => {
    let errorMessage = 'An unexpected error occurred';
    let errorType: AppError['type'] = 'unknown';

    if (error.response) {
      // Server responded with error
      errorMessage = error.response.data?.message || error.message;
      if (error.response.status === 401) {
        errorType = 'authentication';
      } else if (error.response.status >= 500) {
        errorType = 'server';
      } else {
        errorType = 'validation';
      }
    } else if (error.request) {
      // Network error
      errorMessage = 'Network error. Please check your connection.';
      errorType = 'network';
    }

    get().addError({
      type: errorType,
      message: errorMessage,
      details: error.message,
      component,
    });
  },
});
