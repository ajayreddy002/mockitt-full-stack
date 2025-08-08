/* eslint-disable @typescript-eslint/no-explicit-any */
import { type StateCreator } from 'zustand';
import type { RootState } from '../index';
import { mockittAPI } from '../../services/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthSlice {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authError: string | null;

  // Actions
  signup: (userData: any) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setAuthLoading: (loading: boolean) => void;
  setAuthError: (error: string | null) => void;
  initializeAuth: () => void;
}

export const authSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  AuthSlice
// eslint-disable-next-line @typescript-eslint/no-unused-vars
> = (set, get) => ({
  // Initial state
  user: null,
  token: null,
  isAuthenticated: false,
  isAuthLoading: false,
  authError: null,

  // Actions
  signup: async (userData) => {
    set((state) => {
      state.isAuthLoading = true;
      state.authError = null;
    });

    try {
      const data = await mockittAPI.auth.register(userData);

      set((state) => {
        state.user = data.user;
        state.token = data.access_token;
        state.isAuthenticated = true;
        state.isAuthLoading = false;
      });

      // Persist to localStorage
      localStorage.setItem('authToken', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (error: any) {
      set((state) => {
        state.authError = error.response?.data?.message || error.message;
        state.isAuthLoading = false;
      });
      throw error;
    }
  },
  login: async (email: string, password: string) => {
    set((state) => {
      state.isAuthLoading = true;
      state.authError = null;
    });

    try {
      const data = await mockittAPI.auth.login(email, password);

      set((state) => {
        state.user = data.user;
        state.token = data.access_token;
        state.isAuthenticated = true;
        state.isAuthLoading = false;
      });

      // Persist to localStorage
      localStorage.setItem('authToken', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (error: any) {
      set((state) => {
        state.authError = error.response?.data?.message || error.message;
        state.isAuthLoading = false;
      });
      throw error;
    }
  },

  logout: () => {
    console.log('Logging out...');
    set((state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.authError = null;
    });

    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // window.location.href = '/login';
  },

  setUser: (user: User) => {
    set((state) => {
      state.user = user;
    });
  },

  setToken: (token: string) => {
    set((state) => {
      state.token = token;
      state.isAuthenticated = true;
    });
  },

  setAuthLoading: (loading: boolean) => {
    set((state) => {
      state.isAuthLoading = loading;
    });
  },

  setAuthError: (error: string | null) => {
    set((state) => {
      state.authError = error;
    });
  },

  initializeAuth: () => {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set((state) => {
          state.token = token;
          state.user = user;
          state.isAuthenticated = true;
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
  },
});
