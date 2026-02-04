/**
 * API service using wx.request adapter with token management and locale headers.
 * Wraps uni.request for type-safe HTTP calls.
 */

const BASE_URL = 'https://api.linkreit.com/v1';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: Record<string, unknown> | unknown;
  headers?: Record<string, string>;
  showError?: boolean;
}

interface ApiResponseWrapper<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

function getToken(): string {
  return uni.getStorageSync('token') || '';
}

function getLocale(): string {
  return uni.getStorageSync('locale') || 'zh-TW';
}

async function request<T>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', data, headers = {}, showError = true } = options;

  const token = getToken();
  const locale = getLocale();

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept-Language': locale,
    'X-Platform': 'wechat-mini-program',
    ...headers,
  };

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  return new Promise<T>((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${url}`,
      method,
      data: data as any,
      header: requestHeaders,
      timeout: 30000,
      success: (res) => {
        const statusCode = res.statusCode;
        const body = res.data as ApiResponseWrapper<T>;

        if (statusCode === 401) {
          // Token expired - clear and redirect to login
          uni.removeStorageSync('token');
          uni.removeStorageSync('user');
          uni.reLaunch({ url: '/pages/auth/login' });
          reject(new Error('Unauthorized'));
          return;
        }

        if (statusCode === 403) {
          if (showError) {
            uni.showToast({ title: 'Access denied', icon: 'none' });
          }
          reject(new Error('Forbidden'));
          return;
        }

        if (statusCode >= 200 && statusCode < 300 && body.code === 0) {
          resolve(body.data);
        } else {
          const errorMsg = body.message || `Request failed (${statusCode})`;
          if (showError) {
            uni.showToast({ title: errorMsg, icon: 'none', duration: 2500 });
          }
          reject(new Error(errorMsg));
        }
      },
      fail: (err) => {
        const msg = err.errMsg || 'Network error';
        if (showError) {
          uni.showToast({ title: 'Network error, please retry', icon: 'none' });
        }
        reject(new Error(msg));
      },
    });
  });
}

/** Upload file to server */
async function uploadFile(filePath: string, fieldName = 'file'): Promise<{ url: string; key: string }> {
  const token = getToken();
  const locale = getLocale();

  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${BASE_URL}/upload`,
      filePath,
      name: fieldName,
      header: {
        Authorization: token ? `Bearer ${token}` : '',
        'Accept-Language': locale,
        'X-Platform': 'wechat-mini-program',
      },
      success: (res) => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(res.data);
            resolve(data.data);
          } catch {
            reject(new Error('Invalid upload response'));
          }
        } else {
          reject(new Error(`Upload failed (${res.statusCode})`));
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || 'Upload failed'));
      },
    });
  });
}

export const api = {
  get: <T>(url: string, data?: Record<string, unknown>) =>
    request<T>({ url, method: 'GET', data }),

  post: <T>(url: string, data?: Record<string, unknown> | unknown) =>
    request<T>({ url, method: 'POST', data }),

  put: <T>(url: string, data?: Record<string, unknown> | unknown) =>
    request<T>({ url, method: 'PUT', data }),

  delete: <T>(url: string, data?: Record<string, unknown>) =>
    request<T>({ url, method: 'DELETE', data }),

  patch: <T>(url: string, data?: Record<string, unknown> | unknown) =>
    request<T>({ url, method: 'PATCH', data }),

  upload: uploadFile,
};

export default api;
