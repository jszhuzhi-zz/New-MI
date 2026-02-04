/**
 * Link REIT Membership System API Client
 *
 * A class-based HTTP client with modular API access, automatic token refresh,
 * locale header injection, and structured error handling. Built on top of Axios.
 *
 * @example
 * ```ts
 * const client = new LinkReitApiClient({
 *   baseURL: 'https://api.linkreit.com/v1',
 *   locale: 'zh-TW',
 * });
 *
 * await client.auth.login({ username: 'admin', password: 'secret' });
 * const members = await client.members.list({ page: 1, pageSize: 20 });
 * ```
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError,
} from 'axios';

import type {
  Locale,
  ApiResponse,
  PaginationQuery,
  PaginatedResponse,
  // Auth
  UserAccount,
  Role,
  Permission,
  LoginRecord,
  AuditLog,
  LoginSettings,
  // Members
  Member,
  MemberProfile,
  MemberTier,
  MemberCard,
  MemberLabel,
  MemberChangeRecord,
  MemberAccountRecord,
  MemberImportConfig,
  SpecialListMember,
  CounterMemberRegistration,
  // Stamps
  StampAccount,
  StampTransaction,
  StampEarningRule,
  StampConsumptionRule,
  StampExpiryRule,
  StampUpperLimitRule,
  CampaignStampRule,
  OnlineActivityStampRule,
  StampInfoItem,
  StampClearingReport,
  // Merchants
  Merchant,
  MerchantAccount,
  MerchantStampAction,
  MerchantStats,
  // Campaigns
  Campaign,
  Coupon,
  CouponInstance,
  LuckyDraw,
  Gift,
  // Content
  ContentArticle,
  Banner,
  PushNotification,
  NotificationTemplate,
  ServiceDirectory,
  Venue,
  FloorPlan,
  // Reports
  MemberStatisticsReport,
  StampStatisticsReport,
  GroupStampClearingReport,
  RegistrationConversionReport,
  MemberActivityReport,
  UsageStatisticsReport,
  OnlineActivityReport,
  CampaignPromotionReport,
  ServiceUsageReport,
  ReportDownload,
  OperationLog,
  // Risk Control
  RiskControlDashboard,
  RiskAlert,
  AbnormalStampEvent,
  StampAnomalyReview,
  AbnormalMemberReview,
  RiskControlRule,
  // Organizations
  Group,
  OrganizationUnit,
  Project,
  DateRange,
} from '@link-reit/types';

// ---------------------------------------------------------------------------
// Configuration & types
// ---------------------------------------------------------------------------

/** Configuration options for the API client. */
export interface ApiClientConfig {
  /** Base URL of the API server (e.g. "https://api.linkreit.com/v1"). */
  baseURL: string;
  /** Default locale for Accept-Language header. */
  locale?: Locale;
  /** Initial access token (if already authenticated). */
  accessToken?: string;
  /** Initial refresh token. */
  refreshToken?: string;
  /** Custom request timeout in milliseconds (default: 30 000). */
  timeout?: number;
  /** Additional default headers to include in every request. */
  headers?: Record<string, string>;
  /** Callback invoked when tokens are refreshed. */
  onTokenRefreshed?: (tokens: TokenPair) => void;
  /** Callback invoked when a session becomes invalid (e.g. refresh failed). */
  onSessionExpired?: () => void;
  /** Enable request/response debug logging. */
  debug?: boolean;
}

/** Access + refresh token pair. */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/** Credentials for login. */
export interface LoginCredentials {
  username: string;
  password: string;
  portalType?: string;
  mfaCode?: string;
}

/** OTP-based login. */
export interface OtpLoginCredentials {
  phone: string;
  countryCode: string;
  otp: string;
  portalType?: string;
}

/** API error detail returned by the server. */
export interface ApiErrorDetail {
  code: number;
  message: string;
  errors?: Record<string, string[]>;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Custom error class
// ---------------------------------------------------------------------------

/**
 * Structured error thrown by the API client.
 * Contains the parsed server error body when available.
 */
export class ApiClientError extends Error {
  /** HTTP status code (0 if no response was received). */
  public readonly status: number;
  /** Server error detail body, if parseable. */
  public readonly detail: ApiErrorDetail | null;
  /** Original Axios error. */
  public readonly cause: AxiosError | null;

  constructor(
    message: string,
    status: number,
    detail: ApiErrorDetail | null = null,
    cause: AxiosError | null = null,
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.detail = detail;
    this.cause = cause;
    Object.setPrototypeOf(this, ApiClientError.prototype);
  }

  /** Whether the error is an authentication failure (401). */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** Whether the error is a forbidden access (403). */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  /** Whether the error is a not-found (404). */
  get isNotFound(): boolean {
    return this.status === 404;
  }

  /** Whether the error is a validation error (422). */
  get isValidationError(): boolean {
    return this.status === 422;
  }

  /** Whether the error is a rate limit (429). */
  get isRateLimited(): boolean {
    return this.status === 429;
  }
}

// ---------------------------------------------------------------------------
// API Client
// ---------------------------------------------------------------------------

export class LinkReitApiClient {
  private readonly http: AxiosInstance;
  private _accessToken: string | null;
  private _refreshToken: string | null;
  private _locale: Locale;
  private _isRefreshing = false;
  private _refreshSubscribers: ((token: string) => void)[] = [];
  private readonly config: ApiClientConfig;

  // Module instances (lazily initialised)
  private _auth?: AuthModule;
  private _members?: MembersModule;
  private _stamps?: StampsModule;
  private _merchants?: MerchantsModule;
  private _campaigns?: CampaignsModule;
  private _content?: ContentModule;
  private _reports?: ReportsModule;
  private _riskControl?: RiskControlModule;
  private _organizations?: OrganizationsModule;

  constructor(config: ApiClientConfig) {
    this.config = config;
    this._accessToken = config.accessToken ?? null;
    this._refreshToken = config.refreshToken ?? null;
    this._locale = config.locale ?? 'en';

    this.http = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout ?? 30_000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    this.setupInterceptors();
  }

  // -----------------------------------------------------------------------
  // Module accessors
  // -----------------------------------------------------------------------

  get auth(): AuthModule {
    if (!this._auth) this._auth = new AuthModule(this);
    return this._auth;
  }

  get members(): MembersModule {
    if (!this._members) this._members = new MembersModule(this);
    return this._members;
  }

  get stamps(): StampsModule {
    if (!this._stamps) this._stamps = new StampsModule(this);
    return this._stamps;
  }

  get merchants(): MerchantsModule {
    if (!this._merchants) this._merchants = new MerchantsModule(this);
    return this._merchants;
  }

  get campaigns(): CampaignsModule {
    if (!this._campaigns) this._campaigns = new CampaignsModule(this);
    return this._campaigns;
  }

  get content(): ContentModule {
    if (!this._content) this._content = new ContentModule(this);
    return this._content;
  }

  get reports(): ReportsModule {
    if (!this._reports) this._reports = new ReportsModule(this);
    return this._reports;
  }

  get riskControl(): RiskControlModule {
    if (!this._riskControl) this._riskControl = new RiskControlModule(this);
    return this._riskControl;
  }

  get organizations(): OrganizationsModule {
    if (!this._organizations) this._organizations = new OrganizationsModule(this);
    return this._organizations;
  }

  // -----------------------------------------------------------------------
  // Token management
  // -----------------------------------------------------------------------

  /** Set the access token for subsequent requests. Returns `this` for chaining. */
  setAccessToken(token: string): this {
    this._accessToken = token;
    return this;
  }

  /** Set the refresh token. Returns `this` for chaining. */
  setRefreshToken(token: string): this {
    this._refreshToken = token;
    return this;
  }

  /** Set both tokens at once. Returns `this` for chaining. */
  setTokens(tokens: TokenPair): this {
    this._accessToken = tokens.accessToken;
    this._refreshToken = tokens.refreshToken;
    return this;
  }

  /** Clear all stored tokens (logout). Returns `this` for chaining. */
  clearTokens(): this {
    this._accessToken = null;
    this._refreshToken = null;
    return this;
  }

  /** Get the current access token. */
  getAccessToken(): string | null {
    return this._accessToken;
  }

  /** Check whether the client currently holds an access token. */
  isAuthenticated(): boolean {
    return this._accessToken !== null;
  }

  // -----------------------------------------------------------------------
  // Locale management
  // -----------------------------------------------------------------------

  /** Set the locale for Accept-Language header. Returns `this` for chaining. */
  setLocale(locale: Locale): this {
    this._locale = locale;
    return this;
  }

  /** Get the current locale. */
  getLocale(): Locale {
    return this._locale;
  }

  // -----------------------------------------------------------------------
  // HTTP primitives (used by modules)
  // -----------------------------------------------------------------------

  /** Perform a GET request and return the unwrapped ApiResponse data. */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.http.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  /** Perform a POST request. */
  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.http.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /** Perform a PUT request. */
  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.http.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /** Perform a PATCH request. */
  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.http.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  /** Perform a DELETE request. */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.http.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  /** Upload a file via multipart/form-data POST. */
  async upload<T>(url: string, formData: FormData): Promise<ApiResponse<T>> {
    const response = await this.http.post<ApiResponse<T>>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  /** Download a file and return the raw AxiosResponse. */
  async download(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.http.get(url, {
      ...config,
      responseType: 'blob',
    });
  }

  // -----------------------------------------------------------------------
  // Interceptors
  // -----------------------------------------------------------------------

  private setupInterceptors(): void {
    // --- Request interceptor ---
    this.http.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Inject Authorization header
        if (this._accessToken) {
          config.headers.set('Authorization', `Bearer ${this._accessToken}`);
        }

        // Inject Accept-Language header
        config.headers.set('Accept-Language', this._locale);

        // Debug logging
        if (this.config.debug) {
          const method = (config.method ?? 'GET').toUpperCase();
          console.debug(`[LinkReitApiClient] ${method} ${config.url}`);
        }

        return config;
      },
      (error: AxiosError) => Promise.reject(this.normaliseError(error)),
    );

    // --- Response interceptor ---
    this.http.interceptors.response.use(
      (response: AxiosResponse) => {
        if (this.config.debug) {
          console.debug(
            `[LinkReitApiClient] ${response.status} ${response.config.url}`,
          );
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Attempt token refresh on 401 (but not for the refresh endpoint itself)
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          this._refreshToken &&
          !originalRequest.url?.includes('/auth/refresh')
        ) {
          if (this._isRefreshing) {
            // Queue the request until the ongoing refresh completes
            return new Promise<AxiosResponse>((resolve) => {
              this._refreshSubscribers.push((newToken: string) => {
                originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
                resolve(this.http(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this._isRefreshing = true;

          try {
            const tokens = await this.performTokenRefresh();
            this._accessToken = tokens.accessToken;
            this._refreshToken = tokens.refreshToken;

            // Notify the host application
            this.config.onTokenRefreshed?.(tokens);

            // Retry all queued requests
            this._refreshSubscribers.forEach((cb) => cb(tokens.accessToken));
            this._refreshSubscribers = [];

            // Retry the original request
            originalRequest.headers.set(
              'Authorization',
              `Bearer ${tokens.accessToken}`,
            );
            return this.http(originalRequest);
          } catch (refreshError) {
            this._accessToken = null;
            this._refreshToken = null;
            this._refreshSubscribers = [];

            // Notify the host application that the session is dead
            this.config.onSessionExpired?.();

            return Promise.reject(this.normaliseError(error));
          } finally {
            this._isRefreshing = false;
          }
        }

        return Promise.reject(this.normaliseError(error));
      },
    );
  }

  /** Exchange the refresh token for a new token pair. */
  private async performTokenRefresh(): Promise<TokenPair> {
    const response = await axios.post<ApiResponse<TokenPair>>(
      `${this.config.baseURL}/auth/refresh`,
      { refreshToken: this._refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': this._locale,
        },
      },
    );
    return response.data.data;
  }

  /** Convert an AxiosError into a structured ApiClientError. */
  private normaliseError(error: AxiosError): ApiClientError {
    if (error.response) {
      const data = error.response.data as ApiErrorDetail | undefined;
      const message =
        data?.message ?? error.message ?? 'An unexpected error occurred';
      return new ApiClientError(message, error.response.status, data ?? null, error);
    }

    if (error.request) {
      return new ApiClientError(
        'No response received from the server',
        0,
        null,
        error,
      );
    }

    return new ApiClientError(
      error.message ?? 'Request configuration error',
      0,
      null,
      error,
    );
  }
}

// ---------------------------------------------------------------------------
// Base module
// ---------------------------------------------------------------------------

/** Base class providing access to the client's HTTP methods. */
abstract class BaseModule {
  constructor(protected readonly client: LinkReitApiClient) {}
}

// ---------------------------------------------------------------------------
// Auth module
// ---------------------------------------------------------------------------

class AuthModule extends BaseModule {
  /** Login with username/password (+ optional MFA). */
  async login(credentials: LoginCredentials): Promise<ApiResponse<TokenPair>> {
    const res = await this.client.post<TokenPair>('/auth/login', credentials);
    if (res.data) {
      this.client.setTokens(res.data);
    }
    return res;
  }

  /** Login with phone OTP. */
  async loginWithOtp(credentials: OtpLoginCredentials): Promise<ApiResponse<TokenPair>> {
    const res = await this.client.post<TokenPair>('/auth/login/otp', credentials);
    if (res.data) {
      this.client.setTokens(res.data);
    }
    return res;
  }

  /** Login via M365 SSO. */
  async loginWithM365(m365Token: string): Promise<ApiResponse<TokenPair>> {
    const res = await this.client.post<TokenPair>('/auth/login/m365', {
      token: m365Token,
    });
    if (res.data) {
      this.client.setTokens(res.data);
    }
    return res;
  }

  /** Login via WeChat OAuth. */
  async loginWithWechat(code: string): Promise<ApiResponse<TokenPair>> {
    const res = await this.client.post<TokenPair>('/auth/login/wechat', { code });
    if (res.data) {
      this.client.setTokens(res.data);
    }
    return res;
  }

  /** Logout and invalidate the current session. */
  async logout(): Promise<ApiResponse<void>> {
    const res = await this.client.post<void>('/auth/logout');
    this.client.clearTokens();
    return res;
  }

  /** Request an SMS OTP for a phone number. */
  async requestOtp(phone: string, countryCode: string): Promise<ApiResponse<void>> {
    return this.client.post<void>('/auth/otp/request', { phone, countryCode });
  }

  /** Verify an OTP code. */
  async verifyOtp(
    phone: string,
    countryCode: string,
    otp: string,
  ): Promise<ApiResponse<{ verified: boolean }>> {
    return this.client.post<{ verified: boolean }>('/auth/otp/verify', {
      phone,
      countryCode,
      otp,
    });
  }

  /** Get the current user's profile. */
  async me(): Promise<ApiResponse<UserAccount>> {
    return this.client.get<UserAccount>('/auth/me');
  }

  /** Change the current user's password. */
  async changePassword(
    oldPassword: string,
    newPassword: string,
  ): Promise<ApiResponse<void>> {
    return this.client.post<void>('/auth/password/change', {
      oldPassword,
      newPassword,
    });
  }

  /** Request a password reset email/SMS. */
  async requestPasswordReset(
    identifier: string,
    method: 'email' | 'sms',
  ): Promise<ApiResponse<void>> {
    return this.client.post<void>('/auth/password/reset-request', {
      identifier,
      method,
    });
  }

  /** Confirm a password reset with the token. */
  async confirmPasswordReset(
    token: string,
    newPassword: string,
  ): Promise<ApiResponse<void>> {
    return this.client.post<void>('/auth/password/reset-confirm', {
      token,
      newPassword,
    });
  }

  // --- User account management ---

  async listUsers(params?: PaginationQuery & {
    portalType?: string;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<UserAccount>>> {
    return this.client.get<PaginatedResponse<UserAccount>>('/auth/users', {
      params,
    });
  }

  async getUser(userId: string): Promise<ApiResponse<UserAccount>> {
    return this.client.get<UserAccount>(`/auth/users/${userId}`);
  }

  async createUser(
    data: Partial<UserAccount>,
  ): Promise<ApiResponse<UserAccount>> {
    return this.client.post<UserAccount>('/auth/users', data);
  }

  async updateUser(
    userId: string,
    data: Partial<UserAccount>,
  ): Promise<ApiResponse<UserAccount>> {
    return this.client.put<UserAccount>(`/auth/users/${userId}`, data);
  }

  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/auth/users/${userId}`);
  }

  // --- Roles ---

  async listRoles(params?: PaginationQuery): Promise<ApiResponse<PaginatedResponse<Role>>> {
    return this.client.get<PaginatedResponse<Role>>('/auth/roles', { params });
  }

  async getRole(roleId: string): Promise<ApiResponse<Role>> {
    return this.client.get<Role>(`/auth/roles/${roleId}`);
  }

  async createRole(data: Partial<Role>): Promise<ApiResponse<Role>> {
    return this.client.post<Role>('/auth/roles', data);
  }

  async updateRole(roleId: string, data: Partial<Role>): Promise<ApiResponse<Role>> {
    return this.client.put<Role>(`/auth/roles/${roleId}`, data);
  }

  async deleteRole(roleId: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/auth/roles/${roleId}`);
  }

  // --- Permissions ---

  async listPermissions(): Promise<ApiResponse<Permission[]>> {
    return this.client.get<Permission[]>('/auth/permissions');
  }

  // --- Login settings ---

  async getLoginSettings(groupId: string): Promise<ApiResponse<LoginSettings>> {
    return this.client.get<LoginSettings>(`/auth/login-settings/${groupId}`);
  }

  async updateLoginSettings(
    groupId: string,
    data: Partial<LoginSettings>,
  ): Promise<ApiResponse<LoginSettings>> {
    return this.client.put<LoginSettings>(`/auth/login-settings/${groupId}`, data);
  }

  // --- Login history / Audit logs ---

  async getLoginHistory(params?: PaginationQuery & {
    userId?: string;
  }): Promise<ApiResponse<PaginatedResponse<LoginRecord>>> {
    return this.client.get<PaginatedResponse<LoginRecord>>('/auth/login-history', {
      params,
    });
  }

  async getAuditLogs(params?: PaginationQuery & {
    module?: string;
    action?: string;
    userId?: string;
  }): Promise<ApiResponse<PaginatedResponse<AuditLog>>> {
    return this.client.get<PaginatedResponse<AuditLog>>('/auth/audit-logs', {
      params,
    });
  }
}

// ---------------------------------------------------------------------------
// Members module
// ---------------------------------------------------------------------------

class MembersModule extends BaseModule {
  // --- CRUD ---

  async list(params?: PaginationQuery & {
    projectId?: string;
    status?: string;
    tierId?: string;
    tag?: string;
    search?: string;
    listStatus?: string;
  }): Promise<ApiResponse<PaginatedResponse<Member>>> {
    return this.client.get<PaginatedResponse<Member>>('/members', { params });
  }

  async get(memberId: string): Promise<ApiResponse<Member>> {
    return this.client.get<Member>(`/members/${memberId}`);
  }

  async getByCardNo(cardNo: string): Promise<ApiResponse<Member>> {
    return this.client.get<Member>(`/members/card/${cardNo}`);
  }

  async create(data: Partial<Member>): Promise<ApiResponse<Member>> {
    return this.client.post<Member>('/members', data);
  }

  async update(memberId: string, data: Partial<Member>): Promise<ApiResponse<Member>> {
    return this.client.put<Member>(`/members/${memberId}`, data);
  }

  async delete(memberId: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/members/${memberId}`);
  }

  // --- Profile ---

  async updateProfile(
    memberId: string,
    data: Partial<MemberProfile>,
  ): Promise<ApiResponse<Member>> {
    return this.client.patch<Member>(`/members/${memberId}/profile`, data);
  }

  // --- Counter registration ---

  async counterRegistration(
    data: CounterMemberRegistration,
  ): Promise<ApiResponse<Member>> {
    return this.client.post<Member>('/members/counter-registration', data);
  }

  // --- Status management ---

  async suspend(memberId: string, reason: string): Promise<ApiResponse<MemberAccountRecord>> {
    return this.client.post<MemberAccountRecord>(`/members/${memberId}/suspend`, {
      reason,
    });
  }

  async reactivate(memberId: string, reason: string): Promise<ApiResponse<MemberAccountRecord>> {
    return this.client.post<MemberAccountRecord>(`/members/${memberId}/reactivate`, {
      reason,
    });
  }

  async close(memberId: string, reason: string): Promise<ApiResponse<MemberAccountRecord>> {
    return this.client.post<MemberAccountRecord>(`/members/${memberId}/close`, {
      reason,
    });
  }

  // --- Tiers ---

  async listTiers(params?: PaginationQuery & {
    groupId?: string;
  }): Promise<ApiResponse<PaginatedResponse<MemberTier>>> {
    return this.client.get<PaginatedResponse<MemberTier>>('/members/tiers', {
      params,
    });
  }

  async getTier(tierId: string): Promise<ApiResponse<MemberTier>> {
    return this.client.get<MemberTier>(`/members/tiers/${tierId}`);
  }

  async createTier(data: Partial<MemberTier>): Promise<ApiResponse<MemberTier>> {
    return this.client.post<MemberTier>('/members/tiers', data);
  }

  async updateTier(
    tierId: string,
    data: Partial<MemberTier>,
  ): Promise<ApiResponse<MemberTier>> {
    return this.client.put<MemberTier>(`/members/tiers/${tierId}`, data);
  }

  async deleteTier(tierId: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/members/tiers/${tierId}`);
  }

  // --- Cards ---

  async getCard(memberId: string): Promise<ApiResponse<MemberCard>> {
    return this.client.get<MemberCard>(`/members/${memberId}/card`);
  }

  async issueCard(
    memberId: string,
    tierId: string,
  ): Promise<ApiResponse<MemberCard>> {
    return this.client.post<MemberCard>(`/members/${memberId}/card`, { tierId });
  }

  async replaceCard(
    memberId: string,
    reason: string,
  ): Promise<ApiResponse<MemberCard>> {
    return this.client.post<MemberCard>(`/members/${memberId}/card/replace`, {
      reason,
    });
  }

  // --- Labels ---

  async listLabels(params?: PaginationQuery & {
    projectId?: string;
  }): Promise<ApiResponse<PaginatedResponse<MemberLabel>>> {
    return this.client.get<PaginatedResponse<MemberLabel>>('/members/labels', {
      params,
    });
  }

  async createLabel(data: Partial<MemberLabel>): Promise<ApiResponse<MemberLabel>> {
    return this.client.post<MemberLabel>('/members/labels', data);
  }

  async updateLabel(
    labelId: string,
    data: Partial<MemberLabel>,
  ): Promise<ApiResponse<MemberLabel>> {
    return this.client.put<MemberLabel>(`/members/labels/${labelId}`, data);
  }

  async deleteLabel(labelId: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/members/labels/${labelId}`);
  }

  async assignLabels(
    memberId: string,
    labelIds: string[],
  ): Promise<ApiResponse<void>> {
    return this.client.post<void>(`/members/${memberId}/labels`, { labelIds });
  }

  // --- Special lists (whitelist/blacklist) ---

  async listSpecialMembers(params?: PaginationQuery & {
    listType?: 'whitelist' | 'blacklist';
  }): Promise<ApiResponse<PaginatedResponse<SpecialListMember>>> {
    return this.client.get<PaginatedResponse<SpecialListMember>>(
      '/members/special-list',
      { params },
    );
  }

  async addToSpecialList(
    data: Partial<SpecialListMember>,
  ): Promise<ApiResponse<SpecialListMember>> {
    return this.client.post<SpecialListMember>('/members/special-list', data);
  }

  async removeFromSpecialList(id: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/members/special-list/${id}`);
  }

  // --- Change history ---

  async getChangeHistory(
    memberId: string,
    params?: PaginationQuery,
  ): Promise<ApiResponse<PaginatedResponse<MemberChangeRecord>>> {
    return this.client.get<PaginatedResponse<MemberChangeRecord>>(
      `/members/${memberId}/changes`,
      { params },
    );
  }

  async getAccountRecords(
    memberId: string,
    params?: PaginationQuery,
  ): Promise<ApiResponse<PaginatedResponse<MemberAccountRecord>>> {
    return this.client.get<PaginatedResponse<MemberAccountRecord>>(
      `/members/${memberId}/account-records`,
      { params },
    );
  }

  // --- Import / Export ---

  async importMembers(
    config: MemberImportConfig,
  ): Promise<ApiResponse<{ taskId: string }>> {
    return this.client.post<{ taskId: string }>('/members/import', config);
  }

  async getImportStatus(
    taskId: string,
  ): Promise<ApiResponse<{ status: string; processed: number; total: number; errors: string[] }>> {
    return this.client.get<{
      status: string;
      processed: number;
      total: number;
      errors: string[];
    }>(`/members/import/${taskId}`);
  }

  async exportMembers(params?: {
    projectId?: string;
    status?: string;
    format?: 'xlsx' | 'csv';
  }): Promise<ApiResponse<{ downloadUrl: string }>> {
    return this.client.post<{ downloadUrl: string }>('/members/export', params);
  }
}

// ---------------------------------------------------------------------------
// Stamps module
// ---------------------------------------------------------------------------

class StampsModule extends BaseModule {
  // --- Stamp accounts ---

  async getAccount(memberId: string): Promise<ApiResponse<StampAccount>> {
    return this.client.get<StampAccount>(`/stamps/accounts/${memberId}`);
  }

  // --- Transactions ---

  async listTransactions(params?: PaginationQuery & {
    memberId?: string;
    projectId?: string;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<PaginatedResponse<StampTransaction>>> {
    return this.client.get<PaginatedResponse<StampTransaction>>(
      '/stamps/transactions',
      { params },
    );
  }

  async getTransaction(transactionId: string): Promise<ApiResponse<StampTransaction>> {
    return this.client.get<StampTransaction>(`/stamps/transactions/${transactionId}`);
  }

  async earnStamps(data: {
    memberId: string;
    projectId: string;
    merchantId?: string;
    amount: number;
    receiptId?: string;
    receiptAmount?: number;
    description?: string;
  }): Promise<ApiResponse<StampTransaction>> {
    return this.client.post<StampTransaction>('/stamps/earn', data);
  }

  async redeemStamps(data: {
    memberId: string;
    projectId: string;
    merchantId?: string;
    amount: number;
    description?: string;
  }): Promise<ApiResponse<StampTransaction>> {
    return this.client.post<StampTransaction>('/stamps/redeem', data);
  }

  async adjustStamps(data: {
    memberId: string;
    projectId: string;
    amount: number;
    reason: string;
  }): Promise<ApiResponse<StampTransaction>> {
    return this.client.post<StampTransaction>('/stamps/adjust', data);
  }

  async transferStamps(data: {
    fromMemberId: string;
    toMemberId: string;
    amount: number;
    reason: string;
  }): Promise<ApiResponse<StampTransaction>> {
    return this.client.post<StampTransaction>('/stamps/transfer', data);
  }

  // --- Earning rules ---

  async listEarningRules(params?: PaginationQuery & {
    projectId?: string;
    groupId?: string;
  }): Promise<ApiResponse<PaginatedResponse<StampEarningRule>>> {
    return this.client.get<PaginatedResponse<StampEarningRule>>(
      '/stamps/rules/earning',
      { params },
    );
  }

  async getEarningRule(ruleId: string): Promise<ApiResponse<StampEarningRule>> {
    return this.client.get<StampEarningRule>(`/stamps/rules/earning/${ruleId}`);
  }

  async createEarningRule(
    data: Partial<StampEarningRule>,
  ): Promise<ApiResponse<StampEarningRule>> {
    return this.client.post<StampEarningRule>('/stamps/rules/earning', data);
  }

  async updateEarningRule(
    ruleId: string,
    data: Partial<StampEarningRule>,
  ): Promise<ApiResponse<StampEarningRule>> {
    return this.client.put<StampEarningRule>(`/stamps/rules/earning/${ruleId}`, data);
  }

  async deleteEarningRule(ruleId: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/stamps/rules/earning/${ruleId}`);
  }

  // --- Consumption rules ---

  async listConsumptionRules(params?: PaginationQuery & {
    projectId?: string;
  }): Promise<ApiResponse<PaginatedResponse<StampConsumptionRule>>> {
    return this.client.get<PaginatedResponse<StampConsumptionRule>>(
      '/stamps/rules/consumption',
      { params },
    );
  }

  async createConsumptionRule(
    data: Partial<StampConsumptionRule>,
  ): Promise<ApiResponse<StampConsumptionRule>> {
    return this.client.post<StampConsumptionRule>('/stamps/rules/consumption', data);
  }

  async updateConsumptionRule(
    ruleId: string,
    data: Partial<StampConsumptionRule>,
  ): Promise<ApiResponse<StampConsumptionRule>> {
    return this.client.put<StampConsumptionRule>(
      `/stamps/rules/consumption/${ruleId}`,
      data,
    );
  }

  async deleteConsumptionRule(ruleId: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/stamps/rules/consumption/${ruleId}`);
  }

  // --- Expiry rules ---

  async listExpiryRules(params?: PaginationQuery & {
    projectId?: string;
  }): Promise<ApiResponse<PaginatedResponse<StampExpiryRule>>> {
    return this.client.get<PaginatedResponse<StampExpiryRule>>(
      '/stamps/rules/expiry',
      { params },
    );
  }

  async createExpiryRule(
    data: Partial<StampExpiryRule>,
  ): Promise<ApiResponse<StampExpiryRule>> {
    return this.client.post<StampExpiryRule>('/stamps/rules/expiry', data);
  }

  async updateExpiryRule(
    ruleId: string,
    data: Partial<StampExpiryRule>,
  ): Promise<ApiResponse<StampExpiryRule>> {
    return this.client.put<StampExpiryRule>(`/stamps/rules/expiry/${ruleId}`, data);
  }

  async deleteExpiryRule(ruleId: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/stamps/rules/expiry/${ruleId}`);
  }

  // --- Upper limit rules ---

  async listUpperLimitRules(params?: PaginationQuery & {
    projectId?: string;
  }): Promise<ApiResponse<PaginatedResponse<StampUpperLimitRule>>> {
    return this.client.get<PaginatedResponse<StampUpperLimitRule>>(
      '/stamps/rules/upper-limit',
      { params },
    );
  }

  async createUpperLimitRule(
    data: Partial<StampUpperLimitRule>,
  ): Promise<ApiResponse<StampUpperLimitRule>> {
    return this.client.post<StampUpperLimitRule>('/stamps/rules/upper-limit', data);
  }

  async updateUpperLimitRule(
    ruleId: string,
    data: Partial<StampUpperLimitRule>,
  ): Promise<ApiResponse<StampUpperLimitRule>> {
    return this.client.put<StampUpperLimitRule>(
      `/stamps/rules/upper-limit/${ruleId}`,
      data,
    );
  }

  async deleteUpperLimitRule(ruleId: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/stamps/rules/upper-limit/${ruleId}`);
  }

  // --- Campaign stamp rules ---

  async listCampaignStampRules(params?: PaginationQuery & {
    campaignId?: string;
    projectId?: string;
  }): Promise<ApiResponse<PaginatedResponse<CampaignStampRule>>> {
    return this.client.get<PaginatedResponse<CampaignStampRule>>(
      '/stamps/rules/campaign',
      { params },
    );
  }

  async createCampaignStampRule(
    data: Partial<CampaignStampRule>,
  ): Promise<ApiResponse<CampaignStampRule>> {
    return this.client.post<CampaignStampRule>('/stamps/rules/campaign', data);
  }

  async updateCampaignStampRule(
    ruleId: string,
    data: Partial<CampaignStampRule>,
  ): Promise<ApiResponse<CampaignStampRule>> {
    return this.client.put<CampaignStampRule>(
      `/stamps/rules/campaign/${ruleId}`,
      data,
    );
  }

  async deleteCampaignStampRule(ruleId: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/stamps/rules/campaign/${ruleId}`);
  }

  // --- Online activity stamp rules ---

  async listOnlineActivityRules(params?: PaginationQuery & {
    projectId?: string;
  }): Promise<ApiResponse<PaginatedResponse<OnlineActivityStampRule>>> {
    return this.client.get<PaginatedResponse<OnlineActivityStampRule>>(
      '/stamps/rules/online-activity',
      { params },
    );
  }

  async createOnlineActivityRule(
    data: Partial<OnlineActivityStampRule>,
  ): Promise<ApiResponse<OnlineActivityStampRule>> {
    return this.client.post<OnlineActivityStampRule>(
      '/stamps/rules/online-activity',
      data,
    );
  }

  async updateOnlineActivityRule(
    ruleId: string,
    data: Partial<OnlineActivityStampRule>,
  ): Promise<ApiResponse<OnlineActivityStampRule>> {
    return this.client.put<OnlineActivityStampRule>(
      `/stamps/rules/online-activity/${ruleId}`,
      data,
    );
  }

  // --- Stamp info ---

  async listStampInfo(params?: PaginationQuery & {
    projectId?: string;
  }): Promise<ApiResponse<PaginatedResponse<StampInfoItem>>> {
    return this.client.get<PaginatedResponse<StampInfoItem>>('/stamps/info', {
      params,
    });
  }

  async createStampInfo(
    data: Partial<StampInfoItem>,
  ): Promise<ApiResponse<StampInfoItem>> {
    return this.client.post<StampInfoItem>('/stamps/info', data);
  }

  async updateStampInfo(
    itemId: string,
    data: Partial<StampInfoItem>,
  ): Promise<ApiResponse<StampInfoItem>> {
    return this.client.put<StampInfoItem>(`/stamps/info/${itemId}`, data);
  }

  async deleteStampInfo(itemId: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/stamps/info/${itemId}`);
  }

  // --- Clearing report ---

  async getClearingReport(params: {
    groupId: string;
    projectId?: string;
    startDate: string;
    endDate: string;
  }): Promise<ApiResponse<StampClearingReport>> {
    return this.client.get<StampClearingReport>('/stamps/clearing-report', {
      params,
    });
  }
}

// ---------------------------------------------------------------------------
// Merchants module
// ---------------------------------------------------------------------------

class MerchantsModule extends BaseModule {
  async list(params?: PaginationQuery & {
    projectId?: string;
    category?: string;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<Merchant>>> {
    return this.client.get<PaginatedResponse<Merchant>>('/merchants', { params });
  }

  async get(merchantId: string): Promise<ApiResponse<Merchant>> {
    return this.client.get<Merchant>(`/merchants/${merchantId}`);
  }

  async create(data: Partial<Merchant>): Promise<ApiResponse<Merchant>> {
    return this.client.post<Merchant>('/merchants', data);
  }

  async update(
    merchantId: string,
    data: Partial<Merchant>,
  ): Promise<ApiResponse<Merchant>> {
    return this.client.put<Merchant>(`/merchants/${merchantId}`, data);
  }

  async delete(merchantId: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/merchants/${merchantId}`);
  }

  // --- Merchant accounts ---

  async listAccounts(
    merchantId: string,
    params?: PaginationQuery,
  ): Promise<ApiResponse<PaginatedResponse<MerchantAccount>>> {
    return this.client.get<PaginatedResponse<MerchantAccount>>(
      `/merchants/${merchantId}/accounts`,
      { params },
    );
  }

  async createAccount(
    merchantId: string,
    data: Partial<MerchantAccount>,
  ): Promise<ApiResponse<MerchantAccount>> {
    return this.client.post<MerchantAccount>(
      `/merchants/${merchantId}/accounts`,
      data,
    );
  }

  async updateAccount(
    merchantId: string,
    accountId: string,
    data: Partial<MerchantAccount>,
  ): Promise<ApiResponse<MerchantAccount>> {
    return this.client.put<MerchantAccount>(
      `/merchants/${merchantId}/accounts/${accountId}`,
      data,
    );
  }

  async deleteAccount(
    merchantId: string,
    accountId: string,
  ): Promise<ApiResponse<void>> {
    return this.client.delete<void>(
      `/merchants/${merchantId}/accounts/${accountId}`,
    );
  }

  // --- Stamp actions ---

  async processStampAction(
    data: MerchantStampAction,
  ): Promise<ApiResponse<{ transactionId: string }>> {
    return this.client.post<{ transactionId: string }>(
      '/merchants/stamp-action',
      data,
    );
  }

  // --- Stats ---

  async getStats(
    merchantId: string,
    params?: { startDate?: string; endDate?: string },
  ): Promise<ApiResponse<MerchantStats>> {
    return this.client.get<MerchantStats>(`/merchants/${merchantId}/stats`, {
      params,
    });
  }
}

// ---------------------------------------------------------------------------
// Campaigns module
// ---------------------------------------------------------------------------

class CampaignsModule extends BaseModule {
  // --- Campaigns ---

  async list(params?: PaginationQuery & {
    projectId?: string;
    type?: string;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<Campaign>>> {
    return this.client.get<PaginatedResponse<Campaign>>('/campaigns', { params });
  }

  async get(campaignId: string): Promise<ApiResponse<Campaign>> {
    return this.client.get<Campaign>(`/campaigns/${campaignId}`);
  }

  async create(data: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    return this.client.post<Campaign>('/campaigns', data);
  }

  async update(
    campaignId: string,
    data: Partial<Campaign>,
  ): Promise<ApiResponse<Campaign>> {
    return this.client.put<Campaign>(`/campaigns/${campaignId}`, data);
  }

  async delete(campaignId: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/campaigns/${campaignId}`);
  }

  async publish(campaignId: string): Promise<ApiResponse<Campaign>> {
    return this.client.post<Campaign>(`/campaigns/${campaignId}/publish`);
  }

  async pause(campaignId: string): Promise<ApiResponse<Campaign>> {
    return this.client.post<Campaign>(`/campaigns/${campaignId}/pause`);
  }

  async cancel(campaignId: string): Promise<ApiResponse<Campaign>> {
    return this.client.post<Campaign>(`/campaigns/${campaignId}/cancel`);
  }

  // --- Coupons ---

  async listCoupons(params?: PaginationQuery & {
    projectId?: string;
    campaignId?: string;
    type?: string;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<Coupon>>> {
    return this.client.get<PaginatedResponse<Coupon>>('/campaigns/coupons', {
      params,
    });
  }

  async getCoupon(couponId: string): Promise<ApiResponse<Coupon>> {
    return this.client.get<Coupon>(`/campaigns/coupons/${couponId}`);
  }

  async createCoupon(data: Partial<Coupon>): Promise<ApiResponse<Coupon>> {
    return this.client.post<Coupon>('/campaigns/coupons', data);
  }

  async updateCoupon(
    couponId: string,
    data: Partial<Coupon>,
  ): Promise<ApiResponse<Coupon>> {
    return this.client.put<Coupon>(`/campaigns/coupons/${couponId}`, data);
  }

  async deleteCoupon(couponId: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/campaigns/coupons/${couponId}`);
  }

  async issueCoupon(
    couponId: string,
    memberIds: string[],
  ): Promise<ApiResponse<CouponInstance[]>> {
    return this.client.post<CouponInstance[]>(
      `/campaigns/coupons/${couponId}/issue`,
      { memberIds },
    );
  }

  async redeemCoupon(
    instanceId: string,
    merchantId: string,
  ): Promise<ApiResponse<CouponInstance>> {
    return this.client.post<CouponInstance>(
      `/campaigns/coupons/instances/${instanceId}/redeem`,
      { merchantId },
    );
  }

  async getMemberCoupons(
    memberId: string,
    params?: PaginationQuery & { status?: string },
  ): Promise<ApiResponse<PaginatedResponse<CouponInstance>>> {
    return this.client.get<PaginatedResponse<CouponInstance>>(
      `/campaigns/coupons/member/${memberId}`,
      { params },
    );
  }

  // --- Lucky draws ---

  async listLuckyDraws(params?: PaginationQuery & {
    projectId?: string;
    campaignId?: string;
  }): Promise<ApiResponse<PaginatedResponse<LuckyDraw>>> {
    return this.client.get<PaginatedResponse<LuckyDraw>>('/campaigns/lucky-draws', {
      params,
    });
  }

  async getLuckyDraw(luckyDrawId: string): Promise<ApiResponse<LuckyDraw>> {
    return this.client.get<LuckyDraw>(`/campaigns/lucky-draws/${luckyDrawId}`);
  }

  async createLuckyDraw(data: Partial<LuckyDraw>): Promise<ApiResponse<LuckyDraw>> {
    return this.client.post<LuckyDraw>('/campaigns/lucky-draws', data);
  }

  async updateLuckyDraw(
    luckyDrawId: string,
    data: Partial<LuckyDraw>,
  ): Promise<ApiResponse<LuckyDraw>> {
    return this.client.put<LuckyDraw>(
      `/campaigns/lucky-draws/${luckyDrawId}`,
      data,
    );
  }

  async participateInLuckyDraw(
    luckyDrawId: string,
    memberId: string,
  ): Promise<ApiResponse<{ prizeId: string | null; prizeName: string | null }>> {
    return this.client.post<{ prizeId: string | null; prizeName: string | null }>(
      `/campaigns/lucky-draws/${luckyDrawId}/participate`,
      { memberId },
    );
  }

  // --- Gifts ---

  async listGifts(params?: PaginationQuery & {
    projectId?: string;
    type?: string;
  }): Promise<ApiResponse<PaginatedResponse<Gift>>> {
    return this.client.get<PaginatedResponse<Gift>>('/campaigns/gifts', { params });
  }

  async getGift(giftId: string): Promise<ApiResponse<Gift>> {
    return this.client.get<Gift>(`/campaigns/gifts/${giftId}`);
  }

  async createGift(data: Partial<Gift>): Promise<ApiResponse<Gift>> {
    return this.client.post<Gift>('/campaigns/gifts', data);
  }

  async updateGift(
    giftId: string,
    data: Partial<Gift>,
  ): Promise<ApiResponse<Gift>> {
    return this.client.put<Gift>(`/campaigns/gifts/${giftId}`, data);
  }

  async deleteGift(giftId: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/campaigns/gifts/${giftId}`);
  }

  async redeemGift(
    giftId: string,
    memberId: string,
  ): Promise<ApiResponse<{ redemptionId: string }>> {
    return this.client.post<{ redemptionId: string }>(
      `/campaigns/gifts/${giftId}/redeem`,
      { memberId },
    );
  }
}

// ---------------------------------------------------------------------------
// Content module
// ---------------------------------------------------------------------------

class ContentModule extends BaseModule {
  // --- Articles ---

  async listArticles(params?: PaginationQuery & {
    projectId?: string;
    category?: string;
    publishStatus?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<ContentArticle>>> {
    return this.client.get<PaginatedResponse<ContentArticle>>('/content/articles', {
      params,
    });
  }

  async getArticle(articleId: string): Promise<ApiResponse<ContentArticle>> {
    return this.client.get<ContentArticle>(`/content/articles/${articleId}`);
  }

  async createArticle(
    data: Partial<ContentArticle>,
  ): Promise<ApiResponse<ContentArticle>> {
    return this.client.post<ContentArticle>('/content/articles', data);
  }

  async updateArticle(
    articleId: string,
    data: Partial<ContentArticle>,
  ): Promise<ApiResponse<ContentArticle>> {
    return this.client.put<ContentArticle>(`/content/articles/${articleId}`, data);
  }

  async deleteArticle(articleId: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/content/articles/${articleId}`);
  }

  async publishArticle(articleId: string): Promise<ApiResponse<ContentArticle>> {
    return this.client.post<ContentArticle>(
      `/content/articles/${articleId}/publish`,
    );
  }

  async archiveArticle(articleId: string): Promise<ApiResponse<ContentArticle>> {
    return this.client.post<ContentArticle>(
      `/content/articles/${articleId}/archive`,
    );
  }

  // --- Banners ---

  async listBanners(params?: PaginationQuery & {
    projectId?: string;
    position?: string;
  }): Promise<ApiResponse<PaginatedResponse<Banner>>> {
    return this.client.get<PaginatedResponse<Banner>>('/content/banners', {
      params,
    });
  }

  async getBanner(bannerId: string): Promise<ApiResponse<Banner>> {
    return this.client.get<Banner>(`/content/banners/${bannerId}`);
  }

  async createBanner(data: Partial<Banner>): Promise<ApiResponse<Banner>> {
    return this.client.post<Banner>('/content/banners', data);
  }

  async updateBanner(
    bannerId: string,
    data: Partial<Banner>,
  ): Promise<ApiResponse<Banner>> {
    return this.client.put<Banner>(`/content/banners/${bannerId}`, data);
  }

  async deleteBanner(bannerId: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/content/banners/${bannerId}`);
  }

  // --- Push notifications ---

  async listNotifications(params?: PaginationQuery & {
    projectId?: string;
    type?: string;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<PushNotification>>> {
    return this.client.get<PaginatedResponse<PushNotification>>(
      '/content/notifications',
      { params },
    );
  }

  async getNotification(
    notificationId: string,
  ): Promise<ApiResponse<PushNotification>> {
    return this.client.get<PushNotification>(
      `/content/notifications/${notificationId}`,
    );
  }

  async createNotification(
    data: Partial<PushNotification>,
  ): Promise<ApiResponse<PushNotification>> {
    return this.client.post<PushNotification>('/content/notifications', data);
  }

  async updateNotification(
    notificationId: string,
    data: Partial<PushNotification>,
  ): Promise<ApiResponse<PushNotification>> {
    return this.client.put<PushNotification>(
      `/content/notifications/${notificationId}`,
      data,
    );
  }

  async deleteNotification(notificationId: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/content/notifications/${notificationId}`);
  }

  async sendNotification(
    notificationId: string,
  ): Promise<ApiResponse<PushNotification>> {
    return this.client.post<PushNotification>(
      `/content/notifications/${notificationId}/send`,
    );
  }

  // --- Notification templates ---

  async listNotificationTemplates(
    params?: PaginationQuery,
  ): Promise<ApiResponse<PaginatedResponse<NotificationTemplate>>> {
    return this.client.get<PaginatedResponse<NotificationTemplate>>(
      '/content/notification-templates',
      { params },
    );
  }

  async createNotificationTemplate(
    data: Partial<NotificationTemplate>,
  ): Promise<ApiResponse<NotificationTemplate>> {
    return this.client.post<NotificationTemplate>(
      '/content/notification-templates',
      data,
    );
  }

  async updateNotificationTemplate(
    templateId: string,
    data: Partial<NotificationTemplate>,
  ): Promise<ApiResponse<NotificationTemplate>> {
    return this.client.put<NotificationTemplate>(
      `/content/notification-templates/${templateId}`,
      data,
    );
  }

  async deleteNotificationTemplate(
    templateId: string,
  ): Promise<ApiResponse<void>> {
    return this.client.delete<void>(
      `/content/notification-templates/${templateId}`,
    );
  }

  // --- Service directories ---

  async listServiceDirectories(params?: PaginationQuery & {
    projectId?: string;
    category?: string;
  }): Promise<ApiResponse<PaginatedResponse<ServiceDirectory>>> {
    return this.client.get<PaginatedResponse<ServiceDirectory>>(
      '/content/service-directories',
      { params },
    );
  }

  async getServiceDirectory(
    directoryId: string,
  ): Promise<ApiResponse<ServiceDirectory>> {
    return this.client.get<ServiceDirectory>(
      `/content/service-directories/${directoryId}`,
    );
  }

  async createServiceDirectory(
    data: Partial<ServiceDirectory>,
  ): Promise<ApiResponse<ServiceDirectory>> {
    return this.client.post<ServiceDirectory>(
      '/content/service-directories',
      data,
    );
  }

  async updateServiceDirectory(
    directoryId: string,
    data: Partial<ServiceDirectory>,
  ): Promise<ApiResponse<ServiceDirectory>> {
    return this.client.put<ServiceDirectory>(
      `/content/service-directories/${directoryId}`,
      data,
    );
  }

  async deleteServiceDirectory(directoryId: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(
      `/content/service-directories/${directoryId}`,
    );
  }

  // --- Venues ---

  async listVenues(params?: PaginationQuery & {
    projectId?: string;
  }): Promise<ApiResponse<PaginatedResponse<Venue>>> {
    return this.client.get<PaginatedResponse<Venue>>('/content/venues', {
      params,
    });
  }

  async getVenue(venueId: string): Promise<ApiResponse<Venue>> {
    return this.client.get<Venue>(`/content/venues/${venueId}`);
  }

  async createVenue(data: Partial<Venue>): Promise<ApiResponse<Venue>> {
    return this.client.post<Venue>('/content/venues', data);
  }

  async updateVenue(
    venueId: string,
    data: Partial<Venue>,
  ): Promise<ApiResponse<Venue>> {
    return this.client.put<Venue>(`/content/venues/${venueId}`, data);
  }

  // --- Floor plans ---

  async listFloorPlans(
    venueId: string,
  ): Promise<ApiResponse<FloorPlan[]>> {
    return this.client.get<FloorPlan[]>(`/content/venues/${venueId}/floor-plans`);
  }

  async createFloorPlan(
    venueId: string,
    data: Partial<FloorPlan>,
  ): Promise<ApiResponse<FloorPlan>> {
    return this.client.post<FloorPlan>(
      `/content/venues/${venueId}/floor-plans`,
      data,
    );
  }

  async updateFloorPlan(
    venueId: string,
    floorPlanId: string,
    data: Partial<FloorPlan>,
  ): Promise<ApiResponse<FloorPlan>> {
    return this.client.put<FloorPlan>(
      `/content/venues/${venueId}/floor-plans/${floorPlanId}`,
      data,
    );
  }

  async deleteFloorPlan(
    venueId: string,
    floorPlanId: string,
  ): Promise<ApiResponse<void>> {
    return this.client.delete<void>(
      `/content/venues/${venueId}/floor-plans/${floorPlanId}`,
    );
  }

  // --- File upload ---

  async uploadFile(formData: FormData): Promise<ApiResponse<{
    url: string;
    key: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }>> {
    return this.client.upload<{
      url: string;
      key: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
    }>('/content/upload', formData);
  }
}

// ---------------------------------------------------------------------------
// Reports module
// ---------------------------------------------------------------------------

class ReportsModule extends BaseModule {
  async getMemberStatistics(params: {
    startDate: string;
    endDate: string;
    groupId?: string;
    projectId?: string;
  }): Promise<ApiResponse<MemberStatisticsReport>> {
    return this.client.get<MemberStatisticsReport>('/reports/member-statistics', {
      params,
    });
  }

  async getStampStatistics(params: {
    startDate: string;
    endDate: string;
    groupId?: string;
    projectId?: string;
  }): Promise<ApiResponse<StampStatisticsReport>> {
    return this.client.get<StampStatisticsReport>('/reports/stamp-statistics', {
      params,
    });
  }

  async getGroupStampClearing(params: {
    startDate: string;
    endDate: string;
    groupId: string;
  }): Promise<ApiResponse<GroupStampClearingReport>> {
    return this.client.get<GroupStampClearingReport>(
      '/reports/group-stamp-clearing',
      { params },
    );
  }

  async getRegistrationConversion(params: {
    startDate: string;
    endDate: string;
    projectId: string;
  }): Promise<ApiResponse<RegistrationConversionReport>> {
    return this.client.get<RegistrationConversionReport>(
      '/reports/registration-conversion',
      { params },
    );
  }

  async getMemberActivity(params: {
    startDate: string;
    endDate: string;
    projectId: string;
  }): Promise<ApiResponse<MemberActivityReport>> {
    return this.client.get<MemberActivityReport>('/reports/member-activity', {
      params,
    });
  }

  async getUsageStatistics(params: {
    startDate: string;
    endDate: string;
    projectId: string;
  }): Promise<ApiResponse<UsageStatisticsReport>> {
    return this.client.get<UsageStatisticsReport>('/reports/usage-statistics', {
      params,
    });
  }

  async getOnlineActivity(params: {
    startDate: string;
    endDate: string;
    projectId: string;
  }): Promise<ApiResponse<OnlineActivityReport>> {
    return this.client.get<OnlineActivityReport>('/reports/online-activity', {
      params,
    });
  }

  async getCampaignPromotion(params: {
    startDate: string;
    endDate: string;
    projectId?: string;
  }): Promise<ApiResponse<CampaignPromotionReport>> {
    return this.client.get<CampaignPromotionReport>(
      '/reports/campaign-promotion',
      { params },
    );
  }

  async getServiceUsage(params: {
    startDate: string;
    endDate: string;
    projectId: string;
  }): Promise<ApiResponse<ServiceUsageReport>> {
    return this.client.get<ServiceUsageReport>('/reports/service-usage', {
      params,
    });
  }

  // --- Downloads ---

  async requestDownload(params: {
    reportType: string;
    fileFormat: 'xlsx' | 'csv' | 'pdf';
    filters: Record<string, unknown>;
  }): Promise<ApiResponse<ReportDownload>> {
    return this.client.post<ReportDownload>('/reports/downloads', params);
  }

  async listDownloads(
    params?: PaginationQuery,
  ): Promise<ApiResponse<PaginatedResponse<ReportDownload>>> {
    return this.client.get<PaginatedResponse<ReportDownload>>(
      '/reports/downloads',
      { params },
    );
  }

  async getDownload(downloadId: string): Promise<ApiResponse<ReportDownload>> {
    return this.client.get<ReportDownload>(`/reports/downloads/${downloadId}`);
  }

  // --- Operation logs ---

  async listOperationLogs(params?: PaginationQuery & {
    module?: string;
    action?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<PaginatedResponse<OperationLog>>> {
    return this.client.get<PaginatedResponse<OperationLog>>(
      '/reports/operation-logs',
      { params },
    );
  }
}

// ---------------------------------------------------------------------------
// Risk control module
// ---------------------------------------------------------------------------

class RiskControlModule extends BaseModule {
  /** Get the risk control workbench dashboard. */
  async getDashboard(params?: {
    groupId?: string;
    projectId?: string;
  }): Promise<ApiResponse<RiskControlDashboard>> {
    return this.client.get<RiskControlDashboard>('/risk-control/dashboard', {
      params,
    });
  }

  // --- Risk alerts ---

  async listAlerts(params?: PaginationQuery & {
    projectId?: string;
    type?: string;
    level?: string;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<RiskAlert>>> {
    return this.client.get<PaginatedResponse<RiskAlert>>('/risk-control/alerts', {
      params,
    });
  }

  async getAlert(alertId: string): Promise<ApiResponse<RiskAlert>> {
    return this.client.get<RiskAlert>(`/risk-control/alerts/${alertId}`);
  }

  async resolveAlert(
    alertId: string,
    resolution: {
      action: 'approve' | 'reject' | 'escalate' | 'block';
      comment: string;
    },
  ): Promise<ApiResponse<RiskAlert>> {
    return this.client.post<RiskAlert>(
      `/risk-control/alerts/${alertId}/resolve`,
      resolution,
    );
  }

  async assignAlert(
    alertId: string,
    assigneeId: string,
  ): Promise<ApiResponse<RiskAlert>> {
    return this.client.post<RiskAlert>(
      `/risk-control/alerts/${alertId}/assign`,
      { assigneeId },
    );
  }

  // --- Abnormal stamp events ---

  async listAbnormalStampEvents(params?: PaginationQuery & {
    projectId?: string;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<AbnormalStampEvent>>> {
    return this.client.get<PaginatedResponse<AbnormalStampEvent>>(
      '/risk-control/abnormal-stamps',
      { params },
    );
  }

  async reviewAbnormalStamp(
    data: StampAnomalyReview,
  ): Promise<ApiResponse<AbnormalStampEvent>> {
    return this.client.post<AbnormalStampEvent>(
      '/risk-control/abnormal-stamps/review',
      data,
    );
  }

  // --- Abnormal member review ---

  async listAbnormalMembers(params?: PaginationQuery & {
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<AbnormalMemberReview>>> {
    return this.client.get<PaginatedResponse<AbnormalMemberReview>>(
      '/risk-control/abnormal-members',
      { params },
    );
  }

  async reviewAbnormalMember(
    reviewId: string,
    data: {
      status: 'cleared' | 'suspended' | 'banned';
      reviewNote: string;
    },
  ): Promise<ApiResponse<AbnormalMemberReview>> {
    return this.client.post<AbnormalMemberReview>(
      `/risk-control/abnormal-members/${reviewId}/review`,
      data,
    );
  }

  // --- Risk control rules ---

  async listRules(params?: PaginationQuery & {
    projectId?: string;
    groupId?: string;
    type?: string;
  }): Promise<ApiResponse<PaginatedResponse<RiskControlRule>>> {
    return this.client.get<PaginatedResponse<RiskControlRule>>(
      '/risk-control/rules',
      { params },
    );
  }

  async getRule(ruleId: string): Promise<ApiResponse<RiskControlRule>> {
    return this.client.get<RiskControlRule>(`/risk-control/rules/${ruleId}`);
  }

  async createRule(
    data: Partial<RiskControlRule>,
  ): Promise<ApiResponse<RiskControlRule>> {
    return this.client.post<RiskControlRule>('/risk-control/rules', data);
  }

  async updateRule(
    ruleId: string,
    data: Partial<RiskControlRule>,
  ): Promise<ApiResponse<RiskControlRule>> {
    return this.client.put<RiskControlRule>(
      `/risk-control/rules/${ruleId}`,
      data,
    );
  }

  async deleteRule(ruleId: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/risk-control/rules/${ruleId}`);
  }
}

// ---------------------------------------------------------------------------
// Organizations module
// ---------------------------------------------------------------------------

class OrganizationsModule extends BaseModule {
  // --- Groups ---

  async listGroups(
    params?: PaginationQuery,
  ): Promise<ApiResponse<PaginatedResponse<Group>>> {
    return this.client.get<PaginatedResponse<Group>>('/organizations/groups', {
      params,
    });
  }

  async getGroup(groupId: string): Promise<ApiResponse<Group>> {
    return this.client.get<Group>(`/organizations/groups/${groupId}`);
  }

  async createGroup(data: Partial<Group>): Promise<ApiResponse<Group>> {
    return this.client.post<Group>('/organizations/groups', data);
  }

  async updateGroup(
    groupId: string,
    data: Partial<Group>,
  ): Promise<ApiResponse<Group>> {
    return this.client.put<Group>(`/organizations/groups/${groupId}`, data);
  }

  // --- Organization units ---

  async listUnits(params?: PaginationQuery & {
    groupId?: string;
    parentId?: string;
    type?: string;
  }): Promise<ApiResponse<PaginatedResponse<OrganizationUnit>>> {
    return this.client.get<PaginatedResponse<OrganizationUnit>>(
      '/organizations/units',
      { params },
    );
  }

  async getUnit(unitId: string): Promise<ApiResponse<OrganizationUnit>> {
    return this.client.get<OrganizationUnit>(`/organizations/units/${unitId}`);
  }

  async createUnit(
    data: Partial<OrganizationUnit>,
  ): Promise<ApiResponse<OrganizationUnit>> {
    return this.client.post<OrganizationUnit>('/organizations/units', data);
  }

  async updateUnit(
    unitId: string,
    data: Partial<OrganizationUnit>,
  ): Promise<ApiResponse<OrganizationUnit>> {
    return this.client.put<OrganizationUnit>(
      `/organizations/units/${unitId}`,
      data,
    );
  }

  async deleteUnit(unitId: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/organizations/units/${unitId}`);
  }

  /** Get the hierarchical organization tree for a group. */
  async getUnitTree(
    groupId: string,
  ): Promise<ApiResponse<OrganizationUnit[]>> {
    return this.client.get<OrganizationUnit[]>(
      `/organizations/groups/${groupId}/tree`,
    );
  }

  // --- Projects ---

  async listProjects(params?: PaginationQuery & {
    groupId?: string;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<Project>>> {
    return this.client.get<PaginatedResponse<Project>>(
      '/organizations/projects',
      { params },
    );
  }

  async getProject(projectId: string): Promise<ApiResponse<Project>> {
    return this.client.get<Project>(`/organizations/projects/${projectId}`);
  }

  async createProject(data: Partial<Project>): Promise<ApiResponse<Project>> {
    return this.client.post<Project>('/organizations/projects', data);
  }

  async updateProject(
    projectId: string,
    data: Partial<Project>,
  ): Promise<ApiResponse<Project>> {
    return this.client.put<Project>(
      `/organizations/projects/${projectId}`,
      data,
    );
  }

  async deleteProject(projectId: string): Promise<ApiResponse<void>> {
    return this.client.delete<void>(`/organizations/projects/${projectId}`);
  }
}

// ---------------------------------------------------------------------------
// Factory helper
// ---------------------------------------------------------------------------

/**
 * Create a pre-configured LinkReitApiClient instance.
 *
 * @example
 * ```ts
 * const client = createApiClient({
 *   baseURL: process.env.API_BASE_URL!,
 *   locale: 'zh-TW',
 *   onSessionExpired: () => router.push('/login'),
 * });
 * ```
 */
export function createApiClient(config: ApiClientConfig): LinkReitApiClient {
  return new LinkReitApiClient(config);
}
