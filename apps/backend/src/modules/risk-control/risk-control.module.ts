import { Module } from '@nestjs/common';
import { RiskControlController } from './risk-control.controller';
import { RiskControlService } from './risk-control.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [RiskControlController],
  providers: [RiskControlService, PrismaService],
  exports: [RiskControlService],
})
export class RiskControlModule {}
