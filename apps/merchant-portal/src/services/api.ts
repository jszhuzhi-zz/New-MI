import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { useAuthStore } from '../store/auth';

const BASE_URL = '/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const locale = useAuthStore.getState().locale;
    config.headers['Accept-Language'] = locale;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Typed API methods
export const api = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then((res) => res.data),

  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then((res) => res.data),

  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config).then((res) => res.data),

  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config).then((res) => res.data),

  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then((res) => res.data),

  upload: <T = unknown>(url: string, formData: FormData) =>
    apiClient.post<T>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data),
};

// Merchant portal specific endpoints
export const merchantApi = {
  // Auth
  login: (data: { username: string; password: string }) =>
    api.post('/auth/merchant/login', data),
  loginSms: (data: { phone: string; code: string }) =>
    api.post('/auth/merchant/sms', data),
  sendSmsCode: (data: { phone: string }) =>
    api.post('/auth/merchant/sms/send', data),
  getProfile: () =>
    api.get('/merchant/profile'),

  // Dashboard
  getDashboardStats: () =>
    api.get('/merchant/dashboard/stats'),
  getDashboardTrends: (params?: unknown) =>
    api.get('/merchant/dashboard/trends', { params }),

  // Stamp management
  issueStamp: (data: {
    memberId: string;
    receiptAmount: number;
    receiptPhoto?: string;
    transactionRef?: string;
  }) => api.post('/merchant/stamps/issue', data),
  getStampRules: () =>
    api.get('/merchant/stamps/rules'),
  getStampTransactions: (params?: unknown) =>
    api.get('/merchant/stamps/transactions', { params }),
  getStampTransactionDetail: (id: string) =>
    api.get(`/merchant/stamps/transactions/${id}`),
  voidStampTransaction: (id: string, data: { reason: string }) =>
    api.post(`/merchant/stamps/transactions/${id}/void`, data),

  // Member lookup
  lookupMemberByQR: (data: { qrCode: string }) =>
    api.post('/merchant/members/lookup/qr', data),
  lookupMemberByPhone: (data: { phone: string }) =>
    api.post('/merchant/members/lookup/phone', data),
  lookupMemberByCard: (data: { cardNumber: string }) =>
    api.post('/merchant/members/lookup/card', data),
  getMemberProfile: (memberId: string) =>
    api.get(`/merchant/members/${memberId}`),
  getMemberStampBalance: (memberId: string) =>
    api.get(`/merchant/members/${memberId}/stamps`),

  // Coupon verification
  verifyCoupon: (data: { code: string }) =>
    api.post('/merchant/coupons/verify', data),
  redeemCoupon: (data: { code: string; memberId: string }) =>
    api.post('/merchant/coupons/redeem', data),
  getCouponRedemptions: (params?: unknown) =>
    api.get('/merchant/coupons/redemptions', { params }),

  // Statistics
  getTransactionStats: (params?: unknown) =>
    api.get('/merchant/statistics/transactions', { params }),
  getMemberStats: (params?: unknown) =>
    api.get('/merchant/statistics/members', { params }),

  // Shop settings
  getShopInfo: () =>
    api.get('/merchant/shop/info'),
  updateShopInfo: (data: unknown) =>
    api.put('/merchant/shop/info', data),
  getStaffList: (params?: unknown) =>
    api.get('/merchant/shop/staff', { params }),
  createStaff: (data: unknown) =>
    api.post('/merchant/shop/staff', data),
  updateStaff: (id: string, data: unknown) =>
    api.put(`/merchant/shop/staff/${id}`, data),
  deleteStaff: (id: string) =>
    api.delete(`/merchant/shop/staff/${id}`),
  resetStaffPassword: (id: string) =>
    api.post(`/merchant/shop/staff/${id}/reset-password`),

  // Receipt upload
  uploadReceipt: (formData: FormData) =>
    api.upload('/merchant/receipts/upload', formData),
};

export default apiClient;
