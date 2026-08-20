import { INestApplication, ValidationPipe } from '@nestjs/common';

/**
 * Configuration shared by both ways this NestJS application is served:
 *
 *  1. `main.ts`  — the standalone server on its own port (`npm run start:dev`).
 *  2. `pages/api/[...path].ts` — the same AppModule mounted inside the Next.js
 *     server, so a single deployment serves the UI and the API on one origin.
 *
 * Keeping it here means the two entry points can never drift apart.
 */
export function configureApp(app: INestApplication): void {
  // Every endpoint is namespaced under /api/...
  app.setGlobalPrefix('api');

  // Declarative request validation driven by the DTO decorators.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
}
