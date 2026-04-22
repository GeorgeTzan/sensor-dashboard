import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    allowedDevOrigins: ["sensor.orailab.gr", "localhost:3000"],
  },
};

export default nextConfig;
