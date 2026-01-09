import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthTokens } from '../types';
import { authService } from '../services/authService';
import toast from '../utils/toast';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, passwordConfirm: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const tokens: AuthTokens = await authService.login({ email, password });
          localStorage.setItem('access_token', tokens.access);
          localStorage.setItem('refresh_token', tokens.refresh);
          
          const user = await authService.getProfile();
          set({ user, isAuthenticated: true, isLoading: false });
          toast.success(`Welcome back, ${user.username || user.email}! 👋`);
        } catch (error: unknown) {
          const errorMessage = toast.handleError('Login', error);
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      register: async (email: string, username: string, password: string, passwordConfirm: string) => {
        set({ isLoading: true, error: null });
        try {
          await authService.register({ email, username, password, password_confirm: passwordConfirm });
          toast.success('Account created successfully! 🎉');
          // Auto-login after registration
          await get().login(email, password);
        } catch (error: unknown) {
          const errorMessage = toast.handleError('Registration', error);
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false, error: null });
        toast.info('You have been logged out. See you soon! 👋');
      },

      fetchProfile: async () => {
        try {
          const user = await authService.getProfile();
          set({ user });
        } catch (error) {
          toast.logError('Fetch Profile', error);
          get().logout();
        }
      },

      updateProfile: async (data: Partial<User>) => {
        try {
          const user = await authService.updateProfile(data);
          set({ user });
          toast.success('Profile updated successfully! ✨');
        } catch (error: unknown) {
          const errorMessage = toast.handleError('Update Profile', error);
          set({ error: errorMessage });
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      initialize: async () => {
        const token = localStorage.getItem('access_token');
        if (token && get().isAuthenticated) {
          try {
            const user = await authService.getProfile();
            set({ user, isAuthenticated: true, isInitialized: true });
          } catch (error) {
            // Token is invalid, clear auth state
            toast.logError('Initialize Auth', error);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            set({ user: null, isAuthenticated: false, isInitialized: true });
          }
        } else {
          set({ isInitialized: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
