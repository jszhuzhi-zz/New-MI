import { Controller, Get, Post, Put, Delete, Param, Query, UseGuards, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMyNotifications(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
  ) {
    const result = await this.notificationService.getMemberNotifications(user.memberId, {
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
      status: status as any,
    });

    return { success: true, data: result };
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  async getUnreadCount(@CurrentUser() user: any) {
    const result = await this.notificationService.getUnreadCount(user.memberId);
    return { success: true, data: result };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getNotification(@Param('id') id: string, @CurrentUser() user: any) {
    const notification = await this.notificationService.getNotification(id, user.memberId);
    return { success: true, data: notification };
  }

  @Put(':id/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@Param('id') id: string, @CurrentUser() user: any) {
    const result = await this.notificationService.markAsRead(id, user.memberId);
    return { success: true, data: result };
  }

  @Put('read-all')
  @UseGuards(JwtAuthGuard)
  async markAllAsRead(@CurrentUser() user: any) {
    const result = await this.notificationService.markAllAsRead(user.memberId);
    return { success: true, data: result };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteNotification(@Param('id') id: string, @CurrentUser() user: any) {
    const result = await this.notificationService.deleteNotification(id, user.memberId);
    return { success: true, data: result };
  }
}
