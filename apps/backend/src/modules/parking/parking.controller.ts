import { Controller, Get, Post, Put, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ParkingService } from './parking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ParkingPaymentMethod } from '@prisma/client';

@Controller('parking')
export class ParkingController {
  constructor(private readonly parkingService: ParkingService) {}

  @Get('session/:licensePlate')
  @UseGuards(JwtAuthGuard)
  async getCurrentSession(
    @Param('licensePlate') licensePlate: string,
    @Query('projectId') projectId: string,
  ) {
    const session = await this.parkingService.getCurrentSession(licensePlate, projectId);
    return { success: true, data: session };
  }

  @Post('calculate-fee')
  @UseGuards(JwtAuthGuard)
  async calculateFee(
    @Body() body: { projectId: string; durationMinutes: number; entryTime: string },
    @CurrentUser() user: any,
  ) {
    const fee = await this.parkingService.calculateFee(
      body.projectId,
      body.durationMinutes,
      new Date(body.entryTime),
      user.memberId,
    );
    return { success: true, data: fee };
  }

  @Post(':recordId/pay')
  @UseGuards(JwtAuthGuard)
  async payParking(
    @Param('recordId') recordId: string,
    @Body() body: { paymentMethod: ParkingPaymentMethod; useStamps?: number },
    @CurrentUser() user: any,
  ) {
    const result = await this.parkingService.payParking(
      recordId,
      user.memberId,
      body.paymentMethod,
      body.useStamps,
    );
    return { success: true, data: result };
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getParkingHistory(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const result = await this.parkingService.getMemberParkingHistory(user.memberId, {
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
    });
    return { success: true, data: result };
  }

  @Post('license-plates')
  @UseGuards(JwtAuthGuard)
  async bindLicensePlate(
    @Body() body: { licensePlate: string },
    @CurrentUser() user: any,
  ) {
    const result = await this.parkingService.bindLicensePlate(user.memberId, body.licensePlate);
    return { success: true, data: result };
  }

  @Get('license-plates')
  @UseGuards(JwtAuthGuard)
  async getLicensePlates(@CurrentUser() user: any) {
    const result = await this.parkingService.getMemberLicensePlates(user.memberId);
    return { success: true, data: result };
  }
}
