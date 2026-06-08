import type { IncomingMessage, ServerResponse } from "node:http";
import { buildApp } from "../src/app";

let appPromise: ReturnType<typeof buildReadyApp> | null = null;

async function buildReadyApp() {
  const app = buildApp();
  await app.ready();
  return app;
}

async function readBody(req: IncomingMessage): Promise<Buffer | undefined> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Buffer));
  }
  return chunks.length > 0 ? Buffer.concat(chunks) : undefined;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  // Diagnostic ping — responds before touching Fastify.
  // If this works but / or /health crash, the bug is inside buildApp()/app.ready().
  // If this also crashes, the module itself failed to load.
  if (req.url === "/__ping") {
    res.statusCode = 200;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, handler: "alive" }));
    return;
  }

  try {
    if (!appPromise) {
      appPromise = buildReadyApp();
    }
    const app = await appPromise;

    const method = req.method ?? "GET";
    const payload = ["POST", "PUT", "PATCH", "DELETE"].includes(method)
      ? await readBody(req)
      : undefined;

    const response = await app.inject({
      method: method as any,
      url: req.url ?? "/",
      headers: req.headers as Record<string, string | string[]>,
      payload,
    });

    res.statusCode = response.statusCode;
    for (const [key, val] of Object.entries(response.headers)) {
      if (val !== undefined) res.setHeader(key, val as string | string[]);
    }
    res.end(response.body);
  } catch (error) {
    console.error("[arbinexus-api] handler error:", error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("content-type", "application/json");
      res.end(
        JSON.stringify({
          error: "Internal Server Error",
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        })
      );
    }
  }
}
