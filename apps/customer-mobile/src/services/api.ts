import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/auth';
import { useAppStore } from '../store/app';

// ─── Configuration ───────────────────────────────────────────────────────────

const API_BASE_URL = 'https://api.linkmall.hk/v1';
const API_TIMEOUT = 15000;

// ─── API Client Instance ─────────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-App-Platform': 'mobile',
    'X-App-Version': '1.0.0',
  },
});

// ─── Request Interceptor ─────────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    const locale = useAppStore.getState().locale;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Set locale header for i18n responses
    config.headers['Accept-Language'] = locale === 'zh-TW' ? 'zh-Hant' : locale === 'zh-CN' ? 'zh-Hans' : 'en';

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 - token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, newRefreshToken } = response.data;
          useAuthStore.setState({
            token: accessToken,
            refreshToken: newRefreshToken,
          });

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, force logout
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ─── API Response Types ──────────────────────────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ─── Auth APIs ───────────────────────────────────────────────────────────────

export const authApi = {
  requestOtp: (phone: string, countryCode: string = '+852') =>
    apiClient.post<ApiResponse<{ expiresIn: number }>>('/auth/otp/request', {
      phone,
      countryCode,
    }),

  loginWithOtp: (phone: string, otp: string, countryCode: string = '+852') =>
    apiClient.post<ApiResponse<{
      accessToken: string;
      refreshToken: string;
      member: any;
    }>>('/auth/otp/verify', {
      phone,
      otp,
      countryCode,
    }),

  loginWithWechat: (code: string) =>
    apiClient.post<ApiResponse<{
      accessToken: string;
      refreshToken: string;
      member: any;
    }>>('/auth/wechat', { code }),

  loginWithApple: (identityToken: string) =>
    apiClient.post<ApiResponse<{
      accessToken: string;
      refreshToken: string;
      member: any;
    }>>('/auth/apple', { identityToken }),

  register: (data: {
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
  }) =>
    apiClient.post<ApiResponse<{
      accessToken: string;
      refreshToken: string;
      member: any;
    }>>('/auth/register', data),

  refreshToken: (refreshToken: string) =>
    apiClient.post<ApiResponse<{
      accessToken: string;
      refreshToken: string;
    }>>('/auth/refresh', { refreshToken }),

  resetPassword: (phone: string, otp: string, newPassword: string) =>
    apiClient.post<ApiResponse<void>>('/auth/reset-password', {
      phone,
      otp,
      newPassword,
    }),
};

// ─── Member APIs ─────────────────────────────────────────────────────────────

export const memberApi = {
  getProfile: () =>
    apiClient.get<ApiResponse<any>>('/member/profile'),

  updateProfile: (data: Partial<{
    displayName: string;
    email: string;
    gender: string;
    birthday: string;
    preferredLocale: string;
  }>) =>
    apiClient.put<ApiResponse<any>>('/member/profile', data),

  getStampBalance: () =>
    apiClient.get<ApiResponse<{
      balance: number;
      totalEarned: number;
      pendingStamps: number;
      expiringStamps: { amount: number; expiryDate: string };
    }>>('/member/stamps/balance'),

  getStampHistory: (params: {
    page?: number;
    pageSize?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) =>
    apiClient.get<ApiResponse<any[]>>('/member/stamps/history', { params }),

  getStampTransaction: (transactionId: string) =>
    apiClient.get<ApiResponse<any>>(`/member/stamps/transactions/${transactionId}`),

  getTierInfo: () =>
    apiClient.get<ApiResponse<{
      currentTier: string;
      stampsToNextTier: number;
      annualStamps: number;
      benefits: string[];
    }>>('/member/tier'),
};

// ─── Receipt / Scan APIs ─────────────────────────────────────────────────────

export const receiptApi = {
  submitReceipt: (data: {
    imageBase64: string;
    mallId: string;
    merchantId?: string;
  }) =>
    apiClient.post<ApiResponse<{
      receiptId: string;
      estimatedStamps: number;
      status: string;
    }>>('/receipts/submit', data),

  getReceiptStatus: (receiptId: string) =>
    apiClient.get<ApiResponse<{
      status: string;
      stamps: number;
      reviewNote?: string;
    }>>(`/receipts/${receiptId}/status`),
};

// ─── Campaign APIs ───────────────────────────────────────────────────────────

export const campaignApi = {
  getActiveCampaigns: (params?: {
    mallId?: string;
    type?: string;
    page?: number;
    pageSize?: number;
  }) =>
    apiClient.get<ApiResponse<any[]>>('/campaigns', { params }),

  getCampaignDetail: (campaignId: string) =>
    apiClient.get<ApiResponse<any>>(`/campaigns/${campaignId}`),
};

// ─── Coupon APIs ─────────────────────────────────────────────────────────────

export const couponApi = {
  getMyCoupons: (params?: {
    status?: 'active' | 'used' | 'expired';
    page?: number;
    pageSize?: number;
  }) =>
    apiClient.get<ApiResponse<any[]>>('/coupons/my', { params }),

  getCouponDetail: (couponId: string) =>
    apiClient.get<ApiResponse<any>>(`/coupons/${couponId}`),

  claimCoupon: (couponId: string) =>
    apiClient.post<ApiResponse<any>>(`/coupons/${couponId}/claim`),

  getAvailableCoupons: (params?: {
    mallId?: string;
    category?: string;
    page?: number;
    pageSize?: number;
  }) =>
    apiClient.get<ApiResponse<any[]>>('/coupons/available', { params }),
};

// ─── Lucky Draw APIs ─────────────────────────────────────────────────────────

export const luckyDrawApi = {
  getDrawInfo: (campaignId: string) =>
    apiClient.get<ApiResponse<{
      remainingChances: number;
      prizes: any[];
      history: any[];
    }>>(`/lucky-draw/${campaignId}/info`),

  play: (campaignId: string) =>
    apiClient.post<ApiResponse<{
      prizeId: string;
      prizeName: string;
      isWin: boolean;
    }>>(`/lucky-draw/${campaignId}/play`),
};

// ─── Gift / Redemption APIs ──────────────────────────────────────────────────

export const giftApi = {
  getGiftCatalog: (params?: {
    category?: string;
    page?: number;
    pageSize?: number;
  }) =>
    apiClient.get<ApiResponse<any[]>>('/gifts', { params }),

  getGiftDetail: (giftId: string) =>
    apiClient.get<ApiResponse<any>>(`/gifts/${giftId}`),

  redeemGift: (giftId: string, quantity: number) =>
    apiClient.post<ApiResponse<{
      redemptionCode: string;
      expiryDate: string;
    }>>(`/gifts/${giftId}/redeem`, { quantity }),
};

// ─── Mall APIs ───────────────────────────────────────────────────────────────

export const mallApi = {
  getMalls: (params?: {
    latitude?: number;
    longitude?: number;
  }) =>
    apiClient.get<ApiResponse<any[]>>('/malls', { params }),

  getMallDetail: (mallId: string) =>
    apiClient.get<ApiResponse<any>>(`/malls/${mallId}`),

  getMerchants: (params: {
    mallId: string;
    category?: string;
    floor?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) =>
    apiClient.get<ApiResponse<any[]>>('/merchants', { params }),

  getMerchantDetail: (merchantId: string) =>
    apiClient.get<ApiResponse<any>>(`/merchants/${merchantId}`),

  getFloorPlan: (mallId: string, floor: string) =>
    apiClient.get<ApiResponse<{ imageUrl: string }>>(`/malls/${mallId}/floor-plan/${floor}`),
};

// ─── Parking APIs ────────────────────────────────────────────────────────────

export const parkingApi = {
  queryParkingFee: (mallId: string, licensePlate: string) =>
    apiClient.get<ApiResponse<{
      entryTime: string;
      duration: string;
      baseFee: number;
      memberDiscount: number;
      amountDue: number;
    }>>(`/parking/${mallId}/query`, {
      params: { licensePlate },
    }),
};

// ─── Notification APIs ───────────────────────────────────────────────────────

export const notificationApi = {
  getNotifications: (params?: {
    page?: number;
    pageSize?: number;
    unreadOnly?: boolean;
  }) =>
    apiClient.get<ApiResponse<any[]>>('/notifications', { params }),

  markAsRead: (notificationId: string) =>
    apiClient.put<ApiResponse<void>>(`/notifications/${notificationId}/read`),

  markAllAsRead: () =>
    apiClient.put<ApiResponse<void>>('/notifications/read-all'),

  getUnreadCount: () =>
    apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),

  registerPushToken: (token: string, platform: 'ios' | 'android') =>
    apiClient.post<ApiResponse<void>>('/notifications/push-token', {
      token,
      platform,
    }),
};

// ─── Favorites APIs ──────────────────────────────────────────────────────────

export const favoritesApi = {
  getFavorites: () =>
    apiClient.get<ApiResponse<any[]>>('/favorites'),

  addFavorite: (merchantId: string) =>
    apiClient.post<ApiResponse<void>>(`/favorites/${merchantId}`),

  removeFavorite: (merchantId: string) =>
    apiClient.delete<ApiResponse<void>>(`/favorites/${merchantId}`),
};

// ─── Export ──────────────────────────────────────────────────────────────────

export default apiClient;

export const api = {
  auth: authApi,
  member: memberApi,
  receipt: receiptApi,
  campaign: campaignApi,
  coupon: couponApi,
  luckyDraw: luckyDrawApi,
  gift: giftApi,
  mall: mallApi,
  parking: parkingApi,
  notification: notificationApi,
  favorites: favoritesApi,
};
