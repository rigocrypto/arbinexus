import type { IncomingMessage, ServerResponse } from "node:http";
import Fastify from "fastify";

const app = Fastify({ logger: false });

app.get("/", async () => ({
  ok: true,
  service: "arbinexus-api",
  status: "running",
}));

app.get("/health", async () => ({ ok: true }));

let readyPromise: Promise<void> | null = null;

async function ensureReady() {
  if (!readyPromise) {
    readyPromise = app.ready();
  }
  await readyPromise;
}

async function readBody(req: IncomingMessage): Promise<Buffer | undefined> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return chunks.length > 0 ? Buffer.concat(chunks) : undefined;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  try {
    await ensureReady();

    const method = req.method || "GET";
    const payload = ["POST", "PUT", "PATCH", "DELETE"].includes(method)
      ? await readBody(req)
      : undefined;

    const response = await app.inject({
      method,
      url: req.url || "/",
      headers: req.headers,
      payload,
    });

    res.statusCode = response.statusCode;
    for (const [key, value] of Object.entries(response.headers)) {
      if (value !== undefined) {
        res.setHeader(key, value as string | number | readonly string[]);
      }
    }
    res.end(response.body);
  } catch (error) {
    console.error("[arbinexus-api] handler error:", error);
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
