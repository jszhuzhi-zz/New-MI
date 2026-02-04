import { AuditFields, CommonStatus, MultiLangText, GeoCoordinates } from './common';

/** Venue / Mall management (场馆管理系统) */
export interface Venue extends AuditFields {
  id: string;
  projectId: string;
  name: MultiLangText;
  description: MultiLangText;
  /** Basic info for the venue */
  basicInfo: VenueBasicInfo;
  status: CommonStatus;
}

export interface VenueBasicInfo {
  address: MultiLangText;
  phone: string;
  email: string;
  website: string;
  coordinates: GeoCoordinates;
  operatingHours: {
    weekday: { open: string; close: string };
    weekend: { open: string; close: string };
  };
  facilities: string[];
  floorCount: number;
  totalArea: number;
  parkingSpaces: number;
}

/** Floor plan (场馆介绍) */
export interface FloorPlan {
  id: string;
  venueId: string;
  floor: string;
  name: MultiLangText;
  image: string;
  /** Interactive map data */
  mapData?: Record<string, unknown>;
  merchants: {
    merchantId: string;
    position: { x: number; y: number };
    area: { width: number; height: number };
  }[];
}

/** News / Content article (内容管理) */
export interface ContentArticle extends AuditFields {
  id: string;
  projectId?: string;
  groupId?: string;
  title: MultiLangText;
  /** Rich text content supporting bilingual/trilingual */
  body: MultiLangText;
  /** Can be rich text or markdown */
  bodyFormat: 'html' | 'markdown';
  excerpt: MultiLangText;
  coverImage: string;
  images: string[];
  category: ContentCategory;
  tags: string[];
  /** SEO */
  seo?: {
    metaTitle: MultiLangText;
    metaDescription: MultiLangText;
    keywords: string[];
  };
  /** Publish status */
  publishStatus: 'draft' | 'scheduled' | 'published' | 'archived';
  publishedAt?: Date;
  scheduledPublishAt?: Date;
  /** View count */
  viewCount: number;
  /** Can redirect to Facebook */
  externalLinks?: { platform: string; url: string }[];
  /** Share and forward */
  shareEnabled: boolean;
  status: CommonStatus;
}

export type ContentCategory =
  | 'news'            // 新闻
  | 'announcement'    // 公告
  | 'guide'           // 指南
  | 'promotion'       // 推广
  | 'event'           // 活动
  | 'lifestyle';      // 生活方式

/** Service directory (服务指引) */
export interface ServiceDirectory extends AuditFields {
  id: string;
  projectId: string;
  name: MultiLangText;
  description: MultiLangText;
  category: string;
  /** Location info */
  location: {
    floor: string;
    zone: string;
  };
  /** Contact */
  phone?: string;
  /** Operating hours */
  operatingHours?: string;
  icon?: string;
  sortOrder: number;
  status: CommonStatus;
}

/** Push notification (消息推送) */
export interface PushNotification extends AuditFields {
  id: string;
  groupId?: string;
  projectId?: string;
  title: MultiLangText;
  body: MultiLangText;
  /** Notification type */
  type: NotificationType;
  /** Target audience */
  audience: {
    type: 'all' | 'tier' | 'tag' | 'segment' | 'custom';
    criteria?: Record<string, unknown>;
    memberIds?: string[];
  };
  /** Channels */
  channels: ('push' | 'sms' | 'email' | 'in-app')[];
  /** Schedule */
  scheduledAt?: Date;
  /** Sent status */
  sentAt?: Date;
  sentCount?: number;
  /** Template */
  templateId?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
}

export type NotificationType =
  | 'campaign'          // 活动通知
  | 'stamp-update'      // 印花变动
  | 'tier-change'       // 等级变动
  | 'coupon'            // 优惠券
  | 'system'            // 系统通知
  | 'reminder'          // 提醒
  | 'custom';           // 自定义

/** Notification template */
export interface NotificationTemplate extends AuditFields {
  id: string;
  name: string;
  type: NotificationType;
  /** Template with placeholders */
  titleTemplate: MultiLangText;
  bodyTemplate: MultiLangText;
  /** Available variables */
  variables: string[];
  status: CommonStatus;
}

/** Banner / Carousel item */
export interface Banner extends AuditFields {
  id: string;
  projectId: string;
  title: MultiLangText;
  image: string;
  /** Link target */
  linkType: 'campaign' | 'article' | 'merchant' | 'external' | 'none';
  linkTarget?: string;
  position: 'home-top' | 'home-middle' | 'category-top' | 'custom';
  sortOrder: number;
  validDateRange?: { startDate: Date; endDate: Date };
  status: CommonStatus;
}
