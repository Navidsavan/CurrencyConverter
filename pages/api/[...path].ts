import 'reflect-metadata';
import type { NextApiRequest, NextApiResponse } from 'next';
import express, { Express } from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';

import { AppModule } from '../../backend-nestjs/dist/app.module';
import { configureApp } from '../../backend-nestjs/dist/app.setup';

/**
 * Mounts the NestJS application inside the Next.js server.
 *
 * This is what lets one deployment serve both halves: the UI and the API share
 * an origin, so there is no CORS and no second host to keep alive. Requests to
 * /api/* land here and are handed to the very same AppModule that
 * `backend-nestjs/src/main.ts` runs standalone — same controller, same service,
 * same DTO validation. Only the transport differs.
 *
 * Nest is compiled ahead of time by `npm run build:api`, because its decorators
 * and dependency-injection metadata need the backend's own TypeScript config.
 */

// Nest must parse the body itself — its pipes run on the raw request.
export const config = {
  api: {
    bodyParser: false,
  },
};

// The serverless function is reused between invocations, so bootstrap once and
// keep the initialised Express instance for every subsequent request.
let cachedApp: Express | null = null;
let bootstrapPromise: Promise<Express> | null = null;

async function bootstrapServer(): Promise<Express> {
  const expressApp = express();

  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    // The platform captures stdout already; Nest's banner adds noise per cold start.
    logger: ['error', 'warn'],
  });

  configureApp(app);
  await app.init();

  return expressApp;
}

function getServer(): Promise<Express> {
  if (cachedApp) return Promise.resolve(cachedApp);

  // Concurrent cold-start requests must share one bootstrap, not race to build
  // their own Nest instance.
  if (!bootstrapPromise) {
    bootstrapPromise = bootstrapServer().then((app) => {
      cachedApp = app;
      return app;
    });
  }

  return bootstrapPromise;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const server = await getServer();
  server(req as never, res as never);
}
