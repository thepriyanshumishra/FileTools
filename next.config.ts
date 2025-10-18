import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ['@heroicons/react', 'framer-motion'],
  },
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.worker\.ts$/,
      use: { loader: 'worker-loader' },
    });
    return config;
  },
};

export default nextConfig;
