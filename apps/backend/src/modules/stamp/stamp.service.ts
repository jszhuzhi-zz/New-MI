import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { Prisma, StampTransactionType, StampTransactionStatus, StampRuleStatus, StampUpperLimitPeriod } from '@prisma/client';

/**
 * Stamp service.
 * Manages stamp transactions, earning rules, consumption rules,
 * expiry rules, upper limit rules, campaign-specific rules, and clearing statistics.
 */
@Injectable()
export class StampService {
  private readonly logger = new Logger(StampService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Transactions ──────────────────────────────────────────────────────────

  /**
   * Issue stamps to a member (earning transaction).
   */
  async issueStamps(data: {
    memberId: string;
    amount: number;
    receiptNumber?: string;
    receiptAmount?: number;
    merchantId?: string;
    projectId: string;
    ruleId?: string;
    notes?: string;
    operatorId: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Validate member exists and is active
      const member = await tx.member.findUnique({
        where: { id: data.memberId },
        include: { tier: true },
      });
      if (!member) throw new NotFoundException('Member not found.');
      if (member.status !== 'ACTIVE') throw new BadRequestException('Member account is not active.');

      // 2. Check upper limit rules
      const limitCheck = await this.checkUpperLimits(tx, data.memberId, data.amount, data.projectId);
      if (!limitCheck.allowed) throw new BadRequestException(limitCheck.reason);

      // 3. Apply campaign rules for bonus multiplier
      let finalAmount = data.amount;
      const campaignBonus = await this.applyCampaignRules(tx, data.amount, data.projectId, data.ruleId);
      finalAmount = campaignBonus.finalAmount;

      // 4. Apply tier multiplier
      if (member.tier && member.tier.stampMultiplier) {
        const multiplier = Number(member.tier.stampMultiplier);
        if (multiplier > 1) {
          finalAmount = Math.floor(finalAmount * multiplier);
        }
      }

      // 5. Get or create stamp account
      const stampAccount = await tx.stampAccount.upsert({
        where: {
          memberId_projectId: {
            memberId: data.memberId,
            projectId: data.projectId,
          },
        },
        update: {
          balance: { increment: finalAmount },
          totalEarned: { increment: finalAmount },
        },
        create: {
          memberId: data.memberId,
          projectId: data.projectId,
          balance: finalAmount,
          totalEarned: finalAmount,
        },
      });

      // 6. Determine expiry date based on active expiry rules
      const expiresAt = await this.calculateExpiryDate(tx, data.projectId);

      // 7. Create stamp transaction record
      const newBalance = Number(stampAccount.balance) + (stampAccount.id ? 0 : finalAmount);
      const transaction = await tx.stampTransaction.create({
        data: {
          stampAccountId: stampAccount.id,
          memberId: data.memberId,
          transactionType: StampTransactionType.EARN,
          status: StampTransactionStatus.COMPLETED,
          amount: finalAmount,
          balanceAfter: Number(stampAccount.balance),
          referenceNo: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          externalRef: data.receiptNumber,
          spendingAmount: data.receiptAmount,
          merchantId: data.merchantId,
          earningRuleId: data.ruleId,
          expiresAt,
          processedBy: data.operatorId,
          channel: 'pos',
          remark: data.notes,
          description: {
            'zh-TW': `消費印花獲取 ${finalAmount} 印花`,
            'zh-CN': `消费印花获取 ${finalAmount} 印花`,
            'en': `Earned ${finalAmount} stamps from purchase`,
          },
        },
      });

      this.logger.log(`Stamps issued: ${finalAmount} to member ${data.memberId} (original: ${data.amount})`);
      return {
        transactionId: transaction.id,
        memberId: data.memberId,
        type: 'earn',
        amount: finalAmount,
        originalAmount: data.amount,
        balanceAfter: Number(stampAccount.balance),
        campaignBonus: campaignBonus.bonusApplied,
        status: 'completed',
      };
    });
  }

  /**
   * Consume (redeem) stamps from a member.
   */
  async consumeStamps(data: {
    memberId: string;
    amount: number;
    purpose: string;
    campaignId?: string;
    projectId: string;
    operatorId: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Check member has sufficient balance
      const stampAccount = await tx.stampAccount.findUnique({
        where: {
          memberId_projectId: {
            memberId: data.memberId,
            projectId: data.projectId,
          },
        },
      });

      if (!stampAccount) throw new BadRequestException('No stamp account found for this member.');
      if (Number(stampAccount.balance) < data.amount) {
        throw new BadRequestException(
          `Insufficient stamp balance. Available: ${stampAccount.balance}, Required: ${data.amount}`,
        );
      }

      // 2. Update stamp balance
      const updated = await tx.stampAccount.update({
        where: { id: stampAccount.id },
        data: {
          balance: { decrement: data.amount },
          totalRedeemed: { increment: data.amount },
        },
      });

      // 3. Create consumption transaction
      const transaction = await tx.stampTransaction.create({
        data: {
          stampAccountId: stampAccount.id,
          memberId: data.memberId,
          transactionType: StampTransactionType.REDEEM,
          status: StampTransactionStatus.COMPLETED,
          amount: -data.amount,
          balanceAfter: Number(updated.balance),
          referenceNo: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          campaignId: data.campaignId,
          processedBy: data.operatorId,
          channel: 'app',
          remark: data.purpose,
          description: {
            'zh-TW': `兌換消耗 ${data.amount} 印花 - ${data.purpose}`,
            'zh-CN': `兑换消耗 ${data.amount} 印花 - ${data.purpose}`,
            'en': `Redeemed ${data.amount} stamps - ${data.purpose}`,
          },
        },
      });

      this.logger.log(`Stamps consumed: ${data.amount} from member ${data.memberId}`);
      return {
        transactionId: transaction.id,
        memberId: data.memberId,
        type: 'consume',
        amount: data.amount,
        balanceAfter: Number(updated.balance),
        status: 'completed',
      };
    });
  }

  /**
   * Void/reverse a stamp transaction.
   */
  async voidTransaction(transactionId: string, reason: string, operatorId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Find original transaction
      const original = await tx.stampTransaction.findUnique({
        where: { id: transactionId },
      });
      if (!original) throw new NotFoundException('Transaction not found.');
      if (original.status === StampTransactionStatus.REVERSED) {
        throw new BadRequestException('Transaction has already been voided.');
      }

      // 2. Reverse the balance change
      const reverseAmount = -Number(original.amount);
      const stampAccount = await tx.stampAccount.update({
        where: { id: original.stampAccountId },
        data: {
          balance: { increment: reverseAmount },
          ...(Number(original.amount) > 0
            ? { totalEarned: { decrement: Number(original.amount) } }
            : { totalRedeemed: { decrement: Math.abs(Number(original.amount)) } }),
        },
      });

      // 3. Mark original as reversed
      await tx.stampTransaction.update({
        where: { id: transactionId },
        data: { status: StampTransactionStatus.REVERSED },
      });

      // 4. Create reversal transaction
      const reversal = await tx.stampTransaction.create({
        data: {
          stampAccountId: original.stampAccountId,
          memberId: original.memberId,
          transactionType: StampTransactionType.VOID,
          status: StampTransactionStatus.COMPLETED,
          amount: reverseAmount,
          balanceAfter: Number(stampAccount.balance),
          referenceNo: `VOID-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          originalTransactionId: transactionId,
          processedBy: operatorId,
          channel: 'admin',
          remark: reason,
          description: {
            'zh-TW': `沖銷交易 - ${reason}`,
            'zh-CN': `冲销交易 - ${reason}`,
            'en': `Void transaction - ${reason}`,
          },
        },
      });

      this.logger.log(`Transaction voided: ${transactionId}`);
      return {
        transactionId: reversal.id,
        originalTransactionId: transactionId,
        status: 'voided',
        reason,
        balanceAfter: Number(stampAccount.balance),
      };
    });
  }

  /**
   * Get stamp transaction history for a member.
   */
  async getTransactionHistory(params: {
    memberId?: string;
    projectId?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const where: Prisma.StampTransactionWhereInput = {};

    if (params.memberId) where.memberId = params.memberId;
    if (params.projectId) where.stampAccount = { projectId: params.projectId };
    if (params.type) where.transactionType = params.type.toUpperCase() as StampTransactionType;
    if (params.dateFrom || params.dateTo) {
      where.transactionAt = {};
      if (params.dateFrom) where.transactionAt.gte = new Date(params.dateFrom);
      if (params.dateTo) where.transactionAt.lte = new Date(params.dateTo);
    }

    const [items, total] = await Promise.all([
      this.prisma.stampTransaction.findMany({
        where,
        include: {
          merchant: { select: { id: true, name: true, code: true } },
          campaign: { select: { id: true, name: true } },
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
   * Get stamp balance for a member.
   */
  async getStampBalance(memberId: string) {
    const accounts = await this.prisma.stampAccount.findMany({
      where: { memberId },
      include: { project: { select: { id: true, name: true, code: true } } },
    });

    if (accounts.length === 0) {
      return {
        memberId,
        totalBalance: 0,
        availableBalance: 0,
        pendingExpiryBalance: 0,
        frozenBalance: 0,
        accounts: [],
      };
    }

    const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);
    const pendingExpiry = accounts.reduce((sum, a) => sum + Number(a.expiringBalance), 0);
    const frozen = accounts.reduce((sum, a) => sum + Number(a.pendingBalance), 0);

    return {
      memberId,
      totalBalance,
      availableBalance: totalBalance - frozen,
      pendingExpiryBalance: pendingExpiry,
      frozenBalance: frozen,
      accounts: accounts.map((a) => ({
        projectId: a.projectId,
        projectName: a.project.name,
        balance: Number(a.balance),
        totalEarned: Number(a.totalEarned),
        totalRedeemed: Number(a.totalRedeemed),
        totalExpired: Number(a.totalExpired),
      })),
    };
  }

  // ─── Earning Rules ─────────────────────────────────────────────────────────

  async listEarningRules(projectId: string) {
    const rules = await this.prisma.stampEarningRule.findMany({
      where: {
        OR: [{ projectId }, { projectId: null }],
        status: StampRuleStatus.ACTIVE,
        deletedAt: null,
      },
      orderBy: { priority: 'asc' },
    });
    return rules;
  }

  async createEarningRule(data: {
    projectId: string;
    nameZhHk: string;
    nameEn?: string;
    type: string;
    conditions: Record<string, any>;
    stampAmount: number;
    multiplier?: number;
    effectiveFrom: string;
    effectiveTo?: string;
    priority: number;
  }) {
    // Look up the group for this project
    const project = await this.prisma.project.findUnique({ where: { id: data.projectId } });
    if (!project) throw new NotFoundException('Project not found.');

    const rule = await this.prisma.stampEarningRule.create({
      data: {
        groupId: project.groupId,
        projectId: data.projectId,
        code: `ER-${Date.now()}`,
        name: { 'zh-TW': data.nameZhHk, 'en': data.nameEn || data.nameZhHk },
        spendingPerStamp: data.stampAmount,
        priority: data.priority,
        effectiveFrom: new Date(data.effectiveFrom),
        effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
        roundingMode: 'floor',
        ruleConfig: data.conditions,
      },
    });

    this.logger.log(`Earning rule created for project ${data.projectId}`);
    return rule;
  }

  async updateEarningRule(ruleId: string, data: Record<string, any>) {
    const rule = await this.prisma.stampEarningRule.findUnique({ where: { id: ruleId } });
    if (!rule) throw new NotFoundException('Earning rule not found.');

    const updated = await this.prisma.stampEarningRule.update({
      where: { id: ruleId },
      data: {
        ...(data.nameZhHk && { name: { 'zh-TW': data.nameZhHk, 'en': data.nameEn || data.nameZhHk } }),
        ...(data.stampAmount !== undefined && { spendingPerStamp: data.stampAmount }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.effectiveFrom && { effectiveFrom: new Date(data.effectiveFrom) }),
        ...(data.effectiveTo && { effectiveTo: new Date(data.effectiveTo) }),
        ...(data.status && { status: data.status }),
        ...(data.conditions && { ruleConfig: data.conditions }),
      },
    });
    return updated;
  }

  async deleteEarningRule(ruleId: string) {
    await this.prisma.stampEarningRule.update({
      where: { id: ruleId },
      data: { status: StampRuleStatus.INACTIVE, deletedAt: new Date() },
    });
    return { message: 'Earning rule deleted' };
  }

  // ─── Consumption Rules ─────────────────────────────────────────────────────

  async listConsumptionRules(projectId: string) {
    return this.prisma.stampConsumptionRule.findMany({
      where: {
        OR: [{ projectId }, { projectId: null }],
        status: StampRuleStatus.ACTIVE,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createConsumptionRule(data: {
    projectId: string;
    nameZhHk: string;
    nameEn?: string;
    minStamps: number;
    maxStampsPerTransaction?: number;
    validFor: string[];
    effectiveFrom: string;
    effectiveTo?: string;
  }) {
    const project = await this.prisma.project.findUnique({ where: { id: data.projectId } });
    if (!project) throw new NotFoundException('Project not found.');

    const rule = await this.prisma.stampConsumptionRule.create({
      data: {
        groupId: project.groupId,
        projectId: data.projectId,
        code: `CR-${Date.now()}`,
        name: { 'zh-TW': data.nameZhHk, 'en': data.nameEn || data.nameZhHk },
        minStamps: data.minStamps,
        consumptionType: data.validFor.join(','),
        effectiveFrom: new Date(data.effectiveFrom),
        effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
      },
    });

    this.logger.log(`Consumption rule created for project ${data.projectId}`);
    return rule;
  }

  // ─── Expiry Rules ──────────────────────────────────────────────────────────

  async listExpiryRules(projectId: string) {
    return this.prisma.stampExpiryRule.findMany({
      where: {
        OR: [{ projectId }, { projectId: null }],
        status: StampRuleStatus.ACTIVE,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createExpiryRule(data: {
    projectId: string;
    nameZhHk: string;
    nameEn?: string;
    type: string;
    expiryMonths?: number;
    fixedExpiryDate?: string;
    gracePeriodDays?: number;
    notifyDaysBefore?: number;
  }) {
    const project = await this.prisma.project.findUnique({ where: { id: data.projectId } });
    if (!project) throw new NotFoundException('Project not found.');

    const expiryModeMap: Record<string, any> = {
      fixed_date: 'FIXED_DATE',
      rolling_months: 'ROLLING_DAYS',
      end_of_year: 'END_OF_YEAR',
      end_of_month: 'END_OF_MONTH',
      never: 'NEVER',
    };

    const rule = await this.prisma.stampExpiryRule.create({
      data: {
        groupId: project.groupId,
        projectId: data.projectId,
        code: `EXP-${Date.now()}`,
        name: { 'zh-TW': data.nameZhHk, 'en': data.nameEn || data.nameZhHk },
        expiryMode: expiryModeMap[data.type] || 'NEVER',
        fixedExpiryDate: data.fixedExpiryDate ? new Date(data.fixedExpiryDate) : null,
        rollingDays: data.expiryMonths ? data.expiryMonths * 30 : null,
        gracePeriodDays: data.gracePeriodDays || 0,
        notifyDaysBefore: data.notifyDaysBefore || 30,
        effectiveFrom: new Date(),
      },
    });

    this.logger.log(`Expiry rule created for project ${data.projectId}`);
    return rule;
  }

  // ─── Upper Limit Rules ────────────────────────────────────────────────────

  async listUpperLimitRules(projectId: string) {
    return this.prisma.stampUpperLimitRule.findMany({
      where: {
        OR: [{ projectId }, { projectId: null }],
        status: StampRuleStatus.ACTIVE,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createUpperLimitRule(data: {
    projectId: string;
    nameZhHk: string;
    nameEn?: string;
    limitType: string;
    maxAmount: number;
    scope: string;
    tier?: string;
  }) {
    const project = await this.prisma.project.findUnique({ where: { id: data.projectId } });
    if (!project) throw new NotFoundException('Project not found.');

    const periodMap: Record<string, StampUpperLimitPeriod> = {
      daily: StampUpperLimitPeriod.DAILY,
      weekly: StampUpperLimitPeriod.WEEKLY,
      monthly: StampUpperLimitPeriod.MONTHLY,
      yearly: StampUpperLimitPeriod.YEARLY,
      per_transaction: StampUpperLimitPeriod.PER_TRANSACTION,
      lifetime: StampUpperLimitPeriod.LIFETIME,
    };

    const rule = await this.prisma.stampUpperLimitRule.create({
      data: {
        groupId: project.groupId,
        projectId: data.projectId,
        code: `UL-${Date.now()}`,
        name: { 'zh-TW': data.nameZhHk, 'en': data.nameEn || data.nameZhHk },
        period: periodMap[data.limitType] || StampUpperLimitPeriod.DAILY,
        maxAmount: data.maxAmount,
        applicableTierIds: data.tier ? [data.tier] : [],
        effectiveFrom: new Date(),
      },
    });

    this.logger.log(`Upper limit rule created for project ${data.projectId}`);
    return rule;
  }

  // ─── Campaign Rules ────────────────────────────────────────────────────────

  async listCampaignRules(projectId: string) {
    return this.prisma.campaignStampRule.findMany({
      where: {
        campaign: {
          OR: [{ projectId }, { projectId: null }],
          status: { in: ['ACTIVE', 'APPROVED'] },
        },
        isActive: true,
      },
      include: {
        campaign: { select: { id: true, name: true, startDate: true, endDate: true } },
        earningRule: { select: { id: true, name: true } },
      },
      orderBy: { priority: 'asc' },
    });
  }

  async createCampaignRule(data: {
    projectId: string;
    campaignId: string;
    nameZhHk: string;
    nameEn?: string;
    multiplier: number;
    bonusStamps?: number;
    conditions: Record<string, any>;
    effectiveFrom: string;
    effectiveTo: string;
  }) {
    const rule = await this.prisma.campaignStampRule.create({
      data: {
        campaignId: data.campaignId,
        multiplier: data.multiplier,
        bonusStamps: data.bonusStamps || 0,
        conditions: data.conditions,
        priority: 0,
      },
    });

    this.logger.log(`Campaign rule created for campaign ${data.campaignId}`);
    return rule;
  }

  // ─── Clearing Statistics ───────────────────────────────────────────────────

  async getClearingStats(params: {
    projectId: string;
    period: string;
    dateFrom: string;
    dateTo: string;
  }) {
    const dateFilter = {
      transactionAt: {
        gte: new Date(params.dateFrom),
        lte: new Date(params.dateTo),
      },
    };

    const stats = await this.prisma.stampTransaction.groupBy({
      by: ['transactionType'],
      where: {
        stampAccount: { projectId: params.projectId },
        status: StampTransactionStatus.COMPLETED,
        ...dateFilter,
      },
      _sum: { amount: true },
      _count: true,
    });

    const result = {
      totalEarned: 0,
      totalConsumed: 0,
      totalExpired: 0,
      totalVoided: 0,
      transactionCount: 0,
    };

    for (const stat of stats) {
      const amount = Math.abs(Number(stat._sum.amount || 0));
      result.transactionCount += stat._count;
      switch (stat.transactionType) {
        case 'EARN':
        case 'BONUS':
        case 'CAMPAIGN_EARN':
          result.totalEarned += amount;
          break;
        case 'REDEEM':
          result.totalConsumed += amount;
          break;
        case 'EXPIRE':
          result.totalExpired += amount;
          break;
        case 'VOID':
          result.totalVoided += amount;
          break;
      }
    }

    return {
      projectId: params.projectId,
      period: params.period,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      ...result,
      netBalance: result.totalEarned - result.totalConsumed - result.totalExpired - result.totalVoided,
    };
  }

  /**
   * Run stamp expiry batch process.
   */
  async runExpiryBatch(projectId: string) {
    const now = new Date();

    // Find all transactions that have expired but haven't been processed
    const expiredTransactions = await this.prisma.stampTransaction.findMany({
      where: {
        stampAccount: { projectId },
        transactionType: StampTransactionType.EARN,
        status: StampTransactionStatus.COMPLETED,
        expiresAt: { lte: now },
        amount: { gt: 0 },
      },
      include: { stampAccount: true },
    });

    let totalExpired = 0;
    let membersAffected = 0;
    const processedMembers = new Set<string>();

    for (const txn of expiredTransactions) {
      const expireAmount = Number(txn.amount);
      if (expireAmount <= 0) continue;

      // Create expiry transaction
      await this.prisma.$transaction(async (tx) => {
        const account = await tx.stampAccount.update({
          where: { id: txn.stampAccountId },
          data: {
            balance: { decrement: expireAmount },
            totalExpired: { increment: expireAmount },
          },
        });

        await tx.stampTransaction.create({
          data: {
            stampAccountId: txn.stampAccountId,
            memberId: txn.memberId,
            transactionType: StampTransactionType.EXPIRE,
            status: StampTransactionStatus.COMPLETED,
            amount: -expireAmount,
            balanceAfter: Number(account.balance),
            referenceNo: `EXP-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            originalTransactionId: txn.id,
            channel: 'system',
            description: {
              'zh-TW': `印花過期 ${expireAmount} 枚`,
              'zh-CN': `印花过期 ${expireAmount} 枚`,
              'en': `${expireAmount} stamps expired`,
            },
          },
        });

        // Mark original as expired
        await tx.stampTransaction.update({
          where: { id: txn.id },
          data: { status: StampTransactionStatus.EXPIRED },
        });
      });

      totalExpired += expireAmount;
      if (!processedMembers.has(txn.memberId)) {
        processedMembers.add(txn.memberId);
        membersAffected++;
      }
    }

    this.logger.log(`Stamp expiry batch completed for project ${projectId}: ${totalExpired} stamps expired, ${membersAffected} members affected`);
    return {
      message: 'Expiry batch processing completed',
      projectId,
      totalExpired,
      membersAffected,
      transactionsProcessed: expiredTransactions.length,
    };
  }

  // ─── Private Helper Methods ───────────────────────────────────────────────

  /**
   * Check upper limit rules for a stamp earning transaction.
   */
  private async checkUpperLimits(
    tx: Prisma.TransactionClient,
    memberId: string,
    amount: number,
    projectId: string,
  ): Promise<{ allowed: boolean; reason?: string }> {
    const now = new Date();
    const rules = await tx.stampUpperLimitRule.findMany({
      where: {
        AND: [
          { OR: [{ projectId }, { projectId: null }] },
          { OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }] },
        ],
        status: StampRuleStatus.ACTIVE,
        effectiveFrom: { lte: now },
      },
    });

    for (const rule of rules) {
      const maxAmount = Number(rule.maxAmount);
      let dateFilter: { gte: Date } | undefined;

      switch (rule.period) {
        case StampUpperLimitPeriod.PER_TRANSACTION:
          if (amount > maxAmount) {
            return { allowed: false, reason: `Transaction exceeds per-transaction limit of ${maxAmount} stamps` };
          }
          continue;
        case StampUpperLimitPeriod.DAILY:
          dateFilter = { gte: new Date(new Date().setHours(0, 0, 0, 0)) };
          break;
        case StampUpperLimitPeriod.WEEKLY: {
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          weekStart.setHours(0, 0, 0, 0);
          dateFilter = { gte: weekStart };
          break;
        }
        case StampUpperLimitPeriod.MONTHLY:
          dateFilter = { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) };
          break;
        case StampUpperLimitPeriod.YEARLY:
          dateFilter = { gte: new Date(new Date().getFullYear(), 0, 1) };
          break;
        case StampUpperLimitPeriod.LIFETIME:
          dateFilter = undefined;
          break;
      }

      const earnedInPeriod = await tx.stampTransaction.aggregate({
        where: {
          memberId,
          transactionType: { in: [StampTransactionType.EARN, StampTransactionType.BONUS, StampTransactionType.CAMPAIGN_EARN] },
          status: StampTransactionStatus.COMPLETED,
          stampAccount: { projectId },
          ...(dateFilter && { transactionAt: dateFilter }),
        },
        _sum: { amount: true },
      });

      const currentTotal = Number(earnedInPeriod._sum.amount || 0);
      if (currentTotal + amount > maxAmount) {
        return {
          allowed: false,
          reason: `Would exceed ${rule.period.toLowerCase()} limit of ${maxAmount} stamps (current: ${currentTotal})`,
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Apply campaign rules for bonus stamps/multipliers.
   */
  private async applyCampaignRules(
    tx: Prisma.TransactionClient,
    baseAmount: number,
    projectId: string,
    ruleId?: string,
  ): Promise<{ finalAmount: number; bonusApplied: boolean }> {
    const now = new Date();
    const campaignRules = await tx.campaignStampRule.findMany({
      where: {
        isActive: true,
        campaign: {
          OR: [{ projectId }, { projectId: null }],
          status: 'ACTIVE',
          startDate: { lte: now },
          endDate: { gte: now },
        },
      },
      orderBy: { priority: 'asc' },
    });

    if (campaignRules.length === 0) return { finalAmount: baseAmount, bonusApplied: false };

    let finalAmount = baseAmount;
    let bonusApplied = false;

    for (const rule of campaignRules) {
      if (rule.multiplier && Number(rule.multiplier) > 1) {
        finalAmount = Math.floor(finalAmount * Number(rule.multiplier));
        bonusApplied = true;
      }
      if (rule.bonusStamps && Number(rule.bonusStamps) > 0) {
        finalAmount += Number(rule.bonusStamps);
        bonusApplied = true;
      }
    }

    return { finalAmount, bonusApplied };
  }

  /**
   * Calculate expiry date based on active expiry rules.
   */
  private async calculateExpiryDate(tx: Prisma.TransactionClient, projectId: string): Promise<Date | null> {
    const rule = await tx.stampExpiryRule.findFirst({
      where: {
        OR: [{ projectId }, { projectId: null }],
        status: StampRuleStatus.ACTIVE,
        effectiveFrom: { lte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!rule) return null;

    const now = new Date();
    switch (rule.expiryMode) {
      case 'FIXED_DATE':
        return rule.fixedExpiryDate || null;
      case 'ROLLING_DAYS':
        return rule.rollingDays
          ? new Date(now.getTime() + rule.rollingDays * 24 * 60 * 60 * 1000)
          : null;
      case 'END_OF_MONTH': {
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + (rule.rollingPeriods || 1), 0);
        return endOfMonth;
      }
      case 'END_OF_YEAR': {
        const endOfYear = new Date(now.getFullYear() + (rule.rollingPeriods || 0), 11, 31);
        return endOfYear;
      }
      case 'NEVER':
      default:
        return null;
    }
  }
}
