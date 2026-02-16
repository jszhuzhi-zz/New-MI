import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ParkingPaymentStatus, ParkingPaymentMethod } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ParkingService {
  private readonly logger = new Logger(ParkingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get current parking session by license plate
   */
  async getCurrentSession(licensePlate: string, projectId: string) {
    const session = await this.prisma.parkingRecord.findFirst({
      where: {
        licensePlate: licensePlate.toUpperCase(),
        projectId,
        exitTime: null,
      },
      orderBy: { entryTime: 'desc' },
    });

    if (!session) {
      throw new NotFoundException('No active parking session found');
    }

    // Calculate current fee
    const currentTime = new Date();
    const duration = Math.ceil((currentTime.getTime() - session.entryTime.getTime()) / (1000 * 60));
    const fee = await this.calculateFee(projectId, duration, session.entryTime);

    return {
      ...session,
      currentDuration: duration,
      currentFee: fee.originalFee,
      discountedFee: fee.finalFee,
      discountAmount: fee.discountAmount,
    };
  }

  /**
   * Calculate parking fee based on rates
   */
  async calculateFee(projectId: string, durationMinutes: number, entryTime: Date, memberId?: string) {
    // Get applicable rate
    const dayOfWeek = entryTime.getDay();
    const timeStr = entryTime.toTimeString().substring(0, 5);

    const rate = await this.prisma.parkingRate.findFirst({
      where: {
        projectId,
        isActive: true,
        applicableDays: { has: dayOfWeek },
      },
      orderBy: { priority: 'desc' },
    });

    if (!rate) {
      // Default rate: $30/hour
      const hours = Math.ceil(durationMinutes / 60);
      const originalFee = hours * 30;
      return {
        originalFee,
        discountAmount: 0,
        finalFee: originalFee,
        freeHoursUsed: 0,
      };
    }

    // Calculate base fee
    const hours = Math.max(0, Math.ceil(durationMinutes / 60) - Number(rate.freeHours));
    let originalFee = hours * Number(rate.hourlyRate);

    // Apply max daily rate
    if (rate.maxDailyRate && originalFee > Number(rate.maxDailyRate)) {
      originalFee = Number(rate.maxDailyRate);
    }

    // Get member tier discount if applicable
    let discountAmount = 0;
    if (memberId) {
      const member = await this.prisma.member.findUnique({
        where: { id: memberId },
        include: { tier: true },
      });

      if (member?.tier && rate.tierDiscounts) {
        const tierDiscounts = rate.tierDiscounts as Record<string, number>;
        const tierCode = member.tier.code;
        if (tierDiscounts[tierCode]) {
          discountAmount = originalFee * tierDiscounts[tierCode];
        }
      }
    }

    return {
      originalFee,
      discountAmount,
      finalFee: originalFee - discountAmount,
      freeHoursUsed: Number(rate.freeHours),
    };
  }

  /**
   * Pay for parking
   */
  async payParking(recordId: string, memberId: string, paymentMethod: ParkingPaymentMethod, useStamps?: number) {
    const record = await this.prisma.parkingRecord.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      throw new NotFoundException('Parking record not found');
    }

    if (record.paymentStatus === ParkingPaymentStatus.PAID) {
      throw new BadRequestException('Parking already paid');
    }

    // Get parking rate for stamp conversion
    const rate = await this.prisma.parkingRate.findFirst({
      where: { projectId: record.projectId, isActive: true },
    });

    let stampsToDeduct = 0;
    let stampDiscount = 0;

    // Calculate stamp discount if using stamps
    if (useStamps && useStamps > 0) {
      const stampsToHkdRate = rate?.stampsToHkdRate ? Number(rate.stampsToHkdRate) : 10;
      stampDiscount = useStamps / stampsToHkdRate;
      stampsToDeduct = useStamps;

      // Verify member has enough stamps
      const stampAccount = await this.prisma.stampAccount.findFirst({
        where: { memberId, projectId: record.projectId },
      });

      if (!stampAccount || Number(stampAccount.balance) < useStamps) {
        throw new BadRequestException('Insufficient stamps');
      }
    }

    const finalFee = Math.max(0, Number(record.finalFee) - stampDiscount);

    // Update parking record
    const updatedRecord = await this.prisma.parkingRecord.update({
      where: { id: recordId },
      data: {
        memberId,
        paymentStatus: ParkingPaymentStatus.PAID,
        paymentMethod,
        stampsUsed: stampsToDeduct,
        discountAmount: Number(record.discountAmount) + stampDiscount,
        finalFee,
        paidAt: new Date(),
        exitTime: new Date(),
        duration: Math.ceil((new Date().getTime() - record.entryTime.getTime()) / (1000 * 60)),
      },
    });

    // Deduct stamps if used
    if (stampsToDeduct > 0) {
      const stampAccount = await this.prisma.stampAccount.findFirst({
        where: { memberId, projectId: record.projectId }
      });

      if (stampAccount) {
        const newBalance = Number(stampAccount.balance) - stampsToDeduct;

        await this.prisma.stampAccount.update({
          where: { id: stampAccount.id },
          data: {
            balance: newBalance,
            totalRedeemed: { increment: stampsToDeduct },
          },
        });

        // Create stamp transaction
        await this.prisma.stampTransaction.create({
          data: {
            memberId,
            stampAccountId: stampAccount.id,
            transactionType: 'REDEEM',
            amount: -stampsToDeduct,
            balanceAfter: newBalance,
            description: { 'zh-TW': '停車繳費', 'zh-CN': '停车缴费', 'en': 'Parking Payment' },
            referenceNo: recordId,
            channel: 'app',
            status: 'COMPLETED',
          },
        });
      }
    }

    // Earn stamps for payment (if applicable)
    if (rate?.stampsPerDollar && Number(rate.stampsPerDollar) > 0 && finalFee > 0) {
      const stampsEarned = Math.floor(finalFee * Number(rate.stampsPerDollar));
      if (stampsEarned > 0) {
        const stampAccount = await this.prisma.stampAccount.findFirst({
          where: { memberId, projectId: record.projectId }
        });

        if (stampAccount) {
          const newBalance = Number(stampAccount.balance) + stampsEarned;

          await this.prisma.stampAccount.update({
            where: { id: stampAccount.id },
            data: {
              balance: newBalance,
              totalEarned: { increment: stampsEarned },
            },
          });

          await this.prisma.stampTransaction.create({
            data: {
              memberId,
              stampAccountId: stampAccount.id,
              transactionType: 'EARN',
              amount: stampsEarned,
              balanceAfter: newBalance,
              description: { 'zh-TW': '停車消費獎勵', 'zh-CN': '停车消费奖励', 'en': 'Parking Reward' },
              referenceNo: recordId,
              channel: 'app',
              status: 'COMPLETED',
            },
          });
        }
      }
    }

    this.logger.log('Parking paid: ' + recordId);
    return updatedRecord;
  }

  /**
   * Get member's parking history
   */
  async getMemberParkingHistory(memberId: string, params?: { page?: number; pageSize?: number }) {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const [records, total] = await Promise.all([
      this.prisma.parkingRecord.findMany({
        where: { memberId },
        orderBy: { entryTime: 'desc' },
        skip,
        take: pageSize,
        include: {
          project: { select: { id: true, name: true } },
        },
      }),
      this.prisma.parkingRecord.count({ where: { memberId } }),
    ]);

    return {
      items: records,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Bind license plate to member
   */
  async bindLicensePlate(memberId: string, licensePlate: string) {
    const member = await this.prisma.member.findUnique({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Member not found');

    const metadata = (member.metadata as any) || {};
    const licensePlates = metadata.licensePlates || [];
    
    if (!licensePlates.includes(licensePlate.toUpperCase())) {
      licensePlates.push(licensePlate.toUpperCase());
    }

    await this.prisma.member.update({
      where: { id: memberId },
      data: { metadata: { ...metadata, licensePlates } },
    });

    return { success: true, licensePlates };
  }

  /**
   * Get member's bound license plates
   */
  async getMemberLicensePlates(memberId: string) {
    const member = await this.prisma.member.findUnique({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Member not found');

    const metadata = (member.metadata as any) || {};
    return { licensePlates: metadata.licensePlates || [] };
  }
}
