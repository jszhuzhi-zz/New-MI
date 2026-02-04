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
  ApiBody,
} from '@nestjs/swagger';
import { MemberService } from './member.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PortalGuard } from '../../common/guards/portal.guard';
import { Roles, Portal, CurrentUser } from '../../common/decorators';
import {
  CreateMemberDto,
  UpdateMemberDto,
  SearchMembersDto,
  CounterRegistrationDto,
  TierChangeDto,
  SpecialListEntryDto,
  ImportMembersDto,
} from './dto';

@ApiTags('Members')
@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard, PortalGuard)
@ApiBearerAuth('JWT-auth')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  // ─── CRUD ──────────────────────────────────────────────────────────────────

  @Post()
  @Portal('customer', 'mall', 'group')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new member',
    description: 'Register a new member. Can be self-registration (customer) or operator-created (mall/group).',
  })
  @ApiBody({ type: CreateMemberDto })
  @ApiResponse({ status: 201, description: 'Member created successfully.' })
  @ApiResponse({ status: 409, description: 'Phone number already registered.' })
  async createMember(@Body() dto: CreateMemberDto) {
    return this.memberService.createMember(dto);
  }

  @Get('search')
  @Roles('group_admin', 'mall_admin', 'mall_operator')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Search members',
    description: 'Search and filter members with pagination. Supports keyword search, tier, status, date range filters.',
  })
  @ApiResponse({ status: 200, description: 'Paginated member search results.' })
  async searchMembers(@Query() dto: SearchMembersDto) {
    return this.memberService.searchMembers(dto);
  }

  @Get(':id')
  @Portal('customer', 'mall', 'group')
  @ApiOperation({
    summary: 'Get member by ID',
    description: 'Retrieve full member profile including stamp balance, tier history, and special list entries.',
  })
  @ApiParam({ name: 'id', description: 'Member ID' })
  @ApiResponse({ status: 200, description: 'Member profile.' })
  @ApiResponse({ status: 404, description: 'Member not found.' })
  async getMember(@Param('id') id: string) {
    return this.memberService.getMemberById(id);
  }

  @Put(':id')
  @Portal('customer', 'mall', 'group')
  @ApiOperation({
    summary: 'Update member profile',
    description: 'Update member profile fields. Changes are logged in the change history.',
  })
  @ApiParam({ name: 'id', description: 'Member ID' })
  @ApiBody({ type: UpdateMemberDto })
  @ApiResponse({ status: 200, description: 'Member updated successfully.' })
  @ApiResponse({ status: 404, description: 'Member not found.' })
  async updateMember(@Param('id') id: string, @Body() dto: UpdateMemberDto) {
    return this.memberService.updateMember(id, dto);
  }

  @Delete(':id')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Deactivate member',
    description: 'Soft-delete (deactivate) a member account. Requires a reason.',
  })
  @ApiParam({ name: 'id', description: 'Member ID' })
  @ApiQuery({ name: 'reason', required: true, description: 'Reason for deactivation' })
  @ApiResponse({ status: 200, description: 'Member deactivated.' })
  @ApiResponse({ status: 404, description: 'Member not found.' })
  async deleteMember(
    @Param('id') id: string,
    @Query('reason') reason: string,
  ) {
    return this.memberService.deleteMember(id, reason);
  }

  // ─── Counter Registration ──────────────────────────────────────────────────

  @Post('counter-registration')
  @Roles('mall_admin', 'mall_operator')
  @Portal('mall')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Counter registration',
    description: 'Register a new member at the mall counter. Operator-assisted registration.',
  })
  @ApiBody({ type: CounterRegistrationDto })
  @ApiResponse({ status: 201, description: 'Member registered at counter.' })
  @ApiResponse({ status: 409, description: 'Member already exists.' })
  async counterRegistration(
    @Body() dto: CounterRegistrationDto,
    @CurrentUser('id') operatorId: string,
  ) {
    return this.memberService.counterRegistration(dto, operatorId);
  }

  // ─── Tier Management ───────────────────────────────────────────────────────

  @Post('tier-change')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Change member tier',
    description: 'Manually adjust a member\'s tier level. Requires a reason for audit purposes.',
  })
  @ApiBody({ type: TierChangeDto })
  @ApiResponse({ status: 200, description: 'Tier changed successfully.' })
  @ApiResponse({ status: 404, description: 'Member not found.' })
  async changeTier(
    @Body() dto: TierChangeDto,
    @CurrentUser('id') operatorId: string,
  ) {
    return this.memberService.changeTier(dto, operatorId);
  }

  @Get(':id/tier-history')
  @Roles('group_admin', 'mall_admin', 'mall_operator')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Get tier history',
    description: 'Retrieve the tier change history for a member.',
  })
  @ApiParam({ name: 'id', description: 'Member ID' })
  @ApiResponse({ status: 200, description: 'Tier change history.' })
  async getTierHistory(@Param('id') id: string) {
    return this.memberService.getTierHistory(id);
  }

  // ─── Special List Management ───────────────────────────────────────────────

  @Post('special-list')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add member to special list',
    description: 'Add a member to a special list (whitelist, blacklist, VIP, watch list).',
  })
  @ApiBody({ type: SpecialListEntryDto })
  @ApiResponse({ status: 201, description: 'Member added to special list.' })
  async addToSpecialList(
    @Body() dto: SpecialListEntryDto,
    @CurrentUser('id') operatorId: string,
  ) {
    return this.memberService.addToSpecialList(dto, operatorId);
  }

  @Delete('special-list/:entryId')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Remove from special list',
    description: 'Remove a member from a special list.',
  })
  @ApiParam({ name: 'entryId', description: 'Special list entry ID' })
  @ApiResponse({ status: 200, description: 'Removed from special list.' })
  async removeFromSpecialList(
    @Param('entryId') entryId: string,
    @CurrentUser('id') operatorId: string,
  ) {
    return this.memberService.removeFromSpecialList(entryId, operatorId);
  }

  @Get(':id/special-lists')
  @Roles('group_admin', 'mall_admin', 'mall_operator')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Get special list entries',
    description: 'Get all active special list entries for a member.',
  })
  @ApiParam({ name: 'id', description: 'Member ID' })
  @ApiResponse({ status: 200, description: 'Active special list entries.' })
  async getSpecialListEntries(@Param('id') id: string) {
    return this.memberService.getSpecialListEntries(id);
  }

  // ─── Import / Export ───────────────────────────────────────────────────────

  @Post('import')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Import members',
    description: 'Import members from a CSV/Excel file. Processed asynchronously.',
  })
  @ApiBody({ type: ImportMembersDto })
  @ApiResponse({ status: 202, description: 'Import job queued.' })
  async importMembers(
    @Body() dto: ImportMembersDto,
    @CurrentUser('id') operatorId: string,
  ) {
    return this.memberService.importMembers(dto, operatorId);
  }

  @Post('export')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Export members',
    description: 'Export members to CSV/Excel based on search filters. Processed asynchronously.',
  })
  @ApiResponse({ status: 202, description: 'Export job queued.' })
  async exportMembers(
    @Body() filters: SearchMembersDto,
    @CurrentUser('id') operatorId: string,
  ) {
    return this.memberService.exportMembers(filters, operatorId);
  }

  // ─── Change Records ────────────────────────────────────────────────────────

  @Get(':id/change-records')
  @Roles('group_admin', 'mall_admin', 'mall_operator')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Get member change records',
    description: 'Retrieve the audit trail of changes made to a member\'s profile.',
  })
  @ApiParam({ name: 'id', description: 'Member ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated change records.' })
  async getChangeRecords(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.memberService.getChangeRecords(id, { page, pageSize });
  }
}
