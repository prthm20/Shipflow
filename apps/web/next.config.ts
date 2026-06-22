import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@shipflow/trpc", "@shipflow/auth", "@shipflow/db"],
  turbopack: {
    root: "../../",
  },
};

export default nextConfig;