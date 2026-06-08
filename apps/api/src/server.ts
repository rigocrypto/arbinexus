import { buildApp } from "./app.js";

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? "0.0.0.0";

async function bootstrap() {
  const app = await buildApp();
  await app.listen({ port, host });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
