import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const apiPrefix = config.get<string>('API_PREFIX', 'api');
  const port = config.get<number>('PORT', 3001);
  const frontendOrigin = config.get<string>('FRONTEND_ORIGIN', 'http://localhost:3002');

  app.setGlobalPrefix(apiPrefix);

  app.enableCors({
    origin: frontendOrigin,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(port);
  console.log(`Poultry backend is running on http://localhost:${port}/${apiPrefix}`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start NestJS application', err);
  process.exit(1);
});

