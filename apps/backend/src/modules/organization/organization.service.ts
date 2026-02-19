import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';

/**
 * Organization service.
 * Manages groups, projects, organizational units, and architecture configuration
 * for the Link REIT multi-project membership system hierarchy.
 */
@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Group Management ──────────────────────────────────────────────────────

  /**
   * List all groups with optional filters.
   */
  async listGroups(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
  }) {
    const { page = 1, pageSize = 20, search, status } = params;
    const where: Prisma.GroupWhereInput = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { path: ['en'], string_contains: search } },
        { name: { path: ['zh-TW'], string_contains: search } },
        { name: { path: ['zh-CN'], string_contains: search } },
      ];
    }

    if (status) {
      where.isActive = status === 'active';
    }

    const [items, total] = await Promise.all([
      this.prisma.group.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              projects: true,
              organizationUnits: true,
            },
          },
        },
      }),
      this.prisma.group.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  /**
   * Get group by ID.
   */
  async getGroupById(id: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        projects: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
        organizationUnits: {
          where: { deletedAt: null },
          orderBy: { sortOrder: 'asc' },
        },
        memberTiers: {
          where: { deletedAt: null },
          orderBy: { level: 'asc' },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Group ${id} not found.`);
    }

    return group;
  }

  /**
   * Create a new group.
   */
  async createGroup(data: {
    code: string;
    nameZhHk: string;
    nameZhCn?: string;
    nameEn?: string;
    description?: string;
  }) {
    const existing = await this.prisma.group.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new ConflictException(`Group code "${data.code}" already exists.`);
    }

    const name: Record<string, string> = {
      'zh-TW': data.nameZhHk,
    };
    if (data.nameZhCn) name['zh-CN'] = data.nameZhCn;
    if (data.nameEn) name['en'] = data.nameEn;

    const description = data.description
      ? { 'zh-TW': data.description }
      : undefined;

    const group = await this.prisma.group.create({
      data: {
        code: data.code,
        name,
        description: description ?? Prisma.JsonNull,
        isActive: true,
      },
    });

    this.logger.log(`Group created: ${data.code} (${group.id})`);
    return group;
  }

  /**
   * Update an existing group.
   */
  async updateGroup(id: string, data: Record<string, any>) {
    const existing = await this.prisma.group.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Group ${id} not found.`);
    }

    // Build update payload, handling multi-language name fields
    const updateData: Prisma.GroupUpdateInput = {};

    // If individual name fields are provided, merge them into the JSON name field
    if (data.nameZhHk || data.nameZhCn || data.nameEn) {
      const currentName =
        (existing.name as Record<string, string>) ?? {};
      const newName = { ...currentName };
      if (data.nameZhHk) newName['zh-TW'] = data.nameZhHk;
      if (data.nameZhCn) newName['zh-CN'] = data.nameZhCn;
      if (data.nameEn) newName['en'] = data.nameEn;
      updateData.name = newName;
    }

    // If a full name JSON object is provided directly, use it
    if (data.name && typeof data.name === 'object') {
      updateData.name = data.name;
    }

    if (data.description !== undefined) {
      if (typeof data.description === 'string') {
        updateData.description = { 'zh-TW': data.description };
      } else {
        updateData.description = data.description;
      }
    }

    if (data.logo !== undefined) updateData.logo = data.logo;
    if (data.settings !== undefined) updateData.settings = data.settings;
    if (data.stampModeConfig !== undefined)
      updateData.stampModeConfig = data.stampModeConfig;
    if (data.contactEmail !== undefined)
      updateData.contactEmail = data.contactEmail;
    if (data.contactPhone !== undefined)
      updateData.contactPhone = data.contactPhone;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const group = await this.prisma.group.update({
      where: { id },
      data: updateData,
    });

    this.logger.log(`Group updated: ${id}`);
    return group;
  }

  /**
   * Delete (soft-delete) a group.
   */
  async deleteGroup(id: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        projects: {
          where: {
            isActive: true,
            deletedAt: null,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Group ${id} not found.`);
    }

    if (group.projects.length > 0) {
      throw new ConflictException(
        `Cannot delete group with ${group.projects.length} active project(s). Please deactivate or delete all projects first.`,
      );
    }

    await this.prisma.group.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    this.logger.log(`Group soft-deleted: ${id}`);
    return { message: 'Group deleted successfully' };
  }

  // ─── Project Management ─────────────────────────────────────────────────────

  /**
   * List projects with optional filters.
   */
  async listProjects(params: {
    groupId?: string;
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    region?: string;
  }) {
    const { page = 1, pageSize = 20, search, status, groupId, region } = params;
    const where: Prisma.ProjectWhereInput = {
      deletedAt: null,
    };

    if (groupId) {
      where.groupId = groupId;
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { path: ['en'], string_contains: search } },
        { name: { path: ['zh-TW'], string_contains: search } },
        { name: { path: ['zh-CN'], string_contains: search } },
      ];
    }

    if (status) {
      where.isActive = status === 'active';
    }

    if (region) {
      where.region = region;
    }

    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          group: {
            select: { id: true, code: true, name: true },
          },
          _count: {
            select: {
              merchants: true,
              members: true,
            },
          },
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  /**
   * Get project by ID.
   */
  async getProjectById(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        group: {
          select: { id: true, code: true, name: true },
        },
        merchants: {
          where: { deletedAt: null },
          orderBy: { sortOrder: 'asc' },
          take: 50,
        },
        _count: {
          select: {
            merchants: true,
            members: true,
            campaigns: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project ${id} not found.`);
    }

    return project;
  }

  /**
   * Create a new project under a group.
   */
  async createProject(data: {
    groupId: string;
    code: string;
    nameZhHk: string;
    nameZhCn?: string;
    nameEn?: string;
    description?: string;
    region?: string;
  }) {
    // Verify the group exists
    const group = await this.prisma.group.findUnique({
      where: { id: data.groupId },
    });

    if (!group) {
      throw new NotFoundException(`Group ${data.groupId} not found.`);
    }

    // Check for duplicate code within the group
    const existing = await this.prisma.project.findUnique({
      where: {
        groupId_code: {
          groupId: data.groupId,
          code: data.code,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Project code "${data.code}" already exists in group ${data.groupId}.`,
      );
    }

    const name: Record<string, string> = {
      'zh-TW': data.nameZhHk,
    };
    if (data.nameZhCn) name['zh-CN'] = data.nameZhCn;
    if (data.nameEn) name['en'] = data.nameEn;

    const description = data.description
      ? { 'zh-TW': data.description }
      : undefined;

    const project = await this.prisma.project.create({
      data: {
        groupId: data.groupId,
        code: data.code,
        name,
        description: description ?? Prisma.JsonNull,
        region: data.region,
        isActive: true,
      },
    });

    this.logger.log(
      `Project created: ${data.code} (${project.id}) under group ${data.groupId}`,
    );
    return project;
  }

  // ─── Org Unit Management ───────────────────────────────────────────────────

  /**
   * List organizational units for a group/project with hierarchy support.
   */
  async listOrgUnits(params: {
    groupId?: string;
    projectId?: string;
    parentId?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { page = 1, pageSize = 50, groupId, parentId } = params;
    const where: Prisma.OrganizationUnitWhereInput = {
      deletedAt: null,
    };

    if (groupId) where.groupId = groupId;

    // When parentId is explicitly provided, filter by it.
    // When parentId is not provided and no specific filter is set,
    // return root-level units (parentId is null) for tree-building.
    if (parentId !== undefined) {
      where.parentId = parentId || null;
    }

    const [items, total] = await Promise.all([
      this.prisma.organizationUnit.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        include: {
          children: {
            where: { deletedAt: null },
            orderBy: { sortOrder: 'asc' },
          },
          parent: {
            select: { id: true, code: true, name: true },
          },
          group: {
            select: { id: true, code: true, name: true },
          },
        },
      }),
      this.prisma.organizationUnit.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  /**
   * Create organizational unit.
   */
  async createOrgUnit(data: {
    groupId: string;
    projectId?: string;
    parentId?: string;
    nameZhHk: string;
    nameZhCn?: string;
    nameEn?: string;
    type: string;
  }) {
    // Verify the group exists
    const group = await this.prisma.group.findUnique({
      where: { id: data.groupId },
    });

    if (!group) {
      throw new NotFoundException(`Group ${data.groupId} not found.`);
    }

    // If a parentId is provided, validate it exists and belongs to the same group
    let parentLevel = -1;
    if (data.parentId) {
      const parent = await this.prisma.organizationUnit.findUnique({
        where: { id: data.parentId },
      });

      if (!parent) {
        throw new NotFoundException(
          `Parent org unit ${data.parentId} not found.`,
        );
      }

      if (parent.groupId !== data.groupId) {
        throw new BadRequestException(
          'Parent org unit does not belong to the same group.',
        );
      }

      parentLevel = parent.level;
    }

    const name: Record<string, string> = {
      'zh-TW': data.nameZhHk,
    };
    if (data.nameZhCn) name['zh-CN'] = data.nameZhCn;
    if (data.nameEn) name['en'] = data.nameEn;

    // Generate a code from the type and a timestamp suffix
    const code = `${data.type.toUpperCase()}-${Date.now().toString(36)}`;

    // Determine the next sort order for siblings
    const siblingCount = await this.prisma.organizationUnit.count({
      where: {
        groupId: data.groupId,
        parentId: data.parentId ?? null,
        deletedAt: null,
      },
    });

    const orgUnit = await this.prisma.organizationUnit.create({
      data: {
        groupId: data.groupId,
        parentId: data.parentId ?? null,
        code,
        name,
        level: parentLevel + 1,
        sortOrder: siblingCount,
        isActive: true,
        metadata: { type: data.type },
      },
      include: {
        parent: {
          select: { id: true, code: true, name: true },
        },
        group: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    this.logger.log(
      `Org unit created: ${orgUnit.code} (${orgUnit.id}) under group ${data.groupId}`,
    );
    return orgUnit;
  }

  /**
   * Update organizational unit.
   */
  async updateOrgUnit(id: string, data: Record<string, any>) {
    const existing = await this.prisma.organizationUnit.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Organization unit ${id} not found.`);
    }

    const updateData: Prisma.OrganizationUnitUpdateInput = {};

    // Handle multi-language name fields
    if (data.nameZhHk || data.nameZhCn || data.nameEn) {
      const currentName =
        (existing.name as Record<string, string>) ?? {};
      const newName = { ...currentName };
      if (data.nameZhHk) newName['zh-TW'] = data.nameZhHk;
      if (data.nameZhCn) newName['zh-CN'] = data.nameZhCn;
      if (data.nameEn) newName['en'] = data.nameEn;
      updateData.name = newName;
    }

    if (data.name && typeof data.name === 'object') {
      updateData.name = data.name;
    }

    if (data.code !== undefined) updateData.code = data.code;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.metadata !== undefined) updateData.metadata = data.metadata;

    const orgUnit = await this.prisma.organizationUnit.update({
      where: { id },
      data: updateData,
      include: {
        parent: {
          select: { id: true, code: true, name: true },
        },
        children: {
          where: { deletedAt: null },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    this.logger.log(`Org unit updated: ${id}`);
    return orgUnit;
  }

  /**
   * Delete organizational unit (soft-delete).
   */
  async deleteOrgUnit(id: string) {
    const orgUnit = await this.prisma.organizationUnit.findUnique({
      where: { id },
      include: {
        children: {
          where: {
            deletedAt: null,
          },
        },
      },
    });

    if (!orgUnit) {
      throw new NotFoundException(`Organization unit ${id} not found.`);
    }

    if (orgUnit.children.length > 0) {
      throw new ConflictException(
        `Cannot delete org unit with ${orgUnit.children.length} active child unit(s). Please delete or move children first.`,
      );
    }

    await this.prisma.organizationUnit.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    this.logger.log(`Org unit soft-deleted: ${id}`);
    return { message: 'Org unit deleted successfully' };
  }

  // ─── Architecture Configuration ────────────────────────────────────────────

  /**
   * Get the architecture configuration for a group.
   * Includes hierarchy levels, tier definitions, stamp rules, org unit tree, etc.
   */
  async getArchitectureConfig(groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        code: true,
        name: true,
        settings: true,
        stampModeConfig: true,
      },
    });

    if (!group) {
      throw new NotFoundException(`Group ${groupId} not found.`);
    }

    // Fetch tiers, root-level org units, and projects in parallel
    const [memberTiers, orgUnits, projects] = await Promise.all([
      this.prisma.memberTier.findMany({
        where: {
          groupId,
          deletedAt: null,
        },
        orderBy: { level: 'asc' },
      }),
      this.prisma.organizationUnit.findMany({
        where: {
          groupId,
          parentId: null,
          deletedAt: null,
        },
        orderBy: { sortOrder: 'asc' },
        include: {
          children: {
            where: { deletedAt: null },
            orderBy: { sortOrder: 'asc' },
            include: {
              children: {
                where: { deletedAt: null },
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
        },
      }),
      this.prisma.project.findMany({
        where: {
          groupId,
          deletedAt: null,
        },
        select: {
          id: true,
          code: true,
          name: true,
          isActive: true,
          region: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Extract hierarchy level definitions from group settings if present
    const settings = (group.settings as Record<string, any>) ?? {};
    const hierarchyLevels = settings.hierarchyLevels ?? [];
    const stampRuleTemplates = settings.stampRuleTemplates ?? [];

    return {
      groupId,
      group: {
        id: group.id,
        code: group.code,
        name: group.name,
        stampModeConfig: group.stampModeConfig,
      },
      hierarchyLevels,
      tierDefinitions: memberTiers,
      organizationUnits: orgUnits,
      projects,
      stampRuleTemplates,
    };
  }

  /**
   * Update architecture configuration for a group.
   * Updates the group settings JSON with hierarchy levels, stamp rule templates, etc.
   */
  async updateArchitectureConfig(
    groupId: string,
    config: Record<string, any>,
  ) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true, settings: true, stampModeConfig: true },
    });

    if (!group) {
      throw new NotFoundException(`Group ${groupId} not found.`);
    }

    const currentSettings =
      (group.settings as Record<string, any>) ?? {};

    // Merge architecture config into group settings
    const updatedSettings = {
      ...currentSettings,
    };

    if (config.hierarchyLevels !== undefined) {
      updatedSettings.hierarchyLevels = config.hierarchyLevels;
    }

    if (config.stampRuleTemplates !== undefined) {
      updatedSettings.stampRuleTemplates = config.stampRuleTemplates;
    }

    // Allow overriding arbitrary settings keys
    if (config.settings && typeof config.settings === 'object') {
      Object.assign(updatedSettings, config.settings);
    }

    const updateData: Prisma.GroupUpdateInput = {
      settings: updatedSettings,
    };

    // If stamp mode config is included, update it separately
    if (config.stampModeConfig !== undefined) {
      updateData.stampModeConfig = config.stampModeConfig;
    }

    const updated = await this.prisma.group.update({
      where: { id: groupId },
      data: updateData,
      select: {
        id: true,
        code: true,
        name: true,
        settings: true,
        stampModeConfig: true,
      },
    });

    this.logger.log(`Architecture config updated for group ${groupId}`);

    return {
      groupId,
      group: updated,
      hierarchyLevels: (updated.settings as Record<string, any>)?.hierarchyLevels ?? [],
      stampRuleTemplates: (updated.settings as Record<string, any>)?.stampRuleTemplates ?? [],
    };
  }
}
