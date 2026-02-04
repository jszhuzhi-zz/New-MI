import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/services/api';
import { wechatLogin, getWechatUserProfile } from '@/services/wechat';
import type { Locale } from '@link-reit/i18n';

/** Member profile shape for mini-program use */
export interface MiniMemberProfile {
  id: string;
  memberCardNo: string;
  displayName: string;
  avatar: string;
  phone: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  tierId: string;
  tierName: string;
  tierLevel: number;
  stampBalance: number;
  lifetimeStampsEarned: number;
  preferredLocale: Locale;
  qrCode: string;
  barcode: string;
  cardBackgroundColor: string;
  cardTextColor: string;
  cardBackgroundImage: string;
  unreadMessageCount: number;
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string>('');
  const user = ref<MiniMemberProfile | null>(null);
  const isLoading = ref(false);
  const loginError = ref<string>('');

  // Getters
  const isLoggedIn = computed(() => !!token.value && !!user.value);
  const memberCardNo = computed(() => user.value?.memberCardNo ?? '');
  const displayName = computed(() => user.value?.displayName ?? '');
  const stampBalance = computed(() => user.value?.stampBalance ?? 0);
  const tierName = computed(() => user.value?.tierName ?? '');
  const tierLevel = computed(() => user.value?.tierLevel ?? 0);
  const qrCode = computed(() => user.value?.qrCode ?? '');
  const unreadCount = computed(() => user.value?.unreadMessageCount ?? 0);

  // Actions
  function setToken(newToken: string) {
    token.value = newToken;
    uni.setStorageSync('token', newToken);
  }

  function clearAuth() {
    token.value = '';
    user.value = null;
    uni.removeStorageSync('token');
    uni.removeStorageSync('user');
  }

  /** WeChat one-tap login flow */
  async function loginWithWeChat(): Promise<boolean> {
    isLoading.value = true;
    loginError.value = '';
    try {
      // Step 1: Get wx.login code
      const wxCode = await wechatLogin();

      // Step 2: Send code to backend for session exchange
      const res = await api.post<{
        token: string;
        isNewUser: boolean;
        needsPhone: boolean;
        member: MiniMemberProfile | null;
      }>('/auth/wechat-login', { code: wxCode });

      if (res.token) {
        setToken(res.token);
      }

      if (res.isNewUser || res.needsPhone) {
        // Redirect to phone binding
        uni.navigateTo({ url: '/pages/auth/bindPhone' });
        return false;
      }

      if (res.member) {
        user.value = res.member;
        uni.setStorageSync('user', JSON.stringify(res.member));
      }

      isLoading.value = false;
      return true;
    } catch (err: any) {
      loginError.value = err.message || 'Login failed';
      isLoading.value = false;
      return false;
    }
  }

  /** Fetch current user profile from backend */
  async function fetchUserProfile(): Promise<void> {
    const res = await api.get<MiniMemberProfile>('/member/profile');
    user.value = res;
    uni.setStorageSync('user', JSON.stringify(res));
  }

  /** Update user profile */
  async function updateProfile(data: Partial<MiniMemberProfile>): Promise<void> {
    await api.put('/member/profile', data);
    await fetchUserProfile();
  }

  /** Bind phone number using WeChat getPhoneNumber */
  async function bindPhone(encryptedData: string, iv: string): Promise<boolean> {
    try {
      const res = await api.post<{ success: boolean; member: MiniMemberProfile }>('/auth/bind-phone', {
        encryptedData,
        iv,
        token: token.value,
      });

      if (res.success && res.member) {
        user.value = res.member;
        uni.setStorageSync('user', JSON.stringify(res.member));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /** Logout */
  function logout() {
    clearAuth();
    uni.reLaunch({ url: '/pages/auth/login' });
  }

  // Restore user from local storage on init
  function restoreFromStorage() {
    const cachedUser = uni.getStorageSync('user');
    if (cachedUser) {
      try {
        user.value = JSON.parse(cachedUser);
      } catch {
        // invalid data
      }
    }
  }

  restoreFromStorage();

  return {
    // State
    token,
    user,
    isLoading,
    loginError,
    // Getters
    isLoggedIn,
    memberCardNo,
    displayName,
    stampBalance,
    tierName,
    tierLevel,
    qrCode,
    unreadCount,
    // Actions
    setToken,
    clearAuth,
    loginWithWeChat,
    fetchUserProfile,
    updateProfile,
    bindPhone,
    logout,
  };
});
