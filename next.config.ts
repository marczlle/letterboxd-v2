import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
      {
        protocol: "https",
        hostname: "cdn.example.com",
      },
      {
        protocol: "https",
        hostname: "bucket.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org"
      }
    ],
  },
};

export default nextConfig;
