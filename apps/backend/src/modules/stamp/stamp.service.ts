import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

/**
 * Stamp service.
 * Manages stamp transactions, earning rules, consumption rules,
 * expiry rules, upper limit rules, campaign-specific rules, and clearing statistics.
 */
@Injectable()
export class StampService {
  private readonly logger = new Logger(StampService.name);

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
    // TODO: Validate member exists and is active
    // TODO: Check upper limit rules
    // TODO: Check campaign rules for bonus multiplier
    // TODO: Run risk control checks (anomaly detection)
    // TODO: Create stamp transaction record
    // TODO: Update member stamp balance
    // TODO: Trigger tier recalculation if needed

    // const transaction = await this.prisma.$transaction(async (tx) => {
    //   const member = await tx.member.findUnique({ where: { id: data.memberId } });
    //   if (!member) throw new NotFoundException('Member not found.');
    //   if (member.status !== 'active') throw new BadRequestException('Member account is not active.');
    //
    //   // Check daily/monthly limits
    //   const limits = await this.checkUpperLimits(data.memberId, data.amount, data.projectId);
    //   if (!limits.allowed) throw new BadRequestException(limits.reason);
    //
    //   // Apply campaign bonus
    //   const finalAmount = await this.applyCampaignRules(data.amount, data.projectId, data.ruleId);
    //
    //   const txn = await tx.stampTransaction.create({
    //     data: {
    //       memberId: data.memberId,
    //       type: 'earn',
    //       amount: finalAmount,
    //       receiptNumber: data.receiptNumber,
    //       receiptAmount: data.receiptAmount,
    //       merchantId: data.merchantId,
    //       projectId: data.projectId,
    //       ruleId: data.ruleId,
    //       notes: data.notes,
    //       operatorId: data.operatorId,
    //     },
    //   });
    //
    //   await tx.stampBalance.upsert({
    //     where: { memberId: data.memberId },
    //     update: { balance: { increment: finalAmount } },
    //     create: { memberId: data.memberId, balance: finalAmount },
    //   });
    //
    //   return txn;
    // });

    this.logger.log(`Stamps issued: ${data.amount} to member ${data.memberId}`);
    return {
      transactionId: 'txn-id-placeholder',
      memberId: data.memberId,
      type: 'earn',
      amount: data.amount,
      status: 'completed',
    };
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
    // TODO: Check member has sufficient balance
    // TODO: Create consumption transaction
    // TODO: Update stamp balance

    this.logger.log(`Stamps consumed: ${data.amount} from member ${data.memberId}`);
    return {
      transactionId: 'txn-id-placeholder',
      memberId: data.memberId,
      type: 'consume',
      amount: data.amount,
      status: 'completed',
    };
  }

  /**
   * Void/reverse a stamp transaction.
   */
  async voidTransaction(transactionId: string, reason: string, operatorId: string) {
    // TODO: Find original transaction
    // TODO: Create reversal transaction
    // TODO: Adjust stamp balance

    this.logger.log(`Transaction voided: ${transactionId}`);
    return { transactionId, status: 'voided', reason };
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
    // TODO: Query transactions with filters
    return { items: [], total: 0, page: params.page || 1, pageSize: params.pageSize || 20 };
  }

  /**
   * Get stamp balance for a member.
   */
  async getStampBalance(memberId: string) {
    // TODO: Fetch current balance with breakdown (available, pending expiry, frozen)
    return {
      memberId,
      totalBalance: 0,
      availableBalance: 0,
      pendingExpiryBalance: 0,
      frozenBalance: 0,
    };
  }

  // ─── Earning Rules ─────────────────────────────────────────────────────────

  /**
   * List earning rules for a project.
   */
  async listEarningRules(projectId: string) {
    // TODO: Fetch earning rules
    // return this.prisma.earningRule.findMany({
    //   where: { projectId, status: 'active' },
    //   orderBy: { priority: 'asc' },
    // });

    return [];
  }

  /**
   * Create a new earning rule.
   */
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
    // TODO: Create earning rule
    this.logger.log(`Earning rule created for project ${data.projectId}`);
    return { id: 'rule-id', ...data, status: 'active' };
  }

  /**
   * Update an earning rule.
   */
  async updateEarningRule(ruleId: string, data: Record<string, any>) {
    // TODO: Update earning rule
    return { id: ruleId, ...data };
  }

  /**
   * Delete an earning rule.
   */
  async deleteEarningRule(ruleId: string) {
    // TODO: Soft-delete earning rule
    return { message: 'Earning rule deleted' };
  }

  // ─── Consumption Rules ─────────────────────────────────────────────────────

  /**
   * List consumption rules for a project.
   */
  async listConsumptionRules(projectId: string) {
    // TODO: Fetch consumption rules
    return [];
  }

  /**
   * Create consumption rule.
   */
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
    // TODO: Create consumption rule
    this.logger.log(`Consumption rule created for project ${data.projectId}`);
    return { id: 'rule-id', ...data, status: 'active' };
  }

  // ─── Expiry Rules ──────────────────────────────────────────────────────────

  /**
   * List expiry rules for a project.
   */
  async listExpiryRules(projectId: string) {
    // TODO: Fetch expiry rules
    return [];
  }

  /**
   * Create expiry rule.
   */
  async createExpiryRule(data: {
    projectId: string;
    nameZhHk: string;
    nameEn?: string;
    type: string; // 'fixed_date' | 'rolling_months' | 'end_of_year'
    expiryMonths?: number;
    fixedExpiryDate?: string;
    gracePeriodDays?: number;
    notifyDaysBefore?: number;
  }) {
    // TODO: Create expiry rule
    this.logger.log(`Expiry rule created for project ${data.projectId}`);
    return { id: 'rule-id', ...data, status: 'active' };
  }

  // ─── Upper Limit Rules ────────────────────────────────────────────────────

  /**
   * List upper limit rules for a project.
   */
  async listUpperLimitRules(projectId: string) {
    // TODO: Fetch upper limit rules
    return [];
  }

  /**
   * Create upper limit rule.
   */
  async createUpperLimitRule(data: {
    projectId: string;
    nameZhHk: string;
    nameEn?: string;
    limitType: string; // 'daily' | 'monthly' | 'yearly' | 'per_transaction'
    maxAmount: number;
    scope: string; // 'member' | 'merchant' | 'project'
    tier?: string;
  }) {
    // TODO: Create upper limit rule
    this.logger.log(`Upper limit rule created for project ${data.projectId}`);
    return { id: 'rule-id', ...data, status: 'active' };
  }

  // ─── Campaign Rules ────────────────────────────────────────────────────────

  /**
   * List campaign-specific stamp rules.
   */
  async listCampaignRules(projectId: string) {
    // TODO: Fetch campaign stamp rules
    return [];
  }

  /**
   * Create campaign stamp rule (e.g., 2x stamps for specific period).
   */
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
    // TODO: Create campaign rule
    this.logger.log(`Campaign rule created for campaign ${data.campaignId}`);
    return { id: 'rule-id', ...data, status: 'active' };
  }

  // ─── Clearing Statistics ───────────────────────────────────────────────────

  /**
   * Get clearing statistics (daily/monthly/yearly summaries).
   */
  async getClearingStats(params: {
    projectId: string;
    period: string; // 'daily' | 'monthly' | 'yearly'
    dateFrom: string;
    dateTo: string;
  }) {
    // TODO: Aggregate stamp transaction data for clearing
    // const stats = await this.prisma.stampTransaction.groupBy({
    //   by: ['type'],
    //   where: {
    //     projectId: params.projectId,
    //     createdAt: { gte: new Date(params.dateFrom), lte: new Date(params.dateTo) },
    //   },
    //   _sum: { amount: true },
    //   _count: true,
    // });

    return {
      projectId: params.projectId,
      period: params.period,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      totalEarned: 0,
      totalConsumed: 0,
      totalExpired: 0,
      totalVoided: 0,
      netBalance: 0,
      transactionCount: 0,
    };
  }

  /**
   * Run stamp expiry batch process.
   */
  async runExpiryBatch(projectId: string) {
    // TODO: Find and expire stamps based on expiry rules
    // TODO: Create expiry transactions
    // TODO: Update balances
    // TODO: Send notification to affected members

    this.logger.log(`Stamp expiry batch started for project ${projectId}`);
    return { message: 'Expiry batch processing started', projectId };
  }
}
