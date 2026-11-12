import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Admin-provided cover images may come from any https host.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
