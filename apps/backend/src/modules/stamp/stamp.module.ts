import { Module } from '@nestjs/common';
import { StampController } from './stamp.controller';
import { StampService } from './stamp.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [StampController],
  providers: [StampService, PrismaService],
  exports: [StampService],
})
export class StampModule {}
