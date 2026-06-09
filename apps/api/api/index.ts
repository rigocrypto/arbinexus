import type { IncomingMessage, ServerResponse } from "node:http";

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  res.statusCode = 200;
  res.setHeader("content-type", "application/json");
  res.end(
    JSON.stringify({
      ok: true,
      handler: "alive",
      url: req.url,
      method: req.method,
      service: "arbinexus-api",
    })
  );
}
