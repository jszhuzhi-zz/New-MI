import axios from 'axios';
import { useAuthStore } from '../store/auth';

/** Axios instance for mall admin API calls */
const api = axios.create({
  baseURL: '/api/mall',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Attach project context
    const projectId = useAuthStore.getState().user?.projectId;
    if (projectId) {
      config.headers['X-Project-Id'] = projectId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    const { code, message, data } = response.data;
    if (code === 0 || code === 200) {
      return data;
    }
    return Promise.reject(new Error(message || 'Request failed'));
  },
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===================== Member APIs =====================
export const memberApi = {
  /** Get user list (all registered users) */
  getUserList: (params: Record<string, unknown>) =>
    api.get('/members/users', { params }),

  /** Get member list */
  getMemberList: (params: Record<string, unknown>) =>
    api.get('/members', { params }),

  /** Get member detail */
  getMemberDetail: (id: string) =>
    api.get(`/members/${id}`),

  /** Update member */
  updateMember: (id: string, data: Record<string, unknown>) =>
    api.put(`/members/${id}`, data),

  /** Register member at counter */
  registerAtCounter: (data: Record<string, unknown>) =>
    api.post('/members/counter-register', data),

  /** Search member at counter */
  searchMemberAtCounter: (query: string) =>
    api.get('/members/counter-search', { params: { query } }),

  /** Get account open/close records */
  getAccountRecords: (params: Record<string, unknown>) =>
    api.get('/members/account-records', { params }),

  /** Open/close/suspend account */
  updateAccountStatus: (memberId: string, action: string, reason: string) =>
    api.post(`/members/${memberId}/account-action`, { action, reason }),
};

// ===================== Stamp APIs =====================
export const stampApi = {
  /** Process stamps at mall level */
  processStamp: (data: Record<string, unknown>) =>
    api.post('/stamps/process', data),

  /** Get mall stamp management list */
  getMallStamps: (params: Record<string, unknown>) =>
    api.get('/stamps/mall', { params }),

  /** Approve/reject stamp submission */
  reviewStamp: (id: string, action: 'approve' | 'reject', comment: string) =>
    api.post(`/stamps/${id}/review`, { action, comment }),

  /** Get stamp change records */
  getStampChangeRecords: (params: Record<string, unknown>) =>
    api.get('/stamps/change-records', { params }),

  /** Get stamp transaction records */
  getStampTransactionRecords: (params: Record<string, unknown>) =>
    api.get('/stamps/transactions', { params }),

  /** Get stamp allocation data */
  getStampAllocation: (params: Record<string, unknown>) =>
    api.get('/stamps/allocation', { params }),

  /** Update stamp allocation */
  updateStampAllocation: (data: Record<string, unknown>) =>
    api.put('/stamps/allocation', data),
};

// ===================== Stamp Rule APIs =====================
export const stampRuleApi = {
  /** Get member pool settings */
  getMemberPoolSettings: () =>
    api.get('/stamp-rules/member-pool'),

  /** Update member pool settings */
  updateMemberPoolSettings: (data: Record<string, unknown>) =>
    api.put('/stamp-rules/member-pool', data),

  /** Get tier settings */
  getTierSettings: () =>
    api.get('/stamp-rules/tiers'),

  /** Update tier settings */
  updateTierSettings: (data: Record<string, unknown>) =>
    api.put('/stamp-rules/tiers', data),

  /** Get label config */
  getLabelConfig: () =>
    api.get('/stamp-rules/labels'),

  /** Create/Update label */
  saveLabelConfig: (data: Record<string, unknown>) =>
    api.post('/stamp-rules/labels', data),

  /** Delete label */
  deleteLabelConfig: (id: string) =>
    api.delete(`/stamp-rules/labels/${id}`),

  /** Get stamp info */
  getStampInfo: () =>
    api.get('/stamp-rules/stamp-info'),

  /** Update stamp info */
  updateStampInfo: (data: Record<string, unknown>) =>
    api.put('/stamp-rules/stamp-info', data),

  /** Get earning rules */
  getEarningRules: (params?: Record<string, unknown>) =>
    api.get('/stamp-rules/earning', { params }),

  /** Create/Update earning rule */
  saveEarningRule: (data: Record<string, unknown>) =>
    api.post('/stamp-rules/earning', data),

  /** Get expiry rules */
  getExpiryRules: () =>
    api.get('/stamp-rules/expiry'),

  /** Save expiry rule */
  saveExpiryRule: (data: Record<string, unknown>) =>
    api.post('/stamp-rules/expiry', data),

  /** Get upper limit rules */
  getUpperLimitRules: () =>
    api.get('/stamp-rules/upper-limit'),

  /** Save upper limit rule */
  saveUpperLimitRule: (data: Record<string, unknown>) =>
    api.post('/stamp-rules/upper-limit', data),

  /** Get campaign stamp rules */
  getCampaignStampRules: (params?: Record<string, unknown>) =>
    api.get('/stamp-rules/campaign', { params }),

  /** Save campaign stamp rule */
  saveCampaignStampRule: (data: Record<string, unknown>) =>
    api.post('/stamp-rules/campaign', data),

  /** Get online activity rules */
  getOnlineActivityRules: () =>
    api.get('/stamp-rules/online-activity'),

  /** Save online activity rule */
  saveOnlineActivityRule: (data: Record<string, unknown>) =>
    api.post('/stamp-rules/online-activity', data),
};

// ===================== Risk Control APIs =====================
export const riskControlApi = {
  /** Get risk control workbench data */
  getWorkbenchData: () =>
    api.get('/risk-control/workbench'),

  /** Get stamp anomaly review list */
  getStampAnomalyList: (params: Record<string, unknown>) =>
    api.get('/risk-control/stamp-anomaly', { params }),

  /** Review stamp anomaly */
  reviewStampAnomaly: (id: string, data: Record<string, unknown>) =>
    api.post(`/risk-control/stamp-anomaly/${id}/review`, data),

  /** Get abnormal member review list */
  getAbnormalMemberList: (params: Record<string, unknown>) =>
    api.get('/risk-control/abnormal-members', { params }),

  /** Review abnormal member */
  reviewAbnormalMember: (id: string, data: Record<string, unknown>) =>
    api.post(`/risk-control/abnormal-members/${id}/review`, data),

  /** Get risk rules */
  getRiskRules: (params?: Record<string, unknown>) =>
    api.get('/risk-control/rules', { params }),

  /** Save risk rule */
  saveRiskRule: (data: Record<string, unknown>) =>
    api.post('/risk-control/rules', data),

  /** Delete risk rule */
  deleteRiskRule: (id: string) =>
    api.delete(`/risk-control/rules/${id}`),

  /** Get special list members */
  getSpecialListMembers: (params: Record<string, unknown>) =>
    api.get('/risk-control/special-list', { params }),

  /** Add to special list */
  addToSpecialList: (data: Record<string, unknown>) =>
    api.post('/risk-control/special-list', data),

  /** Remove from special list */
  removeFromSpecialList: (id: string) =>
    api.delete(`/risk-control/special-list/${id}`),
};

// ===================== Report APIs =====================
export const reportApi = {
  /** Get clearing report */
  getClearingReport: (params: Record<string, unknown>) =>
    api.get('/reports/clearing', { params }),

  /** Export clearing report */
  exportClearingReport: (params: Record<string, unknown>) =>
    api.get('/reports/clearing/export', { params, responseType: 'blob' as const }),
};

// ===================== Download Center APIs =====================
export const downloadApi = {
  /** Get download list */
  getDownloadList: (params: Record<string, unknown>) =>
    api.get('/downloads', { params }),

  /** Create download task */
  createDownloadTask: (data: Record<string, unknown>) =>
    api.post('/downloads', data),

  /** Get download URL */
  getDownloadUrl: (id: string) =>
    api.get(`/downloads/${id}/url`),
};

// ===================== Operation Log APIs =====================
export const operationLogApi = {
  /** Get operation logs */
  getOperationLogs: (params: Record<string, unknown>) =>
    api.get('/operation-logs', { params }),
};

export default api;
