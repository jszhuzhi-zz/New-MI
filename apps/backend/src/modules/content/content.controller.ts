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
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PortalGuard } from '../../common/guards/portal.guard';
import { Roles, Portal, CurrentUser, Locale } from '../../common/decorators';

@ApiTags('Content')
@Controller('content')
@UseGuards(JwtAuthGuard, RolesGuard, PortalGuard)
@ApiBearerAuth('JWT-auth')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // ─── Articles ──────────────────────────────────────────────────────────────

  @Get('articles')
  @Portal('customer', 'mall', 'group')
  @ApiOperation({
    summary: 'List articles',
    description: 'List articles with optional filters for project, category, and status.',
  })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of articles.' })
  async listArticles(
    @Locale() locale: string,
    @Query('projectId') projectId?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.contentService.listArticles({ projectId, category, status, locale, page, pageSize });
  }

  @Get('articles/:id')
  @Portal('customer', 'mall', 'group')
  @ApiOperation({
    summary: 'Get article by ID',
    description: 'Get article with content localized to the Accept-Language header.',
  })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({ status: 200, description: 'Article details.' })
  @ApiResponse({ status: 404, description: 'Article not found.' })
  async getArticle(@Param('id') id: string, @Locale() locale: string) {
    return this.contentService.getArticleById(id, locale);
  }

  @Post('articles')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create article',
    description: 'Create a new article with multi-language content.',
  })
  @ApiResponse({ status: 201, description: 'Article created in draft status.' })
  async createArticle(
    @Body() data: any,
    @CurrentUser('id') authorId: string,
  ) {
    return this.contentService.createArticle({ ...data, authorId });
  }

  @Put('articles/:id')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Update article',
    description: 'Update article content and metadata.',
  })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({ status: 200, description: 'Article updated.' })
  async updateArticle(@Param('id') id: string, @Body() data: any) {
    return this.contentService.updateArticle(id, data);
  }

  @Put('articles/:id/status')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Publish/unpublish article',
    description: 'Change article publication status.',
  })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({ status: 200, description: 'Article status updated.' })
  async updateArticleStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.contentService.updateArticleStatus(id, status);
  }

  @Delete('articles/:id')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Delete article',
    description: 'Soft-delete an article.',
  })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({ status: 200, description: 'Article deleted.' })
  async deleteArticle(@Param('id') id: string) {
    return this.contentService.deleteArticle(id);
  }

  // ─── Banners ───────────────────────────────────────────────────────────────

  @Get('banners')
  @Portal('customer', 'mall', 'group')
  @ApiOperation({
    summary: 'List banners',
    description: 'List banners with optional position and status filters.',
  })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'position', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of banners.' })
  async listBanners(
    @Query('projectId') projectId?: string,
    @Query('position') position?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.contentService.listBanners({ projectId, position, status, page, pageSize });
  }

  @Post('banners')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create banner',
    description: 'Create a new banner with localized images and scheduling.',
  })
  @ApiResponse({ status: 201, description: 'Banner created.' })
  async createBanner(@Body() data: any) {
    return this.contentService.createBanner(data);
  }

  @Put('banners/:id')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Update banner',
    description: 'Update banner details.',
  })
  @ApiParam({ name: 'id', description: 'Banner ID' })
  @ApiResponse({ status: 200, description: 'Banner updated.' })
  async updateBanner(@Param('id') id: string, @Body() data: any) {
    return this.contentService.updateBanner(id, data);
  }

  @Delete('banners/:id')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Delete banner',
    description: 'Delete a banner.',
  })
  @ApiParam({ name: 'id', description: 'Banner ID' })
  @ApiResponse({ status: 200, description: 'Banner deleted.' })
  async deleteBanner(@Param('id') id: string) {
    return this.contentService.deleteBanner(id);
  }

  @Put('banners/reorder')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Reorder banners',
    description: 'Update the display order of banners.',
  })
  @ApiResponse({ status: 200, description: 'Banners reordered.' })
  async reorderBanners(@Body() orders: Array<{ id: string; sortOrder: number }>) {
    return this.contentService.reorderBanners(orders);
  }

  // ─── Service Directory ─────────────────────────────────────────────────────

  @Get('services')
  @Portal('customer', 'mall', 'group')
  @ApiOperation({
    summary: 'List service directory',
    description: 'List services/shops in the directory with search and category filters.',
  })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'floor', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Service directory listing.' })
  async listServices(
    @Query('projectId') projectId?: string,
    @Query('category') category?: string,
    @Query('floor') floor?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.contentService.listServices({ projectId, category, floor, search, page, pageSize });
  }

  @Post('services')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create service entry',
    description: 'Add a new entry to the service directory.',
  })
  @ApiResponse({ status: 201, description: 'Service entry created.' })
  async createService(@Body() data: any) {
    return this.contentService.createService(data);
  }

  @Put('services/:id')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Update service entry',
    description: 'Update a service directory entry.',
  })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiResponse({ status: 200, description: 'Service updated.' })
  async updateService(@Param('id') id: string, @Body() data: any) {
    return this.contentService.updateService(id, data);
  }

  @Delete('services/:id')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Delete service entry',
    description: 'Remove a service from the directory.',
  })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiResponse({ status: 200, description: 'Service deleted.' })
  async deleteService(@Param('id') id: string) {
    return this.contentService.deleteService(id);
  }

  // ─── Venues ────────────────────────────────────────────────────────────────

  @Get('venues')
  @Portal('customer', 'mall', 'group')
  @ApiOperation({
    summary: 'List venues',
    description: 'List venue information (parking, event spaces, facilities).',
  })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of venues.' })
  async listVenues(
    @Query('projectId') projectId?: string,
    @Query('type') type?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.contentService.listVenues({ projectId, type, page, pageSize });
  }

  @Get('venues/:id')
  @Portal('customer', 'mall', 'group')
  @ApiOperation({
    summary: 'Get venue by ID',
    description: 'Get detailed venue information.',
  })
  @ApiParam({ name: 'id', description: 'Venue ID' })
  @ApiResponse({ status: 200, description: 'Venue details.' })
  @ApiResponse({ status: 404, description: 'Venue not found.' })
  async getVenue(@Param('id') id: string) {
    return this.contentService.getVenueById(id);
  }

  @Post('venues')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create venue',
    description: 'Add a new venue with booking configuration.',
  })
  @ApiResponse({ status: 201, description: 'Venue created.' })
  async createVenue(@Body() data: any) {
    return this.contentService.createVenue(data);
  }

  @Put('venues/:id')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Update venue',
    description: 'Update venue details.',
  })
  @ApiParam({ name: 'id', description: 'Venue ID' })
  @ApiResponse({ status: 200, description: 'Venue updated.' })
  async updateVenue(@Param('id') id: string, @Body() data: any) {
    return this.contentService.updateVenue(id, data);
  }

  @Delete('venues/:id')
  @Roles('group_admin', 'mall_admin')
  @Portal('mall', 'group')
  @ApiOperation({
    summary: 'Delete venue',
    description: 'Remove a venue.',
  })
  @ApiParam({ name: 'id', description: 'Venue ID' })
  @ApiResponse({ status: 200, description: 'Venue deleted.' })
  async deleteVenue(@Param('id') id: string) {
    return this.contentService.deleteVenue(id);
  }
}
