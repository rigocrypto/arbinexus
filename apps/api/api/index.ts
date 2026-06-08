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

    // Buffer request body for POST/PUT/PATCH before passing to inject()
    let payload: Buffer | undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      const chunks: Buffer[] = [];
      await new Promise<void>((resolve, reject) => {
        req.on("data", (chunk: Buffer) =>
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
        );
        req.on("end", resolve);
        req.on("error", reject);
      });
      if (chunks.length > 0) payload = Buffer.concat(chunks);
    }

    // inject() awaits the full Fastify request/response cycle before returning,
    // which is required in serverless — server.emit() fires and forgets,
    // causing Vercel to see no response and return FUNCTION_INVOCATION_FAILED.
    const response = await app.inject({
      method: (req.method ?? "GET") as any,
      url: req.url ?? "/",
      headers: req.headers as Record<string, string | string[]>,
      payload,
    });

    res.statusCode = response.statusCode;
    for (const [key, val] of Object.entries(response.headers)) {
      if (val !== undefined) res.setHeader(key, val as string | string[]);
    }
    res.end(response.rawPayload);
  } catch (error) {
    console.error("[arbinexus-api] handler error:", error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("content-type", "application/json");
      res.end(
        JSON.stringify({
          error: "Internal Server Error",
          message: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }
}
