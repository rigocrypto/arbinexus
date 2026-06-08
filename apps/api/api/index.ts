import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildApp } from "../src/app";

let appPromise: ReturnType<typeof buildReadyApp> | null = null;

async function buildReadyApp() {
  const app = buildApp();
  await app.ready();
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!appPromise) {
      appPromise = buildReadyApp();
    }
    const app = await appPromise;

    // Use Fastify's inject() instead of server.emit() — inject() works correctly
    // after app.ready() alone, without needing a bound socket from app.listen().
    const response = await app.inject({
      method: (req.method ?? "GET") as any,
      url: req.url ?? "/",
      headers: req.headers as Record<string, string | string[]>,
      payload: req.body
        ? typeof req.body === "string"
          ? req.body
          : JSON.stringify(req.body)
        : undefined,
    });

    res.status(response.statusCode);
    for (const [key, val] of Object.entries(response.headers)) {
      if (val !== undefined) res.setHeader(key, val as string | string[]);
    }
    res.end(response.rawPayload);
  } catch (error) {
    console.error("Vercel Fastify handler failed:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
