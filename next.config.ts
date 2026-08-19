import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: isProd
          ? "https://autonomous-code-agent.onrender.com/:path*" // Production (Vercel)
          : "http://127.0.0.1:8000/:path*",                     // Local dev (FastAPI)
      },
    ];
  },
};

export default nextConfig;