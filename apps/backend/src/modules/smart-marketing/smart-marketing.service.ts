import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { Prisma, JourneyStatus } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class SmartMarketingService {
  private readonly logger = new Logger(SmartMarketingService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Generate a unique alphanumeric code with optional prefix.
   */
  private generateCode(length = 8, prefix = ''): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = randomBytes(length);
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars[bytes[i] % chars.length];
    }
    return prefix ? `${prefix}-${code}` : code;
  }

  /**
   * Build a Prisma where-clause for Members from segment/tag rule conditions.
   * Supports demographic, transactional, engagement, and lifecycle conditions.
   */
  private buildMemberWhereFromConditions(
    conditions: any[],
    logic: 'and' | 'or' = 'and',
  ): Prisma.MemberWhereInput {
    if (!conditions || conditions.length === 0) return {};

    const clauses: Prisma.MemberWhereInput[] = conditions
      .map((c) => this.conditionToMemberWhere(c))
      .filter((c) => c !== null) as Prisma.MemberWhereInput[];

    if (clauses.length === 0) return {};
    if (clauses.length === 1) return clauses[0];

    return logic === 'or' ? { OR: clauses } : { AND: clauses };
  }

  /**
   * Convert a single TagCondition to a Prisma MemberWhereInput.
   */
  private conditionToMemberWhere(condition: any): Prisma.MemberWhereInput | null {
    const { field, operator, value } = condition;
    if (!field || !operator) return null;

    // Map common demographic fields directly on Member
    const directFields: Record<string, string> = {
      gender: 'gender',
      email: 'email',
      phone: 'phone',
      status: 'status',
      tierId: 'tierId',
      preferredLanguage: 'preferredLanguage',
      registrationSource: 'registrationSource',
      marketingConsent: 'marketingConsent',
      isVerified: 'isVerified',
    };

    const prismaField = directFields[field] || field;

    switch (operator) {
      case 'equals':
        return { [prismaField]: value };
      case 'not_equals':
        return { [prismaField]: { not: value } };
      case 'greater_than':
        return { [prismaField]: { gt: value } };
      case 'less_than':
        return { [prismaField]: { lt: value } };
      case 'greater_equal':
        return { [prismaField]: { gte: value } };
      case 'less_equal':
        return { [prismaField]: { lte: value } };
      case 'between':
        if (Array.isArray(value) && value.length === 2) {
          return { [prismaField]: { gte: value[0], lte: value[1] } };
        }
        return null;
      case 'in':
        return { [prismaField]: { in: Array.isArray(value) ? value : [value] } };
      case 'not_in':
        return { [prismaField]: { notIn: Array.isArray(value) ? value : [value] } };
      case 'contains':
        return { [prismaField]: { contains: value, mode: 'insensitive' } };
      case 'not_contains':
        return { NOT: { [prismaField]: { contains: value, mode: 'insensitive' } } };
      case 'starts_with':
        return { [prismaField]: { startsWith: value, mode: 'insensitive' } };
      case 'ends_with':
        return { [prismaField]: { endsWith: value, mode: 'insensitive' } };
      case 'is_null':
        return { [prismaField]: null };
      case 'is_not_null':
        return { [prismaField]: { not: null } };
      case 'days_since_gt': {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - Number(value));
        return { [prismaField]: { lt: cutoff } };
      }
      case 'days_since_lt': {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - Number(value));
        return { [prismaField]: { gt: cutoff } };
      }
      default:
        this.logger.warn(`Unknown condition operator: ${operator}`);
        return null;
    }
  }

  // ==========================================
  // Dashboard
  // ==========================================

  async getDashboard(projectId?: string) {
    const projectFilter = projectId ? { projectId } : {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [
      activeAutoTagRules,
      activeTriggers,
      activeJourneys,
      todayTriggerExecutions,
      topTriggersRaw,
      segmentsRaw,
    ] = await this.prisma.$transaction([
      // Count active auto-tag rules
      this.prisma.autoTagRule.count({
        where: { deletedAt: null, isActive: true, ...projectFilter },
      }),
      // Count active marketing triggers
      this.prisma.marketingTrigger.count({
        where: { deletedAt: null, isActive: true, ...projectFilter },
      }),
      // Count active journeys
      this.prisma.memberJourney.count({
        where: { deletedAt: null, status: JourneyStatus.ACTIVE, ...projectFilter },
      }),
      // Count triggers executed today (by lastTriggeredAt)
      this.prisma.marketingTrigger.count({
        where: {
          deletedAt: null,
          lastTriggeredAt: { gte: today },
          ...projectFilter,
        },
      }),
      // Top triggers by execution count
      this.prisma.marketingTrigger.findMany({
        where: { deletedAt: null, isActive: true, ...projectFilter },
        orderBy: { executionCount: 'desc' },
        take: 5,
        select: { id: true, name: true, executionCount: true, metadata: true },
      }),
      // Segment distribution
      this.prisma.memberSegment.findMany({
        where: { deletedAt: null, isActive: true, ...projectFilter },
        orderBy: { memberCount: 'desc' },
        take: 10,
        select: { id: true, name: true, memberCount: true },
      }),
    ]);

    // Compute segment distribution percentages
    const totalSegmentMembers = segmentsRaw.reduce((sum, s) => sum + s.memberCount, 0);
    const segmentDistribution = segmentsRaw.map((s) => ({
      segmentId: s.id,
      name: s.name,
      memberCount: s.memberCount,
      percentage: totalSegmentMembers > 0
        ? Math.round((s.memberCount / totalSegmentMembers) * 10000) / 100
        : 0,
    }));

    const topTriggers = topTriggersRaw.map((t) => ({
      triggerId: t.id,
      name: t.name,
      executions: t.executionCount,
      conversionRate: 0, // Would need dedicated analytics tracking
    }));

    return {
      activeAutoTagRules,
      activeTriggers,
      activeJourneys,
      todayTriggerExecutions,
      weeklyMessagesSent: 0, // Would require a dedicated notification analytics query
      campaignPerformance: [],
      topTriggers,
      segmentDistribution,
    };
  }

  // ==========================================
  // Auto-Tag Rules
  // ==========================================

  async listAutoTagRules(query: any) {
    const page = Number(query.page) || 1;
    const pageSize = Math.min(Number(query.pageSize) || 20, 100);
    const skip = (page - 1) * pageSize;

    const where: Prisma.AutoTagRuleWhereInput = {
      deletedAt: null,
    };

    if (query.projectId) {
      where.projectId = query.projectId;
    }
    if (query.status === 'active') {
      where.isActive = true;
    } else if (query.status === 'inactive') {
      where.isActive = false;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.autoTagRule.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        include: {
          tag: {
            select: { id: true, name: true, code: true, category: true, color: true },
          },
        },
      }),
      this.prisma.autoTagRule.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  async getAutoTagRule(id: string) {
    const rule = await this.prisma.autoTagRule.findFirst({
      where: { id, deletedAt: null },
      include: {
        tag: {
          select: { id: true, name: true, code: true, category: true, color: true },
        },
      },
    });

    if (!rule) {
      throw new NotFoundException(`Auto-tag rule not found: ${id}`);
    }

    return rule;
  }

  async createAutoTagRule(data: any) {
    // Validate tag exists
    const tag = await this.prisma.memberLabel.findFirst({
      where: { id: data.tagId, deletedAt: null },
    });
    if (!tag) {
      throw new BadRequestException(`Tag not found: ${data.tagId}`);
    }

    const groupId = data.groupId || tag.groupId;
    const code = data.code || this.generateCode(8, 'ATR');

    // Check code uniqueness within group
    const existing = await this.prisma.autoTagRule.findUnique({
      where: { groupId_code: { groupId, code } },
    });
    if (existing) {
      throw new ConflictException(`Auto-tag rule code already exists: ${code}`);
    }

    const rule = await this.prisma.autoTagRule.create({
      data: {
        groupId,
        projectId: data.projectId || null,
        code,
        name: data.name || {},
        tagId: data.tagId,
        conditions: data.conditions || [],
        isActive: data.isActive ?? true,
        priority: data.priority ?? 0,
        metadata: {
          conditionLogic: data.conditionLogic || 'and',
          autoRemove: data.autoRemove ?? false,
          evaluationFrequency: data.evaluationFrequency || 'daily',
          description: data.description || {},
        },
      },
      include: {
        tag: {
          select: { id: true, name: true, code: true, category: true, color: true },
        },
      },
    });

    this.logger.log(`Created auto-tag rule: ${rule.id} (code: ${code})`);
    return rule;
  }

  async updateAutoTagRule(id: string, data: any) {
    const existing = await this.prisma.autoTagRule.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      throw new NotFoundException(`Auto-tag rule not found: ${id}`);
    }

    // If changing tagId, validate the new tag exists
    if (data.tagId && data.tagId !== existing.tagId) {
      const tag = await this.prisma.memberLabel.findFirst({
        where: { id: data.tagId, deletedAt: null },
      });
      if (!tag) {
        throw new BadRequestException(`Tag not found: ${data.tagId}`);
      }
    }

    const updateData: Prisma.AutoTagRuleUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.tagId !== undefined) updateData.tag = { connect: { id: data.tagId } };
    if (data.conditions !== undefined) updateData.conditions = data.conditions;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.metadata !== undefined) {
      updateData.metadata = data.metadata;
    } else {
      // Merge individual metadata fields
      const currentMeta = (existing.metadata as Record<string, any>) || {};
      const newMeta = { ...currentMeta };
      if (data.conditionLogic !== undefined) newMeta.conditionLogic = data.conditionLogic;
      if (data.autoRemove !== undefined) newMeta.autoRemove = data.autoRemove;
      if (data.evaluationFrequency !== undefined) newMeta.evaluationFrequency = data.evaluationFrequency;
      if (data.description !== undefined) newMeta.description = data.description;
      updateData.metadata = newMeta;
    }

    const updated = await this.prisma.autoTagRule.update({
      where: { id },
      data: updateData,
      include: {
        tag: {
          select: { id: true, name: true, code: true, category: true, color: true },
        },
      },
    });

    this.logger.log(`Updated auto-tag rule: ${id}`);
    return updated;
  }

  async deleteAutoTagRule(id: string) {
    const existing = await this.prisma.autoTagRule.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      throw new NotFoundException(`Auto-tag rule not found: ${id}`);
    }

    await this.prisma.autoTagRule.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    this.logger.log(`Soft-deleted auto-tag rule: ${id}`);
    return { success: true };
  }

  async executeAutoTagRule(id: string) {
    const rule = await this.prisma.autoTagRule.findFirst({
      where: { id, deletedAt: null },
      include: { tag: true },
    });
    if (!rule) {
      throw new NotFoundException(`Auto-tag rule not found: ${id}`);
    }

    const conditions = rule.conditions as any[];
    const meta = (rule.metadata as Record<string, any>) || {};
    const conditionLogic: 'and' | 'or' = meta.conditionLogic || 'and';
    const autoRemove = meta.autoRemove ?? false;

    // Build member query from conditions
    const memberWhere = this.buildMemberWhereFromConditions(conditions, conditionLogic);
    const projectFilter: Prisma.MemberWhereInput = rule.projectId
      ? { projectId: rule.projectId }
      : {};

    // Find all members matching conditions
    const matchingMembers = await this.prisma.member.findMany({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        ...projectFilter,
        ...memberWhere,
      },
      select: { id: true },
    });

    const matchingMemberIds = new Set(matchingMembers.map((m) => m.id));

    // Find members who currently have this tag
    const currentlyTagged = await this.prisma.memberMemberLabel.findMany({
      where: { labelId: rule.tagId },
      select: { id: true, memberId: true },
    });
    const currentlyTaggedMap = new Map(
      currentlyTagged.map((ct) => [ct.memberId, ct.id]),
    );

    let tagged = 0;
    let untagged = 0;

    // Apply tags to matching members who do not already have it
    const toTag = matchingMembers.filter((m) => !currentlyTaggedMap.has(m.id));
    if (toTag.length > 0) {
      await this.prisma.memberMemberLabel.createMany({
        data: toTag.map((m) => ({
          memberId: m.id,
          labelId: rule.tagId,
          assignedBy: null,
        })),
        skipDuplicates: true,
      });
      tagged = toTag.length;
    }

    // Remove tags from members who no longer match (if autoRemove)
    if (autoRemove) {
      const toUntag = currentlyTagged.filter(
        (ct) => !matchingMemberIds.has(ct.memberId),
      );
      if (toUntag.length > 0) {
        await this.prisma.memberMemberLabel.deleteMany({
          where: { id: { in: toUntag.map((t) => t.id) } },
        });
        untagged = toUntag.length;
      }
    }

    // Update rule execution stats
    await this.prisma.autoTagRule.update({
      where: { id },
      data: {
        lastExecutedAt: new Date(),
        executionCount: { increment: 1 },
      },
    });

    const result = {
      membersProcessed: matchingMembers.length + (autoRemove ? currentlyTagged.length : 0),
      tagged,
      untagged,
    };
    this.logger.log(
      `Executed auto-tag rule ${id}: processed=${result.membersProcessed}, tagged=${tagged}, untagged=${untagged}`,
    );
    return result;
  }

  // ==========================================
  // Marketing Triggers
  // ==========================================

  async listTriggers(query: any) {
    const page = Number(query.page) || 1;
    const pageSize = Math.min(Number(query.pageSize) || 20, 100);
    const skip = (page - 1) * pageSize;

    const where: Prisma.MarketingTriggerWhereInput = {
      deletedAt: null,
    };

    if (query.projectId) {
      where.projectId = query.projectId;
    }
    if (query.type) {
      where.eventType = query.type;
    }
    if (query.status === 'active') {
      where.isActive = true;
    } else if (query.status === 'inactive') {
      where.isActive = false;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.marketingTrigger.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.marketingTrigger.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  async getTrigger(id: string) {
    const trigger = await this.prisma.marketingTrigger.findFirst({
      where: { id, deletedAt: null },
    });

    if (!trigger) {
      throw new NotFoundException(`Marketing trigger not found: ${id}`);
    }

    return trigger;
  }

  async createTrigger(data: any) {
    if (!data.groupId) {
      throw new BadRequestException('groupId is required');
    }

    const code = data.code || this.generateCode(8, 'TRG');

    // Check code uniqueness
    const existing = await this.prisma.marketingTrigger.findUnique({
      where: { groupId_code: { groupId: data.groupId, code } },
    });
    if (existing) {
      throw new ConflictException(`Trigger code already exists: ${code}`);
    }

    const trigger = await this.prisma.marketingTrigger.create({
      data: {
        groupId: data.groupId,
        projectId: data.projectId || null,
        code,
        name: data.name || {},
        eventType: data.eventType || data.type || 'custom_event',
        conditions: data.conditions || {},
        actions: data.actions || [],
        isActive: data.isActive ?? false,
        cooldownMinutes: data.cooldownMinutes ?? 0,
        maxTriggersPerMember: data.maxTriggersPerMember || null,
        audienceFilter: data.audienceFilter || {},
        schedule: data.schedule || data.scheduleConfig || {},
        abTestConfig: data.abTestConfig || data.abTest || {},
        metadata: {
          triggerType: data.triggerType || 'event',
          description: data.description || {},
          validDateRange: data.validDateRange || null,
          ...(data.metadata || {}),
        },
      },
    });

    this.logger.log(`Created marketing trigger: ${trigger.id} (code: ${code})`);
    return trigger;
  }

  async updateTrigger(id: string, data: any) {
    const existing = await this.prisma.marketingTrigger.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      throw new NotFoundException(`Marketing trigger not found: ${id}`);
    }

    const updateData: Prisma.MarketingTriggerUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.eventType !== undefined) updateData.eventType = data.eventType;
    if (data.conditions !== undefined) updateData.conditions = data.conditions;
    if (data.actions !== undefined) updateData.actions = data.actions;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.cooldownMinutes !== undefined) updateData.cooldownMinutes = data.cooldownMinutes;
    if (data.maxTriggersPerMember !== undefined) updateData.maxTriggersPerMember = data.maxTriggersPerMember;
    if (data.audienceFilter !== undefined) updateData.audienceFilter = data.audienceFilter;
    if (data.schedule !== undefined) updateData.schedule = data.schedule;
    if (data.abTestConfig !== undefined) updateData.abTestConfig = data.abTestConfig;

    // Merge metadata
    if (data.metadata !== undefined) {
      updateData.metadata = data.metadata;
    } else {
      const currentMeta = (existing.metadata as Record<string, any>) || {};
      const newMeta = { ...currentMeta };
      if (data.triggerType !== undefined) newMeta.triggerType = data.triggerType;
      if (data.description !== undefined) newMeta.description = data.description;
      if (data.validDateRange !== undefined) newMeta.validDateRange = data.validDateRange;
      updateData.metadata = newMeta;
    }

    const updated = await this.prisma.marketingTrigger.update({
      where: { id },
      data: updateData,
    });

    this.logger.log(`Updated marketing trigger: ${id}`);
    return updated;
  }

  async deleteTrigger(id: string) {
    const existing = await this.prisma.marketingTrigger.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      throw new NotFoundException(`Marketing trigger not found: ${id}`);
    }

    await this.prisma.marketingTrigger.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    this.logger.log(`Soft-deleted marketing trigger: ${id}`);
    return { success: true };
  }

  async activateTrigger(id: string) {
    const trigger = await this.prisma.marketingTrigger.findFirst({
      where: { id, deletedAt: null },
    });
    if (!trigger) {
      throw new NotFoundException(`Marketing trigger not found: ${id}`);
    }

    if (trigger.isActive) {
      throw new BadRequestException('Trigger is already active');
    }

    const updated = await this.prisma.marketingTrigger.update({
      where: { id },
      data: { isActive: true },
    });

    this.logger.log(`Activated trigger: ${id}`);
    return updated;
  }

  async deactivateTrigger(id: string) {
    const trigger = await this.prisma.marketingTrigger.findFirst({
      where: { id, deletedAt: null },
    });
    if (!trigger) {
      throw new NotFoundException(`Marketing trigger not found: ${id}`);
    }

    if (!trigger.isActive) {
      throw new BadRequestException('Trigger is already inactive');
    }

    const updated = await this.prisma.marketingTrigger.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log(`Deactivated trigger: ${id}`);
    return updated;
  }

  async getTriggerStats(id: string) {
    const trigger = await this.prisma.marketingTrigger.findFirst({
      where: { id, deletedAt: null },
    });
    if (!trigger) {
      throw new NotFoundException(`Marketing trigger not found: ${id}`);
    }

    const actions = (trigger.actions as any[]) || [];
    const abTestConfig = (trigger.abTestConfig as Record<string, any>) || {};

    // Build action stats from metadata
    const meta = (trigger.metadata as Record<string, any>) || {};
    const actionStats = actions.map((action: any) => ({
      actionType: action.type,
      sent: meta.actionStats?.[action.id]?.sent || 0,
      delivered: meta.actionStats?.[action.id]?.delivered || 0,
      opened: meta.actionStats?.[action.id]?.opened || 0,
      clicked: meta.actionStats?.[action.id]?.clicked || 0,
      converted: meta.actionStats?.[action.id]?.converted || 0,
    }));

    // Build A/B test results
    const abTestResults = (abTestConfig.variants || []).map((variant: any) => ({
      variantId: variant.id,
      variantName: variant.name,
      sent: meta.abTestResults?.[variant.id]?.sent || 0,
      openRate: meta.abTestResults?.[variant.id]?.openRate || 0,
      clickRate: meta.abTestResults?.[variant.id]?.clickRate || 0,
      conversionRate: meta.abTestResults?.[variant.id]?.conversionRate || 0,
    }));

    return {
      totalTriggered: trigger.executionCount,
      totalActioned: trigger.executionCount, // Approximation; detailed tracking would use a separate table
      lastTriggeredAt: trigger.lastTriggeredAt,
      actionStats,
      abTestResults,
    };
  }

  // ==========================================
  // Member Segments
  // ==========================================

  async listSegments(query: any) {
    const page = Number(query.page) || 1;
    const pageSize = Math.min(Number(query.pageSize) || 20, 100);
    const skip = (page - 1) * pageSize;

    const where: Prisma.MemberSegmentWhereInput = {
      deletedAt: null,
    };

    if (query.projectId) {
      where.projectId = query.projectId;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.memberSegment.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.memberSegment.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  async getSegment(id: string) {
    const segment = await this.prisma.memberSegment.findFirst({
      where: { id, deletedAt: null },
    });

    if (!segment) {
      throw new NotFoundException(`Segment not found: ${id}`);
    }

    return segment;
  }

  async createSegment(data: any) {
    if (!data.groupId) {
      throw new BadRequestException('groupId is required');
    }

    const code = data.code || this.generateCode(8, 'SEG');

    const existing = await this.prisma.memberSegment.findUnique({
      where: { groupId_code: { groupId: data.groupId, code } },
    });
    if (existing) {
      throw new ConflictException(`Segment code already exists: ${code}`);
    }

    // Compute initial member count from rules
    let memberCount = 0;
    if (data.rules && Array.isArray(data.rules) && data.rules.length > 0) {
      const ruleLogic: 'and' | 'or' = data.ruleLogic || 'and';
      const memberWhere = this.buildMemberWhereFromConditions(data.rules, ruleLogic);
      const projectFilter: Prisma.MemberWhereInput = data.projectId
        ? { projectId: data.projectId }
        : {};
      memberCount = await this.prisma.member.count({
        where: {
          deletedAt: null,
          status: 'ACTIVE',
          ...projectFilter,
          ...memberWhere,
        },
      });
    }

    const segment = await this.prisma.memberSegment.create({
      data: {
        groupId: data.groupId,
        projectId: data.projectId || null,
        code,
        name: data.name || {},
        description: data.description || {},
        rules: data.rules || [],
        memberCount,
        isActive: data.isActive ?? true,
        refreshedAt: new Date(),
        metadata: {
          ruleLogic: data.ruleLogic || 'and',
          isDynamic: data.isDynamic ?? true,
          ...(data.metadata || {}),
        },
      },
    });

    this.logger.log(`Created segment: ${segment.id} (code: ${code}, memberCount: ${memberCount})`);
    return segment;
  }

  async updateSegment(id: string, data: any) {
    const existing = await this.prisma.memberSegment.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      throw new NotFoundException(`Segment not found: ${id}`);
    }

    const updateData: Prisma.MemberSegmentUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.rules !== undefined) updateData.rules = data.rules;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    // Merge metadata
    if (data.metadata !== undefined) {
      updateData.metadata = data.metadata;
    } else {
      const currentMeta = (existing.metadata as Record<string, any>) || {};
      const newMeta = { ...currentMeta };
      if (data.ruleLogic !== undefined) newMeta.ruleLogic = data.ruleLogic;
      if (data.isDynamic !== undefined) newMeta.isDynamic = data.isDynamic;
      updateData.metadata = newMeta;
    }

    // If rules changed, recompute member count
    if (data.rules !== undefined) {
      const meta = (updateData.metadata as Record<string, any>) || {};
      const ruleLogic: 'and' | 'or' = meta.ruleLogic || 'and';
      const memberWhere = this.buildMemberWhereFromConditions(data.rules, ruleLogic);
      const projectFilter: Prisma.MemberWhereInput = existing.projectId
        ? { projectId: existing.projectId }
        : {};

      const memberCount = await this.prisma.member.count({
        where: {
          deletedAt: null,
          status: 'ACTIVE',
          ...projectFilter,
          ...memberWhere,
        },
      });
      updateData.memberCount = memberCount;
      updateData.refreshedAt = new Date();
    }

    const updated = await this.prisma.memberSegment.update({
      where: { id },
      data: updateData,
    });

    this.logger.log(`Updated segment: ${id}`);
    return updated;
  }

  async deleteSegment(id: string) {
    const existing = await this.prisma.memberSegment.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      throw new NotFoundException(`Segment not found: ${id}`);
    }

    await this.prisma.memberSegment.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    this.logger.log(`Soft-deleted segment: ${id}`);
    return { success: true };
  }

  async refreshSegment(id: string) {
    const segment = await this.prisma.memberSegment.findFirst({
      where: { id, deletedAt: null },
    });
    if (!segment) {
      throw new NotFoundException(`Segment not found: ${id}`);
    }

    const rules = (segment.rules as any[]) || [];
    const meta = (segment.metadata as Record<string, any>) || {};
    const ruleLogic: 'and' | 'or' = meta.ruleLogic || 'and';

    const memberWhere = this.buildMemberWhereFromConditions(rules, ruleLogic);
    const projectFilter: Prisma.MemberWhereInput = segment.projectId
      ? { projectId: segment.projectId }
      : {};

    const memberCount = await this.prisma.member.count({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        ...projectFilter,
        ...memberWhere,
      },
    });

    const refreshedAt = new Date();
    await this.prisma.memberSegment.update({
      where: { id },
      data: { memberCount, refreshedAt },
    });

    this.logger.log(`Refreshed segment ${id}: memberCount=${memberCount}`);
    return { memberCount, refreshedAt };
  }

  async listSegmentMembers(id: string, query: any) {
    const page = Number(query.page) || 1;
    const pageSize = Math.min(Number(query.pageSize) || 20, 100);
    const skip = (page - 1) * pageSize;

    const segment = await this.prisma.memberSegment.findFirst({
      where: { id, deletedAt: null },
    });
    if (!segment) {
      throw new NotFoundException(`Segment not found: ${id}`);
    }

    const rules = (segment.rules as any[]) || [];
    const meta = (segment.metadata as Record<string, any>) || {};
    const ruleLogic: 'and' | 'or' = meta.ruleLogic || 'and';

    const memberWhere = this.buildMemberWhereFromConditions(rules, ruleLogic);
    const projectFilter: Prisma.MemberWhereInput = segment.projectId
      ? { projectId: segment.projectId }
      : {};

    const combinedWhere: Prisma.MemberWhereInput = {
      deletedAt: null,
      status: 'ACTIVE',
      ...projectFilter,
      ...memberWhere,
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.member.findMany({
        where: combinedWhere,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          memberNo: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          gender: true,
          tierId: true,
          status: true,
          registeredAt: true,
        },
      }),
      this.prisma.member.count({ where: combinedWhere }),
    ]);

    return { data, total, page, pageSize };
  }

  // ==========================================
  // Member Journeys
  // ==========================================

  async listJourneys(query: any) {
    const page = Number(query.page) || 1;
    const pageSize = Math.min(Number(query.pageSize) || 20, 100);
    const skip = (page - 1) * pageSize;

    const where: Prisma.MemberJourneyWhereInput = {
      deletedAt: null,
    };

    if (query.projectId) {
      where.projectId = query.projectId;
    }
    if (query.status) {
      where.status = query.status as JourneyStatus;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.memberJourney.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.memberJourney.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  async getJourney(id: string) {
    const journey = await this.prisma.memberJourney.findFirst({
      where: { id, deletedAt: null },
    });

    if (!journey) {
      throw new NotFoundException(`Journey not found: ${id}`);
    }

    return journey;
  }

  async createJourney(data: any) {
    if (!data.groupId) {
      throw new BadRequestException('groupId is required');
    }

    const code = data.code || this.generateCode(8, 'JRN');

    const existing = await this.prisma.memberJourney.findUnique({
      where: { groupId_code: { groupId: data.groupId, code } },
    });
    if (existing) {
      throw new ConflictException(`Journey code already exists: ${code}`);
    }

    const journey = await this.prisma.memberJourney.create({
      data: {
        groupId: data.groupId,
        projectId: data.projectId || null,
        code,
        name: data.name || {},
        description: data.description || {},
        status: JourneyStatus.DRAFT,
        triggerConditions: data.triggerConditions || data.entryTrigger || {},
        steps: data.steps || [],
        metadata: {
          exitConditions: data.exitConditions || [],
          maxConcurrentMembers: data.maxConcurrentMembers || null,
          validDateRange: data.validDateRange || null,
          ...(data.metadata || {}),
        },
      },
    });

    this.logger.log(`Created journey: ${journey.id} (code: ${code})`);
    return journey;
  }

  async updateJourney(id: string, data: any) {
    const existing = await this.prisma.memberJourney.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      throw new NotFoundException(`Journey not found: ${id}`);
    }

    // Only allow updates when DRAFT or PAUSED
    if (
      existing.status !== JourneyStatus.DRAFT &&
      existing.status !== JourneyStatus.PAUSED
    ) {
      throw new BadRequestException(
        `Journey can only be updated when in DRAFT or PAUSED status (current: ${existing.status})`,
      );
    }

    const updateData: Prisma.MemberJourneyUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.triggerConditions !== undefined) updateData.triggerConditions = data.triggerConditions;
    if (data.steps !== undefined) updateData.steps = data.steps;

    // Merge metadata
    if (data.metadata !== undefined) {
      updateData.metadata = data.metadata;
    } else {
      const currentMeta = (existing.metadata as Record<string, any>) || {};
      const newMeta = { ...currentMeta };
      if (data.exitConditions !== undefined) newMeta.exitConditions = data.exitConditions;
      if (data.maxConcurrentMembers !== undefined) newMeta.maxConcurrentMembers = data.maxConcurrentMembers;
      if (data.validDateRange !== undefined) newMeta.validDateRange = data.validDateRange;
      updateData.metadata = newMeta;
    }

    const updated = await this.prisma.memberJourney.update({
      where: { id },
      data: updateData,
    });

    this.logger.log(`Updated journey: ${id}`);
    return updated;
  }

  async deleteJourney(id: string) {
    const existing = await this.prisma.memberJourney.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      throw new NotFoundException(`Journey not found: ${id}`);
    }

    await this.prisma.memberJourney.update({
      where: { id },
      data: { deletedAt: new Date(), status: JourneyStatus.ARCHIVED },
    });

    this.logger.log(`Soft-deleted journey: ${id}`);
    return { success: true };
  }

  async activateJourney(id: string) {
    const journey = await this.prisma.memberJourney.findFirst({
      where: { id, deletedAt: null },
    });
    if (!journey) {
      throw new NotFoundException(`Journey not found: ${id}`);
    }

    if (
      journey.status !== JourneyStatus.DRAFT &&
      journey.status !== JourneyStatus.PAUSED
    ) {
      throw new BadRequestException(
        `Journey can only be activated from DRAFT or PAUSED status (current: ${journey.status})`,
      );
    }

    const updated = await this.prisma.memberJourney.update({
      where: { id },
      data: { status: JourneyStatus.ACTIVE },
    });

    this.logger.log(`Activated journey: ${id}`);
    return updated;
  }

  async pauseJourney(id: string) {
    const journey = await this.prisma.memberJourney.findFirst({
      where: { id, deletedAt: null },
    });
    if (!journey) {
      throw new NotFoundException(`Journey not found: ${id}`);
    }

    if (journey.status !== JourneyStatus.ACTIVE) {
      throw new BadRequestException(
        `Journey can only be paused from ACTIVE status (current: ${journey.status})`,
      );
    }

    const updated = await this.prisma.memberJourney.update({
      where: { id },
      data: { status: JourneyStatus.PAUSED },
    });

    this.logger.log(`Paused journey: ${id}`);
    return updated;
  }

  // ==========================================
  // Event Processing
  // ==========================================

  async processEvent(event: { eventType: string; memberId: string; data: any }) {
    this.logger.log(
      `Processing event: ${event.eventType} for member: ${event.memberId}`,
    );

    let triggersMatched = 0;
    let actionsExecuted = 0;

    // 1. Find all active triggers matching this event type
    const matchingTriggers = await this.prisma.marketingTrigger.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        eventType: event.eventType,
      },
    });

    for (const trigger of matchingTriggers) {
      try {
        // 2. Evaluate conditions
        const conditions = trigger.conditions as Record<string, any>;
        const conditionsList = Array.isArray(conditions)
          ? conditions
          : conditions?.eventConditions || [];

        if (conditionsList.length > 0) {
          const conditionsMet = this.evaluateEventConditions(
            conditionsList,
            event.data,
          );
          if (!conditionsMet) continue;
        }

        // 3. Check audience filter
        const audienceFilter = trigger.audienceFilter as Record<string, any>;
        if (audienceFilter && Object.keys(audienceFilter).length > 0) {
          const inAudience = await this.checkMemberAudience(
            event.memberId,
            audienceFilter,
          );
          if (!inAudience) continue;
        }

        // 4. Check cooldown
        if (trigger.cooldownMinutes > 0 && trigger.lastTriggeredAt) {
          const cooldownEnd = new Date(trigger.lastTriggeredAt);
          cooldownEnd.setMinutes(
            cooldownEnd.getMinutes() + trigger.cooldownMinutes,
          );
          if (new Date() < cooldownEnd) continue;
        }

        // 5. Check max triggers per member (stored in metadata)
        if (trigger.maxTriggersPerMember) {
          const meta = (trigger.metadata as Record<string, any>) || {};
          const memberExecutions = meta.memberExecutions || {};
          const count = memberExecutions[event.memberId] || 0;
          if (count >= trigger.maxTriggersPerMember) continue;
        }

        triggersMatched++;

        // 6. Handle A/B test variant selection
        const abTestConfig = trigger.abTestConfig as Record<string, any>;
        let selectedActions = (trigger.actions as any[]) || [];

        if (abTestConfig?.variants?.length > 0) {
          const variant = this.selectABVariant(
            abTestConfig.variants,
            event.memberId,
          );
          if (variant?.actionOverrides) {
            selectedActions = variant.actionOverrides;
          }
        }

        // 7. Execute actions
        for (const action of selectedActions) {
          if (action.delayMinutes && action.delayMinutes > 0) {
            // For delayed actions, log the intent (a job queue would handle actual execution)
            this.logger.log(
              `Scheduling delayed action: ${action.type} for member: ${event.memberId} in ${action.delayMinutes}min`,
            );
          } else {
            this.logger.log(
              `Executing action: ${action.type} for member: ${event.memberId}`,
            );
          }
          actionsExecuted++;
        }

        // 8. Update trigger execution stats
        const currentMeta = (trigger.metadata as Record<string, any>) || {};
        const memberExecutions = currentMeta.memberExecutions || {};
        memberExecutions[event.memberId] =
          (memberExecutions[event.memberId] || 0) + 1;

        await this.prisma.marketingTrigger.update({
          where: { id: trigger.id },
          data: {
            executionCount: { increment: 1 },
            lastTriggeredAt: new Date(),
            metadata: {
              ...currentMeta,
              memberExecutions,
            },
          },
        });

        // 9. Check if member should enter any active journey
        await this.checkJourneyEntry(event);
      } catch (error) {
        this.logger.error(
          `Failed to process trigger ${trigger.id}: ${error}`,
        );
      }
    }

    return { processed: true, triggersMatched, actionsExecuted };
  }

  /**
   * Evaluate event conditions against event data.
   */
  private evaluateEventConditions(
    conditions: any[],
    eventData: Record<string, any>,
  ): boolean {
    for (const condition of conditions) {
      const { field, operator, value } = condition;
      const actual = eventData?.[field];

      switch (operator) {
        case 'equals':
          if (actual !== value) return false;
          break;
        case 'not_equals':
          if (actual === value) return false;
          break;
        case 'greater_than':
          if (!(actual > value)) return false;
          break;
        case 'less_than':
          if (!(actual < value)) return false;
          break;
        case 'greater_equal':
          if (!(actual >= value)) return false;
          break;
        case 'less_equal':
          if (!(actual <= value)) return false;
          break;
        case 'in':
          if (!Array.isArray(value) || !value.includes(actual)) return false;
          break;
        case 'not_in':
          if (Array.isArray(value) && value.includes(actual)) return false;
          break;
        case 'contains':
          if (typeof actual !== 'string' || !actual.includes(value)) return false;
          break;
        case 'is_null':
          if (actual != null) return false;
          break;
        case 'is_not_null':
          if (actual == null) return false;
          break;
        default:
          // Unknown operator, skip condition
          break;
      }
    }
    return true;
  }

  /**
   * Check if a member matches the audience filter.
   */
  private async checkMemberAudience(
    memberId: string,
    audienceFilter: Record<string, any>,
  ): Promise<boolean> {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      include: {
        memberLabels: { select: { labelId: true } },
      },
    });

    if (!member) return false;

    // Check tier filter
    if (audienceFilter.tierIds?.length > 0) {
      if (!member.tierId || !audienceFilter.tierIds.includes(member.tierId)) {
        return false;
      }
    }

    // Check tag filter
    if (audienceFilter.tagIds?.length > 0) {
      const memberTagIds = member.memberLabels.map((ml) => ml.labelId);
      const hasRequiredTag = audienceFilter.tagIds.some((tagId: string) =>
        memberTagIds.includes(tagId),
      );
      if (!hasRequiredTag) return false;
    }

    return true;
  }

  /**
   * Deterministic A/B variant selection based on member ID hash.
   */
  private selectABVariant(variants: any[], memberId: string): any {
    if (!variants || variants.length === 0) return null;

    // Simple hash-based selection
    let hash = 0;
    for (let i = 0; i < memberId.length; i++) {
      const char = memberId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    const bucket = Math.abs(hash) % 100;

    let cumulative = 0;
    for (const variant of variants) {
      cumulative += variant.trafficPercent || 0;
      if (bucket < cumulative) {
        return variant;
      }
    }

    return variants[variants.length - 1];
  }

  /**
   * Check if the event should cause a member to enter an active journey.
   */
  private async checkJourneyEntry(event: {
    eventType: string;
    memberId: string;
    data: any;
  }) {
    const activeJourneys = await this.prisma.memberJourney.findMany({
      where: {
        deletedAt: null,
        status: JourneyStatus.ACTIVE,
      },
    });

    for (const journey of activeJourneys) {
      const triggerConditions = journey.triggerConditions as Record<string, any>;

      // Check if this journey's entry trigger matches the event
      if (triggerConditions?.type === event.eventType) {
        // Check additional conditions if present
        if (triggerConditions.conditions?.length > 0) {
          const met = this.evaluateEventConditions(
            triggerConditions.conditions,
            event.data,
          );
          if (!met) continue;
        }

        // Check max concurrent members
        const meta = (journey.metadata as Record<string, any>) || {};
        if (
          meta.maxConcurrentMembers &&
          journey.entryCount - journey.completionCount >= meta.maxConcurrentMembers
        ) {
          continue;
        }

        // Member enters journey - increment entry count
        await this.prisma.memberJourney.update({
          where: { id: journey.id },
          data: { entryCount: { increment: 1 } },
        });

        this.logger.log(
          `Member ${event.memberId} entered journey ${journey.id}`,
        );
      }
    }
  }
}
