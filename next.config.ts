import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    TZ: "Asia/Ho_Chi_Minh",
  },
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;
