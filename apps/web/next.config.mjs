/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@arbinexus/ui", "@arbinexus/types"],
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.1.156:3000"
  ]
};

export default nextConfig;
