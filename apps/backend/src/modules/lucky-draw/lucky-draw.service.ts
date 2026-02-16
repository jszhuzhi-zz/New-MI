import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { LuckyDrawStatus, LuckyDrawEntryStatus } from '@prisma/client';

@Injectable()
export class LuckyDrawService {
  private readonly logger = new Logger(LuckyDrawService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get active lucky draws for a project
   */
  async getActiveLuckyDraws(projectId: string) {
    const now = new Date();
    return this.prisma.luckyDraw.findMany({
      where: {
        projectId,
        status: LuckyDrawStatus.ACTIVE,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        prizes: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get lucky draw by ID
   */
  async getLuckyDraw(id: string) {
    const luckyDraw = await this.prisma.luckyDraw.findUnique({
      where: { id },
      include: {
        prizes: { orderBy: { sortOrder: 'asc' } },
        project: { select: { id: true, name: true } },
      },
    });

    if (!luckyDraw) throw new NotFoundException('Lucky draw not found');
    return luckyDraw;
  }

  /**
   * Get member's entries for a lucky draw
   */
  async getMemberEntries(luckyDrawId: string, memberId: string) {
    return this.prisma.luckyDrawEntry.findMany({
      where: { luckyDrawId, memberId },
      include: { prize: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Execute a draw (instant win)
   */
  async executeDraw(luckyDrawId: string, memberId: string) {
    const luckyDraw = await this.prisma.luckyDraw.findUnique({
      where: { id: luckyDrawId },
      include: { prizes: true },
    });

    if (!luckyDraw) throw new NotFoundException('Lucky draw not found');

    const now = new Date();
    if (luckyDraw.status !== LuckyDrawStatus.ACTIVE) {
      throw new BadRequestException('Lucky draw is not active');
    }
    if (now < luckyDraw.startDate || now > luckyDraw.endDate) {
      throw new BadRequestException('Lucky draw is not within valid period');
    }

    // Check entry limits
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalEntries, todayEntries] = await Promise.all([
      this.prisma.luckyDrawEntry.count({
        where: { luckyDrawId, memberId },
      }),
      this.prisma.luckyDrawEntry.count({
        where: { luckyDrawId, memberId, createdAt: { gte: todayStart } },
      }),
    ]);

    if (luckyDraw.maxEntriesPerMember && totalEntries >= luckyDraw.maxEntriesPerMember) {
      throw new BadRequestException('Maximum entries reached');
    }
    if (luckyDraw.maxEntriesPerDay && todayEntries >= luckyDraw.maxEntriesPerDay) {
      throw new BadRequestException('Daily entry limit reached');
    }

    // Check stamps and deduct if needed
    const stampCost = luckyDraw.stampCostPerEntry;
    const freeEntriesUsed = await this.prisma.luckyDrawEntry.count({
      where: { luckyDrawId, memberId, stampsSpent: 0 },
    });
    const needsStamps = freeEntriesUsed >= luckyDraw.freeEntries && stampCost > 0;

    if (needsStamps) {
      const stampAccount = await this.prisma.stampAccount.findFirst({
        where: { memberId, projectId: luckyDraw.projectId },
      });

      if (!stampAccount || Number(stampAccount.balance) < stampCost) {
        throw new BadRequestException('Insufficient stamps');
      }

      // Deduct stamps
      await this.prisma.stampAccount.update({
        where: { id: stampAccount.id },
        data: {
          balance: { decrement: stampCost },
          totalRedeemed: { increment: stampCost },
        },
      });
    }

    // Determine prize (weighted random based on probability)
    let wonPrize = null;
    const availablePrizes = luckyDraw.prizes.filter(p => p.remainingQuantity > 0);

    if (availablePrizes.length > 0) {
      const random = Math.random();
      let cumulativeProbability = 0;

      for (const prize of availablePrizes) {
        cumulativeProbability += Number(prize.probability || 0);
        if (random <= cumulativeProbability) {
          wonPrize = prize;
          break;
        }
      }
    }

    // Create entry
    const entry = await this.prisma.luckyDrawEntry.create({
      data: {
        luckyDrawId,
        memberId,
        prizeId: wonPrize?.id || null,
        entryNumber: this.generateEntryNumber(),
        status: wonPrize ? LuckyDrawEntryStatus.WON : LuckyDrawEntryStatus.LOST,
        stampsSpent: needsStamps ? stampCost : 0,
        wonAt: wonPrize ? new Date() : null,
      },
      include: { prize: true },
    });

    // Decrement prize quantity if won
    if (wonPrize) {
      await this.prisma.luckyDrawPrize.update({
        where: { id: wonPrize.id },
        data: { remainingQuantity: { decrement: 1 } },
      });

      // Award stamps if prize is stamps
      if (wonPrize.prizeType === 'stamps' && wonPrize.stampReward) {
        const stampAccount = await this.prisma.stampAccount.findFirst({
          where: { memberId, projectId: luckyDraw.projectId },
        });

        if (stampAccount) {
          await this.prisma.stampAccount.update({
            where: { id: stampAccount.id },
            data: {
              balance: { increment: wonPrize.stampReward },
              totalEarned: { increment: wonPrize.stampReward },
            },
          });
        }
      }
    }

    this.logger.log('Draw executed: ' + entry.id + (wonPrize ? ' WON' : ' LOST'));

    return {
      entry,
      isWinner: !!wonPrize,
      prize: wonPrize,
      stampsSpent: needsStamps ? stampCost : 0,
    };
  }

  /**
   * Claim a prize
   */
  async claimPrize(entryId: string, memberId: string, claimInfo?: { name?: string; phone?: string; address?: string }) {
    const entry = await this.prisma.luckyDrawEntry.findFirst({
      where: { id: entryId, memberId, status: LuckyDrawEntryStatus.WON },
      include: { prize: true },
    });

    if (!entry) throw new NotFoundException('Entry not found or not a winner');
    if (entry.status === LuckyDrawEntryStatus.CLAIMED) {
      throw new BadRequestException('Prize already claimed');
    }

    const updated = await this.prisma.luckyDrawEntry.update({
      where: { id: entryId },
      data: {
        status: LuckyDrawEntryStatus.CLAIMED,
        claimedAt: new Date(),
        claimDetails: claimInfo || undefined,
      },
      include: { prize: true },
    });

    return updated;
  }

  /**
   * Get winning history for member
   */
  async getMemberWinnings(memberId: string, params?: { page?: number; pageSize?: number }) {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      this.prisma.luckyDrawEntry.findMany({
        where: { memberId, status: { in: [LuckyDrawEntryStatus.WON, LuckyDrawEntryStatus.CLAIMED] } },
        include: {
          prize: true,
          luckyDraw: { select: { id: true, name: true } },
        },
        orderBy: { wonAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.luckyDrawEntry.count({
        where: { memberId, status: { in: [LuckyDrawEntryStatus.WON, LuckyDrawEntryStatus.CLAIMED] } },
      }),
    ]);

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  private generateEntryNumber(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = 'LD';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
