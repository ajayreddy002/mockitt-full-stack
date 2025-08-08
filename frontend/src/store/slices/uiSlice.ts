import { type StateCreator } from 'zustand';
import { type RootState } from '../index';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

export interface UISlice {
  // State
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  globalLoading: boolean;
  loadingStates: Record<string, boolean>;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  setGlobalLoading: (loading: boolean) => void;
  setLoadingState: (key: string, loading: boolean) => void;
  isLoading: (key: string) => boolean;
}

export const uiSlice: StateCreator<
  RootState,
  [['zustand/immer', never]],
  [],
  UISlice
> = (set, get) => ({
  // Initial state
  sidebarOpen: false,
  theme: 'light',
  notifications: [],
  globalLoading: false,
  loadingStates: {},

  // Actions
  toggleSidebar: () => {
    set((state) => {
      state.sidebarOpen = !state.sidebarOpen;
    });
  },

  setSidebarOpen: (open: boolean) => {
    set((state) => {
      state.sidebarOpen = open;
    });
  },

  setTheme: (theme: 'light' | 'dark') => {
    set((state) => {
      state.theme = theme;
    });
    localStorage.setItem('theme', theme);
  },

  addNotification: (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };

    set((state) => {
      state.notifications.push(newNotification);
    });

    // Auto-remove notification
    if (notification.duration !== 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, notification.duration || 5000);
    }
  },

  removeNotification: (id: string) => {
    set((state) => {
      state.notifications = state.notifications.filter((n) => n.id !== id);
    });
  },

  setGlobalLoading: (loading: boolean) => {
    set((state) => {
      state.globalLoading = loading;
    });
  },

  setLoadingState: (key: string, loading: boolean) => {
    set((state) => {
      if (loading) {
        state.loadingStates[key] = true;
      } else {
        delete state.loadingStates[key];
      }
    });
  },

  isLoading: (key: string) => {
    return get().loadingStates[key] || false;
  },
});
