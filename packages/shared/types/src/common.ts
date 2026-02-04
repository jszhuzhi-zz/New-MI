/** Supported locales */
export type Locale = 'zh-CN' | 'zh-TW' | 'en';

/** Supported platforms */
export type Platform = 'web' | 'ios' | 'android' | 'harmonyos' | 'wechat-mini-program';

/** Portal types */
export type PortalType = 'customer' | 'mall' | 'group' | 'merchant';

/** Paginated request */
export interface PaginationQuery {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** Paginated response */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** API Response wrapper */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

/** Multilingual text field */
export interface MultiLangText {
  'zh-CN': string;
  'zh-TW': string;
  en: string;
}

/** Status for common entities */
export type CommonStatus = 'active' | 'inactive' | 'deleted';

/** Audit fields */
export interface AuditFields {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

/** Data sync mode for shop data */
export type DataSyncMode = 'local' | 'group-sync';

/** File upload result */
export interface FileUploadResult {
  url: string;
  key: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

/** Date range filter */
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

/** Geo coordinates */
export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}
