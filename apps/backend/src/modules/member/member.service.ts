import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  CreateMemberDto,
  UpdateMemberDto,
  SearchMembersDto,
  CounterRegistrationDto,
  TierChangeDto,
  SpecialListEntryDto,
  ImportMembersDto,
} from './dto';

/**
 * Member service.
 * Handles full member lifecycle including registration, profile management,
 * tier management, special lists, import/export, and change history.
 */
@Injectable()
export class MemberService {
  private readonly logger = new Logger(MemberService.name);

  // ─── CRUD ──────────────────────────────────────────────────────────────────

  /**
   * Create a new member (self-registration via customer app).
   */
  async createMember(dto: CreateMemberDto) {
    // TODO: Check if phone number already exists
    // const existing = await this.prisma.member.findFirst({ where: { phone: dto.phone } });
    // if (existing) throw new ConflictException('Phone number already registered.');

    // TODO: Generate member number (project prefix + sequence)
    // const memberNumber = await this.generateMemberNumber(dto.projectId);

    // TODO: Create member in database
    // const member = await this.prisma.member.create({
    //   data: {
    //     memberNumber,
    //     phone: dto.phone,
    //     email: dto.email,
    //     nameZhHk: dto.nameZhHk,
    //     nameZhCn: dto.nameZhCn,
    //     nameEn: dto.nameEn,
    //     gender: dto.gender,
    //     dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
    //     idDocumentType: dto.idDocumentType,
    //     idDocumentNumber: dto.idDocumentNumber, // Encrypt before storing
    //     district: dto.district,
    //     preferredLanguage: dto.preferredLanguage || 'zh-HK',
    //     marketingConsent: dto.marketingConsent ?? false,
    //     tier: 'basic',
    //     status: 'active',
    //     projectId: dto.projectId,
    //     registeredAt: new Date(),
    //   },
    // });

    this.logger.log(`Member created: ${dto.phone}`);
    return { id: 'new-member-id', memberNumber: 'M000001', ...dto, tier: 'basic', status: 'active' };
  }

  /**
   * Search members with filters and pagination.
   */
  async searchMembers(dto: SearchMembersDto) {
    const { page = 1, pageSize = 20 } = dto;

    // TODO: Build dynamic query with filters
    // const where: Prisma.MemberWhereInput = {};
    // if (dto.keyword) {
    //   where.OR = [
    //     { nameZhHk: { contains: dto.keyword } },
    //     { nameEn: { contains: dto.keyword, mode: 'insensitive' } },
    //     { phone: { contains: dto.keyword } },
    //     { email: { contains: dto.keyword, mode: 'insensitive' } },
    //     { memberNumber: { contains: dto.keyword } },
    //   ];
    // }
    // if (dto.tier) where.tier = dto.tier;
    // if (dto.status) where.status = dto.status;
    // if (dto.projectId) where.projectId = dto.projectId;
    // if (dto.registeredFrom || dto.registeredTo) {
    //   where.registeredAt = {};
    //   if (dto.registeredFrom) where.registeredAt.gte = new Date(dto.registeredFrom);
    //   if (dto.registeredTo) where.registeredAt.lte = new Date(dto.registeredTo);
    // }
    //
    // const orderBy = dto.sortBy ? { [dto.sortBy]: dto.sortOrder || 'desc' } : { createdAt: 'desc' };
    //
    // const [items, total] = await Promise.all([
    //   this.prisma.member.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy }),
    //   this.prisma.member.count({ where }),
    // ]);

    return { items: [], total: 0, page, pageSize };
  }

  /**
   * Get member by ID with full profile.
   */
  async getMemberById(id: string) {
    // TODO: Fetch member with related data
    // const member = await this.prisma.member.findUnique({
    //   where: { id },
    //   include: {
    //     stampBalance: true,
    //     tierHistory: { orderBy: { createdAt: 'desc' }, take: 10 },
    //     specialListEntries: { where: { status: 'active' } },
    //     project: true,
    //   },
    // });
    // if (!member) throw new NotFoundException(`Member ${id} not found.`);
    // return member;

    return null;
  }

  /**
   * Update member profile.
   */
  async updateMember(id: string, dto: UpdateMemberDto) {
    // TODO: Update member in database and log the change
    // const member = await this.prisma.member.update({ where: { id }, data: dto });
    // await this.logChange(id, 'profile_update', dto);
    // return member;

    this.logger.log(`Member updated: ${id}`);
    return { id, ...dto };
  }

  /**
   * Delete (deactivate) a member.
   */
  async deleteMember(id: string, reason: string) {
    // TODO: Soft-delete member
    // await this.prisma.member.update({
    //   where: { id },
    //   data: { status: 'inactive', deactivatedAt: new Date(), deactivationReason: reason },
    // });
    // await this.logChange(id, 'deactivation', { reason });

    this.logger.log(`Member deactivated: ${id}`);
    return { message: 'Member deactivated successfully' };
  }

  // ─── Counter Registration ──────────────────────────────────────────────────

  /**
   * Register a member at mall counter (operator-assisted).
   */
  async counterRegistration(dto: CounterRegistrationDto, operatorId: string) {
    // TODO: Check if member already exists
    // const existing = await this.prisma.member.findFirst({ where: { phone: dto.phone } });
    // if (existing) throw new ConflictException('Member with this phone already exists.');

    // TODO: Create member with counter registration flag
    // const member = await this.prisma.member.create({
    //   data: {
    //     ...dto,
    //     registrationType: 'counter',
    //     registeredBy: operatorId,
    //     tier: 'basic',
    //     status: 'active',
    //   },
    // });

    this.logger.log(`Counter registration by operator ${operatorId}: ${dto.phone}`);
    return { id: 'new-member-id', registrationType: 'counter', ...dto };
  }

  // ─── Tier Management ───────────────────────────────────────────────────────

  /**
   * Change member tier (manual adjustment).
   */
  async changeTier(dto: TierChangeDto, operatorId: string) {
    // TODO: Verify member exists
    // const member = await this.prisma.member.findUnique({ where: { id: dto.memberId } });
    // if (!member) throw new NotFoundException('Member not found.');

    // TODO: Update tier and create history record
    // const [updatedMember, history] = await this.prisma.$transaction([
    //   this.prisma.member.update({ where: { id: dto.memberId }, data: { tier: dto.newTier } }),
    //   this.prisma.tierHistory.create({
    //     data: {
    //       memberId: dto.memberId,
    //       previousTier: member.tier,
    //       newTier: dto.newTier,
    //       reason: dto.reason,
    //       effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : new Date(),
    //       changedBy: operatorId,
    //     },
    //   }),
    // ]);

    this.logger.log(`Tier changed for member ${dto.memberId} to ${dto.newTier}`);
    return { memberId: dto.memberId, newTier: dto.newTier, reason: dto.reason };
  }

  /**
   * Get tier history for a member.
   */
  async getTierHistory(memberId: string) {
    // TODO: Fetch tier history
    // return this.prisma.tierHistory.findMany({
    //   where: { memberId },
    //   orderBy: { createdAt: 'desc' },
    // });

    return [];
  }

  // ─── Special List Management ───────────────────────────────────────────────

  /**
   * Add member to a special list (whitelist, blacklist, VIP, watch).
   */
  async addToSpecialList(dto: SpecialListEntryDto, operatorId: string) {
    // TODO: Create special list entry
    // return this.prisma.specialListEntry.create({
    //   data: {
    //     memberId: dto.memberId,
    //     listType: dto.listType,
    //     reason: dto.reason,
    //     expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
    //     addedBy: operatorId,
    //     status: 'active',
    //   },
    // });

    this.logger.log(`Member ${dto.memberId} added to ${dto.listType}`);
    return { id: 'entry-id', ...dto, addedBy: operatorId };
  }

  /**
   * Remove member from a special list.
   */
  async removeFromSpecialList(entryId: string, operatorId: string) {
    // TODO: Deactivate special list entry
    // await this.prisma.specialListEntry.update({
    //   where: { id: entryId },
    //   data: { status: 'inactive', removedBy: operatorId, removedAt: new Date() },
    // });

    return { message: 'Removed from special list' };
  }

  /**
   * Get special list entries for a member.
   */
  async getSpecialListEntries(memberId: string) {
    // TODO: Fetch active special list entries
    // return this.prisma.specialListEntry.findMany({
    //   where: { memberId, status: 'active' },
    //   orderBy: { createdAt: 'desc' },
    // });

    return [];
  }

  // ─── Import / Export ───────────────────────────────────────────────────────

  /**
   * Import members from CSV/Excel file.
   * Processes asynchronously via Bull queue.
   */
  async importMembers(dto: ImportMembersDto, operatorId: string) {
    // TODO: Add import job to Bull queue
    // await this.importQueue.add('import-members', {
    //   fileUrl: dto.fileUrl,
    //   projectId: dto.projectId,
    //   skipDuplicates: dto.skipDuplicates ?? true,
    //   operatorId,
    // });

    this.logger.log(`Member import queued by ${operatorId} for project ${dto.projectId}`);
    return { message: 'Import job queued', jobId: 'job-id-placeholder' };
  }

  /**
   * Export members to CSV/Excel.
   * Processes asynchronously and returns a download URL.
   */
  async exportMembers(filters: SearchMembersDto, operatorId: string) {
    // TODO: Add export job to Bull queue
    // const job = await this.exportQueue.add('export-members', {
    //   filters,
    //   operatorId,
    //   format: 'xlsx',
    // });

    this.logger.log(`Member export queued by ${operatorId}`);
    return { message: 'Export job queued', jobId: 'job-id-placeholder' };
  }

  // ─── Change Records ────────────────────────────────────────────────────────

  /**
   * Get change history for a member.
   */
  async getChangeRecords(memberId: string, params: { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 20 } = params;

    // TODO: Fetch change records
    // const [items, total] = await Promise.all([
    //   this.prisma.memberChangeRecord.findMany({
    //     where: { memberId },
    //     skip: (page - 1) * pageSize,
    //     take: pageSize,
    //     orderBy: { createdAt: 'desc' },
    //   }),
    //   this.prisma.memberChangeRecord.count({ where: { memberId } }),
    // ]);

    return { items: [], total: 0, page, pageSize };
  }
}
