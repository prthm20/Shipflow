import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@shipflow/trpc", "@shipflow/auth", "@shipflow/db"],
};

export default nextConfig;