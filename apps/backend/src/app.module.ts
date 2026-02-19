import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bull';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { MemberModule } from './modules/member/member.module';
import { StampModule } from './modules/stamp/stamp.module';
import { RiskControlModule } from './modules/risk-control/risk-control.module';
import { MerchantModule } from './modules/merchant/merchant.module';
import { CampaignModule } from './modules/campaign/campaign.module';
import { ContentModule } from './modules/content/content.module';
import { ReportModule } from './modules/report/report.module';
import { NotificationModule } from './modules/notification/notification.module';
import { FavoriteModule } from './modules/favorite/favorite.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { ParkingModule } from './modules/parking/parking.module';
import { LuckyDrawModule } from './modules/lucky-draw/lucky-draw.module';
import { SmartMarketingModule } from './modules/smart-marketing/smart-marketing.module';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),

    // JWT global setup
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn', '1h'),
          issuer: 'link-reit-membership',
        },
      }),
    }),

    // Bull queue (Redis-backed)
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('redis.host', 'localhost'),
          port: configService.get<number>('redis.port', 6379),
          password: configService.get<string>('redis.password'),
          db: configService.get<number>('redis.db', 0),
        },
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: false,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      }),
    }),

    // Feature modules
    AuthModule,
    OrganizationModule,
    MemberModule,
    StampModule,
    RiskControlModule,
    MerchantModule,
    CampaignModule,
    ContentModule,
    ReportModule,
    NotificationModule,
    FavoriteModule,
    FeedbackModule,
    ParkingModule,
    LuckyDrawModule,
    SmartMarketingModule,
  ],
})
export class AppModule {}
