import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@shipflow/trpc", "@shipflow/auth", "@shipflow/db"],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;