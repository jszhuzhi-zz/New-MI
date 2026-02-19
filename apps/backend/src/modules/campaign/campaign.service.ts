import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  Prisma,
  CampaignStatus,
  CampaignType,
  CouponStatus,
  CouponInstanceStatus,
  LuckyDrawStatus,
  LuckyDrawEntryStatus,
  GiftStatus,
  GiftRedemptionStatus,
} from '@prisma/client';
import { randomBytes } from 'crypto';

/**
 * Campaign service.
 * Manages campaigns, coupons, lucky draws, and gift redemptions
 * for the membership system.
 */
@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Generate a unique alphanumeric code of the given length.
   */
  private generateCode(length = 8, prefix = ''): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 to avoid confusion
    const bytes = randomBytes(length);
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars[bytes[i] % chars.length];
    }
    return prefix ? `${prefix}-${code}` : code;
  }

  /**
   * Allowed status transitions for campaigns.
   */
  private static readonly STATUS_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
    [CampaignStatus.DRAFT]: [CampaignStatus.PENDING_APPROVAL, CampaignStatus.CANCELLED],
    [CampaignStatus.PENDING_APPROVAL]: [CampaignStatus.APPROVED, CampaignStatus.DRAFT, CampaignStatus.CANCELLED],
    [CampaignStatus.APPROVED]: [CampaignStatus.ACTIVE, CampaignStatus.CANCELLED],
    [CampaignStatus.ACTIVE]: [CampaignStatus.PAUSED, CampaignStatus.ENDED, CampaignStatus.CANCELLED],
    [CampaignStatus.PAUSED]: [CampaignStatus.ACTIVE, CampaignStatus.ENDED, CampaignStatus.CANCELLED],
    [CampaignStatus.ENDED]: [],
    [CampaignStatus.CANCELLED]: [],
  };

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
    const page = Number(params.page) || 1;
    const pageSize = Math.min(Number(params.pageSize) || 20, 100);
    const skip = (page - 1) * pageSize;

    const where: Prisma.CampaignWhereInput = {
      deletedAt: null,
    };

    if (params.projectId) {
      where.projectId = params.projectId;
    }
    if (params.type) {
      where.campaignType = params.type as CampaignType;
    }
    if (params.status) {
      where.status = params.status as CampaignStatus;
    }
    if (params.search) {
      // Search across the JSON name field by converting to string
      where.OR = [
        { name: { path: ['en'], string_contains: params.search } },
        { name: { path: ['zh-TW'], string_contains: params.search } },
        { name: { path: ['zh-CN'], string_contains: params.search } },
        { code: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.campaign.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              coupons: true,
              luckyDraws: true,
            },
          },
        },
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  /**
   * Get campaign by ID.
   */
  async getCampaignById(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        coupons: {
          where: { deletedAt: null },
          include: {
            _count: { select: { couponInstances: true } },
          },
        },
        luckyDraws: {
          where: { deletedAt: null },
          include: {
            prizes: true,
            _count: { select: { entries: true } },
          },
        },
        campaignStampRules: true,
        project: {
          select: { id: true, name: true, code: true },
        },
        group: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    if (!campaign || campaign.deletedAt) {
      throw new NotFoundException('Campaign not found.');
    }

    return campaign;
  }

  /**
   * Create a new campaign.
   */
  async createCampaign(data: {
    groupId: string;
    projectId?: string;
    code?: string;
    name: Record<string, string>;
    description?: Record<string, string>;
    shortDescription?: Record<string, string>;
    termsConditions?: Record<string, string>;
    coverImage?: string;
    images?: string[];
    campaignType: string;
    startDate: string;
    endDate: string;
    registrationStartDate?: string;
    registrationEndDate?: string;
    audienceTargeting?: Record<string, any>;
    totalBudget?: number;
    maxParticipants?: number;
    settings?: Record<string, any>;
    createdBy?: string;
  }) {
    // Validate dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format.');
    }
    if (startDate >= endDate) {
      throw new BadRequestException('End date must be after start date.');
    }

    // Generate a unique code if not provided
    const code = data.code || this.generateCode(8, 'CMP');

    // Verify group exists
    const group = await this.prisma.group.findUnique({ where: { id: data.groupId } });
    if (!group) {
      throw new NotFoundException('Group not found.');
    }

    // If projectId provided, verify it belongs to group
    if (data.projectId) {
      const project = await this.prisma.project.findUnique({ where: { id: data.projectId } });
      if (!project || project.groupId !== data.groupId) {
        throw new BadRequestException('Project not found or does not belong to the specified group.');
      }
    }

    const campaign = await this.prisma.campaign.create({
      data: {
        groupId: data.groupId,
        projectId: data.projectId,
        code,
        name: data.name as any,
        description: data.description as any,
        shortDescription: data.shortDescription as any,
        termsConditions: data.termsConditions as any,
        coverImage: data.coverImage,
        images: data.images || [],
        campaignType: data.campaignType as CampaignType,
        status: CampaignStatus.DRAFT,
        startDate,
        endDate,
        registrationStartDate: data.registrationStartDate ? new Date(data.registrationStartDate) : null,
        registrationEndDate: data.registrationEndDate ? new Date(data.registrationEndDate) : null,
        audienceTargeting: data.audienceTargeting as any,
        totalBudget: data.totalBudget,
        maxParticipants: data.maxParticipants,
        settings: data.settings as any,
        createdBy: data.createdBy,
      },
    });

    this.logger.log(`Campaign created: ${code} (${data.campaignType})`);
    return campaign;
  }

  /**
   * Update campaign.
   */
  async updateCampaign(id: string, data: Record<string, any>) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id } });
    if (!campaign || campaign.deletedAt) {
      throw new NotFoundException('Campaign not found.');
    }

    // Only allow editing if campaign is in DRAFT or PENDING_APPROVAL status
    if (![CampaignStatus.DRAFT, CampaignStatus.PENDING_APPROVAL].includes(campaign.status)) {
      throw new BadRequestException(
        `Cannot modify campaigns in '${campaign.status}' status. Only DRAFT or PENDING_APPROVAL campaigns can be edited.`,
      );
    }

    // Validate dates if provided
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (start >= end) {
        throw new BadRequestException('End date must be after start date.');
      }
    } else if (data.startDate) {
      const start = new Date(data.startDate);
      if (start >= campaign.endDate) {
        throw new BadRequestException('Start date must be before the existing end date.');
      }
    } else if (data.endDate) {
      const end = new Date(data.endDate);
      if (campaign.startDate >= end) {
        throw new BadRequestException('End date must be after the existing start date.');
      }
    }

    // Build update payload, only including allowed fields
    const allowedFields = [
      'name', 'description', 'shortDescription', 'termsConditions',
      'coverImage', 'images', 'startDate', 'endDate',
      'registrationStartDate', 'registrationEndDate',
      'audienceTargeting', 'totalBudget', 'maxParticipants', 'settings',
    ];

    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        if (['startDate', 'endDate', 'registrationStartDate', 'registrationEndDate'].includes(field)) {
          updateData[field] = data[field] ? new Date(data[field]) : null;
        } else {
          updateData[field] = data[field];
        }
      }
    }

    const updated = await this.prisma.campaign.update({
      where: { id },
      data: updateData,
    });

    this.logger.log(`Campaign updated: ${id}`);
    return updated;
  }

  /**
   * Update campaign status (with validated transitions).
   */
  async updateCampaignStatus(id: string, status: string) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id } });
    if (!campaign || campaign.deletedAt) {
      throw new NotFoundException('Campaign not found.');
    }

    const targetStatus = status as CampaignStatus;
    if (!Object.values(CampaignStatus).includes(targetStatus)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    const allowed = CampaignService.STATUS_TRANSITIONS[campaign.status] || [];
    if (!allowed.includes(targetStatus)) {
      throw new BadRequestException(
        `Cannot transition from '${campaign.status}' to '${targetStatus}'. Allowed transitions: ${allowed.join(', ') || 'none'}.`,
      );
    }

    const updateData: Prisma.CampaignUpdateInput = { status: targetStatus };

    // When approving, record approval timestamp
    if (targetStatus === CampaignStatus.APPROVED) {
      updateData.approvedAt = new Date();
    }

    const updated = await this.prisma.campaign.update({
      where: { id },
      data: updateData,
    });

    this.logger.log(`Campaign ${id} status changed from ${campaign.status} to ${targetStatus}`);
    return updated;
  }

  /**
   * Delete (cancel) a campaign.
   */
  async deleteCampaign(id: string) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id } });
    if (!campaign || campaign.deletedAt) {
      throw new NotFoundException('Campaign not found.');
    }

    // Cannot cancel already ended or cancelled campaigns
    if ([CampaignStatus.ENDED, CampaignStatus.CANCELLED].includes(campaign.status)) {
      throw new BadRequestException(`Campaign is already ${campaign.status}.`);
    }

    // Use a transaction to cancel campaign and related entities
    const result = await this.prisma.$transaction(async (tx) => {
      // Cancel the campaign
      const updatedCampaign = await tx.campaign.update({
        where: { id },
        data: {
          status: CampaignStatus.CANCELLED,
          deletedAt: new Date(),
        },
      });

      // Deactivate all related coupons
      await tx.coupon.updateMany({
        where: { campaignId: id, status: CouponStatus.ACTIVE },
        data: { status: CouponStatus.INACTIVE },
      });

      // Void all unspent coupon instances
      const campaignCoupons = await tx.coupon.findMany({
        where: { campaignId: id },
        select: { id: true },
      });
      const couponIds = campaignCoupons.map((c) => c.id);

      if (couponIds.length > 0) {
        await tx.couponInstance.updateMany({
          where: {
            couponId: { in: couponIds },
            status: CouponInstanceStatus.AVAILABLE,
          },
          data: { status: CouponInstanceStatus.VOIDED },
        });
      }

      // Cancel related lucky draws
      await tx.luckyDraw.updateMany({
        where: { campaignId: id, status: { in: [LuckyDrawStatus.DRAFT, LuckyDrawStatus.ACTIVE, LuckyDrawStatus.PAUSED] } },
        data: { status: LuckyDrawStatus.CANCELLED },
      });

      return updatedCampaign;
    });

    this.logger.log(`Campaign cancelled: ${id}`);
    return { message: 'Campaign cancelled', campaign: result };
  }

  // ─── Coupons ───────────────────────────────────────────────────────────────

  /**
   * List coupons for a campaign.
   */
  async listCoupons(campaignId: string, params: { status?: string; page?: number; pageSize?: number }) {
    // Verify campaign exists
    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign || campaign.deletedAt) {
      throw new NotFoundException('Campaign not found.');
    }

    const page = Number(params.page) || 1;
    const pageSize = Math.min(Number(params.pageSize) || 20, 100);
    const skip = (page - 1) * pageSize;

    const where: Prisma.CouponWhereInput = {
      campaignId,
      deletedAt: null,
    };

    if (params.status) {
      where.status = params.status as CouponStatus;
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.coupon.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { couponInstances: true } },
        },
      }),
      this.prisma.coupon.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  /**
   * Generate coupons for a campaign.
   */
  async generateCoupons(campaignId: string, data: {
    quantity: number;
    couponType: string;
    name: Record<string, string>;
    description?: Record<string, string>;
    terms?: Record<string, string>;
    value?: number;
    discountPercent?: number;
    minSpending?: number;
    stampCost?: number;
    maxPerMember?: number;
    validityDays?: number;
    prefix?: string;
    applicableMerchantIds?: string[];
  }) {
    // Verify campaign exists and is in a valid state
    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign || campaign.deletedAt) {
      throw new NotFoundException('Campaign not found.');
    }

    if (data.quantity < 1 || data.quantity > 10000) {
      throw new BadRequestException('Quantity must be between 1 and 10,000.');
    }

    const prefix = data.prefix || 'CPN';

    // Generate unique coupon codes in batch
    const couponsToCreate: Prisma.CouponCreateManyInput[] = [];
    const usedCodes = new Set<string>();

    for (let i = 0; i < data.quantity; i++) {
      let code: string;
      do {
        code = this.generateCode(10, prefix);
      } while (usedCodes.has(code));
      usedCodes.add(code);

      couponsToCreate.push({
        groupId: campaign.groupId,
        campaignId,
        code,
        name: data.name as any,
        description: data.description as any,
        terms: data.terms as any,
        couponType: data.couponType,
        value: data.value,
        discountPercent: data.discountPercent,
        minSpending: data.minSpending,
        stampCost: data.stampCost ?? 0,
        totalQuantity: 1,
        remainingQuantity: 1,
        maxPerMember: data.maxPerMember ?? 1,
        applicableMerchantIds: data.applicableMerchantIds || [],
        status: CouponStatus.ACTIVE,
        effectiveFrom: campaign.startDate,
        effectiveTo: campaign.endDate,
        validityDays: data.validityDays,
      });
    }

    const result = await this.prisma.coupon.createMany({
      data: couponsToCreate,
    });

    this.logger.log(`${result.count} coupons generated for campaign ${campaignId}`);
    return {
      campaignId,
      quantity: result.count,
      status: 'generated',
      prefix,
    };
  }

  /**
   * Assign coupon to a member.
   */
  async assignCoupon(couponId: string, memberId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Validate coupon exists and is active
      const coupon = await tx.coupon.findUnique({ where: { id: couponId } });
      if (!coupon || coupon.deletedAt) {
        throw new NotFoundException('Coupon not found.');
      }
      if (coupon.status !== CouponStatus.ACTIVE) {
        throw new BadRequestException('Coupon is not active.');
      }
      if (coupon.remainingQuantity <= 0) {
        throw new BadRequestException('Coupon is fully distributed.');
      }

      // Validate member exists
      const member = await tx.member.findUnique({ where: { id: memberId } });
      if (!member) {
        throw new NotFoundException('Member not found.');
      }

      // Check per-member limit
      const existingCount = await tx.couponInstance.count({
        where: { couponId, memberId },
      });
      if (existingCount >= coupon.maxPerMember) {
        throw new BadRequestException(
          `Member already has the maximum number of this coupon (${coupon.maxPerMember}).`,
        );
      }

      // Generate unique instance code
      const instanceCode = this.generateCode(12, 'CI');

      // Calculate expiry date
      let expiresAt: Date;
      if (coupon.validityDays) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + coupon.validityDays);
      } else {
        expiresAt = coupon.effectiveTo;
      }

      // Create coupon instance
      const instance = await tx.couponInstance.create({
        data: {
          couponId,
          memberId,
          instanceCode,
          status: CouponInstanceStatus.AVAILABLE,
          expiresAt,
          stampsSpent: 0,
        },
      });

      // Decrement remaining quantity
      await tx.coupon.update({
        where: { id: couponId },
        data: { remainingQuantity: { decrement: 1 } },
      });

      this.logger.log(`Coupon ${couponId} assigned to member ${memberId}, instance: ${instanceCode}`);
      return instance;
    });
  }

  /**
   * Redeem a coupon.
   */
  async redeemCoupon(couponCode: string, memberId: string, transactionData?: Record<string, any>) {
    return this.prisma.$transaction(async (tx) => {
      // Find the coupon instance by its instance code
      const instance = await tx.couponInstance.findUnique({
        where: { instanceCode: couponCode },
        include: { coupon: true },
      });

      if (!instance) {
        throw new NotFoundException('Coupon not found.');
      }

      // Validate ownership
      if (instance.memberId !== memberId) {
        throw new BadRequestException('This coupon does not belong to the specified member.');
      }

      // Validate status
      if (instance.status !== CouponInstanceStatus.AVAILABLE) {
        throw new BadRequestException(`Coupon is ${instance.status}, cannot redeem.`);
      }

      // Validate expiry
      if (instance.expiresAt < new Date()) {
        // Auto-expire the coupon
        await tx.couponInstance.update({
          where: { id: instance.id },
          data: { status: CouponInstanceStatus.EXPIRED },
        });
        throw new BadRequestException('Coupon has expired.');
      }

      // Validate minimum spending if applicable
      if (instance.coupon.minSpending && transactionData?.amount) {
        const txAmount = Number(transactionData.amount);
        if (txAmount < Number(instance.coupon.minSpending)) {
          throw new BadRequestException(
            `Minimum spending of ${instance.coupon.minSpending} required to use this coupon.`,
          );
        }
      }

      // Redeem the coupon
      const redeemed = await tx.couponInstance.update({
        where: { id: instance.id },
        data: {
          status: CouponInstanceStatus.USED,
          usedAt: new Date(),
          usedAtMerchantId: transactionData?.merchantId,
          usedTransactionRef: transactionData?.transactionRef,
        },
        include: { coupon: true },
      });

      this.logger.log(`Coupon ${couponCode} redeemed by member ${memberId}`);
      return redeemed;
    });
  }

  // ─── Lucky Draws ───────────────────────────────────────────────────────────

  /**
   * Get lucky draw configuration for a campaign.
   */
  async getLuckyDrawConfig(campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign || campaign.deletedAt) {
      throw new NotFoundException('Campaign not found.');
    }

    const luckyDraws = await this.prisma.luckyDraw.findMany({
      where: { campaignId, deletedAt: null },
      include: {
        prizes: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { entries: true } },
      },
    });

    if (luckyDraws.length === 0) {
      return null;
    }

    // Return the first (primary) lucky draw config for this campaign
    return luckyDraws[0];
  }

  /**
   * Configure lucky draw for a campaign.
   */
  async configureLuckyDraw(campaignId: string, data: {
    prizes: Array<{
      name: Record<string, string>;
      description?: Record<string, string>;
      image?: string;
      tier?: number;
      totalQuantity: number;
      probability: number;
      prizeType: string;
      value?: number;
      stampReward?: number;
      couponId?: string;
      claimDeadlineDays?: number;
    }>;
    code?: string;
    name?: Record<string, string>;
    description?: Record<string, string>;
    rules?: Record<string, string>;
    drawType?: string;
    stampCostPerEntry: number;
    freeEntries?: number;
    maxEntriesPerMember?: number;
    maxEntriesPerDay?: number;
    totalEntriesLimit?: number;
    gameConfig?: Record<string, any>;
    designConfig?: Record<string, any>;
  }) {
    // Verify campaign
    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign || campaign.deletedAt) {
      throw new NotFoundException('Campaign not found.');
    }
    if (!campaign.projectId) {
      throw new BadRequestException('Campaign must be associated with a project for lucky draw.');
    }

    // Validate probabilities sum <= 1.0
    const totalProbability = data.prizes.reduce((sum, p) => sum + p.probability, 0);
    if (totalProbability > 1.0) {
      throw new BadRequestException(
        `Prize probabilities sum to ${totalProbability}, which exceeds 1.0.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Check if existing lucky draw exists for this campaign
      const existing = await tx.luckyDraw.findFirst({
        where: { campaignId, deletedAt: null },
      });

      let luckyDraw;

      if (existing) {
        // Update existing lucky draw
        luckyDraw = await tx.luckyDraw.update({
          where: { id: existing.id },
          data: {
            name: data.name as any ?? existing.name,
            description: data.description as any,
            rules: data.rules as any,
            drawType: (data.drawType as any) ?? existing.drawType,
            stampCostPerEntry: data.stampCostPerEntry,
            freeEntries: data.freeEntries ?? 0,
            maxEntriesPerMember: data.maxEntriesPerMember,
            maxEntriesPerDay: data.maxEntriesPerDay,
            totalEntriesLimit: data.totalEntriesLimit,
            gameConfig: data.gameConfig as any,
            designConfig: data.designConfig as any,
          },
        });

        // Delete existing prizes and recreate
        await tx.luckyDrawPrize.deleteMany({
          where: { luckyDrawId: existing.id },
        });
      } else {
        // Create new lucky draw
        const code = data.code || this.generateCode(8, 'LD');
        luckyDraw = await tx.luckyDraw.create({
          data: {
            projectId: campaign.projectId,
            campaignId,
            code,
            name: data.name as any || campaign.name,
            description: data.description as any,
            rules: data.rules as any,
            drawType: (data.drawType as any) || 'RANDOM_DRAW',
            status: LuckyDrawStatus.DRAFT,
            startDate: campaign.startDate,
            endDate: campaign.endDate,
            stampCostPerEntry: data.stampCostPerEntry,
            freeEntries: data.freeEntries ?? 0,
            maxEntriesPerMember: data.maxEntriesPerMember,
            maxEntriesPerDay: data.maxEntriesPerDay,
            totalEntriesLimit: data.totalEntriesLimit,
            gameConfig: data.gameConfig as any,
            designConfig: data.designConfig as any,
          },
        });
      }

      // Create prizes
      const prizeData: Prisma.LuckyDrawPrizeCreateManyInput[] = data.prizes.map((p, idx) => ({
        luckyDrawId: luckyDraw.id,
        name: p.name as any,
        description: p.description as any,
        image: p.image,
        tier: p.tier ?? idx + 1,
        totalQuantity: p.totalQuantity,
        remainingQuantity: p.totalQuantity,
        probability: p.probability,
        prizeType: p.prizeType,
        value: p.value,
        stampReward: p.stampReward,
        couponId: p.couponId,
        claimDeadlineDays: p.claimDeadlineDays ?? 30,
        sortOrder: idx,
      }));

      await tx.luckyDrawPrize.createMany({ data: prizeData });

      // Return the full config
      const result = await tx.luckyDraw.findUnique({
        where: { id: luckyDraw.id },
        include: { prizes: { orderBy: { sortOrder: 'asc' } } },
      });

      this.logger.log(`Lucky draw configured for campaign ${campaignId}`);
      return result;
    });
  }

  /**
   * Execute a lucky draw for a member.
   */
  async executeLuckyDraw(campaignId: string, memberId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Fetch the lucky draw config for this campaign
      const luckyDraw = await tx.luckyDraw.findFirst({
        where: { campaignId, deletedAt: null },
        include: {
          prizes: { orderBy: { sortOrder: 'asc' } },
        },
      });

      if (!luckyDraw) {
        throw new NotFoundException('Lucky draw not configured for this campaign.');
      }

      if (luckyDraw.status !== LuckyDrawStatus.ACTIVE) {
        throw new BadRequestException(`Lucky draw is ${luckyDraw.status}, not accepting entries.`);
      }

      // Check date range
      const now = new Date();
      if (now < luckyDraw.startDate || now > luckyDraw.endDate) {
        throw new BadRequestException('Lucky draw is not within its active period.');
      }

      // Validate member exists
      const member = await tx.member.findUnique({
        where: { id: memberId },
      });
      if (!member) {
        throw new NotFoundException('Member not found.');
      }

      // Check total entries limit
      if (luckyDraw.totalEntriesLimit) {
        const totalEntries = await tx.luckyDrawEntry.count({
          where: { luckyDrawId: luckyDraw.id },
        });
        if (totalEntries >= luckyDraw.totalEntriesLimit) {
          throw new BadRequestException('Lucky draw has reached maximum total entries.');
        }
      }

      // Check per-member limit
      const memberEntries = await tx.luckyDrawEntry.count({
        where: { luckyDrawId: luckyDraw.id, memberId },
      });

      if (luckyDraw.maxEntriesPerMember && memberEntries >= luckyDraw.maxEntriesPerMember) {
        throw new BadRequestException('You have reached the maximum number of entries for this lucky draw.');
      }

      // Check per-day limit
      if (luckyDraw.maxEntriesPerDay) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const todayEntries = await tx.luckyDrawEntry.count({
          where: {
            luckyDrawId: luckyDraw.id,
            memberId,
            createdAt: { gte: todayStart, lte: todayEnd },
          },
        });

        if (todayEntries >= luckyDraw.maxEntriesPerDay) {
          throw new BadRequestException('You have reached the maximum entries per day.');
        }
      }

      // Determine stamp cost (free entries vs paid)
      const freeEntriesUsed = memberEntries; // entries already made
      const isFreeEntry = freeEntriesUsed < (luckyDraw.freeEntries || 0);
      const stampCost = isFreeEntry ? 0 : luckyDraw.stampCostPerEntry;

      // Deduct stamps if required
      if (stampCost > 0) {
        const stampAccount = await tx.stampAccount.findFirst({
          where: { memberId, projectId: luckyDraw.projectId },
        });

        if (!stampAccount || Number(stampAccount.balance) < stampCost) {
          throw new BadRequestException(
            `Insufficient stamps. Required: ${stampCost}, available: ${stampAccount ? stampAccount.balance : 0}.`,
          );
        }

        await tx.stampAccount.update({
          where: { id: stampAccount.id },
          data: {
            balance: { decrement: stampCost },
            totalRedeemed: { increment: stampCost },
          },
        });

        // Record stamp transaction
        await tx.stampTransaction.create({
          data: {
            stampAccountId: stampAccount.id,
            memberId,
            transactionType: 'REDEEM',
            status: 'COMPLETED',
            amount: -stampCost,
            balanceAfter: Number(stampAccount.balance) - stampCost,
            description: { en: 'Lucky draw entry', 'zh-TW': '幸運抽獎入場' } as any,
            campaignId,
            channel: 'app',
          },
        });
      }

      // Run the probability-based draw
      const random = Math.random();
      let cumulativeProbability = 0;
      let wonPrize = null;

      for (const prize of luckyDraw.prizes) {
        if (prize.remainingQuantity <= 0) continue;

        cumulativeProbability += Number(prize.probability || 0);
        if (random < cumulativeProbability) {
          wonPrize = prize;
          break;
        }
      }

      // Generate entry number
      const entryNumber = this.generateCode(8, 'EN');

      let entryStatus: LuckyDrawEntryStatus;
      let resultData: any;

      if (wonPrize) {
        entryStatus = LuckyDrawEntryStatus.WON;
        resultData = {
          won: true,
          prizeId: wonPrize.id,
          prizeName: wonPrize.name,
          prizeType: wonPrize.prizeType,
        };

        // Decrement prize remaining quantity
        await tx.luckyDrawPrize.update({
          where: { id: wonPrize.id },
          data: { remainingQuantity: { decrement: 1 } },
        });
      } else {
        entryStatus = LuckyDrawEntryStatus.LOST;
        resultData = { won: false };
      }

      // Claim deadline
      const claimDeadline = wonPrize
        ? new Date(Date.now() + (wonPrize.claimDeadlineDays || 30) * 24 * 60 * 60 * 1000)
        : null;

      // Record the entry
      const entry = await tx.luckyDrawEntry.create({
        data: {
          luckyDrawId: luckyDraw.id,
          memberId,
          prizeId: wonPrize?.id,
          entryNumber,
          status: entryStatus,
          stampsSpent: stampCost,
          result: resultData as any,
          wonAt: wonPrize ? new Date() : null,
          claimDeadline,
        },
        include: {
          prize: true,
        },
      });

      this.logger.log(
        `Lucky draw executed for member ${memberId}: ${wonPrize ? `Won ${wonPrize.prizeType}` : 'No prize'}`,
      );

      return {
        entry,
        result: wonPrize ? 'WON' : 'LOST',
        prize: wonPrize
          ? {
              id: wonPrize.id,
              name: wonPrize.name,
              prizeType: wonPrize.prizeType,
              value: wonPrize.value,
              image: wonPrize.image,
              claimDeadline,
            }
          : null,
        stampsSpent: stampCost,
      };
    });
  }

  /**
   * Get lucky draw results/winners.
   */
  async getLuckyDrawResults(campaignId: string, params: { page?: number; pageSize?: number }) {
    const luckyDraw = await this.prisma.luckyDraw.findFirst({
      where: { campaignId, deletedAt: null },
    });

    if (!luckyDraw) {
      throw new NotFoundException('Lucky draw not found for this campaign.');
    }

    const page = Number(params.page) || 1;
    const pageSize = Math.min(Number(params.pageSize) || 20, 100);
    const skip = (page - 1) * pageSize;

    const where: Prisma.LuckyDrawEntryWhereInput = {
      luckyDrawId: luckyDraw.id,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.luckyDrawEntry.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          prize: true,
          member: {
            select: {
              id: true,
              memberNo: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
      }),
      this.prisma.luckyDrawEntry.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  // ─── Gifts ─────────────────────────────────────────────────────────────────

  /**
   * List available gifts for a campaign.
   * Gifts are linked via groupId. We filter gifts whose effective period overlaps
   * with the campaign period.
   */
  async listGifts(campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign || campaign.deletedAt) {
      throw new NotFoundException('Campaign not found.');
    }

    const gifts = await this.prisma.gift.findMany({
      where: {
        groupId: campaign.groupId,
        deletedAt: null,
        effectiveFrom: { lte: campaign.endDate },
        effectiveTo: { gte: campaign.startDate },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        _count: { select: { redemptions: true } },
      },
    });

    return gifts;
  }

  /**
   * Create a gift for a campaign.
   */
  async createGift(campaignId: string, data: {
    name: Record<string, string>;
    description?: Record<string, string>;
    terms?: Record<string, string>;
    image?: string;
    images?: string[];
    category?: string;
    stampCost: number;
    totalQuantity: number;
    maxPerMember?: number;
    maxPerDay?: number;
    applicableTierIds?: string[];
    collectionMethod?: string;
    collectionLocations?: Record<string, any>;
    effectiveFrom?: string;
    effectiveTo?: string;
    code?: string;
  }) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign || campaign.deletedAt) {
      throw new NotFoundException('Campaign not found.');
    }

    if (data.stampCost < 0) {
      throw new BadRequestException('Stamp cost must be non-negative.');
    }
    if (data.totalQuantity < 1) {
      throw new BadRequestException('Total quantity must be at least 1.');
    }

    const code = data.code || this.generateCode(8, 'GFT');

    const gift = await this.prisma.gift.create({
      data: {
        groupId: campaign.groupId,
        code,
        name: data.name as any,
        description: data.description as any,
        terms: data.terms as any,
        image: data.image,
        images: data.images || [],
        category: data.category,
        stampCost: data.stampCost,
        totalQuantity: data.totalQuantity,
        remainingQuantity: data.totalQuantity,
        maxPerMember: data.maxPerMember ?? 1,
        maxPerDay: data.maxPerDay,
        applicableTierIds: data.applicableTierIds || [],
        collectionMethod: data.collectionMethod || 'counter',
        collectionLocations: data.collectionLocations as any,
        status: GiftStatus.ACTIVE,
        effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : campaign.startDate,
        effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : campaign.endDate,
      },
    });

    this.logger.log(`Gift created for campaign ${campaignId}: ${code}`);
    return gift;
  }

  /**
   * Redeem a gift for a member.
   */
  async redeemGift(giftId: string, memberId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Lock the gift row via findFirst + select for update equivalent
      const gift = await tx.gift.findUnique({ where: { id: giftId } });
      if (!gift || gift.deletedAt) {
        throw new NotFoundException('Gift not found.');
      }

      // Check gift is active and in effective period
      if (gift.status !== GiftStatus.ACTIVE) {
        throw new BadRequestException(`Gift is ${gift.status}, not available for redemption.`);
      }

      const now = new Date();
      if (now < gift.effectiveFrom || now > gift.effectiveTo) {
        throw new BadRequestException('Gift is not within its effective period.');
      }

      // Check stock
      if (gift.remainingQuantity <= 0) {
        throw new BadRequestException('Gift is out of stock.');
      }

      // Validate member
      const member = await tx.member.findUnique({
        where: { id: memberId },
        include: { tier: true },
      });
      if (!member) {
        throw new NotFoundException('Member not found.');
      }

      // Check tier eligibility
      if (gift.applicableTierIds.length > 0 && member.tierId) {
        if (!gift.applicableTierIds.includes(member.tierId)) {
          throw new BadRequestException('Your membership tier is not eligible for this gift.');
        }
      }

      // Check per-member limit
      const memberRedemptionCount = await tx.giftRedemption.count({
        where: { giftId, memberId },
      });
      if (memberRedemptionCount >= gift.maxPerMember) {
        throw new BadRequestException(
          `You have reached the maximum redemption limit (${gift.maxPerMember}) for this gift.`,
        );
      }

      // Check per-day global limit
      if (gift.maxPerDay) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const todayCount = await tx.giftRedemption.count({
          where: {
            giftId,
            createdAt: { gte: todayStart, lte: todayEnd },
          },
        });

        if (todayCount >= gift.maxPerDay) {
          throw new BadRequestException('Daily redemption limit reached for this gift.');
        }
      }

      // Find stamp account and check balance
      const stampAccount = await tx.stampAccount.findFirst({
        where: { memberId, projectId: member.projectId },
      });

      if (!stampAccount || Number(stampAccount.balance) < gift.stampCost) {
        throw new BadRequestException(
          `Insufficient stamps. Required: ${gift.stampCost}, available: ${stampAccount ? stampAccount.balance : 0}.`,
        );
      }

      // Deduct stamps
      if (gift.stampCost > 0) {
        await tx.stampAccount.update({
          where: { id: stampAccount.id },
          data: {
            balance: { decrement: gift.stampCost },
            totalRedeemed: { increment: gift.stampCost },
          },
        });

        // Record stamp transaction
        await tx.stampTransaction.create({
          data: {
            stampAccountId: stampAccount.id,
            memberId,
            transactionType: 'REDEEM',
            status: 'COMPLETED',
            amount: -gift.stampCost,
            balanceAfter: Number(stampAccount.balance) - gift.stampCost,
            description: {
              en: `Gift redemption: ${(gift.name as any)?.en || 'Gift'}`,
              'zh-TW': `禮品兌換: ${(gift.name as any)?.['zh-TW'] || '禮品'}`,
            } as any,
            channel: 'app',
          },
        });
      }

      // Decrement stock
      await tx.gift.update({
        where: { id: giftId },
        data: {
          remainingQuantity: { decrement: 1 },
          // Auto-mark as OUT_OF_STOCK if last item
          ...(gift.remainingQuantity <= 1
            ? { status: GiftStatus.OUT_OF_STOCK }
            : {}),
        },
      });

      // Generate redemption code and create record
      const redemptionCode = this.generateCode(10, 'RDMP');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days to collect

      const redemption = await tx.giftRedemption.create({
        data: {
          giftId,
          memberId,
          redemptionCode,
          status: GiftRedemptionStatus.PENDING,
          stampsSpent: gift.stampCost,
          collectionMethod: gift.collectionMethod,
          expiresAt,
          qrCode: redemptionCode, // QR code content is the redemption code
        },
        include: {
          gift: {
            select: { id: true, name: true, image: true, collectionMethod: true, collectionLocations: true },
          },
        },
      });

      this.logger.log(`Gift ${giftId} redeemed by member ${memberId}, code: ${redemptionCode}`);
      return redemption;
    });
  }

  /**
   * Get gift redemption history.
   */
  async getGiftRedemptions(giftId: string, params: { page?: number; pageSize?: number }) {
    const gift = await this.prisma.gift.findUnique({ where: { id: giftId } });
    if (!gift || gift.deletedAt) {
      throw new NotFoundException('Gift not found.');
    }

    const page = Number(params.page) || 1;
    const pageSize = Math.min(Number(params.pageSize) || 20, 100);
    const skip = (page - 1) * pageSize;

    const where: Prisma.GiftRedemptionWhereInput = { giftId };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.giftRedemption.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          member: {
            select: {
              id: true,
              memberNo: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
      }),
      this.prisma.giftRedemption.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }
}
