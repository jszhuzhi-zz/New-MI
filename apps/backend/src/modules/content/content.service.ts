import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { Prisma, ContentStatus } from '@prisma/client';

/**
 * Content service.
 * Manages articles, banners, service directory, and venue information
 * for the membership system's content management needs.
 */
@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Extract a localized value from a JSON field.
   * Falls back through: requested locale -> zh-TW -> en -> zh-CN -> first available value.
   */
  private extractLocale(json: any, locale?: string): string | null {
    if (!json || typeof json !== 'object') return json ?? null;
    if (locale && json[locale] !== undefined) return json[locale];
    return json['zh-TW'] ?? json['en'] ?? json['zh-CN'] ?? Object.values(json)[0] ?? null;
  }

  /**
   * Build a multi-language JSON object from individual locale strings.
   */
  private buildI18nJson(zhHk?: string, zhCn?: string, en?: string): Record<string, string> | undefined {
    if (!zhHk && !zhCn && !en) return undefined;
    const result: Record<string, string> = {};
    if (zhHk) result['zh-TW'] = zhHk;
    if (zhCn) result['zh-CN'] = zhCn;
    if (en) result['en'] = en;
    return Object.keys(result).length > 0 ? result : undefined;
  }

  /**
   * Merge locale strings into an existing JSON object (for partial updates).
   */
  private mergeI18nJson(
    existing: any,
    zhHk?: string,
    zhCn?: string,
    en?: string,
  ): Record<string, string> | undefined {
    if (!zhHk && !zhCn && !en) return undefined;
    const current = (typeof existing === 'object' && existing !== null) ? { ...existing } : {};
    if (zhHk) current['zh-TW'] = zhHk;
    if (zhCn) current['zh-CN'] = zhCn;
    if (en) current['en'] = en;
    return current;
  }

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
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 20));

    const where: Prisma.ContentArticleWhereInput = {
      deletedAt: null,
    };

    if (params.projectId) {
      where.projectId = params.projectId;
    }
    if (params.category) {
      where.category = params.category;
    }
    if (params.status) {
      where.status = params.status.toUpperCase() as ContentStatus;
    }

    const [items, total] = await Promise.all([
      this.prisma.contentArticle.findMany({
        where,
        include: {
          project: { select: { id: true, name: true, code: true } },
        },
        orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.contentArticle.count({ where }),
    ]);

    // Optionally extract locale-specific fields for list view
    const locale = params.locale;
    const localizedItems = items.map((item) => ({
      ...item,
      _title: this.extractLocale(item.title, locale),
      _summary: this.extractLocale(item.summary, locale),
    }));

    return { items: localizedItems, total, page, pageSize };
  }

  /**
   * Get article by ID with localized content.
   */
  async getArticleById(id: string, locale: string) {
    const article = await this.prisma.contentArticle.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    });

    if (!article || article.deletedAt) {
      throw new NotFoundException('Article not found.');
    }

    // Increment view count asynchronously (fire-and-forget)
    this.prisma.contentArticle
      .update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      })
      .catch((err) => {
        this.logger.warn(`Failed to increment view count for article ${id}: ${err.message}`);
      });

    return {
      ...article,
      _title: this.extractLocale(article.title, locale),
      _summary: this.extractLocale(article.summary, locale),
      _content: this.extractLocale(article.content, locale),
      _slug: this.extractLocale(article.slug, locale),
    };
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
    summaryZhHk?: string;
    summaryZhCn?: string;
    summaryEn?: string;
    coverImageUrl?: string;
    images?: string[];
    tags?: string[];
    publishAt?: string;
    authorId: string;
    isFeatured?: boolean;
    sortOrder?: number;
    seoMetadata?: Record<string, any>;
  }) {
    const titleJson = this.buildI18nJson(data.titleZhHk, data.titleZhCn, data.titleEn);
    const contentJson = this.buildI18nJson(data.contentZhHk, data.contentZhCn, data.contentEn);
    const summaryJson = this.buildI18nJson(data.summaryZhHk, data.summaryZhCn, data.summaryEn);

    // Generate slug from title
    const slugBase = (data.titleEn || data.titleZhHk)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);
    const slugSuffix = Date.now().toString(36);
    const slugJson: Record<string, string> = {
      'zh-TW': `${slugBase}-${slugSuffix}`,
    };
    if (data.titleEn) slugJson['en'] = `${slugBase}-${slugSuffix}`;

    const article = await this.prisma.contentArticle.create({
      data: {
        projectId: data.projectId,
        title: titleJson as any,
        slug: slugJson as any,
        summary: summaryJson as any,
        content: contentJson as any,
        coverImage: data.coverImageUrl,
        images: data.images || [],
        category: data.category,
        tags: data.tags || [],
        author: data.authorId,
        status: ContentStatus.DRAFT,
        scheduledAt: data.publishAt ? new Date(data.publishAt) : null,
        isFeatured: data.isFeatured ?? false,
        sortOrder: data.sortOrder ?? 0,
        seoMetadata: data.seoMetadata as any,
        createdBy: data.authorId,
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    });

    this.logger.log(`Article created: ${article.id} - ${data.titleZhHk}`);
    return article;
  }

  /**
   * Update article.
   */
  async updateArticle(id: string, data: Record<string, any>) {
    const article = await this.prisma.contentArticle.findUnique({
      where: { id },
    });

    if (!article || article.deletedAt) {
      throw new NotFoundException('Article not found.');
    }

    const updateData: Prisma.ContentArticleUpdateInput = {};

    // Handle multi-language title
    if (data.titleZhHk || data.titleZhCn || data.titleEn) {
      updateData.title = this.mergeI18nJson(article.title, data.titleZhHk, data.titleZhCn, data.titleEn);
    }

    // Handle multi-language content
    if (data.contentZhHk || data.contentZhCn || data.contentEn) {
      updateData.content = this.mergeI18nJson(article.content, data.contentZhHk, data.contentZhCn, data.contentEn);
    }

    // Handle multi-language summary
    if (data.summaryZhHk || data.summaryZhCn || data.summaryEn) {
      updateData.summary = this.mergeI18nJson(article.summary, data.summaryZhHk, data.summaryZhCn, data.summaryEn);
    }

    // Simple fields
    if (data.category !== undefined) updateData.category = data.category;
    if (data.coverImageUrl !== undefined) updateData.coverImage = data.coverImageUrl;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.author !== undefined) updateData.author = data.author;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.scheduledAt !== undefined) {
      updateData.scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;
    }
    if (data.seoMetadata !== undefined) {
      updateData.seoMetadata = data.seoMetadata || Prisma.JsonNull;
    }

    const updated = await this.prisma.contentArticle.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    });

    this.logger.log(`Article updated: ${id}`);
    return updated;
  }

  /**
   * Publish/unpublish/archive article.
   */
  async updateArticleStatus(id: string, status: string) {
    const article = await this.prisma.contentArticle.findUnique({
      where: { id },
    });

    if (!article || article.deletedAt) {
      throw new NotFoundException('Article not found.');
    }

    const targetStatus = status.toUpperCase() as ContentStatus;
    if (!Object.values(ContentStatus).includes(targetStatus)) {
      throw new BadRequestException(`Invalid status: ${status}. Allowed values: ${Object.values(ContentStatus).join(', ')}`);
    }

    const updateData: Prisma.ContentArticleUpdateInput = {
      status: targetStatus,
    };

    // Set publishedAt when publishing for the first time
    if (targetStatus === ContentStatus.PUBLISHED && !article.publishedAt) {
      updateData.publishedAt = new Date();
    }

    // Clear publishedAt when reverting to draft
    if (targetStatus === ContentStatus.DRAFT) {
      updateData.publishedAt = null;
    }

    const updated = await this.prisma.contentArticle.update({
      where: { id },
      data: updateData,
    });

    this.logger.log(`Article ${id} status changed from ${article.status} to ${targetStatus}`);
    return updated;
  }

  /**
   * Delete article (soft-delete).
   */
  async deleteArticle(id: string) {
    const article = await this.prisma.contentArticle.findUnique({
      where: { id },
    });

    if (!article || article.deletedAt) {
      throw new NotFoundException('Article not found.');
    }

    await this.prisma.contentArticle.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: ContentStatus.ARCHIVED,
      },
    });

    this.logger.log(`Article soft-deleted: ${id}`);
    return { message: 'Article deleted successfully' };
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
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 20));

    const where: Prisma.BannerWhereInput = {
      deletedAt: null,
    };

    if (params.projectId) {
      where.projectId = params.projectId;
    }
    if (params.position) {
      where.position = params.position as any;
    }

    if (params.status === 'active') {
      // Active banners: published status with current date within start/end range
      const now = new Date();
      where.status = ContentStatus.PUBLISHED;
      where.OR = [
        { startDate: null, endDate: null },
        { startDate: { lte: now }, endDate: null },
        { startDate: null, endDate: { gte: now } },
        { startDate: { lte: now }, endDate: { gte: now } },
      ];
    } else if (params.status) {
      where.status = params.status.toUpperCase() as ContentStatus;
    }

    const [items, total] = await Promise.all([
      this.prisma.banner.findMany({
        where,
        include: {
          project: { select: { id: true, name: true, code: true } },
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.banner.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  /**
   * Create banner.
   */
  async createBanner(data: {
    projectId: string;
    position: string;
    titleZhHk?: string;
    titleZhCn?: string;
    titleEn?: string;
    subtitleZhHk?: string;
    subtitleZhCn?: string;
    subtitleEn?: string;
    imageUrlZhHk: string;
    imageUrlZhCn?: string;
    imageUrlEn?: string;
    linkUrl?: string;
    linkType?: string;
    linkTargetId?: string;
    sortOrder: number;
    startDate: string;
    endDate: string;
  }) {
    const titleJson = this.buildI18nJson(data.titleZhHk, data.titleZhCn, data.titleEn) || { 'zh-TW': '' };
    const subtitleJson = this.buildI18nJson(data.subtitleZhHk, data.subtitleZhCn, data.subtitleEn);

    const imageJson: Record<string, string> = {
      'zh-TW': data.imageUrlZhHk,
    };
    if (data.imageUrlZhCn) imageJson['zh-CN'] = data.imageUrlZhCn;
    if (data.imageUrlEn) imageJson['en'] = data.imageUrlEn;

    const banner = await this.prisma.banner.create({
      data: {
        projectId: data.projectId,
        title: titleJson as any,
        subtitle: subtitleJson as any,
        image: imageJson as any,
        linkUrl: data.linkUrl,
        linkType: data.linkType,
        linkTargetId: data.linkTargetId,
        position: data.position as any,
        status: ContentStatus.DRAFT,
        sortOrder: data.sortOrder,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    });

    this.logger.log(`Banner created: ${banner.id} for position ${data.position}`);
    return banner;
  }

  /**
   * Update banner.
   */
  async updateBanner(id: string, data: Record<string, any>) {
    const banner = await this.prisma.banner.findUnique({
      where: { id },
    });

    if (!banner || banner.deletedAt) {
      throw new NotFoundException('Banner not found.');
    }

    const updateData: Prisma.BannerUpdateInput = {};

    // Handle multi-language title
    if (data.titleZhHk || data.titleZhCn || data.titleEn) {
      updateData.title = this.mergeI18nJson(banner.title, data.titleZhHk, data.titleZhCn, data.titleEn);
    }

    // Handle multi-language subtitle
    if (data.subtitleZhHk || data.subtitleZhCn || data.subtitleEn) {
      updateData.subtitle = this.mergeI18nJson(banner.subtitle, data.subtitleZhHk, data.subtitleZhCn, data.subtitleEn);
    }

    // Handle multi-language image URLs
    if (data.imageUrlZhHk || data.imageUrlZhCn || data.imageUrlEn) {
      const currentImage = (typeof banner.image === 'object' && banner.image !== null) ? { ...(banner.image as any) } : {};
      if (data.imageUrlZhHk) currentImage['zh-TW'] = data.imageUrlZhHk;
      if (data.imageUrlZhCn) currentImage['zh-CN'] = data.imageUrlZhCn;
      if (data.imageUrlEn) currentImage['en'] = data.imageUrlEn;
      updateData.image = currentImage;
    }

    // Simple fields
    if (data.linkUrl !== undefined) updateData.linkUrl = data.linkUrl;
    if (data.linkType !== undefined) updateData.linkType = data.linkType;
    if (data.linkTargetId !== undefined) updateData.linkTargetId = data.linkTargetId;
    if (data.position !== undefined) updateData.position = data.position as any;
    if (data.status !== undefined) updateData.status = data.status.toUpperCase() as ContentStatus;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;

    const updated = await this.prisma.banner.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    });

    this.logger.log(`Banner updated: ${id}`);
    return updated;
  }

  /**
   * Delete banner (soft-delete).
   */
  async deleteBanner(id: string) {
    const banner = await this.prisma.banner.findUnique({
      where: { id },
    });

    if (!banner || banner.deletedAt) {
      throw new NotFoundException('Banner not found.');
    }

    await this.prisma.banner.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    this.logger.log(`Banner soft-deleted: ${id}`);
    return { message: 'Banner deleted successfully' };
  }

  /**
   * Reorder banners by batch-updating sortOrder.
   */
  async reorderBanners(bannerOrders: Array<{ id: string; sortOrder: number }>) {
    if (!bannerOrders || bannerOrders.length === 0) {
      throw new BadRequestException('Banner orders array cannot be empty.');
    }

    await this.prisma.$transaction(
      bannerOrders.map(({ id, sortOrder }) =>
        this.prisma.banner.update({
          where: { id },
          data: { sortOrder },
        }),
      ),
    );

    this.logger.log(`Banners reordered: ${bannerOrders.length} banners updated`);
    return { message: 'Banners reordered successfully', count: bannerOrders.length };
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
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 20));

    const where: Prisma.ServiceDirectoryWhereInput = {
      deletedAt: null,
    };

    if (params.projectId) {
      where.projectId = params.projectId;
    }
    if (params.category) {
      where.category = params.category;
    }
    if (params.floor) {
      where.floor = params.floor;
    }
    if (params.search) {
      where.OR = [
        {
          name: {
            path: ['zh-TW'],
            string_contains: params.search,
          },
        },
        {
          name: {
            path: ['en'],
            string_contains: params.search,
          },
        },
        {
          name: {
            path: ['zh-CN'],
            string_contains: params.search,
          },
        },
        {
          description: {
            path: ['zh-TW'],
            string_contains: params.search,
          },
        },
        {
          description: {
            path: ['en'],
            string_contains: params.search,
          },
        },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.serviceDirectory.findMany({
        where,
        include: {
          project: { select: { id: true, name: true, code: true } },
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.serviceDirectory.count({ where }),
    ]);

    return { items, total, page, pageSize };
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
    descriptionZhCn?: string;
    descriptionEn?: string;
    locationZhHk?: string;
    locationZhCn?: string;
    locationEn?: string;
    floor?: string;
    phone?: string;
    operatingHours?: Record<string, any>;
    icon?: string;
    tags?: string[];
    sortOrder?: number;
  }) {
    const nameJson = this.buildI18nJson(data.nameZhHk, data.nameZhCn, data.nameEn);
    const descriptionJson = this.buildI18nJson(data.descriptionZhHk, data.descriptionZhCn, data.descriptionEn);
    const locationJson = this.buildI18nJson(data.locationZhHk, data.locationZhCn, data.locationEn);

    const service = await this.prisma.serviceDirectory.create({
      data: {
        projectId: data.projectId,
        name: nameJson as any,
        description: descriptionJson as any,
        location: locationJson as any,
        category: data.category,
        floor: data.floor,
        phone: data.phone,
        operatingHours: data.operatingHours as any,
        icon: data.icon,
        status: ContentStatus.PUBLISHED,
        sortOrder: data.sortOrder ?? 0,
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    });

    this.logger.log(`Service created: ${service.id} - ${data.nameZhHk}`);
    return service;
  }

  /**
   * Update service entry.
   */
  async updateService(id: string, data: Record<string, any>) {
    const service = await this.prisma.serviceDirectory.findUnique({
      where: { id },
    });

    if (!service || service.deletedAt) {
      throw new NotFoundException('Service not found.');
    }

    const updateData: Prisma.ServiceDirectoryUpdateInput = {};

    // Handle multi-language name
    if (data.nameZhHk || data.nameZhCn || data.nameEn) {
      updateData.name = this.mergeI18nJson(service.name, data.nameZhHk, data.nameZhCn, data.nameEn);
    }

    // Handle multi-language description
    if (data.descriptionZhHk || data.descriptionZhCn || data.descriptionEn) {
      updateData.description = this.mergeI18nJson(
        service.description,
        data.descriptionZhHk,
        data.descriptionZhCn,
        data.descriptionEn,
      );
    }

    // Handle multi-language location
    if (data.locationZhHk || data.locationZhCn || data.locationEn) {
      updateData.location = this.mergeI18nJson(
        service.location,
        data.locationZhHk,
        data.locationZhCn,
        data.locationEn,
      );
    }

    // Simple fields
    if (data.category !== undefined) updateData.category = data.category;
    if (data.floor !== undefined) updateData.floor = data.floor;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.status !== undefined) updateData.status = data.status.toUpperCase() as ContentStatus;
    if (data.operatingHours !== undefined) {
      updateData.operatingHours = data.operatingHours || Prisma.JsonNull;
    }

    const updated = await this.prisma.serviceDirectory.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    });

    this.logger.log(`Service updated: ${id}`);
    return updated;
  }

  /**
   * Delete service entry (soft-delete).
   */
  async deleteService(id: string) {
    const service = await this.prisma.serviceDirectory.findUnique({
      where: { id },
    });

    if (!service || service.deletedAt) {
      throw new NotFoundException('Service not found.');
    }

    await this.prisma.serviceDirectory.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    this.logger.log(`Service soft-deleted: ${id}`);
    return { message: 'Service deleted successfully' };
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
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 20));

    const where: Prisma.VenueWhereInput = {
      deletedAt: null,
    };

    if (params.projectId) {
      where.projectId = params.projectId;
    }
    if (params.type) {
      // The Venue model does not have a 'type' field; filter by status instead
      // or treat 'type' as a free-form search on the status field.
      // Based on the schema, Venue has a status field (ContentStatus).
      // The controller exposes a 'type' query param which likely maps to status filtering.
      where.status = params.type.toUpperCase() as ContentStatus;
    }

    const [items, total] = await Promise.all([
      this.prisma.venue.findMany({
        where,
        include: {
          project: { select: { id: true, name: true, code: true } },
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.venue.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  /**
   * Get venue by ID.
   */
  async getVenueById(id: string) {
    const venue = await this.prisma.venue.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    });

    if (!venue || venue.deletedAt) {
      throw new NotFoundException('Venue not found.');
    }

    return venue;
  }

  /**
   * Create venue.
   */
  async createVenue(data: {
    projectId: string;
    code?: string;
    nameZhHk: string;
    nameZhCn?: string;
    nameEn?: string;
    descriptionZhHk?: string;
    descriptionZhCn?: string;
    descriptionEn?: string;
    addressZhHk?: string;
    addressZhCn?: string;
    addressEn?: string;
    openingHoursZhHk?: string;
    openingHoursZhCn?: string;
    openingHoursEn?: string;
    transportationZhHk?: string;
    transportationZhCn?: string;
    transportationEn?: string;
    phone?: string;
    email?: string;
    images?: string[];
    latitude?: number;
    longitude?: number;
    facilities?: Record<string, any>;
    sortOrder?: number;
  }) {
    const nameJson = this.buildI18nJson(data.nameZhHk, data.nameZhCn, data.nameEn);
    const descriptionJson = this.buildI18nJson(data.descriptionZhHk, data.descriptionZhCn, data.descriptionEn);
    const addressJson = this.buildI18nJson(data.addressZhHk, data.addressZhCn, data.addressEn);
    const openingHoursJson = this.buildI18nJson(data.openingHoursZhHk, data.openingHoursZhCn, data.openingHoursEn);
    const transportationJson = this.buildI18nJson(data.transportationZhHk, data.transportationZhCn, data.transportationEn);

    // Generate a unique code if not provided
    const code = data.code || `VNU-${Date.now().toString(36).toUpperCase()}`;

    // Verify project exists
    const project = await this.prisma.project.findUnique({
      where: { id: data.projectId },
    });
    if (!project) {
      throw new NotFoundException('Project not found.');
    }

    // Check for duplicate code within the same project
    const existing = await this.prisma.venue.findFirst({
      where: {
        projectId: data.projectId,
        code,
        deletedAt: null,
      },
    });
    if (existing) {
      throw new BadRequestException('Venue code already exists for this project.');
    }

    const venue = await this.prisma.venue.create({
      data: {
        projectId: data.projectId,
        code,
        name: nameJson as any,
        description: descriptionJson as any,
        address: addressJson as any,
        openingHours: openingHoursJson as any,
        transportation: transportationJson as any,
        phone: data.phone,
        email: data.email,
        images: data.images || [],
        latitude: data.latitude,
        longitude: data.longitude,
        facilities: data.facilities as any,
        status: ContentStatus.DRAFT,
        sortOrder: data.sortOrder ?? 0,
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    });

    this.logger.log(`Venue created: ${venue.id} - ${data.nameZhHk}`);
    return venue;
  }

  /**
   * Update venue.
   */
  async updateVenue(id: string, data: Record<string, any>) {
    const venue = await this.prisma.venue.findUnique({
      where: { id },
    });

    if (!venue || venue.deletedAt) {
      throw new NotFoundException('Venue not found.');
    }

    const updateData: Prisma.VenueUpdateInput = {};

    // Handle multi-language name
    if (data.nameZhHk || data.nameZhCn || data.nameEn) {
      updateData.name = this.mergeI18nJson(venue.name, data.nameZhHk, data.nameZhCn, data.nameEn);
    }

    // Handle multi-language description
    if (data.descriptionZhHk || data.descriptionZhCn || data.descriptionEn) {
      updateData.description = this.mergeI18nJson(
        venue.description,
        data.descriptionZhHk,
        data.descriptionZhCn,
        data.descriptionEn,
      );
    }

    // Handle multi-language address
    if (data.addressZhHk || data.addressZhCn || data.addressEn) {
      updateData.address = this.mergeI18nJson(
        venue.address,
        data.addressZhHk,
        data.addressZhCn,
        data.addressEn,
      );
    }

    // Handle multi-language opening hours
    if (data.openingHoursZhHk || data.openingHoursZhCn || data.openingHoursEn) {
      updateData.openingHours = this.mergeI18nJson(
        venue.openingHours,
        data.openingHoursZhHk,
        data.openingHoursZhCn,
        data.openingHoursEn,
      );
    }

    // Handle multi-language transportation
    if (data.transportationZhHk || data.transportationZhCn || data.transportationEn) {
      updateData.transportation = this.mergeI18nJson(
        venue.transportation,
        data.transportationZhHk,
        data.transportationZhCn,
        data.transportationEn,
      );
    }

    // Simple fields
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.status !== undefined) updateData.status = data.status.toUpperCase() as ContentStatus;
    if (data.facilities !== undefined) {
      updateData.facilities = data.facilities || Prisma.JsonNull;
    }

    const updated = await this.prisma.venue.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, name: true, code: true } },
      },
    });

    this.logger.log(`Venue updated: ${id}`);
    return updated;
  }

  /**
   * Delete venue (soft-delete).
   */
  async deleteVenue(id: string) {
    const venue = await this.prisma.venue.findUnique({
      where: { id },
    });

    if (!venue || venue.deletedAt) {
      throw new NotFoundException('Venue not found.');
    }

    await this.prisma.venue.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: ContentStatus.ARCHIVED,
      },
    });

    this.logger.log(`Venue soft-deleted: ${id}`);
    return { message: 'Venue deleted successfully' };
  }
}
