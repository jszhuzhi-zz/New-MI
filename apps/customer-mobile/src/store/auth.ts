import { create } from 'zustand';

// ─── Types ───────────────────────────────────────────────────────────────────

export type MemberTierLevel = 'green' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface MemberProfile {
  id: string;
  memberId: string;
  cardNumber: string;
  phone: string;
  phoneCountryCode: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  displayName: string;
  avatarUrl?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
  tier: MemberTierLevel;
  tierName: string;
  tierNameZh: string;
  stampBalance: number;
  totalStampsEarned: number;
  stampsToNextTier: number;
  nextTier?: MemberTierLevel;
  joinDate: string;
  lastVisitDate?: string;
  favoriteMalls: string[];
  preferredLocale: string;
  notificationsEnabled: boolean;
  wechatBound: boolean;
  appleBound: boolean;
}

export interface AuthState {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  refreshToken: string | null;
  user: MemberProfile | null;

  // Actions
  loginWithOtp: (phone: string, otp: string, countryCode?: string) => Promise<void>;
  loginWithWechat: (code: string) => Promise<void>;
  loginWithApple: (identityToken: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  restoreSession: () => Promise<void>;
  updateProfile: (data: Partial<MemberProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  requestOtp: (phone: string, countryCode?: string) => Promise<void>;
  resetPassword: (phone: string, otp: string, newPassword: string) => Promise<void>;
}

export interface RegisterData {
  phone: string;
  countryCode: string;
  otp: string;
  displayName: string;
  email?: string;
  gender?: string;
  birthday?: string;
  preferredLocale?: string;
  agreeTerms: boolean;
  agreeMarketing: boolean;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockMemberProfile: MemberProfile = {
  id: 'usr_hk_28301',
  memberId: 'LM-2024-0088312',
  cardNumber: '6280 0123 4567 8901',
  phone: '91234567',
  phoneCountryCode: '+852',
  email: 'chan.tai.man@gmail.com',
  firstName: '大文',
  lastName: '陳',
  displayName: '陳大文',
  gender: 'male',
  birthday: '1990-05-15',
  tier: 'gold',
  tierName: 'Gold',
  tierNameZh: '金卡會員',
  stampBalance: 2680,
  totalStampsEarned: 12450,
  stampsToNextTier: 1320,
  nextTier: 'platinum',
  joinDate: '2023-03-10',
  lastVisitDate: '2024-01-28',
  favoriteMalls: ['mall_t1', 'mall_kcm', 'mall_stanley'],
  preferredLocale: 'zh-TW',
  notificationsEnabled: true,
  wechatBound: true,
  appleBound: false,
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: false,
  token: null,
  refreshToken: null,
  user: null,

  loginWithOtp: async (phone: string, otp: string, countryCode = '+852') => {
    set({ isLoading: true });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock validation
      if (otp !== '123456' && otp !== '888888') {
        throw new Error('Invalid OTP');
      }

      set({
        isAuthenticated: true,
        token: 'mock_jwt_token_hk_' + Date.now(),
        refreshToken: 'mock_refresh_token_hk_' + Date.now(),
        user: { ...mockMemberProfile, phone },
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  loginWithWechat: async (code: string) => {
    set({ isLoading: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      set({
        isAuthenticated: true,
        token: 'mock_jwt_wechat_' + Date.now(),
        refreshToken: 'mock_refresh_wechat_' + Date.now(),
        user: { ...mockMemberProfile, wechatBound: true },
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  loginWithApple: async (identityToken: string) => {
    set({ isLoading: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      set({
        isAuthenticated: true,
        token: 'mock_jwt_apple_' + Date.now(),
        refreshToken: 'mock_refresh_apple_' + Date.now(),
        user: { ...mockMemberProfile, appleBound: true },
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newProfile: MemberProfile = {
        ...mockMemberProfile,
        id: 'usr_hk_new_' + Date.now(),
        memberId: 'LM-2024-' + Math.floor(Math.random() * 9000000 + 1000000),
        phone: data.phone,
        phoneCountryCode: data.countryCode,
        email: data.email,
        displayName: data.displayName,
        gender: data.gender as any,
        birthday: data.birthday,
        tier: 'green',
        tierName: 'Green',
        tierNameZh: '綠卡會員',
        stampBalance: 0,
        totalStampsEarned: 0,
        stampsToNextTier: 500,
        nextTier: 'silver',
        joinDate: new Date().toISOString().split('T')[0],
        preferredLocale: data.preferredLocale || 'zh-TW',
      };

      set({
        isAuthenticated: true,
        token: 'mock_jwt_register_' + Date.now(),
        refreshToken: 'mock_refresh_register_' + Date.now(),
        user: newProfile,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    set({
      isAuthenticated: false,
      token: null,
      refreshToken: null,
      user: null,
    });
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      // Simulate checking secure storage for existing session
      await new Promise((resolve) => setTimeout(resolve, 800));
      // In production, would check SecureStore for token
      // For demo, start logged out
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  updateProfile: async (data: Partial<MemberProfile>) => {
    set({ isLoading: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const currentUser = get().user;
      if (currentUser) {
        set({
          user: { ...currentUser, ...data },
          isLoading: false,
        });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  refreshProfile: async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Re-fetch profile from API
      const currentUser = get().user;
      if (currentUser) {
        set({
          user: {
            ...currentUser,
            stampBalance: currentUser.stampBalance + Math.floor(Math.random() * 10),
          },
        });
      }
    } catch (error) {
      console.warn('Failed to refresh profile:', error);
    }
  },

  requestOtp: async (phone: string, countryCode = '+852') => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // In production, this calls the SMS OTP API
    console.log(`OTP sent to ${countryCode} ${phone}`);
  },

  resetPassword: async (phone: string, otp: string, newPassword: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (otp !== '123456') {
      throw new Error('Invalid OTP');
    }
  },
}));
