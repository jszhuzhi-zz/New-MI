import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LocaleInterceptor } from './common/interceptors/locale.interceptor';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import * as express from 'express';

const expressApp: any = express();
let nestApp: any;

async function bootstrap() {
  if (nestApp) {
    return nestApp;
  }

  const logger = new Logger('Serverless');
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

  const configService = app.get(ConfigService);

  // Global prefix
  app.setGlobalPrefix('api');

  // URI versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // CORS
  app.enableCors({
    origin: true,
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

  await app.init();
  nestApp = app;
  logger.log('NestJS serverless app initialized');

  return nestApp;
}

// Export for serverless
export { bootstrap, expressApp };

// SCF entry point
exports.main = async (event: any, context: any) => {
  await bootstrap();
  return new Promise((resolve, reject) => {
    // Convert SCF event to HTTP request
    const req = {
      method: event.httpMethod || 'GET',
      url: event.path || '/',
      headers: event.headers || {},
      body: event.body,
      query: event.queryStringParameters || {},
    };

    const res = {
      statusCode: 200,
      headers: {} as Record<string, string>,
      body: '',
      setHeader(key: string, value: string) {
        this.headers[key] = value;
      },
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(data: any) {
        this.headers['Content-Type'] = 'application/json';
        this.body = JSON.stringify(data);
        resolve({
          isBase64Encoded: false,
          statusCode: this.statusCode,
          headers: this.headers,
          body: this.body,
        });
      },
      send(data: string) {
        this.body = data;
        resolve({
          isBase64Encoded: false,
          statusCode: this.statusCode,
          headers: this.headers,
          body: this.body,
        });
      },
      end() {
        resolve({
          isBase64Encoded: false,
          statusCode: this.statusCode,
          headers: this.headers,
          body: this.body,
        });
      },
    };

    expressApp(req as any, res as any);
  });
};
