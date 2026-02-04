import { AuditFields, CommonStatus, PortalType } from './common';

/** User account (账号管理) */
export interface UserAccount extends AuditFields {
  id: string;
  username: string;
  email: string;
  phone?: string;
  /** Which portal this account belongs to */
  portalType: PortalType;
  /** Group/Project/Merchant binding */
  entityType: 'group' | 'project' | 'merchant';
  entityId: string;
  /** Role IDs */
  roleIds: string[];
  status: CommonStatus;
  /** Last login */
  lastLoginAt?: Date;
  lastLoginIp?: string;
  /** Login settings */
  mfaEnabled: boolean;
  /** M365 AD integration */
  m365AdLinked: boolean;
  m365AdId?: string;
  /** Login log visible for personal account */
  loginHistory: LoginRecord[];
}

/** Login record (登录日志) */
export interface LoginRecord {
  id: string;
  userId: string;
  loginAt: Date;
  ipAddress: string;
  userAgent: string;
  platform: string;
  success: boolean;
  failReason?: string;
  /** Support custom field filtering */
  customFields?: Record<string, string>;
}

/** Role (角色管理) */
export interface Role extends AuditFields {
  id: string;
  groupId?: string;
  projectId?: string;
  name: string;
  code: string;
  description: string;
  /** Permission IDs */
  permissions: string[];
  /** Built-in roles cannot be deleted */
  isBuiltIn: boolean;
  /** Color for UI display, support custom and preset colors */
  color?: string;
  status: CommonStatus;
}

/** Permission (权限管理) */
export interface Permission {
  id: string;
  module: string;
  action: string;
  code: string;
  name: string;
  description: string;
  /** Parent permission for tree structure */
  parentId?: string;
  /** Support custom field filtering */
  customFields?: Record<string, string>;
}

/** Permission tree node for UI */
export interface PermissionTreeNode {
  permission: Permission;
  children: PermissionTreeNode[];
  checked: boolean;
}

/** Login settings (登录管理) */
export interface LoginSettings {
  groupId: string;
  /** Supported auth methods per account type */
  authMethods: {
    accountType: string;
    methods: AuthMethod[];
  }[];
  /** M365 AD integration config */
  m365Config?: {
    tenantId: string;
    clientId: string;
    enabled: boolean;
    /** Forced periodic password change */
    forcePasswordChange: boolean;
    passwordChangeIntervalDays: number;
    /** Auto-disable on inactivity */
    autoDisableInactiveDays: number;
  };
  /** SMS verification config */
  smsConfig?: {
    provider: string;
    enabled: boolean;
    templateId: string;
  };
}

export type AuthMethod =
  | 'password'
  | 'sms-otp'
  | 'email-otp'
  | 'm365-sso'
  | 'wechat-oauth'
  | 'apple-id'
  | 'google';

/** Audit log (审查审计) */
export interface AuditLog extends AuditFields {
  id: string;
  userId: string;
  userType: PortalType;
  action: string;
  module: string;
  /** Target entity */
  entityType: string;
  entityId: string;
  /** M365 AD reference */
  m365Reference?: string;
  /** IP address */
  ipAddress: string;
  /** Changes */
  changes?: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
  /** Can view all accounts' login records */
  metadata?: Record<string, unknown>;
}

/** Account group sync status (账目归档联动) */
export interface AccountSyncStatus {
  id: string;
  groupId: string;
  lastSyncAt: Date;
  status: 'synced' | 'pending' | 'error';
  errorMessage?: string;
}
