import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionChecked: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setSessionChecked: (checked: boolean) => void;
  logout: () => void;
}

/**
 * 認証状態グローバルストア
 * Zustand + persist middleware で永続化
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      sessionChecked: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
          sessionChecked: true,
        }),

      setLoading: (loading) =>
        set({ isLoading: loading }),

      setSessionChecked: (checked) =>
        set({ sessionChecked: checked }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          sessionChecked: true,
        }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
