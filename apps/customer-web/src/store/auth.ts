import { create } from 'zustand';

export type Locale = 'zh-CN' | 'zh-TW' | 'en';

// 商场信息接口
export interface MallInfo {
  id: string;
  name: string;
  nameTW: string;
  nameEN: string;
  address: string;
  addressEN: string;
  region: string;
  floors: string[];
  image?: string;
}

// 商户信息接口
export interface Merchant {
  id: string;
  mallId: string;
  name: string;
  nameTW?: string;
  floor: string;
  unit: string;
  category: string;
  subCategory: string;
  phone?: string;
  hours?: string;
  stampMultiplier: number;
  tags: string[];
}

interface AuthState {
  token: string | null;
  user: any | null;
  locale: Locale;
  isAuthenticated: boolean;
  currentMallId: string;
  setToken: (token: string | null) => void;
  setUser: (user: any) => void;
  setLocale: (locale: Locale) => void;
  setCurrentMall: (mallId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  locale: (localStorage.getItem('locale') as Locale) || 'zh-TW',
  isAuthenticated: !!localStorage.getItem('token'),
  currentMallId: localStorage.getItem('currentMallId') || 'fw',
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
  setCurrentMall: (mallId) => {
    localStorage.setItem('currentMallId', mallId);
    set({ currentMallId: mallId });
  },
  logout: () => {
    // Clear all user-related data for privacy protection
    const keysToRemove = [
      'token',
      'user',
      'favorites',
      'joinedCampaigns',
      'parkingPlates',
      'parkingHistory',
      'messages',
      'readMessages',
      'messages_read_status',
      'messages_deleted',
      'aiChatHistory',
      'feedbackHistory',
      'stampHistory',
      'couponHistory',
      'transactionHistory',
      'searchHistory',
      'recentViewed',
      'cartItems',
      'orderHistory',
      'notificationSettings',
      'userPreferences',
      'lotteryHistory',
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));
    // Also clear all session storage
    sessionStorage.clear();
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
