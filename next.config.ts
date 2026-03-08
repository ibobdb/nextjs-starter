import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  compress: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
