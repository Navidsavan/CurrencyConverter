import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend clients (React / Next.js).
  // CORS_ORIGIN is a comma-separated allowlist, e.g.
  //   CORS_ORIGIN=https://my-app.vercel.app,http://localhost:3000
  // Unset means reflect any origin, which is convenient locally but should be
  // pinned to the deployed frontend in production.
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins?.length ? allowedOrigins : true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global prefix for all API endpoints: /api/...
  app.setGlobalPrefix('api');

  // Request validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Hosting providers assign the port; bind on all interfaces so the platform
  // health check can reach the container.
  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`NestJS Currency Converter API is running on: http://localhost:${port}/api`);
}
bootstrap();
