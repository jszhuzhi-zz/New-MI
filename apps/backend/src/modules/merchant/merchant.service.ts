import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

/**
 * Merchant service.
 * Manages merchant CRUD operations and stamp processing
 * for the merchant portal.
 */
@Injectable()
export class MerchantService {
  private readonly logger = new Logger(MerchantService.name);

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
    // TODO: Query merchants with filters and pagination
    // const where: Prisma.MerchantWhereInput = {};
    // if (params.projectId) where.projectId = params.projectId;
    // if (params.category) where.category = params.category;
    // if (params.status) where.status = params.status;
    // if (params.search) {
    //   where.OR = [
    //     { nameZhHk: { contains: params.search } },
    //     { nameEn: { contains: params.search, mode: 'insensitive' } },
    //     { code: { contains: params.search } },
    //   ];
    // }

    return { items: [], total: 0, page: params.page || 1, pageSize: params.pageSize || 20 };
  }

  /**
   * Get merchant by ID.
   */
  async getMerchantById(id: string) {
    // TODO: Fetch merchant with related data
    // const merchant = await this.prisma.merchant.findUnique({
    //   where: { id },
    //   include: { project: true, staff: true, stampStats: true },
    // });
    // if (!merchant) throw new NotFoundException('Merchant not found.');

    return null;
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
    // TODO: Check for duplicate code within project
    // const existing = await this.prisma.merchant.findFirst({
    //   where: { code: data.code, projectId: data.projectId },
    // });
    // if (existing) throw new ConflictException('Merchant code already exists in this project.');

    // TODO: Create merchant in database
    // return this.prisma.merchant.create({ data: { ...data, status: 'active' } });

    this.logger.log(`Merchant created: ${data.code} in project ${data.projectId}`);
    return { id: 'new-merchant-id', ...data, status: 'active' };
  }

  /**
   * Update merchant details.
   */
  async updateMerchant(id: string, data: Record<string, any>) {
    // TODO: Update merchant
    // return this.prisma.merchant.update({ where: { id }, data });

    this.logger.log(`Merchant updated: ${id}`);
    return { id, ...data };
  }

  /**
   * Delete (deactivate) a merchant.
   */
  async deleteMerchant(id: string) {
    // TODO: Soft-delete merchant
    // await this.prisma.merchant.update({ where: { id }, data: { status: 'inactive', deactivatedAt: new Date() } });

    this.logger.log(`Merchant deactivated: ${id}`);
    return { message: 'Merchant deactivated successfully' };
  }

  // ─── Merchant Staff ────────────────────────────────────────────────────────

  /**
   * List staff for a merchant.
   */
  async listMerchantStaff(merchantId: string) {
    // TODO: Fetch merchant staff
    // return this.prisma.merchantStaff.findMany({
    //   where: { merchantId, status: 'active' },
    //   include: { user: true },
    // });

    return [];
  }

  /**
   * Add staff to a merchant.
   */
  async addMerchantStaff(merchantId: string, data: {
    userId?: string;
    name: string;
    phone: string;
    email?: string;
    role: string; // 'merchant_admin' | 'merchant_staff'
  }) {
    // TODO: Create or link merchant staff
    this.logger.log(`Staff added to merchant ${merchantId}: ${data.name}`);
    return { id: 'staff-id', merchantId, ...data };
  }

  /**
   * Remove staff from a merchant.
   */
  async removeMerchantStaff(merchantId: string, staffId: string) {
    // TODO: Deactivate merchant staff
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
    // TODO: Validate merchant is active
    // TODO: Validate receipt (check for duplicates)
    // TODO: Calculate stamps based on earning rules
    // TODO: Apply any campaign bonuses
    // TODO: Run risk checks
    // TODO: Create stamp transaction
    // TODO: Update member balance

    this.logger.log(
      `Stamp issuance processed by merchant ${data.merchantId} for member ${data.memberId}`,
    );
    return {
      transactionId: 'txn-id-placeholder',
      memberId: data.memberId,
      merchantId: data.merchantId,
      receiptNumber: data.receiptNumber,
      receiptAmount: data.receiptAmount,
      stampsIssued: 0, // TODO: Calculate
      status: 'completed',
    };
  }

  /**
   * Get stamp processing history for a merchant.
   */
  async getStampHistory(merchantId: string, params: {
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
  }) {
    // TODO: Fetch stamp transaction history for merchant
    return { items: [], total: 0, page: params.page || 1, pageSize: params.pageSize || 20 };
  }

  /**
   * Get merchant stamp statistics.
   */
  async getMerchantStats(merchantId: string, period: string) {
    // TODO: Aggregate stamp statistics for merchant
    return {
      merchantId,
      period,
      totalTransactions: 0,
      totalStampsIssued: 0,
      totalReceiptAmount: 0,
      uniqueMembers: 0,
      averageStampsPerTransaction: 0,
    };
  }
}
