import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/interview/:path*',
        destination: 'https://interview-production-ac52.up.railway.app/interview-92a23/us-central1/:path*',
      },
    ];
  },
};

export default nextConfig;
