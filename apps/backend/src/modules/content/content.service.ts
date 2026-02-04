import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

/**
 * Content service.
 * Manages articles, banners, service directory, and venue information
 * for the membership system's content management needs.
 */
@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  // ─── Articles ──────────────────────────────────────────────────────────────

  /**
   * List articles with filters.
   */
  async listArticles(params: {
    projectId?: string;
    category?: string;
    status?: string;
    locale?: string;
    page?: number;
    pageSize?: number;
  }) {
    // TODO: Query articles with filters
    // const where: Prisma.ArticleWhereInput = {};
    // if (params.projectId) where.projectId = params.projectId;
    // if (params.category) where.category = params.category;
    // if (params.status) where.status = params.status;

    return { items: [], total: 0, page: params.page || 1, pageSize: params.pageSize || 20 };
  }

  /**
   * Get article by ID with localized content.
   */
  async getArticleById(id: string, locale: string) {
    // TODO: Fetch article with locale-specific content
    // const article = await this.prisma.article.findUnique({
    //   where: { id },
    //   include: { translations: true, author: true },
    // });
    // if (!article) throw new NotFoundException('Article not found.');

    return null;
  }

  /**
   * Create article.
   */
  async createArticle(data: {
    projectId: string;
    category: string;
    titleZhHk: string;
    titleZhCn?: string;
    titleEn?: string;
    contentZhHk: string;
    contentZhCn?: string;
    contentEn?: string;
    coverImageUrl?: string;
    tags?: string[];
    publishAt?: string;
    authorId: string;
  }) {
    // TODO: Create article with translations
    this.logger.log(`Article created: ${data.titleZhHk}`);
    return { id: 'article-id', ...data, status: 'draft' };
  }

  /**
   * Update article.
   */
  async updateArticle(id: string, data: Record<string, any>) {
    // TODO: Update article
    return { id, ...data };
  }

  /**
   * Publish/unpublish article.
   */
  async updateArticleStatus(id: string, status: string) {
    // TODO: Update article status
    return { id, status };
  }

  /**
   * Delete article.
   */
  async deleteArticle(id: string) {
    // TODO: Soft-delete article
    return { message: 'Article deleted' };
  }

  // ─── Banners ───────────────────────────────────────────────────────────────

  /**
   * List banners for a project.
   */
  async listBanners(params: {
    projectId?: string;
    position?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    // TODO: Fetch banners with filters
    return { items: [], total: 0, page: params.page || 1, pageSize: params.pageSize || 20 };
  }

  /**
   * Create banner.
   */
  async createBanner(data: {
    projectId: string;
    position: string; // 'home_carousel' | 'home_highlight' | 'category_top' | etc.
    titleZhHk?: string;
    titleEn?: string;
    imageUrlZhHk: string;
    imageUrlZhCn?: string;
    imageUrlEn?: string;
    linkUrl?: string;
    linkType?: string; // 'internal' | 'external' | 'campaign' | 'article'
    linkTargetId?: string;
    sortOrder: number;
    startDate: string;
    endDate: string;
  }) {
    // TODO: Create banner
    this.logger.log(`Banner created for position ${data.position}`);
    return { id: 'banner-id', ...data, status: 'active' };
  }

  /**
   * Update banner.
   */
  async updateBanner(id: string, data: Record<string, any>) {
    // TODO: Update banner
    return { id, ...data };
  }

  /**
   * Delete banner.
   */
  async deleteBanner(id: string) {
    // TODO: Delete banner
    return { message: 'Banner deleted' };
  }

  /**
   * Reorder banners.
   */
  async reorderBanners(bannerOrders: Array<{ id: string; sortOrder: number }>) {
    // TODO: Batch update sort orders
    // await Promise.all(
    //   bannerOrders.map(({ id, sortOrder }) =>
    //     this.prisma.banner.update({ where: { id }, data: { sortOrder } }),
    //   ),
    // );

    return { message: 'Banners reordered' };
  }

  // ─── Service Directory ─────────────────────────────────────────────────────

  /**
   * List service directory entries.
   */
  async listServices(params: {
    projectId?: string;
    category?: string;
    floor?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    // TODO: Fetch service directory entries
    return { items: [], total: 0, page: params.page || 1, pageSize: params.pageSize || 20 };
  }

  /**
   * Create service directory entry.
   */
  async createService(data: {
    projectId: string;
    category: string;
    nameZhHk: string;
    nameZhCn?: string;
    nameEn?: string;
    descriptionZhHk?: string;
    descriptionEn?: string;
    floor?: string;
    unit?: string;
    phone?: string;
    openingHours?: string;
    logoUrl?: string;
    tags?: string[];
  }) {
    // TODO: Create service entry
    this.logger.log(`Service created: ${data.nameZhHk}`);
    return { id: 'service-id', ...data, status: 'active' };
  }

  /**
   * Update service entry.
   */
  async updateService(id: string, data: Record<string, any>) {
    // TODO: Update service
    return { id, ...data };
  }

  /**
   * Delete service entry.
   */
  async deleteService(id: string) {
    // TODO: Soft-delete service
    return { message: 'Service deleted' };
  }

  // ─── Venues ────────────────────────────────────────────────────────────────

  /**
   * List venue information.
   */
  async listVenues(params: {
    projectId?: string;
    type?: string;
    page?: number;
    pageSize?: number;
  }) {
    // TODO: Fetch venues
    return { items: [], total: 0, page: params.page || 1, pageSize: params.pageSize || 20 };
  }

  /**
   * Get venue by ID.
   */
  async getVenueById(id: string) {
    // TODO: Fetch venue details
    return null;
  }

  /**
   * Create venue.
   */
  async createVenue(data: {
    projectId: string;
    type: string; // 'parking' | 'event_space' | 'meeting_room' | 'facility'
    nameZhHk: string;
    nameZhCn?: string;
    nameEn?: string;
    descriptionZhHk?: string;
    descriptionEn?: string;
    floor?: string;
    capacity?: number;
    amenities?: string[];
    imageUrls?: string[];
    openingHours?: string;
    bookingEnabled?: boolean;
    bookingRules?: Record<string, any>;
  }) {
    // TODO: Create venue
    this.logger.log(`Venue created: ${data.nameZhHk}`);
    return { id: 'venue-id', ...data, status: 'active' };
  }

  /**
   * Update venue.
   */
  async updateVenue(id: string, data: Record<string, any>) {
    // TODO: Update venue
    return { id, ...data };
  }

  /**
   * Delete venue.
   */
  async deleteVenue(id: string) {
    // TODO: Soft-delete venue
    return { message: 'Venue deleted' };
  }
}
