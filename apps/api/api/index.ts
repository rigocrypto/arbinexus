/**
 * Vercel serverless entry point for the ArbiNexus Fastify API.
 *
 * This file is compiled and bundled by @vercel/node independently of the
 * main tsc build. It imports from dist/app.js which is produced by the
 * buildCommand ("pnpm --filter @arbinexus/api build") that runs before
 * Vercel processes serverless functions.
 *
 * Pattern: lazy-init the Fastify app once, then forward every request to
 * the underlying Node.js http.Server via app.server.emit("request", ...).
 * This avoids calling app.listen() which does not work in a serverless env.
 */

import type { IncomingMessage, ServerResponse } from "node:http";

// Loaded lazily so cold-starts fail fast with a clear error rather than
// crashing the entire build if dist/ is somehow missing.
let appInstance: any = null;

async function getApp() {
  if (!appInstance) {
    const { buildApp } = await import("../dist/app.js");
    appInstance = await buildApp();
    await appInstance.ready();
  }
  return appInstance;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  const app = await getApp();
  app.server.emit("request", req, res);
}
