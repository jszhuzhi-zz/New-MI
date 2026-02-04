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
import { CampaignService } from './campaign.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PortalGuard } from '../../common/guards/portal.guard';
import { Roles, Portal, CurrentUser } from '../../common/decorators';

@ApiTags('Campaigns')
@Controller('campaigns')
@UseGuards(JwtAuthGuard, RolesGuard, PortalGuard)
@ApiBearerAuth('JWT-auth')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  // ─── Campaign CRUD ─────────────────────────────────────────────────────────

  @Get()
  @Portal('customer', 'mall', 'group')
  @ApiOperation({
    summary: 'List campaigns',
    description: 'List campaigns with optional filters for project, type, status, and search.',
  })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'coupon | lucky_draw | gift | stamp_bonus' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'draft | scheduled | active | completed | cancelled' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of campaigns.' })
  async listCampaigns(
    @Query('projectId') projectId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.campaignService.listCampaigns({ projectId, type, status, search, page, pageSize });
  }

  @Get(':id')
  @Portal('customer', 'mall', 'group')
  @ApiOperation({
    summary: 'Get campaign by ID',
    description: 'Get full campaign details including coupons, lucky draw config, and gifts.',
  })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Campaign details.' })
  @ApiResponse({ status: 404, description: 'Campaign not found.' })
  async getCampaign(@Param('id') id: string) {
    return this.campaignService.getCampaignById(id);
  }

  @Post()
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create campaign',
    description: 'Create a new campaign (coupon, lucky draw, gift, or stamp bonus).',
  })
  @ApiResponse({ status: 201, description: 'Campaign created in draft status.' })
  async createCampaign(@Body() data: any) {
    return this.campaignService.createCampaign(data);
  }

  @Put(':id')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Update campaign',
    description: 'Update campaign details. Only available for draft/scheduled campaigns.',
  })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Campaign updated.' })
  @ApiResponse({ status: 400, description: 'Cannot modify completed campaigns.' })
  async updateCampaign(@Param('id') id: string, @Body() data: any) {
    return this.campaignService.updateCampaign(id, data);
  }

  @Put(':id/status')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Update campaign status',
    description: 'Transition campaign status (draft -> scheduled -> active -> completed).',
  })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Campaign status updated.' })
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.campaignService.updateCampaignStatus(id, status);
  }

  @Delete(':id')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Cancel campaign',
    description: 'Cancel a campaign. Active coupons/draws will be invalidated.',
  })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Campaign cancelled.' })
  async deleteCampaign(@Param('id') id: string) {
    return this.campaignService.deleteCampaign(id);
  }

  // ─── Coupons ───────────────────────────────────────────────────────────────

  @Get(':id/coupons')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'List campaign coupons',
    description: 'List coupons generated for a campaign.',
  })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of coupons.' })
  async listCoupons(
    @Param('id') id: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.campaignService.listCoupons(id, { status, page, pageSize });
  }

  @Post(':id/coupons/generate')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Generate coupons',
    description: 'Batch generate coupon codes for a campaign.',
  })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 201, description: 'Coupons generated.' })
  async generateCoupons(@Param('id') id: string, @Body() data: any) {
    return this.campaignService.generateCoupons(id, data);
  }

  @Post('coupons/:couponId/assign')
  @Roles('group_admin', 'mall_admin', 'mall_operator')
  @Portal('mall', 'group')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Assign coupon to member',
    description: 'Assign an available coupon to a specific member.',
  })
  @ApiParam({ name: 'couponId', description: 'Coupon ID' })
  @ApiResponse({ status: 200, description: 'Coupon assigned.' })
  async assignCoupon(
    @Param('couponId') couponId: string,
    @Body('memberId') memberId: string,
  ) {
    return this.campaignService.assignCoupon(couponId, memberId);
  }

  @Post('coupons/redeem')
  @Portal('customer', 'mall', 'merchant')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Redeem coupon',
    description: 'Redeem a coupon using its code.',
  })
  @ApiResponse({ status: 200, description: 'Coupon redeemed.' })
  @ApiResponse({ status: 400, description: 'Invalid, expired, or already redeemed coupon.' })
  async redeemCoupon(
    @Body() data: { couponCode: string; memberId: string; transactionData?: Record<string, any> },
  ) {
    return this.campaignService.redeemCoupon(data.couponCode, data.memberId, data.transactionData);
  }

  // ─── Lucky Draws ───────────────────────────────────────────────────────────

  @Get(':id/lucky-draw')
  @Portal('customer', 'mall', 'group')
  @ApiOperation({
    summary: 'Get lucky draw configuration',
    description: 'Get lucky draw setup for a campaign including prizes and rules.',
  })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Lucky draw configuration.' })
  async getLuckyDraw(@Param('id') id: string) {
    return this.campaignService.getLuckyDrawConfig(id);
  }

  @Post(':id/lucky-draw/configure')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Configure lucky draw',
    description: 'Set up or update lucky draw prizes and rules for a campaign.',
  })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 201, description: 'Lucky draw configured.' })
  async configureLuckyDraw(@Param('id') id: string, @Body() data: any) {
    return this.campaignService.configureLuckyDraw(id, data);
  }

  @Post(':id/lucky-draw/execute')
  @Portal('customer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Execute lucky draw',
    description: 'Execute a lucky draw for a member. Deducts stamps and returns the result.',
  })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Lucky draw result.' })
  @ApiResponse({ status: 400, description: 'Insufficient stamps or draws exhausted.' })
  async executeLuckyDraw(
    @Param('id') id: string,
    @CurrentUser('id') memberId: string,
  ) {
    return this.campaignService.executeLuckyDraw(id, memberId);
  }

  @Get(':id/lucky-draw/results')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Get lucky draw results',
    description: 'Get lucky draw results and winner list.',
  })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lucky draw results.' })
  async getLuckyDrawResults(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.campaignService.getLuckyDrawResults(id, { page, pageSize });
  }

  // ─── Gifts ─────────────────────────────────────────────────────────────────

  @Get(':id/gifts')
  @Portal('customer', 'mall', 'group')
  @ApiOperation({
    summary: 'List campaign gifts',
    description: 'List available gifts for a campaign with stock information.',
  })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'List of gifts.' })
  async listGifts(@Param('id') id: string) {
    return this.campaignService.listGifts(id);
  }

  @Post(':id/gifts')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create campaign gift',
    description: 'Add a new gift to a campaign with stock and stamp cost configuration.',
  })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 201, description: 'Gift created.' })
  async createGift(@Param('id') id: string, @Body() data: any) {
    return this.campaignService.createGift(id, data);
  }

  @Post('gifts/:giftId/redeem')
  @Portal('customer', 'mall')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Redeem gift',
    description: 'Redeem a gift using stamps. Checks stock, per-member limits, and stamp balance.',
  })
  @ApiParam({ name: 'giftId', description: 'Gift ID' })
  @ApiResponse({ status: 200, description: 'Gift redeemed.' })
  @ApiResponse({ status: 400, description: 'Insufficient stamps, out of stock, or limit reached.' })
  async redeemGift(
    @Param('giftId') giftId: string,
    @CurrentUser('id') memberId: string,
  ) {
    return this.campaignService.redeemGift(giftId, memberId);
  }

  @Get('gifts/:giftId/redemptions')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Get gift redemptions',
    description: 'Get redemption history for a specific gift.',
  })
  @ApiParam({ name: 'giftId', description: 'Gift ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Gift redemption history.' })
  async getGiftRedemptions(
    @Param('giftId') giftId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.campaignService.getGiftRedemptions(giftId, { page, pageSize });
  }
}
