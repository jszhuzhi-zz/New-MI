import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '@link-reit/i18n';

export interface MerchantUser {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  phone: string;
  role: 'shop_manager' | 'shop_staff';
  permissions: string[];
  shopId: string;
  shopName: string;
  mallId: string;
  mallName: string;
}

interface AuthState {
  user: MerchantUser | null;
  token: string | null;
  locale: Locale;
  isAuthenticated: boolean;
  login: (user: MerchantUser, token: string) => void;
  logout: () => void;
  setLocale: (locale: Locale) => void;
  updateUser: (user: Partial<MerchantUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      locale: 'zh-CN',
      isAuthenticated: false,

      login: (user: MerchantUser, token: string) =>
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

      updateUser: (updates: Partial<MerchantUser>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'link-reit-merchant-portal-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        locale: state.locale,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
