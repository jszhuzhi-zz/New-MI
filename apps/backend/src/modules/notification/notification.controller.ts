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
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PortalGuard } from '../../common/guards/portal.guard';
import { Roles, Portal, CurrentUser } from '../../common/decorators';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard, PortalGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // ─── Push Notifications ────────────────────────────────────────────────────

  @Post('push')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Send push notification',
    description: 'Send a push notification to a specific member with localized content.',
  })
  @ApiResponse({ status: 201, description: 'Notification sent.' })
  @ApiResponse({ status: 404, description: 'Member not found or no device registered.' })
  async sendPushNotification(@Body() data: any) {
    return this.notificationService.sendPushNotification(data);
  }

  @Post('push/batch')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Send batch push notification',
    description: 'Send push notifications to a member segment. Processed asynchronously.',
  })
  @ApiResponse({ status: 202, description: 'Batch notification queued.' })
  async sendBatchPush(
    @Body() data: any,
    @CurrentUser('id') operatorId: string,
  ) {
    return this.notificationService.sendBatchPushNotification({ ...data, operatorId });
  }

  @Get()
  @Portal('customer', 'mall', 'group')
  @ApiOperation({
    summary: 'List notifications',
    description: 'List sent notifications with filters for project, member, type, and channel.',
  })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'memberId', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'info | promotion | transaction | reminder | alert' })
  @ApiQuery({ name: 'channel', required: false, type: String, description: 'push | sms | email' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of notifications.' })
  async listNotifications(
    @Query('projectId') projectId?: string,
    @Query('memberId') memberId?: string,
    @Query('type') type?: string,
    @Query('channel') channel?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.notificationService.listNotifications({
      projectId, memberId, type, channel, status, page, pageSize,
    });
  }

  // ─── SMS ───────────────────────────────────────────────────────────────────

  @Post('sms')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Send SMS',
    description: 'Send an SMS message to a phone number. Can use a template with variables.',
  })
  @ApiResponse({ status: 201, description: 'SMS sent.' })
  @ApiResponse({ status: 400, description: 'Rate limit exceeded.' })
  async sendSms(@Body() data: any) {
    return this.notificationService.sendSms(data);
  }

  @Post('sms/batch')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Send batch SMS',
    description: 'Send SMS messages to multiple recipients using a template. Processed asynchronously.',
  })
  @ApiResponse({ status: 202, description: 'Batch SMS queued.' })
  async sendBatchSms(
    @Body() data: any,
    @CurrentUser('id') operatorId: string,
  ) {
    return this.notificationService.sendBatchSms({ ...data, operatorId });
  }

  @Get('sms/:id/status')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Get SMS delivery status',
    description: 'Check the delivery status of a sent SMS.',
  })
  @ApiParam({ name: 'id', description: 'SMS ID' })
  @ApiResponse({ status: 200, description: 'SMS delivery status.' })
  async getSmsStatus(@Param('id') id: string) {
    return this.notificationService.getSmsStatus(id);
  }

  // ─── Templates ─────────────────────────────────────────────────────────────

  @Get('templates')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'List notification templates',
    description: 'List notification templates with filters for channel and type.',
  })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'channel', required: false, type: String, description: 'push | sms | email' })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of templates.' })
  async listTemplates(
    @Query('projectId') projectId?: string,
    @Query('channel') channel?: string,
    @Query('type') type?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.notificationService.listTemplates({ projectId, channel, type, page, pageSize });
  }

  @Get('templates/:id')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Get template by ID',
    description: 'Get notification template details.',
  })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Template details.' })
  @ApiResponse({ status: 404, description: 'Template not found.' })
  async getTemplate(@Param('id') id: string) {
    return this.notificationService.getTemplateById(id);
  }

  @Post('templates')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create notification template',
    description: 'Create a new notification template with localized content and variable placeholders.',
  })
  @ApiResponse({ status: 201, description: 'Template created.' })
  async createTemplate(@Body() data: any) {
    return this.notificationService.createTemplate(data);
  }

  @Put('templates/:id')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Update notification template',
    description: 'Update an existing notification template.',
  })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Template updated.' })
  async updateTemplate(@Param('id') id: string, @Body() data: any) {
    return this.notificationService.updateTemplate(id, data);
  }

  @Delete('templates/:id')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Delete notification template',
    description: 'Soft-delete a notification template.',
  })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Template deleted.' })
  async deleteTemplate(@Param('id') id: string) {
    return this.notificationService.deleteTemplate(id);
  }

  // ─── Interface Monitoring ──────────────────────────────────────────────────

  @Get('monitoring')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Get interface monitoring dashboard',
    description: 'Monitor SMS delivery rates, push notification success rates, and third-party API health.',
  })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: true, type: String })
  @ApiQuery({ name: 'dateTo', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Interface monitoring data.' })
  async getMonitoring(
    @Query('projectId') projectId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.notificationService.getInterfaceMonitoring({
      projectId,
      dateFrom: dateFrom || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      dateTo: dateTo || new Date().toISOString(),
    });
  }

  @Get('monitoring/errors')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Get interface error logs',
    description: 'View error logs from notification interfaces (SMS provider, push services).',
  })
  @ApiQuery({ name: 'provider', required: false, type: String, description: 'sms | push | m365' })
  @ApiQuery({ name: 'dateFrom', required: true, type: String })
  @ApiQuery({ name: 'dateTo', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Interface error logs.' })
  async getInterfaceErrors(
    @Query('provider') provider?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.notificationService.getInterfaceErrors({
      provider,
      dateFrom: dateFrom || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      dateTo: dateTo || new Date().toISOString(),
      page,
      pageSize,
    });
  }
}
