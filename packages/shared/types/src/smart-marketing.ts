import { AuditFields, CommonStatus, MultiLangText, DateRange } from './common';

/**
 * Smart Marketing Module (智能营销)
 * - Auto-tagging (自动打标签)
 * - Event-based marketing triggers (基于事件的营销触发)
 * - Configuration-based marketing triggers (基于配置的营销触发)
 * - Member journey automation (会员旅程自动化)
 * - A/B testing for campaigns
 */

/** Auto-tagging rule (自动打标签规则) */
export interface AutoTagRule extends AuditFields {
  id: string;
  groupId?: string;
  projectId?: string;
  name: MultiLangText;
  description: MultiLangText;
  /** Rule conditions - when these are met, tag is applied */
  conditions: TagCondition[];
  /** Logic operator between conditions */
  conditionLogic: 'and' | 'or';
  /** Tag to apply */
  tagId: string;
  tagName: MultiLangText;
  /** Auto-remove tag when conditions no longer met */
  autoRemove: boolean;
  /** Evaluation frequency */
  evaluationFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  /** Priority for conflicting rules */
  priority: number;
  status: CommonStatus;
  /** Stats */
  stats: {
    membersTagged: number;
    membersUntagged: number;
    lastEvaluatedAt?: Date;
  };
}

export interface TagCondition {
  id: string;
  /** Condition category */
  category: TagConditionCategory;
  /** Specific field to evaluate */
  field: string;
  /** Operator */
  operator: ConditionOperator;
  /** Value to compare */
  value: unknown;
  /** Time window for behavioral conditions */
  timeWindow?: {
    amount: number;
    unit: 'hours' | 'days' | 'weeks' | 'months';
  };
}

export type TagConditionCategory =
  | 'demographic'     // 人口属性: age, gender, location
  | 'behavioral'      // 行为特征: visit frequency, spending amount, stamp usage
  | 'transactional'   // 交易相关: purchase category, average spend, last purchase
  | 'engagement'      // 参与度: app usage, campaign participation, coupon redemption
  | 'lifecycle'       // 生命周期: registration date, tier changes, activity status
  | 'custom';         // 自定义

export type ConditionOperator =
  | 'equals' | 'not_equals'
  | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal'
  | 'between' | 'not_between'
  | 'in' | 'not_in'
  | 'contains' | 'not_contains'
  | 'starts_with' | 'ends_with'
  | 'is_null' | 'is_not_null'
  | 'days_since_gt' | 'days_since_lt';

/** Marketing trigger (营销触发器) */
export interface MarketingTrigger extends AuditFields {
  id: string;
  groupId?: string;
  projectId?: string;
  name: MultiLangText;
  description: MultiLangText;
  /** Trigger type */
  type: TriggerType;
  /** Event-based trigger config */
  eventConfig?: EventTriggerConfig;
  /** Schedule-based trigger config */
  scheduleConfig?: ScheduleTriggerConfig;
  /** Condition-based trigger config */
  conditionConfig?: ConditionTriggerConfig;
  /** Actions to execute when triggered */
  actions: MarketingAction[];
  /** Target audience filter (additional to trigger conditions) */
  audienceFilter?: AudienceFilter;
  /** Cooldown: min time between triggers for same member */
  cooldownMinutes: number;
  /** Max triggers per member */
  maxTriggersPerMember?: number;
  /** A/B test config */
  abTest?: ABTestConfig;
  /** Active date range */
  validDateRange?: DateRange;
  status: CommonStatus;
  /** Stats */
  stats: TriggerStats;
}

export type TriggerType =
  | 'event'         // 事件触发: member does something specific
  | 'schedule'      // 定时触发: cron-based or scheduled
  | 'condition'     // 条件触发: when data conditions are met
  | 'lifecycle';    // 生命周期触发: registration anniversary, tier change

/** Event-based trigger config (基于事件的营销触发) */
export interface EventTriggerConfig {
  /** The event that triggers this rule */
  eventType: MarketingEventType;
  /** Additional conditions on the event */
  eventConditions?: {
    field: string;
    operator: ConditionOperator;
    value: unknown;
  }[];
  /** Delay before action execution */
  delayMinutes?: number;
}

export type MarketingEventType =
  | 'member_registered'         // 新会员注册
  | 'member_first_purchase'     // 首次消费
  | 'member_stamp_earned'       // 获取印花
  | 'member_stamp_redeemed'     // 兑换印花
  | 'member_tier_upgraded'      // 等级升级
  | 'member_tier_downgraded'    // 等级降级
  | 'member_birthday'           // 会员生日
  | 'member_anniversary'        // 注册周年
  | 'member_inactive'           // 会员沉默 (N days no activity)
  | 'member_at_risk'            // 流失风险
  | 'member_reactivated'        // 会员回归
  | 'stamp_about_to_expire'     // 印花即将过期
  | 'coupon_about_to_expire'    // 优惠券即将过期
  | 'campaign_participated'     // 参与活动
  | 'receipt_submitted'         // 提交小票
  | 'app_opened'                // 打开APP
  | 'location_entered'          // 进入商场 (geofence)
  | 'custom_event';             // 自定义事件

/** Schedule-based trigger config (基于配置的定时营销触发) */
export interface ScheduleTriggerConfig {
  /** Cron expression */
  cronExpression: string;
  /** Or specific dates */
  specificDates?: Date[];
  /** Timezone */
  timezone: string;
}

/** Condition-based trigger config */
export interface ConditionTriggerConfig {
  /** Conditions to evaluate */
  conditions: TagCondition[];
  conditionLogic: 'and' | 'or';
  /** How often to evaluate */
  evaluationFrequency: 'realtime' | 'hourly' | 'daily';
}

/** Marketing action (营销动作) */
export interface MarketingAction {
  id: string;
  type: MarketingActionType;
  /** Delay from trigger (can chain actions with delays) */
  delayMinutes: number;
  /** Action-specific config */
  config: Record<string, unknown>;
  /** For A/B test: which variant this belongs to */
  variant?: string;
}

export type MarketingActionType =
  | 'send_push'              // 发送推送通知
  | 'send_sms'               // 发送短信
  | 'send_email'             // 发送邮件
  | 'send_in_app_message'    // 发送应用内消息
  | 'send_wechat_template'   // 发送微信模板消息
  | 'grant_stamps'           // 赠送印花
  | 'grant_coupon'           // 发放优惠券
  | 'add_tag'                // 添加标签
  | 'remove_tag'             // 移除标签
  | 'upgrade_tier'           // 升级等级
  | 'add_to_segment'         // 加入分群
  | 'trigger_webhook'        // 触发Webhook
  | 'create_task';           // 创建客服任务

/** Audience filter for targeting */
export interface AudienceFilter {
  /** Include members matching these conditions */
  includeConditions?: TagCondition[];
  includeLogic?: 'and' | 'or';
  /** Exclude members matching these conditions */
  excludeConditions?: TagCondition[];
  excludeLogic?: 'and' | 'or';
  /** Specific tier IDs */
  tierIds?: string[];
  /** Specific tag IDs */
  tagIds?: string[];
  /** Specific segment IDs */
  segmentIds?: string[];
}

/** A/B Test config */
export interface ABTestConfig {
  /** Test name */
  name: string;
  /** Variants with traffic split */
  variants: ABTestVariant[];
  /** Winning metric */
  winningMetric: 'open_rate' | 'click_rate' | 'conversion_rate' | 'stamp_usage';
  /** Auto-select winner after N hours */
  autoSelectWinnerAfterHours?: number;
  /** Winner variant ID (set after test concludes) */
  winnerId?: string;
}

export interface ABTestVariant {
  id: string;
  name: string;
  /** Traffic percentage (all variants must sum to 100) */
  trafficPercent: number;
  /** Variant-specific action overrides */
  actionOverrides?: Partial<MarketingAction>[];
}

/** Trigger execution stats */
export interface TriggerStats {
  totalTriggered: number;
  totalActioned: number;
  /** Per action type stats */
  actionStats: {
    actionType: MarketingActionType;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
  }[];
  /** A/B test results */
  abTestResults?: {
    variantId: string;
    variantName: string;
    sent: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
  }[];
  lastTriggeredAt?: Date;
}

/** Member segment (会员分群) */
export interface MemberSegment extends AuditFields {
  id: string;
  groupId?: string;
  projectId?: string;
  name: MultiLangText;
  description: MultiLangText;
  /** Segment rules */
  rules: TagCondition[];
  ruleLogic: 'and' | 'or';
  /** Is this a dynamic segment (auto-updated) or static */
  isDynamic: boolean;
  /** Member count */
  memberCount: number;
  /** Last refresh */
  lastRefreshedAt?: Date;
  status: CommonStatus;
}

/** Member journey (会员旅程) */
export interface MemberJourney extends AuditFields {
  id: string;
  groupId?: string;
  projectId?: string;
  name: MultiLangText;
  description: MultiLangText;
  /** Journey steps */
  steps: JourneyStep[];
  /** Entry trigger */
  entryTrigger: {
    type: MarketingEventType;
    conditions?: TagCondition[];
  };
  /** Exit conditions */
  exitConditions?: {
    type: 'completed' | 'timeout' | 'condition';
    value?: unknown;
  }[];
  /** Max members in journey at once */
  maxConcurrentMembers?: number;
  validDateRange?: DateRange;
  status: CommonStatus;
  stats: {
    totalEntered: number;
    currentlyActive: number;
    completed: number;
    dropped: number;
    stepStats: {
      stepId: string;
      reached: number;
      completed: number;
      dropped: number;
    }[];
  };
}

export interface JourneyStep {
  id: string;
  name: MultiLangText;
  type: 'action' | 'wait' | 'condition' | 'split';
  /** For action steps */
  action?: MarketingAction;
  /** For wait steps */
  waitConfig?: {
    type: 'duration' | 'until-event' | 'until-date';
    durationMinutes?: number;
    eventType?: MarketingEventType;
    untilDate?: Date;
  };
  /** For condition steps (branching) */
  conditionConfig?: {
    conditions: TagCondition[];
    trueBranchStepId: string;
    falseBranchStepId: string;
  };
  /** For split steps (A/B) */
  splitConfig?: {
    variants: { stepId: string; percent: number }[];
  };
  /** Next step ID (for linear flow) */
  nextStepId?: string;
  /** Position in visual editor */
  position: { x: number; y: number };
}

/** Marketing dashboard (智能营销概览) */
export interface MarketingDashboard {
  /** Active auto-tag rules */
  activeAutoTagRules: number;
  /** Active triggers */
  activeTriggers: number;
  /** Active journeys */
  activeJourneys: number;
  /** Today's trigger executions */
  todayTriggerExecutions: number;
  /** This week's messages sent */
  weeklyMessagesSent: number;
  /** Campaign performance summary */
  campaignPerformance: {
    campaignId: string;
    name: string;
    conversionRate: number;
    revenue: number;
  }[];
  /** Top performing triggers */
  topTriggers: {
    triggerId: string;
    name: string;
    conversionRate: number;
    executions: number;
  }[];
  /** Member segment distribution */
  segmentDistribution: {
    segmentId: string;
    name: string;
    memberCount: number;
    percentage: number;
  }[];
}
