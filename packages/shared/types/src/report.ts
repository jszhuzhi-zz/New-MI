import { DateRange, MultiLangText } from './common';

/** Report types (报表中心) */

/** Member statistics report (会员盈亏报表) */
export interface MemberStatisticsReport {
  period: DateRange;
  groupId?: string;
  projectId?: string;
  /** New member registrations */
  newMembers: number;
  /** Active members */
  activeMembers: number;
  /** Inactive members */
  inactiveMembers: number;
  /** Total members */
  totalMembers: number;
  /** Member growth trend */
  growthTrend: TimeSeriesData[];
  /** Registration source breakdown */
  registrationSourceBreakdown: { source: string; count: number }[];
  /** Tier distribution */
  tierDistribution: { tierId: string; tierName: string; count: number }[];
}

/** Stamp statistics report (积分/印花统计报表) */
export interface StampStatisticsReport {
  period: DateRange;
  groupId?: string;
  projectId?: string;
  /** Total stamps issued */
  totalIssued: number;
  /** Total stamps redeemed */
  totalRedeemed: number;
  /** Total stamps expired */
  totalExpired: number;
  /** Current outstanding stamps */
  outstandingStamps: number;
  /** Issuance trend */
  issuanceTrend: TimeSeriesData[];
  /** Redemption trend */
  redemptionTrend: TimeSeriesData[];
  /** Top earners */
  topEarners: { memberId: string; memberName: string; amount: number }[];
  /** Top redeemers */
  topRedeemers: { memberId: string; memberName: string; amount: number }[];
  /** Per-project breakdown */
  projectBreakdown: {
    projectId: string;
    projectName: MultiLangText;
    issued: number;
    redeemed: number;
    expired: number;
  }[];
}

/** Group stamp clearing statistics report (集团积分清零统计报表) */
export interface GroupStampClearingReport {
  period: DateRange;
  groupId: string;
  /** Below a project, list all stamp events that have been cleared */
  projectClearingDetails: {
    projectId: string;
    projectName: MultiLangText;
    /** Total stamps cleared */
    totalCleared: number;
    /** Number of members affected */
    membersAffected: number;
    /** Data can be broken down by different categories/projects */
    categoryBreakdown: { category: string; count: number }[];
  }[];
  /** Total across all projects */
  grandTotalCleared: number;
  grandTotalMembersAffected: number;
}

/** Member registration conversion report (用户注册转化统计) */
export interface RegistrationConversionReport {
  period: DateRange;
  projectId: string;
  /** Funnel stages */
  funnel: {
    stage: string;
    count: number;
    conversionRate: number;
  }[];
}

/** Member active retention report (用户活跃度统计) */
export interface MemberActivityReport {
  period: DateRange;
  projectId: string;
  /** Can view time-based activation and registration for members */
  dailyActiveMembers: TimeSeriesData[];
  weeklyActiveMembers: TimeSeriesData[];
  monthlyActiveMembers: TimeSeriesData[];
  /** Retention curve */
  retentionCurve: {
    cohort: string;
    day1: number;
    day7: number;
    day14: number;
    day30: number;
    day60: number;
    day90: number;
  }[];
}

/** Usage statistics (用量使用统计) */
export interface UsageStatisticsReport {
  period: DateRange;
  projectId: string;
  /** Can view custom time period for specific function usage */
  featureUsage: {
    feature: string;
    views: number;
    uniqueUsers: number;
    /** Ticket/stamp usage: download and share counts */
    downloads?: number;
    shares?: number;
  }[];
  /** Card usage statistics */
  cardUsage: {
    cardType: string;
    scans: number;
    downloads: number;
    shares: number;
  }[];
}

/** Online activity statistics (线上合成统计) */
export interface OnlineActivityReport {
  period: DateRange;
  projectId: string;
  /** Can view all online activity stats including new entries, open rates, share data */
  activities: {
    activityId: string;
    activityName: string;
    views: number;
    participants: number;
    newMembers: number;
    openRate: number;
    shareCount: number;
    /** Online activity merging statistics */
    conversionRate: number;
  }[];
}

/** Campaign promotion statistics (推广活动统计) */
export interface CampaignPromotionReport {
  period: DateRange;
  projectId?: string;
  /** Can view custom time period for each/all campaign activities: name, active dates, success rate */
  campaigns: {
    campaignId: string;
    campaignName: MultiLangText;
    activeDateRange: DateRange;
    impressions: number;
    clicks: number;
    conversions: number;
    conversionRate: number;
    stampsIssued: number;
    couponsRedeemed: number;
  }[];
}

/** Service usage statistics (下服务场使用统计) */
export interface ServiceUsageReport {
  period: DateRange;
  projectId: string;
  /** Can view custom time period for each service usage by each item: success rate */
  services: {
    serviceName: string;
    totalUsage: number;
    uniqueUsers: number;
    successRate: number;
  }[];
}

/** Time series data point */
export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

/** Download center (下载中心) */
export interface ReportDownload {
  id: string;
  reportType: string;
  requestedBy: string;
  requestedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileUrl?: string;
  fileFormat: 'xlsx' | 'csv' | 'pdf';
  /** Support viewing export history */
  expiresAt?: Date;
}

/** Operation log (操作日志) */
export interface OperationLog {
  id: string;
  userId: string;
  userType: string;
  action: string;
  module: string;
  description: string;
  /** Can view in CRM a general set of data records, modify project, product, address, update/delete configuration */
  entityType: string;
  entityId: string;
  changes?: Record<string, unknown>;
  ipAddress: string;
  timestamp: Date;
}
