import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/auth';

// ─── Configuration ───────────────────────────────────────────────────────────

const API_BASE_URL = '/api';
const API_TIMEOUT = 15000;

// ─── API Client Instance ─────────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-App-Platform': 'web',
    'X-App-Version': '2.0.0',
  },
});

// ─── Request Interceptor ─────────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    const locale = useAuthStore.getState().locale;

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
    // Handle 401 - token expired
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
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

// ─── Feedback / AI Customer Service APIs ────────────────────────────────────

export const feedbackApi = {
  createFeedback: (data: {
    projectId: string;
    category?: string;
    title?: string;
    isAnonymous?: boolean;
    contactInfo?: { name?: string; phone?: string; email?: string };
  }) =>
    apiClient.post<ApiResponse<any>>('/feedback', data),

  createAnonymousFeedback: (data: {
    projectId: string;
    category?: string;
    contactInfo?: { name?: string; phone?: string; email?: string };
  }) =>
    apiClient.post<ApiResponse<any>>('/feedback/anonymous', data),

  getMyFeedbacks: (params?: {
    status?: string;
    page?: number;
    pageSize?: number;
  }) =>
    apiClient.get<ApiResponse<any>>('/feedback/my', { params }),

  getFeedback: (feedbackId: string) =>
    apiClient.get<ApiResponse<any>>(`/feedback/${feedbackId}`),

  sendMessage: (feedbackId: string, content: string) =>
    apiClient.post<ApiResponse<{
      userMessage: any;
      assistantMessage: any;
    }>>(`/feedback/${feedbackId}/messages`, { content }),

  rateFeedback: (feedbackId: string, rating: number) =>
    apiClient.put<ApiResponse<any>>(`/feedback/${feedbackId}/rate`, { rating }),

  resolveFeedback: (feedbackId: string) =>
    apiClient.put<ApiResponse<any>>(`/feedback/${feedbackId}/resolve`),
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
  feedback: feedbackApi,
  favorites: favoritesApi,
};
