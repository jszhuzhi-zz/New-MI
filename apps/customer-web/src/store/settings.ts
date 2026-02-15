import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Locale = 'zh-TW' | 'zh-CN' | 'en';
export type Theme = 'green' | 'blue' | 'purple' | 'gold';

interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
}

export const themeConfigs: Record<Theme, ThemeColors> = {
  green: {
    primary: '#00694B',
    primaryLight: '#00896B',
    primaryDark: '#004D36',
  },
  blue: {
    primary: '#1976D2',
    primaryLight: '#42A5F5',
    primaryDark: '#1565C0',
  },
  purple: {
    primary: '#7B1FA2',
    primaryLight: '#AB47BC',
    primaryDark: '#6A1B9A',
  },
  gold: {
    primary: '#C4A962',
    primaryLight: '#D4C482',
    primaryDark: '#A08942',
  },
};

interface SettingsState {
  locale: Locale;
  theme: Theme;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: Theme) => void;
  getThemeColors: () => ThemeColors;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      locale: 'zh-TW',
      theme: 'green',
      setLocale: (locale) => set({ locale }),
      setTheme: (theme) => set({ theme }),
      getThemeColors: () => themeConfigs[get().theme],
    }),
    {
      name: 'link-reit-settings',
    }
  )
);
