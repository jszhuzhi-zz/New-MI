import { Module } from '@nestjs/common';
import { LuckyDrawController } from './lucky-draw.controller';
import { LuckyDrawService } from './lucky-draw.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [LuckyDrawController],
  providers: [LuckyDrawService, PrismaService],
  exports: [LuckyDrawService],
})
export class LuckyDrawModule {}
