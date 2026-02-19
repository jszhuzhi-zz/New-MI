import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, StampTransactionType, StampTransactionStatus, MemberStatus, ReportStatus, CampaignStatus, MerchantStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';

/**
 * Report service.
 * Generates various report types, manages the download center,
 * and provides operation log querying for the membership system.
 */
@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Report Generation ─────────────────────────────────────────────────────

  /**
   * Generate a membership statistics report.
   */
  async generateMembershipReport(params: {
    projectId: string;
    dateFrom: string;
    dateTo: string;
    groupBy?: string; // 'daily' | 'weekly' | 'monthly'
  }) {
    const { projectId, dateFrom, dateTo } = params;
    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    // Total members in this project (regardless of date range)
    const totalMembers = await this.prisma.member.count({
      where: { projectId, deletedAt: null },
    });

    // New registrations within the date range
    const newRegistrations = await this.prisma.member.count({
      where: {
        projectId,
        deletedAt: null,
        registeredAt: { gte: from, lte: to },
      },
    });

    // Active members (status = ACTIVE)
    const activeMembers = await this.prisma.member.count({
      where: {
        projectId,
        deletedAt: null,
        status: MemberStatus.ACTIVE,
      },
    });

    // Inactive members (status = INACTIVE or SUSPENDED or CLOSED)
    const inactiveMembers = await this.prisma.member.count({
      where: {
        projectId,
        deletedAt: null,
        status: { in: [MemberStatus.INACTIVE, MemberStatus.SUSPENDED, MemberStatus.CLOSED] },
      },
    });

    // Retention rate: members who registered before the period AND have stamp
    // transactions within the period, divided by total members registered before the period
    const membersBeforePeriod = await this.prisma.member.count({
      where: {
        projectId,
        deletedAt: null,
        registeredAt: { lt: from },
      },
    });

    let retentionRate = 0;
    if (membersBeforePeriod > 0) {
      const returningMembers = await this.prisma.stampTransaction.groupBy({
        by: ['memberId'],
        where: {
          stampAccount: { projectId },
          transactionAt: { gte: from, lte: to },
          status: StampTransactionStatus.COMPLETED,
          member: { registeredAt: { lt: from }, deletedAt: null },
        },
      });
      retentionRate = Math.round((returningMembers.length / membersBeforePeriod) * 10000) / 100;
    }

    // Tier distribution
    const tierDistributionRaw = await this.prisma.member.groupBy({
      by: ['tierId'],
      where: { projectId, deletedAt: null },
      _count: { id: true },
    });

    // Fetch tier names for the distribution
    const tierIds = tierDistributionRaw
      .map((t) => t.tierId)
      .filter((id): id is string => id !== null);

    const tiers = tierIds.length > 0
      ? await this.prisma.memberTier.findMany({
          where: { id: { in: tierIds } },
          select: { id: true, name: true, level: true, code: true },
        })
      : [];

    const tierMap = new Map(tiers.map((t) => [t.id, t]));

    const tierDistribution = tierDistributionRaw.map((row) => ({
      tierId: row.tierId,
      tierName: row.tierId ? tierMap.get(row.tierId)?.name ?? null : null,
      tierCode: row.tierId ? tierMap.get(row.tierId)?.code ?? null : null,
      count: row._count.id,
    }));

    // Registration trend within the date range
    // We use raw query for date_trunc grouping to produce daily/weekly/monthly buckets
    const groupByInterval = params.groupBy === 'monthly'
      ? 'month'
      : params.groupBy === 'weekly'
        ? 'week'
        : 'day';

    const registrationTrend = await this.prisma.$queryRaw<
      Array<{ period: Date; count: bigint }>
    >(
      Prisma.sql`
        SELECT date_trunc(${groupByInterval}, "registeredAt") AS period,
               COUNT(*)::bigint AS count
        FROM members
        WHERE "projectId" = ${projectId}::uuid
          AND "deletedAt" IS NULL
          AND "registeredAt" >= ${from}
          AND "registeredAt" <= ${to}
        GROUP BY period
        ORDER BY period
      `,
    );

    const registrationTrendFormatted = registrationTrend.map((row) => ({
      period: row.period.toISOString().split('T')[0],
      count: Number(row.count),
    }));

    // Demographics: gender breakdown
    const genderDistribution = await this.prisma.member.groupBy({
      by: ['gender'],
      where: { projectId, deletedAt: null },
      _count: { id: true },
    });

    const gender = genderDistribution.map((row) => ({
      gender: row.gender ?? 'UNKNOWN',
      count: row._count.id,
    }));

    // Demographics: age groups (based on dateOfBirth)
    const ageGroupsRaw = await this.prisma.$queryRaw<
      Array<{ age_group: string; count: bigint }>
    >(
      Prisma.sql`
        SELECT
          CASE
            WHEN "dateOfBirth" IS NULL THEN 'Unknown'
            WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, "dateOfBirth")) < 18 THEN 'Under 18'
            WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, "dateOfBirth")) BETWEEN 18 AND 24 THEN '18-24'
            WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, "dateOfBirth")) BETWEEN 25 AND 34 THEN '25-34'
            WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, "dateOfBirth")) BETWEEN 35 AND 44 THEN '35-44'
            WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, "dateOfBirth")) BETWEEN 45 AND 54 THEN '45-54'
            WHEN EXTRACT(YEAR FROM age(CURRENT_DATE, "dateOfBirth")) BETWEEN 55 AND 64 THEN '55-64'
            ELSE '65+'
          END AS age_group,
          COUNT(*)::bigint AS count
        FROM members
        WHERE "projectId" = ${projectId}::uuid
          AND "deletedAt" IS NULL
        GROUP BY age_group
        ORDER BY age_group
      `,
    );

    const ageGroups = ageGroupsRaw.map((row) => ({
      ageGroup: row.age_group,
      count: Number(row.count),
    }));

    // Demographics: district breakdown (from profile JSON)
    // Members may store district in profile.district or similar. We use a raw
    // query to extract from the profile JSON field, falling back to 'Unknown'.
    const districtsRaw = await this.prisma.$queryRaw<
      Array<{ district: string; count: bigint }>
    >(
      Prisma.sql`
        SELECT
          COALESCE(profile->>'district', 'Unknown') AS district,
          COUNT(*)::bigint AS count
        FROM members
        WHERE "projectId" = ${projectId}::uuid
          AND "deletedAt" IS NULL
        GROUP BY district
        ORDER BY count DESC
        LIMIT 30
      `,
    );

    const districts = districtsRaw.map((row) => ({
      district: row.district,
      count: Number(row.count),
    }));

    return {
      reportType: 'membership',
      projectId,
      period: { from: dateFrom, to: dateTo },
      summary: {
        totalMembers,
        newRegistrations,
        activeMembers,
        inactiveMembers,
        retentionRate,
      },
      tierDistribution,
      registrationTrend: registrationTrendFormatted,
      demographics: { gender, ageGroups, districts },
    };
  }

  /**
   * Generate a stamp transaction report.
   */
  async generateStampReport(params: {
    projectId: string;
    dateFrom: string;
    dateTo: string;
    groupBy?: string;
  }) {
    const { projectId, dateFrom, dateTo } = params;
    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    const baseWhere: Prisma.StampTransactionWhereInput = {
      stampAccount: { projectId },
      transactionAt: { gte: from, lte: to },
      status: StampTransactionStatus.COMPLETED,
    };

    // Aggregate by transaction type
    const byTypeRaw = await this.prisma.stampTransaction.groupBy({
      by: ['transactionType'],
      where: baseWhere,
      _sum: { amount: true },
      _count: { id: true },
    });

    const typeAggMap = new Map(
      byTypeRaw.map((row) => [
        row.transactionType,
        { sum: row._sum.amount?.toNumber() ?? 0, count: row._count.id },
      ]),
    );

    const earnTypes: StampTransactionType[] = [
      StampTransactionType.EARN,
      StampTransactionType.BONUS,
      StampTransactionType.CAMPAIGN_EARN,
      StampTransactionType.ONLINE_ACTIVITY_EARN,
      StampTransactionType.ADJUST_ADD,
      StampTransactionType.TRANSFER_IN,
    ];
    const consumeTypes: StampTransactionType[] = [
      StampTransactionType.REDEEM,
      StampTransactionType.ADJUST_DEDUCT,
      StampTransactionType.TRANSFER_OUT,
    ];

    const totalEarned = earnTypes.reduce(
      (acc, t) => acc + (typeAggMap.get(t)?.sum ?? 0),
      0,
    );
    const totalConsumed = Math.abs(
      consumeTypes.reduce(
        (acc, t) => acc + (typeAggMap.get(t)?.sum ?? 0),
        0,
      ),
    );
    const totalExpired = Math.abs(typeAggMap.get(StampTransactionType.EXPIRE)?.sum ?? 0);
    const totalVoided = Math.abs(typeAggMap.get(StampTransactionType.VOID)?.sum ?? 0);
    const transactionCount = byTypeRaw.reduce((acc, row) => acc + row._count.id, 0);
    const netIssuance = totalEarned - totalConsumed - totalExpired - totalVoided;

    // Unique members with transactions
    const uniqueMembersResult = await this.prisma.stampTransaction.groupBy({
      by: ['memberId'],
      where: baseWhere,
    });
    const uniqueMembers = uniqueMembersResult.length;

    // By merchant
    const byMerchantRaw = await this.prisma.stampTransaction.groupBy({
      by: ['merchantId'],
      where: {
        ...baseWhere,
        merchantId: { not: null },
      },
      _sum: { amount: true, spendingAmount: true },
      _count: { id: true },
    });

    const merchantIds = byMerchantRaw
      .map((r) => r.merchantId)
      .filter((id): id is string => id !== null);

    const merchants = merchantIds.length > 0
      ? await this.prisma.merchant.findMany({
          where: { id: { in: merchantIds } },
          select: { id: true, name: true, code: true, category: true },
        })
      : [];

    const merchantMap = new Map(merchants.map((m) => [m.id, m]));

    const byMerchant = byMerchantRaw.map((row) => ({
      merchantId: row.merchantId,
      merchantName: row.merchantId ? merchantMap.get(row.merchantId)?.name ?? null : null,
      merchantCode: row.merchantId ? merchantMap.get(row.merchantId)?.code ?? null : null,
      category: row.merchantId ? merchantMap.get(row.merchantId)?.category ?? null : null,
      totalAmount: row._sum.amount?.toNumber() ?? 0,
      totalSpending: row._sum.spendingAmount?.toNumber() ?? 0,
      transactionCount: row._count.id,
    }));

    // By earning rule
    const byRuleRaw = await this.prisma.stampTransaction.groupBy({
      by: ['earningRuleId'],
      where: {
        ...baseWhere,
        earningRuleId: { not: null },
      },
      _sum: { amount: true },
      _count: { id: true },
    });

    const ruleIds = byRuleRaw
      .map((r) => r.earningRuleId)
      .filter((id): id is string => id !== null);

    const rules = ruleIds.length > 0
      ? await this.prisma.stampEarningRule.findMany({
          where: { id: { in: ruleIds } },
          select: { id: true, name: true, code: true },
        })
      : [];

    const ruleMap = new Map(rules.map((r) => [r.id, r]));

    const byRule = byRuleRaw.map((row) => ({
      earningRuleId: row.earningRuleId,
      ruleName: row.earningRuleId ? ruleMap.get(row.earningRuleId)?.name ?? null : null,
      ruleCode: row.earningRuleId ? ruleMap.get(row.earningRuleId)?.code ?? null : null,
      totalAmount: row._sum.amount?.toNumber() ?? 0,
      transactionCount: row._count.id,
    }));

    // Daily trend
    const groupByInterval = params.groupBy === 'monthly'
      ? 'month'
      : params.groupBy === 'weekly'
        ? 'week'
        : 'day';

    const dailyTrendRaw = await this.prisma.$queryRaw<
      Array<{ period: Date; total_earned: number; total_consumed: number; tx_count: bigint }>
    >(
      Prisma.sql`
        SELECT
          date_trunc(${groupByInterval}, st."transactionAt") AS period,
          COALESCE(SUM(CASE WHEN st."transactionType" IN ('EARN','BONUS','CAMPAIGN_EARN','ONLINE_ACTIVITY_EARN','ADJUST_ADD','TRANSFER_IN') THEN st.amount ELSE 0 END), 0)::float AS total_earned,
          COALESCE(SUM(CASE WHEN st."transactionType" IN ('REDEEM','ADJUST_DEDUCT','TRANSFER_OUT') THEN ABS(st.amount) ELSE 0 END), 0)::float AS total_consumed,
          COUNT(*)::bigint AS tx_count
        FROM stamp_transactions st
        JOIN stamp_accounts sa ON sa.id = st."stampAccountId"
        WHERE sa."projectId" = ${projectId}::uuid
          AND st."transactionAt" >= ${from}
          AND st."transactionAt" <= ${to}
          AND st.status = 'COMPLETED'
        GROUP BY period
        ORDER BY period
      `,
    );

    const dailyTrend = dailyTrendRaw.map((row) => ({
      period: row.period.toISOString().split('T')[0],
      totalEarned: Number(row.total_earned),
      totalConsumed: Number(row.total_consumed),
      transactionCount: Number(row.tx_count),
    }));

    return {
      reportType: 'stamp_transactions',
      projectId,
      period: { from: dateFrom, to: dateTo },
      summary: {
        totalEarned,
        totalConsumed,
        totalExpired,
        totalVoided,
        netIssuance,
        transactionCount,
        uniqueMembers,
      },
      byMerchant,
      byRule,
      dailyTrend,
    };
  }

  /**
   * Generate a campaign performance report.
   */
  async generateCampaignReport(params: {
    projectId: string;
    campaignId?: string;
    dateFrom: string;
    dateTo: string;
  }) {
    const { projectId, dateFrom, dateTo, campaignId } = params;
    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    const campaignWhere: Prisma.CampaignWhereInput = {
      projectId,
      deletedAt: null,
      startDate: { lte: to },
      endDate: { gte: from },
    };

    if (campaignId) {
      campaignWhere.id = campaignId;
    }

    // Total campaigns matching criteria
    const totalCampaigns = await this.prisma.campaign.count({
      where: campaignWhere,
    });

    // Active campaigns
    const activeCampaigns = await this.prisma.campaign.count({
      where: {
        ...campaignWhere,
        status: CampaignStatus.ACTIVE,
      },
    });

    // Fetch campaigns with participation counts
    const campaigns = await this.prisma.campaign.findMany({
      where: campaignWhere,
      select: {
        id: true,
        code: true,
        name: true,
        campaignType: true,
        status: true,
        startDate: true,
        endDate: true,
        maxParticipants: true,
        currentParticipants: true,
        totalBudget: true,
      },
      orderBy: { startDate: 'desc' },
    });

    // Aggregate stamp transactions linked to campaigns in date range
    const campaignIds = campaigns.map((c) => c.id);

    // Stamp transactions by campaign
    const stampsByCampaign = campaignIds.length > 0
      ? await this.prisma.stampTransaction.groupBy({
          by: ['campaignId'],
          where: {
            campaignId: { in: campaignIds },
            transactionAt: { gte: from, lte: to },
            status: StampTransactionStatus.COMPLETED,
          },
          _sum: { amount: true },
          _count: { id: true },
        })
      : [];

    const stampsByCampaignMap = new Map(
      stampsByCampaign.map((row) => [
        row.campaignId,
        { totalAmount: row._sum.amount?.toNumber() ?? 0, count: row._count.id },
      ]),
    );

    // Coupon redemptions by campaign (via Coupon -> CouponInstance)
    const couponsByCampaign = campaignIds.length > 0
      ? await this.prisma.couponInstance.groupBy({
          by: ['couponId'],
          where: {
            coupon: { campaignId: { in: campaignIds } },
            status: 'USED',
            usedAt: { gte: from, lte: to },
          },
          _count: { id: true },
        })
      : [];

    // Map couponId -> campaignId
    const couponsToCampaign = campaignIds.length > 0
      ? await this.prisma.coupon.findMany({
          where: { campaignId: { in: campaignIds } },
          select: { id: true, campaignId: true },
        })
      : [];
    const couponCampaignMap = new Map(couponsToCampaign.map((c) => [c.id, c.campaignId]));

    const redemptionsByCampaignMap = new Map<string, number>();
    for (const row of couponsByCampaign) {
      const cId = couponCampaignMap.get(row.couponId);
      if (cId) {
        redemptionsByCampaignMap.set(
          cId,
          (redemptionsByCampaignMap.get(cId) ?? 0) + row._count.id,
        );
      }
    }

    // Unique participants by campaign (distinct members from stamp transactions)
    const participantsByCampaign = campaignIds.length > 0
      ? await this.prisma.$queryRaw<
          Array<{ campaign_id: string; unique_participants: bigint }>
        >(
          Prisma.sql`
            SELECT "campaignId" AS campaign_id,
                   COUNT(DISTINCT "memberId")::bigint AS unique_participants
            FROM stamp_transactions
            WHERE "campaignId" = ANY(${campaignIds}::uuid[])
              AND "transactionAt" >= ${from}
              AND "transactionAt" <= ${to}
              AND status = 'COMPLETED'
            GROUP BY "campaignId"
          `,
        )
      : [];

    const participantsMap = new Map(
      participantsByCampaign.map((r) => [r.campaign_id, Number(r.unique_participants)]),
    );

    // Total participants and redemptions across all campaigns
    const totalParticipants = [...participantsMap.values()].reduce((a, b) => a + b, 0);
    const totalRedemptions = [...redemptionsByCampaignMap.values()].reduce((a, b) => a + b, 0);
    const totalStampsConsumed = Math.abs(
      stampsByCampaign.reduce((acc, row) => {
        const amt = row._sum.amount?.toNumber() ?? 0;
        return amt < 0 ? acc + amt : acc;
      }, 0),
    );

    const campaignPerformance = campaigns.map((c) => {
      const stamps = stampsByCampaignMap.get(c.id);
      const participants = participantsMap.get(c.id) ?? 0;
      const redemptions = redemptionsByCampaignMap.get(c.id) ?? 0;

      return {
        campaignId: c.id,
        code: c.code,
        name: c.name,
        campaignType: c.campaignType,
        status: c.status,
        startDate: c.startDate.toISOString().split('T')[0],
        endDate: c.endDate.toISOString().split('T')[0],
        maxParticipants: c.maxParticipants,
        currentParticipants: c.currentParticipants,
        uniqueParticipants: participants,
        stampsIssued: stamps?.totalAmount ?? 0,
        stampTransactionCount: stamps?.count ?? 0,
        couponRedemptions: redemptions,
        participationRate: c.maxParticipants
          ? Math.round((participants / c.maxParticipants) * 10000) / 100
          : null,
        budget: c.totalBudget?.toNumber() ?? null,
      };
    });

    return {
      reportType: 'campaign',
      projectId,
      campaignId: campaignId ?? null,
      period: { from: dateFrom, to: dateTo },
      summary: {
        totalCampaigns,
        activeCampaigns,
        totalParticipants,
        totalRedemptions,
        totalStampsConsumed,
      },
      campaignPerformance,
    };
  }

  /**
   * Generate a merchant performance report.
   */
  async generateMerchantReport(params: {
    projectId: string;
    merchantId?: string;
    dateFrom: string;
    dateTo: string;
  }) {
    const { projectId, dateFrom, dateTo, merchantId } = params;
    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    const merchantWhere: Prisma.MerchantWhereInput = {
      projectId,
      deletedAt: null,
    };

    if (merchantId) {
      merchantWhere.id = merchantId;
    }

    // Total merchants
    const totalMerchants = await this.prisma.merchant.count({
      where: merchantWhere,
    });

    // Active merchants
    const activeMerchants = await this.prisma.merchant.count({
      where: {
        ...merchantWhere,
        status: MerchantStatus.ACTIVE,
      },
    });

    // Aggregate stamp transactions by merchant within the date range
    const txWhere: Prisma.StampTransactionWhereInput = {
      stampAccount: { projectId },
      transactionAt: { gte: from, lte: to },
      status: StampTransactionStatus.COMPLETED,
      merchantId: merchantId ? merchantId : { not: null },
    };

    const totalTransactions = await this.prisma.stampTransaction.count({
      where: txWhere,
    });

    const totalSumsResult = await this.prisma.stampTransaction.aggregate({
      where: txWhere,
      _sum: { amount: true, spendingAmount: true },
    });

    const totalStampsIssued = totalSumsResult._sum.amount?.toNumber() ?? 0;
    const totalReceiptAmount = totalSumsResult._sum.spendingAmount?.toNumber() ?? 0;

    // Merchant-level breakdown
    const merchantAgg = await this.prisma.stampTransaction.groupBy({
      by: ['merchantId'],
      where: txWhere,
      _sum: { amount: true, spendingAmount: true },
      _count: { id: true },
    });

    const aggMerchantIds = merchantAgg
      .map((r) => r.merchantId)
      .filter((id): id is string => id !== null);

    const merchantRecords = aggMerchantIds.length > 0
      ? await this.prisma.merchant.findMany({
          where: { id: { in: aggMerchantIds } },
          select: { id: true, name: true, code: true, category: true, status: true },
        })
      : [];

    const merchantRecordMap = new Map(merchantRecords.map((m) => [m.id, m]));

    // Unique members per merchant
    const uniqueMembersByMerchant = aggMerchantIds.length > 0
      ? await this.prisma.$queryRaw<
          Array<{ merchant_id: string; unique_members: bigint }>
        >(
          Prisma.sql`
            SELECT st."merchantId" AS merchant_id,
                   COUNT(DISTINCT st."memberId")::bigint AS unique_members
            FROM stamp_transactions st
            JOIN stamp_accounts sa ON sa.id = st."stampAccountId"
            WHERE sa."projectId" = ${projectId}::uuid
              AND st."transactionAt" >= ${from}
              AND st."transactionAt" <= ${to}
              AND st.status = 'COMPLETED'
              AND st."merchantId" = ANY(${aggMerchantIds}::uuid[])
            GROUP BY st."merchantId"
          `,
        )
      : [];

    const uniqueMembersMap = new Map(
      uniqueMembersByMerchant.map((r) => [r.merchant_id, Number(r.unique_members)]),
    );

    const merchantDetails = merchantAgg
      .map((row) => {
        const merchant = row.merchantId ? merchantRecordMap.get(row.merchantId) : null;
        return {
          merchantId: row.merchantId,
          merchantName: merchant?.name ?? null,
          merchantCode: merchant?.code ?? null,
          category: merchant?.category ?? null,
          status: merchant?.status ?? null,
          totalStamps: row._sum.amount?.toNumber() ?? 0,
          totalSpending: row._sum.spendingAmount?.toNumber() ?? 0,
          transactionCount: row._count.id,
          uniqueMembers: row.merchantId ? (uniqueMembersMap.get(row.merchantId) ?? 0) : 0,
        };
      })
      .sort((a, b) => b.totalStamps - a.totalStamps);

    // Merchant ranking (top merchants by stamps issued)
    const merchantRanking = merchantDetails.map((m, idx) => ({
      rank: idx + 1,
      ...m,
    }));

    return {
      reportType: 'merchant',
      projectId,
      period: { from: dateFrom, to: dateTo },
      summary: {
        totalMerchants,
        activeMerchants,
        totalTransactions,
        totalStampsIssued,
        totalReceiptAmount,
      },
      merchantRanking,
      merchantDetails,
    };
  }

  /**
   * Generate a risk control report.
   * Since there is no dedicated RiskAlert model in the schema, this report
   * aggregates suspicious patterns from audit logs, operation logs, and
   * blocked/reversed stamp transactions as risk indicators.
   */
  async generateRiskReport(params: {
    projectId: string;
    dateFrom: string;
    dateTo: string;
  }) {
    const { projectId, dateFrom, dateTo } = params;
    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    // Blocked/reversed/failed transactions as risk signals
    const riskyTransactions = await this.prisma.stampTransaction.groupBy({
      by: ['status'],
      where: {
        stampAccount: { projectId },
        transactionAt: { gte: from, lte: to },
        status: { in: [StampTransactionStatus.REVERSED, StampTransactionStatus.FAILED] },
      },
      _count: { id: true },
    });

    const blockedTransactions = riskyTransactions.reduce(
      (acc, row) => acc + row._count.id,
      0,
    );

    // Voided transactions
    const voidedCount = await this.prisma.stampTransaction.count({
      where: {
        stampAccount: { projectId },
        transactionAt: { gte: from, lte: to },
        transactionType: StampTransactionType.VOID,
      },
    });

    // Flagged members (blacklisted members in this project)
    const flaggedMembers = await this.prisma.specialListMember.count({
      where: {
        listType: 'BLACKLIST',
        isActive: true,
        member: { projectId },
      },
    });

    // Flagged/suspended merchants
    const flaggedMerchants = await this.prisma.merchant.count({
      where: {
        projectId,
        deletedAt: null,
        status: MerchantStatus.SUSPENDED,
      },
    });

    // Audit log entries that may indicate risk (DELETE actions, etc.)
    const auditAlerts = await this.prisma.auditLog.groupBy({
      by: ['action'],
      where: {
        createdAt: { gte: from, lte: to },
      },
      _count: { id: true },
    });

    const alertsByType = auditAlerts.map((row) => ({
      type: row.action,
      count: row._count.id,
    }));

    // Operation logs grouped by result (failures as severity indicators)
    const operationResults = await this.prisma.operationLog.groupBy({
      by: ['result'],
      where: {
        createdAt: { gte: from, lte: to },
      },
      _count: { id: true },
    });

    const alertsBySeverity = operationResults.map((row) => ({
      severity: row.result === 'failure' ? 'HIGH' : row.result === 'partial' ? 'MEDIUM' : 'LOW',
      result: row.result,
      count: row._count.id,
    }));

    const totalAlerts = blockedTransactions + voidedCount + flaggedMembers + flaggedMerchants;
    const resolvedAlerts = riskyTransactions
      .filter((r) => r.status === StampTransactionStatus.REVERSED)
      .reduce((acc, r) => acc + r._count.id, 0);

    // Trend of risky events over time
    const trendRaw = await this.prisma.$queryRaw<
      Array<{ period: Date; count: bigint }>
    >(
      Prisma.sql`
        SELECT date_trunc('day', st."transactionAt") AS period,
               COUNT(*)::bigint AS count
        FROM stamp_transactions st
        JOIN stamp_accounts sa ON sa.id = st."stampAccountId"
        WHERE sa."projectId" = ${projectId}::uuid
          AND st."transactionAt" >= ${from}
          AND st."transactionAt" <= ${to}
          AND (st.status IN ('REVERSED', 'FAILED') OR st."transactionType" = 'VOID')
        GROUP BY period
        ORDER BY period
      `,
    );

    const trend = trendRaw.map((row) => ({
      period: row.period.toISOString().split('T')[0],
      count: Number(row.count),
    }));

    return {
      reportType: 'risk_control',
      projectId,
      period: { from: dateFrom, to: dateTo },
      summary: {
        totalAlerts,
        resolvedAlerts,
        blockedTransactions,
        flaggedMembers,
        flaggedMerchants,
      },
      alertsByType,
      alertsBySeverity,
      trend,
    };
  }

  // ─── Download Center ───────────────────────────────────────────────────────

  /**
   * List generated reports available for download.
   */
  async listDownloads(params: {
    projectId?: string;
    reportType?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { page = 1, pageSize = 20 } = params;

    const where: Prisma.ReportDownloadWhereInput = {};
    if (params.reportType) where.reportType = params.reportType;
    if (params.status) where.status = params.status as ReportStatus;

    // ReportDownload does not have a direct projectId field.
    // Filter by reportType parameters if a projectId filter is needed.
    if (params.projectId) {
      where.parameters = { path: ['projectId'], equals: params.projectId };
    }

    const [items, total] = await Promise.all([
      this.prisma.reportDownload.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, displayName: true, email: true },
          },
        },
      }),
      this.prisma.reportDownload.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        reportType: item.reportType,
        name: item.name,
        fileFormat: item.fileFormat,
        fileSize: item.fileSize ? Number(item.fileSize) : null,
        status: item.status,
        progress: item.progress,
        errorMessage: item.errorMessage,
        requestedBy: item.user,
        expiresAt: item.expiresAt,
        completedAt: item.completedAt,
        createdAt: item.createdAt,
      })),
      total,
      page,
      pageSize,
    };
  }

  /**
   * Request a report export (async generation).
   */
  async requestExport(data: {
    reportType: string;
    projectId: string;
    format: string; // 'xlsx' | 'csv' | 'pdf'
    params: Record<string, any>;
    requestedBy: string;
  }) {
    const record = await this.prisma.reportDownload.create({
      data: {
        userId: data.requestedBy,
        reportType: data.reportType,
        name: { en: `${data.reportType} report`, 'zh-TW': `${data.reportType} \u5831\u544a`, 'zh-CN': `${data.reportType} \u62a5\u544a` },
        fileFormat: data.format,
        parameters: {
          ...data.params,
          projectId: data.projectId,
        },
        status: ReportStatus.PENDING,
        progress: 0,
      },
    });

    this.logger.log(
      `Report export requested: ${data.reportType} for project ${data.projectId}, record ${record.id}`,
    );

    return {
      jobId: record.id,
      reportType: data.reportType,
      format: data.format,
      status: record.status,
      estimatedCompletionTime: '2 minutes',
    };
  }

  /**
   * Get download URL for a completed report.
   */
  async getDownloadUrl(downloadId: string) {
    const download = await this.prisma.reportDownload.findUnique({
      where: { id: downloadId },
    });

    if (!download) {
      throw new NotFoundException('Download not found.');
    }

    if (download.status !== ReportStatus.COMPLETED) {
      throw new BadRequestException(
        `Report is not ready. Current status: ${download.status}`,
      );
    }

    if (!download.fileUrl) {
      throw new BadRequestException('Report file URL is not available.');
    }

    if (download.expiresAt && download.expiresAt < new Date()) {
      throw new BadRequestException('Download link has expired.');
    }

    return {
      downloadId: download.id,
      url: download.fileUrl,
      fileName: download.name,
      fileFormat: download.fileFormat,
      fileSize: download.fileSize ? Number(download.fileSize) : null,
      expiresAt: download.expiresAt,
    };
  }

  // ─── Operation Logs ────────────────────────────────────────────────────────

  /**
   * Query operation/audit logs.
   * Queries the OperationLog table with filters and pagination.
   */
  async queryOperationLogs(params: {
    projectId?: string;
    userId?: string;
    action?: string;
    resource?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { page = 1, pageSize = 20 } = params;

    const where: Prisma.OperationLogWhereInput = {};

    if (params.userId) where.userId = params.userId;
    if (params.action) where.operation = params.action;
    if (params.resource) where.entityType = params.resource;

    // OperationLog does not have a direct projectId field.
    // Filter by module or use requestData JSON if needed.
    if (params.projectId) {
      where.requestData = { path: ['projectId'], equals: params.projectId };
    }

    if (params.dateFrom || params.dateTo) {
      where.createdAt = {};
      if (params.dateFrom) where.createdAt.gte = new Date(params.dateFrom);
      if (params.dateTo) where.createdAt.lte = new Date(params.dateTo);
    }

    const [items, total] = await Promise.all([
      this.prisma.operationLog.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, displayName: true, email: true, portalType: true },
          },
        },
      }),
      this.prisma.operationLog.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        userId: item.userId,
        user: item.user,
        module: item.module,
        operation: item.operation,
        entityType: item.entityType,
        entityId: item.entityId,
        description: item.description,
        result: item.result,
        ipAddress: item.ipAddress,
        durationMs: item.durationMs,
        createdAt: item.createdAt,
      })),
      total,
      page,
      pageSize,
    };
  }

  /**
   * Get operation log entry by ID.
   */
  async getOperationLogById(logId: string) {
    const log = await this.prisma.operationLog.findUnique({
      where: { id: logId },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
            portalType: true,
            username: true,
          },
        },
      },
    });

    if (!log) {
      throw new NotFoundException(`Operation log entry with ID ${logId} not found.`);
    }

    return {
      id: log.id,
      userId: log.userId,
      user: log.user,
      module: log.module,
      operation: log.operation,
      entityType: log.entityType,
      entityId: log.entityId,
      description: log.description,
      requestData: log.requestData,
      responseData: log.responseData,
      result: log.result,
      errorMessage: log.errorMessage,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      durationMs: log.durationMs,
      createdAt: log.createdAt,
    };
  }
}
