import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  experimental: {
    serverActions: {
      // Reports accept up to five 5 MB images; leave safe multipart overhead.
      bodySizeLimit: "26mb",
    },
  },
};

export default nextConfig;
