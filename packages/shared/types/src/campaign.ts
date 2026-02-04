import { AuditFields, CommonStatus, MultiLangText, DateRange } from './common';

/** Campaign / Activity (活动) */
export interface Campaign extends AuditFields {
  id: string;
  groupId?: string;
  projectId?: string;
  name: MultiLangText;
  code: string;
  type: CampaignType;
  description: MultiLangText;
  /** Rich content for display */
  content: MultiLangText;
  /** Cover image */
  coverImage: string;
  /** Campaign images */
  images: string[];
  /** Date range */
  validDateRange: DateRange;
  /** Status */
  status: CampaignStatus;
  /** Target audience */
  targetAudience: CampaignAudience;
  /** Stamp rules for this campaign */
  stampRules?: {
    multiplier?: number;
    bonusStamps?: number;
    maxStampsPerMember?: number;
    totalBudget?: number;
    usedBudget?: number;
  };
  /** Support displaying latest info with timed updates */
  scheduledUpdates?: ScheduledUpdate[];
  /** Tags */
  tags: string[];
  /** Channels to publish */
  publishChannels: PublishChannel[];
  /** Support clearing accumulation stamps */
  supportsClearAccumulation: boolean;
}

export type CampaignType =
  | 'stamp-bonus'       // 印花奖励
  | 'stamp-multiplier'  // 印花倍数
  | 'coupon'            // 优惠券
  | 'lucky-draw'        // 抽奖游戏
  | 'gift'              // 礼品
  | 'event'             // 活动
  | 'promotion';        // 推广

export type CampaignStatus =
  | 'draft'
  | 'pending-approval'
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'ended'
  | 'cancelled';

export interface CampaignAudience {
  type: 'all' | 'tier' | 'tag' | 'segment' | 'custom';
  tierIds?: string[];
  tags?: string[];
  segmentId?: string;
  /** Custom member IDs */
  memberIds?: string[];
}

export interface ScheduledUpdate {
  id: string;
  scheduledAt: Date;
  content: Partial<Campaign>;
  applied: boolean;
}

export type PublishChannel = 'app' | 'wechat-mini-program' | 'web' | 'sms' | 'email' | 'push';

/** Coupon (优惠券/代金券) */
export interface Coupon extends AuditFields {
  id: string;
  campaignId?: string;
  projectId: string;
  name: MultiLangText;
  code: string;
  type: CouponType;
  /** Discount value */
  value: number;
  /** Minimum spending requirement */
  minSpending?: number;
  /** Display as e-coupon format */
  displayFormat: 'barcode' | 'qr-code' | 'text-code';
  /** Usage limit per member */
  usageLimitPerMember: number;
  /** Total quantity */
  totalQuantity: number;
  /** Issued count */
  issuedCount: number;
  /** Used count */
  usedCount: number;
  /** Valid date range */
  validDateRange: DateRange;
  /** Applicable merchants */
  applicableMerchantIds?: string[];
  /** Applicable categories */
  applicableCategories?: string[];
  /** Terms and conditions */
  termsAndConditions: MultiLangText;
  /** Support making coupon available to member for direct claim */
  directClaimEnabled: boolean;
  /** Support promotional agent redemption */
  agentRedemptionEnabled: boolean;
  status: CommonStatus;
}

export type CouponType =
  | 'discount-percent'     // 折扣
  | 'discount-amount'      // 减免金额
  | 'free-item'            // 免费商品
  | 'stamp-bonus'          // 额外印花
  | 'gift';                // 礼品兑换

/** Coupon instance issued to a member */
export interface CouponInstance extends AuditFields {
  id: string;
  couponId: string;
  memberId: string;
  code: string;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  usedAt?: Date;
  usedAtMerchantId?: string;
  expiresAt: Date;
}

/** Lucky draw / Game (抽奖游戏) */
export interface LuckyDraw extends AuditFields {
  id: string;
  campaignId: string;
  projectId: string;
  name: MultiLangText;
  type: LuckyDrawType;
  /** Prizes */
  prizes: LuckyDrawPrize[];
  /** Entry cost in stamps */
  entryCostStamps: number;
  /** Max entries per member */
  maxEntriesPerMember: number;
  /** Total entries allowed */
  maxTotalEntries?: number;
  validDateRange: DateRange;
  status: CommonStatus;
}

export type LuckyDrawType =
  | 'scratch-card'      // 刮刮卡
  | 'wheel-spin'        // 大转盘
  | 'slot-machine'      // 老虎机
  | 'egg-smash'         // 砸金蛋
  | 'red-envelope'      // 红包
  | 'capsule-machine'   // 扭蛋机
  | 'card-flip';        // 翻牌

export interface LuckyDrawPrize {
  id: string;
  name: MultiLangText;
  description: MultiLangText;
  image: string;
  type: 'physical' | 'coupon' | 'stamps' | 'virtual';
  /** Value */
  value?: number;
  /** Coupon ID if type is coupon */
  couponId?: string;
  /** Stamps if type is stamps */
  stamps?: number;
  /** Probability weight */
  probabilityWeight: number;
  /** Total quantity */
  totalQuantity: number;
  /** Remaining quantity */
  remainingQuantity: number;
}

/** Gift / Reward (新人礼包/兑换礼品) */
export interface Gift extends AuditFields {
  id: string;
  projectId: string;
  name: MultiLangText;
  description: MultiLangText;
  image: string;
  type: GiftType;
  /** Stamps required for redemption */
  stampsRequired: number;
  /** Available quantity */
  totalQuantity: number;
  remainingQuantity: number;
  /** Redemption limit per member */
  limitPerMember: number;
  /** For new member welcome gift */
  isWelcomeGift: boolean;
  validDateRange: DateRange;
  /** Can be redeemed at which merchants */
  redeemableMerchantIds?: string[];
  status: CommonStatus;
}

export type GiftType =
  | 'physical'    // 实物礼品
  | 'coupon'      // 优惠券
  | 'experience'  // 体验
  | 'digital';    // 虚拟礼品
