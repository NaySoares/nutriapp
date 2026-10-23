import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: process.env.NODE_ENV !== "development"
};

if (process.env.NODE_ENV === "development") {
  nextConfig.rewrites = async () => [
    { source: "/api/:path*", destination: "http://localhost:3001/:path*" }
  ];
}

export default nextConfig;
