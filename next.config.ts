import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// Set RENDER_BACKEND_URL in Vercel environment variables to point to your Render backend service
const backendUrl = process.env.RENDER_BACKEND_URL || "https://ai-agenet-mu.vercel.app";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: isProd
          ? `${backendUrl}/:path*`
          : "http://127.0.0.1:8000/:path*",
      },
    ];
  },
};

export default nextConfig;