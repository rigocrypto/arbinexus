import type { IncomingMessage, ServerResponse } from "node:http";
import { buildApp } from "../src/app";

let appPromise: ReturnType<typeof buildReadyApp> | null = null;

async function buildReadyApp() {
  const app = buildApp();
  await app.ready();
  return app;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  try {
    if (!appPromise) {
      appPromise = buildReadyApp();
    }

    const app = await appPromise;
    app.server.emit("request", req, res);
  } catch (error) {
    console.error("Vercel Fastify handler failed:", error);

    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("content-type", "application/json");
      res.end(
        JSON.stringify({
          error: "Internal Server Error",
          message: error instanceof Error ? error.message : "Unknown error",
        })
      );
    }
  }
}
