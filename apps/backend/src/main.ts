import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LocaleInterceptor } from './common/interceptors/locale.interceptor';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Global prefix
  app.setGlobalPrefix('api');

  // URI versioning (e.g. /api/v1/...)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // CORS - allow all membership portals
  app.enableCors({
    origin: [
      configService.get<string>('app.customerPortalUrl', 'http://localhost:3001'),
      configService.get<string>('app.mallPortalUrl', 'http://localhost:3002'),
      configService.get<string>('app.groupPortalUrl', 'http://localhost:3003'),
      configService.get<string>('app.merchantPortalUrl', 'http://localhost:3004'),
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept-Language',
      'X-Portal-Type',
      'X-Request-Id',
    ],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LocaleInterceptor(),
    new TransformInterceptor(),
    new AuditLogInterceptor(),
  );

  // Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Link REIT Membership System API')
    .setDescription(
      'Backend API for the Link REIT Membership & Stamp Management System. ' +
        'Supports customer app, mall management portal, group management portal, and merchant portal.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-Portal-Type',
        in: 'header',
        description: 'Portal type: customer | mall | group | merchant',
      },
      'Portal-type',
    )
    .addServer('http://localhost:3000', 'Local Development')
    .addTag('Auth', 'Authentication & authorization endpoints')
    .addTag('Organization', 'Organization structure management')
    .addTag('Members', 'Member management & registration')
    .addTag('Stamps', 'Stamp transactions & rules')
    .addTag('Risk Control', 'Risk monitoring & anomaly detection')
    .addTag('Merchants', 'Merchant management')
    .addTag('Campaigns', 'Campaign, coupon & lucky draw management')
    .addTag('Content', 'Content management (articles, banners, venues)')
    .addTag('Reports', 'Reports & analytics')
    .addTag('Notifications', 'Push notifications & SMS management')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = configService.get<number>('app.port', 3000);
  await app.listen(port);

  logger.log(`Application running on port ${port}`);
  logger.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
