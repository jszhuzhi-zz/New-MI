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
import { RiskControlService } from './risk-control.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PortalGuard } from '../../common/guards/portal.guard';
import { Roles, Portal, CurrentUser } from '../../common/decorators';

@ApiTags('Risk Control')
@Controller('risk-control')
@UseGuards(JwtAuthGuard, RolesGuard, PortalGuard)
@ApiBearerAuth('JWT-auth')
export class RiskControlController {
  constructor(private readonly riskControlService: RiskControlService) {}

  // ─── Dashboard ─────────────────────────────────────────────────────────────

  @Get('dashboard')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Get risk dashboard',
    description: 'Overview of risk metrics including active alerts, suspicious patterns, and risk scores.',
  })
  @ApiQuery({ name: 'projectId', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Risk dashboard data.' })
  async getDashboard(@Query('projectId') projectId: string) {
    return this.riskControlService.getDashboard(projectId);
  }

  // ─── Alerts ────────────────────────────────────────────────────────────────

  @Get('alerts')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'List risk alerts',
    description: 'List risk alerts with filtering by severity, status, and date range.',
  })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'severity', required: false, type: String, description: 'low | medium | high | critical' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'active | resolved | rejected | escalated' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of risk alerts.' })
  async listAlerts(
    @Query('projectId') projectId?: string,
    @Query('severity') severity?: string,
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.riskControlService.listAlerts({
      projectId, severity, status, dateFrom, dateTo, page, pageSize,
    });
  }

  @Get('alerts/:id')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Get alert details',
    description: 'Get full details of a risk alert including related member, merchant, and transaction data.',
  })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiResponse({ status: 200, description: 'Alert details.' })
  @ApiResponse({ status: 404, description: 'Alert not found.' })
  async getAlert(@Param('id') id: string) {
    return this.riskControlService.getAlertById(id);
  }

  @Post('alerts/:id/review')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Review and resolve alert',
    description: 'Review a risk alert and make a decision: approve (false positive), reject (confirmed risk), or escalate.',
  })
  @ApiParam({ name: 'id', description: 'Alert ID' })
  @ApiResponse({ status: 200, description: 'Alert reviewed.' })
  @ApiResponse({ status: 404, description: 'Alert not found.' })
  async reviewAlert(
    @Param('id') id: string,
    @Body() data: { decision: string; notes: string },
    @CurrentUser('id') reviewerId: string,
  ) {
    return this.riskControlService.reviewAlert(id, {
      ...data,
      reviewerId,
    });
  }

  // ─── Rules ─────────────────────────────────────────────────────────────────

  @Get('rules')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'List risk control rules',
    description: 'List all active risk control rules for a project.',
  })
  @ApiQuery({ name: 'projectId', required: true, type: String })
  @ApiResponse({ status: 200, description: 'List of risk rules.' })
  async listRules(@Query('projectId') projectId: string) {
    return this.riskControlService.listRules(projectId);
  }

  @Post('rules')
  @Roles('group_admin')
  @Portal('group')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create risk control rule',
    description: 'Create a new risk control rule (velocity, amount, pattern, device, or location based).',
  })
  @ApiResponse({ status: 201, description: 'Risk rule created.' })
  async createRule(@Body() data: any) {
    return this.riskControlService.createRule(data);
  }

  @Put('rules/:id')
  @Roles('group_admin')
  @Portal('group')
  @ApiOperation({
    summary: 'Update risk control rule',
    description: 'Update an existing risk control rule.',
  })
  @ApiParam({ name: 'id', description: 'Rule ID' })
  @ApiResponse({ status: 200, description: 'Risk rule updated.' })
  async updateRule(@Param('id') id: string, @Body() data: any) {
    return this.riskControlService.updateRule(id, data);
  }

  @Delete('rules/:id')
  @Roles('group_admin')
  @Portal('group')
  @ApiOperation({
    summary: 'Delete risk control rule',
    description: 'Soft-delete a risk control rule.',
  })
  @ApiParam({ name: 'id', description: 'Rule ID' })
  @ApiResponse({ status: 200, description: 'Risk rule deleted.' })
  async deleteRule(@Param('id') id: string) {
    return this.riskControlService.deleteRule(id);
  }

  // ─── Anomaly Detection ────────────────────────────────────────────────────

  @Post('anomaly-detection')
  @Roles('group_admin')
  @Portal('group')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Run anomaly detection',
    description: 'Trigger anomaly detection analysis on recent transactions.',
  })
  @ApiResponse({ status: 202, description: 'Anomaly detection started.' })
  async runAnomalyDetection(@Body('projectId') projectId: string) {
    return this.riskControlService.runAnomalyDetection(projectId);
  }

  @Get('anomaly-results')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Get anomaly detection results',
    description: 'Retrieve results from anomaly detection analyses.',
  })
  @ApiQuery({ name: 'projectId', required: true, type: String })
  @ApiQuery({ name: 'dateFrom', required: true, type: String })
  @ApiQuery({ name: 'dateTo', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Anomaly detection results.' })
  async getAnomalyResults(
    @Query('projectId') projectId: string,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.riskControlService.getAnomalyResults({
      projectId, dateFrom, dateTo, page, pageSize,
    });
  }
}
