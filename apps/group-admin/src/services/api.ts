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
    // Attach locale header
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
};

// Group admin specific endpoints
export const groupAdminApi = {
  // Auth
  login: (data: { username: string; password: string }) =>
    api.post('/auth/group/login', data),
  loginM365: (data: { token: string }) =>
    api.post('/auth/group/m365', data),
  loginSms: (data: { phone: string; code: string }) =>
    api.post('/auth/group/sms', data),
  sendSmsCode: (data: { phone: string }) =>
    api.post('/auth/group/sms/send', data),

  // Organization
  getGroupInfo: () => api.get('/group/info'),
  updateGroupInfo: (data: unknown) => api.put('/group/info', data),
  getArchitecture: () => api.get('/group/architecture'),
  updateArchitecture: (data: unknown) => api.put('/group/architecture', data),
  getProjects: (params?: unknown) => api.get('/group/projects', { params }),
  getProjectDetail: (id: string) => api.get(`/group/projects/${id}`),

  // Members
  getMemberCards: (params?: unknown) => api.get('/group/members/cards', { params }),
  getMemberDetail: (id: string) => api.get(`/group/members/${id}`),
  getStampAnalysis: (params?: unknown) => api.get('/group/members/stamp-analysis', { params }),
  getStampChangeRecords: (params?: unknown) => api.get('/group/members/stamp-changes', { params }),
  getStampTransactions: (params?: unknown) => api.get('/group/members/stamp-transactions', { params }),

  // Stamp System
  getMemberPoolSettings: () => api.get('/group/stamp-system/pool-settings'),
  updateMemberPoolSettings: (data: unknown) => api.put('/group/stamp-system/pool-settings', data),
  getTierSettings: () => api.get('/group/stamp-system/tiers'),
  createTier: (data: unknown) => api.post('/group/stamp-system/tiers', data),
  updateTier: (id: string, data: unknown) => api.put(`/group/stamp-system/tiers/${id}`, data),
  deleteTier: (id: string) => api.delete(`/group/stamp-system/tiers/${id}`),
  getLabelConfig: () => api.get('/group/stamp-system/labels'),
  getStampInfo: () => api.get('/group/stamp-system/stamp-info'),
  getEarningRules: () => api.get('/group/stamp-system/earning-rules'),
  getExpiryRules: () => api.get('/group/stamp-system/expiry-rules'),
  getUpperLimitRules: () => api.get('/group/stamp-system/upper-limit-rules'),

  // Risk Control
  getRiskDashboard: () => api.get('/group/risk-control/dashboard'),
  getStampAnomalies: (params?: unknown) => api.get('/group/risk-control/stamp-anomalies', { params }),
  reviewStampAnomaly: (id: string, data: unknown) => api.post(`/group/risk-control/stamp-anomalies/${id}/review`, data),
  getAbnormalMembers: (params?: unknown) => api.get('/group/risk-control/abnormal-members', { params }),
  reviewAbnormalMember: (id: string, data: unknown) => api.post(`/group/risk-control/abnormal-members/${id}/review`, data),
  getRiskRules: () => api.get('/group/risk-control/rules'),
  createRiskRule: (data: unknown) => api.post('/group/risk-control/rules', data),
  updateRiskRule: (id: string, data: unknown) => api.put(`/group/risk-control/rules/${id}`, data),
  deleteRiskRule: (id: string) => api.delete(`/group/risk-control/rules/${id}`),
  getSpecialList: (params?: unknown) => api.get('/group/risk-control/special-list', { params }),

  // Reports
  getClearingReport: (params?: unknown) => api.get('/group/reports/clearing', { params }),
  getDownloads: (params?: unknown) => api.get('/group/downloads', { params }),
  requestDownload: (data: unknown) => api.post('/group/downloads', data),
  getOperationLogs: (params?: unknown) => api.get('/group/operation-logs', { params }),

  // Dashboard
  getDashboardMetrics: () => api.get('/group/dashboard/metrics'),
  getDashboardTrends: (params?: unknown) => api.get('/group/dashboard/trends', { params }),
};

export default apiClient;
