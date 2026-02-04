import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { MerchantService } from './merchant.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PortalGuard } from '../../common/guards/portal.guard';
import { Roles, Portal, CurrentUser } from '../../common/decorators';

@ApiTags('Merchants')
@Controller('merchants')
@UseGuards(JwtAuthGuard, RolesGuard, PortalGuard)
@ApiBearerAuth('JWT-auth')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  // ─── Merchant CRUD ─────────────────────────────────────────────────────────

  @Get()
  @Roles('group_admin', 'mall_admin', 'mall_operator')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'List merchants',
    description: 'List merchants with optional filters for project, category, status, and search.',
  })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of merchants.' })
  async listMerchants(
    @Query('projectId') projectId?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.merchantService.listMerchants({
      projectId, category, status, search, page, pageSize,
    });
  }

  @Get(':id')
  @Roles('group_admin', 'mall_admin', 'mall_operator', 'merchant_admin')
  @Portal('mall', 'group', 'merchant')
  @ApiOperation({
    summary: 'Get merchant by ID',
    description: 'Retrieve full merchant details including staff and stamp statistics.',
  })
  @ApiParam({ name: 'id', description: 'Merchant ID' })
  @ApiResponse({ status: 200, description: 'Merchant details.' })
  @ApiResponse({ status: 404, description: 'Merchant not found.' })
  async getMerchant(@Param('id') id: string) {
    return this.merchantService.getMerchantById(id);
  }

  @Post()
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create merchant',
    description: 'Create a new merchant in a project.',
  })
  @ApiResponse({ status: 201, description: 'Merchant created.' })
  @ApiResponse({ status: 409, description: 'Merchant code already exists.' })
  async createMerchant(@Body() data: any) {
    return this.merchantService.createMerchant(data);
  }

  @Put(':id')
  @Roles('group_admin', 'mall_admin', 'merchant_admin')
  @Portal('mall', 'group', 'merchant')
  @ApiOperation({
    summary: 'Update merchant',
    description: 'Update merchant details.',
  })
  @ApiParam({ name: 'id', description: 'Merchant ID' })
  @ApiResponse({ status: 200, description: 'Merchant updated.' })
  @ApiResponse({ status: 404, description: 'Merchant not found.' })
  async updateMerchant(@Param('id') id: string, @Body() data: any) {
    return this.merchantService.updateMerchant(id, data);
  }

  @Delete(':id')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Deactivate merchant',
    description: 'Soft-delete a merchant. Active stamp rules will be paused.',
  })
  @ApiParam({ name: 'id', description: 'Merchant ID' })
  @ApiResponse({ status: 200, description: 'Merchant deactivated.' })
  async deleteMerchant(@Param('id') id: string) {
    return this.merchantService.deleteMerchant(id);
  }

  // ─── Merchant Staff ────────────────────────────────────────────────────────

  @Get(':id/staff')
  @Roles('group_admin', 'mall_admin', 'merchant_admin')
  @Portal('mall', 'group', 'merchant')
  @ApiOperation({
    summary: 'List merchant staff',
    description: 'List all active staff for a merchant.',
  })
  @ApiParam({ name: 'id', description: 'Merchant ID' })
  @ApiResponse({ status: 200, description: 'List of merchant staff.' })
  async listStaff(@Param('id') id: string) {
    return this.merchantService.listMerchantStaff(id);
  }

  @Post(':id/staff')
  @Roles('group_admin', 'mall_admin', 'merchant_admin')
  @Portal('mall', 'group', 'merchant')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add merchant staff',
    description: 'Add a new staff member to the merchant.',
  })
  @ApiParam({ name: 'id', description: 'Merchant ID' })
  @ApiResponse({ status: 201, description: 'Staff added.' })
  async addStaff(@Param('id') id: string, @Body() data: any) {
    return this.merchantService.addMerchantStaff(id, data);
  }

  @Delete(':merchantId/staff/:staffId')
  @Roles('group_admin', 'mall_admin', 'merchant_admin')
  @Portal('mall', 'group', 'merchant')
  @ApiOperation({
    summary: 'Remove merchant staff',
    description: 'Remove a staff member from the merchant.',
  })
  @ApiParam({ name: 'merchantId', description: 'Merchant ID' })
  @ApiParam({ name: 'staffId', description: 'Staff ID' })
  @ApiResponse({ status: 200, description: 'Staff removed.' })
  async removeStaff(
    @Param('merchantId') merchantId: string,
    @Param('staffId') staffId: string,
  ) {
    return this.merchantService.removeMerchantStaff(merchantId, staffId);
  }

  // ─── Stamp Processing (Merchant Portal) ────────────────────────────────────

  @Post('stamps/issue')
  @Roles('merchant_admin', 'merchant_staff')
  @Portal('merchant')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Process stamp issuance',
    description: 'Merchant processes a stamp issuance by scanning a receipt. Validates receipt and calculates stamps.',
  })
  @ApiResponse({ status: 201, description: 'Stamps issued successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid receipt or member.' })
  async processStampIssuance(
    @Body() data: {
      merchantId: string;
      memberId: string;
      receiptNumber: string;
      receiptAmount: number;
      receiptDate: string;
      receiptImageUrl?: string;
    },
    @CurrentUser('id') operatorId: string,
  ) {
    return this.merchantService.processStampIssuance({ ...data, operatorId });
  }

  @Get(':id/stamp-history')
  @Roles('merchant_admin', 'merchant_staff', 'mall_admin')
  @Portal('merchant', 'mall')
  @ApiOperation({
    summary: 'Get merchant stamp history',
    description: 'Get stamp transaction history for a specific merchant.',
  })
  @ApiParam({ name: 'id', description: 'Merchant ID' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Stamp transaction history.' })
  async getStampHistory(
    @Param('id') id: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.merchantService.getStampHistory(id, { dateFrom, dateTo, page, pageSize });
  }

  @Get(':id/stats')
  @Roles('merchant_admin', 'mall_admin', 'group_admin')
  @Portal('merchant', 'mall', 'group')
  @ApiOperation({
    summary: 'Get merchant stamp statistics',
    description: 'Get aggregated stamp statistics for a merchant.',
  })
  @ApiParam({ name: 'id', description: 'Merchant ID' })
  @ApiQuery({ name: 'period', required: false, type: String, description: 'daily | weekly | monthly' })
  @ApiResponse({ status: 200, description: 'Merchant statistics.' })
  async getMerchantStats(
    @Param('id') id: string,
    @Query('period') period: string = 'monthly',
  ) {
    return this.merchantService.getMerchantStats(id, period);
  }
}
