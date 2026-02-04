import { AuditFields, CommonStatus, MultiLangText, DateRange } from './common';

/** Risk Control Center (风控中心) */

/** Risk control workbench (风控工作台) */
export interface RiskControlDashboard {
  /** Pending anomaly reviews */
  pendingAnomalyCount: number;
  /** Today's flagged transactions */
  todayFlaggedCount: number;
  /** Today's auto-blocked count */
  todayAutoBlockedCount: number;
  /** Risk level distribution */
  riskLevelDistribution: {
    level: RiskLevel;
    count: number;
  }[];
  /** Recent alerts */
  recentAlerts: RiskAlert[];
  /** Abnormal stamp events for group staff to review */
  abnormalStampEvents: AbnormalStampEvent[];
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/** Risk alert (风控审核) */
export interface RiskAlert extends AuditFields {
  id: string;
  groupId?: string;
  projectId?: string;
  memberId?: string;
  merchantId?: string;
  type: RiskAlertType;
  level: RiskLevel;
  title: MultiLangText;
  description: MultiLangText;
  /** Flagged transaction or entity */
  referenceType: 'stamp-transaction' | 'member' | 'merchant' | 'receipt';
  referenceId: string;
  status: RiskAlertStatus;
  /** Assigned reviewer */
  assignedTo?: string;
  /** Review result */
  resolution?: {
    action: 'approve' | 'reject' | 'escalate' | 'block';
    comment: string;
    resolvedBy: string;
    resolvedAt: Date;
  };
}

export type RiskAlertType =
  | 'abnormal-stamp'         // 异常印花审核
  | 'suspicious-transaction'  // 可疑交易
  | 'duplicate-receipt'       // 重复小票
  | 'velocity-breach'         // 频率异常
  | 'amount-anomaly'          // 金额异常
  | 'member-fraud'            // 会员欺诈
  | 'merchant-fraud';         // 商户欺诈

export type RiskAlertStatus =
  | 'pending'
  | 'under-review'
  | 'resolved'
  | 'escalated';

/** Abnormal stamp event (异常印花事件) */
export interface AbnormalStampEvent extends AuditFields {
  id: string;
  projectId: string;
  memberId: string;
  transactionId: string;
  /** Anomaly type */
  anomalyType: string;
  /** Anomaly score */
  anomalyScore: number;
  /** Details */
  details: Record<string, unknown>;
  status: 'pending' | 'reviewed' | 'dismissed';
  reviewNote?: string;
}

/** Anomaly stamp review (风控积分审核) */
export interface StampAnomalyReview {
  /** Identify as abnormal stamp */
  alertId: string;
  /** Need to verify the stamp submission */
  stampTransactionId: string;
  /** Can enter manual review */
  reviewAction: 'approve' | 'reject' | 'hold';
  reviewComment: string;
  /** Can redirect to all abnormal stamp entries for manual review */
  redirectToManualReview: boolean;
}

/** Abnormal member review (异常用户审核) */
export interface AbnormalMemberReview {
  id: string;
  memberId: string;
  /** Reason flagged */
  reason: string;
  /** Risk score */
  riskScore: number;
  /** Previous violations */
  previousViolations: number;
  status: 'pending' | 'cleared' | 'suspended' | 'banned';
  reviewNote?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

/** Risk control rule (风控规则管理) */
export interface RiskControlRule extends AuditFields {
  id: string;
  groupId?: string;
  projectId?: string;
  name: MultiLangText;
  description: MultiLangText;
  /** Rule type */
  type: RiskRuleType;
  /** Rule conditions */
  conditions: RiskCondition[];
  /** Action to take when triggered */
  action: RiskAction;
  /** Apply top-level stamp processing method */
  applyMethod: 'blacklist' | 'whitelist' | 'rule-based';
  /** Priority */
  priority: number;
  status: CommonStatus;
}

export type RiskRuleType =
  | 'velocity'         // Frequency-based
  | 'amount'           // Amount-based
  | 'pattern'          // Pattern-based
  | 'geolocation'      // Location-based
  | 'device'           // Device-based
  | 'time';            // Time-based

export interface RiskCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'between' | 'regex';
  value: unknown;
  /** Evaluation window */
  windowMinutes?: number;
}

export type RiskAction =
  | 'flag'             // Flag for review
  | 'block'            // Auto-block transaction
  | 'suspend-member'   // Suspend member
  | 'notify-staff'     // Notify staff
  | 'escalate';        // Escalate to management
