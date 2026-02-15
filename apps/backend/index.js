const serverlessExpress = require('@vendia/serverless-express');

let cachedServer;

async function bootstrap() {
  const { NestFactory } = require('@nestjs/core');
  const { ValidationPipe, VersioningType } = require('@nestjs/common');
  const { ExpressAdapter } = require('@nestjs/platform-express');
  const express = require('express');

  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);

  const { AppModule } = require('./dist/app.module');
  const app = await NestFactory.create(AppModule, adapter);

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.init();
  return serverlessExpress({ app: expressApp });
}

exports.main = async (event, context) => {
  if (!cachedServer) {
    cachedServer = await bootstrap();
  }
  return cachedServer(event, context);
};
