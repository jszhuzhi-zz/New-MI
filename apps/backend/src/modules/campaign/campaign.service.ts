import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

/**
 * Campaign service.
 * Manages campaigns, coupons, lucky draws, and gift redemptions
 * for the membership system.
 */
@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);

  // ─── Campaign CRUD ─────────────────────────────────────────────────────────

  /**
   * List campaigns with filters.
   */
  async listCampaigns(params: {
    projectId?: string;
    type?: string;
    status?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    // TODO: Query campaigns with filters
    // const where: Prisma.CampaignWhereInput = {};
    // if (params.projectId) where.projectId = params.projectId;
    // if (params.type) where.type = params.type;
    // if (params.status) where.status = params.status;
    // if (params.search) {
    //   where.OR = [
    //     { nameZhHk: { contains: params.search } },
    //     { nameEn: { contains: params.search, mode: 'insensitive' } },
    //   ];
    // }

    return { items: [], total: 0, page: params.page || 1, pageSize: params.pageSize || 20 };
  }

  /**
   * Get campaign by ID.
   */
  async getCampaignById(id: string) {
    // TODO: Fetch campaign with all related data
    // const campaign = await this.prisma.campaign.findUnique({
    //   where: { id },
    //   include: { coupons: true, luckyDraw: true, gifts: true, rules: true },
    // });
    // if (!campaign) throw new NotFoundException('Campaign not found.');

    return null;
  }

  /**
   * Create a new campaign.
   */
  async createCampaign(data: {
    projectId: string;
    type: string; // 'coupon' | 'lucky_draw' | 'gift' | 'stamp_bonus' | 'points_multiplier'
    nameZhHk: string;
    nameZhCn?: string;
    nameEn?: string;
    descriptionZhHk?: string;
    descriptionEn?: string;
    startDate: string;
    endDate: string;
    targetTiers?: string[];
    targetSegments?: string[];
    budget?: number;
    maxParticipants?: number;
    imageUrl?: string;
    termsZhHk?: string;
    termsEn?: string;
  }) {
    // TODO: Validate dates
    // if (new Date(data.startDate) >= new Date(data.endDate)) {
    //   throw new BadRequestException('End date must be after start date.');
    // }

    // TODO: Create campaign
    // return this.prisma.campaign.create({ data: { ...data, status: 'draft' } });

    this.logger.log(`Campaign created: ${data.nameZhHk} (${data.type})`);
    return { id: 'campaign-id', ...data, status: 'draft' };
  }

  /**
   * Update campaign.
   */
  async updateCampaign(id: string, data: Record<string, any>) {
    // TODO: Update campaign (only if draft or scheduled)
    // const campaign = await this.prisma.campaign.findUnique({ where: { id } });
    // if (!campaign) throw new NotFoundException('Campaign not found.');
    // if (campaign.status === 'completed') throw new BadRequestException('Cannot modify completed campaigns.');

    this.logger.log(`Campaign updated: ${id}`);
    return { id, ...data };
  }

  /**
   * Update campaign status (draft -> scheduled -> active -> completed).
   */
  async updateCampaignStatus(id: string, status: string) {
    // TODO: Validate status transition
    // TODO: Update campaign status

    this.logger.log(`Campaign ${id} status changed to ${status}`);
    return { id, status };
  }

  /**
   * Delete (cancel) a campaign.
   */
  async deleteCampaign(id: string) {
    // TODO: Cancel campaign
    return { message: 'Campaign cancelled' };
  }

  // ─── Coupons ───────────────────────────────────────────────────────────────

  /**
   * List coupons for a campaign.
   */
  async listCoupons(campaignId: string, params: { status?: string; page?: number; pageSize?: number }) {
    // TODO: Fetch coupons with filters
    return { items: [], total: 0, page: params.page || 1, pageSize: params.pageSize || 20 };
  }

  /**
   * Generate coupons for a campaign.
   */
  async generateCoupons(campaignId: string, data: {
    quantity: number;
    valueType: string; // 'fixed' | 'percentage' | 'stamp_bonus'
    value: number;
    minSpend?: number;
    maxDiscount?: number;
    expiryDays: number;
    prefix?: string;
  }) {
    // TODO: Generate unique coupon codes
    // TODO: Batch insert coupons

    this.logger.log(`${data.quantity} coupons generated for campaign ${campaignId}`);
    return {
      campaignId,
      quantity: data.quantity,
      status: 'generated',
    };
  }

  /**
   * Assign coupon to a member.
   */
  async assignCoupon(couponId: string, memberId: string) {
    // TODO: Check coupon is available, assign to member
    return { couponId, memberId, status: 'assigned' };
  }

  /**
   * Redeem a coupon.
   */
  async redeemCoupon(couponCode: string, memberId: string, transactionData?: Record<string, any>) {
    // TODO: Validate coupon, check ownership, check expiry
    // TODO: Mark coupon as redeemed
    // TODO: Apply coupon benefit

    return { couponCode, memberId, status: 'redeemed' };
  }

  // ─── Lucky Draws ───────────────────────────────────────────────────────────

  /**
   * Get lucky draw configuration for a campaign.
   */
  async getLuckyDrawConfig(campaignId: string) {
    // TODO: Fetch lucky draw config
    return null;
  }

  /**
   * Configure lucky draw for a campaign.
   */
  async configureLuckyDraw(campaignId: string, data: {
    prizes: Array<{
      nameZhHk: string;
      nameEn?: string;
      quantity: number;
      probability: number;
      imageUrl?: string;
    }>;
    drawsPerMember: number;
    costPerDraw: number; // stamps cost
    drawStartDate: string;
    drawEndDate: string;
  }) {
    // TODO: Validate prize probabilities sum to <= 1.0
    // TODO: Create/update lucky draw config

    this.logger.log(`Lucky draw configured for campaign ${campaignId}`);
    return { campaignId, ...data, status: 'configured' };
  }

  /**
   * Execute a lucky draw for a member.
   */
  async executeLuckyDraw(campaignId: string, memberId: string) {
    // TODO: Check member eligibility (draws remaining, stamps balance)
    // TODO: Deduct stamps if required
    // TODO: Run draw based on probabilities
    // TODO: Record result

    return {
      campaignId,
      memberId,
      result: 'pending', // TODO: Calculate actual result
      prizeWon: null,
    };
  }

  /**
   * Get lucky draw results/winners.
   */
  async getLuckyDrawResults(campaignId: string, params: { page?: number; pageSize?: number }) {
    // TODO: Fetch lucky draw results
    return { items: [], total: 0, page: params.page || 1, pageSize: params.pageSize || 20 };
  }

  // ─── Gifts ─────────────────────────────────────────────────────────────────

  /**
   * List available gifts for a campaign.
   */
  async listGifts(campaignId: string) {
    // TODO: Fetch gifts with stock info
    return [];
  }

  /**
   * Create a gift for a campaign.
   */
  async createGift(campaignId: string, data: {
    nameZhHk: string;
    nameZhCn?: string;
    nameEn?: string;
    descriptionZhHk?: string;
    descriptionEn?: string;
    stampCost: number;
    stock: number;
    maxPerMember: number;
    imageUrl?: string;
    startDate: string;
    endDate: string;
  }) {
    // TODO: Create gift
    this.logger.log(`Gift created for campaign ${campaignId}: ${data.nameZhHk}`);
    return { id: 'gift-id', campaignId, ...data, status: 'active', remaining: data.stock };
  }

  /**
   * Redeem a gift for a member.
   */
  async redeemGift(giftId: string, memberId: string) {
    // TODO: Check stock, check per-member limit, check stamp balance
    // TODO: Deduct stamps
    // TODO: Decrement stock
    // TODO: Create redemption record

    return {
      giftId,
      memberId,
      status: 'redeemed',
      redemptionCode: 'RDMP-XXXX',
    };
  }

  /**
   * Get gift redemption history.
   */
  async getGiftRedemptions(giftId: string, params: { page?: number; pageSize?: number }) {
    // TODO: Fetch redemption records
    return { items: [], total: 0, page: params.page || 1, pageSize: params.pageSize || 20 };
  }
}
