import { AuditFields, CommonStatus, MultiLangText, GeoCoordinates } from './common';

/** Member (会员) */
export interface Member extends AuditFields {
  id: string;
  groupId: string;
  /** Member can belong to multiple projects */
  projectIds: string[];
  memberCardNo: string;
  /** Member tier */
  tierId?: string;
  /** Personal info */
  profile: MemberProfile;
  /** Registration source */
  registrationSource: RegistrationSource;
  /** Member status */
  status: MemberStatus;
  /** Tags for segmentation */
  tags: string[];
  /** Custom labels from project */
  labels: MemberLabel[];
  /** Total stamp balance */
  stampBalance: number;
  /** Lifetime stamps earned */
  lifetimeStampsEarned: number;
  /** Registration date */
  registeredAt: Date;
  /** Last active date */
  lastActiveAt: Date;
  /** Special member flag */
  isSpecialMember: boolean;
  /** Blacklist/whitelist status */
  listStatus: 'none' | 'whitelist' | 'blacklist';
}

export interface MemberProfile {
  firstName: string;
  lastName: string;
  displayName: string;
  /** Preferred locale */
  preferredLocale: 'zh-CN' | 'zh-TW' | 'en';
  email?: string;
  phone: string;
  phoneCountryCode: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  dateOfBirth?: Date;
  avatar?: string;
  /** ID document for verification */
  idDocument?: {
    type: 'hkid' | 'passport' | 'other';
    number: string;
    verified: boolean;
  };
  address?: {
    line1: string;
    line2?: string;
    district: string;
    city: string;
    country: string;
  };
  preferences: MemberPreferences;
}

export interface MemberPreferences {
  receiveEmailNotifications: boolean;
  receiveSmsNotifications: boolean;
  receivePushNotifications: boolean;
  preferredCategories: string[];
  favoriteStores: string[];
}

export type MemberStatus = 'active' | 'inactive' | 'suspended' | 'pending-verification';

export type RegistrationSource =
  | 'customer-app'
  | 'wechat-mini-program'
  | 'web'
  | 'counter'       // 客服台会员管理
  | 'import'
  | 'migration';

/** Member label for tagging */
export interface MemberLabel extends AuditFields {
  id: string;
  projectId: string;
  name: MultiLangText;
  color: string;
  category: string;
}

/** Member tier (等级) */
export interface MemberTier extends AuditFields {
  id: string;
  groupId: string;
  name: MultiLangText;
  code: string;
  level: number;
  /** Min stamps to achieve this tier */
  minStamps: number;
  /** Benefits */
  benefits: TierBenefit[];
  /** Card design */
  cardDesign: {
    backgroundColor: string;
    textColor: string;
    backgroundImage?: string;
  };
  status: CommonStatus;
}

export interface TierBenefit {
  id: string;
  type: 'stamp-multiplier' | 'discount' | 'free-parking' | 'lounge-access' | 'priority-service' | 'custom';
  name: MultiLangText;
  description: MultiLangText;
  value: string;
}

/** Member card (会员卡) */
export interface MemberCard {
  id: string;
  memberId: string;
  cardNo: string;
  tierId: string;
  tierName: MultiLangText;
  status: 'active' | 'expired' | 'suspended' | 'replaced';
  issuedAt: Date;
  expiresAt?: Date;
  /** Physical card linked */
  physicalCardNo?: string;
  /** QR code data */
  qrCode: string;
  /** Barcode data */
  barcode: string;
}

/** Customer service counter member management (客服台会员管理) */
export interface CounterMemberRegistration {
  staffId: string;
  projectId: string;
  member: Partial<MemberProfile>;
  /** Can enter member directly at counter */
  registrationType: 'new' | 'lookup' | 'update';
}

/** Member change record (积分变更记录) */
export interface MemberChangeRecord extends AuditFields {
  id: string;
  memberId: string;
  changeType: 'profile' | 'tier' | 'stamp' | 'status' | 'tag' | 'label';
  field: string;
  oldValue: string;
  newValue: string;
  reason: string;
  operatorId: string;
  operatorType: 'system' | 'staff' | 'member';
}

/** Open/close member record (开户/关户开关记录) */
export interface MemberAccountRecord extends AuditFields {
  id: string;
  memberId: string;
  action: 'open' | 'close' | 'suspend' | 'reactivate';
  reason: string;
  operatorId: string;
  previousStatus: MemberStatus;
  newStatus: MemberStatus;
}

/** Member import/export */
export interface MemberImportConfig {
  groupId: string;
  projectId?: string;
  fileUrl: string;
  mapping: Record<string, string>;
  defaultTierId?: string;
  defaultTags?: string[];
  /** Add to whitelist/blacklist */
  listAction?: 'whitelist' | 'blacklist' | 'none';
}

/** Special name list member management (特殊名单用户管理) */
export interface SpecialListMember {
  id: string;
  memberId: string;
  listType: 'whitelist' | 'blacklist';
  reason: string;
  addedBy: string;
  addedAt: Date;
  expiresAt?: Date;
}
