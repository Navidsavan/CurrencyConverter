import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

/**
 * Standalone entry point: runs the API as its own service on its own port.
 *
 * The same AppModule is also mounted inside the Next.js server (see
 * `pages/api/[...path].ts`), which is how a single Vercel deployment serves both
 * the UI and this API. This file is what you run for backend development —
 * `npm run start:dev` gives you hot reload — and for demoing the service on its own.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS matters only for this standalone mode, where the browser calls a
  // different origin than the one it loaded the page from. CORS_ORIGIN is a
  // comma-separated allowlist; unset reflects any origin, which is fine locally
  // but should be pinned to the deployed frontend in production.
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins?.length ? allowedOrigins : true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  configureApp(app);

  // Hosting providers assign the port; bind on all interfaces so the platform
  // health check can reach the container.
  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`NestJS Currency Converter API is running on: http://localhost:${port}/api`);
}
bootstrap();
