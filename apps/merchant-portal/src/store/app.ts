import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '@link-reit/i18n';

type ThemeMode = 'light' | 'dark';

interface AppState {
  sidebarCollapsed: boolean;
  locale: Locale;
  theme: ThemeMode;
  breadcrumbs: { title: string; path?: string }[];
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: ThemeMode) => void;
  setBreadcrumbs: (breadcrumbs: { title: string; path?: string }[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      locale: 'zh-CN',
      theme: 'light',
      breadcrumbs: [],

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed: boolean) =>
        set({ sidebarCollapsed: collapsed }),

      setLocale: (locale: Locale) =>
        set({ locale }),

      setTheme: (theme: ThemeMode) =>
        set({ theme }),

      setBreadcrumbs: (breadcrumbs) =>
        set({ breadcrumbs }),
    }),
    {
      name: 'link-reit-merchant-portal-app',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        locale: state.locale,
        theme: state.theme,
      }),
    }
  )
);
