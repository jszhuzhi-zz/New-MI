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
import { StampService } from './stamp.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PortalGuard } from '../../common/guards/portal.guard';
import { Roles, Portal, CurrentUser } from '../../common/decorators';

@ApiTags('Stamps')
@Controller('stamps')
@UseGuards(JwtAuthGuard, RolesGuard, PortalGuard)
@ApiBearerAuth('JWT-auth')
export class StampController {
  constructor(private readonly stampService: StampService) {}

  // ─── Transactions ──────────────────────────────────────────────────────────

  @Post('issue')
  @Roles('mall_admin', 'mall_operator', 'merchant_admin', 'merchant_staff')
  @Portal('mall', 'merchant')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Issue stamps to member',
    description: 'Issue stamps to a member based on a receipt or earning rule. Validates upper limits and risk controls.',
  })
  @ApiResponse({ status: 201, description: 'Stamps issued successfully.' })
  @ApiResponse({ status: 400, description: 'Limit exceeded or member inactive.' })
  @ApiResponse({ status: 404, description: 'Member not found.' })
  async issueStamps(
    @Body() data: {
      memberId: string;
      amount: number;
      receiptNumber?: string;
      receiptAmount?: number;
      merchantId?: string;
      projectId: string;
      ruleId?: string;
      notes?: string;
    },
    @CurrentUser('id') operatorId: string,
  ) {
    return this.stampService.issueStamps({ ...data, operatorId });
  }

  @Post('consume')
  @Roles('mall_admin', 'mall_operator', 'merchant_admin', 'merchant_staff', 'customer')
  @Portal('mall', 'merchant', 'customer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consume (redeem) stamps',
    description: 'Consume stamps from a member\'s balance for redemptions, campaigns, or rewards.',
  })
  @ApiResponse({ status: 200, description: 'Stamps consumed successfully.' })
  @ApiResponse({ status: 400, description: 'Insufficient balance.' })
  async consumeStamps(
    @Body() data: {
      memberId: string;
      amount: number;
      purpose: string;
      campaignId?: string;
      projectId: string;
    },
    @CurrentUser('id') operatorId: string,
  ) {
    return this.stampService.consumeStamps({ ...data, operatorId });
  }

  @Post('void/:transactionId')
  @Roles('mall_admin', 'group_admin')
  @Portal('mall', 'group')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Void stamp transaction',
    description: 'Reverse a stamp transaction. Requires admin privileges and a reason.',
  })
  @ApiParam({ name: 'transactionId', description: 'Transaction ID to void' })
  @ApiResponse({ status: 200, description: 'Transaction voided.' })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  async voidTransaction(
    @Param('transactionId') transactionId: string,
    @Body('reason') reason: string,
    @CurrentUser('id') operatorId: string,
  ) {
    return this.stampService.voidTransaction(transactionId, reason, operatorId);
  }

  @Get('transactions')
  @Roles('group_admin', 'mall_admin', 'mall_operator')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Get transaction history',
    description: 'Query stamp transactions with filters for member, project, type, and date range.',
  })
  @ApiQuery({ name: 'memberId', required: false, type: String })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'earn | consume | void | expire' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated transaction history.' })
  async getTransactionHistory(
    @Query('memberId') memberId?: string,
    @Query('projectId') projectId?: string,
    @Query('type') type?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.stampService.getTransactionHistory({
      memberId, projectId, type, dateFrom, dateTo, page, pageSize,
    });
  }

  @Get('balance/:memberId')
  @Portal('customer', 'mall', 'group', 'merchant')
  @ApiOperation({
    summary: 'Get stamp balance',
    description: 'Get the current stamp balance breakdown for a member.',
  })
  @ApiParam({ name: 'memberId', description: 'Member ID' })
  @ApiResponse({ status: 200, description: 'Stamp balance details.' })
  async getBalance(@Param('memberId') memberId: string) {
    return this.stampService.getStampBalance(memberId);
  }

  // ─── Earning Rules ─────────────────────────────────────────────────────────

  @Get('rules/earning')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'List earning rules',
    description: 'List all active stamp earning rules for a project.',
  })
  @ApiQuery({ name: 'projectId', required: true, type: String })
  @ApiResponse({ status: 200, description: 'List of earning rules.' })
  async listEarningRules(@Query('projectId') projectId: string) {
    return this.stampService.listEarningRules(projectId);
  }

  @Post('rules/earning')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create earning rule',
    description: 'Create a new stamp earning rule for a project.',
  })
  @ApiResponse({ status: 201, description: 'Earning rule created.' })
  async createEarningRule(@Body() data: any) {
    return this.stampService.createEarningRule(data);
  }

  @Put('rules/earning/:ruleId')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Update earning rule',
    description: 'Update an existing earning rule.',
  })
  @ApiParam({ name: 'ruleId', description: 'Rule ID' })
  @ApiResponse({ status: 200, description: 'Earning rule updated.' })
  async updateEarningRule(@Param('ruleId') ruleId: string, @Body() data: any) {
    return this.stampService.updateEarningRule(ruleId, data);
  }

  @Delete('rules/earning/:ruleId')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Delete earning rule',
    description: 'Soft-delete an earning rule.',
  })
  @ApiParam({ name: 'ruleId', description: 'Rule ID' })
  @ApiResponse({ status: 200, description: 'Earning rule deleted.' })
  async deleteEarningRule(@Param('ruleId') ruleId: string) {
    return this.stampService.deleteEarningRule(ruleId);
  }

  // ─── Consumption Rules ─────────────────────────────────────────────────────

  @Get('rules/consumption')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'List consumption rules',
    description: 'List all consumption rules for a project.',
  })
  @ApiQuery({ name: 'projectId', required: true, type: String })
  @ApiResponse({ status: 200, description: 'List of consumption rules.' })
  async listConsumptionRules(@Query('projectId') projectId: string) {
    return this.stampService.listConsumptionRules(projectId);
  }

  @Post('rules/consumption')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create consumption rule',
    description: 'Create a new stamp consumption rule.',
  })
  @ApiResponse({ status: 201, description: 'Consumption rule created.' })
  async createConsumptionRule(@Body() data: any) {
    return this.stampService.createConsumptionRule(data);
  }

  // ─── Expiry Rules ──────────────────────────────────────────────────────────

  @Get('rules/expiry')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'List expiry rules',
    description: 'List all stamp expiry rules for a project.',
  })
  @ApiQuery({ name: 'projectId', required: true, type: String })
  @ApiResponse({ status: 200, description: 'List of expiry rules.' })
  async listExpiryRules(@Query('projectId') projectId: string) {
    return this.stampService.listExpiryRules(projectId);
  }

  @Post('rules/expiry')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create expiry rule',
    description: 'Create a new stamp expiry rule.',
  })
  @ApiResponse({ status: 201, description: 'Expiry rule created.' })
  async createExpiryRule(@Body() data: any) {
    return this.stampService.createExpiryRule(data);
  }

  // ─── Upper Limit Rules ────────────────────────────────────────────────────

  @Get('rules/upper-limit')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'List upper limit rules',
    description: 'List all stamp upper limit rules for a project.',
  })
  @ApiQuery({ name: 'projectId', required: true, type: String })
  @ApiResponse({ status: 200, description: 'List of upper limit rules.' })
  async listUpperLimitRules(@Query('projectId') projectId: string) {
    return this.stampService.listUpperLimitRules(projectId);
  }

  @Post('rules/upper-limit')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create upper limit rule',
    description: 'Create a new stamp upper limit rule.',
  })
  @ApiResponse({ status: 201, description: 'Upper limit rule created.' })
  async createUpperLimitRule(@Body() data: any) {
    return this.stampService.createUpperLimitRule(data);
  }

  // ─── Campaign Rules ────────────────────────────────────────────────────────

  @Get('rules/campaign')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'List campaign stamp rules',
    description: 'List campaign-specific stamp rules (multipliers, bonus stamps).',
  })
  @ApiQuery({ name: 'projectId', required: true, type: String })
  @ApiResponse({ status: 200, description: 'List of campaign rules.' })
  async listCampaignRules(@Query('projectId') projectId: string) {
    return this.stampService.listCampaignRules(projectId);
  }

  @Post('rules/campaign')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create campaign stamp rule',
    description: 'Create a campaign-specific stamp rule (e.g., 2x stamps during promotion).',
  })
  @ApiResponse({ status: 201, description: 'Campaign rule created.' })
  async createCampaignRule(@Body() data: any) {
    return this.stampService.createCampaignRule(data);
  }

  // ─── Clearing Statistics ───────────────────────────────────────────────────

  @Get('clearing')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Get clearing statistics',
    description: 'Get stamp clearing statistics (earned, consumed, expired, voided) for a period.',
  })
  @ApiQuery({ name: 'projectId', required: true, type: String })
  @ApiQuery({ name: 'period', required: true, type: String, description: 'daily | monthly | yearly' })
  @ApiQuery({ name: 'dateFrom', required: true, type: String })
  @ApiQuery({ name: 'dateTo', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Clearing statistics.' })
  async getClearingStats(
    @Query('projectId') projectId: string,
    @Query('period') period: string,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
  ) {
    return this.stampService.getClearingStats({ projectId, period, dateFrom, dateTo });
  }

  @Post('expiry-batch')
  @Roles('group_admin')
  @Portal('group')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Run stamp expiry batch',
    description: 'Trigger the stamp expiry batch process for a project. Expires stamps per configured rules.',
  })
  @ApiResponse({ status: 202, description: 'Expiry batch started.' })
  async runExpiryBatch(@Body('projectId') projectId: string) {
    return this.stampService.runExpiryBatch(projectId);
  }
}
