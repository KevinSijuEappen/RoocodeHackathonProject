import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('pdf-parse');
    }
    return config;
  },
};

export default nextConfig;
