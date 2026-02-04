import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '@link-reit/i18n';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  roles: string[];
  permissions: string[];
  entityType: 'group';
  entityId: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  locale: Locale;
  isAuthenticated: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  setLocale: (locale: Locale) => void;
  updateUser: (user: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      locale: 'zh-CN',
      isAuthenticated: false,

      login: (user: AuthUser, token: string) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),

      setLocale: (locale: Locale) =>
        set({ locale }),

      updateUser: (updates: Partial<AuthUser>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'link-reit-group-admin-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        locale: state.locale,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
