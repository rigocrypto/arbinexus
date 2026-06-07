import type { FastifyInstance } from "fastify";
import { isAllowedOrigin } from "../lib/allowed-origins.js";
import { getOpportunitiesPayload } from "../services/market-data.js";

const STREAM_INTERVAL_MS = 10_000;

export function registerOpportunitiesStreamRoute(app: FastifyInstance) {
  app.get("/stream/opportunities", async (request, reply) => {
    const origin = request.headers.origin;

    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");

    if (origin && isAllowedOrigin(origin)) {
      reply.raw.setHeader("Access-Control-Allow-Origin", origin);
      reply.raw.setHeader("Access-Control-Allow-Credentials", "true");
      reply.raw.setHeader("Vary", "Origin");
    }

    const send = async () => {
      const payload = await getOpportunitiesPayload();
      reply.raw.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    await send();

    const timer = setInterval(() => {
      void send();
    }, STREAM_INTERVAL_MS);

    request.raw.on("close", () => {
      clearInterval(timer);
      reply.raw.end();
    });
  });
}
