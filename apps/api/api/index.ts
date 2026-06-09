import type { IncomingMessage, ServerResponse } from "node:http";
import { buildApp } from "../src/app.js";
import type { InjectOptions } from "fastify";

console.log("arbinexus-api function module loaded");

let appInstance: ReturnType<typeof buildApp> | null = null;
let readyPromise: Promise<unknown> | null = null;

async function getApp() {
  if (!appInstance) {
    appInstance = buildApp();
  }
  if (!readyPromise) {
    readyPromise = appInstance.ready() as unknown as Promise<unknown>;
  }
  await readyPromise;
  return appInstance;
}

async function readBody(req: IncomingMessage): Promise<Buffer | undefined> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return chunks.length > 0 ? Buffer.concat(chunks) : undefined;
}

interface InjectResponse {
  statusCode: number;
  headers: Record<string, string | string[] | number | undefined>;
  body: string;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  if (req.url === "/__ping") {
    res.statusCode = 200;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, handler: "bypass", url: req.url }));
    return;
  }

  console.log("arbinexus-api request received", { method: req.method, url: req.url });

  try {
    const app = await getApp();

    const method = (req.method || "GET").toUpperCase();
    const payload = ["POST", "PUT", "PATCH", "DELETE"].includes(method)
      ? await readBody(req)
      : undefined;

    const injectOptions: InjectOptions = {
      method: method as InjectOptions["method"],
      url: req.url || "/",
      headers: req.headers as Record<string, string | string[]>,
      payload,
    };

    const response = (await app.inject(
      injectOptions
    )) as unknown as InjectResponse;

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
