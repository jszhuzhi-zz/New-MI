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
import { OrganizationService } from './organization.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PortalGuard } from '../../common/guards/portal.guard';
import { Roles, Portal } from '../../common/decorators';

@ApiTags('Organization')
@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard, PortalGuard)
@ApiBearerAuth('JWT-auth')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  // ─── Groups ────────────────────────────────────────────────────────────────

  @Get('groups')
  @Roles('super_admin', 'group_admin')
  @Portal('group')
  @ApiOperation({
    summary: 'List all groups',
    description: 'Retrieve a paginated list of all groups with optional search and status filter.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name or code' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status' })
  @ApiResponse({ status: 200, description: 'Paginated list of groups.' })
  async listGroups(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.organizationService.listGroups({ page, pageSize, search, status });
  }

  @Get('groups/:id')
  @Roles('super_admin', 'group_admin', 'mall_admin')
  @Portal('group', 'mall')
  @ApiOperation({
    summary: 'Get group by ID',
    description: 'Retrieve a single group with its projects and organizational units.',
  })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({ status: 200, description: 'Group details.' })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  async getGroup(@Param('id') id: string) {
    return this.organizationService.getGroupById(id);
  }

  @Post('groups')
  @Roles('super_admin')
  @Portal('group')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new group',
    description: 'Create a new group in the organization hierarchy.',
  })
  @ApiResponse({ status: 201, description: 'Group created successfully.' })
  @ApiResponse({ status: 409, description: 'Group code already exists.' })
  async createGroup(
    @Body() data: { code: string; nameZhHk: string; nameZhCn?: string; nameEn?: string; description?: string },
  ) {
    return this.organizationService.createGroup(data);
  }

  @Put('groups/:id')
  @Roles('super_admin', 'group_admin')
  @Portal('group')
  @ApiOperation({
    summary: 'Update a group',
    description: 'Update an existing group\'s details.',
  })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({ status: 200, description: 'Group updated successfully.' })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  async updateGroup(@Param('id') id: string, @Body() data: Record<string, any>) {
    return this.organizationService.updateGroup(id, data);
  }

  @Delete('groups/:id')
  @Roles('super_admin')
  @Portal('group')
  @ApiOperation({
    summary: 'Delete a group',
    description: 'Soft-delete a group. Associated resources will be archived.',
  })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({ status: 200, description: 'Group deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  async deleteGroup(@Param('id') id: string) {
    return this.organizationService.deleteGroup(id);
  }

  // ─── Org Units ─────────────────────────────────────────────────────────────

  @Get('org-units')
  @Roles('super_admin', 'group_admin', 'mall_admin')
  @Portal('group', 'mall')
  @ApiOperation({
    summary: 'List organizational units',
    description: 'List org units with optional group, project, and parent filters.',
  })
  @ApiQuery({ name: 'groupId', required: false, type: String })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'parentId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of organizational units.' })
  async listOrgUnits(
    @Query('groupId') groupId?: string,
    @Query('projectId') projectId?: string,
    @Query('parentId') parentId?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.organizationService.listOrgUnits({ groupId, projectId, parentId, page, pageSize });
  }

  @Post('org-units')
  @Roles('super_admin', 'group_admin')
  @Portal('group')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create organizational unit',
    description: 'Create a new organizational unit within a group hierarchy.',
  })
  @ApiResponse({ status: 201, description: 'Org unit created.' })
  async createOrgUnit(
    @Body() data: { groupId: string; projectId?: string; parentId?: string; nameZhHk: string; nameZhCn?: string; nameEn?: string; type: string },
  ) {
    return this.organizationService.createOrgUnit(data);
  }

  @Put('org-units/:id')
  @Roles('super_admin', 'group_admin')
  @Portal('group')
  @ApiOperation({
    summary: 'Update organizational unit',
    description: 'Update an existing organizational unit.',
  })
  @ApiParam({ name: 'id', description: 'Org unit ID' })
  @ApiResponse({ status: 200, description: 'Org unit updated.' })
  async updateOrgUnit(@Param('id') id: string, @Body() data: Record<string, any>) {
    return this.organizationService.updateOrgUnit(id, data);
  }

  @Delete('org-units/:id')
  @Roles('super_admin', 'group_admin')
  @Portal('group')
  @ApiOperation({
    summary: 'Delete organizational unit',
    description: 'Delete an org unit. Fails if it has children.',
  })
  @ApiParam({ name: 'id', description: 'Org unit ID' })
  @ApiResponse({ status: 200, description: 'Org unit deleted.' })
  @ApiResponse({ status: 409, description: 'Cannot delete org unit with children.' })
  async deleteOrgUnit(@Param('id') id: string) {
    return this.organizationService.deleteOrgUnit(id);
  }

  // ─── Architecture Configuration ────────────────────────────────────────────

  @Get('groups/:groupId/architecture')
  @Roles('super_admin', 'group_admin')
  @Portal('group')
  @ApiOperation({
    summary: 'Get architecture configuration',
    description: 'Get the architecture configuration for a group including hierarchy levels, tiers, and rule templates.',
  })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiResponse({ status: 200, description: 'Architecture configuration.' })
  async getArchitectureConfig(@Param('groupId') groupId: string) {
    return this.organizationService.getArchitectureConfig(groupId);
  }

  @Put('groups/:groupId/architecture')
  @Roles('super_admin', 'group_admin')
  @Portal('group')
  @ApiOperation({
    summary: 'Update architecture configuration',
    description: 'Update the architecture configuration for a group.',
  })
  @ApiParam({ name: 'groupId', description: 'Group ID' })
  @ApiResponse({ status: 200, description: 'Architecture configuration updated.' })
  async updateArchitectureConfig(
    @Param('groupId') groupId: string,
    @Body() config: Record<string, any>,
  ) {
    return this.organizationService.updateArchitectureConfig(groupId, config);
  }
}
