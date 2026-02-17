const serverlessExpress = require('@vendia/serverless-express');

let cachedServer;

async function bootstrap() {
  if (cachedServer) {
    return cachedServer;
  }

  const { NestFactory } = require('@nestjs/core');
  const { ExpressAdapter } = require('@nestjs/platform-express');
  const { ValidationPipe, VersioningType } = require('@nestjs/common');
  const express = require('express');

  const { AppModule } = require('./dist/app.module');

  const expressApp = express();
  const nestApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  nestApp.setGlobalPrefix('api');
  nestApp.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  nestApp.enableCors({
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

  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await nestApp.init();
  cachedServer = serverlessExpress({ app: expressApp });

  return cachedServer;
}

// Export handler for Tencent SCF
exports.main = async (event, context) => {
  const server = await bootstrap();
  return server(event, context);
};
