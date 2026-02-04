import { AuditFields, CommonStatus, MultiLangText, DateRange } from './common';

/**
 * Stamp System (印花体系)
 * Note: "积分" in the requirements refers to stamp/印花 mode
 */

/** Stamp account (印花账户) */
export interface StampAccount {
  id: string;
  memberId: string;
  projectId: string;
  /** Current available stamps */
  balance: number;
  /** Pending stamps (awaiting verification) */
  pendingBalance: number;
  /** Total earned stamps */
  totalEarned: number;
  /** Total redeemed stamps */
  totalRedeemed: number;
  /** Total expired stamps */
  totalExpired: number;
  /** Last transaction date */
  lastTransactionAt?: Date;
}

/** Stamp transaction (印花交易记录) */
export interface StampTransaction extends AuditFields {
  id: string;
  memberId: string;
  memberCardNo: string;
  projectId: string;
  merchantId?: string;
  type: StampTransactionType;
  /** Number of stamps */
  amount: number;
  /** Balance after transaction */
  balanceAfter: number;
  /** Source of the transaction */
  source: StampTransactionSource;
  /** Related receipt */
  receiptId?: string;
  /** Related campaign */
  campaignId?: string;
  /** Reference number */
  referenceNo: string;
  /** Description */
  description: MultiLangText;
  /** Status */
  status: StampTransactionStatus;
  /** Expiry date for earned stamps */
  expiresAt?: Date;
  /** Verification info */
  verification?: StampVerification;
  /** Operator who processed this */
  operatorId?: string;
  operatorType: 'system' | 'staff' | 'merchant';
}

export type StampTransactionType =
  | 'earn'         // 消费获取
  | 'redeem'       // 兑换使用
  | 'bonus'        // 活动赠送
  | 'adjust'       // 人工调整
  | 'expire'       // 过期
  | 'transfer'     // 转移
  | 'refund';      // 退还

export type StampTransactionSource =
  | 'receipt-scan'    // 小票扫描
  | 'manual-entry'    // 人工录入
  | 'auto-sync'       // 自动同步
  | 'campaign'        // 活动
  | 'system-adjust'   // 系统调整
  | 'counter';        // 客服台

export type StampTransactionStatus =
  | 'pending'         // 待审核
  | 'approved'        // 已通过
  | 'rejected'        // 已拒绝
  | 'completed'       // 已完成
  | 'cancelled'       // 已取消
  | 'expired';        // 已过期

/** Stamp verification (印花审核) */
export interface StampVerification {
  verifiedBy?: string;
  verifiedAt?: Date;
  status: 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
  /** Auto-verification result */
  autoVerifyResult?: {
    passed: boolean;
    score: number;
    flags: string[];
  };
}

/** Stamp earning rule (消费积分规则) */
export interface StampEarningRule extends AuditFields {
  id: string;
  groupId?: string;
  projectId?: string;
  name: MultiLangText;
  description: MultiLangText;
  /** Rule priority */
  priority: number;
  /** Earning type */
  type: StampEarningType;
  /** Spending amount to earn 1 stamp */
  spendingPerStamp: number;
  /** Currency */
  currency: string;
  /** Max stamps per transaction */
  maxStampsPerTransaction?: number;
  /** Max stamps per day */
  maxStampsPerDay?: number;
  /** Applicable merchant categories */
  merchantCategories?: string[];
  /** Applicable merchant IDs */
  merchantIds?: string[];
  /** Applicable tier IDs */
  tierIds?: string[];
  /** Date range */
  validDateRange?: DateRange;
  /** Time restrictions */
  timeRestrictions?: TimeRestriction[];
  status: CommonStatus;
}

export type StampEarningType =
  | 'standard'          // 标准规则
  | 'tier-multiplier'   // 等级倍率
  | 'category-bonus'    // 品类加成
  | 'campaign-bonus';   // 活动加成

export interface TimeRestriction {
  dayOfWeek: number[];
  startTime: string;
  endTime: string;
}

/** Stamp consumption rule (消费积分规则) */
export interface StampConsumptionRule extends AuditFields {
  id: string;
  groupId?: string;
  projectId?: string;
  name: MultiLangText;
  description: MultiLangText;
  /** Number of stamps per day allowed for consumption */
  dailyLimit?: number;
  /** Valid days for consumption */
  validDays?: number;
  status: CommonStatus;
}

/** Stamp expiry rule (积分清零规则) */
export interface StampExpiryRule extends AuditFields {
  id: string;
  groupId?: string;
  projectId?: string;
  name: MultiLangText;
  type: StampExpiryType;
  /** For fixed-period: months after earning */
  expiryMonths?: number;
  /** For annual: specific date */
  annualExpiryDate?: { month: number; day: number };
  /** Notification before expiry */
  notificationDays: number[];
  status: CommonStatus;
}

export type StampExpiryType =
  | 'fixed-period'   // 固定周期 (e.g., 12 months after earning)
  | 'annual'         // 年度清零 (e.g., every Dec 31)
  | 'rolling'        // 滚动制
  | 'never';         // 永不过期

/** Stamp upper limit rule (积分上限规则) */
export interface StampUpperLimitRule extends AuditFields {
  id: string;
  projectId: string;
  /** Includes project total cap and per-stamp-event cap */
  type: 'per-transaction' | 'daily' | 'monthly' | 'annual' | 'lifetime';
  limit: number;
  tierOverrides?: { tierId: string; limit: number }[];
  status: CommonStatus;
}

/** Campaign stamp rule (消费积分活动规则) */
export interface CampaignStampRule extends AuditFields {
  id: string;
  projectId?: string;
  groupId?: string;
  campaignId: string;
  name: MultiLangText;
  /** Multiplier or bonus type */
  type: 'multiplier' | 'bonus' | 'fixed';
  /** For multiplier: multiply factor; for bonus: additional stamps; for fixed: exact stamps */
  value: number;
  /** Applicable conditions */
  conditions: CampaignStampCondition[];
  /** Max budget for this campaign */
  maxBudget?: number;
  /** Current used budget */
  usedBudget: number;
  /** Support clearing and accumulation */
  supportsClearAccumulation: boolean;
  validDateRange: DateRange;
  status: CommonStatus;
}

export interface CampaignStampCondition {
  type: 'min-spending' | 'merchant-category' | 'merchant-id' | 'tier' | 'time-of-day' | 'day-of-week';
  operator: 'equals' | 'in' | 'gte' | 'lte' | 'between';
  value: string | string[] | number;
}

/** Tier-based stamp allocation (线上活跃积分规则) */
export interface OnlineActivityStampRule extends AuditFields {
  id: string;
  projectId: string;
  /** Different tiers get different stamp rules */
  tierRules: {
    tierId: string;
    /** Type: 分为两种 */
    type: 'sign-in' | 'purchase' | 'referral' | 'review' | 'event-participation';
    stampsPerAction: number;
    dailyLimit: number;
  }[];
  status: CommonStatus;
}

/** Stamp info item (积分信息) */
export interface StampInfoItem {
  id: string;
  projectId: string;
  name: MultiLangText;
  description: MultiLangText;
  /** Display in stamp info page */
  displayOrder: number;
  status: CommonStatus;
}

/** Group stamp clearing statistics (集团积分清零统计报表) */
export interface StampClearingReport {
  groupId: string;
  projectId?: string;
  period: DateRange;
  /** Stats per project */
  projectStats: {
    projectId: string;
    projectName: MultiLangText;
    totalCleared: number;
    membersAffected: number;
    breakdown: {
      category: string;
      count: number;
    }[];
  }[];
  totalCleared: number;
  totalMembersAffected: number;
}
