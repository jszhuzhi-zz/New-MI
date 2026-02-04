import { Module } from '@nestjs/common';
import { SmartMarketingController } from './smart-marketing.controller';
import { SmartMarketingService } from './smart-marketing.service';
import { AutoTagService } from './auto-tag.service';
import { TriggerEngineService } from './trigger-engine.service';

@Module({
  controllers: [SmartMarketingController],
  providers: [SmartMarketingService, AutoTagService, TriggerEngineService],
  exports: [SmartMarketingService, AutoTagService, TriggerEngineService],
})
export class SmartMarketingModule {}
