import { Module } from '@nestjs/common';
import { ParkingController } from './parking.controller';
import { ParkingService } from './parking.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [ParkingController],
  providers: [ParkingService, PrismaService],
  exports: [ParkingService],
})
export class ParkingModule {}
