import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Locale } from '@link-reit/i18n';

export interface SystemInfo {
  platform: string;
  model: string;
  system: string;
  statusBarHeight: number;
  screenWidth: number;
  screenHeight: number;
  windowWidth: number;
  windowHeight: number;
  safeAreaBottom: number;
  pixelRatio: number;
}

export const useAppStore = defineStore('app', () => {
  // State
  const locale = ref<Locale>('zh-TW');
  const systemInfo = ref<SystemInfo>({
    platform: '',
    model: '',
    system: '',
    statusBarHeight: 0,
    screenWidth: 375,
    screenHeight: 667,
    windowWidth: 375,
    windowHeight: 667,
    safeAreaBottom: 0,
    pixelRatio: 2,
  });
  const networkType = ref<string>('wifi');
  const isTabBarPage = ref(true);
  const globalLoading = ref(false);

  // Getters
  const isZhCN = computed(() => locale.value === 'zh-CN');
  const isZhTW = computed(() => locale.value === 'zh-TW');
  const isEn = computed(() => locale.value === 'en');
  const navBarHeight = computed(() => systemInfo.value.statusBarHeight + 44);
  const localeName = computed(() => {
    const names: Record<Locale, string> = {
      'zh-CN': '简体中文',
      'zh-TW': '繁體中文',
      en: 'English',
    };
    return names[locale.value];
  });

  // Actions
  function setLocale(newLocale: Locale) {
    locale.value = newLocale;
    uni.setStorageSync('locale', newLocale);
  }

  function initSystemInfo() {
    try {
      const info = uni.getSystemInfoSync();
      systemInfo.value = {
        platform: info.platform || '',
        model: info.model || '',
        system: info.system || '',
        statusBarHeight: info.statusBarHeight || 0,
        screenWidth: info.screenWidth || 375,
        screenHeight: info.screenHeight || 667,
        windowWidth: info.windowWidth || 375,
        windowHeight: info.windowHeight || 667,
        safeAreaBottom: info.safeArea
          ? info.screenHeight - info.safeArea.bottom
          : 0,
        pixelRatio: info.pixelRatio || 2,
      };
    } catch (e) {
      console.warn('[AppStore] Failed to get system info:', e);
    }

    // Listen for network changes
    uni.getNetworkType({
      success: (res) => {
        networkType.value = res.networkType;
      },
    });

    uni.onNetworkStatusChange((res) => {
      networkType.value = res.networkType;
      if (!res.isConnected) {
        uni.showToast({
          title: locale.value === 'en' ? 'No network' : '網絡已斷開',
          icon: 'none',
        });
      }
    });
  }

  function setGlobalLoading(loading: boolean) {
    globalLoading.value = loading;
    if (loading) {
      uni.showLoading({ title: '' });
    } else {
      uni.hideLoading();
    }
  }

  return {
    // State
    locale,
    systemInfo,
    networkType,
    isTabBarPage,
    globalLoading,
    // Getters
    isZhCN,
    isZhTW,
    isEn,
    navBarHeight,
    localeName,
    // Actions
    setLocale,
    initSystemInfo,
    setGlobalLoading,
  };
});
