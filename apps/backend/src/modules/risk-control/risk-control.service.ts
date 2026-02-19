import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  Prisma,
  RiskAlertType,
  RiskAlertSeverity,
  RiskAlertStatus,
  SpecialListType,
} from '@prisma/client';

/**
 * Risk Control service.
 * Provides risk dashboard, alert management, rule configuration,
 * anomaly detection, special-list management, and anomaly review
 * for the stamp system.
 */
@Injectable()
export class RiskControlService {
  private readonly logger = new Logger(RiskControlService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Dashboard ─────────────────────────────────────────────────────────────

  /**
   * Get risk dashboard overview with key metrics.
   */
  async getDashboard(projectId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const projectFilter: Prisma.RiskAlertWhereInput = projectId
      ? { projectId }
      : {};

    const txProjectFilter: Prisma.StampTransactionWhereInput = projectId
      ? { stampAccount: { projectId } }
      : {};

    const [
      activeAlerts,
      todayTransactions,
      suspiciousCount,
      blockedCount,
      severityDistribution,
      recentAlerts,
      topRiskMembers,
      topRiskMerchants,
    ] = await Promise.all([
      // Active (unresolved) alerts
      this.prisma.riskAlert.count({
        where: { ...projectFilter, status: RiskAlertStatus.ACTIVE },
      }),
      // Today's stamp transactions
      this.prisma.stampTransaction.count({
        where: {
          ...txProjectFilter,
          transactionAt: { gte: startOfDay },
        },
      }),
      // High/Critical severity active alerts (suspicious)
      this.prisma.riskAlert.count({
        where: {
          ...projectFilter,
          status: RiskAlertStatus.ACTIVE,
          severity: { in: [RiskAlertSeverity.HIGH, RiskAlertSeverity.CRITICAL] },
        },
      }),
      // Escalated alerts (blocked/escalated)
      this.prisma.riskAlert.count({
        where: {
          ...projectFilter,
          status: RiskAlertStatus.ESCALATED,
        },
      }),
      // Severity distribution for active alerts
      this.prisma.riskAlert.groupBy({
        by: ['severity'],
        where: { ...projectFilter, status: { not: RiskAlertStatus.DISMISSED } },
        _count: { id: true },
      }),
      // Most recent alerts
      this.prisma.riskAlert.findMany({
        where: projectFilter,
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          member: {
            select: { id: true, firstName: true, lastName: true, memberNo: true },
          },
          merchant: {
            select: { id: true, name: true, code: true },
          },
        },
      }),
      // Top risk members (most alerts)
      this.prisma.riskAlert.groupBy({
        by: ['memberId'],
        where: {
          ...projectFilter,
          memberId: { not: null },
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        _count: { id: true },
        _avg: { score: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
      // Top risk merchants (most alerts)
      this.prisma.riskAlert.groupBy({
        by: ['merchantId'],
        where: {
          ...projectFilter,
          merchantId: { not: null },
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        _count: { id: true },
        _avg: { score: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
    ]);

    // Enrich top risk members with names
    const memberIds = topRiskMembers
      .map((m) => m.memberId)
      .filter((id): id is string => id !== null);
    const members = memberIds.length
      ? await this.prisma.member.findMany({
          where: { id: { in: memberIds } },
          select: { id: true, firstName: true, lastName: true, memberNo: true },
        })
      : [];
    const memberMap = new Map(members.map((m) => [m.id, m]));

    // Enrich top risk merchants with names
    const merchantIds = topRiskMerchants
      .map((m) => m.merchantId)
      .filter((id): id is string => id !== null);
    const merchants = merchantIds.length
      ? await this.prisma.merchant.findMany({
          where: { id: { in: merchantIds } },
          select: { id: true, name: true, code: true },
        })
      : [];
    const merchantMap = new Map(merchants.map((m) => [m.id, m]));

    // Build 7-day trend data
    const trendData: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const count = await this.prisma.riskAlert.count({
        where: {
          ...projectFilter,
          createdAt: { gte: dayStart, lte: dayEnd },
        },
      });
      trendData.push({
        date: dayStart.toISOString().slice(0, 10),
        count,
      });
    }

    // Compute average risk score from recent active alerts
    const avgScore = await this.prisma.riskAlert.aggregate({
      where: { ...projectFilter, status: RiskAlertStatus.ACTIVE },
      _avg: { score: true },
    });

    return {
      projectId,
      activeAlerts,
      todayTransactions,
      suspiciousCount,
      blockedCount,
      riskScore: avgScore._avg.score ? Number(avgScore._avg.score) : 0,
      riskLevelDistribution: severityDistribution.map((d) => ({
        level: d.severity,
        count: d._count.id,
      })),
      trendData,
      recentAlerts,
      topRiskMembers: topRiskMembers.map((m) => ({
        memberId: m.memberId,
        alertCount: m._count.id,
        avgScore: m._avg.score ? Number(m._avg.score) : 0,
        member: m.memberId ? memberMap.get(m.memberId) ?? null : null,
      })),
      topRiskMerchants: topRiskMerchants.map((m) => ({
        merchantId: m.merchantId,
        alertCount: m._count.id,
        avgScore: m._avg.score ? Number(m._avg.score) : 0,
        merchant: m.merchantId ? merchantMap.get(m.merchantId) ?? null : null,
      })),
    };
  }

  // ─── Alerts ────────────────────────────────────────────────────────────────

  /**
   * List risk alerts with filters.
   */
  async listAlerts(params: {
    projectId?: string;
    severity?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = Number(params.page) || 1;
    const pageSize = Math.min(Number(params.pageSize) || 20, 100);
    const skip = (page - 1) * pageSize;

    const where: Prisma.RiskAlertWhereInput = {};

    if (params.projectId) {
      where.projectId = params.projectId;
    }
    if (params.severity) {
      const sev = params.severity.toUpperCase() as RiskAlertSeverity;
      if (Object.values(RiskAlertSeverity).includes(sev)) {
        where.severity = sev;
      }
    }
    if (params.status) {
      const stat = params.status.toUpperCase() as RiskAlertStatus;
      if (Object.values(RiskAlertStatus).includes(stat)) {
        where.status = stat;
      }
    }
    if (params.dateFrom || params.dateTo) {
      where.createdAt = {};
      if (params.dateFrom) {
        where.createdAt.gte = new Date(params.dateFrom);
      }
      if (params.dateTo) {
        where.createdAt.lte = new Date(params.dateTo);
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.riskAlert.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          member: {
            select: { id: true, firstName: true, lastName: true, memberNo: true, phone: true },
          },
          merchant: {
            select: { id: true, name: true, code: true },
          },
        },
      }),
      this.prisma.riskAlert.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  /**
   * Get alert details by ID.
   */
  async getAlertById(alertId: string) {
    const alert = await this.prisma.riskAlert.findUnique({
      where: { id: alertId },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            firstNameZhTW: true,
            lastNameZhTW: true,
            memberNo: true,
            phone: true,
            email: true,
            status: true,
            tierId: true,
            registeredAt: true,
          },
        },
        merchant: {
          select: {
            id: true,
            name: true,
            code: true,
            category: true,
            floor: true,
            unit: true,
            status: true,
          },
        },
      },
    });

    if (!alert) {
      throw new NotFoundException('Alert not found.');
    }

    // If there is a transactionId, fetch the related transaction
    let transaction = null;
    if (alert.transactionId) {
      transaction = await this.prisma.stampTransaction.findUnique({
        where: { id: alert.transactionId },
        include: {
          merchant: { select: { id: true, name: true, code: true } },
        },
      });
    }

    // Fetch recent alerts for the same member (for context)
    let memberAlertHistory: any[] = [];
    if (alert.memberId) {
      memberAlertHistory = await this.prisma.riskAlert.findMany({
        where: {
          memberId: alert.memberId,
          id: { not: alert.id },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          type: true,
          severity: true,
          status: true,
          score: true,
          createdAt: true,
        },
      });
    }

    return {
      ...alert,
      score: alert.score ? Number(alert.score) : null,
      transaction,
      memberAlertHistory,
    };
  }

  /**
   * Review and resolve an alert.
   */
  async reviewAlert(
    alertId: string,
    data: {
      decision: string; // 'approve' | 'reject' | 'escalate'
      notes: string;
      reviewerId: string;
    },
  ) {
    // Verify the alert exists
    const existing = await this.prisma.riskAlert.findUnique({
      where: { id: alertId },
    });
    if (!existing) {
      throw new NotFoundException('Alert not found.');
    }

    // Map decision to status
    let newStatus: RiskAlertStatus;
    switch (data.decision) {
      case 'approve':
        // Approve means it was a false positive -> resolved
        newStatus = RiskAlertStatus.RESOLVED;
        break;
      case 'reject':
        // Reject means confirmed risk -> dismissed (risk acknowledged)
        newStatus = RiskAlertStatus.DISMISSED;
        break;
      case 'escalate':
        newStatus = RiskAlertStatus.ESCALATED;
        break;
      default:
        throw new BadRequestException(
          `Invalid decision "${data.decision}". Must be one of: approve, reject, escalate.`,
        );
    }

    const now = new Date();

    const alert = await this.prisma.riskAlert.update({
      where: { id: alertId },
      data: {
        status: newStatus,
        reviewNotes: data.notes,
        reviewedBy: data.reviewerId,
        reviewedAt: now,
        ...(newStatus === RiskAlertStatus.RESOLVED ? { resolvedAt: now } : {}),
      },
    });

    this.logger.log(
      `Alert ${alertId} reviewed: ${data.decision} -> ${newStatus} by ${data.reviewerId}`,
    );

    return {
      alertId: alert.id,
      decision: data.decision,
      status: alert.status,
      reviewedAt: alert.reviewedAt,
      resolvedAt: alert.resolvedAt,
    };
  }

  // ─── Rules ─────────────────────────────────────────────────────────────────

  /**
   * List risk control rules.
   */
  async listRules(projectId: string) {
    return this.prisma.riskRule.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        OR: [
          { projectId },
          { projectId: null }, // Group-level rules apply to all projects
        ],
      },
      orderBy: { priority: 'asc' },
    });
  }

  /**
   * Create a risk control rule.
   */
  async createRule(data: {
    groupId: string;
    projectId?: string;
    code?: string;
    nameZhHk: string;
    nameEn?: string;
    type: string;
    conditions: Record<string, any>;
    action: string;
    severity: string;
    priority: number;
    cooldownMinutes?: number;
    metadata?: Record<string, any>;
  }) {
    // Generate a unique code if not provided
    const code =
      data.code ||
      `RULE-${data.type.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    // Validate type
    const validTypes = ['velocity', 'amount', 'pattern', 'device', 'location', 'time', 'geolocation'];
    if (!validTypes.includes(data.type)) {
      throw new BadRequestException(
        `Invalid rule type "${data.type}". Must be one of: ${validTypes.join(', ')}`,
      );
    }

    // Validate action
    const validActions = ['flag', 'block', 'suspend-member', 'notify-staff', 'escalate'];
    if (!validActions.includes(data.action)) {
      throw new BadRequestException(
        `Invalid action "${data.action}". Must be one of: ${validActions.join(', ')}`,
      );
    }

    // Validate severity
    const validSeverities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const normalizedSeverity = data.severity.toUpperCase();
    if (!validSeverities.includes(normalizedSeverity)) {
      throw new BadRequestException(
        `Invalid severity "${data.severity}". Must be one of: ${validSeverities.join(', ')}`,
      );
    }

    const rule = await this.prisma.riskRule.create({
      data: {
        groupId: data.groupId,
        projectId: data.projectId || null,
        code,
        name: {
          'zh-TW': data.nameZhHk,
          'zh-CN': data.nameZhHk,
          en: data.nameEn || data.nameZhHk,
        },
        type: data.type,
        conditions: data.conditions as any,
        action: data.action,
        severity: normalizedSeverity,
        priority: data.priority,
        cooldownMinutes: data.cooldownMinutes ?? 0,
        metadata: data.metadata ?? Prisma.JsonNull,
        isActive: true,
      },
    });

    this.logger.log(
      `Risk rule created: ${rule.id} (${rule.code}) type=${data.type} for group=${data.groupId}`,
    );
    return rule;
  }

  /**
   * Update a risk control rule.
   */
  async updateRule(ruleId: string, data: Record<string, any>) {
    const existing = await this.prisma.riskRule.findUnique({
      where: { id: ruleId },
    });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException('Risk rule not found.');
    }

    const updateData: Prisma.RiskRuleUpdateInput = {};

    if (data.nameZhHk !== undefined || data.nameEn !== undefined) {
      const existingName =
        typeof existing.name === 'object' && existing.name !== null
          ? (existing.name as Record<string, string>)
          : {};
      updateData.name = {
        'zh-TW': data.nameZhHk ?? existingName['zh-TW'] ?? '',
        'zh-CN': data.nameZhHk ?? existingName['zh-CN'] ?? '',
        en: data.nameEn ?? existingName['en'] ?? '',
      };
    }
    if (data.type !== undefined) updateData.type = data.type;
    if (data.conditions !== undefined) updateData.conditions = data.conditions;
    if (data.action !== undefined) updateData.action = data.action;
    if (data.severity !== undefined) updateData.severity = data.severity.toUpperCase();
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.cooldownMinutes !== undefined) updateData.cooldownMinutes = data.cooldownMinutes;
    if (data.metadata !== undefined) updateData.metadata = data.metadata;

    const rule = await this.prisma.riskRule.update({
      where: { id: ruleId },
      data: updateData,
    });

    this.logger.log(`Risk rule updated: ${ruleId}`);
    return rule;
  }

  /**
   * Soft-delete a risk control rule.
   */
  async deleteRule(ruleId: string) {
    const existing = await this.prisma.riskRule.findUnique({
      where: { id: ruleId },
    });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException('Risk rule not found.');
    }

    await this.prisma.riskRule.update({
      where: { id: ruleId },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    this.logger.log(`Risk rule soft-deleted: ${ruleId}`);
    return { message: 'Risk rule deleted.' };
  }

  // ─── Anomaly Detection ────────────────────────────────────────────────────

  /**
   * Run anomaly detection analysis for recent transactions.
   * Scans the last 24 hours of transactions and creates RiskAlerts
   * for any detected anomalies.
   */
  async runAnomalyDetection(projectId: string) {
    this.logger.log(`Anomaly detection started for project ${projectId}`);

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
    const alertsCreated: string[] = [];

    // Resolve the groupId from the project
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { groupId: true },
    });
    if (!project) {
      throw new NotFoundException('Project not found.');
    }
    const groupId = project.groupId;

    // Load active rules for this project
    const rules = await this.prisma.riskRule.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        OR: [{ projectId }, { projectId: null }],
        groupId,
      },
    });

    // ── 1. Velocity check: members with too many transactions in a short window ──
    await this.detectVelocityAnomalies(projectId, groupId, since, rules, alertsCreated);

    // ── 2. Amount check: unusually large transactions ──
    await this.detectAmountAnomalies(projectId, groupId, since, rules, alertsCreated);

    // ── 3. Pattern check: duplicate receipt numbers / same merchant repeatedly ──
    await this.detectPatternAnomalies(projectId, groupId, since, alertsCreated);

    this.logger.log(
      `Anomaly detection completed for project ${projectId}: ${alertsCreated.length} alert(s) created`,
    );

    return {
      projectId,
      analysisStarted: new Date().toISOString(),
      status: 'completed',
      alertsCreated: alertsCreated.length,
      alertIds: alertsCreated,
    };
  }

  /**
   * Detect velocity anomalies - members with an excessive number of transactions.
   */
  private async detectVelocityAnomalies(
    projectId: string,
    groupId: string,
    since: Date,
    rules: any[],
    alertsCreated: string[],
  ) {
    // Defaults: flag members with more than 10 transactions in the last 24h
    const velocityRule = rules.find((r) => r.type === 'velocity');
    const threshold =
      velocityRule?.conditions?.maxTransactions ?? 10;

    // Group transactions by member in the window
    const memberTxCounts = await this.prisma.stampTransaction.groupBy({
      by: ['memberId'],
      where: {
        stampAccount: { projectId },
        transactionAt: { gte: since },
        status: 'COMPLETED',
      },
      _count: { id: true },
      having: {
        id: { _count: { gt: threshold } },
      },
    });

    for (const entry of memberTxCounts) {
      // Avoid duplicates: check if we already have an active velocity alert for this member today
      const existingAlert = await this.prisma.riskAlert.findFirst({
        where: {
          projectId,
          memberId: entry.memberId,
          type: RiskAlertType.VELOCITY,
          status: { in: [RiskAlertStatus.ACTIVE, RiskAlertStatus.REVIEWING] },
          createdAt: { gte: since },
        },
      });
      if (existingAlert) continue;

      const score = Math.min(100, ((entry._count.id / threshold) * 50));

      const alert = await this.prisma.riskAlert.create({
        data: {
          groupId,
          projectId,
          type: RiskAlertType.VELOCITY,
          severity:
            score >= 80
              ? RiskAlertSeverity.CRITICAL
              : score >= 60
                ? RiskAlertSeverity.HIGH
                : RiskAlertSeverity.MEDIUM,
          status: RiskAlertStatus.ACTIVE,
          memberId: entry.memberId,
          score,
          description: {
            'zh-TW': `會員在24小時內發起了 ${entry._count.id} 筆交易（閾值: ${threshold}）`,
            'zh-CN': `会员在24小时内发起了 ${entry._count.id} 笔交易（阈值: ${threshold}）`,
            en: `Member made ${entry._count.id} transactions in 24 hours (threshold: ${threshold})`,
          },
          details: {
            transactionCount: entry._count.id,
            threshold,
            windowHours: 24,
            ruleId: velocityRule?.id ?? null,
          },
        },
      });
      alertsCreated.push(alert.id);
    }
  }

  /**
   * Detect amount anomalies - unusually large single transactions.
   */
  private async detectAmountAnomalies(
    projectId: string,
    groupId: string,
    since: Date,
    rules: any[],
    alertsCreated: string[],
  ) {
    const amountRule = rules.find((r) => r.type === 'amount');
    const maxAmount = amountRule?.conditions?.maxAmount ?? 50000;

    // Find transactions with spending amount exceeding the threshold
    const largeTransactions = await this.prisma.stampTransaction.findMany({
      where: {
        stampAccount: { projectId },
        transactionAt: { gte: since },
        status: 'COMPLETED',
        spendingAmount: { gt: maxAmount },
      },
      include: {
        member: { select: { id: true, firstName: true, lastName: true, memberNo: true } },
        merchant: { select: { id: true, name: true, code: true } },
      },
    });

    for (const tx of largeTransactions) {
      // Avoid duplicate alerts for same transaction
      const existingAlert = await this.prisma.riskAlert.findFirst({
        where: {
          projectId,
          transactionId: tx.id,
          type: RiskAlertType.AMOUNT_ANOMALY,
        },
      });
      if (existingAlert) continue;

      const spendingAmt = Number(tx.spendingAmount);
      const ratio = spendingAmt / maxAmount;
      const score = Math.min(100, ratio * 50);

      const alert = await this.prisma.riskAlert.create({
        data: {
          groupId,
          projectId,
          type: RiskAlertType.AMOUNT_ANOMALY,
          severity:
            ratio >= 5
              ? RiskAlertSeverity.CRITICAL
              : ratio >= 3
                ? RiskAlertSeverity.HIGH
                : RiskAlertSeverity.MEDIUM,
          status: RiskAlertStatus.ACTIVE,
          memberId: tx.memberId,
          merchantId: tx.merchantId,
          transactionId: tx.id,
          score,
          description: {
            'zh-TW': `消費金額 HK$${spendingAmt.toLocaleString()} 超過閾值 HK$${maxAmount.toLocaleString()}`,
            'zh-CN': `消费金额 HK$${spendingAmt.toLocaleString()} 超过阈值 HK$${maxAmount.toLocaleString()}`,
            en: `Spending amount HK$${spendingAmt.toLocaleString()} exceeds threshold HK$${maxAmount.toLocaleString()}`,
          },
          details: {
            transactionId: tx.id,
            spendingAmount: spendingAmt,
            stampAmount: Number(tx.amount),
            threshold: maxAmount,
            merchantId: tx.merchantId,
            ruleId: amountRule?.id ?? null,
          },
        },
      });
      alertsCreated.push(alert.id);
    }
  }

  /**
   * Detect pattern anomalies:
   * - Duplicate receipt/reference numbers
   * - Same member transacting at the same merchant excessively
   */
  private async detectPatternAnomalies(
    projectId: string,
    groupId: string,
    since: Date,
    alertsCreated: string[],
  ) {
    // ── 3a. Duplicate receipt numbers ──
    const duplicateReceipts = await this.prisma.stampTransaction.groupBy({
      by: ['externalRef'],
      where: {
        stampAccount: { projectId },
        transactionAt: { gte: since },
        status: 'COMPLETED',
        externalRef: { not: null },
      },
      _count: { id: true },
      having: {
        id: { _count: { gt: 1 } },
      },
    });

    for (const dup of duplicateReceipts) {
      if (!dup.externalRef) continue;

      // Avoid duplicates
      const existingAlert = await this.prisma.riskAlert.findFirst({
        where: {
          projectId,
          type: RiskAlertType.PATTERN,
          status: { in: [RiskAlertStatus.ACTIVE, RiskAlertStatus.REVIEWING] },
          createdAt: { gte: since },
          details: {
            path: ['duplicateRef'],
            equals: dup.externalRef,
          },
        },
      });
      if (existingAlert) continue;

      // Get the transactions involved to determine memberId
      const involvedTxs = await this.prisma.stampTransaction.findMany({
        where: {
          stampAccount: { projectId },
          externalRef: dup.externalRef,
          transactionAt: { gte: since },
        },
        select: { id: true, memberId: true, merchantId: true },
        take: 5,
      });

      const alert = await this.prisma.riskAlert.create({
        data: {
          groupId,
          projectId,
          type: RiskAlertType.PATTERN,
          severity: RiskAlertSeverity.HIGH,
          status: RiskAlertStatus.ACTIVE,
          memberId: involvedTxs[0]?.memberId ?? null,
          merchantId: involvedTxs[0]?.merchantId ?? null,
          transactionId: involvedTxs[0]?.id ?? null,
          score: 75,
          description: {
            'zh-TW': `收據編號 "${dup.externalRef}" 在24小時內出現 ${dup._count.id} 次`,
            'zh-CN': `收据编号 "${dup.externalRef}" 在24小时内出现 ${dup._count.id} 次`,
            en: `Receipt number "${dup.externalRef}" appeared ${dup._count.id} times in 24 hours`,
          },
          details: {
            duplicateRef: dup.externalRef,
            occurrences: dup._count.id,
            transactionIds: involvedTxs.map((t) => t.id),
          },
        },
      });
      alertsCreated.push(alert.id);
    }

    // ── 3b. Same member + same merchant excessively (>5 times in 24h) ──
    const repeatedMerchantVisits = await this.prisma.stampTransaction.groupBy({
      by: ['memberId', 'merchantId'],
      where: {
        stampAccount: { projectId },
        transactionAt: { gte: since },
        status: 'COMPLETED',
        merchantId: { not: null },
      },
      _count: { id: true },
      having: {
        id: { _count: { gt: 5 } },
      },
    });

    for (const entry of repeatedMerchantVisits) {
      if (!entry.merchantId) continue;

      const existingAlert = await this.prisma.riskAlert.findFirst({
        where: {
          projectId,
          memberId: entry.memberId,
          merchantId: entry.merchantId,
          type: RiskAlertType.PATTERN,
          status: { in: [RiskAlertStatus.ACTIVE, RiskAlertStatus.REVIEWING] },
          createdAt: { gte: since },
        },
      });
      if (existingAlert) continue;

      const alert = await this.prisma.riskAlert.create({
        data: {
          groupId,
          projectId,
          type: RiskAlertType.PATTERN,
          severity: RiskAlertSeverity.MEDIUM,
          status: RiskAlertStatus.ACTIVE,
          memberId: entry.memberId,
          merchantId: entry.merchantId,
          score: 50,
          description: {
            'zh-TW': `同一會員在同一商戶24小時內交易 ${entry._count.id} 次`,
            'zh-CN': `同一会员在同一商户24小时内交易 ${entry._count.id} 次`,
            en: `Same member transacted ${entry._count.id} times at same merchant in 24 hours`,
          },
          details: {
            transactionCount: entry._count.id,
            windowHours: 24,
            threshold: 5,
          },
        },
      });
      alertsCreated.push(alert.id);
    }
  }

  /**
   * Get anomaly detection results (recently created anomaly alerts).
   */
  async getAnomalyResults(params: {
    projectId: string;
    dateFrom: string;
    dateTo: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = Number(params.page) || 1;
    const pageSize = Math.min(Number(params.pageSize) || 20, 100);
    const skip = (page - 1) * pageSize;

    const where: Prisma.RiskAlertWhereInput = {
      projectId: params.projectId,
      type: {
        in: [
          RiskAlertType.VELOCITY,
          RiskAlertType.AMOUNT_ANOMALY,
          RiskAlertType.PATTERN,
          RiskAlertType.MEMBER_ANOMALY,
          RiskAlertType.MERCHANT_ANOMALY,
        ],
      },
      createdAt: {
        gte: new Date(params.dateFrom),
        lte: new Date(params.dateTo),
      },
    };

    const [items, total] = await Promise.all([
      this.prisma.riskAlert.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          member: {
            select: { id: true, firstName: true, lastName: true, memberNo: true },
          },
          merchant: {
            select: { id: true, name: true, code: true },
          },
        },
      }),
      this.prisma.riskAlert.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  // ─── Special List Management ──────────────────────────────────────────────

  /**
   * List special list members by type (whitelist / blacklist / watchlist).
   */
  async listSpecialListMembers(params: {
    listType: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = Number(params.page) || 1;
    const pageSize = Math.min(Number(params.pageSize) || 20, 100);
    const skip = (page - 1) * pageSize;

    const normalizedType = params.listType.toUpperCase() as SpecialListType;
    if (!Object.values(SpecialListType).includes(normalizedType)) {
      throw new BadRequestException(
        `Invalid list type "${params.listType}". Must be one of: WHITELIST, BLACKLIST, WATCHLIST`,
      );
    }

    const where: Prisma.SpecialListMemberWhereInput = {
      listType: normalizedType,
      isActive: true,
    };

    const [items, total] = await Promise.all([
      this.prisma.specialListMember.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              firstNameZhTW: true,
              lastNameZhTW: true,
              memberNo: true,
              phone: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.specialListMember.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  /**
   * Add a member to a special list (whitelist / blacklist / watchlist).
   */
  async addToSpecialList(data: {
    memberId: string;
    listType: string;
    reason?: string;
    addedBy?: string;
    effectiveTo?: string;
    metadata?: Record<string, any>;
  }) {
    const normalizedType = data.listType.toUpperCase() as SpecialListType;
    if (!Object.values(SpecialListType).includes(normalizedType)) {
      throw new BadRequestException(
        `Invalid list type "${data.listType}". Must be one of: WHITELIST, BLACKLIST, WATCHLIST`,
      );
    }

    // Verify the member exists
    const member = await this.prisma.member.findUnique({
      where: { id: data.memberId },
      select: { id: true, memberNo: true },
    });
    if (!member) {
      throw new NotFoundException('Member not found.');
    }

    // Check if already on this list and active
    const existing = await this.prisma.specialListMember.findFirst({
      where: {
        memberId: data.memberId,
        listType: normalizedType,
        isActive: true,
      },
    });
    if (existing) {
      throw new BadRequestException(
        `Member is already on the ${normalizedType.toLowerCase()}.`,
      );
    }

    const entry = await this.prisma.specialListMember.create({
      data: {
        memberId: data.memberId,
        listType: normalizedType,
        reason: data.reason ?? null,
        addedBy: data.addedBy ?? null,
        effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
        isActive: true,
        metadata: data.metadata ?? Prisma.JsonNull,
      },
      include: {
        member: {
          select: { id: true, firstName: true, lastName: true, memberNo: true },
        },
      },
    });

    this.logger.log(
      `Member ${data.memberId} added to ${normalizedType} (entry: ${entry.id})`,
    );
    return entry;
  }

  /**
   * Remove a member from a special list (soft deactivation).
   */
  async removeFromSpecialList(entryId: string) {
    const existing = await this.prisma.specialListMember.findUnique({
      where: { id: entryId },
    });
    if (!existing) {
      throw new NotFoundException('Special list entry not found.');
    }
    if (!existing.isActive) {
      throw new BadRequestException('This entry is already inactive.');
    }

    const entry = await this.prisma.specialListMember.update({
      where: { id: entryId },
      data: {
        isActive: false,
        effectiveTo: new Date(),
      },
    });

    this.logger.log(
      `Special list entry ${entryId} deactivated (member: ${entry.memberId}, type: ${entry.listType})`,
    );
    return { message: 'Member removed from special list.', entryId: entry.id };
  }
}
