import { create } from 'zustand';

export type Locale = 'zh-CN' | 'zh-TW' | 'en';

interface AuthState {
  token: string | null;
  user: any | null;
  locale: Locale;
  isAuthenticated: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: any) => void;
  setLocale: (locale: Locale) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  locale: (localStorage.getItem('locale') as Locale) || 'zh-TW',
  isAuthenticated: !!localStorage.getItem('token'),
  setToken: (token) => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
    set({ token, isAuthenticated: !!token });
  },
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
  setLocale: (locale) => {
    localStorage.setItem('locale', locale);
    set({ locale });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
