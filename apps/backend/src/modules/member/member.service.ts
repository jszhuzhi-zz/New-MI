import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  CreateMemberDto,
  UpdateMemberDto,
  SearchMembersDto,
  CounterRegistrationDto,
  TierChangeDto,
  SpecialListEntryDto,
  ImportMembersDto,
} from './dto';

@Injectable()
export class MemberService {
  private readonly logger = new Logger(MemberService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── CRUD ──────────────────────────────────────────────────────────────────

  async createMember(dto: CreateMemberDto) {
    if (dto.phone) {
      const existing = await this.prisma.member.findFirst({
        where: { phone: dto.phone, deletedAt: null },
      });
      if (existing) {
        throw new ConflictException('Phone number already registered.');
      }
    }

    const memberNo = await this.generateMemberNo(dto.projectId);

    const member = await this.prisma.member.create({
      data: {
        memberNo,
        phone: dto.phone,
        email: dto.email,
        firstNameZhTW: dto.nameZhHk || null,
        firstNameZhCN: dto.nameZhCn || null,
        firstName: dto.nameEn || null,
        gender: dto.gender ? (dto.gender.toUpperCase() as any) : undefined,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        idType: dto.idDocumentType || null,
        idNumber: dto.idDocumentNumber || null,
        preferredLanguage: dto.preferredLanguage || 'zh-TW',
        marketingConsent: dto.marketingConsent ?? false,
        registrationSource: 'APP',
        status: 'ACTIVE',
        profile: dto.district ? { district: dto.district } : undefined,
        projectId: dto.projectId || undefined,
      } as any,
      include: { tier: true, project: true },
    });

    this.logger.log(`Member created: ${member.memberNo} (${dto.phone})`);
    return member;
  }

  async searchMembers(dto: SearchMembersDto) {
    const { page = 1, pageSize = 20 } = dto;
    const skip = (page - 1) * pageSize;

    const where: any = { deletedAt: null };

    if (dto.keyword) {
      where.OR = [
        { firstNameZhTW: { contains: dto.keyword } },
        { firstNameZhCN: { contains: dto.keyword } },
        { firstName: { contains: dto.keyword, mode: 'insensitive' } },
        { phone: { contains: dto.keyword } },
        { email: { contains: dto.keyword, mode: 'insensitive' } },
        { memberNo: { contains: dto.keyword, mode: 'insensitive' } },
      ];
    }

    if (dto.tier) {
      where.tier = { code: dto.tier };
    }
    if (dto.status) {
      where.status = dto.status.toUpperCase();
    }
    if (dto.projectId) {
      where.projectId = dto.projectId;
    }
    if (dto.registeredFrom || dto.registeredTo) {
      where.registeredAt = {};
      if (dto.registeredFrom) where.registeredAt.gte = new Date(dto.registeredFrom);
      if (dto.registeredTo) where.registeredAt.lte = new Date(dto.registeredTo);
    }

    const orderBy = dto.sortBy
      ? { [dto.sortBy]: dto.sortOrder || 'desc' }
      : { createdAt: 'desc' as const };

    const [items, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          tier: true,
          project: { select: { id: true, code: true, name: true } },
          stampAccounts: { select: { id: true, balance: true, projectId: true } },
        },
      }),
      this.prisma.member.count({ where }),
    ]);

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getMemberById(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        tier: true,
        project: true,
        stampAccounts: true,
        specialListEntries: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
        memberLabels: { include: { label: true } },
        memberCards: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!member || member.deletedAt) {
      throw new NotFoundException(`Member ${id} not found.`);
    }

    return member;
  }

  async updateMember(id: string, dto: UpdateMemberDto) {
    const existing = await this.prisma.member.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Member ${id} not found.`);
    }

    const data: any = {};
    const changes: Array<{ fieldName: string; oldValue: string | null; newValue: string | null }> = [];

    if (dto.email !== undefined) {
      changes.push({ fieldName: 'email', oldValue: existing.email, newValue: dto.email || null });
      data.email = dto.email;
    }
    if (dto.nameZhHk !== undefined) {
      changes.push({ fieldName: 'firstNameZhTW', oldValue: existing.firstNameZhTW, newValue: dto.nameZhHk });
      data.firstNameZhTW = dto.nameZhHk;
    }
    if (dto.nameZhCn !== undefined) {
      changes.push({ fieldName: 'firstNameZhCN', oldValue: existing.firstNameZhCN, newValue: dto.nameZhCn });
      data.firstNameZhCN = dto.nameZhCn;
    }
    if (dto.nameEn !== undefined) {
      changes.push({ fieldName: 'firstName', oldValue: existing.firstName, newValue: dto.nameEn });
      data.firstName = dto.nameEn;
    }
    if (dto.gender !== undefined) {
      const genderVal = dto.gender.toUpperCase();
      changes.push({ fieldName: 'gender', oldValue: existing.gender, newValue: genderVal });
      data.gender = genderVal;
    }
    if (dto.dateOfBirth !== undefined) {
      changes.push({ fieldName: 'dateOfBirth', oldValue: existing.dateOfBirth?.toISOString() || null, newValue: dto.dateOfBirth });
      data.dateOfBirth = new Date(dto.dateOfBirth);
    }
    if (dto.preferredLanguage !== undefined) {
      changes.push({ fieldName: 'preferredLanguage', oldValue: existing.preferredLanguage, newValue: dto.preferredLanguage });
      data.preferredLanguage = dto.preferredLanguage;
    }
    if (dto.marketingConsent !== undefined) {
      changes.push({ fieldName: 'marketingConsent', oldValue: String(existing.marketingConsent), newValue: String(dto.marketingConsent) });
      data.marketingConsent = dto.marketingConsent;
    }
    if (dto.district !== undefined) {
      const oldProfile = (existing.profile as any) || {};
      data.profile = { ...oldProfile, district: dto.district };
      changes.push({ fieldName: 'district', oldValue: oldProfile.district || null, newValue: dto.district });
    }

    const member = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.member.update({ where: { id }, data });

      if (changes.length > 0) {
        await tx.memberChangeRecord.createMany({
          data: changes.map((c) => ({
            memberId: id,
            fieldName: c.fieldName,
            oldValue: c.oldValue,
            newValue: c.newValue,
            source: 'admin',
          })),
        });
      }

      return updated;
    });

    this.logger.log(`Member updated: ${id}, fields: ${changes.map(c => c.fieldName).join(', ')}`);
    return member;
  }

  async deleteMember(id: string, reason: string) {
    const member = await this.prisma.member.findUnique({ where: { id } });
    if (!member || member.deletedAt) {
      throw new NotFoundException(`Member ${id} not found.`);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.member.update({
        where: { id },
        data: { status: 'INACTIVE', deletedAt: new Date() },
      });

      await tx.memberAccountRecord.create({
        data: {
          memberId: id,
          action: 'CLOSE',
          reason,
          details: { deactivatedAt: new Date().toISOString() },
        },
      });

      await tx.memberChangeRecord.create({
        data: {
          memberId: id,
          fieldName: 'status',
          oldValue: member.status,
          newValue: 'INACTIVE',
          changeReason: reason,
          source: 'admin',
        },
      });
    });

    this.logger.log(`Member deactivated: ${id}, reason: ${reason}`);
    return { message: 'Member deactivated successfully' };
  }

  // ─── Counter Registration ──────────────────────────────────────────────────

  async counterRegistration(dto: CounterRegistrationDto, operatorId: string) {
    const existing = await this.prisma.member.findFirst({
      where: { phone: dto.phone, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException('Member with this phone already exists.');
    }

    const memberNo = await this.generateMemberNo(dto.projectId);

    const member = await this.prisma.$transaction(async (tx) => {
      const created = await tx.member.create({
        data: {
          memberNo,
          phone: dto.phone,
          firstNameZhTW: dto.nameZhHk,
          firstName: dto.nameEn || null,
          email: dto.email || null,
          registrationSource: 'COUNTER',
          status: 'ACTIVE',
          preferredLanguage: 'zh-TW',
          projectId: dto.projectId,
          metadata: dto.notes ? { registrationNotes: dto.notes } : undefined,
        } as any,
        include: { tier: true, project: true },
      });

      await tx.memberAccountRecord.create({
        data: {
          memberId: created.id,
          action: 'OPEN',
          performedBy: operatorId,
          reason: 'Counter registration',
          details: { source: 'counter', notes: dto.notes || null },
        },
      });

      return created;
    });

    this.logger.log(`Counter registration by ${operatorId}: ${member.memberNo}`);
    return member;
  }

  // ─── Tier Management ───────────────────────────────────────────────────────

  async changeTier(dto: TierChangeDto, operatorId: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: dto.memberId },
      include: { tier: true },
    });
    if (!member || member.deletedAt) {
      throw new NotFoundException('Member not found.');
    }

    const targetTier = await this.prisma.memberTier.findFirst({
      where: { code: dto.newTier, isActive: true, deletedAt: null },
    });
    if (!targetTier) {
      throw new BadRequestException(`Tier "${dto.newTier}" not found or inactive.`);
    }

    const previousTierCode = member.tier?.code || 'none';

    const updatedMember = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.member.update({
        where: { id: dto.memberId },
        data: { tierId: targetTier.id },
        include: { tier: true },
      });

      await tx.memberChangeRecord.create({
        data: {
          memberId: dto.memberId,
          fieldName: 'tier',
          oldValue: previousTierCode,
          newValue: dto.newTier,
          changedBy: operatorId,
          changeReason: dto.reason,
          source: 'admin',
        },
      });

      const action = targetTier.level > (member.tier?.level || 0) ? 'UPGRADE' : 'DOWNGRADE';
      await tx.memberAccountRecord.create({
        data: {
          memberId: dto.memberId,
          action: action as any,
          performedBy: operatorId,
          reason: dto.reason,
          details: {
            previousTier: previousTierCode,
            newTier: dto.newTier,
            effectiveDate: dto.effectiveDate || new Date().toISOString(),
          },
        },
      });

      return updated;
    });

    this.logger.log(`Tier changed for ${dto.memberId}: ${previousTierCode} → ${dto.newTier}`);
    return updatedMember;
  }

  async getTierHistory(memberId: string) {
    const member = await this.prisma.member.findUnique({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Member not found.');

    const [changeRecords, accountRecords] = await Promise.all([
      this.prisma.memberChangeRecord.findMany({
        where: { memberId, fieldName: 'tier' },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.memberAccountRecord.findMany({
        where: {
          memberId,
          action: { in: ['UPGRADE', 'DOWNGRADE'] },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { changeRecords, accountRecords };
  }

  // ─── Special List Management ───────────────────────────────────────────────

  async addToSpecialList(dto: SpecialListEntryDto, operatorId: string) {
    const listTypeMap: Record<string, string> = {
      whitelist: 'WHITELIST',
      blacklist: 'BLACKLIST',
      vip: 'WHITELIST',
      watch: 'WATCHLIST',
    };
    const listType = listTypeMap[dto.listType.toLowerCase()] || 'WHITELIST';

    const member = await this.prisma.member.findUnique({ where: { id: dto.memberId } });
    if (!member || member.deletedAt) {
      throw new NotFoundException('Member not found.');
    }

    const existing = await this.prisma.specialListMember.findFirst({
      where: { memberId: dto.memberId, listType: listType as any, isActive: true },
    });
    if (existing) {
      throw new ConflictException(`Member already on ${dto.listType}.`);
    }

    const entry = await this.prisma.specialListMember.create({
      data: {
        memberId: dto.memberId,
        listType: listType as any,
        reason: dto.reason,
        addedBy: operatorId,
        effectiveFrom: new Date(),
        effectiveTo: dto.expiryDate ? new Date(dto.expiryDate) : null,
        isActive: true,
      },
    });

    if (listType === 'BLACKLIST') {
      await this.prisma.member.update({
        where: { id: dto.memberId },
        data: { status: 'SUSPENDED' },
      });
    }

    this.logger.log(`Member ${dto.memberId} added to ${listType} by ${operatorId}`);
    return entry;
  }

  async removeFromSpecialList(entryId: string, operatorId: string) {
    const entry = await this.prisma.specialListMember.findUnique({ where: { id: entryId } });
    if (!entry) {
      throw new NotFoundException('Special list entry not found.');
    }

    await this.prisma.specialListMember.update({
      where: { id: entryId },
      data: {
        isActive: false,
        metadata: {
          ...((entry.metadata as any) || {}),
          removedBy: operatorId,
          removedAt: new Date().toISOString(),
        },
      },
    });

    if (entry.listType === 'BLACKLIST') {
      const stillBlacklisted = await this.prisma.specialListMember.findFirst({
        where: { memberId: entry.memberId, listType: 'BLACKLIST', isActive: true, id: { not: entryId } },
      });
      if (!stillBlacklisted) {
        await this.prisma.member.update({
          where: { id: entry.memberId },
          data: { status: 'ACTIVE' },
        });
      }
    }

    this.logger.log(`Special list entry ${entryId} removed by ${operatorId}`);
    return { message: 'Removed from special list' };
  }

  async getSpecialListEntries(memberId: string) {
    return this.prisma.specialListMember.findMany({
      where: { memberId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Import / Export ───────────────────────────────────────────────────────

  async importMembers(dto: ImportMembersDto, operatorId: string) {
    this.logger.log(`Member import queued by ${operatorId} for project ${dto.projectId}`);

    await this.prisma.operationLog.create({
      data: {
        module: 'member',
        operation: 'import',
        entityType: 'member',
        description: { en: 'Member import initiated', 'zh-TW': '會員導入已啟動' },
        requestData: { fileUrl: dto.fileUrl, projectId: dto.projectId, skipDuplicates: dto.skipDuplicates ?? true },
        result: 'success',
      },
    });

    return { message: 'Import job queued', status: 'processing' };
  }

  async exportMembers(filters: SearchMembersDto, operatorId: string) {
    this.logger.log(`Member export queued by ${operatorId}`);

    await this.prisma.operationLog.create({
      data: {
        module: 'member',
        operation: 'export',
        entityType: 'member',
        description: { en: 'Member export initiated', 'zh-TW': '會員導出已啟動' },
        requestData: filters as any,
        result: 'success',
      },
    });

    return { message: 'Export job queued', status: 'processing' };
  }

  // ─── Change Records ────────────────────────────────────────────────────────

  async getChangeRecords(memberId: string, params: { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 20 } = params;
    const skip = (page - 1) * pageSize;

    const where = { memberId };

    const [items, total] = await Promise.all([
      this.prisma.memberChangeRecord.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.memberChangeRecord.count({ where }),
    ]);

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  private async generateMemberNo(projectId?: string): Promise<string> {
    let prefix = 'M';

    if (projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: { code: true },
      });
      if (project?.code) {
        prefix = project.code.substring(0, 3).toUpperCase();
      }
    }

    const latest = await this.prisma.member.findFirst({
      where: { memberNo: { startsWith: prefix } },
      orderBy: { memberNo: 'desc' },
      select: { memberNo: true },
    });

    let seq = 1;
    if (latest?.memberNo) {
      const numPart = latest.memberNo.replace(prefix, '');
      const parsed = parseInt(numPart, 10);
      if (!isNaN(parsed)) seq = parsed + 1;
    }

    return `${prefix}${String(seq).padStart(6, '0')}`;
  }
}
