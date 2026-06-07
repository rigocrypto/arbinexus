import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@arbinexus/ui", "@arbinexus/types"],
  // Include hoisted workspace deps in Vercel serverless traces (pnpm monorepo).
  outputFileTracingRoot: path.join(__dirname, "../.."),
  serverExternalPackages: [
    "@solana/web3.js",
    "@solana/wallet-adapter-base",
    "@solana/wallet-adapter-react",
    "@solana/wallet-adapter-react-ui"
  ],
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.1.156:3000"
  ]
};

export default nextConfig;
