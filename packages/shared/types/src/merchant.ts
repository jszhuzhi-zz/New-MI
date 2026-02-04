import { AuditFields, CommonStatus, MultiLangText } from './common';

/** Merchant (商户) */
export interface Merchant extends AuditFields {
  id: string;
  projectId: string;
  groupId: string;
  name: MultiLangText;
  code: string;
  /** Business category */
  category: MerchantCategory;
  /** Sub-category */
  subCategory?: string;
  /** Brand info */
  brand?: {
    name: MultiLangText;
    logo: string;
    description: MultiLangText;
  };
  /** Location in mall */
  location: {
    floor: string;
    unit: string;
    zone?: string;
  };
  /** Contact */
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  /** Operating hours */
  operatingHours: {
    weekday: { open: string; close: string };
    weekend: { open: string; close: string };
  };
  /** Images */
  logo?: string;
  images: string[];
  /** Description */
  description: MultiLangText;
  /** Whether stamp earning is enabled */
  stampEnabled: boolean;
  /** Stamp earning multiplier for this merchant */
  stampMultiplier: number;
  /** Status */
  status: CommonStatus;
  /** Data source: local or synced from group */
  dataSource: 'local' | 'group-sync';
}

export type MerchantCategory =
  | 'food-beverage'      // 餐饮
  | 'fashion'            // 时装
  | 'beauty'             // 美容
  | 'electronics'        // 电子
  | 'lifestyle'          // 生活方式
  | 'entertainment'      // 娱乐
  | 'services'           // 服务
  | 'supermarket'        // 超市
  | 'health'             // 健康
  | 'education'          // 教育
  | 'other';             // 其他

/** Merchant account for merchant portal */
export interface MerchantAccount extends AuditFields {
  id: string;
  merchantId: string;
  userId: string;
  role: 'owner' | 'manager' | 'staff';
  permissions: string[];
  status: CommonStatus;
}

/** Merchant stamp processing */
export interface MerchantStampAction {
  merchantId: string;
  memberId: string;
  /** Transaction type */
  type: 'earn' | 'redeem';
  /** Receipt amount */
  receiptAmount?: number;
  /** Number of stamps */
  stamps: number;
  /** Receipt image */
  receiptImage?: string;
  /** Receipt number */
  receiptNo?: string;
  /** Notes */
  notes?: string;
}

/** Merchant statistics */
export interface MerchantStats {
  merchantId: string;
  period: { startDate: Date; endDate: Date };
  totalTransactions: number;
  totalStampsIssued: number;
  totalStampsRedeemed: number;
  uniqueMembers: number;
  averageTransactionValue: number;
}
