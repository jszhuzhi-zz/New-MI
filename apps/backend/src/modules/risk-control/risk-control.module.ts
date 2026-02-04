import { Module } from '@nestjs/common';
import { RiskControlController } from './risk-control.controller';
import { RiskControlService } from './risk-control.service';

@Module({
  controllers: [RiskControlController],
  providers: [RiskControlService],
  exports: [RiskControlService],
})
export class RiskControlModule {}
