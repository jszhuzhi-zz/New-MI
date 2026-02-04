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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SmartMarketingService } from './smart-marketing.service';

@ApiTags('Smart Marketing - 智能营销')
@ApiBearerAuth()
@Controller('smart-marketing')
export class SmartMarketingController {
  constructor(private readonly marketingService: SmartMarketingService) {}

  // ==========================================
  // Dashboard
  // ==========================================

  @Get('dashboard')
  @ApiOperation({ summary: 'Get marketing dashboard - 获取智能营销概览' })
  async getDashboard(@Query('projectId') projectId?: string) {
    return this.marketingService.getDashboard(projectId);
  }

  // ==========================================
  // Auto-Tag Rules (自动打标签规则)
  // ==========================================

  @Get('auto-tag-rules')
  @ApiOperation({ summary: 'List auto-tag rules - 获取自动打标签规则列表' })
  async listAutoTagRules(
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.marketingService.listAutoTagRules({ projectId, status, page, pageSize });
  }

  @Get('auto-tag-rules/:id')
  @ApiOperation({ summary: 'Get auto-tag rule detail - 获取自动打标签规则详情' })
  async getAutoTagRule(@Param('id') id: string) {
    return this.marketingService.getAutoTagRule(id);
  }

  @Post('auto-tag-rules')
  @ApiOperation({ summary: 'Create auto-tag rule - 创建自动打标签规则' })
  async createAutoTagRule(@Body() body: any) {
    return this.marketingService.createAutoTagRule(body);
  }

  @Put('auto-tag-rules/:id')
  @ApiOperation({ summary: 'Update auto-tag rule - 更新自动打标签规则' })
  async updateAutoTagRule(@Param('id') id: string, @Body() body: any) {
    return this.marketingService.updateAutoTagRule(id, body);
  }

  @Delete('auto-tag-rules/:id')
  @ApiOperation({ summary: 'Delete auto-tag rule - 删除自动打标签规则' })
  async deleteAutoTagRule(@Param('id') id: string) {
    return this.marketingService.deleteAutoTagRule(id);
  }

  @Post('auto-tag-rules/:id/execute')
  @ApiOperation({ summary: 'Manually execute auto-tag rule - 手动执行自动打标签规则' })
  async executeAutoTagRule(@Param('id') id: string) {
    return this.marketingService.executeAutoTagRule(id);
  }

  // ==========================================
  // Marketing Triggers (营销触发器)
  // ==========================================

  @Get('triggers')
  @ApiOperation({ summary: 'List marketing triggers - 获取营销触发器列表' })
  async listTriggers(
    @Query('projectId') projectId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.marketingService.listTriggers({ projectId, type, status, page, pageSize });
  }

  @Get('triggers/:id')
  @ApiOperation({ summary: 'Get trigger detail - 获取触发器详情' })
  async getTrigger(@Param('id') id: string) {
    return this.marketingService.getTrigger(id);
  }

  @Post('triggers')
  @ApiOperation({ summary: 'Create marketing trigger - 创建营销触发器' })
  async createTrigger(@Body() body: any) {
    return this.marketingService.createTrigger(body);
  }

  @Put('triggers/:id')
  @ApiOperation({ summary: 'Update marketing trigger - 更新营销触发器' })
  async updateTrigger(@Param('id') id: string, @Body() body: any) {
    return this.marketingService.updateTrigger(id, body);
  }

  @Delete('triggers/:id')
  @ApiOperation({ summary: 'Delete marketing trigger - 删除营销触发器' })
  async deleteTrigger(@Param('id') id: string) {
    return this.marketingService.deleteTrigger(id);
  }

  @Post('triggers/:id/activate')
  @ApiOperation({ summary: 'Activate trigger - 激活触发器' })
  async activateTrigger(@Param('id') id: string) {
    return this.marketingService.activateTrigger(id);
  }

  @Post('triggers/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate trigger - 停用触发器' })
  async deactivateTrigger(@Param('id') id: string) {
    return this.marketingService.deactivateTrigger(id);
  }

  @Get('triggers/:id/stats')
  @ApiOperation({ summary: 'Get trigger execution stats - 获取触发器执行统计' })
  async getTriggerStats(@Param('id') id: string) {
    return this.marketingService.getTriggerStats(id);
  }

  // ==========================================
  // Member Segments (会员分群)
  // ==========================================

  @Get('segments')
  @ApiOperation({ summary: 'List member segments - 获取会员分群列表' })
  async listSegments(
    @Query('projectId') projectId?: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.marketingService.listSegments({ projectId, page, pageSize });
  }

  @Get('segments/:id')
  @ApiOperation({ summary: 'Get segment detail - 获取分群详情' })
  async getSegment(@Param('id') id: string) {
    return this.marketingService.getSegment(id);
  }

  @Post('segments')
  @ApiOperation({ summary: 'Create member segment - 创建会员分群' })
  async createSegment(@Body() body: any) {
    return this.marketingService.createSegment(body);
  }

  @Put('segments/:id')
  @ApiOperation({ summary: 'Update member segment - 更新会员分群' })
  async updateSegment(@Param('id') id: string, @Body() body: any) {
    return this.marketingService.updateSegment(id, body);
  }

  @Delete('segments/:id')
  @ApiOperation({ summary: 'Delete member segment - 删除会员分群' })
  async deleteSegment(@Param('id') id: string) {
    return this.marketingService.deleteSegment(id);
  }

  @Post('segments/:id/refresh')
  @ApiOperation({ summary: 'Refresh segment member count - 刷新分群人数' })
  async refreshSegment(@Param('id') id: string) {
    return this.marketingService.refreshSegment(id);
  }

  @Get('segments/:id/members')
  @ApiOperation({ summary: 'List segment members - 获取分群会员列表' })
  async listSegmentMembers(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.marketingService.listSegmentMembers(id, { page, pageSize });
  }

  // ==========================================
  // Member Journeys (会员旅程)
  // ==========================================

  @Get('journeys')
  @ApiOperation({ summary: 'List member journeys - 获取会员旅程列表' })
  async listJourneys(
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.marketingService.listJourneys({ projectId, status, page, pageSize });
  }

  @Get('journeys/:id')
  @ApiOperation({ summary: 'Get journey detail - 获取旅程详情' })
  async getJourney(@Param('id') id: string) {
    return this.marketingService.getJourney(id);
  }

  @Post('journeys')
  @ApiOperation({ summary: 'Create member journey - 创建会员旅程' })
  async createJourney(@Body() body: any) {
    return this.marketingService.createJourney(body);
  }

  @Put('journeys/:id')
  @ApiOperation({ summary: 'Update member journey - 更新会员旅程' })
  async updateJourney(@Param('id') id: string, @Body() body: any) {
    return this.marketingService.updateJourney(id, body);
  }

  @Delete('journeys/:id')
  @ApiOperation({ summary: 'Delete member journey - 删除会员旅程' })
  async deleteJourney(@Param('id') id: string) {
    return this.marketingService.deleteJourney(id);
  }

  @Post('journeys/:id/activate')
  @ApiOperation({ summary: 'Activate journey - 激活旅程' })
  async activateJourney(@Param('id') id: string) {
    return this.marketingService.activateJourney(id);
  }

  @Post('journeys/:id/pause')
  @ApiOperation({ summary: 'Pause journey - 暂停旅程' })
  async pauseJourney(@Param('id') id: string) {
    return this.marketingService.pauseJourney(id);
  }

  // ==========================================
  // Event Processing (事件处理)
  // ==========================================

  @Post('events')
  @ApiOperation({ summary: 'Process marketing event - 处理营销事件 (internal)' })
  async processEvent(@Body() body: { eventType: string; memberId: string; data: any }) {
    return this.marketingService.processEvent(body);
  }
}
