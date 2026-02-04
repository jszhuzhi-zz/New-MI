import {
  Controller,
  Get,
  Post,
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
import { ReportService } from './report.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PortalGuard } from '../../common/guards/portal.guard';
import { Roles, Portal, CurrentUser } from '../../common/decorators';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard, PortalGuard)
@ApiBearerAuth('JWT-auth')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // ─── Report Types ──────────────────────────────────────────────────────────

  @Get('membership')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Get membership report',
    description: 'Generate membership statistics including registrations, tier distribution, retention, and demographics.',
  })
  @ApiQuery({ name: 'projectId', required: true, type: String })
  @ApiQuery({ name: 'dateFrom', required: true, type: String })
  @ApiQuery({ name: 'dateTo', required: true, type: String })
  @ApiQuery({ name: 'groupBy', required: false, type: String, description: 'daily | weekly | monthly' })
  @ApiResponse({ status: 200, description: 'Membership statistics report.' })
  async getMembershipReport(
    @Query('projectId') projectId: string,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
    @Query('groupBy') groupBy?: string,
  ) {
    return this.reportService.generateMembershipReport({ projectId, dateFrom, dateTo, groupBy });
  }

  @Get('stamps')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Get stamp transaction report',
    description: 'Generate stamp transaction statistics including issuance, consumption, expiry by merchant and rule.',
  })
  @ApiQuery({ name: 'projectId', required: true, type: String })
  @ApiQuery({ name: 'dateFrom', required: true, type: String })
  @ApiQuery({ name: 'dateTo', required: true, type: String })
  @ApiQuery({ name: 'groupBy', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Stamp transaction report.' })
  async getStampReport(
    @Query('projectId') projectId: string,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
    @Query('groupBy') groupBy?: string,
  ) {
    return this.reportService.generateStampReport({ projectId, dateFrom, dateTo, groupBy });
  }

  @Get('campaigns')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Get campaign performance report',
    description: 'Generate campaign performance report including participation, redemption rates, and ROI.',
  })
  @ApiQuery({ name: 'projectId', required: true, type: String })
  @ApiQuery({ name: 'campaignId', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: true, type: String })
  @ApiQuery({ name: 'dateTo', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Campaign performance report.' })
  async getCampaignReport(
    @Query('projectId') projectId: string,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
    @Query('campaignId') campaignId?: string,
  ) {
    return this.reportService.generateCampaignReport({ projectId, campaignId, dateFrom, dateTo });
  }

  @Get('merchants')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Get merchant performance report',
    description: 'Generate merchant performance report with transaction volumes, stamp issuance, and rankings.',
  })
  @ApiQuery({ name: 'projectId', required: true, type: String })
  @ApiQuery({ name: 'merchantId', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: true, type: String })
  @ApiQuery({ name: 'dateTo', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Merchant performance report.' })
  async getMerchantReport(
    @Query('projectId') projectId: string,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
    @Query('merchantId') merchantId?: string,
  ) {
    return this.reportService.generateMerchantReport({ projectId, merchantId, dateFrom, dateTo });
  }

  @Get('risk')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Get risk control report',
    description: 'Generate risk control report with alert statistics, blocked transactions, and flagged entities.',
  })
  @ApiQuery({ name: 'projectId', required: true, type: String })
  @ApiQuery({ name: 'dateFrom', required: true, type: String })
  @ApiQuery({ name: 'dateTo', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Risk control report.' })
  async getRiskReport(
    @Query('projectId') projectId: string,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
  ) {
    return this.reportService.generateRiskReport({ projectId, dateFrom, dateTo });
  }

  // ─── Download Center ───────────────────────────────────────────────────────

  @Get('downloads')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'List report downloads',
    description: 'List generated reports available for download.',
  })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'reportType', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'queued | processing | completed | failed' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of downloadable reports.' })
  async listDownloads(
    @Query('projectId') projectId?: string,
    @Query('reportType') reportType?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.reportService.listDownloads({ projectId, reportType, status, page, pageSize });
  }

  @Post('export')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Request report export',
    description: 'Request async generation of a downloadable report file (XLSX, CSV, or PDF).',
  })
  @ApiResponse({ status: 202, description: 'Report generation queued.' })
  async requestExport(
    @Body() data: {
      reportType: string;
      projectId: string;
      format: string;
      params: Record<string, any>;
    },
    @CurrentUser('id') requestedBy: string,
  ) {
    return this.reportService.requestExport({ ...data, requestedBy });
  }

  @Get('downloads/:id/url')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Get download URL',
    description: 'Get a signed download URL for a completed report.',
  })
  @ApiParam({ name: 'id', description: 'Download ID' })
  @ApiResponse({ status: 200, description: 'Signed download URL.' })
  @ApiResponse({ status: 404, description: 'Download not found.' })
  async getDownloadUrl(@Param('id') id: string) {
    return this.reportService.getDownloadUrl(id);
  }

  // ─── Operation Logs ────────────────────────────────────────────────────────

  @Get('operation-logs')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Query operation logs',
    description: 'Search audit/operation logs with filters for user, action, resource, and date range.',
  })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'action', required: false, type: String })
  @ApiQuery({ name: 'resource', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated operation logs.' })
  async queryOperationLogs(
    @Query('projectId') projectId?: string,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.reportService.queryOperationLogs({
      projectId, userId, action, resource, dateFrom, dateTo, page, pageSize,
    });
  }

  @Get('operation-logs/:id')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Get operation log detail',
    description: 'Get full details of a single operation log entry.',
  })
  @ApiParam({ name: 'id', description: 'Log entry ID' })
  @ApiResponse({ status: 200, description: 'Operation log details.' })
  @ApiResponse({ status: 404, description: 'Log entry not found.' })
  async getOperationLog(@Param('id') id: string) {
    return this.reportService.getOperationLogById(id);
  }
}
