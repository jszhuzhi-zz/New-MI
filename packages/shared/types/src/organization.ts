import { AuditFields, CommonStatus, MultiLangText, DataSyncMode } from './common';

/** Group (集团) - Top level organization */
export interface Group extends AuditFields {
  id: string;
  name: MultiLangText;
  code: string;
  logo?: string;
  status: CommonStatus;
  contactEmail: string;
  contactPhone: string;
  address: MultiLangText;
  /** Stamp mode configuration at group level */
  stampMode: StampMode;
  settings: GroupSettings;
}

export type StampMode = 'earn-and-burn' | 'tier-based' | 'hybrid';

export interface GroupSettings {
  /** Default locale */
  defaultLocale: 'zh-CN' | 'zh-TW' | 'en';
  /** Supported locales */
  supportedLocales: ('zh-CN' | 'zh-TW' | 'en')[];
  /** Currency */
  currency: string;
  /** Timezone */
  timezone: string;
  /** Member card number generation rule */
  memberCardRule: MemberCardGenerationRule;
  /** Data sync mode */
  dataSyncMode: DataSyncMode;
}

export interface MemberCardGenerationRule {
  prefix: string;
  length: number;
  type: 'sequential' | 'random';
}

/** Organization unit within a group */
export interface OrganizationUnit extends AuditFields {
  id: string;
  groupId: string;
  parentId?: string;
  name: MultiLangText;
  code: string;
  type: 'region' | 'district' | 'department';
  status: CommonStatus;
  sortOrder: number;
}

/** Project (项目/商场) - A mall or property */
export interface Project extends AuditFields {
  id: string;
  groupId: string;
  organizationUnitId?: string;
  name: MultiLangText;
  code: string;
  type: ProjectType;
  status: CommonStatus;
  address: MultiLangText;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  contactPhone: string;
  contactEmail: string;
  operatingHours: OperatingHours;
  logo?: string;
  images: string[];
  description: MultiLangText;
  settings: ProjectSettings;
}

export type ProjectType = 'shopping-mall' | 'retail-park' | 'mixed-use';

export interface OperatingHours {
  weekday: { open: string; close: string };
  weekend: { open: string; close: string };
  holiday: { open: string; close: string };
}

export interface ProjectSettings {
  /** Data sync mode - local or from group data center */
  dataSyncMode: DataSyncMode;
  /** Whether this project has its own stamp rules */
  hasOwnStampRules: boolean;
  /** Max stamps per transaction */
  maxStampsPerTransaction?: number;
  /** Enable receipt scanning */
  receiptScanEnabled: boolean;
  /** Parking integration */
  parkingIntegrationEnabled: boolean;
}

/** Architecture configuration - 组织架构配置 */
export interface ArchitectureConfig {
  id: string;
  groupId: string;
  levels: ArchitectureLevel[];
}

export interface ArchitectureLevel {
  level: number;
  name: MultiLangText;
  code: string;
}
