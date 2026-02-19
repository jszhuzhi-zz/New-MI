import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  Prisma,
  MerchantStatus,
  StampTransactionType,
  StampTransactionStatus,
  StampRuleStatus,
} from '@prisma/client';

/**
 * Merchant service.
 * Manages merchant CRUD operations and stamp processing
 * for the merchant portal.
 */
@Injectable()
export class MerchantService {
  private readonly logger = new Logger(MerchantService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Merchant CRUD ─────────────────────────────────────────────────────────

  /**
   * List merchants with filters.
   */
  async listMerchants(params: {
    projectId?: string;
    category?: string;
    status?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 20));

    const where: Prisma.MerchantWhereInput = {
      deletedAt: null,
    };

    if (params.projectId) {
      where.projectId = params.projectId;
    }
    if (params.category) {
      where.category = params.category;
    }
    if (params.status) {
      where.status = params.status.toUpperCase() as MerchantStatus;
    }
    if (params.search) {
      where.OR = [
        { code: { contains: params.search, mode: 'insensitive' } },
        {
          name: {
            path: ['zh-TW'],
            string_contains: params.search,
          },
        },
        {
          name: {
            path: ['en'],
            string_contains: params.search,
          },
        },
        {
          name: {
            path: ['zh-CN'],
            string_contains: params.search,
          },
        },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.merchant.findMany({
        where,
        include: {
          project: { select: { id: true, name: true, code: true } },
          _count: {
            select: {
              merchantAccounts: { where: { isActive: true } },
              stampTransactions: true,
            },
          },
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.merchant.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  /**
   * Get merchant by ID.
   */
  async getMerchantById(id: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, code: true, groupId: true } },
        merchantAccounts: {
          where: { isActive: true, deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            stampTransactions: true,
            merchantAccounts: { where: { isActive: true } },
            favoritedBy: true,
          },
        },
      },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found.');
    }

    // Fetch recent stamp statistics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentStats = await this.prisma.stampTransaction.aggregate({
      where: {
        merchantId: id,
        status: StampTransactionStatus.COMPLETED,
        transactionAt: { gte: thirtyDaysAgo },
      },
      _sum: { amount: true, spendingAmount: true },
      _count: true,
    });

    const uniqueMembers = await this.prisma.stampTransaction.groupBy({
      by: ['memberId'],
      where: {
        merchantId: id,
        status: StampTransactionStatus.COMPLETED,
        transactionAt: { gte: thirtyDaysAgo },
      },
    });

    return {
      ...merchant,
      recentStats: {
        last30Days: {
          totalTransactions: recentStats._count,
          totalStampsIssued: Number(recentStats._sum.amount || 0),
          totalReceiptAmount: Number(recentStats._sum.spendingAmount || 0),
          uniqueMembers: uniqueMembers.length,
        },
      },
    };
  }

  /**
   * Create a new merchant.
   */
  async createMerchant(data: {
    code: string;
    nameZhHk: string;
    nameZhCn?: string;
    nameEn?: string;
    category: string;
    projectId: string;
    floor?: string;
    unit?: string;
    contactPerson?: string;
    contactPhone?: string;
    contactEmail?: string;
    businessHours?: string;
    description?: string;
    logoUrl?: string;
  }) {
    // Look up the project to get groupId
    const project = await this.prisma.project.findUnique({
      where: { id: data.projectId },
    });
    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    // Check for duplicate code within the same group
    const existing = await this.prisma.merchant.findFirst({
      where: {
        groupId: project.groupId,
        code: data.code,
        deletedAt: null,
      },
    });
    if (existing) {
      throw new ConflictException('Merchant code already exists in this group.');
    }

    const nameJson: Record<string, string> = {
      'zh-TW': data.nameZhHk,
    };
    if (data.nameZhCn) nameJson['zh-CN'] = data.nameZhCn;
    if (data.nameEn) nameJson['en'] = data.nameEn;

    const descriptionJson = data.description
      ? { 'zh-TW': data.description, 'en': data.description }
      : undefined;

    const openingHoursJson = data.businessHours
      ? { default: data.businessHours }
      : undefined;

    const merchant = await this.prisma.merchant.create({
      data: {
        groupId: project.groupId,
        projectId: data.projectId,
        code: data.code,
        name: nameJson,
        category: data.category,
        floor: data.floor,
        unit: data.unit,
        phone: data.contactPhone,
        email: data.contactEmail,
        description: descriptionJson,
        openingHours: openingHoursJson,
        logo: data.logoUrl,
        status: MerchantStatus.ACTIVE,
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    });

    this.logger.log(`Merchant created: ${data.code} in project ${data.projectId}`);
    return merchant;
  }

  /**
   * Update merchant details.
   */
  async updateMerchant(id: string, data: Record<string, any>) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id },
    });
    if (!merchant) {
      throw new NotFoundException('Merchant not found.');
    }

    // Build the update payload from incoming data
    const updateData: Prisma.MerchantUpdateInput = {};

    if (data.code !== undefined) updateData.code = data.code;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.floor !== undefined) updateData.floor = data.floor;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.contactPhone !== undefined) updateData.phone = data.contactPhone;
    if (data.contactEmail !== undefined) updateData.email = data.contactEmail;
    if (data.logoUrl !== undefined) updateData.logo = data.logoUrl;
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.stampEnabled !== undefined) updateData.stampEnabled = data.stampEnabled;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.subCategory !== undefined) updateData.subCategory = data.subCategory;
    if (data.status !== undefined) updateData.status = data.status.toUpperCase() as MerchantStatus;

    // Handle multi-language name field
    if (data.nameZhHk || data.nameZhCn || data.nameEn) {
      const currentName = (merchant.name as Record<string, string>) || {};
      const newName = { ...currentName };
      if (data.nameZhHk) newName['zh-TW'] = data.nameZhHk;
      if (data.nameZhCn) newName['zh-CN'] = data.nameZhCn;
      if (data.nameEn) newName['en'] = data.nameEn;
      updateData.name = newName;
    }

    // Handle multi-language description
    if (data.description !== undefined) {
      if (data.description === null) {
        updateData.description = Prisma.JsonNull;
      } else if (typeof data.description === 'string') {
        updateData.description = { 'zh-TW': data.description, 'en': data.description };
      } else {
        updateData.description = data.description;
      }
    }

    // Handle business hours / opening hours
    if (data.businessHours !== undefined) {
      updateData.openingHours = data.businessHours
        ? { default: data.businessHours }
        : Prisma.JsonNull;
    }
    if (data.openingHours !== undefined) {
      updateData.openingHours = data.openingHours || Prisma.JsonNull;
    }

    // Handle contract dates
    if (data.contractStartDate !== undefined) {
      updateData.contractStartDate = data.contractStartDate ? new Date(data.contractStartDate) : null;
    }
    if (data.contractEndDate !== undefined) {
      updateData.contractEndDate = data.contractEndDate ? new Date(data.contractEndDate) : null;
    }

    // Handle metadata
    if (data.metadata !== undefined) {
      updateData.metadata = data.metadata || Prisma.JsonNull;
    }

    const updated = await this.prisma.merchant.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    });

    this.logger.log(`Merchant updated: ${id}`);
    return updated;
  }

  /**
   * Delete (deactivate) a merchant.
   */
  async deleteMerchant(id: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id },
    });
    if (!merchant) {
      throw new NotFoundException('Merchant not found.');
    }

    await this.prisma.merchant.update({
      where: { id },
      data: {
        status: MerchantStatus.INACTIVE,
        deletedAt: new Date(),
      },
    });

    // Also deactivate all staff accounts for this merchant
    await this.prisma.merchantAccount.updateMany({
      where: { merchantId: id, isActive: true },
      data: { isActive: false },
    });

    this.logger.log(`Merchant deactivated: ${id}`);
    return { message: 'Merchant deactivated successfully' };
  }

  // ─── Merchant Staff ────────────────────────────────────────────────────────

  /**
   * List staff for a merchant.
   */
  async listMerchantStaff(merchantId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });
    if (!merchant) {
      throw new NotFoundException('Merchant not found.');
    }

    const accounts = await this.prisma.merchantAccount.findMany({
      where: {
        merchantId,
        isActive: true,
        deletedAt: null,
      },
      orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
    });

    return accounts;
  }

  /**
   * Add staff to a merchant.
   */
  async addMerchantStaff(
    merchantId: string,
    data: {
      userId?: string;
      name: string;
      phone: string;
      email?: string;
      role: string; // 'owner' | 'manager' | 'staff'
    },
  ) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });
    if (!merchant) {
      throw new NotFoundException('Merchant not found.');
    }

    // Check for duplicate by email or phone within the same merchant
    if (data.email || data.phone) {
      const existingAccount = await this.prisma.merchantAccount.findFirst({
        where: {
          merchantId,
          isActive: true,
          deletedAt: null,
          OR: [
            ...(data.email ? [{ email: data.email }] : []),
            ...(data.phone ? [{ phone: data.phone }] : []),
          ],
        },
      });
      if (existingAccount) {
        throw new ConflictException(
          'A staff member with this email or phone already exists for this merchant.',
        );
      }
    }

    const account = await this.prisma.merchantAccount.create({
      data: {
        merchantId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        role: data.role || 'staff',
        isActive: true,
      },
    });

    this.logger.log(`Staff added to merchant ${merchantId}: ${data.name}`);
    return account;
  }

  /**
   * Remove staff from a merchant.
   */
  async removeMerchantStaff(merchantId: string, staffId: string) {
    const account = await this.prisma.merchantAccount.findFirst({
      where: {
        id: staffId,
        merchantId,
      },
    });
    if (!account) {
      throw new NotFoundException('Merchant staff account not found.');
    }

    await this.prisma.merchantAccount.update({
      where: { id: staffId },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    this.logger.log(`Staff removed from merchant ${merchantId}: ${staffId}`);
    return { message: 'Staff removed from merchant' };
  }

  // ─── Stamp Processing (Merchant Portal) ────────────────────────────────────

  /**
   * Process stamp issuance from the merchant portal.
   * Merchant staff scans receipt and issues stamps to member.
   */
  async processStampIssuance(data: {
    merchantId: string;
    memberId: string;
    receiptNumber: string;
    receiptAmount: number;
    receiptDate: string;
    receiptImageUrl?: string;
    operatorId: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Validate merchant is active
      const merchant = await tx.merchant.findUnique({
        where: { id: data.merchantId },
        include: {
          project: { select: { id: true, groupId: true } },
        },
      });
      if (!merchant) {
        throw new NotFoundException('Merchant not found.');
      }
      if (merchant.status !== MerchantStatus.ACTIVE) {
        throw new BadRequestException('Merchant is not active.');
      }
      if (!merchant.stampEnabled) {
        throw new BadRequestException('Stamp issuance is not enabled for this merchant.');
      }

      // 2. Validate member exists and is active
      const member = await tx.member.findUnique({
        where: { id: data.memberId },
        include: { tier: true },
      });
      if (!member) {
        throw new NotFoundException('Member not found.');
      }
      if (member.status !== 'ACTIVE') {
        throw new BadRequestException('Member account is not active.');
      }

      // 3. Check for duplicate receipt
      const duplicateReceipt = await tx.stampTransaction.findFirst({
        where: {
          merchantId: data.merchantId,
          externalRef: data.receiptNumber,
          status: { not: StampTransactionStatus.REVERSED },
        },
      });
      if (duplicateReceipt) {
        throw new ConflictException(
          'This receipt number has already been processed for this merchant.',
        );
      }

      // 4. Find applicable earning rules
      const now = new Date();
      const earningRule = await tx.stampEarningRule.findFirst({
        where: {
          AND: [
            { status: StampRuleStatus.ACTIVE },
            { effectiveFrom: { lte: now } },
            { OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }] },
            {
              OR: [
                { projectId: merchant.projectId },
                { projectId: null, groupId: merchant.project.groupId },
              ],
            },
            { deletedAt: null },
          ],
        },
        orderBy: { priority: 'asc' },
      });

      // 5. Calculate stamps based on earning rules
      let stampsToIssue = 0;
      if (earningRule) {
        const spendingPerStamp = Number(earningRule.spendingPerStamp);
        if (spendingPerStamp > 0) {
          // Check minimum spending
          if (earningRule.minSpending && data.receiptAmount < Number(earningRule.minSpending)) {
            throw new BadRequestException(
              `Receipt amount ${data.receiptAmount} is below the minimum spending requirement of ${earningRule.minSpending}.`,
            );
          }

          // Calculate base stamps
          stampsToIssue = Math.floor(data.receiptAmount / spendingPerStamp);

          // Apply max stamps per transaction cap from rule
          if (earningRule.maxStampsPerTx && stampsToIssue > earningRule.maxStampsPerTx) {
            stampsToIssue = earningRule.maxStampsPerTx;
          }
        }
      } else {
        // No earning rule found; default: 1 stamp per 100 HKD
        stampsToIssue = Math.floor(data.receiptAmount / 100);
      }

      if (stampsToIssue <= 0) {
        throw new BadRequestException(
          'Receipt amount does not qualify for any stamps based on current earning rules.',
        );
      }

      // 6. Apply campaign bonuses
      let campaignId: string | null = null;
      const campaignRules = await tx.campaignStampRule.findMany({
        where: {
          isActive: true,
          campaign: {
            OR: [
              { projectId: merchant.projectId },
              { projectId: null },
            ],
            status: 'ACTIVE',
            startDate: { lte: now },
            endDate: { gte: now },
          },
        },
        include: { campaign: { select: { id: true } } },
        orderBy: { priority: 'asc' },
      });

      for (const rule of campaignRules) {
        if (rule.multiplier && Number(rule.multiplier) > 1) {
          stampsToIssue = Math.floor(stampsToIssue * Number(rule.multiplier));
          campaignId = rule.campaign.id;
        }
        if (rule.bonusStamps && Number(rule.bonusStamps) > 0) {
          stampsToIssue += Number(rule.bonusStamps);
          campaignId = rule.campaign.id;
        }
      }

      // 7. Apply tier multiplier
      if (member.tier && member.tier.stampMultiplier) {
        const multiplier = Number(member.tier.stampMultiplier);
        if (multiplier > 1) {
          stampsToIssue = Math.floor(stampsToIssue * multiplier);
        }
      }

      // 8. Get or create stamp account and update balance
      const stampAccount = await tx.stampAccount.upsert({
        where: {
          memberId_projectId: {
            memberId: data.memberId,
            projectId: merchant.projectId,
          },
        },
        update: {
          balance: { increment: stampsToIssue },
          totalEarned: { increment: stampsToIssue },
        },
        create: {
          memberId: data.memberId,
          projectId: merchant.projectId,
          balance: stampsToIssue,
          totalEarned: stampsToIssue,
        },
      });

      // 9. Create stamp transaction
      const referenceNo = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const transaction = await tx.stampTransaction.create({
        data: {
          stampAccountId: stampAccount.id,
          memberId: data.memberId,
          transactionType: StampTransactionType.EARN,
          status: StampTransactionStatus.COMPLETED,
          amount: stampsToIssue,
          balanceAfter: Number(stampAccount.balance),
          referenceNo,
          externalRef: data.receiptNumber,
          spendingAmount: data.receiptAmount,
          merchantId: data.merchantId,
          earningRuleId: earningRule?.id,
          campaignId,
          processedBy: data.operatorId,
          channel: 'pos',
          metadata: {
            receiptDate: data.receiptDate,
            receiptImageUrl: data.receiptImageUrl,
          },
          description: {
            'zh-TW': `消費印花獲取 ${stampsToIssue} 印花`,
            'zh-CN': `消费印花获取 ${stampsToIssue} 印花`,
            'en': `Earned ${stampsToIssue} stamps from purchase`,
          },
        },
      });

      this.logger.log(
        `Stamp issuance processed by merchant ${data.merchantId} for member ${data.memberId}: ${stampsToIssue} stamps`,
      );

      return {
        transactionId: transaction.id,
        referenceNo: transaction.referenceNo,
        memberId: data.memberId,
        merchantId: data.merchantId,
        receiptNumber: data.receiptNumber,
        receiptAmount: data.receiptAmount,
        stampsIssued: stampsToIssue,
        balanceAfter: Number(stampAccount.balance),
        earningRuleId: earningRule?.id || null,
        campaignId,
        status: 'completed',
      };
    });
  }

  /**
   * Get stamp processing history for a merchant.
   */
  async getStampHistory(
    merchantId: string,
    params: {
      dateFrom?: string;
      dateTo?: string;
      page?: number;
      pageSize?: number;
    },
  ) {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 20));

    const where: Prisma.StampTransactionWhereInput = {
      merchantId,
    };

    if (params.dateFrom || params.dateTo) {
      where.transactionAt = {};
      if (params.dateFrom) {
        where.transactionAt.gte = new Date(params.dateFrom);
      }
      if (params.dateTo) {
        where.transactionAt.lte = new Date(params.dateTo);
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.stampTransaction.findMany({
        where,
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
          campaign: { select: { id: true, name: true } },
          earningRule: { select: { id: true, name: true } },
        },
        orderBy: { transactionAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.stampTransaction.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  /**
   * Get merchant stamp statistics.
   */
  async getMerchantStats(merchantId: string, period: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });
    if (!merchant) {
      throw new NotFoundException('Merchant not found.');
    }

    // Determine date range from period
    const now = new Date();
    let dateFrom: Date;

    switch (period) {
      case 'daily':
        dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly': {
        dateFrom = new Date(now);
        dateFrom.setDate(dateFrom.getDate() - dateFrom.getDay());
        dateFrom.setHours(0, 0, 0, 0);
        break;
      }
      case 'monthly':
      default:
        dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const dateFilter: Prisma.StampTransactionWhereInput = {
      merchantId,
      status: StampTransactionStatus.COMPLETED,
      transactionAt: {
        gte: dateFrom,
        lte: now,
      },
    };

    // Run aggregate queries in parallel
    const [aggregation, uniqueMembersResult, transactionsByType] = await Promise.all([
      this.prisma.stampTransaction.aggregate({
        where: dateFilter,
        _sum: { amount: true, spendingAmount: true },
        _count: true,
      }),
      this.prisma.stampTransaction.groupBy({
        by: ['memberId'],
        where: dateFilter,
      }),
      this.prisma.stampTransaction.groupBy({
        by: ['transactionType'],
        where: dateFilter,
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const totalTransactions = aggregation._count;
    const totalStampsIssued = Number(aggregation._sum.amount || 0);
    const totalReceiptAmount = Number(aggregation._sum.spendingAmount || 0);
    const uniqueMembers = uniqueMembersResult.length;
    const averageStampsPerTransaction =
      totalTransactions > 0
        ? Math.round((totalStampsIssued / totalTransactions) * 100) / 100
        : 0;
    const averageReceiptAmount =
      totalTransactions > 0
        ? Math.round((totalReceiptAmount / totalTransactions) * 100) / 100
        : 0;

    // Build breakdown by transaction type
    const breakdown: Record<string, { count: number; amount: number }> = {};
    for (const row of transactionsByType) {
      breakdown[row.transactionType] = {
        count: row._count,
        amount: Number(row._sum.amount || 0),
      };
    }

    return {
      merchantId,
      period,
      dateFrom: dateFrom.toISOString(),
      dateTo: now.toISOString(),
      totalTransactions,
      totalStampsIssued,
      totalReceiptAmount,
      uniqueMembers,
      averageStampsPerTransaction,
      averageReceiptAmount,
      breakdown,
    };
  }
}
