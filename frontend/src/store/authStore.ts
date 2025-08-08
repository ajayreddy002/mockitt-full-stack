import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '../services/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setAuth: (token: string, user: User) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ 
          token, 
          user, 
          isAuthenticated: true, 
          error: null 
        });
      },

      clearAuth: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        set({ 
          token: null, 
          user: null, 
          isAuthenticated: false, 
          error: null 
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        set({ 
          token: null, 
          user: null, 
          isAuthenticated: false, 
          error: null 
        });
        window.location.href = '/login';
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
