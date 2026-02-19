import { Module } from '@nestjs/common';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [CampaignController],
  providers: [PrismaService, CampaignService],
  exports: [CampaignService],
})
export class CampaignModule {}
