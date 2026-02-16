import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { NotificationStatus, NotificationChannel } from '@prisma/client';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getMemberNotifications(memberId: string, params?: {
    status?: NotificationStatus;
    page?: number;
    pageSize?: number;
  }) {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = { memberId };
    if (params?.status) {
      where.status = params.status;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.pushNotification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          project: { select: { id: true, name: true } },
        },
      }),
      this.prisma.pushNotification.count({ where }),
      this.prisma.pushNotification.count({
        where: { memberId, readAt: null, status: { in: [NotificationStatus.DELIVERED, NotificationStatus.SENT] } },
      }),
    ]);

    return {
      items: notifications.map(n => this.formatNotification(n)),
      total,
      unreadCount,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getNotification(notificationId: string, memberId: string) {
    const notification = await this.prisma.pushNotification.findFirst({
      where: { id: notificationId, memberId },
      include: { project: { select: { id: true, name: true } } },
    });

    if (!notification) throw new NotFoundException('Notification not found');
    return this.formatNotification(notification);
  }

  async markAsRead(notificationId: string, memberId: string) {
    const notification = await this.prisma.pushNotification.findFirst({
      where: { id: notificationId, memberId },
    });

    if (!notification) throw new NotFoundException('Notification not found');

    if (!notification.readAt) {
      await this.prisma.pushNotification.update({
        where: { id: notificationId },
        data: { readAt: new Date() },
      });
    }

    return { success: true };
  }

  async markAllAsRead(memberId: string) {
    await this.prisma.pushNotification.updateMany({
      where: { memberId, readAt: null },
      data: { readAt: new Date() },
    });
    return { success: true };
  }

  async getUnreadCount(memberId: string) {
    const count = await this.prisma.pushNotification.count({
      where: { memberId, readAt: null, status: { in: [NotificationStatus.DELIVERED, NotificationStatus.SENT] } },
    });
    return { unreadCount: count };
  }

  async deleteNotification(notificationId: string, memberId: string) {
    const notification = await this.prisma.pushNotification.findFirst({
      where: { id: notificationId, memberId },
    });

    if (!notification) throw new NotFoundException('Notification not found');

    await this.prisma.pushNotification.delete({ where: { id: notificationId } });
    return { success: true };
  }

  private formatNotification(notification: any) {
    const locale = 'zh-TW';
    return {
      id: notification.id,
      title: this.getLocalizedText(notification.title, locale),
      body: this.getLocalizedText(notification.body, locale),
      channel: notification.channel,
      status: notification.status,
      actionUrl: notification.actionUrl,
      data: notification.data,
      isRead: !!notification.readAt,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
      project: notification.project ? {
        id: notification.project.id,
        name: this.getLocalizedText(notification.project.name, locale),
      } : null,
    };
  }

  private getLocalizedText(jsonField: any, locale: string): string {
    if (!jsonField) return '';
    if (typeof jsonField === 'string') return jsonField;
    return jsonField[locale] || jsonField['zh-TW'] || jsonField['zh-CN'] || jsonField['en'] || '';
  }

  async sendNotification(data: {
    projectId?: string;
    memberId: string;
    channel: NotificationChannel;
    title: Record<string, string>;
    body: Record<string, string>;
    actionUrl?: string;
    data?: any;
  }) {
    const notification = await this.prisma.pushNotification.create({
      data: {
        projectId: data.projectId,
        memberId: data.memberId,
        channel: data.channel,
        title: data.title,
        body: data.body,
        actionUrl: data.actionUrl,
        data: data.data,
        status: NotificationStatus.SENT,
        sentAt: new Date(),
      },
    });
    this.logger.log('Notification sent: ' + notification.id);
    return notification;
  }

  async sendBulkNotifications(data: {
    projectId: string;
    memberIds: string[];
    channel: NotificationChannel;
    title: Record<string, string>;
    body: Record<string, string>;
    actionUrl?: string;
    data?: any;
  }) {
    const batchId = 'batch_' + Date.now();

    const notifications = await this.prisma.pushNotification.createMany({
      data: data.memberIds.map(memberId => ({
        projectId: data.projectId,
        memberId,
        channel: data.channel,
        title: data.title,
        body: data.body,
        actionUrl: data.actionUrl,
        data: data.data,
        status: NotificationStatus.SENT,
        sentAt: new Date(),
        batchId,
      })),
    });

    return { count: notifications.count, batchId };
  }
}
